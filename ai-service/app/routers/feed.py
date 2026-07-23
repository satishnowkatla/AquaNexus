from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import ask_gemini
import json

router = APIRouter()


class FeedRequest(BaseModel):
    species: str = "shrimp"
    area_acres: float = 1.0
    stocking_density: int = 50000
    stocking_days: int = 30


@router.post("/calculate")
def calculate_feed(request: FeedRequest):
    # Load prompt
    with open("app/prompts/feed_prompt.txt", "r") as f:
        prompt_template = f.read()

    prompt = prompt_template.format(
        species=request.species,
        area_acres=request.area_acres,
        stocking_density=request.stocking_density,
        stocking_days=request.stocking_days,
    )

    # Get AI response
    response = ask_gemini(prompt)

    # Parse JSON from response
    try:
        start = response.find("{")
        end = response.rfind("}") + 1
        schedule = json.loads(response[start:end])
    except:
        # Fallback calculation
        total_shrimp = request.area_acres * request.stocking_density
        feed_kg = total_shrimp * 0.0005  # 5% body weight
        schedule = {
            "morning_kg": round(feed_kg / 2, 2),
            "evening_kg": round(feed_kg / 2, 2),
            "total_daily_kg": round(feed_kg, 2),
            "feed_type": "Sinking pellets",
            "feed_grade": "32% protein",
            "daily_cost": round(feed_kg * 75, 2),
            "notes": "Adjust based on water temperature and weather",
        }

    return schedule
