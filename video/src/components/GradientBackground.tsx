import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLOR } from "../theme";

export const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.015) * 8;

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${48 + drift}% 38%, #312e81 0%, rgba(49,46,129,0) 52%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 80% 88%, rgba(45,212,191,0.16) 0%, rgba(45,212,191,0) 42%)",
        }}
      />
    </AbsoluteFill>
  );
};
