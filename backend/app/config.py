from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

RACINE = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=RACINE / ".env", extra="ignore")

    app_name: str = "HERMANN AI"
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"


settings = Settings()
