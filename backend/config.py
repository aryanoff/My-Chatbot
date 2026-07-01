from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Zaara AI"
    debug: bool = False
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    database_url: str = "sqlite+aiosqlite:///./zaara_ai.db"
    redis_url: str = "redis://localhost:6379/0"

    groq_api_key: str = ""
    gemini_api_key: str = ""
    openrouter_api_key: str = ""
    cloudflare_api_token: str = ""
    cloudflare_account_id: str = ""
    cors_origins: str = "http://localhost:3000,https://zaara-ai.vercel.app"
    frontend_url: str = "http://localhost:3000"

    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""

    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    fast2sms_api_key: str = ""

    rate_limit_per_minute: int = 60
    max_upload_size_mb: int = 25

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def async_database_url(self) -> str:
        """
        Converts Railway's DATABASE_URL (postgres://...) to the async-compatible
        format (postgresql+asyncpg://...) required by SQLAlchemy asyncpg driver.
        """
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
