import { springService } from '../services/springService.js';
// 초안 세일즈 이메일 생성
export async function generateInitialEmail(params) {
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
아래 JSON 형식으로 응답해:
{
  "subject": "이메일 제목",
  "body": "이메일 본문"
}
이메일에는 고객 상황, 가치 제안, 기대 효과, 회신 유도를 포함해.
`.trim()
                },
                {
                    role: 'user',
                    content: `사업 설명: ${context}\n고객 정보: ${JSON.stringify(leadInfo)}`
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
    }
    catch (e) {
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
// 여러 기업에 대해 이메일 생성
export async function generateMultipleEmails(params) {
    const { projectId, leads } = params;
    const results = await Promise.allSettled(leads.map(lead => generateInitialEmail.call(this, { projectId, leadInfo: lead })));
    return results.map((r, i) => r.status === 'fulfilled'
        ? r.value
        : {
            subject: '제안드립니다',
            body: '안녕하세요, 고객님의 상황을 고려한 제안을 드리고자 연락드립니다...',
            lead: leads[i],
            status: 'error',
            error: r.reason?.message ?? '알 수 없는 오류'
        });
}
// 피드백을 기반으로 후속 이메일 생성
export async function generateFollowupEmail(params) {
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
    }
    catch (e) {
        console.error('후속 메일 생성 실패:', e);
    }
    return {
        subject: '개선된 제안',
        body: '피드백을 반영하여 메일을 개선했습니다.',
        status: 'error',
        error: '생성 실패'
    };
}
