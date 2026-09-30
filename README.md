# local-repovideo

Turn a folder on your machine into a short explainer video.

[RepoToVideo](https://github.com/Shubhamsaboo/repotovideo) by [Shubham Saboo](https://github.com/Shubhamsaboo) is the project this one is built from. That tool takes a public GitHub URL, asks Gemini to read the repo page and write a promo script, speaks the lines with Gemini TTS, and renders a 1080p video with [Remotion](https://www.remotion.dev/). It is MIT licensed.

This repo keeps that three-step shape — script, voice, render — and changes who does each step:

- The input is a **local folder**. Nothing is fetched from a GitHub repo page.
- **Cursor writes the script.** `analysis.json` is plain JSON. This project does not call Gemini, and it does not ship an API key.
- **Speech is [edge-tts](https://github.com/rany2/edge-tts)** (Microsoft neural voices). On Windows, `--offline` uses the built-in speech synthesizer instead.
- **Rendering is still Remotion**, with new scene components: kinetic type on a dark frame, slide cuts, and a facts scene for projects that should not show star counts.
- Star and fork numbers appear only if you put real ones in the script. The sample uses a problem hook and a facts scene.

## Try the sample

Python 3.10+, Node.js 18+, and FFmpeg need to be on your PATH.

```bash
git clone https://github.com/BhavikDodda/local-repovideo.git
cd local-repovideo
python generate.py --analysis analysis-example.json --output local-repovideo.mp4
```

The first run creates a virtualenv, installs edge-tts, installs Remotion, and downloads a headless Chrome. A rendered copy of that sample is already in this folder: `local-repovideo.mp4`. The brief it came from is `repo-context-example.md`, and the script is `analysis-example.json`. Those three files are meant to be committed.

FFmpeg: `winget install Gyan.FFmpeg` on Windows, `brew install ffmpeg` on macOS, `sudo apt install ffmpeg` on Debian or Ubuntu.

## Make a video of your project

From this folder:

```bash
python generate.py --collect --repo /path/to/your/project
```

That writes `repo-context.md` (a README excerpt, dependency names, and the JSON schema). It skips build folders, dotfolders, and this tool if it sits inside the project. It does not upload the brief.

In Cursor, ask for `analysis.json` from that brief. A usable prompt:

> Read `repo-context.md` and write `analysis.json` in this folder. Follow the schema at the bottom. Keep the voiceover short and specific. Do not invent GitHub stars. Leave out secrets, tokens, and private records.

Then render:

```bash
python generate.py
```

`analysis.json` and `repo-context.md` are gitignored, so a script for your own project stays on your machine. `analysis-example.json` is the template.

```bash
python generate.py --voice en-US-AriaNeural
python generate.py --offline
python generate.py --output D:\videos\demo.mp4
```

`--offline` is Windows-only. On macOS and Linux the voice step uses edge-tts, which sends **only the spoken lines** to Microsoft's read-aloud service. The repo files stay local.

## Scenes

`scenes` in the JSON picks the order. Each chosen scene needs a `voiceover` line.

| Scene | On screen |
| --- | --- |
| `hook` | Opening line. `hookStyle` is `problem`, `momentum`, or `counter`. |
| `what` | Project name and tagline. |
| `features` | Up to four cards. |
| `tech` | Stack pills. |
| `facts` | Up to three figures. Integer values count up. |
| `stats` | Stars, forks, and language. Use this only with counts you actually know. |
| `cta` | Name, tagline, and a closing pill. |

`counter` and `momentum` need a real `stars` value (1000+ and 100+). Smaller numbers fall through to the problem hook.

Optional music: put an mp3 in `video/public/` and set `"music": "music/bed.mp3"` plus `"musicVolume"` in the JSON.

## Layout

```
generate.py                 voice + Remotion render
collect.py                  writes repo-context.md from a local folder
repo-context-example.md     collect output for this folder
analysis-example.json       sample script written from that brief
local-repovideo.mp4         sample render
video/                      Remotion composition
out/                        other renders (gitignored)
```

## License

MIT. See [LICENSE](LICENSE).

RepoToVideo is also MIT. This repository does not copy that codebase. The pipeline idea, the scene list, and the Remotion render step come from that project. The collector, the Cursor script step, the voice step, and the scene components here are new.
