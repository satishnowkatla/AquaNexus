from app.schemas.voice import VoiceResponse


class VoiceProcessor:
    def __init__(self):
        pass

    async def transcribe(
        self,
        audio_bytes: bytes,
        language: str = "en",
    ) -> VoiceResponse:
        return VoiceResponse(
            text="[Transcription requires speech-to-text model integration]",
            language=language,
            confidence=0.0,
            intent=None,
        )
