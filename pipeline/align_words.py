"""Forced alignment: map each word in the generated script to the exact
timestamp it's spoken at in the synthesized voiceover.

Uses PocketSphinx's forced-alignment mode (bundles its own acoustic model in
the pip wheel — no external model download, so it works regardless of TTS
provider or network restrictions on model-hosting CDNs). This is genuinely
forced alignment (audio matched against KNOWN text), not ASR transcription,
so it stays accurate even on synthetic TTS voices.

Numbers, currency, and percentages are expanded to the words the TTS engine
actually spoke ("$10,000" -> "ten thousand dollars") purely for matching
against the audio — the original written form ("$10,000") is what's kept
for on-screen display, timed to span all of its expanded sub-words.

If alignment fails for any reason (OOV word, corrupt audio, mismatch), this
returns None and the caller falls back to the LLM's estimated durations —
word-level sync is a bonus layered on top of the "always renders" pipeline,
never a hard requirement.
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

FRAME_RATE = 100.0  # PocketSphinx's fixed internal frame rate (10ms/frame)
TARGET_SAMPLE_RATE = 16000
END_PAD_SECONDS = 0.8  # trailing pad after the last spoken word


def tokenize_markup(text: str) -> list[dict[str, Any]]:
    """Splits `**word**`-marked text into [{"text": word, "emphasized": bool}, ...].

    Mirrors renderEmphasized's tokenizer in src/components/KineticText.tsx —
    keep the two in sync if either changes.
    """
    tokens: list[dict[str, Any]] = []
    for part in re.split(r"(\*\*[^*]+\*\*)", text):
        if not part:
            continue
        emphasized = part.startswith("**") and part.endswith("**")
        clean = part[2:-2] if emphasized else part
        for word in clean.split(" "):
            if word:
                tokens.append({"text": word, "emphasized": emphasized})
    return tokens


def _num2words_safe(value: float) -> str:
    from num2words import num2words

    return num2words(int(value) if value == int(value) else value)


_LETTER_NAMES = {
    "A": "ay", "B": "bee", "C": "see", "D": "dee", "E": "ee", "F": "eff",
    "G": "jee", "H": "aitch", "I": "eye", "J": "jay", "K": "kay", "L": "el",
    "M": "em", "N": "en", "O": "oh", "P": "pee", "Q": "cue", "R": "are",
    "S": "ess", "T": "tee", "U": "you", "V": "vee", "W": "double you",
    "X": "ex", "Y": "why", "Z": "zee",
}  # fmt: skip


def _expand_acronyms(text: str) -> str:
    """Spells out short ALL-CAPS tokens ("DM", "ROI", "CTA") letter-by-letter
    — TTS engines read these as initialisms, not as words, and they're never
    in a pronunciation dictionary. Only matches whole-word ALL-CAPS runs of
    2-6 letters, so ordinary sentence-case capitalization is untouched."""

    def repl(m: re.Match[str]) -> str:
        return " " + " ".join(_LETTER_NAMES[c] for c in m.group(0)) + " "

    return re.sub(r"\b[A-Z]{2,6}\b", repl, text)


def normalize_for_alignment(text: str) -> list[str]:
    """Converts a chunk of text into the lowercase, punctuation-free words a
    dictionary-based aligner needs, expanding numbers/currency/percent/
    acronyms into the words a TTS engine actually speaks."""

    text = _expand_acronyms(text)

    def repl_currency(m: re.Match[str]) -> str:
        amount = float(m.group(1).replace(",", ""))
        return f" {_num2words_safe(amount)} dollars "

    def repl_percent(m: re.Match[str]) -> str:
        amount = float(m.group(1).replace(",", ""))
        return f" {_num2words_safe(amount)} percent "

    def repl_number(m: re.Match[str]) -> str:
        amount = m.group(0).replace(",", "")
        return f" {_num2words_safe(float(amount))} "

    text = re.sub(r"\$([0-9][0-9,.]*)", repl_currency, text)
    text = re.sub(r"([0-9][0-9,.]*)%", repl_percent, text)
    text = re.sub(r"[0-9][0-9,]*(\.[0-9]+)?", repl_number, text)
    text = text.lower()
    text = re.sub(r"[^a-z' ]", " ", text)
    return text.split()


def _strip_stress(phones: list[str]) -> list[str]:
    return [re.sub(r"\d$", "", p) for p in phones]


# Approximate phones appended for a common inflected suffix when only the
# base word is in the dictionary — good enough for alignment timing, not
# meant to be phonetically precise.
_SUFFIX_PHONES = {
    "'s": ["S"],
    "es": ["IH", "Z"],
    "ing": ["IH", "NG"],
    "ed": ["D"],
    "s": ["S"],
}


def _lookup_pronunciation(word: str, cmu: dict[str, list[list[str]]]) -> list[str] | None:
    if word in cmu:
        return _strip_stress(cmu[word][0])
    for suffix, extra_phones in _SUFFIX_PHONES.items():
        if word.endswith(suffix) and len(word) > len(suffix):
            base = word[: -len(suffix)]
            if base in cmu:
                return _strip_stress(cmu[base][0]) + extra_phones
    return None


def _build_dict_file(words: set[str]) -> tuple[Path | None, list[str]]:
    """Builds a PocketSphinx-format dictionary covering exactly the words we
    need, from the full ~126k-word CMU Pronouncing Dictionary (a pip-installed
    data package — no network download) plus common-suffix fallback for
    inflected forms not listed verbatim (e.g. "unlocks" -> "unlock" + S).
    Returns (dict_file_path, unresolvable_words); dict_file_path is None if
    any word couldn't be resolved at all."""
    import tempfile

    import cmudict

    cmu = cmudict.dict()
    lines: list[str] = []
    missing: list[str] = []
    for word in sorted(words):
        pron = _lookup_pronunciation(word, cmu)
        if pron is None:
            missing.append(word)
            continue
        lines.append(f"{word} {' '.join(pron)}")

    if missing:
        return None, missing

    fd, path = tempfile.mkstemp(suffix=".dict", prefix="align-dict-")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    return Path(path), []


