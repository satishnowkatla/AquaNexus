from app.schemas.feed import FeedResponse, FeedBreakdown

SPECIES_FEED_RATES = {
    "rohu": {"fcr": 1.8, "protein_pct": 30.0, "cost_per_kg": 65.0},
    "catla": {"fcr": 1.9, "protein_pct": 28.0, "cost_per_kg": 62.0},
    "hilsa": {"fcr": 2.0, "protein_pct": 35.0, "cost_per_kg": 80.0},
    "pangasius": {"fcr": 1.6, "protein_pct": 26.0, "cost_per_kg": 55.0},
    "tilapia": {"fcr": 1.5, "protein_pct": 28.0, "cost_per_kg": 60.0},
    "shrimp": {"fcr": 1.2, "protein_pct": 38.0, "cost_per_kg": 95.0},
}

GROWTH_PHASE_MULTIPLIER = {
    "nursery": 0.3,
    "growout": 1.0,
    "finisher": 1.2,
}


class FeedCalculator:
    def calculate(
        self,
        species: str,
        weight_kg: float,
        count: int,
        growth_phase: str,
    ) -> FeedResponse:
        species_key = species.lower()
        rates = SPECIES_FEED_RATES.get(species_key, SPECIES_FEED_RATES["rohu"])
        phase_mult = GROWTH_PHASE_MULTIPLIER.get(growth_phase, 1.0)

        daily_feed_kg = weight_kg * rates["fcr"] * phase_mult / 30.0 * count
        protein_kg = daily_feed_kg * rates["protein_pct"] / 100.0
        daily_cost = daily_feed_kg * rates["cost_per_kg"]

        return FeedResponse(
            species=species,
            daily_feed_kg=round(daily_feed_kg, 2),
            protein_required_kg=round(protein_kg, 2),
            estimated_daily_cost=round(daily_cost, 2),
            breakdown=FeedBreakdown(
                fcr=rates["fcr"],
                protein_percentage=rates["protein_pct"],
                cost_per_kg_feed=rates["cost_per_kg"],
                phase_multiplier=phase_mult,
            ),
            recommendation=f"Feed {round(daily_feed_kg, 2)} kg daily in 2-3 split meals.",
        )
