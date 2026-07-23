from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import ask_gemini
import json

router = APIRouter()


class DiseaseRequest(BaseModel):
    image_base64: str = None
    voice_description: str = ""
    species: str = "shrimp"
    language: str = "te"


@router.post("/diagnose")
def diagnose_disease(request: DiseaseRequest):
    # Load prompt
    with open("app/prompts/disease_prompt.txt", "r") as f:
        prompt_template = f.read()

    prompt = prompt_template.format(
        image_analysis="See attached image" if request.image_base64 else "No image provided",
        voice_description=request.voice_description or "No description",
        species=request.species,
    )

    # Get AI response
    response = ask_gemini(prompt, request.image_base64)

    # Parse JSON from response
    try:
        # Extract JSON from response
        start = response.find("{")
        end = response.rfind("}") + 1
        diagnosis = json.loads(response[start:end])
    except:
        diagnosis = {
            "diagnosis": "Unable to diagnose",
            "severity": "medium",
            "treatment": "Please consult a local veterinarian",
            "medicine_name": "N/A",
            "medicine_dosage": "N/A",
            "follow_up_date": "2026-08-01",
        }

    return diagnosis
