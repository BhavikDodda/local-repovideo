export type SceneId =
  | "hook"
  | "what"
  | "features"
  | "tech"
  | "facts"
  | "stats"
  | "cta";

export type Feature = { emoji: string; title: string; desc: string };
export type TechItem = { emoji: string; name: string };
export type Fact = { value: string; label: string };

export type SceneTiming = {
  id: SceneId;
  durationSec: number;
  audio: string;
};

export type VideoProps = {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  hookStyle: "problem" | "momentum" | "counter";
  hookText: string;
  tagline: string;
  features: Feature[];
  techStack: TechItem[];
  facts: Fact[];
  scenes: SceneTiming[];
  music?: string;
  musicVolume?: number;
};

export const FPS = 30;
export const TRANSITION_FRAMES = 8;

export function durationInFrames(props: VideoProps): number {
  const body = props.scenes.reduce(
    (sum, scene) => sum + Math.ceil(scene.durationSec * FPS),
    0,
  );
  const overlap = Math.max(0, props.scenes.length - 1) * TRANSITION_FRAMES;
  return Math.max(1, body - overlap);
}

export const defaultProps: VideoProps = {
  name: "Preview",
  fullName: "Preview",
  description: "Local explainer preview",
  language: "TypeScript",
  stars: 0,
  forks: 0,
  hookStyle: "problem",
  hookText: "A local repo. No GitHub page required.",
  tagline: "Written here. Rendered here.",
  features: [
    { emoji: "1", title: "Collect", desc: "Read the repo on disk" },
    { emoji: "2", title: "Script", desc: "Cursor writes the voiceover" },
    { emoji: "3", title: "Render", desc: "Neural voice plus motion" },
  ],
  techStack: [
    { emoji: "Py", name: "Python" },
    { emoji: "Rx", name: "Remotion" },
  ],
  facts: [
    { value: "0", label: "API keys" },
    { value: "1", label: "local folder" },
  ],
  scenes: [{ id: "hook", durationSec: 3, audio: "" }],
};
