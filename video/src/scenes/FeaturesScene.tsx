import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { VideoProps } from "../types";
import { Eyebrow, Stage } from "../components/Stage";

export const FeaturesScene: React.FC<{ data: VideoProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = data.features.slice(0, 4);

  return (
    <Stage>
      <Eyebrow text="What it does" color={COLOR.teal} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: items.length > 1 ? "1fr 1fr" : "1fr",
          gap: 24,
          width: 1380,
        }}
      >
        {items.map((feature, index) => {
          const enter = spring({
            frame: frame - 6 - index * 5,
            fps,
            config: { damping: 14, stiffness: 150 },
          });
          return (
            <div
              key={feature.title}
              style={{
                opacity: enter,
                transform: `translateY(${(1 - enter) * 36}px)`,
                background: COLOR.card,
                border: `1px solid ${COLOR.line}`,
                borderRadius: 28,
                padding: "28px 32px",
                textAlign: "left",
                display: "flex",
                gap: 20,
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: 42, lineHeight: 1 }}>{feature.emoji}</div>
              <div>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em" }}>
                  {feature.title}
                </div>
                <div style={{ marginTop: 6, fontSize: 24, color: COLOR.muted, lineHeight: 1.3 }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
