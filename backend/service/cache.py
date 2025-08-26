from collections import defaultdict, deque
from typing import List, Dict

# Keep last 10 message pairs (user+assistant) => 20 messages
MAX_TURNS = 10
_store: Dict[str, deque] = defaultdict(lambda: deque(maxlen=2 * MAX_TURNS))

def get_history(session_id: str) -> List[dict]:
    """Return chat history as a list of {'role','content'} dicts."""
    return list(_store.get(session_id, []))

def append_message(session_id: str, role: str, content: str) -> None:
    """Append a single message to the session history."""
    _store[session_id].append({"role": role, "content": content})

def clear(session_id: str) -> None:
    """Drop a session from memory."""
    _store.pop(session_id, None)

def session_exists(session_id: str) -> bool:
    """Check if a session already exists"""
    history = get_history(session_id)
    return len(history) > 0
