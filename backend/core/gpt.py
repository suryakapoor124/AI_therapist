# backend/core/gpt.py
from __future__ import annotations

from typing import Optional, List, Dict, Set
import re
from openai import OpenAI
from config import settings
from service.cache import get_summary

# --- Prompts ---

BASE_PERSONA = (
    "You are an expert, trauma‑informed therapeutic AI. Be deeply attentive, emotionally precise, and collaborative. "
    "Provide concise reflections plus (when useful) one grounded micro‑step or gentle reframe. "
    "Avoid filler apologies; label nuanced emotion instead. "
    "Vary technique (reflection, summary, strengths, gentle challenge, coping skill) without sounding scripted. "
    "Ask a question only when it meaningfully advances understanding. "
    "Do NOT mention emergency services, hotlines, self‑harm screening, or advise seeing a professional unless the user's message explicitly contains one of these words: suicide, sucide, rape, murder, kill. "
    "Keep responses typically under 4 short sentences with substance over length. "
    "Avoid generic sympathy, clichés, and clinical detachment. Reinforce strengths when the user shares progress. Maintain a steady, respectful, non‑judgmental tone."
)

GREETING_PERSONA = (
    "You are beginning a therapeutic conversation. Offer a warm, grounded welcome, set a tone of safety and collaboration, and invite (not pressure) sharing. "
    "Reflect any initial emotion if present. Ask exactly one open, gentle question that helps them start where they feel ready. "
    "Be sincere, not salesy or scripted. Keep it to 2–4 short sentences."
)

CRISIS_PERSONA = (
    "You are providing calm, de‑escalating crisis therapeutic support. "
    "Primary goals: ensure immediate safety, validate specific feelings, and help the user take a tiny next stabilizing step. "
    "Be concise (1–3 short sentences). "
    "If there is explicit self‑harm intent or danger, clearly but gently encourage immediate contact with local emergency services (India dial 112) or a trusted person, while staying supportive—not dismissive. "
    "Avoid moralizing, shock language, or medical directives. "
    "Focus on grounding, presence, and conveying they are not alone."
)

EMOTIONS_PERSONA = (
    "You specialize in pinpointing and reflecting layered emotions (primary + secondary) without over‑speculating. "
    "Use specific affect labels (e.g., 'torn', 'drained', 'guarded') when text supports them. "
    "Balance validation with gentle normalization and micro‑hope. "
    "Avoid generic sympathy and do not over‑ask questions. "
    "Offer one succinct reflective insight or naming per turn."
)

BOUNDARIES_PERSONA = (
    "You provide therapeutic support while being transparent about limits (no diagnosis, prescriptions, or emergency intervention). "
    "When outside scope, state limits briefly then pivot back to emotional support or coping strategies. "
    "Never abandon or dismiss; always keep the user accompanied. "
    "Keep tone calm, confident, respectful."
)

REFLECTION_PERSONA = (
    "You craft high‑quality therapeutic reflections: capture emotion, meaning, and an implied need in a compact way. "
    "Rotate techniques: concise reflection, summary, strengths spotting, gentle challenge, or a small coping suggestion. "
    "Avoid repetition and template phrases. Keep to 2–4 purposeful sentences."
)

