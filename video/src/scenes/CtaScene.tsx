import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { VideoProps } from "../types";
import { SlamText, Stage } from "../components/Stage";

export const CtaScene: React.FC<{ data: VideoProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 130 } });
  const pill = spring({ frame: frame - 12, fps, config: { damping: 14 } });

  return (
    <Stage>
      <div
        style={{
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          opacity: enter,
          transform: `scale(${0.9 + enter * 0.1})`,
        }}
      >
        {data.name}
      </div>
      <div style={{ height: 22 }} />
      <SlamText text={data.tagline} fontSize={36} color={COLOR.muted} delay={6} weight={600} />
      <div
        style={{
          marginTop: 42,
          opacity: pill,
          transform: `translateY(${(1 - pill) * 16}px)`,
          border: `1px solid ${COLOR.purple}`,
          color: COLOR.purple,
          borderRadius: 999,
          padding: "14px 28px",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        On this computer
      </div>
    </Stage>
  );
};
