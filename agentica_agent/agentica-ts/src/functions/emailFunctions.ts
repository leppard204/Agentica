// src/functions/emailFunctions.ts
import { springService } from '../services/springService.js';
import type { Lead, EmailResult } from '../types/index.js';
import type { Email } from '../types/index.js';

// 이메일 품질 분석 함수 (파이썬의 analyze_email_issues 포팅)
export async function analyzeEmailIssues(
  this: any,
  params: { 
    emailContent: { subject: string; body: string }; 
    userFeedback: string 
  }
): Promise<{ issues: string[]; suggestions: string[]; priority: 'high' | 'medium' | 'low' }> {
  const { emailContent, userFeedback } = params;
  
  const response = await this.llm.complete({
    messages: [
      {
        role: 'system',
        content: `
너는 B2B 이메일 품질 분석 전문가야.

사용자의 피드백을 바탕으로 이메일의 문제점을 분석하고 개선 방안을 제시해.
반드시 아래 JSON 형식으로만 응답해. 그 외 문장은 절대 포함하지 마.

예시:
{
  "issues": ["제목이 너무 일반적임", "본문이 너무 길어서 읽기 어려움"],
  "suggestions": ["더 구체적인 제목으로 변경", "본문을 2-3문단으로 축약"],
  "priority": "high"
}

priority 값은 다음 중 하나여야 해: high, medium, low
        `.trim()
      },
      {
        role: 'user',
        content: `이메일 내용:\n제목: ${emailContent.subject}\n본문: ${emailContent.body}\n\n사용자 피드백: ${userFeedback}\n\n위 내용을 바탕으로 이메일의 문제점을 분석해줘.`
      }
    ]
  });

  try {
    const match = response.match(/\{.*\}/s);
    if (match) {
      const result = JSON.parse(match[0]);
      return {
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        priority: result.priority || 'medium'
      };
    }
  } catch (e) {
    console.error('이메일 분석 실패:', e);
  }

  return {
    issues: ['분석 중 오류가 발생했습니다'],
    suggestions: ['이메일을 다시 작성해주세요'],
    priority: 'medium'
  };
}

// 고도화된 메일 재작성 함수 (파이썬의 regenerate_email_with_feedback 포팅)
export async function regenerateEmailWithFeedback(
  this: any,
  params: {
    projectId: number;
    leadInfo: Lead;
    originalEmail: { subject: string; body: string };
    userFeedback: string;
    emailType?: 'initial' | 'followup';
  }
): Promise<EmailResult> {
  const { projectId, leadInfo, originalEmail, userFeedback, emailType = 'initial' } = params;

  try {
    // 먼저 이메일 문제점 분석
    const analysis = await analyzeEmailIssues.call(this, {
      emailContent: originalEmail,
      userFeedback
    });

    const project = await springService.getProjectById(projectId);
    const context = project.description ?? '등록된 사업 설명이 없습니다.';

    // 이메일 타입에 따른 시스템 메시지 설정
    const systemContent = emailType === 'initial' 
      ? `
너는 B2B 세일즈 이메일 재작성 전문가야.
사용자의 피드백을 바탕으로 이메일을 개선해.
다음 JSON 형식으로만 응답해. 설명은 포함하지 마.
{
  "subject": "개선된 이메일 제목",
  "body": "개선된 이메일 본문"
}

이메일에는 다음 요소를 포함해:
- 고객 상황 언급
- 우리 사업/서비스의 핵심 가치 제안
- 기대 효과 2~3가지
- 회신 유도 문구
      `.trim()
      : `
너는 B2B 세일즈 후속 이메일 재작성 전문가야.
사용자의 피드백을 바탕으로 후속 이메일을 개선해.
다음 JSON 형식으로만 응답해. 설명은 포함하지 마.
{
  "subject": "개선된 후속 이메일 제목",
  "body": "개선된 후속 이메일 본문"
}

후속 이메일에는 다음 요소를 포함해:
- 이전 제안에 대한 추가 정보
- 고객의 우려사항 해결
- 구체적인 다음 단계 제시
      `.trim();

    const response = await this.llm.complete({
      messages: [
        { role: 'system', content: systemContent },
        {
          role: 'user',
          content: `
사업 설명: ${context}
고객 정보: ${JSON.stringify(leadInfo)}
원본 이메일:
제목: ${originalEmail.subject}
본문: ${originalEmail.body}
사용자 피드백: ${userFeedback}
분석된 문제점: ${analysis.issues.join(', ')}
개선 제안: ${analysis.suggestions.join(', ')}

위 정보를 바탕으로 개선된 이메일을 작성해줘.
          `
        }
      ]
    });

    const match = response.match(/\{.*\}/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const subject = parsed.subject ?? originalEmail.subject;
      const body = parsed.body ?? originalEmail.body;
      
      await springService.saveEmail(projectId, leadInfo.id, subject, body);
      
      return { subject, body, lead: leadInfo, status: 'success' };
    }
  } catch (e) {
    console.error('메일 재작성 실패:', e);
  }

  return {
    subject: '개선된 제안',
    body: '사용자 피드백을 반영하여 이메일을 개선했습니다.',
    lead: leadInfo,
    status: 'error',
    error: '재작성 실패'
  };
}

