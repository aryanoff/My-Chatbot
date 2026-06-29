import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        r = await client.get('http://127.0.0.1:8000/health')
        print('Health:', r.json())
        r2 = await client.get('http://127.0.0.1:8000/api/v1/library')
        print('Library GET (should be 401 Unauthorized):', r2.status_code)

if __name__ == '__main__':
    asyncio.run(test())
