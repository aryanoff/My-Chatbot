import os
from collections.abc import AsyncGenerator

from litellm import acompletion

from backend.config import settings

MODEL_MAP = {
    "meta-ai": "groq/llama-3.3-70b-versatile",
    "gpt": "gpt-4o",
    "claude": "claude-3-5-sonnet-20241022",
    "gemini": "gemini/gemini-1.5-pro",
    "grok": "xai/grok-beta",
}

DEFAULT_SYSTEM = (
    "You are Zaara AI, a premium intelligent assistant. "
    "Provide clear, accurate, and helpful responses with excellent formatting. "
    "Use markdown when appropriate."
)


class MetaAIService:
    def __init__(self) -> None:
        pass

    def resolve_model(self, model_key: str) -> str:
        return MODEL_MAP.get(model_key, "groq/llama-3.3-70b-versatile")

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        model: str = "meta-ai",
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> AsyncGenerator[str, None]:
        resolved = self.resolve_model(model)
        try:
            stream = await acompletion(
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
        except Exception as e:
            yield f"Error from LLM Provider: {str(e)}\n\nPlease ensure your API keys (GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, XAI_API_KEY) are set in .env."

    async def complete(
        self,
        messages: list[dict[str, str]],
        model: str = "meta-ai",
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> tuple[str, int]:
        resolved = self.resolve_model(model)
        try:
            response = await acompletion(
                model=resolved,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            content = response.choices[0].message.content or ""
            tokens = response.usage.total_tokens if response.usage else len(content.split())
            return content, tokens
        except Exception as e:
            return f"Error from LLM Provider: {str(e)}\n\nPlease ensure your API keys (GROQ_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, XAI_API_KEY) are set in .env.", 0


meta_ai_service = MetaAIService()
