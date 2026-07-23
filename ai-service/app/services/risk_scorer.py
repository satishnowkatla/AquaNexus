from app.schemas.insurance import InsuranceResponse, RiskFactor


class RiskScorer:
    def score(
        self,
        farm_data: dict,
        history: list[dict] | None = None,
    ) -> InsuranceResponse:
        area = farm_data.get("area_acres", 1.0)
        species_count = farm_data.get("species_count", 1)
        has_history = bool(history)

        base_risk = 50.0
        if area > 5:
            base_risk -= 10
        if species_count > 2:
            base_risk += 15
        if has_history:
            base_risk -= 10

        risk_score = max(0.0, min(100.0, base_risk))

        factors = [
            RiskFactor(factor="Pond Area", impact="negative" if area > 5 else "positive", weight=0.3),
            RiskFactor(factor="Species Diversity", impact="negative" if species_count > 2 else "positive", weight=0.3),
            RiskFactor(factor="Historical Claims", impact="positive" if has_history else "negative", weight=0.2),
            RiskFactor(factor="Location", impact="neutral", weight=0.2),
        ]

        premium_estimate = area * 500 * (risk_score / 100)

        return InsuranceResponse(
            risk_score=round(risk_score, 1),
            risk_level="high" if risk_score > 70 else "medium" if risk_score > 40 else "low",
            premium_estimate=round(premium_estimate, 2),
            factors=factors,
            recommendation="Consider upgrading farm infrastructure to lower risk profile.",
        )
