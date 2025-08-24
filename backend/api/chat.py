from fastapi import APIRouter , UploadFile , File , Form
from pydantic import BaseModel
import os

from core.crisis import check_crisis


router = APIRouter(prefix="/chat", tags=["chat"])


class Text(BaseModel):
    message: str



@router.post("/text")
def chat_text(payload: Text):

    
    c = check_crisis(payload.message)
    

    
    return {
        "reply_text": reply,
        "reply_audio_url": None,
        "crisis": c["crisis"],
        "banner": c["banner"]
    }



@router.post("/voice")
async def chat_voice(
    audio: UploadFile = File(...)
):  
         # Make sure uploads folder exists
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # Save the uploaded file
    file_path = os.path.join(upload_dir, audio.filename)
    with open(file_path, "wb") as f:
        f.write(await audio.read())

    return {
        "reply_text": "This is a placeholder reply from voice input.",
        "reply_audio_url": None,
        "crisis": False,
        "banner": None,
        "saved_path": file_path
    }
