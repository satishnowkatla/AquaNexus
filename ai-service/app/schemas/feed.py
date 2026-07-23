from pydantic import BaseModel
from typing import Optional


class FeedRequest(BaseModel):
    species: str = "shrimp"
    area_acres: float = 1.0
    stocking_density: int = 50000
    stocking_days: int = 30


class FeedResponse(BaseModel):
    morning_kg: float
    evening_kg: float
    total_daily_kg: float
    feed_type: str
    feed_grade: str
    daily_cost: float
    notes: Optional[str] = ""
