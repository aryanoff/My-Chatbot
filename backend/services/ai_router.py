import json
import asyncio
import httpx
from collections.abc import AsyncGenerator
from backend.config import settings

MODEL_PRIORITIES = {
    "coding": ["deepseek-v4-pro", "gemini-flash", "openrouter-gpt4o", "groq-llama"],
    "reasoning": ["deepseek-v4-pro", "gemini-flash", "openrouter-gpt4o", "groq-llama"],
    "creative": ["openrouter-gpt4o", "gemini-flash", "groq-llama", "deepseek-v4-pro"],
    "factual": ["gemini-flash", "groq-llama", "openrouter-gpt4o", "deepseek-v4-pro"],
    "realtime": ["gemini-flash", "openrouter-gpt4o", "groq-llama", "deepseek-v4-pro"],
    "voice": ["grok-stt", "gemini-flash"],
    "general": ["gemini-flash", "groq-llama", "openrouter-gpt4o", "deepseek-v4-pro"],
}

SYSTEM_PROMPTS = {
    "coding": "You are an expert programmer. Write clean, commented, working code. Always explain what the code does after writing it.",
    "reasoning": "You are a logical reasoning expert. Think step by step. Show your working. Double-check your answer before responding.",
    "creative": "You are a creative writing expert. Be imaginative, engaging, and original. Match the tone and style the user is going for.",
    "factual": "You are a knowledgeable assistant. Give accurate, concise answers. Cite reasoning. If unsure, say so honestly.",
    "general": "You are a helpful, friendly assistant. Be clear and conversational. Keep answers focused and useful.",
    "realtime": "You are a helpful assistant with access to real-time information. Provide accurate and up-to-date answers.",
    "voice": "You are a helpful assistant transcribing and responding to voice input.",
}

# In-memory health status (managed by health_check.py)
healthy_models = {
    "deepseek-v4-pro": True,
    "gemini-flash": True,
    "openrouter-gpt4o": True,
    "groq-llama": True,
    "grok-stt": True,
}

async def classify_task(user_message: str) -> str:
    """Classify the incoming user message into one of the task types."""
    # Using a fast groq llama call for classification
    prompt = f"Classify the following user message into exactly ONE of these categories: coding, reasoning, creative, factual, realtime, voice, general. Return ONLY the category name in lowercase.\n\nMessage: {user_message}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.0,
                    "max_tokens": 10
                },
                timeout=5.0
            )
            response.raise_for_status()
            data = response.json()
            category = data["choices"][0]["message"]["content"].strip().lower()
            if category in MODEL_PRIORITIES:
                return category
    except Exception:
        pass
    
    return "general"

async def call_gemini(messages: list[dict], system_prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        # Convert to Gemini format
        contents = []
        for m in messages:
            role = "model" if m["role"] == "assistant" else "user"
            if m["role"] != "system":
                contents.append({"role": role, "parts": [{"text": m["content"]}]})
            
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": contents
        }
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}",
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