PERSONA_MAP = {
    "base": BASE_PERSONA,
    "greeting": GREETING_PERSONA,
    "crisis": CRISIS_PERSONA,
    "emotions": EMOTIONS_PERSONA,
    "boundaries": BOUNDARIES_PERSONA,
    "reflection": REFLECTION_PERSONA,
}

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
        history: list[dict] | None = None,
        persona: str | None = None,
        session_id: str | None = None,
    ) -> str:
    """Generate a therapist-style reply from user input with memory support."""

    if not user_text or not user_text.strip():
        return "I’m here with you. What would you like to share?"

    # Pick system prompt
    # Dynamic persona heuristic if none explicitly provided and not crisis/first
    dynamic_persona = None
    if not crisis and not is_first and not persona:
        lt = user_text.lower()
        # Emotion heavy if multiple feeling words
        emo_words = sum(1 for w in ["sad","low","empty","anxious","angry","ashamed","guilty","numb","tired","overwhelmed"] if w in lt)
        if emo_words >= 2:
            dynamic_persona = "emotions"
        elif any(k in lt for k in ["I accomplished","I managed","I improved","it got better"]):
            dynamic_persona = "reflection"
        elif any(k in lt for k in ["boundary","crossed","they keep asking"]):
            dynamic_persona = "boundaries"
    chosen_persona = persona or dynamic_persona

    if crisis:
        system_prompt = CRISIS_PERSONA
    elif chosen_persona and chosen_persona.lower() in PERSONA_MAP and chosen_persona.lower() not in ("crisis", "greeting"):
        system_prompt = PERSONA_MAP[chosen_persona.lower()]
    elif is_first:
        system_prompt = GREETING_PERSONA
    else:
        system_prompt = BASE_PERSONA

    # If no token, soft fallback
    if not settings.HF_TOKEN:
        return "I’m here with you. What feels heaviest right now?"

    try:
        client = _get_client()

        # Decide if we should gently probe (very short, low-detail emotional disclosure)
        def _should_probe(txt: str) -> bool:
            stripped = txt.strip().lower()
            if len(stripped.split()) <= 6:  # very short
                trigger_words = {"sad", "down", "low", "empty", "numb", "tired", "drained", "exhausted"}
                if any(w in stripped for w in trigger_words):
                    return True
            return False

        probe = _should_probe(user_text)

        # Build base system message with adaptive guidance
        adaptive_tail = "" if not probe else (
            " If the user's message is very brief and only names a difficult feeling, respond with: (1) a precise empathic reflection, (2) ONE gentle, open question to understand context (e.g., what feels most heavy about it or when it started)."
        )

        base_system = system_prompt + (
            " Always remember user-provided details (like their name, family, or preferences). "
            "If the user asks about them later, recall them from the conversation history." + adaptive_tail
        )
        long_term = None
        if history:
            long_term = get_summary(history[0].get('session_id','')) if False else None  # placeholder not used (session id not stored per message)
        # We cannot retrieve session_id from history items (not stored), so just grab summary via caller if needed.
        # Provide hook: pass summary in history as synthetic system message with role 'system' and key 'summary'.
        messages = [{"role": "system", "content": base_system}]

        # --- Lightweight memory synthesis (rule-based) ---
        if history:
            # Extract structured cues from history
            name: Optional[str] = None
            age: Optional[str] = None
            location: Optional[str] = None
            goals: Set[str] = set()
            preferences: Set[str] = set()
            concerns: Set[str] = set()
            relations: Set[str] = set()

            # Precompile small regex patterns
            name_patterns = [
                re.compile(r"\bmy name is ([A-Z][a-zA-Z\-']{1,30})\b", re.IGNORECASE),
                re.compile(r"\bcall me ([A-Z][a-zA-Z\-']{1,30})\b", re.IGNORECASE),
                re.compile(r"\bi am ([A-Z][a-zA-Z\-']{1,30})\b", re.IGNORECASE),
                re.compile(r"^i'm ([A-Z][a-zA-Z\-']{1,30})\b", re.IGNORECASE),
            ]
            age_pattern = re.compile(r"\bI(?:'m| am) (\d{1,2})\b")
            location_patterns = [
                re.compile(r"\bI live in ([A-Z][A-Za-z\s]{1,40})", re.IGNORECASE),
                re.compile(r"\bI'm from ([A-Z][A-Za-z\s]{1,40})", re.IGNORECASE),
            ]
            goal_patterns = [
                re.compile(r"\bI want to ([^.]{3,80})", re.IGNORECASE),
                re.compile(r"\bmy goal is to ([^.]{3,80})", re.IGNORECASE),
                re.compile(r"\bI hope to ([^.]{3,80})", re.IGNORECASE),
            ]
            pref_patterns = [
                re.compile(r"\bI like ([^.]{3,60})", re.IGNORECASE),
                re.compile(r"\bI love ([^.]{3,60})", re.IGNORECASE),
                re.compile(r"\bI enjoy ([^.]{3,60})", re.IGNORECASE),
            ]
            concern_patterns = [
                re.compile(r"\bI feel ([^.]{3,80})", re.IGNORECASE),
                re.compile(r"\bI'm feeling ([^.]{3,80})", re.IGNORECASE),
                re.compile(r"\bI have been feeling ([^.]{3,80})", re.IGNORECASE),
                re.compile(r"\bI'm (anxious|depressed|stressed|overwhelmed|tired)\b", re.IGNORECASE),
            ]
            relation_keywords = {"mom","mother","dad","father","sister","brother","friend","friends","partner","wife","husband","girlfriend","boyfriend","fiancé","fiancee","child","son","daughter"}

            for m in history:
                if not isinstance(m, dict):
                    continue
                role = m.get("role")
                if role != "user":
                    continue
                text: str = m.get("content", "")
                if not text:
                    continue
                # Name
                if not name:
                    for pat in name_patterns:
                        nm = pat.search(text)
                        if nm:
                            cand = nm.group(1).strip().strip(",.;!?")
                            # Avoid picking a common verb mistaken as name
                            if len(cand) > 1:
                                name = cand[0].upper() + cand[1:]
                                break
                # Age
                if not age:
                    ag = age_pattern.search(text)
                    if ag:
                        age_val = ag.group(1)
                        if 4 <= len(age_val) <= 2:  # impossible, keep simple sanity
                            pass
                        else:
                            age = age_val
                # Location
                if not location:
                    for pat in location_patterns:
                        loc = pat.search(text)
                        if loc:
                            loc_val = loc.group(1).strip().rstrip('.').title()
                            if len(loc_val.split()) <= 5:
                                location = loc_val
                                break
                # Goals
                for pat in goal_patterns:
                    g = pat.search(text)
                    if g:
                        goals.add(g.group(1).strip().rstrip('.'))
                # Preferences
                for pat in pref_patterns:
                    p = pat.search(text)
                    if p:
                        preferences.add(p.group(1).strip().rstrip('.'))
                # Concerns
                for pat in concern_patterns:
                    c = pat.search(text)
                    if c:
                        # last group might be a single word or a phrase
                        concerns.add(c.group(c.lastindex or 1).strip().rstrip('.'))
                # Relations keywords presence
                lowered = text.lower()
                for kw in relation_keywords:
                    if kw in lowered:
                        relations.add(kw)

            fact_chunks: List[str] = []
            if name:
                fact_chunks.append(f"Name: {name}")
            if age:
                fact_chunks.append(f"Age: {age}")
            if location:
                fact_chunks.append(f"Location: {location}")
            if goals:
                fact_chunks.append("Goals: " + "; ".join(sorted(goals))[:120])
            if preferences:
                fact_chunks.append("Likes: " + "; ".join(sorted(preferences))[:120])
            if concerns:
                fact_chunks.append("Concerns: " + "; ".join(sorted(concerns))[:160])
            if relations:
                fact_chunks.append("Mentioned relations: " + ", ".join(sorted(relations)))

            if fact_chunks:
                memory_summary = "Key user details (recent turns): " + " | ".join(fact_chunks)
                messages.append({"role": "system", "content": memory_summary})

            # Inject any pre-computed long-term summary if caller added it to history (role=='system' & meta=='long_term')
            # (Future extension: attach session summary upstream.)
            messages.extend(history)

        print(">>> MESSAGES SENT TO GPT:", messages)

        # Call HuggingFace endpoint
        resp = client.chat.completions.create(
            model=settings.HF_MODEL,
            messages=messages,
        )
        content = resp.choices[0].message.content
        if content:
            content = _postprocess_reply(content, history, crisis)
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

