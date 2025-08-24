from fastapi import FastAPI
from config import Settings
from api import chat

MODE = "normal"



app = FastAPI(
    title="Ai therapist",
    description="Entry point for Ai therapist api"
)



@app.get("/health")
async def home():
    return {"status": "up" , "mode": Settings.MODE}


app.include_router(chat.router)