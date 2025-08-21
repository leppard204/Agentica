import { agent } from '../agent.js';
import { springService } from '../services/springService.js';
const INDUSTRY_KEYWORDS = {
    'ai': 'AI', '에이아이': 'AI', 'ai계열': 'AI', '인공지능': 'AI',
    'it': 'IT', 'it계열': 'IT', '아이티': 'IT', '정보통신': 'IT',
    '금융': '금융',
    '마케팅': '마케팅',
    '헬스케어': '헬스케어', '의료': '헬스케어',
    '교육': '교육',
    '게임': '게임',
    '커머스': '커머스', '쇼핑': '커머스',
    '전자': '전자',
    '자동차': '자동차',
    '건설': '건설',
    '환경': '환경',
};
const SIZE_KEYWORDS = {
    '대기업': '대기업',
    '중견': '중견기업',
    '스타트업': '스타트업',
    '소기업': '스타트업',
};
const LANGUAGE_KEYWORDS = {
    '한국어': 'KO',
    '한글': 'KO',
    '영어': 'EN',
    'english': 'EN',
    '일본어': 'JP',
    'japanese': 'JP',
};
function inferIndustryFromText(text) {
    const lower = text.toLowerCase();
    for (const [keyword, industry] of Object.entries(INDUSTRY_KEYWORDS)) {
        if (lower.includes(keyword))
            return industry;
    }
    return '기타';
}
function inferSizeFromText(text) {
    for (const [keyword, size] of Object.entries(SIZE_KEYWORDS)) {
        if (text.includes(keyword))
            return size;
    }
    return null;
}
function inferLanguageFromText(text) {
    for (const [keyword, lang] of Object.entries(LANGUAGE_KEYWORDS)) {
        if (text.toLowerCase().includes(keyword))
            return lang;
    }
    return null;
}
function extractManually(input) {
    // 3단계로 회사명 시도
    // 1) “기업/회사/… 이름은|명은 …”
    const nameByLabel = input.match(/(?:기업|회사|고객|리드)?\s*(?:이름|명)\s*(?:은|이|가|:)\s*["“]?([가-힣a-zA-Z0-9 .&()\-]{2,40})["”]?/)?.[1];
    // 2) 따옴표로 둘러싼 텍스트
    const nameByQuote = input.match(/["“]([가-힣a-zA-Z0-9 .&()\-]{2,40})["”]/)?.[1];
    // 3) 규모/산업 키워드 앞의 토큰
    const nameByContext = input.match(/([가-힣a-zA-Z0-9 .&()\-]{2,40})\s*(?=(?:이|가)?\s*(?:대기업|중견|스타트업|소기업|it|ai|인공지능|정보통신|커머스))/i)?.[1];
    // 담당자: ‘담당자+조사(은|는|이|가|:)’ 허용 + 공백 옵션
    const contactName = input.match(/담당자(?:는|은|이|가|:)?\s*([가-힣]{2,4})/)?.[1] ?? null;
    const contactEmail = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/)?.[1] ?? null;
    return {
        name: (nameByLabel ?? nameByQuote ?? nameByContext ?? null)?.trim() ?? null,
        contactName,
        contactEmail,
        industry: inferIndustryFromText(input),
        size: inferSizeFromText(input),
        language: inferLanguageFromText(input),
    };
}
export async function createLead({ userPrompt }) {
    const systemPrompt = `
너는 B2B 기업 정보를 추출하는 전문가야.

아래 입력 문장에서 다음 필드를 추출해, 반드시 모든 필드를 포함한 JSON으로 출력해:
{
  "name": "기업명",
  "industry": "산업",
  "size": "기업 규모 (대기업, 중견기업, 스타트업 중 하나. 모르면 null)",
  "language": "기업의 주 사용 언어 (KO, EN, JP 중 하나. 모르면 null)",
  "contactName": "담당자 이름",
  "contactEmail": "이메일 주소"
}

규칙:
- 설명 문장 절대 포함하지 말 것
- 누락된 정보는 일반적인 기준으로 추정해서 반드시 포함 (단, 알 수 없으면 null이고 name과 contactEmail, contactName은 반드시 있어야 함)
- name은 반드시 기업명이어야 하고, "기업", "회사", "고객", "리드" 등의 단어가 포함되면 안됨.
- contactEmail은 반드시 이메일 형식이어야 함.
- name, contactName, contactEmail가 파악이 안되면 한번더 추출 시도
- industry는 반드시 다음 중 하나:
["AI", "IT", "금융", "마케팅", "헬스케어", "교육", "게임", "커머스", "자동차", "건설", "환경","기타"]

예시 입력:
LG CNS 기업 등록. 산업은 IT이고, 한국어 사용하며 대기업임. 담당자는 최지훈이고 이메일은 jhchoi@lgcns.com

예시 출력:
{
  "name": "LG CNS",
  "industry": "IT",
  "size": "대기업",
  "language": "KO",
  "contactName": "최지훈",
  "contactEmail": "jhchoi@lgcns.com"
}
`.trim();
    const result = await agent.conversate([
        { type: 'text', text: systemPrompt },
        { type: 'text', text: userPrompt }
    ]);
    const last = Array.isArray(result) ? result[result.length - 1] : result;
    const lastText = typeof last === 'string'
        ? last
        : last.content ?? last.text ?? '';
    const match = lastText.match(/\{.*\}/s);
    let parsed;
    if (match) {
        try {
            parsed = JSON.parse(match[0]);
        }
        catch { }
    }
    // ✅ fallback 구간
    if (!parsed || !parsed.name || !parsed.contactEmail) {
        console.log("✅ GPT 응답 부족 → fallback extractManually 사용");
        const extracted = extractManually(userPrompt);
        console.log("📦 fallback 추출 결과:", extracted);
        parsed = {
            companyName: extracted.name ?? null,
            industry: extracted.industry ?? "기타",
            size: extracted.size ?? null,
            language: extracted.language ?? null,
            contactName: extracted.contactName ?? null,
            contactEmail: extracted.contactEmail ?? null,
        };
        if (!parsed.companyName || !parsed.contactEmail) {
            console.log("fallback에서도 필수 항목 누락됨:", parsed);
            return { status: 'error', error: '필수 항목 누락' };
        }
        console.log("📨 fallback 기반 저장 payload:", parsed);
        await springService.createLead(parsed);
        return {
            lead: parsed
        };
    }
    // GPT 정상 응답 구간
    parsed.companyName = parsed.name ?? null;
    delete parsed.name;
    if (!parsed.companyName || !parsed.contactEmail) {
        console.log("GPT 응답 기반에서도 필수 누락:", parsed);
        return { status: 'error', error: '필수 항목 누락' };
    }
    console.log("GPT 기반 저장 payload:", parsed);
    await springService.createLead(parsed);
    return {
        lead: parsed
    };
}
function normalizeProjectName(raw) {
    return raw
        .replace(/(사업|프로젝트)\s*$/g, '') // 접미어 제거
        .trim();
}
export async function autoConnectLeads({ userPrompt }) {
    const systemPrompt = `
"${userPrompt}"라는 요청에서 연결할 프로젝트 이름과 기업 이름들을 추출해줘.

형식은 반드시 아래와 같아야 해 (줄바꿈 없이 한 줄로 출력해):
{"projectName": "프로젝트명", "leadNames": ["기업1", "기업2"]}

- 설명 절대 하지 마.
- 이 JSON 외에 어떤 문장도 출력하지 마.
- JSON 형식이 아니면 시스템이 너의 응답을 폐기한다.
`.trim();
    const result = await agent.conversate([
        { type: 'text', text: systemPrompt },
        { type: 'text', text: userPrompt },
    ]);
    const last = Array.isArray(result) ? result[result.length - 1] : result;
    const lastText = typeof last === 'string'
        ? last
        : last.content ?? last.text ?? '';
    // 코드블럭 제거
    const cleaned = lastText.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\{.*\}/s);
    if (!match) {
        return { status: 'error', error: 'projectName/leadNames 추출 실패' };
    }
    try {
        const parsed = JSON.parse(match[0]);
        if (!parsed.projectName ||
            !Array.isArray(parsed.leadNames) ||
            parsed.leadNames.length === 0) {
            return { status: 'error', error: 'projectName 또는 leadNames 누락됨' };
        }
        // projectName 정제
        const cleanProjectName = normalizeProjectName(parsed.projectName);
        return await springService.autoConnectLeadsByNameAndLeads(parsed.projectName.trim(), parsed.leadNames);
    }
    catch (e) {
        return { status: 'error', error: 'JSON 파싱 실패' };
    }
}
export async function listLeads() {
    try {
        const leads = await springService.listLeads();
        return leads;
    }
    catch (error) {
        console.error('리드 목록 조회 실패:', error);
        return [];
    }
}
