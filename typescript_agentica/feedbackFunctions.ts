import { Function, Parameter } from 'agentica';
import { SpringService } from '../services/springService.js';

const spring = new SpringService();

@Function({
  name: 'summarizeFeedback',
  description: '고객 응답을 요약하고 감정을 분류합니다'
})
export async function summarizeFeedback(
  @Parameter({ name: 'feedbackText', description: '고객 응답 텍스트' }) feedbackText: string,
  @Parameter({ name: 'projectId', description: '프로젝트 ID' }) projectId: number,
  @Parameter({ name: 'leadId', description: '리드 ID' }) leadId: number,
  @Parameter({ name: 'emailId', description: '이메일 ID' }) emailId: number
): Promise<{ summary: string; responseType: string; status: string }> {
  const systemPrompt = `
너는 B2B 고객 피드백 분석 전문가야.

고객 응답을 요약하고, 긍정적/중립적/부정적 응답인지 분류해.
반드시 아래 JSON 형식으로만 응답해. 그 외 문장은 절대 포함하지 마.

예시:
{
  "summary": "가격이 부담스럽다는 응답",
  "response_type": "negative"
}
response_type은 반드시: positive, neutral, negative 중 하나여야 해.
  `.trim();

  try {
    const response = await this.llm.complete({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `고객 응답: ${feedbackText}` }
      ]
    });

    const match = response.match(/\{.*\}/s);
    if (match) {
      const result = JSON.parse(match[0]);
      const summary = result.summary || '';
      const responseType = result.response_type || 'neutral';

      await spring.saveFeedback(projectId, leadId, emailId, summary, responseType);

      return { summary, responseType, status: 'success' };
    }
  } catch (e) {
    console.error('피드백 분석 실패:', e);
  }

  return { summary: '요약 실패', responseType: 'neutral', status: 'error' };
}
