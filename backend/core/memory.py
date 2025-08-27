from collections import defaultdict, deque
from typing import List, Dict

# Keep last 10 message pairs (user+assistant) => 20 messages
MAX_TURNS = 10
_store: Dict[str, deque] = defaultdict(lambda: deque(maxlen=2 * MAX_TURNS))

def get_history(session_id: str) -> List[dict]:
    """Return chat history as a list of {'role': 'user'/'assistant', 'content': str}"""
    return list(_store[session_id])

def append_history(session_id: str, role: str, content: str) -> None:
    """Add a message to history"""
    _store[session_id].append({"role": role, "content": content})

def clear_history(session_id: str) -> None:
    """Reset chat history"""
    _store.pop(session_id, None)
