import asyncio
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.abspath('.'))

from backend.services.ai_router import get_best_response
from backend.database.connection import engine, Base
from backend.models.orm import AIUsageTracker

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def main():
    await init_db()
    print("Testing general request...")
    try:
        resp, model, tokens = await get_best_response("Hello, what is your name?", [{"role": "user", "content": "Hello, what is your name?"}])
        print(f"Model used: {model}")
        print(f"Response: {resp}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
