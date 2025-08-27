from collections import defaultdict, deque
from typing import List, Dict, Optional
import re

# Keep last 10 message pairs (user+assistant) => 20 messages
MAX_TURNS = 10
_store: Dict[str, deque] = defaultdict(lambda: deque(maxlen=2 * MAX_TURNS))

# Long-term lightweight summaries (persistent across window rotations)
_summary_store: Dict[str, str] = {}
_summary_count: Dict[str, int] = {}  # messages count at last summary

def get_history(session_id: str) -> List[dict]:
    """Return chat history as a list of {'role','content'} dicts."""
    return list(_store.get(session_id, []))

def append_message(session_id: str, role: str, content: str) -> None:
    """Append a single message to the session history."""
    _store[session_id].append({"role": role, "content": content})

def clear(session_id: str) -> None:
    """Drop a session from memory."""
    _store.pop(session_id, None)
    _summary_store.pop(session_id, None)
    _summary_count.pop(session_id, None)

def session_exists(session_id: str) -> bool:
    """Check if a session already exists"""
    history = get_history(session_id)
    return len(history) > 0

# ----------------------
# Summary Memory Helpers
# ----------------------

def get_summary(session_id: str) -> Optional[str]:
    return _summary_store.get(session_id)

def _extract_facts(history: List[dict]) -> Dict[str, set]:
    facts = {
        "names": set(),
        "locations": set(),
        "goals": set(),
        "likes": set(),
        "concerns": set(),
        "relations": set(),
        "feelings": set(),
    }
    name_patterns = [
        re.compile(r"\bmy name is ([A-Z][a-zA-Z\-']{1,30})", re.IGNORECASE),
        re.compile(r"\bcall me ([A-Z][a-zA-Z\-']{1,30})", re.IGNORECASE),
        re.compile(r"\bi am ([A-Z][a-zA-Z\-']{1,30})", re.IGNORECASE),
    ]
    location_patterns = [
        re.compile(r"\bI live in ([A-Z][A-Za-z\s]{1,40})", re.IGNORECASE),
        re.compile(r"\bI'm from ([A-Z][A-Za-z\s]{1,40})", re.IGNORECASE),
    ]
    goal_patterns = [re.compile(r"\bI want to ([^.]{3,80})", re.IGNORECASE)]
    like_patterns = [
        re.compile(r"\bI like ([^.]{3,60})", re.IGNORECASE),
        re.compile(r"\bI love ([^.]{3,60})", re.IGNORECASE),
        re.compile(r"\bI enjoy ([^.]{3,60})", re.IGNORECASE),
    ]
    concern_patterns = [
        re.compile(r"\bI'm struggling with ([^.]{3,80})", re.IGNORECASE),
        re.compile(r"\bI struggle with ([^.]{3,80})", re.IGNORECASE),
        re.compile(r"\bI can't ([^.]{3,80})", re.IGNORECASE),
    ]
    feeling_patterns = [
        re.compile(r"\bI feel ([^.]{3,80})", re.IGNORECASE),
        re.compile(r"\bI'm feeling ([^.]{3,80})", re.IGNORECASE),
    ]
    relation_keywords = {"mom","mother","dad","father","sister","brother","friend","friends","partner","wife","husband","girlfriend","boyfriend","son","daughter"}

    for msg in history:
        if msg.get("role") != "user":
            continue
        text = msg.get("content", "")
        if not text:
            continue
        for pat in name_patterns:
            m = pat.search(text)
            if m:
                facts["names"].add(m.group(1).strip())
        for pat in location_patterns:
            m = pat.search(text)
            if m:
                loc = m.group(1).strip().rstrip('.')
                if len(loc.split()) <= 5:
                    facts["locations"].add(loc)
        for pat in goal_patterns:
            m = pat.search(text)
            if m:
                facts["goals"].add(m.group(1).strip().rstrip('.'))
        for pat in like_patterns:
            m = pat.search(text)
            if m:
                facts["likes"].add(m.group(1).strip().rstrip('.'))
        for pat in concern_patterns:
            m = pat.search(text)
            if m:
                facts["concerns"].add(m.group(1).strip().rstrip('.'))
        for pat in feeling_patterns:
            m = pat.search(text)
            if m:
                facts["feelings"].add(m.group(1).strip().rstrip('.'))
        lowered = text.lower()
        for kw in relation_keywords:
            if kw in lowered:
                facts["relations"].add(kw)
    return facts

def _format_summary(facts: Dict[str, set]) -> str:
    parts = []
    if facts["names"]:
        parts.append("Names: " + ", ".join(sorted(facts["names"])) )
    if facts["locations"]:
        parts.append("Locations: " + ", ".join(sorted(facts["locations"])) )
    if facts["goals"]:
        parts.append("Goals: " + "; ".join(sorted(facts["goals"]))[:160])
    if facts["likes"]:
        parts.append("Likes: " + "; ".join(sorted(facts["likes"]))[:120])
    if facts["feelings"]:
        parts.append("Feelings: " + "; ".join(sorted(facts["feelings"]))[:160])
    if facts["concerns"]:
        parts.append("Concerns: " + "; ".join(sorted(facts["concerns"]))[:160])
    if facts["relations"]:
        parts.append("Relations: " + ", ".join(sorted(facts["relations"])) )
    if not parts:
        return ""
    return "Long-term user context: " + " | ".join(parts)

def maybe_update_summary(session_id: str) -> None:
    """Create or refresh summary when history near capacity or every 8 msgs."""
    history = get_history(session_id)
    count = len(history)
    if count == 0:
        return
    last = _summary_count.get(session_id, 0)
    # Trigger if near window limit or enough new messages since last summary
    if count >= (2 * MAX_TURNS - 2) or (count - last) >= 8 or session_id not in _summary_store:
        facts = _extract_facts(history)
        summary_text = _format_summary(facts)
        if summary_text:
            _summary_store[session_id] = summary_text
            _summary_count[session_id] = count
