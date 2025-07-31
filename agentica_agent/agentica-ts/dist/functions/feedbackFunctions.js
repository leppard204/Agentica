import { agent } from '../agent.js';
import { springService } from '../services/springService.js';
// 피드백 등록
export async function submitFeedback({ userPrompt }) {
    const systemPrompt = `
아래 프롬프트에서 emailId(이메일 id), feedbackText(피드백)를 추출해 JSON으로만 반환.
예시: {"emailId":1, "feedbackText":"답장이 없어서 다시 보내달라고 요청함"}
`.trim();
    const result = await agent.conversate([
        { type: 'text', text: systemPrompt },
        { type: 'text', text: userPrompt }
    ]);
    const last = Array.isArray(result) ? result[result.length - 1] : result;
    const lastText = typeof last === 'string'
        ? last
        : last.content ?? last.text ?? '';
    const match = lastText.match(/\{.*\}/s);
    if (match) {
        try {
            const parsed = JSON.parse(match[0]);
            if (!parsed.emailId || !parsed.feedbackText)
                return { status: 'error', error: 'emailId 또는 feedbackText 추출 실패' };
            return await springService.submitFeedback(parsed);
        }
        catch {
            return { status: 'error', error: 'JSON 파싱 실패' };
        }
    }
    return { status: 'error', error: '피드백 정보 추출 실패' };
}
// 피드백 요약/분석
export async function summarizeFeedback({ userPrompt }) {
    const systemPrompt = `
아래 피드백 내용을 한줄로 요약하고, 긍정/중립/부정 중 하나로 분류해 JSON으로만 반환.
예시: {"summary":"가격이 부담스럽다는 응답", "response_type":"negative"}
response_type: positive|neutral|negative
`.trim();
    const result = await agent.conversate([
        { type: 'text', text: systemPrompt },
        { type: 'text', text: userPrompt }
    ]);
    const last = Array.isArray(result) ? result[result.length - 1] : result;
    const lastText = typeof last === 'string'
        ? last
        : last.content ?? last.text ?? '';
    const match = lastText.match(/\{.*\}/s);
    if (match) {
        try {
            return JSON.parse(match[0]);
        }
        catch {
            return { status: 'error', error: '요약 JSON 파싱 실패' };
        }
    }
    return { status: 'error', error: '피드백 요약 실패' };
}
