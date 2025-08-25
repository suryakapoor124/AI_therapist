from fastapi import FastAPI
from config import settings
from fastapi.middleware.cors import CORSMiddleware
from config import Settings
from api import chat

MODE = "normal"



app = FastAPI(
    title="Ai therapist",
    description="Entry point for Ai therapist api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health")
async def home():
    return {"status": "up" , "mode": Settings.MODE}


app.include_router(chat.router)