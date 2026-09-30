"""Collect a local repo brief for the Cursor model that writes analysis.json."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKIP_DIRS = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "out",
    "dist",
    "release",
    "build",
    "coverage",
    ".next",
    ".cursor",
    "__pycache__",
    "target",
    ".idea",
    ".vscode",
}

SCHEMA = """
Write `analysis.json` in this folder. No Gemini. You are the writer.
Keep voiceover lines spoken, short, and specific to THIS repo.
Do not invent GitHub stars. Use hookStyle "problem" unless the repo is a public project with real star counts.
Skip scenes that do not apply. Do not include private records, tokens, passwords, or people from data files.

{
  "name": "ProjectName",
  "fullName": "ProjectName",
  "description": "One sentence.",
  "language": "TypeScript",
  "stars": 0,
  "forks": 0,
  "hookStyle": "problem",
  "hookText": "Short line shown on the opening frame.",
  "tagline": "Eight words or fewer.",
  "features": [
    {"emoji": "✉️", "title": "Short title", "desc": "One line"}
  ],
  "techStack": [
    {"emoji": "⚛️", "name": "React"}
  ],
  "facts": [
    {"value": "1", "label": "folder"},
    {"value": "0", "label": "API keys"},
    {"value": "1080p", "label": "picture"}
  ],
  "scenes": ["hook", "what", "features", "tech", "facts", "cta"],
  "voice": "en-US-AndrewNeural",
  "voiceover": {
    "hook": "Spoken line for the opening.",
    "what": "Spoken line for what it is.",
    "features": "Spoken line for the feature cards.",
    "tech": "Spoken line for the stack.",
    "facts": "Spoken line for the numbers.",
    "cta": "Spoken closing line."
  }
}

Allowed scenes: hook, what, features, tech, facts, stats, cta.
hookStyle: problem | momentum | counter.
facts values that are plain integers count up on screen. Other values are shown as text.
"""


def _hidden_or_heavy(child: Path) -> bool:
    if child.name in SKIP_DIRS or child.name.startswith("."):
        return True
    try:
        return child.resolve() == ROOT.resolve()
    except OSError:
        return True


def write_context(repo: Path, dest: Path | None = None) -> Path:
    repo = repo.expanduser().resolve()
    if not repo.is_dir():
        raise SystemExit(f"Not a directory: {repo}")
    dest = dest or (ROOT / "repo-context.md")
    parts = [
        f"# Repo context for {repo.name}",
        "",
        f"Path: `{repo}`",
        "",
        "Use this brief to rewrite `analysis.json`. Do not send this file anywhere.",
        "",
    ]

    readme = repo / "README.md"
    if readme.exists():
        text = readme.read_text(encoding="utf-8", errors="replace")[:12000]
        parts.extend(["## README", "", text, ""])

    package = repo / "package.json"
    if package.exists():
        data = json.loads(package.read_text(encoding="utf-8"))
        brief = {
            "name": data.get("name"),
            "description": data.get("description"),
            "dependencies": sorted((data.get("dependencies") or {}).keys()),
            "devDependencies": sorted((data.get("devDependencies") or {}).keys()),
        }
        parts.extend(["## package.json", "", "```json", json.dumps(brief, indent=2), "```", ""])

    pages = sorted(p.name for p in (repo / "src" / "pages").glob("*.tsx")) if (repo / "src" / "pages").exists() else []
    components = []
    comp_root = repo / "src" / "components"
    if comp_root.exists():
        for child in sorted(comp_root.iterdir()):
            if child.name.startswith("."):
                continue
            components.append(child.name + ("/" if child.is_dir() else ""))

    parts.extend(
        [
            "## Surfaces",
            "",
            "Pages: " + (", ".join(pages) or "(none)"),
            "",
            "Components: " + (", ".join(components) or "(none)"),
            "",
            "## Top-level entries",
            "",
        ]
    )
    for child in sorted(repo.iterdir()):
        if _hidden_or_heavy(child):
            continue
        parts.append(f"- {child.name}{'/' if child.is_dir() else ''}")

    parts.extend(["", "## analysis.json schema", "", SCHEMA.strip(), ""])
    dest.write_text("\n".join(parts), encoding="utf-8")
    return dest


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Write repo-context.md for the Cursor script step")
    parser.add_argument("--repo", type=Path, required=True, help="Local project to describe")
    args = parser.parse_args()
    path = write_context(args.repo)
    print(f"Wrote {path}")
    print("Next: ask Cursor to rewrite analysis.json from that brief, then run generate.py")
