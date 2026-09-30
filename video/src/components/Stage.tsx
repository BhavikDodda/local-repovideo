import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, FONT } from "../theme";
import { GradientBackground } from "./GradientBackground";
import { AbsoluteFill } from "remotion";

export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: COLOR.text }}>
      <GradientBackground />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "72px 96px",
          textAlign: "center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Eyebrow: React.FC<{ text: string; color?: string }> = ({
  text,
  color = COLOR.purple,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${(1 - enter) * 18}px)`,
        color,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        marginBottom: 28,
      }}
    >
      {text}
    </div>
  );
};

export const SlamText: React.FC<{
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  weight?: number;
  maxWidth?: number;
}> = ({
  text,
  fontSize = 72,
  color = COLOR.text,
  delay = 0,
  weight = 700,
  maxWidth = 1500,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: Math.round(fontSize * 0.28),
        rowGap: Math.round(fontSize * 0.18),
        maxWidth,
        lineHeight: 1.08,
      }}
    >
      {words.map((word, index) => {
        const enter = spring({
          frame: frame - delay - index * 2,
          fps,
          config: { damping: 14, mass: 0.55, stiffness: 180 },
        });
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight: weight,
              color,
              opacity: enter,
              transform: `translateY(${(1 - enter) * 42}px)`,
              letterSpacing: "-0.02em",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
