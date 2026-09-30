import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../theme";
import { VideoProps } from "../types";
import { Stage } from "../components/Stage";

export const StatsScene: React.FC<{ data: VideoProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14 } });
  const cells = [
    { value: data.stars.toLocaleString(), label: "Stars", color: COLOR.gold },
    { value: data.forks.toLocaleString(), label: "Forks", color: COLOR.blue },
    { value: data.language || "Code", label: "Language", color: COLOR.teal },
  ];

  return (
    <Stage>
      <div style={{ display: "flex", gap: 28, opacity: enter }}>
        {cells.map((cell) => (
          <div
            key={cell.label}
            style={{
              minWidth: 320,
              background: COLOR.card,
              border: `1px solid ${COLOR.line}`,
              borderRadius: 28,
              padding: "36px 28px",
            }}
          >
            <div style={{ fontSize: 72, fontWeight: 700, color: cell.color, letterSpacing: "-0.04em" }}>
              {cell.value}
            </div>
            <div style={{ marginTop: 8, color: COLOR.muted, fontSize: 24 }}>{cell.label}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};
