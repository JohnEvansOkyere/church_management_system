from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/church_cms"
    SECRET_KEY: str = "change-this-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Comma-separated list of browser origins (Vercel preview + production, local dev)
    # Example: https://church-cms.vercel.app,https://church-cms-git-main-org.vercel.app,http://localhost:5173
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@livingsspring.org"

    SMS_PROVIDER: str = "arkesel"

    ARKESEL_API_KEY: str = ""
    ARKESEL_SENDER_ID: str = "LivingSpring"
    ARKESEL_BASE_URL: str = "https://sms.arkesel.com"

    MOOLRE_VAS_KEY: str = ""
    MOOLRE_SENDER_ID: str = "LivingSpring"
    MOOLRE_BASE_URL: str = "https://api.moolre.com"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
