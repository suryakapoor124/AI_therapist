import os
from dotenv import load_dotenv


load_dotenv()

class Settings:
    MODE : str = os.getenv("MODE" , "normal")


    CORS_ALLOW_ORIGINS: str = os.getenv("CORS_ALLOW_ORIGINS", "*")
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./data")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
  
   

    HF_BASE_URL: str = os.getenv("HF_BASE_URL", "https://router.huggingface.co/v1")
    HF_TOKEN: str = os.getenv("HF_TOKEN", "") 
    HF_MODEL: str = os.getenv("HF_MODEL", "openai/gpt-oss-20b:fireworks-ai")

settings = Settings()

