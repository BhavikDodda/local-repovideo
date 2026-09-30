import { Composition } from "remotion";
import { ExplainerVideo } from "./ExplainerVideo";
import { FPS, defaultProps, durationInFrames } from "./types";

export const RemotionRoot: React.FC<Record<string, never>> = () => {
  return (
    <Composition
      id="Explainer"
      component={ExplainerVideo}
      durationInFrames={durationInFrames(defaultProps)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        return { durationInFrames: durationInFrames(props) };
      }}
    />
  );
};
