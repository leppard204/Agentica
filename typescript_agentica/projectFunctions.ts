import { Function, Parameter } from 'agentica';
import { SpringService } from '../services/springService.js';
import type { Project } from '../types/index.js';

const spring = new SpringService();

@Function({
  name: 'extractProjectInfo',
  description: '사용자 프롬프트에서 사업 정보를 추출합니다'
})
export async function extractProjectInfo(
  @Parameter({ name: 'prompt', description: '사용자 입력 프롬프트' })
  prompt: string
): Promise<Partial<Project>> {
  const systemPrompt = `
사용자의 프롬프트에서 사업 정보(name, description, industry)를 추출해 JSON 형식으로 응답해.
절대 설명하지 말고 JSON만 반환해. 예시:
{"name":"AI 마케팅", "description":"AI 기반 마케팅 자동화", "industry":"마케팅"}
  `.trim();

  const response = await this.llm.complete({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]
  });

  try {
    const match = response.match(/\{.*\}/s);
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    console.error('Project 추출 파싱 실패:', e);
  }

  return {};
}

@Function({
  name: 'listProjects',
  description: '현재 등록된 프로젝트 목록을 조회합니다'
})
export async function listProjects(): Promise<Project[]> {
  return await spring.getAllProjects();
}
