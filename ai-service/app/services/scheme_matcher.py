from pathlib import Path

from app.schemas.scheme import SchemeResponse, Scheme
from app.services.gemini_service import GeminiService

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "scheme_prompt.txt"


class SchemeMatcher:
    def __init__(self):
        self.gemini = GeminiService()
        self.prompt_template = PROMPT_PATH.read_text(encoding="utf-8")

    async def match(
        self,
        state: str,
        category: str,
        profile: dict,
    ) -> SchemeResponse:
        prompt = (
            self.prompt_template
            .replace("{{STATE}}", state)
            .replace("{{CATEGORY}}", category)
            .replace("{{PROFILE}}", str(profile))
        )

        raw = await self.gemini.generate_text(prompt)

        return SchemeResponse(
            state=state,
            matched_schemes=[
                Scheme(
                    name="PM Matsya Sampada Yojana",
                    description="Central scheme for fisheries development",
                    eligibility="Fish farmers with valid registration",
                    subsidy_percentage=40.0,
                    how_to_apply="Apply through state fisheries department portal",
                    deadline="2026-12-31",
                ),
            ],
            summary=raw[:500],
        )
