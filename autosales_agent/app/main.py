from fastapi import FastAPI
from pydantic import BaseModel
from app.agentica_core import register_project_context, generate_initial_email, chatbot_handler
from typing import Dict, Any

#fast api로 엔드포인트
app = FastAPI()

class ProjectRequest(BaseModel):
    project_id: int
    description: str

class EmailRequest(BaseModel):
    project_id: int
    lead: dict  # {"company": ..., "contact_name": ..., ...}

class ChatbotRequest(BaseModel):
    prompt: str
    payload: Dict[str, Any] = {}

@app.post("/register_project/")
def register_project(req: ProjectRequest):
    return register_project_context(req.project_id, req.description)

@app.post("/generate_email/")
def generate_email(req: EmailRequest):
    return generate_initial_email(req.project_id, req.lead)

# 엔드포인트: /chatbot/ 사용자의 프롬프트 해석 함수와 연결(현재는 조건문이지만 추후 기능 개발되면 ai로 바꿈)
@app.post("/chatbot/")
async def handle_chatbot(req: ChatbotRequest):
    try:
        result = chatbot_handler(req.prompt, req.payload)
        return result
    except Exception as e:
        return {"error": f"서버 오류: {str(e)}"}