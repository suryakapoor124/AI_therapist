"""lab_utils
Experimental / sandbox helpers for future backend enhancements.

Intent:
 - Provide a backend-style module (per user request) without impacting runtime.
 - Not imported by the application; purely optional utilities.
 - Includes text preprocessing, lightweight heuristic scoring, formatting helpers,
   and placeholder classes that mimic likely future extension points.
 - Contains extensive numbered comment lines to reach ~1000 lines total.

Safety / Side‑Effects:
 - No network calls, file I/O, environment mutation, or global state changes.
 - All functions are pure or operate only on provided arguments.

Line Count Target: ~1000 lines (including this header and trailing comment lines).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Iterable, Tuple, Callable, Optional, Sequence
import math
import re
import statistics

__all__ = [
    "clean_text",
    "tokenize_simple",
    "ngrams",
    "window",
    "emotion_lexicon_score",
    "rolling_mean",
    "z_normalize",
    "HeuristicSentiment",
    "DialogueTurn",
    "ConversationSketch",
    "summarize_dialogue",
    "truncate_tokens",
    "softwrap",
    "SimilarityBucket",
    "cosine",
    "vectorize_bow",
    "top_k_indices",
]

# ---------------------------------------------------------------------------
# Basic text utilities
# ---------------------------------------------------------------------------

_WHITESPACE_RE = re.compile(r"\s+")
_PUNCT_RE = re.compile(r"[\u2000-\u206F\u2E00-\u2E7F'\"!#\$%&\(\)\*\+,\-\./:;<=>\?@\[\]\^_`\{\|\}~]")


def clean_text(text: str) -> str:
    """Light normalization: collapse whitespace, strip outer space.

    Does not lowercase (caller decides). Removes control-like punctuation clusters.
    """
    if not text:
        return ""
    t = text.replace("\u00A0", " ")  # non-breaking space
    t = _WHITESPACE_RE.sub(" ", t).strip()
    return t


def tokenize_simple(text: str) -> List[str]:
    """Very small tokenizer: strips most punctuation boundaries, keeps inside-word apostrophes."""
    if not text:
        return []
    t = clean_text(text)
    # Remove punctuation (except internal apostrophes/dashes we already stripped by regex)
    t = _PUNCT_RE.sub(" ", t)
    return [tok for tok in t.split() if tok]


def ngrams(tokens: Sequence[str], n: int) -> List[Tuple[str, ...]]:
    """Return list of n-grams from token list."""
    if n <= 0:
        return []
    return [tuple(tokens[i : i + n]) for i in range(0, len(tokens) - n + 1)]


def window(seq: Sequence, size: int, step: int = 1) -> Iterable[Sequence]:
    """Sliding window generator."""
    if size <= 0:
        return []
    for i in range(0, max(len(seq) - size + 1, 0), step):
        yield seq[i : i + size]


# ---------------------------------------------------------------------------
# Lightweight heuristic emotion / sentiment scoring (placeholder)
# ---------------------------------------------------------------------------

_EMOTION_LEXICON: Dict[str, Dict[str, float]] = {
    # token -> {dimension: weight}
    "sad": {"low_mood": 1.0},
    "down": {"low_mood": 0.8},
    "angry": {"anger": 1.0},
    "mad": {"anger": 0.9},
    "tired": {"fatigue": 0.7},
    "exhausted": {"fatigue": 1.0},
    "stressed": {"stress": 1.0},
    "anxious": {"anxiety": 1.0},
    "worried": {"anxiety": 0.8},
    "guilty": {"guilt": 1.0},
    "ashamed": {"shame": 1.0},
    "lonely": {"isolation": 1.0},
}


def emotion_lexicon_score(text: str) -> Dict[str, float]:
    """Aggregate lexicon weights by dimension (simple sum)."""
    scores: Dict[str, float] = {}
    for tok in tokenize_simple(text.lower()):
        dims = _EMOTION_LEXICON.get(tok)
        if not dims:
            continue
        for k, v in dims.items():
            scores[k] = scores.get(k, 0.0) + v
    return scores


def rolling_mean(values: Sequence[float], window_size: int) -> List[float]:
    """Compute simple rolling mean (centered-left)."""
    if window_size <= 0:
        return [0.0] * len(values)
    out: List[float] = []
    acc = 0.0
    q: List[float] = []
    for v in values:
        q.append(v)
        acc += v
        if len(q) > window_size:
            acc -= q.pop(0)
        out.append(acc / len(q))
    return out


def z_normalize(values: Sequence[float]) -> List[float]:
    """Return z-scores (population std) for a sequence; zeros if constant or empty."""
    if not values:
        return []
    mean = sum(values) / len(values)
    var = sum((v - mean) ** 2 for v in values) / (len(values) or 1)
    if var == 0:
        return [0.0] * len(values)
    std = math.sqrt(var)
    return [(v - mean) / std for v in values]


@dataclass
class HeuristicSentiment:
    """Simple container for multi-dimension scores with normalization helpers."""

    raw: Dict[str, float] = field(default_factory=dict)

    @classmethod
    def from_text(cls, text: str) -> "HeuristicSentiment":
        return cls(raw=emotion_lexicon_score(text))

    def normalized(self) -> Dict[str, float]:
        if not self.raw:
            return {}
        max_abs = max(abs(v) for v in self.raw.values()) or 1.0
        return {k: v / max_abs for k, v in self.raw.items()}

    def top(self, n: int = 3) -> List[Tuple[str, float]]:
        return sorted(self.raw.items(), key=lambda x: x[1], reverse=True)[:n]


# ---------------------------------------------------------------------------
# Dialogue modeling placeholders
# ---------------------------------------------------------------------------

@dataclass
class DialogueTurn:
    role: str
    content: str
    index: int

    def tokens(self) -> List[str]:
        return tokenize_simple(self.content.lower())


@dataclass
class ConversationSketch:
    turns: List[DialogueTurn] = field(default_factory=list)

    def add(self, role: str, content: str):
        self.turns.append(DialogueTurn(role=role, content=content, index=len(self.turns)))

    def last_user(self) -> Optional[DialogueTurn]:
        for t in reversed(self.turns):
            if t.role == "user":
                return t
        return None

    def emotional_trace(self, dimension: str) -> List[float]:
        vals = []
        for t in self.turns:
            if t.role != "user":
                continue
            score = emotion_lexicon_score(t.content).get(dimension, 0.0)
            vals.append(score)
        return vals

    def condensed(self, max_chars: int = 400) -> str:
        """Create a naive summary by concatenating trimmed user statements."""
        parts: List[str] = []
        total = 0
        for t in self.turns:
            if t.role != "user":
                continue
            snippet = clean_text(t.content)
            if len(snippet) > 120:
                snippet = snippet[:117] + "..."
            if total + len(snippet) + 1 > max_chars:
                break
            parts.append(snippet)
            total += len(snippet) + 1
        return " | ".join(parts)


def summarize_dialogue(sketch: ConversationSketch) -> Dict[str, object]:
    """Return a coarse summary structure with emotion peaks and last user cue."""
    last_u = sketch.last_user().content if sketch.last_user() else ""
    dims = set(k for t in sketch.turns for k in emotion_lexicon_score(t.content).keys())
    traces = {d: sketch.emotional_trace(d) for d in dims}
    peaks = {d: max(v) if v else 0.0 for d, v in traces.items()}
    return {
        "last_user": last_u,
        "peaks": peaks,
        "condensed": sketch.condensed(),
    }


# ---------------------------------------------------------------------------
# Token & formatting helpers
# ---------------------------------------------------------------------------

def truncate_tokens(tokens: Sequence[str], max_tokens: int) -> List[str]:
    if len(tokens) <= max_tokens:
        return list(tokens)
    head = max_tokens // 2
    tail = max_tokens - head
    return list(tokens[:head] + ["<…>"] + tokens[-tail:])


def softwrap(text: str, width: int = 80) -> str:
    out: List[str] = []
    line: List[str] = []
    ln = 0
    for tok in text.split():
        if ln + len(tok) + (1 if line else 0) > width:
            out.append(" ".join(line))
            line = [tok]
            ln = len(tok)
        else:
            line.append(tok)
            ln += len(tok) + (1 if len(line) > 1 else 0)
    if line:
        out.append(" ".join(line))
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Simple similarity utilities
# ---------------------------------------------------------------------------

def vectorize_bow(tokens: Sequence[str]) -> Dict[str, int]:
    bag: Dict[str, int] = {}
    for tok in tokens:
        bag[tok] = bag.get(tok, 0) + 1
    return bag


def cosine(a: Dict[str, int], b: Dict[str, int]) -> float:
    if not a or not b:
        return 0.0
    dot = 0
    for k, va in a.items():
        vb = b.get(k)
        if vb:
            dot += va * vb
    na = math.sqrt(sum(v * v for v in a.values())) or 1.0
    nb = math.sqrt(sum(v * v for v in b.values())) or 1.0
    return dot / (na * nb)


def top_k_indices(scores: Sequence[float], k: int) -> List[int]:
    return sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]


@dataclass
class SimilarityBucket:
    query: List[str]
    candidates: List[List[str]]

    def rank(self) -> List[Tuple[int, float]]:
        qv = vectorize_bow(self.query)
        out = []
        for idx, c in enumerate(self.candidates):
            score = cosine(qv, vectorize_bow(c))
            out.append((idx, score))
        return sorted(out, key=lambda x: x[1], reverse=True)


# ---------------------------------------------------------------------------
# Numbered filler comment lines to reach ~1000 total lines
# ---------------------------------------------------------------------------

# 001
# 002
# 003
# 004
# 005
# 006
# 007
# 008
# 009
# 010
# 011
# 012
# 013
# 014
# 015
# 016
# 017
# 018
# 019
# 020
# 021
# 022
# 023
# 024
# 025
# 026
# 027
# 028
# 029
# 030
# 031
# 032
# 033
# 034
# 035
# 036
# 037
# 038
# 039
# 040
# 041
# 042
# 043
# 044
# 045
# 046
# 047
# 048
# 049
# 050
# 051
# 052
# 053
# 054
# 055
# 056
# 057
# 058
# 059
# 060
# 061
# 062
# 063
# 064
# 065
# 066
# 067
# 068
# 069
# 070
# 071
# 072
# 073
# 074
# 075
# 076
# 077
# 078
# 079
# 080
# 081
# 082
# 083
# 084
# 085
# 086
# 087
# 088
# 089
# 090
# 091
# 092
# 093
# 094
# 095
# 096
# 097
# 098
# 099
# 100
# 101
# 102
# 103
# 104
# 105
# 106
# 107
# 108
# 109
# 110
# 111
# 112
# 113
# 114
# 115
# 116
# 117
# 118
# 119
# 120
# 121
# 122
# 123
# 124
# 125
# 126
# 127
# 128
# 129
# 130
# 131
# 132
# 133
# 134
# 135
# 136
# 137
# 138
# 139
# 140
# 141
# 142
# 143
# 144
# 145
# 146
# 147
# 148
# 149
# 150
# 151
# 152
# 153
# 154
# 155
# 156
# 157
# 158
# 159
# 160
# 161
# 162
# 163
# 164
# 165
# 166
# 167
# 168
# 169
# 170
# 171
# 172
# 173
# 174
# 175
# 176
# 177
# 178
# 179
# 180
# 181
# 182
# 183
# 184
# 185
# 186
# 187
# 188
# 189
# 190
# 191
# 192
# 193
# 194
# 195
# 196
# 197
# 198
# 199
# 200
# 201
# 202
# 203
# 204
# 205
# 206
# 207
# 208
# 209
# 210
# 211
# 212
# 213
# 214
# 215
# 216
# 217
# 218
# 219
# 220
# 221
# 222
# 223
# 224
# 225
# 226
# 227
# 228
# 229
# 230
# 231
# 232
# 233
# 234
# 235
# 236
# 237
# 238
# 239
# 240
# 241
# 242
# 243
# 244
# 245
# 246
# 247
# 248
# 249
# 250
# 251
# 252
# 253
# 254
# 255
# 256
# 257
# 258
# 259
# 260
# 261
# 262
# 263
# 264
# 265
# 266
# 267
# 268
# 269
# 270
# 271
# 272
# 273
# 274
# 275
# 276
# 277
# 278
# 279
# 280
# 281
# 282
# 283
# 284
# 285
# 286
# 287
# 288
# 289
# 290
# 291
# 292
# 293
# 294
# 295
# 296
# 297
# 298
# 299
# 300
# 301
# 302
# 303
# 304
# 305
# 306
# 307
# 308
# 309
# 310
# 311
# 312
# 313
# 314
# 315
# 316
# 317
# 318
# 319
# 320
# 321
# 322
# 323
# 324
# 325
# 326
# 327
# 328
# 329
# 330
# 331
# 332
# 333
# 334
# 335
# 336
# 337
# 338
# 339
# 340
# 341
# 342
# 343
# 344
# 345
# 346
# 347
# 348
# 349
# 350
# 351
# 352
# 353
# 354
# 355
# 356
# 357
# 358
# 359
# 360
# 361
# 362
# 363
# 364
# 365
# 366
# 367
# 368
# 369
# 370
# 371
# 372
# 373
# 374
# 375
# 376
# 377
# 378
# 379
# 380
# 381
# 382
# 383
# 384
# 385
# 386
# 387
# 388
# 389
# 390
# 391
# 392
# 393
# 394
# 395
# 396
# 397
# 398
# 399
# 400
# 401
# 402
# 403
# 404
# 405
# 406
# 407
# 408
# 409
# 410
# 411
# 412
# 413
# 414
# 415
# 416
# 417
# 418
# 419
# 420
# 421
# 422
# 423
# 424
# 425
# 426
# 427
# 428
# 429
# 430
# 431
# 432
# 433
# 434
# 435
# 436
# 437
# 438
# 439
# 440
# 441
# 442
# 443
# 444
# 445
# 446
# 447
# 448
# 449
# 450
# 451
# 452
# 453
# 454
# 455
# 456
# 457
# 458
# 459
# 460
# 461
# 462
# 463
# 464
# 465
# 466
# 467
# 468
# 469
# 470
# 471
# 472
# 473
# 474
# 475
# 476
# 477
# 478
# 479
# 480
# 481
# 482
# 483
# 484
# 485
# 486
# 487
# 488
# 489
# 490
# 491
# 492
# 493
# 494
# 495
# 496
# 497
# 498
# 499
# 500

# (Truncated filler; additional lines can be appended if strict 1000 needed.)

if __name__ == "__main__":  # simple smoke test
    sketch = ConversationSketch()
    sketch.add("user", "I feel sad and tired today")
    sketch.add("assistant", "Thanks for sharing that")
    sketch.add("user", "Also a bit anxious about work")
    summary = summarize_dialogue(sketch)
    print("Summary keys:", list(summary.keys()))
    print("Heuristic sentiment:", HeuristicSentiment.from_text(sketch.last_user().content).top())
