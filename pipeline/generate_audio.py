#!/usr/bin/env python3
"""Turn a generated content.json into a voiceover track and Remotion props file.

Supports three TTS providers, selected with --provider or the TTS_PROVIDER
env var:
  - elevenlabs (default): calls the ElevenLabs REST API (ELEVENLABS_API_KEY,
    ELEVENLABS_VOICE_ID required)
  - kokoro: uses the local, open-weight Kokoro TTS model via PyTorch
    (requires the `kokoro` and `soundfile` packages; downloads weights from
    Hugging Face Hub on first run)
  - kokoro-onnx: the same Kokoro model via ONNX Runtime (requires the
    `kokoro-onnx` and `soundfile` packages, plus the espeak-ng system
    package). Prefer this over `kokoro` when Hugging Face isn't reachable —
    it downloads the same weights from GitHub Releases instead, and this
    script auto-downloads them into pipeline/models/ on first run.

Writes the audio into public/audio/ (Remotion's static asset directory) and
writes pipeline/output/props.json, the full --props payload for `remotion
render` (content + audioSrc), so the render step in orchestrator.sh doesn't
need to know which provider or file extension was used.

Usage:
    python pipeline/generate_audio.py
    python pipeline/generate_audio.py --provider kokoro-onnx
    python pipeline/generate_audio.py --input pipeline/output/content.json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent
PIPELINE_DIR = REPO_ROOT / "pipeline"
DEFAULT_INPUT_PATH = PIPELINE_DIR / "output" / "content.json"
PROPS_OUTPUT_PATH = PIPELINE_DIR / "output" / "props.json"
PUBLIC_AUDIO_DIR = REPO_ROOT / "public" / "audio"
MODELS_DIR = PIPELINE_DIR / "models"

ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

KOKORO_ONNX_RELEASE = (
    "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
)
KOKORO_ONNX_MODEL_URL = f"{KOKORO_ONNX_RELEASE}/kokoro-v1.0.onnx"
KOKORO_ONNX_VOICES_URL = f"{KOKORO_ONNX_RELEASE}/voices-v1.0.bin"


def strip_emphasis_markup(text: str) -> str:
    """Removes the **word** on-screen-highlight markup before TTS synthesis
    — it's meant for src/emphasis.tsx to render as a colored span, not to be
    read aloud as literal asterisks."""
    return re.sub(r"\*\*([^*]+)\*\*", r"\1", text)


def build_narration(content: dict) -> str:
    lines = [content["hook"], *(s["text"] for s in content["scenes"]), content["cta"]]
    return " ... ".join(strip_emphasis_markup(line) for line in lines)


def synthesize_elevenlabs(text: str) -> Path:
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID")
    if not api_key or not voice_id:
        sys.exit(
            "ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set in .env "
            "to use the elevenlabs provider."
        )

    response = requests.post(
        ELEVENLABS_TTS_URL.format(voice_id=voice_id),
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        json={
            "text": text,
            "model_id": os.environ.get("ELEVENLABS_MODEL_ID", "eleven_turbo_v2_5"),
            "voice_settings": {"stability": 0.45, "similarity_boost": 0.8},
        },
        timeout=60,
    )
    if response.status_code != 200:
        sys.exit(
            f"ElevenLabs TTS request failed ({response.status_code}): {response.text}"
        )

    output_path = PUBLIC_AUDIO_DIR / "voiceover.mp3"
    output_path.write_bytes(response.content)
    return output_path


def synthesize_kokoro(text: str) -> Path:
    try:
        from kokoro import KPipeline  # type: ignore[import-not-found]
        import soundfile as sf  # type: ignore[import-not-found]
        import numpy as np
    except ImportError as exc:
        sys.exit(
            "The kokoro provider requires the 'kokoro' and 'soundfile' "
            f"packages (pip install kokoro soundfile). Missing: {exc.name}"
        )

    lang_code = os.environ.get("KOKORO_LANG_CODE", "a")
    voice = os.environ.get("KOKORO_VOICE", "af_heart")

    pipeline = KPipeline(lang_code=lang_code)
    audio_chunks = [audio for _, _, audio in pipeline(text, voice=voice)]
    full_audio = np.concatenate(audio_chunks)

    output_path = PUBLIC_AUDIO_DIR / "voiceover.wav"
    sf.write(str(output_path), full_audio, 24000)
    return output_path


def _download_if_missing(path: Path, url: str) -> None:
    if path.exists():
        return
    print(f"Downloading {url} -> {path} (first run only, this may take a while)...")
    tmp_path = path.with_suffix(path.suffix + ".part")
    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()
        with tmp_path.open("wb") as f:
            for chunk in response.iter_content(chunk_size=1 << 20):
                f.write(chunk)
    tmp_path.rename(path)


def synthesize_kokoro_onnx(text: str) -> Path:
    try:
        from kokoro_onnx import Kokoro  # type: ignore[import-not-found]
        import soundfile as sf  # type: ignore[import-not-found]
    except ImportError as exc:
        sys.exit(
            "The kokoro-onnx provider requires the 'kokoro-onnx' and "
            "'soundfile' packages (pip install kokoro-onnx soundfile), plus "
            f"the espeak-ng system package. Missing: {exc.name}"
        )

    model_path = Path(os.environ.get("KOKORO_ONNX_MODEL_PATH", MODELS_DIR / "kokoro-v1.0.onnx"))
    voices_path = Path(os.environ.get("KOKORO_ONNX_VOICES_PATH", MODELS_DIR / "voices-v1.0.bin"))
    model_path.parent.mkdir(parents=True, exist_ok=True)
    _download_if_missing(model_path, KOKORO_ONNX_MODEL_URL)
    _download_if_missing(voices_path, KOKORO_ONNX_VOICES_URL)

    voice = os.environ.get("KOKORO_VOICE", "af_heart")
    lang = os.environ.get("KOKORO_ONNX_LANG", "en-us")

    kokoro = Kokoro(str(model_path), str(voices_path))
    samples, sample_rate = kokoro.create(text, voice=voice, speed=1.0, lang=lang)

    output_path = PUBLIC_AUDIO_DIR / "voiceover.wav"
    sf.write(str(output_path), samples, sample_rate)
    return output_path


PROVIDERS = {
    "elevenlabs": synthesize_elevenlabs,
    "kokoro": synthesize_kokoro,
    "kokoro-onnx": synthesize_kokoro_onnx,
}


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default=str(DEFAULT_INPUT_PATH))
    parser.add_argument(
        "--provider",
        choices=sorted(PROVIDERS),
        default=os.environ.get("TTS_PROVIDER", "elevenlabs"),
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        sys.exit(f"{input_path} not found. Run generate_content.py first.")

    with input_path.open("r", encoding="utf-8") as f:
        content = json.load(f)

    narration = build_narration(content)
    print(f"Synthesizing {len(narration)} characters with '{args.provider}'...")

    PUBLIC_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    audio_path = PROVIDERS[args.provider](narration)
    print(f"Wrote audio to {audio_path}")

    audio_src = str(audio_path.relative_to(REPO_ROOT / "public"))
    props = {"content": content, "audioSrc": audio_src}
    PROPS_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with PROPS_OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(props, f, indent=2)
    print(f"Wrote render props to {PROPS_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
