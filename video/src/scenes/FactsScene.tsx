import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { VideoProps } from "../types";
import { Eyebrow, Stage } from "../components/Stage";

function displayValue(raw: string, frame: number, fps: number): string {
  if (!/^\d+$/.test(raw)) return raw;
  const target = Number(raw);
  const count = Math.floor(
    interpolate(frame, [4, fps * 0.9], [0, target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  return String(count);
}

export const FactsScene: React.FC<{ data: VideoProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const facts = data.facts.slice(0, 3);

  return (
    <Stage>
      <Eyebrow text="On this machine" />
      <div style={{ display: "flex", gap: 36, justifyContent: "center", width: 1500 }}>
        {facts.map((fact, index) => {
          const enter = spring({
            frame: frame - index * 4,
            fps,
            config: { damping: 13, stiffness: 140 },
          });
          return (
            <div
              key={fact.label}
              style={{
                flex: 1,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 28}px)`,
                background: COLOR.card,
                border: `1px solid ${COLOR.line}`,
                borderRadius: 32,
                padding: "42px 24px",
              }}
            >
              <div
                style={{
                  fontSize: 92,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  color: index === 1 ? COLOR.teal : index === 2 ? COLOR.gold : COLOR.blue,
                }}
              >
                {displayValue(fact.value, frame, fps)}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 26,
                  color: COLOR.muted,
                  letterSpacing: "0.04em",
                }}
              >
                {fact.label}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
