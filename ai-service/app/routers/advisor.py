from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import ask_gemini

router = APIRouter()


class AdvisorRequest(BaseModel):
    message: str
    language: str = "te"


@router.post("/chat")
def chat_with_advisor(request: AdvisorRequest):
    # Load prompt
    with open("app/prompts/advisor_prompt.txt", "r") as f:
        prompt_template = f.read()

    prompt = prompt_template.format(
        language=request.language,
        question=request.message,
    )

    # Get AI response
    response = ask_gemini(prompt)

    return {
        "response": response,
        "suggestions": [
            "Check water quality",
            "Consult local expert",
            "Review feeding schedule",
        ],
    }