def _run_pocketsphinx(pcm16_bytes: bytes, text: str) -> list[tuple[float, float]] | None:
    from pocketsphinx import Config, Decoder, get_model_path

    dict_path, missing = _build_dict_file(set(text.split()))
    if dict_path is None:
        print(f"Word alignment skipped: no pronunciation found for {missing}.")
        return None

    model_path = get_model_path()
    config = Config()
    config.set_string("-hmm", os.path.join(model_path, "en-us", "en-us"))
    config.set_string("-dict", str(dict_path))

    try:
        decoder = Decoder(config)
        try:
            decoder.set_align_text(text)
        except RuntimeError:
            return None

        decoder.start_utt()
        decoder.process_raw(pcm16_bytes, no_search=False, full_utt=True)
        decoder.end_utt()

        words: list[tuple[float, float]] = []
        for seg in decoder.seg():
            if seg.word in ("<sil>", "[NOISE]", "<s>", "</s>"):
                continue
            words.append((seg.start_frame / FRAME_RATE, seg.end_frame / FRAME_RATE))
        return words
    finally:
        dict_path.unlink(missing_ok=True)


def _load_pcm16(audio_path: Path) -> bytes:
    import numpy as np
    import soundfile as sf

    audio, sr = sf.read(str(audio_path), dtype="float32")
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    duration = len(audio) / sr
    n_target = int(duration * TARGET_SAMPLE_RATE)
    x_old = np.linspace(0, duration, len(audio))
    x_new = np.linspace(0, duration, n_target)
    resampled = np.interp(x_new, x_old, audio)
    return (resampled * 32767).astype(np.int16).tobytes()


