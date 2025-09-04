from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
import uuid
from typing import Optional

from core.crisis import check_crisis
from core.gpt import generate_reply
from core.stt import transcribe_audio
from core.tts import synthesize_speech
from service.cache import get_history, append_message, session_exists, maybe_update_summary, get_summary


router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    user_input: str
    is_first: bool = False
    session_id: Optional[str] = None



@router.post("/text")
async def chat_text(payload: ChatRequest):
    """Handles text input from user"""


    if payload.session_id and session_exists(payload.session_id):
        is_first = False
        session_id = payload.session_id
    else:
        is_first = payload.is_first
        session_id = str(uuid.uuid4())

    crisis_result = check_crisis(payload.user_input)
    crisis_flag = crisis_result["crisis"]

    append_message(session_id, "user", payload.user_input)

    history = get_history(session_id)
    summary = get_summary(session_id)
    if summary:
        augmented_history = [{"role": "system", "content": summary}] + history
    else:
        augmented_history = history

    reply_text = generate_reply(
        payload.user_input,
        crisis=crisis_flag,
        is_first=is_first,
        history=augmented_history,
    )

    append_message(session_id, "assistant", reply_text)
    maybe_update_summary(session_id)

    reply_audio_base64 = synthesize_speech(reply_text)

    return {
        "reply_text": reply_text,
        "reply_audio_base64": reply_audio_base64,
        "crisis": crisis_flag,
        "banner": crisis_result["banner"],
        "session_id": session_id,
    }


@router.post("/voice")
async def chat_voice(
    file: UploadFile = File(...),
    is_first: bool = Form(False),
    session_id: Optional[str] = Form(None),
):
    """Handles voice input"""

    if session_id and session_exists(session_id):
        is_first = False
    else:
        is_first = is_first
        session_id = str(uuid.uuid4())

    user_text = transcribe_audio(file)

    if not user_text:
        return {
            "reply_text": "Sorry, I couldn’t understand the audio. Could you try again?",
            "reply_audio_base64": None,
            "crisis": False,
            "banner": None,
            "session_id": session_id,
        }

    crisis_result = check_crisis(user_text)
    crisis_flag = crisis_result["crisis"]

    append_message(session_id, "user", user_text)

    history = get_history(session_id)
    summary = get_summary(session_id)
    if summary:
        augmented_history = [{"role": "system", "content": summary}] + history
    else:
        augmented_history = history

    reply_text = generate_reply(
        user_text,
        crisis=crisis_flag,
        is_first=is_first,
        history=augmented_history,
    )

    append_message(session_id, "assistant", reply_text)
    maybe_update_summary(session_id)

    reply_audio_base64 = synthesize_speech(reply_text)


    return {
        "reply_text": reply_text,
        "reply_audio_base64": reply_audio_base64,
        "crisis": crisis_flag,
        "banner": crisis_result["banner"],
        "session_id": session_id,
    }