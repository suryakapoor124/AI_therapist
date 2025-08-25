import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MODE : str = os.getenv("MODE" , "normal")
    
    CORS_ALLOW_ORIGINS: str = os.getenv("CORS_ALLOW_ORIGINS", "*")
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")
 
    HF_BASE_URL: str = os.getenv("HF_BASE_URL", "https://router.huggingface.co/v1")
    HF_TOKEN: str = os.getenv("HF_TOKEN") 
    HF_MODEL: str = os.getenv("HF_MODEL", "openai/gpt-oss-20b:fireworks-ai")

settings = Settings()