// 통합 이메일 거부 처리 함수 (파이썬의 handle_email_rejection 포팅)
export async function handleEmailRejection(
  this: any,
  params: {
    projectId: number;
    leadInfo: Lead;
    originalEmail: { subject: string; body: string };
    userFeedback: string;
    emailType?: 'initial' | 'followup';
  }
): Promise<{
  action: 'regenerate' | 'improve';
  newEmail: EmailResult;
  analysis: { issues: string[]; suggestions: string[]; priority: string };
  improvements: string[];
  message: string;
}> {
  const { projectId, leadInfo, originalEmail, userFeedback, emailType = 'initial' } = params;

  // 이메일 문제점 분석
  const analysis = await analyzeEmailIssues.call(this, {
    emailContent: originalEmail,
    userFeedback
  });

  // 우선순위가 높거나 문제가 심각한 경우 새로 작성
  if (analysis.priority === 'high' || analysis.issues.length > 2) {
    const newEmail = await regenerateEmailWithFeedback.call(this, {
      projectId,
      leadInfo,
      originalEmail,
      userFeedback,
      emailType
    });

    return {
      action: 'regenerate',
      newEmail,
      analysis,
      improvements: analysis.suggestions,
      message: '문제점이 심각하여 이메일을 새로 작성했습니다.'
    };
  } else {
    // 문제가 경미한 경우 개선된 이메일 제공
    const improvedEmail = await regenerateEmailWithFeedback.call(this, {
      projectId,
      leadInfo,
      originalEmail,
      userFeedback,
      emailType
    });

    return {
      action: 'improve',
      newEmail: improvedEmail,
      analysis,
      improvements: analysis.suggestions,
      message: '기존 이메일을 개선했습니다.'
    };
  }
}

// 다중 기업 이메일 생성 함수 (파이썬의 generate_emails_for_multiple_leads 포팅)
export async function generateEmailsForMultipleLeads(
  this: any,
  params: { projectId: number; leadInfoList: Lead[] }
): Promise<{
  type: string;
  projectId: number;
  totalLeads: number;
  successCount: number;
  errorCount: number;
  emails: Array<{
    lead: Lead;
    email: EmailResult;
    status: string;
    leadIndex: number;
    error?: string;
  }>;
}> {
  const { projectId, leadInfoList } = params;
  const results = [];

  for (let i = 0; i < leadInfoList.length; i++) {
    const lead = leadInfoList[i];
    try {
      const email = await generateInitialEmail.call(this, { projectId, leadInfo: lead });
      results.push({
        lead,
        email,
        status: 'success',
        leadIndex: i + 1
      });
    } catch (error) {
      results.push({
        lead,
        email: {
          subject: '제안드립니다',
          body: '안녕하세요, 고객님의 상황을 고려한 제안을 드리고자 연락드립니다...',
          status: 'error' as const
        },
        status: 'error',
        leadIndex: i + 1,
        error: (error instanceof Error ? error.message : '알 수 없는 오류')
      });
    }
  }

  return {
    type: 'multiple_initial_emails',
    projectId,
    totalLeads: leadInfoList.length,
    successCount: results.filter(r => r.status === 'success').length,
    errorCount: results.filter(r => r.status === 'error').length,
    emails: results
  };
}

