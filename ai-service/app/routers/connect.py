from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AggregateRequest(BaseModel):
    cooperative_id: str


@router.post("/aggregate")
def aggregate_data(request: AggregateRequest):
    # This is a simple aggregation endpoint
    # In production, this would fetch from Supabase and aggregate

    return {
        "cooperative_id": request.cooperative_id,
        "total_members": 25,
        "active_ponds": 45,
        "total_area_acres": 120.5,
        "alerts": [
            {"title": "Weather Alert", "message": "Heavy rain expected", "priority": "high"},
            {"title": "Market Update", "message": "Shrimp prices up 5%", "priority": "low"},
        ],
    }
