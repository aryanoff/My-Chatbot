import asyncio
from backend.services.ai_router import healthy_models

async def ping_model(model_name: str) -> bool:
    """Pings the model to check if it's healthy."""
    # Since we are using standard endpoints, a simple network or quick dummy call could be made.
    # To keep it lightweight and not use tokens for health checking constantly, we can do a tiny system prompt.
    # Wait, the user said: "ping all 5 AI endpoints with a tiny test message"
    from backend.services.ai_router import call_model
    try:
        if model_name == "grok-stt":
            await asyncio.wait_for(
                call_model(model_name, [], "", audio_url="https://example.com/test.mp3"), 
                timeout=10.0
            )
        else:
            await asyncio.wait_for(
                call_model(model_name, [{"role": "user", "content": "ping"}], "Reply with pong"), 
                timeout=10.0
            )
        return True
    except Exception as e:
        print(f"Health check failed for {model_name}: {e}")
        return False

async def run_health_checks():
    """Runs health checks on all models."""
    for model in healthy_models.keys():
        is_healthy = await ping_model(model)
        healthy_models[model] = is_healthy

async def health_check_loop():
    """Background loop to re-check unhealthy models every 5 minutes."""
    while True:
        await asyncio.sleep(300) # 5 minutes
        for model, is_healthy in list(healthy_models.items()):
            if not is_healthy:
                print(f"Re-checking unhealthy model {model}...")
                healthy_models[model] = await ping_model(model)
                if healthy_models[model]:
                    print(f"Model {model} is back online.")