# ----------------- Post Processing Layer -----------------

REFERRAL_BLOCKERS = [
    re.compile(r"contact (?:a|your) (?:doctor|professional|therapist)", re.IGNORECASE),
    re.compile(r"reach out to (?:someone|a professional|a hotline)", re.IGNORECASE),
    re.compile(r"call (?:emergency|911|112)", re.IGNORECASE),
    re.compile(r"seek professional help", re.IGNORECASE),
]

CRISIS_ALLOW = {"suicide","sucide","rape","murder","kill"}

def _postprocess_reply(text: str, history: list[dict] | None, crisis: bool) -> str:
    original = text
    # Question throttle: if last assistant already asked a question, strip trailing question from new reply
    if history:
        last_assistant_q = None
        for m in reversed(history):
            if m.get("role") == "assistant":
                last_assistant_q = "?" in m.get("content","")
                break
        if last_assistant_q and text.count("?") > 0:
            # remove last question sentence
            parts = re.split(r"(?<=[?.!])\s+", text.strip())
            parts = [p for p in parts if p]
            # drop last segment containing '?'
            for i in range(len(parts)-1, -1, -1):
                if "?" in parts[i]:
                    del parts[i]
                    break
            if parts:
                text = " ".join(parts).strip()
    # Referral filtering if not crisis
    if not crisis:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        filtered = []
        for s in sentences:
            if any(p.search(s) for p in REFERRAL_BLOCKERS):
                continue
            filtered.append(s)
        if filtered:
            text = " ".join(filtered).strip()
    # Length trim safety
    return text.strip() or original
