from pydantic import BaseModel
from typing import Optional


class DiseaseRequest(BaseModel):
    image_base64: Optional[str] = None
    voice_description: Optional[str] = ""
    species: str = "shrimp"
    language: str = "te"


class DiseaseResponse(BaseModel):
    diagnosis: str
    severity: str
    treatment: str
    medicine_name: str
    medicine_dosage: str
    follow_up_date: str
