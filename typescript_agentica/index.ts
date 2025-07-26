import { AutoSalesAgent } from './agent.js';

const agent = new AutoSalesAgent();

async function main() {
  const testPrompts = [
    "AI 마케팅 자동화 사업을 등록해줘",
    "삼성전자, LG전자, 네이버 기업 정보 추가해줘",
    "프로젝트 1번에 메일 써줘",
    "현재 등록된 사업들 보여줘"
  ];

  for (const prompt of testPrompts) {
    console.log(`\n🧑 사용자: ${prompt}`);
    try {
      const result = await agent.handleNaturalLanguage(prompt);
      console.log('🤖 AI 응답:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('에러:', err);
    }
  }
}

main().catch(console.error);
