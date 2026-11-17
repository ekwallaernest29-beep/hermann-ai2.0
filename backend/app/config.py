from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

RACINE = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=RACINE / ".env", extra="ignore")

    app_name: str = "HERMANN AI"
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"
    access_code: str = ""
    groq_api_key: str = ""
    gemini_api_key: str = ""
    gemini_model: str = "gemini-flash-latest"
    groq_stt_model: str = "whisper-large-v3-turbo"


settings = Settings()
