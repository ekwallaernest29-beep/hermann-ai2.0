from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "HERMANN AI"
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"


settings = Settings()
