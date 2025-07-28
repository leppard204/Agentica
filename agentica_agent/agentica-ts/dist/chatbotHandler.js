import { createProject, generateInitialEmail, generateFollowupEmail, handleEmailRejection, analyzeEmailIssues, listProjects, listLeads, autoConnectLeads, generateEmailsForMultipleLeads, } from './functions/index';
import { agent } from './agent.js'; // Agentica 인스턴스
import { getLatestEmailForRewrite } from './functions/emailFunctions.js';
export async function analyzePromptAI(prompt) {
    const messages = [
        {
            type: "text",
            text: `
사용자 요청을 분석하여 의도(intent)와 필요한 파라미터를 추출해줘.
다음 JSON 형식으로만 응답해:
{
  "intent": "register_project|initial_email|followup_email|email_rewrite_request|improve_email|analyze_email|connect_leads|list_projects|list_leads|unknown",
  "extracted_params": {
    "projectId": null,
    "description": null,
    "leads": null,
    "leadId": null,
    "feedbackText": null,
    "userFeedback": null,
    "emailContent": null,
    "originalEmail": null,
    "leadInfo": null,
    "emailType": null
  },
  "confidence": 0.0
}
예시:
- '이런 사업 할거야: AI 솔루션' → intent: register_project, description: 'AI 솔루션'
- '프로젝트 1번에 메일 보내줘' → intent: initial_email, projectId: 1
- '메일 다시 써줘' → intent: email_rewrite_request, userFeedback: '메일 다시 써줘'
- '사업 리스트 보여줘' → intent: list_projects
`
        },
        {
            type: "text",
            text: prompt
        }
    ];
    try {
        const resultHistories = await agent.conversate(messages);
        const lastHistory = resultHistories[resultHistories.length - 1];
        const lastText = 'text' in lastHistory ? lastHistory.text : '';
        try {
            return JSON.parse(lastText);
        }
        catch {
            return {
                intent: 'unknown',
                extracted_params: {},
                confidence: 0,
            };
        }
    }
    catch (e) {
        console.error('analyzePromptAI error:', e);
        return {
            intent: 'unknown',
            extracted_params: {},
            confidence: 0,
        };
    }
}
export async function chatbotHandler(prompt) {
    // 1. 자연어 인텐트 분석 (기존 analyzePromptAI 함수 활용)
    const analysis = await analyzePromptAI(prompt);
    const { intent, extracted_params } = analysis;
    switch (intent) {
        case 'register_project':
            if (!extracted_params.description)
                throw new Error('description is required');
            return await createProject({ name: extracted_params.description, description: extracted_params.description, industry: '' });
        case 'initial_email':
            if (!extracted_params.projectId || !extracted_params.leads)
                throw new Error('projectId and leads are required');
            if (Array.isArray(extracted_params.leads)) {
                // 다중 기업 메일 생성
                return await generateEmailsForMultipleLeads({ projectId: extracted_params.projectId, leadInfoList: extracted_params.leads });
            }
            else {
                // 단일 기업 메일 생성
                return await generateInitialEmail({ projectId: extracted_params.projectId, leadInfo: extracted_params.leads });
            }
        case 'followup_email':
            if (!extracted_params.projectId || !extracted_params.leadId || !extracted_params.feedbackText)
                throw new Error('projectId, leadId and feedbackText are required');
            return await generateFollowupEmail({
                projectId: extracted_params.projectId,
                leadId: extracted_params.leadId,
                feedbackSummary: extracted_params.feedbackText,
            });
        case 'email_rewrite_request':
            // 파이썬 기능에 맞게 userFeedback 기반 메일 재작성
            if (!extracted_params.projectId || !extracted_params.leadId || !extracted_params.userFeedback)
                throw new Error('projectId, leadId and userFeedback are required');
            // 원본 이메일 조회가 필요하니 springService로 불러오는 로직 추가 필요 (생략 가능 시 직접 파라미터로 전달)
            // 여기서는 originalEmail을 받아야 하므로 호출 형태 조정 필요함
            const originalEmail = await getLatestEmailForRewrite({
                projectId: extracted_params.projectId,
                leadId: extracted_params.leadId
            });
            if (!originalEmail)
                throw new Error('Original email not found for rewriting');
            return await handleEmailRejection({
                projectId: extracted_params.projectId,
                leadInfo: extracted_params.leadInfo || {},
                originalEmail,
                userFeedback: extracted_params.userFeedback,
                emailType: 'initial'
            });
        case 'improve_email':
            if (!extracted_params.projectId || !extracted_params.leadInfo || !extracted_params.originalEmail || !extracted_params.userFeedback)
                throw new Error('projectId, leadInfo, originalEmail and userFeedback are required');
            return await handleEmailRejection({
                projectId: extracted_params.projectId,
                leadInfo: extracted_params.leadInfo,
                originalEmail: extracted_params.originalEmail,
                userFeedback: extracted_params.userFeedback,
                emailType: extracted_params.emailType ?? 'initial',
            });
        case 'analyze_email':
            if (!extracted_params.emailContent || !extracted_params.userFeedback)
                throw new Error('emailContent and userFeedback are required');
            return await analyzeEmailIssues({
                emailContent: extracted_params.emailContent,
                userFeedback: extracted_params.userFeedback,
            });
        case 'list_projects':
            return await listProjects();
        case 'list_leads':
            return await listLeads();
        case 'connect_leads':
            if (!extracted_params.projectId)
                throw new Error('projectId is required');
            return await autoConnectLeads(extracted_params.projectId);
        default:
            throw new Error(`지원하지 않는 intent: ${intent}`);
    }
}
