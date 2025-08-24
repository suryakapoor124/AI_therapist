# backend/core/gpt.py
from __future__ import annotations

from typing import Optional
from openai import OpenAI
from config import settings

# --- Prompts (kept tight and purposeful) ---

GREETING_INSTRUCTION = (
    "If this is the first message, greet the user warmly in 1–2 short lines, "
    "set a calm tone, and ask exactly one open, gentle question to start."
)

BASE_PERSONA = (
    "You are an AI therapist. Be emotionally aware, precise, and concise (1–3 short sentences). "
    "Reflect feelings, avoid clichés, and ask thoughtful questions sparingly."
)

CRISIS_SYSTEM = (
    "You are a crisis-support therapist. Prioritize safety, validation, and calm, brief guidance. "
    "If the user is in immediate danger, advise contacting local emergency services."
)

# --- Client singleton ---

_client: Optional[OpenAI] = None

def _get_client() -> OpenAI:
    global _client
    if _client is None:
        # create even if token missing; we'll fail gracefully in generate_reply
        _client = OpenAI(
            base_url=settings.HF_BASE_URL,
            api_key=settings.HF_TOKEN or "missing"
        )
    return _client

# --- Status helper for quick debugging ---

def gpt_status() -> dict:
    """Quick introspection to verify config without making a network call."""
    return {
        "configured": bool(settings.HF_TOKEN),
        "base_url": settings.HF_BASE_URL,
        "model": settings.HF_MODEL,
    }

# --- Main entry point ---

def generate_reply(user_text: str, *, crisis: bool = False, is_first: bool = False) -> str:
    """
    Returns a short therapist-style reply.
    - crisis=True  -> uses crisis prompt
    - is_first=True -> prepends greeting instruction
    """
    if not user_text or not user_text.strip():
        return "I’m here with you. What would you like to share?"

    # Choose system prompt
    if crisis:
        system_prompt = CRISIS_SYSTEM
    else:
        system_prompt = f"{GREETING_INSTRUCTION}\n\n{BASE_PERSONA}" if is_first else BASE_PERSONA

    # If token missing, fail soft with a supportive fallback
    if not settings.HF_TOKEN:
        return "I’m with you. Tell me a bit more so I can understand what matters most right now."

    client = _get_client()

    try:
        resp = client.chat.completions.create(
            model=settings.HF_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text},
            ],
            temperature=0.6,
            max_tokens=220,
        )
        text = (resp.choices[0].message.content or "").strip()
        return text or "I’m here and listening."
    except Exception:
        # Soft fallback on any provider/network error
        if crisis:
            return ("I’m really glad you told me. You’re not alone. "
                    "If you’re in immediate danger, please contact your local emergency number. "
                    "Would it help to share what feels most urgent right now?")
        return "I’m here with you. What feels heaviest at the moment?"
