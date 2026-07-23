from pathlib import Path

from app.schemas.advisor import ChatResponse
from app.services.gemini_service import GeminiService

PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "advisor_prompt.txt"


class RAGEngine:
    def __init__(self):
        self.gemini = GeminiService()
        self.system_prompt = PROMPT_PATH.read_text(encoding="utf-8")
        self.knowledge_base: list[str] = []

    async def chat(
        self,
        query: str,
        history: list[dict] | None = None,
        context: str | None = None,
    ) -> ChatResponse:
        retrieved = self._retrieve(query)
        context_block = context or "\n".join(retrieved)

        full_prompt = (
            f"{self.system_prompt}\n\n"
            f"Relevant knowledge:\n{context_block}\n\n"
            f"User question: {query}"
        )

        messages = history or []
        raw = await self.gemini.generate_chat(
            messages=[{"role": "user", "content": full_prompt}]
            + [{"role": m["role"], "content": m["content"]} for m in messages],
        )

        return ChatResponse(
            answer=raw,
            sources=retrieved[:3],
        )

    def _retrieve(self, query: str) -> list[str]:
        query_lower = query.lower()
        scored = []
        for doc in self.knowledge_base:
            overlap = sum(1 for word in query_lower.split() if word in doc.lower())
            scored.append((overlap, doc))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:5]]

    def index_document(self, text: str) -> None:
        chunks = [text[i : i + 500] for i in range(0, len(text), 500)]
        self.knowledge_base.extend(chunks)
