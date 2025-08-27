
from typing import Optional


CRISIS_KEYWORDS = [
    "suicide",
    "kill myself",
    "end my life",
    "i want to die",
    "can't go on",
    "hopeless",
    "depressed",
    "cut myself",
    "hurt myself",
]

def check_crisis(user_text: str) -> dict:
    """
    Check if the given text contains crisis keywords.
    Returns a dict with crisis flag and optional banner info.
    """

    text_lower = user_text.lower().strip()
    print(f"DEBUG: user_text={user_text!r}, text_lower={text_lower!r}") 

    for pat in CRISIS_PATTERNS:
        if pat.search(text_lower):
            return {
                "crisis": True,
                "banner": None,  # Suppress automatic helpline banner per revised requirements
            }


    return {"crisis": False, "banner": None}



