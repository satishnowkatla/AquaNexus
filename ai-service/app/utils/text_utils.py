def extract_json_from_text(text: str) -> dict:
    """Extract JSON object from text response."""
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end != -1:
            import json
            return json.loads(text[start:end])
    except:
        pass
    return {}


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    return text.strip().replace("\n", " ")
