import asyncio
import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.abspath('.'))

from backend.database.connection import engine, Base
import httpx
from backend.main import app
from httpx import ASGITransport

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def test_auth():
    await init_db()
    
    from backend.database.connection import AsyncSessionLocal
    from sqlalchemy import delete
    from backend.models.orm import OTPCode, User
    async with AsyncSessionLocal() as session:
        await session.execute(delete(OTPCode).where(OTPCode.phone == "+12345678901"))
        await session.execute(delete(User).where(User.phone == "+12345678901"))
        await session.commit()
    
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        import unittest.mock
        print("Testing sending OTP...")
        with unittest.mock.patch("random.randint", return_value=123456):
            response = await ac.post("/api/v1/auth/phone/send-otp", json={"phone": "+12345678901"})
            print("Send OTP Response:", response.status_code, response.json())
        
        print("Testing verifying valid OTP...")
        verify_response_valid = await ac.post("/api/v1/auth/phone/verify-otp", json={"phone": "+12345678901", "otp": "123456"})
        print("Verify OTP Response (valid):", verify_response_valid.status_code, verify_response_valid.json())

        # Test rate limit (max 3)
        # Note: the first request above counts as 1. So we send 2 more to hit 3, then the 4th will be rejected.
        await ac.post("/api/v1/auth/phone/send-otp", json={"phone": "+12345678901"})
        await ac.post("/api/v1/auth/phone/send-otp", json={"phone": "+12345678901"})
        response4 = await ac.post("/api/v1/auth/phone/send-otp", json={"phone": "+12345678901"})
        print("Send OTP Rate Limit Test (4th request):", response4.json())

        print("Testing verifying invalid OTP...")
        verify_response_invalid = await ac.post("/api/v1/auth/phone/verify-otp", json={"phone": "+12345678901", "otp": "000000"})
        print("Verify OTP Response (invalid):", verify_response_invalid.json())

if __name__ == '__main__':
    asyncio.run(test_auth())
