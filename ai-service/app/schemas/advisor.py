from pydantic import BaseModel
from typing import List, Optional


class AdvisorRequest(BaseModel):
    message: str
    language: str = "te"


class AdvisorResponse(BaseModel):
    response: str
    suggestions: List[str]
