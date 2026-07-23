import google.generativeai as genai
from app.config import GOOGLE_GEMINI_API_KEY

genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")


def ask_gemini(prompt: str, image_base64: str = None) -> str:
    """Send prompt (and optional image) to Gemini and get response."""
    if image_base64:
        import base64

        image_data = base64.b64decode(image_base64)
        response = model.generate_content(
            [prompt, {"mime_type": "image/jpeg", "data": image_data}]
        )
    else:
        response = model.generate_content(prompt)

    return response.text
