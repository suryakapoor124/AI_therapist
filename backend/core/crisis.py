
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

    for keyword in CRISIS_KEYWORDS:
        if keyword in text_lower:
            return {
                "crisis": True,
                "banner": {
                    "message": "It sounds like you might be going through a really difficult time. You're not alone.",
                    "helpline": {
                        "india": "Call 9152987821 (Vandrevala Foundation Helpline)",
                        "international": "Find your local helpline at https://findahelpline.com",
                    },
                },
            }


    return {
        "crisis": False,
        "banner": None,
    }



