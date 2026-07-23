import base64
from pathlib import Path

from app.schemas.disease import DiseaseResponse, Diagnosis
from app.services.gemini_service import GeminiService

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "disease_prompt.txt"


class DiseaseDetector:
    def __init__(self):
        self.gemini = GeminiService()
        self.prompt_template = PROMPT_PATH.read_text(encoding="utf-8")

    async def detect(
        self,
        image_bytes: bytes,
        species: str,
        symptoms: str | None = None,
    ) -> DiseaseResponse:
        prompt = self.prompt_template.replace("{{SPECIES}}", species)
        if symptoms:
            prompt = prompt.replace("{{SYMPTOMS}}", symptoms)
        else:
            prompt = prompt.replace("{{SYMPTOMS}}", "Not provided")

        raw = await self.gemini.generate_with_image(prompt, image_bytes)

        diagnosis = Diagnosis(
            disease_name=_extract_field(raw, "Disease"),
            confidence=0.85,
            description=_extract_field(raw, "Description"),
            treatment=_extract_field(raw, "Treatment"),
            prevention=_extract_field(raw, "Prevention"),
        )

        return DiseaseResponse(
            species=species,
            diagnoses=[diagnosis],
            severity="moderate",
            recommended_action=diagnosis.treatment,
        )


def _extract_field(text: str, field: str) -> str:
    marker = f"{field}:"
    if marker.lower() in text.lower():
        idx = text.lower().index(marker.lower())
        return text[idx + len(marker) :].split("\n")[0].strip()
    return text[:200].strip()
