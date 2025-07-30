import { agent } from '../agent.js';
import { springService } from '../services/springService.js';

// 타입 명시!
export async function createLead({ userPrompt }: { userPrompt: string }) {
  const systemPrompt = `
사용자의 프롬프트에서 기업 정보(companyName, industry, contactEmail, contactName)를 추출해 JSON 형식으로 응답해.
industry는 아래 리스트 중 하나로만 골라라:
["AI", "금융", "마케팅", "헬스케어", "교육", "게임", "커머스", "자동차", "건설", "기타"]
절대 설명하지 말고 JSON만 반환해. 예시:
{"companyName":"삼성전자", "industry":"전자", "contactEmail":"kim@ss.com", "contactName":"김영수"}
`.trim();

  const result = await agent.conversate([
    { type: 'text', text: systemPrompt },
    { type: 'text', text: userPrompt }
  ]);
  // 안전하게 content/text 추출
  const last = Array.isArray(result) ? result[result.length - 1] : result;
  const lastText =
    typeof last === 'string'
      ? last
      : (last as any).content ?? (last as any).text ?? '';

  const match = lastText.match(/\{.*\}/s);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (!parsed.companyName) return { status: 'error', error: '기업명(companyName) 추출 실패' };
      return await springService.createLead(parsed);
    } catch {
      return { status: 'error', error: 'JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: '기업 정보 추출 실패' };
}

export async function listLeads() {
  return await springService.listLeads();
}

export async function autoConnectLeads({ userPrompt }: { userPrompt: string }) {
  const systemPrompt = `
사용자의 프롬프트에서 연결할 프로젝트의 id를 추출해 JSON 형식으로만 응답해.
예시: {"projectId":1}
`.trim();

  const result = await agent.conversate([
    { type: 'text', text: systemPrompt },
    { type: 'text', text: userPrompt }
  ]);
  const last = Array.isArray(result) ? result[result.length - 1] : result;
  const lastText =
    typeof last === 'string'
      ? last
      : (last as any).content ?? (last as any).text ?? '';

  const match = lastText.match(/\{.*\}/s);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (!parsed.projectId) return { status: 'error', error: 'projectId 추출 실패' };
      return await springService.autoConnectLeads(parsed.projectId);
    } catch {
      return { status: 'error', error: 'JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: '프로젝트 id 추출 실패' };
}
