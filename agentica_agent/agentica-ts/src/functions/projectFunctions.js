import { springService } from '../services/springService.js';
// 사업 정보 추출 (LLM 호출)
export async function extractProjectInfo(params) {
    const { prompt } = params;
    const systemPrompt = `
사용자의 프롬프트에서 사업 정보(name, description, industry)를 추출해 JSON 형식으로 응답해.
절대 설명하지 말고 JSON만 반환해. 예시:
{"name":"AI 마케팅", "description":"AI 기반 마케팅 자동화", "industry":"마케팅"}
  `.trim();
    // Agentica 내부 LLM 컨텍스트에 this.llm가 자동으로 bind됨
    const response = await this.llm.complete({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ]
    });
    try {
        const match = response.match(/\{.*\}/s);
        if (match)
            return JSON.parse(match[0]);
    }
    catch (e) {
        console.error('Project 추출 파싱 실패:', e);
    }
    return {};
}
// 프로젝트 목록 조회
export async function listProjects() {
    return await springService.getAllProjects();
}
//프로젝트 생성
export async function createProject(params) {
    return await springService.createProject(params);
}
