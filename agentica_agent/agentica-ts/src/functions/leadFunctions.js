import { springService } from '../services/springService.js';
// 프롬프트에서 여러 기업 정보를 추출
export async function extractLeadsInfo(params) {
    const { prompt } = params;
    const systemPrompt = `
프롬프트에서 여러 기업 정보를 추출해 리스트로 반환해. 예시:
[
  {"name":"테크스타트업A", "contactEmail":"a@a.com", "industry":"AI"}, 
  {"name":"테크스타트업B", "contactEmail":"b@b.com", "industry":"헬스케어"}
]
  `.trim();
    const response = await this.llm.complete({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ]
    });
    try {
        const match = response.match(/\[.*\]/s);
        if (match)
            return JSON.parse(match[0]);
    }
    catch (e) {
        console.error('기업 추출 파싱 실패:', e);
    }
    return [];
}
// 여러 기업 정보를 한번에 등록
export async function createMultipleLeads(params) {
    const { leads } = params;
    const results = await Promise.allSettled(leads.map(lead => springService.createLead(lead)));
    return results
        .filter((r) => r.status === 'fulfilled')
        .map(r => r.value);
}
// 모든 등록된 기업 리스트 조회
export async function listLeads() {
    return await springService.getAllLeads();
}
// 프로젝트와 관련 있는 기업 자동 연결
export async function autoConnectLeads(params) {
    const { projectId } = params;
    return await springService.autoConnectLeads(projectId);
}
