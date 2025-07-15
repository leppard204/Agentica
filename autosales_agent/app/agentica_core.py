from openai import OpenAI
import os
from dotenv import load_dotenv

#아젠티카 함수
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

#db연동 안되서 일단 배열로
project_contexts = {}

def register_project_context(project_id: int, description: str):
    project_contexts[project_id] = description

    print(os.getenv("OPENAI_API_KEY"))

    return {"message": f"프로젝트 {project_id} 설명 저장 완료"}

def generate_initial_email(project_id: int, lead_info: dict) -> dict:
    context = project_contexts.get(project_id, "등록된 사업 설명이 없습니다.")

    messages = [
        {
            "role": "system",
            "content": (
                "너는 B2B 세일즈 이메일 작성을 전문으로 하는 AI야.\n"
                "이메일은 다음 요소를 포함해야 해:\n"
                "- 간결한 제목\n"
                "- 고객사의 니즈나 상황 언급\n"
                "- 우리 사업/서비스의 핵심 가치 제안\n"
                "- 기대 효과 2~3가지\n"
                "- 자연스러운 회신 유도 마무리"
            )
        },
        {
            "role": "user",
            "content": f"사업 설명: {context}\n고객 정보: {lead_info}\n이 조건에 맞는 첫 제안 이메일을 작성해줘."
        }
    ]

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            timeout=15
        )
        content = response.choices[0].message.content
        return {"email_body": content}

    except Exception as e:
        return {"error": str(e)}