
from typing import Optional
import re

# Limited per user request to ONLY these explicit triggers (word-boundary matched)
CRISIS_PATTERNS = [
    re.compile(r"\bsucide\b", re.IGNORECASE),
    re.compile(r"\bsuicide\b", re.IGNORECASE),
    re.compile(r"\brape\b", re.IGNORECASE),
    re.compile(r"\bmurder\b", re.IGNORECASE),
    re.compile(r"\bkill\b", re.IGNORECASE),  # note: will also match benign phrases like 'kill time'; adjust if needed
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



