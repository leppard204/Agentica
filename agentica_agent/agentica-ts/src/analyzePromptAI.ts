// analyzePromptAI.ts
import type { AgenticaUserMessageContent } from '@agentica/core';
import { agent } from './agent.js';

const INTENT_LIST = [
  'register_project',
  'register_lead',
  'connect_leads',
  'initial_email',
  'followup_email',
  'email_rewrite_request',
  'analyze_email',
  'handle_email_rejection',
  'generate_emails_for_multiple_leads',
  'list_projects',
  'list_leads'
] as const;
type Intent = typeof INTENT_LIST[number];

export interface AnalyzePromptResult {
  intent: Intent | 'unknown';
  extracted_params: any;
  confidence: number;
}

export async function analyzePromptAI(prompt: string): Promise<AnalyzePromptResult> {
  const messages: AgenticaUserMessageContent[] = [
    {
      type: 'text',
      text: `
아래 프롬프트의 의도(intent)와 필요한 정보를 추출해 아래 JSON만 반환:
{
  "intent": "register_project|register_lead|connect_leads|initial_email|followup_email|email_rewrite_request|analyze_email|handle_email_rejection|generate_emails_for_multiple_leads|list_projects|list_leads|unknown",
  "extracted_params": { "userPrompt": "..." },
  "confidence": 0.0
}
설명 없이 JSON만.
예시:
"AI 마케팅 사업 시작할거야" → register_project
"교육용 챗봇 플랫폼 개발 사업 등록해줘" → register_project
"건설 프로젝트 신규 사업 추진" → register_project
"삼성전자 기업 등록. 산업은 AI, 담당자 김민수, 이메일 minsu@samsung.com" → register_lead
"하나은행을 리드로 추가" → register_lead
"게임회사 넥슨 lead 등록" → register_lead
"1번 프로젝트에 2,3번 기업 자동 연결" → connect_leads
"메일 써줘" → initial_email
"후속 메일 작성" → followup_email
"이메일 품질 분석해줘" → analyze_email
"메일 거부 처리해줘" → handle_email_rejection
"다중 기업에 메일 보내줘" → generate_emails_for_multiple_leads
"사업 리스트 보여줘" → list_projects
"기업 리스트 보여줘" → list_leads
`,
    },
    { type: 'text', text: prompt },
  ];

  try {
    const resultHistories = await agent.conversate(messages);
    const lastHistory = Array.isArray(resultHistories)
      ? resultHistories[resultHistories.length - 1]
      : resultHistories;
    const lastText =
      typeof lastHistory === 'string'
        ? lastHistory
        : (lastHistory as any).content ?? (lastHistory as any).text ?? '';

    try {
      const parsed = JSON.parse(lastText);
      if (parsed.intent && INTENT_LIST.includes(parsed.intent)) return parsed;
    } catch {}

    // fallback: 의도 못잡을 때 패턴 분기 (폭넓게!)
    const lower = prompt.toLowerCase();

    // 사업 등록 (여러가지 표현)
    if (
      (lower.includes('사업') &&
        (lower.includes('등록') ||
          lower.includes('추가') ||
          lower.includes('할거야') ||
          lower.includes('시작') ||
          lower.includes('신규') ||
          lower.includes('추진') ||
          lower.includes('개발') ||
          lower.includes('런칭') ||
          lower.includes('설립') ||
          lower.includes('오픈') ||
          lower.includes('시작할게'))) ||
      lower.includes('사업 시작')
    ) {
      return {
        intent: 'register_project',
        extracted_params: { userPrompt: prompt },
        confidence: 0.8
      };
    }

    // 기업/리드 등록
    if (
      (lower.includes('기업') ||
        lower.includes('회사') ||
        lower.includes('리드') ||
        lower.includes('고객')) &&
      (lower.includes('등록') ||
        lower.includes('추가') ||
        lower.includes('lead'))
    ) {
      return {
        intent: 'register_lead',
        extracted_params: { userPrompt: prompt },
        confidence: 0.8
      };
    }

    // 기업-사업 연결
    if (lower.includes('연결') || lower.includes('auto-connect')) {
      return {
        intent: 'connect_leads',
        extracted_params: { userPrompt: prompt },
        confidence: 0.7
      };
    }

    // 초안 메일
    if (
      (lower.includes('메일') && (lower.includes('써') || lower.includes('작성') || lower.includes('초안'))) ||
      lower.includes('제안 메일')
    ) {
      if (lower.includes('후속') || lower.includes('follow')) {
        return {
          intent: 'followup_email',
          extracted_params: { userPrompt: prompt },
          confidence: 0.7
        };
      }
      return {
        intent: 'initial_email',
        extracted_params: { userPrompt: prompt },
        confidence: 0.7
      };
    }

    // 이메일 재작성/거부
    if (
      lower.includes('다시') ||
      lower.includes('수정') ||
      lower.includes('별로') ||
      lower.includes('재작성') ||
      lower.includes('고쳐') ||
      lower.includes('거부')
    ) {
      return {
        intent: 'email_rewrite_request',
        extracted_params: { userPrompt: prompt },
        confidence: 0.7
      };
    }

    // 이메일 품질 분석
    if (
      lower.includes('품질') ||
      lower.includes('분석') ||
      lower.includes('진단')
    ) {
      return {
        intent: 'analyze_email',
        extracted_params: { userPrompt: prompt },
        confidence: 0.6
      };
    }

    // 다중 메일
    if (
      (lower.includes('다중') || lower.includes('여러')) &&
      (lower.includes('메일') || lower.includes('기업') || lower.includes('리드'))
    ) {
      return {
        intent: 'generate_emails_for_multiple_leads',
        extracted_params: { userPrompt: prompt },
        confidence: 0.6
      };
    }

    // 리스트 보여줘
    if (
      (lower.includes('리스트') || lower.includes('목록') || lower.includes('보여줘') || lower.includes('전체'))
    ) {
      if (lower.includes('사업') || lower.includes('프로젝트')) {
        return {
          intent: 'list_projects',
          extracted_params: { userPrompt: prompt },
          confidence: 0.5
        };
      }
      if (lower.includes('기업') || lower.includes('회사') || lower.includes('리드')) {
        return {
          intent: 'list_leads',
          extracted_params: { userPrompt: prompt },
          confidence: 0.5
        };
      }
    }

    // 마지막 fallback: unknown
    return {
      intent: 'unknown',
      extracted_params: { userPrompt: prompt },
      confidence: 0
    };
  } catch (e) {
    return {
      intent: 'unknown',
      extracted_params: { userPrompt: prompt },
      confidence: 0
    };
  }
}
