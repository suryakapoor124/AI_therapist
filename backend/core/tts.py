# backend/core/tts.py

import os
from sarvamai import SarvamAI
from dotenv import load_dotenv

# Load env
load_dotenv()
SARVAM_KEY = os.getenv("SARVAM_API_KEY")

if not SARVAM_KEY:
    raise ValueError("SARVAM_API_KEY not found in environment!")

# Initialize Sarvam client
sarvam_client = SarvamAI(api_subscription_key=SARVAM_KEY)


def synthesize_speech(text: str) -> str | None:
    """
    Convert text → speech using SarvamAI.
    Returns base64-encoded audio (string), or None if failed.
    """
    try:
        tts_response = sarvam_client.text_to_speech.convert(
            text=text,
            target_language_code="hi-IN",   # switch to "en-IN" if mostly English
            speaker="anushka",
            model="bulbul:v2"
        )
        return tts_response.audios[0]  
    except Exception as e:
        print(f"[TTS] Error: {e}")
        return None
