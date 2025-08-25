from fastapi import APIRouter , UploadFile , File , Form
from pydantic import BaseModel
import os

from core.crisis import check_crisis
from core.gpt import generate_reply   
from core.stt import transcribe_audio
from core.tts import synthesize_speech

router = APIRouter(prefix="/chat", tags=["chat"])

class chat(BaseModel):
    user_input: str
    is_first: bool = False


@router.post("/text")
async def chat_text(payload: chat):
    """
    Handles text input from user:
    - run crisis detection
    - generate GPT reply
    - generate TTS (base64)
    - package JSON response
    """
    crisis_result = check_crisis(payload.user_input)
    crisis_flag = crisis_result["crisis"]

    reply_text = generate_reply(payload.user_input, crisis=crisis_flag, is_first=payload.is_first)

    reply_audio_base64 = synthesize_speech(reply_text)

    return {
        "reply_text": reply_text,
        "reply_audio_base64": reply_audio_base64,  
        "crisis": crisis_flag,
        "banner": crisis_result["banner"],
        "session_id": None
    }


@router.post("/voice")
async def chat_voice(file: UploadFile = File(...), is_first: bool = False):
    """
    Handles voice input:
    - transcribe audio -> text
    - crisis detection
    - GPT reply
    - generate TTS (base64)
    - returns structured JSON
    """
    user_text = transcribe_audio(file)

    if not user_text:
        return {
            "reply_text": "Sorry, I couldn’t understand the audio. Could you try again?",
            "reply_audio_base64": None,
            "crisis": False,
            "banner": None,
            "session_id": None
        }

    crisis_result = check_crisis(user_text)
    crisis_flag = crisis_result["crisis"]

    reply_text = generate_reply(user_text, crisis=crisis_flag, is_first=is_first)

    # 🔹 generate TTS
    reply_audio_base64 = synthesize_speech(reply_text)

    return {
        "reply_text": reply_text,
        "reply_audio_base64": reply_audio_base64,  
        "crisis": crisis_flag,
        "banner": crisis_result["banner"],
        "session_id": None
    }
