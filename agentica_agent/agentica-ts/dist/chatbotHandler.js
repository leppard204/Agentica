import { createProject, generateInitialEmail, generateFollowupEmail, handleEmailRejection, analyzeEmailIssues, listProjects, listLeads, autoConnectLeads, generateEmailsForMultipleLeads, } from './functions/index.js';
import { agent } from './agent.js'; // Agentica 인스턴스
import { getLatestEmailForRewrite } from './functions/emailFunctions.js';
export async function analyzePromptAI(prompt) {
    const messages = [
        {
            type: "text",
            text: `
사용자 요청을 분석하여 의도(intent)와 필요한 파라미터를 추출해줘.
반드시 다음 JSON 형식으로만 응답해:
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
- "이런 사업 할거야: AI 솔루션" → register_project
- "후속 메일 작성할게" → followup_email
- "메일 다시 써줘" → email_rewrite_request
- "연결해줘" → connect_leads
- "고객 리스트 보여줘" → list_leads
- "사업 뭐하고 있는지 보여줘" → list_projects
- "메일 분석해줘" → analyze_email
- "초기 메일 보내줘" → initial_email
      `
        },
        {
            type: "text",
            text: prompt
        }
    ];
    try {
        const resultHistories = await agent.conversate(messages);
        const lastHistory = resultHistories.at(-1);
        const lastText = lastHistory && 'text' in lastHistory ? lastHistory.text : "";
        let parsed;
        try {
            parsed = JSON.parse(lastText);
            if (parsed.intent && parsed.intent !== "unknown")
                return parsed;
        }
        catch {
            // GPT 응답 JSON 파싱 실패 시 fallback으로 진행
        }
        // ✅ Fallback intent 추정 로직
        const lower = prompt.toLowerCase();
        if (lower.includes("사업") && (lower.includes("등록") || lower.includes("할거야"))) {
            return {
                intent: "register_project",
                extracted_params: { description: prompt },
                confidence: 0.4
            };
        }
        if (lower.includes("초기 메일") || lower.includes("메일 보내")) {
            return { intent: "initial_email", extracted_params: {}, confidence: 0.4 };
        }
        if (lower.includes("후속") || lower.includes("follow up") || lower.includes("재전송")) {
            return { intent: "followup_email", extracted_params: {}, confidence: 0.4 };
        }
        if (lower.includes("다시") || lower.includes("수정") || lower.includes("별로") || lower.includes("재작성")) {
            return {
                intent: "email_rewrite_request",
                extracted_params: { userFeedback: prompt },
                confidence: 0.4
            };
        }
        if (lower.includes("연결")) {
            return { intent: "connect_leads", extracted_params: {}, confidence: 0.4 };
        }
        if ((lower.includes("고객") || lower.includes("리드") || lower.includes("기업")) &&
            lower.includes("리스트")) {
            return { intent: "list_leads", extracted_params: {}, confidence: 0.4 };
        }
        if (lower.includes("사업") &&
            (lower.includes("리스트") || lower.includes("진행") || lower.includes("하고 있는"))) {
            return { intent: "list_projects", extracted_params: {}, confidence: 0.4 };
        }
        return { intent: "unknown", extracted_params: {}, confidence: 0 };
    }
    catch (e) {
        console.error("analyzePromptAI error:", e);
        return { intent: "unknown", extracted_params: {}, confidence: 0 };
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
