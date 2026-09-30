import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { VideoProps } from "../types";
import { Eyebrow, Stage } from "../components/Stage";

export const TechScene: React.FC<{ data: VideoProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = data.techStack.slice(0, 8);

  return (
    <Stage>
      <Eyebrow text="Built with" color={COLOR.gold} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 22,
          maxWidth: 1400,
        }}
      >
        {items.map((item, index) => {
          const enter = spring({
            frame: frame - 4 - index * 3,
            fps,
            config: { damping: 12, stiffness: 160 },
          });
          return (
            <div
              key={item.name}
              style={{
                opacity: enter,
                transform: `scale(${0.86 + enter * 0.14})`,
                background: COLOR.card,
                border: `1px solid ${COLOR.line}`,
                borderRadius: 999,
                padding: "18px 28px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              <span>{item.emoji}</span>
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