// 초안 세일즈 이메일 생성 (기존 함수 개선)
export async function generateInitialEmail(
  this: any,
  params: { projectId: number; leadInfo: Lead }
): Promise<EmailResult> {
  const { projectId, leadInfo } = params;
  try {
    const project = await springService.getProjectById(projectId);
    const context = project.description ?? '등록된 사업 설명이 없습니다.';

    const response = await this.llm.complete({
      messages: [
        {
          role: 'system',
          content: `
너는 B2B 세일즈 이메일 작성을 전문으로 하는 AI야.
다음 JSON 형식으로만 응답해. 설명은 포함하지 마.
{
  "subject": "이메일 제목",
  "body": "이메일 본문 내용"
}

이메일에는 다음 요소를 포함해:
- 고객 상황 언급
- 우리 사업/서비스의 핵심 가치 제안
- 기대 효과 2~3가지
- 회신 유도 문구
`.trim()
        },
        {
          role: 'user',
          content: `사업 설명: ${context}\n고객 정보: ${JSON.stringify(leadInfo)}\n위 조건을 기반으로 이메일 초안을 JSON 형식으로 작성해줘.`
        }
      ]
    });

    const match = response.match(/\{.*\}/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const subject = parsed.subject ?? '';
      const body = parsed.body ?? '';
      await springService.saveEmail(projectId, leadInfo.id, subject, body);
      return { subject, body, lead: leadInfo, status: 'success' };
    }
  } catch (e) {
    console.error('초안 생성 실패:', e);
  }

  return {
    subject: '제안드립니다',
    body: '안녕하세요, 고객님의 상황을 고려한 제안을 드리고자 연락드립니다...',
    lead: leadInfo,
    status: 'error',
    error: '생성 실패'
  };
}

// 여러 기업에 대해 이메일 생성 (기존 함수 유지)
export async function generateMultipleEmails(
  this: any,
  params: { projectId: number; leads: Lead[] }
): Promise<EmailResult[]> {
  const { projectId, leads } = params;
  const results = await Promise.allSettled(
    leads.map(lead => generateInitialEmail.call(this, { projectId, leadInfo: lead }))
  );

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          subject: '제안드립니다',
          body: '안녕하세요, 고객님의 상황을 고려한 제안을 드리고자 연락드립니다...',
          lead: leads[i],
          status: 'error',
          error: r.reason?.message ?? '알 수 없는 오류'
        }
  );
}

// 피드백을 기반으로 후속 이메일 생성 (기존 함수 개선)
export async function generateFollowupEmail(
  this: any,
  params: { projectId: number; leadId: number; feedbackSummary: string }
): Promise<EmailResult> {
  const { projectId, leadId, feedbackSummary } = params;
  try {
    const project = await springService.getProjectById(projectId);
    const lead = await springService.getLeadById(leadId);
    const context = project.description ?? '등록된 사업 설명이 없습니다.';

    const response = await this.llm.complete({
      messages: [
        {
          role: 'system',
          content: `
너는 B2B 후속 이메일 작성 전문가야. 피드백을 기반으로 다음 JSON 형식으로 작성해:
{
  "subject": "후속 메일 제목",
  "body": "본문 내용"
}

후속 이메일에는 다음 요소를 포함해:
- 이전 제안에 대한 추가 정보
- 고객의 우려사항 해결
- 구체적인 다음 단계 제시
        `.trim()
        },
        {
          role: 'user',
          content: `사업 설명: ${context}\n피드백: ${feedbackSummary}`
        }
      ]
    });

    const match = response.match(/\{.*\}/s);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const subject = parsed.subject ?? '';
      const body = parsed.body ?? '';
      await springService.saveEmail(projectId, leadId, subject, body);
      return { subject, body, lead, status: 'success' };
    }
  } catch (e) {
    console.error('후속 메일 생성 실패:', e);
  }

  return {
    subject: '개선된 제안',
    body: '피드백을 반영하여 메일을 개선했습니다.',
    status: 'error',
    error: '생성 실패'
  };
}

