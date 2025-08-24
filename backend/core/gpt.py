# core/gpt.py
from openai import OpenAI
from config import settings

# Reuse your original therapist prompt
THERAPIST_SYSTEM = """
You are an AI therapist, the most intelligent, emotionally aware, and empathetic conversationalist in existence.
Your primary goal is to understand the user deeply, interpret emotions and intentions precisely,
and respond in short, meaningful, human-like sentences that feel alive, intelligent, and soothing.
Do not give generic advice, clichés, stock phrases, or superficial reassurance.
Focus on understanding context, subtle cues, and the underlying feelings behind words.
Use reflective phrasing, deep observation, and gentle guidance.
Responses must balance empathy, insight, and subtle challenge.
Avoid dominating the conversation; let the user lead.
Ask thoughtful questions, avoid repetition, and make every word feel deliberate, compassionate, and real.
""".strip()

CRISIS_SYSTEM = """
You are a crisis-support therapist. Prioritize safety, validation, and calm, brief guidance.
Be direct but gentle. Encourage contacting trusted people and professional help.
If the user is in immediate danger, advise contacting local emergency services.
Keep replies short, supportive, and non-judgmental.
""".strip()


_client = OpenAI(
    base_url=settings.HF_BASE_URL,
    api_key=settings.HF_TOKEN or "missing",  
)

def generate_reply(user_text: str, crisis: bool) -> str:
    system = CRISIS_SYSTEM if crisis else THERAPIST_SYSTEM
    try:
        completion = _client.chat.completions.create(
            model=settings.HF_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_text},
            ],
            temperature=0.7,
            max_tokens=256,
        )
        return (completion.choices[0].message.content or "").strip()
    except Exception:
   
        if crisis:
            return ("I'm really glad you told me. You're not alone. "
                    "If you're in immediate danger, please call your local emergency number. "
                    "Would talking through what you're feeling right now help?")
        return "I'm here with you. Tell me a bit more about what’s on your mind."
