from fastapi import APIRouter , UploadFile , File , Form
from pydantic import BaseModel
import os


from core.crisis import check_crisis
from core.gpt import generate_reply


router = APIRouter(prefix="/chat", tags=["chat"])


class Text(BaseModel):
    message: str
    session_id: str | None= None



@router.post("/text")
def chat_text(payload: Text):

    
    c = check_crisis(payload.message)

   
    reply = generate_reply(payload.message, crisis=c["crisis"])

    
    return {
        "reply_text": reply,
        "reply_audio_url": None,
        "crisis": c["crisis"],
        "banner": c["banner"],
        "session_id": payload.session_id,
    }



@router.post("/voice")
async def chat_voice(
    audio: UploadFile = File(...) , 
    session_id: str | None = Form(default=None)
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
        "session_id": session_id,
        "saved_path": file_path
    }
