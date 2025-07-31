import { agent } from '../agent.js';
import { springService } from '../services/springService.js';

// 1. 초안 메일 생성
export async function generateInitialEmail({ userPrompt }: { userPrompt: string }) {
  const idPrompt = `
아래 프롬프트에서 projectId(사업 id), leadId(기업 id)를 추출해.
반드시 JSON만 반환. 예시: {"projectId":1, "leadId":2}
`.trim();

  // ID 추출
  const idResult = await agent.conversate([
    { type: 'text', text: idPrompt },
    { type: 'text', text: userPrompt }
  ]);
  const lastId = Array.isArray(idResult) ? idResult[idResult.length - 1] : idResult;
  const idText =
    typeof lastId === 'string'
      ? lastId
      : (lastId as any).content ?? (lastId as any).text ?? '';
  const idMatch = idText.match(/\{.*\}/s);
  if (!idMatch) return { status: 'error', error: 'projectId/leadId 추출 실패' };
  const { projectId, leadId } = JSON.parse(idMatch[0]);

  const project = await springService.getProjectById(projectId);
  const lead = await springService.getLeadById(leadId);

  const systemPrompt = `
아래 사업설명과 고객정보를 참고해 맞춤 B2B 세일즈 이메일을 JSON으로만 생성.
예시: {"subject":"제목", "body":"본문"}
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
      return { subject: parsed.subject, body: parsed.body, status: 'success' };
    } catch {
      return { status: 'error', error: '이메일 JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: '이메일 생성 실패' };
}

// 2. 후속 메일 생성
export async function generateFollowupEmail({ userPrompt }: { userPrompt: string }) {
  const idPrompt = `
아래 프롬프트에서 projectId, leadId, feedbackSummary(고객 피드백 요약)를 추출해.
예시: {"projectId":1, "leadId":2, "feedbackSummary":"가격이 비싸다고 응답"}
`.trim();

  const idResult = await agent.conversate([
    { type: 'text', text: idPrompt },
    { type: 'text', text: userPrompt }
  ]);
  const lastId = Array.isArray(idResult) ? idResult[idResult.length - 1] : idResult;
  const idText =
    typeof lastId === 'string'
      ? lastId
      : (lastId as any).content ?? (lastId as any).text ?? '';
  const idMatch = idText.match(/\{.*\}/s);
  if (!idMatch) return { status: 'error', error: '파라미터 추출 실패' };
  const { projectId, leadId, feedbackSummary } = JSON.parse(idMatch[0]);

  const project = await springService.getProjectById(projectId);
  const lead = await springService.getLeadById(leadId);

  const systemPrompt = `
피드백, 사업설명, 고객정보를 참고해 후속 B2B 세일즈 이메일을 JSON으로만 생성.
예시: {"subject":"제목", "body":"본문"}
`.trim();

  const mailResult = await agent.conversate([
    { type: 'text', text: systemPrompt },
    { type: 'text', text: `사업 설명: ${project.description}\n고객 정보: ${JSON.stringify(lead)}\n피드백: ${feedbackSummary}` }
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
      return { subject: parsed.subject, body: parsed.body, status: 'success' };
    } catch {
      return { status: 'error', error: '후속 이메일 JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: '후속 이메일 생성 실패' };
}

// 3. 이메일 재작성 (피드백 기반)
export async function regenerateEmailWithFeedback({ userPrompt }: { userPrompt: string }) {
  const paramPrompt = `
아래 프롬프트에서 projectId, leadId, originalEmail(제목/본문), userFeedback을 추출해.
예시: {"projectId":1, "leadId":2, "originalEmail":{"subject":"...","body":"..."},"userFeedback":"별로라고 함"}
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
  const { projectId, leadId, originalEmail, userFeedback } = JSON.parse(paramMatch[0]);

  const project = await springService.getProjectById(projectId);
  const lead = await springService.getLeadById(leadId);

  const systemPrompt = `
아래 정보(사업/고객/원본이메일/피드백)를 참고해 개선된 이메일을 JSON으로만 재작성.
예시: {"subject":"개선된 제목", "body":"개선된 본문"}
`.trim();

  const mailResult = await agent.conversate([
    { type: 'text', text: systemPrompt },
    { type: 'text', text: `사업 설명: ${project.description}\n고객 정보: ${JSON.stringify(lead)}\n원본 이메일: ${JSON.stringify(originalEmail)}\n피드백: ${userFeedback}` }
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
      return { subject: parsed.subject, body: parsed.body, status: 'success' };
    } catch {
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
  ]);
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
  ]);
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

// 5. 이메일 거부 처리 (분석 후 분기)
export async function handleEmailRejection({ userPrompt }: { userPrompt: string }) {
  // 품질 분석 먼저
  const analysis = await analyzeEmailIssues({ userPrompt });

  // 심각하면 재작성, 아니면 개선안 안내
  if (analysis.priority === 'high' || (analysis.issues && analysis.issues.length > 2)) {
    return await regenerateEmailWithFeedback({ userPrompt });
  }
  return {
    action: 'improve',
    analysis,
    message: '분석 결과를 참고하여 이메일을 개선하세요.'
  };
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
