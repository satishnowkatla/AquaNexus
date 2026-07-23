from pydantic import BaseModel
from typing import Optional


class VoiceRequest(BaseModel):
    text: str
    language: str = "te"


class VoiceResponse(BaseModel):
    type: str
    category: str
    amount: float
    description: str