async def call_openrouter(messages: list[dict], system_prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        payload = {
            "model": "openai/gpt-4o",
            "messages": [{"role": "system", "content": system_prompt}] + messages,
        }
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": settings.frontend_url or "http://localhost:3000",
                "X-Title": settings.app_name
            },
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_cloudflare(messages: list[dict], system_prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        payload = {
            "model": "deepseek/deepseek-v4-pro",
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "stream": False
        }
        response = await client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{settings.cloudflare_account_id}/ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.cloudflare_api_token}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_groq(messages: list[dict], system_prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "stream": False
        }
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_grok_stt(audio_url: str) -> str:
    async with httpx.AsyncClient() as client:
        payload = {
            "model": "xai/grok-stt",
            "input": {"url": audio_url}
        }
        response = await client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{settings.cloudflare_account_id}/ai/run",
            headers={
                "Authorization": f"Bearer {settings.cloudflare_api_token}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
        # CF usually returns text in result.text for ASR
        return data.get("result", {}).get("text", "")

async def call_model(model: str, messages: list[dict], system_prompt: str, audio_url: str = None) -> str:
    if model == "grok-stt" and audio_url:
        return await call_grok_stt(audio_url)
    
    if model == "gemini-flash":
        return await call_gemini(messages, system_prompt)
    elif model == "openrouter-gpt4o":
        return await call_openrouter(messages, system_prompt)
    elif model == "deepseek-v4-pro":
        return await call_cloudflare(messages, system_prompt)
    elif model == "groq-llama":
        return await call_groq(messages, system_prompt)
    else:
        return await call_groq(messages, system_prompt)

async def check_quality(response_text: str, user_message: str) -> int:
    """Uses Gemini Flash to rate the answer 1-10."""
    meta_prompt = f"Rate this answer from 1-10 for accuracy, completeness, and helpfulness responding to: '{user_message}'. If score is below 7, return RETRY. If 7 or above, return PASS. Your output MUST be in the format: SCORE: [number]\nRESULT: [PASS/RETRY]\n\nAnswer to rate:\n{response_text}"
    
    try:
        score_response = await call_gemini([{"role": "user", "content": meta_prompt}], "You are a quality assurance judge.")
        lines = score_response.strip().split("\n")
        score = 10
        for line in lines:
            if line.upper().startswith("SCORE:"):
                try:
                    score = int(line.split(":")[1].strip())
                except ValueError:
                    pass
        return score
    except Exception:
        return 10

async def log_usage_db(model: str, response_time_ms: int, retry_triggered: bool):
    """Log usage to SQLite database."""
    from backend.database.connection import AsyncSessionLocal
    from backend.models.orm import AIUsageTracker
    try:
        async with AsyncSessionLocal() as db:
            usage = AIUsageTracker(
                model_name=model,
                response_time_ms=response_time_ms,
                retry_triggered=retry_triggered
            )
            db.add(usage)
            await db.commit()
    except Exception as e:
        print(f"[Warning] Failed to log usage to DB: {e}")

async def get_daily_usage(model: str) -> int:
    from sqlalchemy import select, func
    from datetime import date
    from backend.database.connection import AsyncSessionLocal
    from backend.models.orm import AIUsageTracker
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(func.count()).where(
                    AIUsageTracker.model_name == model,
                    AIUsageTracker.date == date.today()
                )
            )
            return result.scalar()
    except Exception as e:
        print(f"[Warning] Failed to get usage from DB: {e}")
        return 0


async def get_best_response(user_message: str, messages: list[dict], audio_url: str = None) -> tuple[str, str, int]:
    """Orchestrates model selection and quality checking (Claude Looping). Returns (best_response, model_used, tokens)."""
    task_type = await classify_task(user_message) if not audio_url else "voice"
    base_queue = MODEL_PRIORITIES.get(task_type, MODEL_PRIORITIES["general"])
    system_prompt = SYSTEM_PROMPTS.get(task_type, SYSTEM_PROMPTS["general"])
    
    model_queue = []
    # Push heavily used models to the back
    for model in base_queue:
        usage = await get_daily_usage(model)
        if usage > 1000: # Arbitrary daily limit threshold for demonstration
            model_queue.append(model)
        else:
            model_queue.insert(0, model)
    # Reverse so the least used (inserted at 0) stay in relative priority order
    model_queue.reverse()
    
    best_response = None
    attempts = 0
    final_model = "unknown"
    
    import time
    
    # Filter messages to omit system prompt if it's there
    clean_messages = [m for m in messages if m.get("role") != "system"]
    
    for model in model_queue:
        if attempts >= 3:
            break
        if not healthy_models.get(model, True):
            continue
            
        attempts += 1
        start_time = time.time()
        
        try:
            raw_response = await call_model(model, clean_messages, system_prompt, audio_url)
            duration_ms = int((time.time() - start_time) * 1000)
            
            score = await check_quality(raw_response, user_message)
            
            if score >= 7:
                best_response = raw_response
                final_model = model
                asyncio.create_task(log_usage_db(model, duration_ms, False))
                break
            else:
                if not best_response:
                    best_response = raw_response
                    final_model = model
                asyncio.create_task(log_usage_db(model, duration_ms, True))
                continue
                
        except Exception as e:
            print(f"Model {model} failed: {e}")
            continue
            
    if not best_response:
        best_response = "I'm sorry, I encountered an error connecting to my AI providers. Please try again."
        final_model = "error"
        
    tokens = len(best_response.split())
    return best_response, final_model, tokens

async def stream_to_user(content: str) -> AsyncGenerator[str, None]:
    """Simulates streaming for a pre-generated string."""
    chunk_size = 8
    for i in range(0, len(content), chunk_size):
        yield content[i:i+chunk_size]
        await asyncio.sleep(0.01)
