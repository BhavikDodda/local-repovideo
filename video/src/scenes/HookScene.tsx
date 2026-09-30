import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { VideoProps } from "../types";
import { Eyebrow, SlamText, Stage } from "../components/Stage";

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.floor(value / 1000)}K+`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K+`;
  return value.toLocaleString();
}

export const HookScene: React.FC<{ data: VideoProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (data.hookStyle === "counter" && data.stars >= 1000) {
    const count = Math.floor(
      interpolate(frame, [0, fps * 1.6], [0, data.stars], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      }),
    );
    const enter = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
    return (
      <Stage>
        <Eyebrow text="The number" />
        <div
          style={{
            fontSize: 168,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            color: COLOR.gold,
            opacity: enter,
            transform: `scale(${0.86 + enter * 0.14})`,
          }}
        >
          {count.toLocaleString()}+
        </div>
        <div style={{ marginTop: 8, color: COLOR.dim, fontSize: 28, letterSpacing: "0.18em" }}>
          GITHUB STARS
        </div>
        <div style={{ marginTop: 36 }}>
          <SlamText text={data.hookText} fontSize={42} delay={12} weight={600} />
        </div>
      </Stage>
    );
  }

  if (data.hookStyle === "momentum" && data.stars >= 100) {
    return (
      <Stage>
        <Eyebrow text="Climbing" color={COLOR.teal} />
        <div style={{ fontSize: 140, fontWeight: 700, letterSpacing: "-0.05em", color: COLOR.teal }}>
          {formatCount(data.stars)}
        </div>
        <div style={{ marginTop: 8, color: COLOR.dim, fontSize: 28, letterSpacing: "0.16em" }}>
          STARS AND CLIMBING
        </div>
        <div style={{ marginTop: 36 }}>
          <SlamText text={data.hookText} fontSize={42} delay={10} weight={600} />
        </div>
      </Stage>
    );
  }

  return (
    <Stage>
      <Eyebrow text="The problem" />
      <SlamText text={data.hookText} fontSize={data.hookText.length > 48 ? 68 : 84} />
    </Stage>
  );
};
