import { agent } from '../agent.js';
import { springService } from '../services/springService.js';
import type { Lead, EmailResult } from '../types/index.js';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import axios from 'axios';
import open from 'open';

dotenv.config({ override: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function chunk<T>(arr: T[], size = 4): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function generateInitialEmail({ userPrompt }: { userPrompt: string }) {
  console.log('📧 이메일 생성 시작:', userPrompt);

  // 1. OpenAI로 파라미터 추출
  const extractPrompt = `
다음 요청에서 프로젝트명과 기업명들을 JSON으로 추출하세요:
"${userPrompt}"

정확히 이 형식으로만 답하세요:
{"projectName": "프로젝트명", "leadNames": ["기업1", "기업2"]}
  `;

  let extractText;
  try {
    const extractResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: extractPrompt }],
      temperature: 0.1,
    });
    extractText = extractResponse.choices[0]?.message?.content || '';
    console.log('🔥 extractText:', extractText);
  } catch (error) {
    console.error('OpenAI 호출 오류:', error);
    return [{ status: 'error', error: 'AI 서비스 호출 실패' }];
  }

  // 2. JSON 파싱
  const cleaned = extractText.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{.*\}/s);
  if (!match) {
    return [{ status: 'error', error: '파라미터 추출 실패 - JSON 형식을 찾을 수 없음' }];
  }

  let parsed: { projectName: string; leadNames: string[] };
  try {
    parsed = JSON.parse(match[0]);
    if (!parsed.projectName || !Array.isArray(parsed.leadNames) || parsed.leadNames.length === 0) {
      return [{ status: 'error', error: 'projectName 또는 leadNames가 올바르지 않음' }];
    }
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    return [{ status: 'error', error: 'JSON 파싱 실패' }];
  }

  // 3. 프로젝트 조회
  const project = await springService.getProjectByName(parsed.projectName.trim());
  if (!project) {
    return [{ status: 'error', error: `프로젝트 '${parsed.projectName}' 를 찾을 수 없음` }];
  }

  // 4. 기업 정보 조회
  const leadResults = await Promise.all(parsed.leadNames.map(name => springService.getLeadByName(name.trim())));
  const validLeads = leadResults.filter((l): l is Lead => Boolean(l));
  if (validLeads.length === 0) {
    return [{ status: 'error', error: '유효한 기업을 찾을 수 없음' }];
  }

  console.log(`✅ 발견된 기업: ${validLeads.map(l => l.name).join(', ')}`);

  const results: Array<any> = [];
  const emailPayloads: Array<any> = [];
  const identity = await springService.getIdentity();
  // 5. 마이크로 배치로 메일 생성
  const leadGroups = chunk(validLeads, 4); // 3~5로 조절 가능
  for (const group of leadGroups) {
    const mailPrompt = `
당신은 전문 B2B 세일즈 이메일 작성자입니다.
당사의 이름은 ${identity.companyName}이고 이 메일을 보내는 사람의 이름은 ${identity.senderName}, 연락처 정보는 ${identity.senderEmail} 입니다.
사용자 요청: "${userPrompt}"
프로젝트 설명: ${project.description}

대상 고객 리스트:
${group.map((lead, idx) => `
${idx+1}.
- 회사명: ${lead.name}
- 산업분야: ${lead.industry}
- 담당자: ${lead.contactName || '담당자님'}
- 회사규모: ${lead.size || '미정'}
- 언어: ${lead.language || '한국어'}
`).join('\n')}

각 회사에 맞는 맞춤형 B2B 제안 이메일을 작성하세요.
반드시 JSON 배열 형식으로만 답하세요:
[
  {"companyName":"...", "subject":"...", "body":"..."},
  ...
]
    `;

    try {
      const mailResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: mailPrompt }],
        temperature: 0.7,
      });

      const mailText = mailResponse.choices[0]?.message?.content || '';
      const mailMatch = mailText.match(/\[.*\]/s);
      if (!mailMatch) {
        group.forEach(lead => results.push({
          companyName: lead.name,
          status: 'error',
          error: 'JSON 형식 오류'
        }));
        continue;
      }

      let parsedBatch: any[];
      try {
        parsedBatch = JSON.parse(mailMatch[0]);
      } catch {
        group.forEach(lead => results.push({
          companyName: lead.name,
          status: 'error',
          error: 'JSON 파싱 실패'
        }));
        continue;
      }

      for (const item of parsedBatch) {
        const lead = group.find(l => l.name === item.companyName);
        if (!lead || !item.subject || !item.body) {
          results.push({
            companyName: item.companyName || 'Unknown',
            status: 'error',
            error: '제목 또는 본문 누락'
          });
          continue;
        }

        results.push({
          companyName: lead.name,
          status: 'success',
          subject: item.subject,
          body: item.body,
          contactEmail: lead.contactEmail,
          projectId: project.id,
          leadId: lead.id,
          preview: item.body.substring(0, 150) + '...'
        });

        emailPayloads.push({
          projectId: project.id,
          leadId: lead.id,
          subject: item.subject,
          body: item.body,
          contactEmail: lead.contactEmail,
        });
      }

    } catch (error) {
      console.error('배치 메일 생성 오류:', error);
      group.forEach(lead => results.push({
        companyName: lead.name,
        status: 'error',
        error: 'AI 호출 실패'
      }));
    }
  }

  

  console.log('🎉 전체 이메일 생성 완료');
  return results; // 항상 배열 반환
}