// 기존 rewriteEmail 함수 개선 (regenerateEmailWithFeedback 사용)
export async function rewriteEmail(
  this: any,
  params: { 
    originalSubject: string;
    originalBody: string;
    userFeedback: string;
    projectId: number;
    leadId: number;
  }
): Promise<EmailResult> {
  const { originalSubject, originalBody, userFeedback, projectId, leadId } = params;
  
  try {
    const lead = await springService.getLeadById(leadId);
    
    return await regenerateEmailWithFeedback.call(this, {
      projectId,
      leadInfo: lead,
      originalEmail: { subject: originalSubject, body: originalBody },
      userFeedback,
      emailType: 'initial'
    });
  } catch (e) {
    console.error('메일 재작성 실패:', e);
    return {
      subject: originalSubject,
      body: originalBody,
      status: 'error',
      error: '재작성 실패'
    };
  }
}

// 최근 메일 조회 함수 (기존 유지)
export async function getLatestEmailForRewrite(
  this: any,
  params: { projectId?: number; leadId?: number }
): Promise<Email | null> {
  const { projectId, leadId } = params;
  
  if (projectId && leadId) {
    return await springService.getLatestEmail(projectId, leadId);
  }
  
  throw new Error('메일을 재작성하려면 프로젝트와 기업을 선택해주세요.');
}

// 메일 발송 함수
export async function sendEmail(
  this: any,
  params: { emailId: number }
): Promise<{ status: string; message: string }> {
  const { emailId } = params;
  
  try {
    const result = await springService.sendEmail(emailId);
    return { status: 'success', message: result };
  } catch (e) {
    console.error('메일 발송 실패:', e);
    return { status: 'error', message: '메일 발송에 실패했습니다.' };
  }
}

// 통합 이메일 워크플로우 함수
export async function completeEmailWorkflow(
  this: any,
  params: { 
    projectId: number; 
    leadIds: number[]; 
    autoSend?: boolean;
  }
): Promise<{
  emailResults: EmailResult[];
  sentEmails: number[];
  errors: string[];
}> {
  const { projectId, leadIds, autoSend = false } = params;
  const emailResults: EmailResult[] = [];
  const sentEmails: number[] = [];
  const errors: string[] = [];

  try {
    // 1. 각 기업에게 메일 생성
    for (const leadId of leadIds) {
      const lead = await springService.getLeadById(leadId);
      const emailResult = await generateInitialEmail.call(this, { 
        projectId, 
        leadInfo: lead 
      });
      emailResults.push(emailResult);

      // 2. 자동 발송이 설정되어 있다면 바로 발송
      if (autoSend && emailResult.status === 'success') {
        try {
          const latestEmail = await springService.getLatestEmail(projectId, leadId);
          if (latestEmail) {
            await springService.sendEmail(latestEmail.id);
            sentEmails.push(latestEmail.id);
          }
        } catch (e) {
          errors.push(`기업 ${lead.name}에게 메일 발송 실패: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    return { emailResults, sentEmails, errors };
  } catch (e) {
    if (e instanceof Error) {
    console.error(e.message);
  }
    return { emailResults, sentEmails, errors };
  }
}