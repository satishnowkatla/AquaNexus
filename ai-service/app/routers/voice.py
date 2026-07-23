from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import ask_gemini
import json

router = APIRouter()


class VoiceRequest(BaseModel):
    text: str
    language: str = "te"


@router.post("/parse")
def parse_voice(request: VoiceRequest):
    # Load prompt
    with open("app/prompts/voice_prompt.txt", "r") as f:
        prompt_template = f.read()

    prompt = prompt_template.format(
        text=request.text,
        language=request.language,
    )

    # Get AI response
    response = ask_gemini(prompt)

    # Parse JSON from response
    try:
        start = response.find("{")
        end = response.rfind("}") + 1
        transaction = json.loads(response[start:end])
    except:
        transaction = {
            "type": "expense",
            "category": "other",
            "amount": 0,
            "description": request.text,
        }

    return transaction
