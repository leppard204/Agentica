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
  'list_projects',
  'list_leads',
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
너는 사용자 프롬프트의 의도(intent)와 필요한 파라미터를 분석한다. 반드시 **단 하나의 intent**만 선택한다.

[출력 형식]
- 아래 JSON **한 줄**만 출력한다. 코드블록/설명/주석 금지. 줄바꿈 금지.
{"intent":"<one-of>","extracted_params":{"userPrompt":"<원문 그대로>"},"confidence":0.0}

- <one-of> = register_project | register_lead | connect_leads | initial_email | followup_email | email_rewrite_request | analyze_email | handle_email_rejection | list_projects | list_leads | unknown
- JSON은 RFC8259 준수(따옴표 필수, 쉼표/괄호 오류 금지, 후행 쉼표 금지).

[의도 정의 요약]
- register_project: 사업/프로젝트를 **등록/추가/생성**하거나, 사업 **설명서/요약**을 제공하는 문맥(등록 동사가 없어도 사업 설명이면 포함).
- register_lead: 기업/회사/고객/리드 **등록/추가/생성**. **연락처(담당자/이메일)** 언급은 이 문맥으로 간주.
- connect_leads: 특정 **프로젝트/사업**과 **기업(리드)**를 **연결**.
- initial_email: **메일** + **작성/초안/제안** 등 **행위 동사**가 함께 있을 때만.
- followup_email: **후속** + (메일/보내/follow).
- email_rewrite_request: 기존 메일 **수정/재작성** 요구.
- analyze_email: 메일 **분석/진단/품질** 등 평가/요약 요청.
- list_projects / list_leads: 목록/전체/보여줘.

[강한 규칙]
1) **연락처 문맥 규칙**  
   - “연락 메일/컨택 메일/이메일 주소/담당자 메일/담당자 ○○” 등은 **register_lead** 문맥이다.  
   - 이러한 표현만 있고 “작성/보내/초안/제안” 동사가 없으면 **initial_email 금지**.

2) **메일 작성 동사 규칙**  
   - “메일” 단어만으로는 **initial_email 금지**.  
   - 반드시 “작성/써/초안/제안” 중 **하나 이상**이 있어야 initial_email.

3) **사업 설명 규칙**  
   - “사업/프로젝트” 관련 설명(목표/대상/제공물/효과/비전/요약/도입 등)이면 등록 동사가 없어도 **register_project**.

4) **재작성요청 우선 규칙**  
   - “재작성요청”이 포함되면 **handle_email_rejection**을 **무조건** 선택. 다른 키워드 무시.

5) **복수 의도 금지**  
   - 의도가 여러 개처럼 보여도 **가장 중심** 한 가지만 선택.

6) **출력 외 금지**  
   - JSON 외 텍스트/설명/코드블록/마크다운을 출력하면 시스템이 응답을 폐기한다.

[confidence 지침]
- 명확한 키워드 조합(규칙 1~3 충족): 0.75~0.9
- 단서는 있으나 약함: 0.5~0.7
- 모호/불충분: unknown, 0.0~0.3

[예시]
입력: "기업 등록할게. 기업 이름은 카카오고 대기업이야. 담당자는 홍길동, 메일은 a@b.com."
출력: {"intent":"register_lead","extracted_params":{"userPrompt":"기업 등록할게. 기업 이름은 카카오고 대기업이야. 담당자는 홍길동, 메일은 a@b.com."},"confidence":0.85}

입력: "제조 설비 예지보전 AI 도입 사업에 대해 설명한다. 목표/대상/제공물을 정리했다."
출력: {"intent":"register_project","extracted_params":{"userPrompt":"제조 설비 예지보전 AI 도입 사업에 대해 설명한다. 목표/대상/제공물을 정리했다."},"confidence":0.82}

입력: "AI 기반 마케팅 자동화 솔루션 제안 메일 작성해줘."
출력: {"intent":"initial_email","extracted_params":{"userPrompt":"AI 기반 마케팅 자동화 솔루션 제안 메일 작성해줘."},"confidence":0.8}

