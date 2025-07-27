import { Function, Parameter } from 'agentica';
import { SpringService } from '../services/springService.js';
import type { Lead } from '../types/index.js';

const spring = new SpringService();

@Function({
  name: 'extractLeadsInfo',
  description: '프롬프트에서 여러 기업 정보를 추출합니다'
})
export async function extractLeadsInfo(
  @Parameter({ name: 'prompt', description: '자연어 입력 프롬프트' })
  prompt: string
): Promise<Lead[]> {
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
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    console.error('기업 추출 파싱 실패:', e);
  }

  return [];
}

@Function({
  name: 'createMultipleLeads',
  description: '여러 기업 정보를 한번에 등록합니다'
})
export async function createMultipleLeads(
  @Parameter({ name: 'leads', description: '리드 배열' })
  leads: Partial<Lead>[]
): Promise<Lead[]> {
  const results = await Promise.allSettled(leads.map(lead => spring.createLead(lead)));
  return results
    .filter((r): r is PromiseFulfilledResult<Lead> => r.status === 'fulfilled')
    .map(r => r.value);
}

@Function({
  name: 'listLeads',
  description: '모든 등록된 기업 리스트를 조회합니다'
})
export async function listLeads(): Promise<Lead[]> {
  return await spring.getAllLeads();
}

@Function({
  name: 'autoConnectLeads',
  description: '프로젝트와 관련 있는 기업들을 자동 연결합니다'
})
export async function autoConnectLeads(
  @Parameter({ name: 'projectId', description: '프로젝트 ID' })
  projectId: number
): Promise<Lead[]> {
  return await spring.autoConnectLeads(projectId);
}
