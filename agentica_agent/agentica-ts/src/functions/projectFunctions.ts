// functions/projectFunctions.ts
import { agent } from '../agent.js';
import { springService } from '../services/springService.js';

export async function createProject({ userPrompt }: { userPrompt: string }) {
  const systemPrompt = `
사용자의 프롬프트에서 사업 정보(name, description, industry)를 추출해 JSON 형식으로 응답해.

요구사항:
- description은 사용자가 입력한 내용 포함하되, JSON에서 유효하도록 모든 줄바꿈은 \\n, 따옴표(")는 \\\" 로 이스케이프할 것.
- description은 어느정도 요약하되 전체 내용을 포함해서 정제해줘. 해당 필드는 사업에 대한 설명에 대한 필드니까 꼼꼼하게 작성할 것.
- industry는 아래 리스트 중 하나로만 선택, 전체 프롬프트를 읽고 가장 적합한 것을 선택해.:
["AI", "금융", "마케팅", "헬스케어", "교육", "게임", "커머스", "자동차", "건설", "환경","기타"]

반드시 JSON만 반환하며, 추가 설명을 붙이지 말 것.

예시:
{"name":"AI 마케팅", "description":"AI 기반 마케팅 자동화 솔루션.\\n목표는 매출 20% 증가", "industry":"마케팅"}
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

  // 3. JSON 응답 추출
  const match = lastText.match(/\{.*\}/s);
  
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (!parsed.name) return { status: 'error', error: '사업명(name) 추출 실패' };
      console.log('🛠 DEBUG — createProject 추출 결과:', parsed);
      return await springService.createProject(parsed);
    } catch {
      return { status: 'error', error: 'JSON 파싱 실패' };
    }
  }
  return { status: 'error', error: '사업 정보 추출 실패' };
}

export async function listProjects() {
  return await springService.listProjects();
}
