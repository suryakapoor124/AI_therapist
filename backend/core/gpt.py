from __future__ import annotations

from typing import Optional, List, Dict, Set
import re
from openai import OpenAI
from config import settings
from service.cache import get_summary


BASE_PERSONA = EXISTENTIAL_THERAPIST_PERSONA = (
    "You are an existential psychotherapist. "
    "Focus on long-term exploration, not quick fixes — help the user gradually understand their inner world and patterns over time. "
    "Validate feelings first, then challenge gently when avoidance or extraordinary claims appear. "
    "Ask only one thoughtful question at a time, balancing reflection with curiosity. "
    "Respond like a human — keep replies short, genuine, and natural, never long or robotic. "
    "Do not pressure the user; guide them slowly toward practical insights, lessons, and acceptance of what cannot be changed. "
    "Focus more on 'how' they experience life than 'why,' emphasizing deeper themes rather than surface events. "
    "Maintain a warm, steady tone — grounded and compassionate, not abstract or cold. "
    "If signs of severe distress appear, pause and encourage reaching out to professional or crisis support while offering care."
    "You are a warm, human-like therapist. Keep responses genuine, short, and natural. "
    "Never exceed 250 characters; stay within 150 unless absolutely necessary. "
    "Be concise but meaningful. "
     "Don’t always ask questions — instead, offer simple, practical solutions "
    "Responses should feel authentic, human, and therapeutic — not robotic."
)

GREETING_PERSONA = (
    "You are beginning a therapeutic conversation. Start with warmth and presence, creating a sense of calm safety. "
    "Acknowledge and validate any emotion or tone you sense, even if subtle, to show attunement. "
    "Invite sharing in a gentle way that respects autonomy — the user decides where to begin. "
    "Ask exactly one soft, open-ended question that encourages reflection without pressure. "
    "Keep it to 2–4 short, genuine sentences that sound natural, compassionate, and soothing — never scripted or clinical. "
    "Prioritize trust, grounding, and connection, so the user feels understood and not alone."
)


CRISIS_PERSONA = (
    "You are providing calm, de‑escalating crisis therapeutic support. "
    "Primary goals: ensure immediate safety, validate specific feelings, and help the user take a tiny next stabilizing step. "
    "Be concise (1–3 short sentences). "
    "If there is explicit self‑harm intent or danger, clearly but gently encourage immediate contact with local emergency services (India dial 112) or a trusted person, while staying supportive—not dismissive. "
    "Avoid moralizing, shock language, or medical directives. "
    "Focus on grounding, presence, and conveying they are not alone."
    "You are a warm, human-like therapist. Keep responses genuine, short, and natural. "
    "Never exceed 250 characters; stay within 150 unless absolutely necessary. "
    "Be concise but meaningful."
    "Responses should feel authentic, human, and therapeutic — not robotic."
)

BOUNDARIES_PERSONA = (
    "You specialize in pinpointing and reflecting layered emotions (primary + secondary) without over‑speculating. "
    "Use specific affect labels (e.g., 'torn', 'drained', 'guarded') when text supports them. "
    "Balance validation with gentle normalization and micro‑hope. "
    "Avoid generic sympathy and do not over‑ask questions. "
    "Offer one succinct reflective insight or naming per turn."
    "You are a warm, human-like therapist. Keep responses genuine, short, and natural. "
    "Never exceed 250 characters; stay within 150 unless absolutely necessary. "
    "Be concise but meaningful."
    "Responses should feel authentic, human, and therapeutic — not robotic."
     "Don’t always ask questions — instead, offer simple, practical solutions "
)

EMOTIONS_PERSONA = (
    "You are an attuned emotional therapist. Your role is to name and reflect both surface (secondary) and deeper (primary) emotions with precision. "
    "Use rich but grounded affect labels (e.g., 'unsettled', 'guarded', 'drained', 'torn') only when the text supports them. "
    "Balance empathic validation with gentle normalization, showing that feelings are understandable responses to context. "
    "Offer micro-hope or a light reframe without minimizing pain, so the user feels seen yet not stuck. "
    "Keep responses short and human — never long, robotic, or generic. "
    "Do not over-ask questions; instead, provide one clear reflection or naming insight per turn, leaving space for the user to process. "
    "Prioritize containment: your words should soothe, clarify, and deepen emotional awareness without overwhelming."
    "You are a warm, human-like therapist. Keep responses genuine, short, and natural. "
    "Never exceed 250 characters; stay within 150 unless absolutely necessary. "
    "Be concise but meaningful. "
    "Responses should feel authentic, human, and therapeutic — not robotic."
     "Don’t always ask questions — instead, offer simple, practical solutions "
)