def align_content(content: dict[str, Any], audio_path: Path) -> dict[str, Any] | None:
    """Returns an updated copy of `content` with real measured durations and
    a `words` timing array per segment, or None if alignment isn't possible."""
    try:
        segment_texts = [
            ("hook", content["hook"]),
            *(("scene", scene["text"]) for scene in content["scenes"]),
            ("cta", content["cta"]),
        ]

        # Per-segment markup tokens (original display text + emphasis flag)
        # and how many normalized sub-words each token expands into.
        segment_tokens = [tokenize_markup(text) for _, text in segment_texts]
        full_normalized_words: list[str] = []
        token_expansions: list[list[int]] = []  # per segment, per token: sub-word count
        for tokens in segment_tokens:
            expansions: list[int] = []
            for token in tokens:
                sub_words = normalize_for_alignment(token["text"])
                expansions.append(len(sub_words))
                full_normalized_words.extend(sub_words)
            token_expansions.append(expansions)

        full_text = " ".join(full_normalized_words)
        if not full_text:
            return None

        pcm16 = _load_pcm16(audio_path)
        aligned = _run_pocketsphinx(pcm16, full_text)
        if aligned is None or len(aligned) != len(full_normalized_words):
            print(
                f"Word alignment skipped: expected {len(full_normalized_words)} "
                f"words, aligner returned {len(aligned) if aligned is not None else 'none'}."
            )
            return None

        # Consume aligned words positionally, per token, per segment.
        cursor = 0
        segment_word_spans: list[list[dict[str, Any]]] = []
        for tokens, expansions in zip(segment_tokens, token_expansions):
            spans: list[dict[str, Any]] = []
            for token, count in zip(tokens, expansions):
                if count == 0:
                    continue
                sub_aligned = aligned[cursor : cursor + count]
                cursor += count
                spans.append(
                    {
                        "word": token["text"],
                        "start": sub_aligned[0][0],
                        "end": sub_aligned[-1][1],
                        "emphasized": token["emphasized"],
                    }
                )
            segment_word_spans.append(spans)

        # Real segment boundaries: each segment runs from its first word's
        # start to the next segment's first word's start (no gaps), with a
        # trailing pad after the very last word.
        segment_starts = [
            spans[0]["start"] if spans else 0.0 for spans in segment_word_spans
        ]
        last_end = max(
            (span["end"] for spans in segment_word_spans for span in spans),
            default=0.0,
        )
        boundaries = [*segment_starts, last_end + END_PAD_SECONDS]

        new_content = dict(content)
        new_content["hook"] = content["hook"]
        new_content["hookDurationInSeconds"] = round(boundaries[1] - boundaries[0], 3)
        new_content["hookWords"] = _relative(segment_word_spans[0], boundaries[0])

        new_scenes = []
        for i, scene in enumerate(content["scenes"]):
            start = boundaries[i + 1]
            end = boundaries[i + 2]
            new_scenes.append(
                {
                    "text": scene["text"],
                    "durationInSeconds": round(end - start, 3),
                    "words": _relative(segment_word_spans[i + 1], start),
                }
            )
        new_content["scenes"] = new_scenes

        cta_index = len(segment_word_spans) - 1
        cta_start = boundaries[cta_index]
        cta_end = boundaries[cta_index + 1]
        new_content["ctaDurationInSeconds"] = round(cta_end - cta_start, 3)
        new_content["ctaWords"] = _relative(segment_word_spans[cta_index], cta_start)

        return new_content
    except Exception as exc:  # noqa: BLE001 - alignment is best-effort
        print(f"Word alignment failed ({exc.__class__.__name__}: {exc}); falling back to estimated timing.")
        return None


def _relative(spans: list[dict[str, Any]], offset: float) -> list[dict[str, Any]]:
    return [
        {
            "word": s["word"],
            "start": round(s["start"] - offset, 3),
            "end": round(s["end"] - offset, 3),
            "emphasized": s["emphasized"],
        }
        for s in spans
    ]
