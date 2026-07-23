from pathlib import Path

from app.schemas.market import MarketResponse, PricePoint
from app.services.gemini_service import GeminiService

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "market_prompt.txt"


class PriceAnalyzer:
    def __init__(self):
        self.gemini = GeminiService()
        self.prompt_template = PROMPT_PATH.read_text(encoding="utf-8")

    async def analyze(
        self,
        species: str,
        region: str,
        quantity_kg: float,
    ) -> MarketResponse:
        prompt = (
            self.prompt_template
            .replace("{{SPECIES}}", species)
            .replace("{{REGION}}", region)
            .replace("{{QUANTITY}}", str(quantity_kg))
        )

        raw = await self.gemini.generate_text(prompt)

        return MarketResponse(
            species=species,
            region=region,
            current_price=150.0,
            price_trend="stable",
            prediction=raw[:300],
            price_points=[
                PricePoint(date="2026-07-21", price=150.0),
                PricePoint(date="2026-07-22", price=155.0),
            ],
            recommendation="Hold" if "hold" in raw.lower() else "Sell",
        )
