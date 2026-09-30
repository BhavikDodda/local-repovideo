import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { VideoProps } from "../types";
import { Eyebrow, SlamText, Stage } from "../components/Stage";

export const WhatScene: React.FC<{ data: VideoProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 140 } });

  return (
    <Stage>
      <Eyebrow text="What it is" color={COLOR.blue} />
      <div
        style={{
          fontSize: 128,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          lineHeight: 0.95,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 28}px) scale(${0.94 + enter * 0.06})`,
        }}
      >
        {data.name}
      </div>
      <div style={{ height: 28 }} />
      <SlamText text={data.tagline} fontSize={40} color={COLOR.muted} delay={8} weight={600} />
    </Stage>
  );
};
