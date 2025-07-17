from openai import OpenAI, api_key
import os
from dotenv import load_dotenv
load_dotenv(override=True)
from typing import Dict, Any
import re,json

#아젠티카 함수
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#db연동 안되서 일단 배열로
project_contexts: Dict[int, str] = {}

def register_project_context(project_id: int, description: str):
    project_contexts[project_id] = description
    return {"message": f"프로젝트 {project_id} 설명 저장 완료"}

def generate_initial_email(project_id: int, lead_info: dict) -> dict:
    context = project_contexts.get(project_id, "등록된 사업 설명이 없습니다.")

    messages = [
        {
            "role": "system",
            "content": (
                "너는 B2B 세일즈 이메일 작성을 전문으로 하는 AI야.\n"
                "다음 JSON 형식으로만 응답해. 설명은 포함하지 마.\n"
                "{\n"
                "  \"subject\": \"이메일 제목\",\n"
                "  \"body\": \"이메일 본문 내용\"\n"
                "}\n\n"
                "이메일에는 다음 요소를 포함해:\n"
                "- 고객 상황 언급\n"
                "- 우리 사업/서비스의 핵심 가치 제안\n"
                "- 기대 효과 2~3가지\n"
                "- 회신 유도 문구"
            )
        },
        {
            "role": "user",
            "content": f"사업 설명: {context}\n고객 정보: {lead_info}\n위 조건을 기반으로 이메일 초안을 JSON 형식으로 작성해줘."
        }
    ]

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            timeout=15
        )
        content = response.choices[0].message.content

        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            result = json.loads(match.group())
            return {
                "subject": result.get("subject", ""),
                "body": result.get("body", "")
            }

    except Exception as e:
        pass

    return {
        "subject": "제안드립니다",
        "body": "안녕하세요, 고객님의 상황을 고려한 제안을 드리고자 연락드립니다..."
    }

def generate_followup_email(project_id: int, lead_id: int, feedback_summary: str) -> dict:
    """
    피드백 기반 후속 메일 초안 생성
    Returns: {"subject": str, "body": str}
    """

    context = project_contexts.get(project_id, "등록된 사업 설명이 없습니다.")

    messages = [
        {
            "role": "system",
            "content": (
                "너는 B2B 세일즈 후속 이메일 작성 전문가야.\n\n"
                "다음은 특정 사업에 대한 설명과 고객 피드백이야.\n"
                "이를 바탕으로 후속 제안 메일을 작성해줘.\n\n"
                "반드시 아래 형식의 JSON으로만 응답해. JSON 외 설명은 절대 포함하지 마.\n\n"
                "예시:\n"
                "{\n"
                "  \"subject\": \"기존 제안에 대한 추가 제안 드립니다\",\n"
                "  \"body\": \"고객님의 피드백 감사드립니다. 제안해주신 내용을 반영하여 다음과 같은 조건을 추가 제안드립니다...\"\n"
                "}\n\n"
                f"사업 설명:\n{context}"
            )
        },
        {
            "role": "user",
            "content": f"다음 고객 피드백을 바탕으로 후속 메일을 작성해줘:\n{feedback_summary}"
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )

    content = response['choices'][0]['message']['content']

    try:
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            result = json.loads(match.group())
            return {
                "subject": result.get("subject", ""),
                "body": result.get("body", "")
            }
    except Exception as e:
        pass

    return {
        "subject": "후속 제안",
        "body": "고객님의 피드백을 바탕으로 추가 제안을 드립니다."
    }

def summarize_feedback(feedback_text: str) -> dict:
    """
    고객 응답 요약 및 감정 분류
    Returns: {"summary": str, "response_type": str}
    """

    messages = [
        {
            "role": "system",
            "content": (
                "너는 B2B 고객 피드백 분석 전문가야.\n\n"
                "고객 응답을 요약하고, 긍정적/중립적/부정적 응답인지 분류해.\n"
                "반드시 아래 JSON 형식으로만 응답해. 그 외 문장은 절대 포함하지 마.\n\n"
                "예시:\n"
                "{\n"
                "  \"summary\": \"가격이 부담스럽다는 응답\",\n"
                "  \"response_type\": \"negative\"\n"
                "}\n\n"
                "response_type 값은 반드시 다음 중 하나여야 해: positive, neutral, negative"
            )
        },
        {
            "role": "user",
            "content": f"다음 고객 응답을 분석해줘:\n{feedback_text}"
        }
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )

    content = response['choices'][0]['message']['content']

    try:
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            result = json.loads(match.group())
            return {
                "summary": result.get("summary", ""),
                "response_type": result.get("response_type", "neutral")
            }
    except Exception as e:
        pass

    # 실패 시 기본값
    return {
        "summary": "응답 분석 중 오류가 발생했습니다.",
        "response_type": "neutral"
    }

# 프롬프트 해석 함수 (조건문 기반)
def analyze_prompt_intent(prompt: str) -> str:
    prompt = prompt.lower()

    if any(keyword in prompt for keyword in ["사업 설명", "프로젝트 설명", "context"]):
        return "register_project"
    elif any(keyword in prompt for keyword in ["첫 메일", "제안", "소개"]):
        return "initial_email"
    elif any(keyword in prompt for keyword in ["후속", "follow up", "답장"]):
        return "followup_email"
    else:
        return "unknown"

# 챗봇 핸들러 함수
def chatbot_handler(user_prompt: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    intent = analyze_prompt_intent(user_prompt)

    if intent == "register_project":
        project_id = payload.get("project_id")
        description = payload.get("description")

        if not project_id or not description:
            return {"error": "'project_id'와 'description'은 필수입니다."}

        return register_project_context(project_id, description)

    elif intent == "initial_email":
        project_id = payload.get("project_id")
        lead_info = payload.get("lead_info")

        if not project_id or not lead_info:
            return {"error": "'project_id'와 'lead_info'는 필수입니다."}

        return generate_initial_email(project_id, lead_info)


    elif intent == "followup_email":

        project_id = payload.get("project_id")

        lead_id = payload.get("lead_id")

        feedback_text = payload.get("feedback_text")

        if not project_id or not lead_id or not feedback_text:
            return {"error": "'project_id', 'lead_id', 'feedback_text'는 필수입니다."}

        feedback = summarize_feedback(feedback_text)

        return generate_followup_email(project_id, lead_id, feedback["summary"])

    else:
        return {
            "error": (
                "요청을 이해하지 못했습니다. 다음 중 하나로 다시 시도해주세요:\n"
                "- '이런 사업을 하려고 해...'\n"
                "- '이 고객에게 첫 제안 메일 작성해줘'\n"
                "- '후속 메일 작성해줘'"
            )
        }