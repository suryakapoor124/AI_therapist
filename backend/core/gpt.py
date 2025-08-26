# backend/core/gpt.py
from __future__ import annotations

from typing import Optional
from openai import OpenAI
from config import settings

# --- Prompts ---

BASE_PERSONA = (
    "You are an Female AI therapist. Be emotionally aware, precise, and concise. "
    "Always keep your response under 3 short sentences and under 250 characters. "
    "Reflect feelings, avoid clichés, and ask at most one thoughtful question."
)

GREETING_PERSONA = (
    "If this is the first message, greet warmly in 1–2 short lines and ask exactly one open, gentle question. "
    "Keep responses under 4-5 short sentences and under 500 characters.\n\n"
    + BASE_PERSONA
)

CRISIS_PERSONA = (
    "You are a crisis-support therapist. Prioritize safety, validation, and calm, brief guidance. "
    "If the user is in immediate danger, advise contacting local emergency services and india. "
    "Always keep your response under 3 short sentences and under 250 characters."
)

# --- Client singleton ---

_client: Optional[OpenAI] = None

def _get_client() -> OpenAI:
    """Return a shared OpenAI client configured for HuggingFace router."""
    global _client
    if _client is None:
        _client = OpenAI(
            base_url=settings.HF_BASE_URL,
            api_key=settings.HF_TOKEN or "missing"
        )
    return _client

def gpt_status() -> dict:
    """Quick check to verify GPT config."""
    return {
        "configured": bool(settings.HF_TOKEN),
        "base_url": settings.HF_BASE_URL,
        "model": settings.HF_MODEL,
    }

# --- Main reply generator ---

def generate_reply(
        user_text: str,
          *,
        crisis: bool = False,
        is_first: bool = False,
        history: list[dict] | None = None, # added history to receive history
    ) -> str:

    """Generate a therapist-style reply from user input."""
    if not user_text or not user_text.strip():
        return "I’m here with you. What would you like to share?"

    # Pick system prompt
    if crisis:
        system_prompt = CRISIS_PERSONA
    elif is_first:
        system_prompt = GREETING_PERSONA
    else:
        system_prompt = BASE_PERSONA

    # If no token, soft fallback
    if not settings.HF_TOKEN:
        return "I’m here with you. What feels heaviest right now?"

    try:
        client = _get_client()
        # create message list
        messages = [{"role": "system", "content": system_prompt}]
        # append history if any
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_text}) # append user message

        # call HF endpoint
        resp = client.chat.completions.create(
            model=settings.HF_MODEL,
            messages=messages,
        )
        content = resp.choices[0].message.content
        if not content:
            return "I’m here with you. Could you tell me a bit more about what you’re feeling?"
        return content.strip()

    except Exception:
        import traceback
        print("[GPT ERROR] Exception during completion:")
        traceback.print_exc()

        if crisis:
            return (
                "I’m really glad you told me. You’re not alone. "
                "If you’re in immediate danger, please contact your local emergency number. "
                "Would it help to share what feels most urgent right now?"
            )
        return "I’m here with you. What feels heaviest at the moment?"