// 2. 후속 메일 생성
export async function generateFollowupEmail({ userPrompt }: { userPrompt: string }) {
  console.log('📧 Follow-up Email 생성 시작:', userPrompt);
  
  // 직접 파싱 시도 (후속메일요청 projectId=3 leadId=5 형식)
  const directMatch = userPrompt.match(/후속메일요청 projectId=(\d+) leadId=(\d+) originalEmailId=([^ ]+) followupReason="([^"]*?)"/);
  
  let projectId: number, leadId: number, originalEmailId: string, followupReason: string;
  
  if (directMatch) {
    try {
      projectId = parseInt(directMatch[1]);
      leadId = parseInt(directMatch[2]);
      originalEmailId = directMatch[3];
      followupReason = directMatch[4];
      console.log('✅ 직접 파싱 성공');
    } catch (parseError) {
      console.error('직접 파싱 실패:', parseError);
      return { status: 'error', error: '직접 파싱 실패' };
    }
  } else {
    console.log('🔄 AI 파싱으로 fallback');
    // AI를 통한 파라미터 추출
    const paramPrompt = `
아래 프롬프트에서 projectId, leadId, originalEmailId, followupReason을 추출해.
예시: {"projectId":1, "leadId":2, "originalEmailId":"uuid123", "followupReason":"일반적인 후속 메일"}
`.trim();

    const paramResult = await agent.conversate([
      { type: 'text', text: paramPrompt },
      { type: 'text', text: userPrompt }
    ],{
      tool_choice: 'none',
      response_format: { type: 'json_object' },
      newSession: true
    } as any);
    const lastParam = Array.isArray(paramResult) ? paramResult[paramResult.length - 1] : paramResult;
    const paramText =
      typeof lastParam === 'string'
        ? lastParam
        : (lastParam as any).content ?? (lastParam as any).text ?? '';
    const paramMatch = paramText.match(/\{.*\}/s);
    if (!paramMatch) return { status: 'error', error: '파라미터 추출 실패' };
    
    try {
      const parsed = JSON.parse(paramMatch[0]);
      projectId = parsed.projectId;
      leadId = parsed.leadId;
      originalEmailId = parsed.originalEmailId;
      followupReason = parsed.followupReason;
      
      if (!projectId || !leadId || !originalEmailId) {
        return { status: 'error', error: '필수 파라미터 누락' };
      }
    } catch (parseError) {
      console.error('파라미터 JSON 파싱 오류:', parseError);
      return { status: 'error', error: '파라미터 파싱 실패' };
    }
  }

  const project = await springService.getProjectById(projectId);
  if (!project) {
    return { status: 'error', error: `프로젝트 ID ${projectId}를 찾을 수 없습니다.` };
  }
  
  const lead = await springService.getLeadById(leadId);
  if (!lead) {
    return { status: 'error', error: `리드 ID ${leadId}를 찾을 수 없습니다.` };
  }

  const systemPrompt = `
🚨 CRITICAL: YOU MUST RESPOND WITH ONLY JSON FORMAT. NO OTHER TEXT OR EXPLANATIONS.

원본 이메일을 참고하여 후속 B2B 세일즈 이메일을 JSON 형식으로만 생성하세요.

REQUIRED FORMAT:
{"subject":"후속 제목", "body":"후속 본문"}

EXAMPLE:
{"subject":"AI 로봇 스마트팜 협력 제안 - 추가 정보", "body":"안녕하세요, 담당자님.\n\n이전에 보내드린 제안서에 대해 추가적인 정보를 제공드리고자 합니다..."}

RULES:
1. ONLY JSON format allowed
2. NO explanations, NO descriptions, NO other text
3. MUST include both "subject" and "body"
4. If you cannot create JSON, respond with: {"subject":"ERROR", "body":"ERROR"}
5. 후속 메일이므로 원본 이메일의 맥락을 이어가되, 새로운 정보나 제안을 포함

START YOUR RESPONSE WITH { AND END WITH }
`.trim();

  let mailResult;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`🔄 AI Follow-up Email 생성 시도 ${retryCount + 1}/${maxRetries + 1}`);
      console.log(`📝 전송할 프롬프트:`, systemPrompt);
      console.log(`📝 전송할 데이터:`, `사업 설명: ${project.description}\n고객 정보: ${JSON.stringify(lead)}\n후속 사유: ${followupReason}`);
      
      mailResult = await agent.conversate([
        { type: 'text', text: systemPrompt },
        { type: 'text', text: `사업 설명: ${project.description}\n고객 정보: ${JSON.stringify(lead)}\n후속 사유: ${followupReason}` }
      ],{ tool_choice: 'none', response_format: { type: 'json_object' }, newSession: true } as any);
      break; // 성공하면 루프 탈출
    } catch (error: any) {
      retryCount++;
      
      if (error.code === 'rate_limit_exceeded' && retryCount <= maxRetries) {
        const retryAfter = error.headers?.['retry-after-ms'] || 15000;
        const waitTime = Math.max(parseInt(retryAfter), 15000);
        
        console.log(`⏳ Rate limit 도달 (${retryCount}/${maxRetries}), ${waitTime/1000}초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error(`❌ 최대 재시도 횟수 초과 또는 다른 오류:`, error);
        throw error;
      }
    }
  }
  
  const lastMail = Array.isArray(mailResult) ? mailResult[mailResult.length - 1] : mailResult;
  const mailText =
    typeof lastMail === 'string'
      ? lastMail
      : (lastMail as any).content ?? (lastMail as any).text ?? '';
  
  console.log('🔄 AI Follow-up Email 응답:', mailText);
  console.log('🔄 AI 응답 길이:', mailText.length);
  
  const match = mailText.match(/\{.*\}/s);
  console.log('🔄 JSON 매치 결과:', match ? '성공' : '실패');
  
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      console.log('✅ Follow-up Email 생성 완료');
      return { subject: parsed.subject, body: parsed.body, status: 'success' };
    } catch (error) {
      console.error('Follow-up Email JSON 파싱 실패:', error);
      return { status: 'error', error: 'Follow-up Email JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: 'Follow-up Email 생성 실패' };
}



// 3. 이메일 재작성 (피드백 기반)
export async function regenerateEmailWithFeedback({ userPrompt }: { userPrompt: string }) {
  console.log('🔄 regenerateEmailWithFeedback 시작:', userPrompt);

  // 직접 파싱 시도 (재작성요청 projectId=3 leadId=5 형식)
  const directMatch = userPrompt.match(/재작성요청 projectId=(\d+) leadId=(\d+) originalEmail=(\{.*?\}) userFeedback="([^"]*?)"/);

  let projectId: number, leadId: number, originalEmail: any, userFeedback: string;

  if (directMatch) {
    try {
      projectId = parseInt(directMatch[1]);
      leadId = parseInt(directMatch[2]);

      // JSON 문자열 정리: 개행문자와 따옴표 이스케이프 처리
      let jsonStr = directMatch[3];
      // 개행문자를 이스케이프된 형태로 변환
      jsonStr = jsonStr.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      // 따옴표 이스케이프 확인
      jsonStr = jsonStr.replace(/"/g, '\\"').replace(/\\"/g, '"');

      originalEmail = JSON.parse(jsonStr);
      userFeedback = directMatch[4];
      console.log('✅ 직접 파싱 성공');
    } catch (parseError) {
      console.error('직접 파싱 실패:', parseError);
      return { status: 'error', error: '직접 파싱 실패' };
    }
  } else {
    console.log('🔄 AI 파싱으로 fallback');
    // AI를 통한 파라미터 추출 (기존 방식)
    const paramPrompt = `
아래 프롬프트에서 projectId, leadId, originalEmail(제목/본문), userFeedback을 추출해.
예시: {"projectId":1, "leadId":2, "originalEmail":{"subject":"...","body":"..."},"userFeedback":"별로라고 함"}
`.trim();

    const paramResult = await agent.conversate([
      { type: 'text', text: paramPrompt },
      { type: 'text', text: userPrompt }
    ],{ tool_choice: 'none', response_format: { type: 'json_object' }, newSession: true } as any);


    const lastParam = Array.isArray(paramResult) ? paramResult[paramResult.length - 1] : paramResult;
    const paramText =
      typeof lastParam === 'string'
        ? lastParam
        : (lastParam as any).content ?? (lastParam as any).text ?? '';
    const paramMatch = paramText.match(/\{.*\}/s);
    if (!paramMatch) return { status: 'error', error: '파라미터 추출 실패' };

    try {
      const parsed = JSON.parse(paramMatch[0]);
      projectId = parsed.projectId;
      leadId = parsed.leadId;
      originalEmail = parsed.originalEmail;
      userFeedback = parsed.userFeedback;

      if (!projectId || !leadId || !originalEmail || !userFeedback) {
        return { status: 'error', error: '필수 파라미터 누락' };
      }
    } catch (parseError) {
      console.error('파라미터 JSON 파싱 오류:', parseError);
      return { status: 'error', error: '파라미터 파싱 실패' };
    }
  }

  const project = await springService.getProjectById(projectId);
  if (!project) {
    return { status: 'error', error: `프로젝트 ID ${projectId}를 찾을 수 없습니다.` };
  }

  const lead = await springService.getLeadById(leadId);
  if (!lead) {
    return { status: 'error', error: `리드 ID ${leadId}를 찾을 수 없습니다.` };
  }

  const systemPrompt = `
🚨 CRITICAL: YOU MUST RESPOND WITH ONLY JSON FORMAT. NO OTHER TEXT OR EXPLANATIONS.

사용자 피드백에 따라 원본 이메일을 개선하여 JSON 형식으로만 응답하세요.

REQUIRED FORMAT:
{"subject":"개선된 제목", "body":"개선된 본문"}

EXAMPLE:
{"subject":"AI 로봇 스마트팜 협력 제안 및 구체적 정보", "body":"안녕하세요, 담당자님.\n\n저는 autosales의 심규성입니다. 저희는 AI 로봇을 활용한 스마트팜 솔루션을 개발하고 있으며..."}

RULES:
1. ONLY JSON format allowed
2. NO explanations, NO descriptions, NO other text
3. MUST include both "subject" and "body"
4. If you cannot create JSON, respond with: {"subject":"ERROR", "body":"ERROR"}

START YOUR RESPONSE WITH { AND END WITH }
`.trim();

  let mailResult;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount <= maxRetries) {
    try {
      console.log(`🔄 AI 이메일 재작성 시도 ${retryCount + 1}/${maxRetries + 1}`);
      console.log(`📝 전송할 프롬프트:`, systemPrompt);
      console.log(`📝 전송할 데이터:`, `사업 설명: ${project.description}\n고객 정보: ${JSON.stringify(lead)}\n원본 이메일: ${JSON.stringify(originalEmail)}\n피드백: ${userFeedback}`);

      mailResult = await agent.conversate([
        { type: 'text', text: systemPrompt },
        { type: 'text', text: `사업 설명: ${project.description}\n고객 정보: ${JSON.stringify(lead)}\n원본 이메일: ${JSON.stringify(originalEmail)}\n피드백: ${userFeedback}` }
      ],{ tool_choice: 'none', response_format: { type: 'json_object' }, newSession: true } as any);


      break; // 성공하면 루프 탈출
    } catch (error: any) {
      retryCount++;

      if (error.code === 'rate_limit_exceeded' && retryCount <= maxRetries) {
        // Rate Limit 헤더에서 대기 시간 추출 (기본값: 15초)
        const retryAfter = error.headers?.['retry-after-ms'] || 15000;
        const waitTime = Math.max(parseInt(retryAfter), 15000); // 최소 15초

        console.log(`⏳ Rate limit 도달 (${retryCount}/${maxRetries}), ${waitTime/1000}초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error(`❌ 최대 재시도 횟수 초과 또는 다른 오류:`, error);
        throw error;
      }
    }
  }
  const lastMail = Array.isArray(mailResult) ? mailResult[mailResult.length - 1] : mailResult;
  const mailText =
    typeof lastMail === 'string'
      ? lastMail
      : (lastMail as any).content ?? (lastMail as any).text ?? '';

  console.log('🔄 AI 이메일 재작성 응답:', mailText);
  console.log('🔄 AI 응답 길이:', mailText.length);

  const match = mailText.match(/\{.*\}/s);
  console.log('🔄 JSON 매치 결과:', match ? '성공' : '실패');

  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      // DB에 저장
      return { subject: parsed.subject, body: parsed.body, status: 'success' };
    } catch (error) {
      console.error('재작성 이메일 저장 실패:', error);
      return { status: 'error', error: '재작성 JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: '이메일 재작성 실패' };
}

// 4. 이메일 품질 분석
export async function analyzeEmailIssues({ userPrompt }: { userPrompt: string }) {
  const paramPrompt = `
아래 프롬프트에서 emailContent(제목/본문), userFeedback을 추출해.
예시: {"emailContent":{"subject":"...","body":"..."},"userFeedback":"내용이 너무 두루뭉술"}
`.trim();

  const paramResult = await agent.conversate([
    { type: 'text', text: paramPrompt },
    { type: 'text', text: userPrompt }
  ],{ tool_choice: 'none', response_format: { type: 'json_object' }, newSession: true } as any);
  const lastParam = Array.isArray(paramResult) ? paramResult[paramResult.length - 1] : paramResult;
  const paramText =
    typeof lastParam === 'string'
      ? lastParam
      : (lastParam as any).content ?? (lastParam as any).text ?? '';
  const paramMatch = paramText.match(/\{.*\}/s);
  if (!paramMatch) return { status: 'error', error: '파라미터 추출 실패' };
  const { emailContent, userFeedback } = JSON.parse(paramMatch[0]);

  const systemPrompt = `
사용자 피드백 기반 이메일 문제점/개선방안/priority를 아래 JSON만으로 응답.
예시: {"issues":["제목이 두루뭉술함"],"suggestions":["제목 구체화"],"priority":"high"}
priority: high|medium|low
`.trim();

  const mailResult = await agent.conversate([
    { type: 'text', text: systemPrompt },
    { type: 'text', text: `이메일 내용:\n제목: ${emailContent.subject}\n본문: ${emailContent.body}\n사용자 피드백: ${userFeedback}` }
  ],{ tool_choice: 'none', response_format: { type: 'json_object' }, newSession: true } as any);
  const lastMail = Array.isArray(mailResult) ? mailResult[mailResult.length - 1] : mailResult;
  const mailText =
    typeof lastMail === 'string'
      ? lastMail
      : (lastMail as any).content ?? (lastMail as any).text ?? '';
  const match = mailText.match(/\{.*\}/s);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return { status: 'error', error: '분석 JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: '이메일 분석 실패' };
}

// 5. 통합된 이메일 재작성 처리 (거부/취소 모두 처리)
export async function handleEmailRejection({ userPrompt }: { userPrompt: string }) {
  console.log('🔄 통합 이메일 재작성 처리 시작:', userPrompt);

  // 발송 취소 요청인지 확인 (재작성요청 키워드)
  const isCancelRequest = userPrompt.includes('재작성요청');

  if (isCancelRequest) {
    console.log('✅ 발송 취소 요청 감지 - 즉시 재작성 진행');
    // 발송 취소는 즉시 재작성
    return await regenerateEmailWithFeedback({ userPrompt });
  } else {
    console.log('✅ 이메일 거부/거절 요청 감지 - 분석 후 재작성 여부 결정');
    // 이메일 거부/거절은 분석 후 재작성 여부 결정
    const analysis = await analyzeEmailIssues({ userPrompt });

    // 심각하면 재작성, 아니면 개선안 안내
    if (analysis.priority === 'high' || (analysis.issues && analysis.issues.length > 2)) {
      console.log('🔴 심각한 문제 감지 - 재작성 진행');
      return await regenerateEmailWithFeedback({ userPrompt });
    } else {
      console.log('🟡 경미한 문제 감지 - 개선안 안내');
      return {
        action: 'improve',
        analysis,
        message: '분석 결과를 참고하여 이메일을 개선하세요.'
      };
    }
  }
}

// 6. 다중 기업용 메일 일괄 생성
export async function generateEmailsForMultipleLeads({ userPrompt }: { userPrompt: string }) {
  const paramPrompt = `
아래 프롬프트에서 projectId, leadIds(배열) 추출. 예시: {"projectId":1,"leadIds":[2,3,4]}
`.trim();

  const paramResult = await agent.conversate([
    { type: 'text', text: paramPrompt },
    { type: 'text', text: userPrompt }
  ]);
  const lastParam = Array.isArray(paramResult) ? paramResult[paramResult.length - 1] : paramResult;
  const paramText =
    typeof lastParam === 'string'
      ? lastParam
      : (lastParam as any).content ?? (lastParam as any).text ?? '';
  const paramMatch = paramText.match(/\{.*\}/s);
  if (!paramMatch) return { status: 'error', error: '파라미터 추출 실패' };
  const { projectId, leadIds } = JSON.parse(paramMatch[0]);
  const project = await springService.getProjectById(projectId);

  const results = [];
  for (const leadId of leadIds) {
    const lead = await springService.getLeadById(leadId);

    const systemPrompt = `
아래 사업설명, 고객정보 기반 맞춤 이메일을 JSON으로만 생성.
예시: {"subject":"제목","body":"본문"}
`.trim();

    const mailResult = await agent.conversate([
      { type: 'text', text: systemPrompt },
      { type: 'text', text: `사업 설명: ${project.description}\n고객 정보: ${JSON.stringify(lead)}` }
    ]);
    const lastMail = Array.isArray(mailResult) ? mailResult[mailResult.length - 1] : mailResult;
    const mailText =
      typeof lastMail === 'string'
        ? lastMail
        : (lastMail as any).content ?? (lastMail as any).text ?? '';
    const match = mailText.match(/\{.*\}/s);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        await springService.saveEmail(projectId, leadId, parsed.subject, parsed.body);
        results.push({ leadId, subject: parsed.subject, body: parsed.body, status: 'success' });
      } catch {
        results.push({ leadId, status: 'error', error: 'JSON 파싱 실패' });
      }
    } else {
      results.push({ leadId, status: 'error', error: '이메일 생성 실패' });
    }
  }

  return { type: 'multiple_initial_emails', projectId, results };
}
