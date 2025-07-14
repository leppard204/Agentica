from fastapi import FastAPI
from pydantic import BaseModel
from app.agentica_core import register_project_context, generate_initial_email

#fast api로 엔드포인트
app = FastAPI()

class ProjectRequest(BaseModel):
    project_id: int
    description: str

class EmailRequest(BaseModel):
    project_id: int
    lead: dict  # {"company": ..., "contact_name": ..., ...}

@app.post("/register_project/")
def register_project(req: ProjectRequest):
    return register_project_context(req.project_id, req.description)

@app.post("/generate_email/")
def generate_email(req: EmailRequest):
    return generate_initial_email(req.project_id, req.lead)