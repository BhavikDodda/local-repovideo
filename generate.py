#!/usr/bin/env python3
"""Render an explainer from a local repo.

Cursor writes analysis.json. This script only speaks the lines and renders
the picture. It does not call Gemini and it does not read GitHub.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
VIDEO = ROOT / "video"
VENV = ROOT / ".venv"
AUDIO = VIDEO / "public" / "audio"

SCENE_IDS = {"hook", "what", "features", "tech", "facts", "stats", "cta"}
DEFAULT_VOICE = "en-US-AndrewNeural"


def venv_python() -> Path:
    if os.name == "nt":
        return VENV / "Scripts" / "python.exe"
    return VENV / "bin" / "python"


def ensure_venv() -> None:
    py = venv_python()
    if py.exists():
        return
    subprocess.check_call([sys.executable, "-m", "venv", str(VENV)])
    subprocess.check_call([str(py), "-m", "pip", "install", "-q", "edge-tts"])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Render a local explainer video")
    parser.add_argument("--repo", type=Path, default=None, help="Local project to describe")
    parser.add_argument("--analysis", type=Path, default=ROOT / "analysis.json")
    parser.add_argument("--collect", action="store_true", help="Only refresh repo-context.md")
    parser.add_argument("--voice", default=None, help="edge-tts voice name")
    parser.add_argument("--offline", action="store_true", help="Use Windows speech instead of edge-tts")
    parser.add_argument("--output", type=Path, default=None)
    return parser.parse_args()


def require_repo(path: Path | None) -> Path:
    if path is None:
        raise SystemExit("Pass --repo /path/to/your/project")
    repo = path.expanduser().resolve()
    if not repo.is_dir():
        raise SystemExit(f"Not a directory: {repo}")
    return repo


def media_duration(path: Path) -> float:
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        return 4.0
    proc = subprocess.run(
        [
            ffprobe,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(proc.stdout.strip())


def synthesize_edge(text: str, dest: Path, voice: str) -> None:
    import edge_tts

    async def run() -> None:
        comm = edge_tts.Communicate(text, voice, rate="+6%")
        await comm.save(str(dest))

    asyncio.run(run())


def synthesize_sapi(text: str, dest: Path) -> None:
    if os.name != "nt":
        raise RuntimeError("Offline speech is available on Windows only.")
    wav = dest.with_suffix(".wav")
    note = dest.with_suffix(".txt")
    script = dest.with_suffix(".ps1")
    note.write_text(text, encoding="utf-8")
    script.write_text(
        "\n".join(
            [
                "param([string]$TextFile, [string]$WaveFile)",
                "Add-Type -AssemblyName System.Speech",
                "$t = Get-Content -Raw -Encoding UTF8 $TextFile",
                "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer",
                "$s.Rate = 1",
                "$s.SetOutputToWaveFile($WaveFile)",
                "$s.Speak($t)",
                "$s.Dispose()",
                "",
            ]
        ),
        encoding="utf-8",
    )
    subprocess.check_call(
        [
            "powershell",
            "-NoProfile",
            "-File",
            str(script),
            "-TextFile",
            str(note),
            "-WaveFile",
            str(wav),
        ]
    )
    script.unlink(missing_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required to convert offline speech to mp3")
    subprocess.check_call(
        [ffmpeg, "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-qscale:a", "4", str(dest)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    wav.unlink(missing_ok=True)
    note.unlink(missing_ok=True)


def load_analysis(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    scenes = data.get("scenes") or []
    unknown = [s for s in scenes if s not in SCENE_IDS]
    if unknown:
        raise SystemExit(f"Unknown scenes in analysis.json: {', '.join(unknown)}")
    if not scenes:
        raise SystemExit("analysis.json has no scenes")
    voiceover = data.get("voiceover") or {}
    missing = [s for s in scenes if not str(voiceover.get(s, "")).strip()]
    if missing:
        raise SystemExit(f"analysis.json is missing voiceover for: {', '.join(missing)}")
    return data


def safe_name(name: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", name).strip("-")
    return cleaned or "explainer"


def ensure_node() -> str:
    npm = shutil.which("npm")
    npx = shutil.which("npx")
    if not npm or not npx:
        raise SystemExit("Node.js npm/npx not found on PATH")
    if not (VIDEO / "node_modules" / "remotion").exists():
        print("Installing Remotion (first run)...")
        subprocess.check_call([npm, "install"], cwd=VIDEO)
    return npx


def render(npx: str, props_path: Path, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    print("Checking Remotion browser...")
    subprocess.check_call([npx, "remotion", "browser", "ensure"], cwd=VIDEO)
    print("Rendering...")
    subprocess.check_call(
        [
            npx,
            "remotion",
            "render",
            "src/index.ts",
            "Explainer",
            str(output),
            f"--props={props_path}",
            "--concurrency=2",
        ],
        cwd=VIDEO,
    )


def build(args: argparse.Namespace) -> Path:
    analysis = load_analysis(args.analysis)
    voice = args.voice or analysis.get("voice") or DEFAULT_VOICE
    scenes = analysis["scenes"]
    voiceover = analysis["voiceover"]
    AUDIO.mkdir(parents=True, exist_ok=True)
    for old in AUDIO.glob("*"):
        if old.is_file():
            old.unlink()

    timed = []
    for index, scene_id in enumerate(scenes):
        text = str(voiceover[scene_id]).strip()
        dest = AUDIO / f"{index:02d}-{scene_id}.mp3"
        print(f"Voice {index + 1}/{len(scenes)}: {scene_id}")
        if args.offline:
            synthesize_sapi(text, dest)
        else:
            try:
                synthesize_edge(text, dest, voice)
            except Exception as exc:
                if os.name != "nt":
                    raise SystemExit(f"edge-tts failed: {exc}") from exc
                print(f"edge-tts failed ({exc}). Falling back to Windows speech.")
                synthesize_sapi(text, dest)
        duration = max(media_duration(dest) + 0.55, 2.6)
        timed.append(
            {
                "id": scene_id,
                "durationSec": round(duration, 3),
                "audio": f"audio/{dest.name}",
            }
        )

    music = analysis.get("music") or ""
    music_ok = bool(music) and (VIDEO / "public" / music).exists()
    props = {
        "name": analysis.get("name") or "Project",
        "fullName": analysis.get("fullName") or analysis.get("name") or "Project",
        "description": analysis.get("description") or "",
        "language": analysis.get("language") or "",
        "stars": int(analysis.get("stars") or 0),
        "forks": int(analysis.get("forks") or 0),
        "hookStyle": analysis.get("hookStyle") or "problem",
        "hookText": analysis.get("hookText") or analysis.get("name") or "",
        "tagline": analysis.get("tagline") or "",
        "features": analysis.get("features") or [],
        "techStack": analysis.get("techStack") or [],
        "facts": analysis.get("facts") or [],
        "scenes": timed,
        "musicVolume": float(analysis.get("musicVolume") or 0.18),
    }
    if music_ok:
        props["music"] = music

    props_path = ROOT / "props.json"
    props_path.write_text(json.dumps(props, indent=2), encoding="utf-8")
    output = args.output or (ROOT / "out" / f"{safe_name(props['name'])}.mp4")
    if not output.is_absolute():
        output = (ROOT / output).resolve()
    render(ensure_node(), props_path, output)
    print(f"Done: {output}")
    return output


def main() -> None:
    args = parse_args()
    if args.collect:
        from collect import write_context

        path = write_context(require_repo(args.repo))
        print(f"Wrote {path}")
        print("Ask Cursor to write analysis.json from that brief, then run generate.py again.")
        return

    if not args.analysis.exists():
        from collect import write_context

        path = write_context(require_repo(args.repo))
        raise SystemExit(
            f"No script at {args.analysis}. Wrote {path}. "
            "Ask Cursor to write analysis.json, then run this again."
        )

    if os.environ.get("LOCAL_REPOVIDEO_PY") != "1" and not args.offline:
        ensure_venv()
        env = os.environ.copy()
        env["LOCAL_REPOVIDEO_PY"] = "1"
        raise SystemExit(
            subprocess.call([str(venv_python()), str(Path(__file__).resolve()), *sys.argv[1:]], env=env)
        )

    build(args)


if __name__ == "__main__":
    main()
