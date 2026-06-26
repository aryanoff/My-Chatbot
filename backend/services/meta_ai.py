import os
from collections.abc import AsyncGenerator

from groq import AsyncGroq

from backend.config import settings

MODEL_MAP = {
    "meta-ai": "llama-3.3-70b-versatile",
    "gpt": "llama-3.3-70b-versatile",
    "claude": "llama-3.3-70b-versatile",
    "gemini": "llama-3.1-8b-instant",
    "grok": "llama-3.1-8b-instant",
}

DEFAULT_SYSTEM = (
    "You are Zaara AI, a premium intelligent assistant. "
    "Provide clear, accurate, and helpful responses with excellent formatting. "
    "Use markdown when appropriate."
)


class MetaAIService:
    def __init__(self) -> None:
        api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY", "")
        # Reject obvious placeholders
        if api_key and api_key.startswith("gsk_"):
            self.client = AsyncGroq(api_key=api_key)
        else:
            self.client = None
            if api_key:
                print(f"[WARNING] GROQ_API_KEY looks like a placeholder ('{api_key[:20]}...'). Get a real key at https://console.groq.com/keys")

    def resolve_model(self, model_key: str) -> str:
        return MODEL_MAP.get(model_key, "llama-3.3-70b-versatile")

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        model: str = "meta-ai",
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> AsyncGenerator[str, None]:
        if not self.client:
            yield "Zaara AI needs a Groq API key to work. Get one free at https://console.groq.com/keys and add it to your .env file as GROQ_API_KEY=gsk_..."
            return

        resolved = self.resolve_model(model)
        stream = await self.client.chat.completions.create(
            model=resolved,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    async def complete(
        self,
        messages: list[dict[str, str]],
        model: str = "meta-ai",
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> tuple[str, int]:
        if not self.client:
            return "Zaara AI needs a Groq API key to work. Get one free at https://console.groq.com/keys and add it to your .env file as GROQ_API_KEY=gsk_...", 0

        resolved = self.resolve_model(model)
        response = await self.client.chat.completions.create(
            model=resolved,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = response.choices[0].message.content or ""
        tokens = response.usage.total_tokens if response.usage else len(content.split())
        return content, tokens


meta_ai_service = MetaAIService()