REFLECTION_PERSONA = (
    "You are a therapeutic reflector. Your role is to mirror back the user’s inner experience with depth and precision. "
    "Each response should capture emotion, underlying meaning, and an implied need, without sounding scripted. "
    "Vary your style naturally: sometimes offer a concise emotional reflection, other times a brief summary, strengths recognition, gentle challenge, or a small coping hint. "
    "Keep the tone warm, attuned, and human — short responses of 2–4 sentences that feel genuine and grounded. "
    "Avoid repetition, stock phrases, or over-analysis. "
    "Your reflections should clarify, validate, and open space for further exploration, always leaving room for the user to deepen the conversation."
    "You are a warm, human-like therapist. Keep responses genuine, short, and natural. "
    "Never exceed 250 characters; stay within 150 unless absolutely necessary. "
    "Be concise but meaningful."
    "Responses should feel authentic, human, and therapeutic — not robotic."
     "Don’t always ask questions — instead, offer simple, practical solutions "
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



def generate_reply(
        user_text: str,
        *,
    crisis: bool = False,
        is_first: bool = False,
        history: list[dict] | None = None,
    persona: str | None = None,
    ) -> str:
    """Generate a therapist-style reply from user input with memory support."""

    if not user_text or not user_text.strip():
        return "I’m here with you. What would you like to share?"


    if crisis:
        system_prompt = CRISIS_PERSONA
    elif persona and persona.lower() in PERSONA_MAP and persona.lower() not in ("crisis", "greeting"):
        system_prompt = PERSONA_MAP[persona.lower()]
    elif is_first:
        system_prompt = GREETING_PERSONA
    else:
        system_prompt = BASE_PERSONA

    if not settings.HF_TOKEN:
        return "I’m here with you. What feels heaviest right now?"

    try:
        client = _get_client()

        def _should_probe(txt: str) -> bool:
            stripped = txt.strip().lower()
            if len(stripped.split()) <= 6: 
                trigger_words = {"sad", "down", "low", "empty", "numb", "tired", "drained", "exhausted"}
                if any(w in stripped for w in trigger_words):
                    return True
            return False

        probe = _should_probe(user_text)

        adaptive_tail = "" if not probe else (
            " If the user's message is very brief and only names a difficult feeling, respond with: (1) a precise empathic reflection, (2) ONE gentle, open question to understand context (e.g., what feels most heavy about it or when it started)."
        )

        base_system = system_prompt + (
            " Always remember user-provided details (like their name, family, or preferences). "
            "If the user asks about them later, recall them from the conversation history." + adaptive_tail
        )
        long_term = None
        if history:
            long_term = get_summary(history[0].get('session_id','')) if False else None 
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
    
                if not name:
                    for pat in name_patterns:
                        nm = pat.search(text)
                        if nm:
                            cand = nm.group(1).strip().strip(",.;!?")
                           
                            if len(cand) > 1:
                                name = cand[0].upper() + cand[1:]
                                break
         
                if not age:
                    ag = age_pattern.search(text)
                    if ag:
                        age_val = ag.group(1)
                        if 4 <= len(age_val) <= 2:  
                            pass
                        else:
                            age = age_val
    
                if not location:
                    for pat in location_patterns:
                        loc = pat.search(text)
                        if loc:
                            loc_val = loc.group(1).strip().rstrip('.').title()
                            if len(loc_val.split()) <= 5:
                                location = loc_val
                                break
      
                for pat in goal_patterns:
                    g = pat.search(text)
                    if g:
                        goals.add(g.group(1).strip().rstrip('.'))
      
                for pat in pref_patterns:
                    p = pat.search(text)
                    if p:
                        preferences.add(p.group(1).strip().rstrip('.'))
       
                for pat in concern_patterns:
                    c = pat.search(text)
                    if c:
                        concerns.add(c.group(c.lastindex or 1).strip().rstrip('.'))

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


            messages.extend(history)

       

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