입력: "카카오를 AI 프로젝트와 연결해줘."
출력: {"intent":"connect_leads","extracted_params":{"userPrompt":"카카오를 AI 프로젝트와 연결해줘."},"confidence":0.78}

입력: "재작성요청: 메일이 톤 앤 매너에 안 맞아."
출력: {"intent":"handle_email_rejection","extracted_params":{"userPrompt":"재작성요청: 메일이 톤 앤 매너에 안 맞아."},"confidence":0.9}

응답 형식:
{
  "intent": "register_project|register_lead|connect_leads|initial_email|followup_email|email_rewrite_request|analyze_email|handle_email_rejection|list_projects|list_leads|unknown",
  "extracted_params": {
    "userPrompt": "사용자가 입력한 전체 문장 그대로"
  },
  "confidence": 0.0
}
`.trim()
  },
  { type: 'text', text: prompt }
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
      const cleanedText = lastText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(lastText);
      if (parsed.intent && INTENT_LIST.includes(parsed.intent)){
        const safeResult = {
          intent: parsed.intent,
          extracted_params: parsed.extracted_params || {},
          confidence: parsed.confidence || 0.0
        };
        console.log('🧠 analyzePromptAI 결과:', JSON.stringify(parsed, null, 2));
        return safeResult;
      }
    } catch {}

    // fallback으로 넘어감
    return fallbackInferIntent(prompt);

  } catch {
    return fallbackInferIntent(prompt);
  }
}

// fallback 기반 intent 추론기
function fallbackInferIntent(prompt: string): AnalyzePromptResult {
  const lower = prompt.toLowerCase();

  const has = (kw: string | RegExp) =>
    typeof kw === 'string' ? lower.includes(kw) : kw.test(lower);
  const hasAny = (arr: (string|RegExp)[]) => arr.some(has);

  // 메일 작성 관련 동사
  const MAIL_ACTIONS = ['작성', '써', '초안', '제안', '보내', '보내줘', '발송'];

  // --- 의도별 판정 ---
  const isRewrite =
    has('메일') && hasAny(['다시', '수정', '재작성', '고쳐', '거부']);

  const isFollowup =
    has('후속') && hasAny(['메일', '보내', 'follow']);

  const isConnectLeads =
    has('연결') && hasAny(['프로젝트', '사업', '기업', '리드']);

  const isInitialEmail =
    has('메일') && hasAny(MAIL_ACTIONS);

  const isRegisterLead =
    hasAny(['기업', '회사', '고객', '리드']) &&
    hasAny(['등록', '추가', '넣어', '생성', '등록할게']) &&
    !isInitialEmail; // 메일작성 동사 있으면 initial_email이 우선

  // 🔥 누락됐던 프로젝트 등록 규칙 추가
  const isRegisterProject =
    hasAny(['사업', '프로젝트']) &&
    hasAny(['등록', '추가', '생성', '등록해', '등록할게', '등록해줘']);

  // 설명서 스타일 텍스트도 잡아주기(등록 동사 없더라도)
  const looksLikeProjectDescription =
    hasAny(['사업', '프로젝트']) &&
    !isInitialEmail && !isConnectLeads && !isRegisterLead &&
    hasAny(['목표', '대상', '제공물', '효과', '비전', '설명', '요약', '도입']);

  // --- 라우팅 우선순위 ---
  let intent: Intent | 'unknown' = 'unknown';
  let conf = 0.0;

  if (isRewrite) { intent = 'email_rewrite_request'; conf = 0.8; }
  else if (isFollowup) { intent = 'followup_email'; conf = 0.75; }
  else if (isConnectLeads) { intent = 'connect_leads'; conf = 0.75; }
  else if (isInitialEmail) { intent = 'initial_email'; conf = 0.72; }
  else if (isRegisterLead) { intent = 'register_lead'; conf = 0.8; }
  else if (isRegisterProject || looksLikeProjectDescription) { intent = 'register_project'; conf = 0.78; }

  return {
    intent,
    extracted_params: { userPrompt: prompt },
    confidence: intent === 'unknown' ? 0 : conf,
  };
}