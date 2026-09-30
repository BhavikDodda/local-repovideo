import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { HookScene } from "./scenes/HookScene";
import { WhatScene } from "./scenes/WhatScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { TechScene } from "./scenes/TechScene";
import { FactsScene } from "./scenes/FactsScene";
import { StatsScene } from "./scenes/StatsScene";
import { CtaScene } from "./scenes/CtaScene";
import { COLOR } from "./theme";
import { FPS, SceneId, TRANSITION_FRAMES, VideoProps } from "./types";

const SceneBody: React.FC<{ id: SceneId; data: VideoProps }> = ({ id, data }) => {
  switch (id) {
    case "hook":
      return <HookScene data={data} />;
    case "what":
      return <WhatScene data={data} />;
    case "features":
      return <FeaturesScene data={data} />;
    case "tech":
      return <TechScene data={data} />;
    case "facts":
      return <FactsScene data={data} />;
    case "stats":
      return <StatsScene data={data} />;
    case "cta":
      return <CtaScene data={data} />;
    default:
      return <HookScene data={data} />;
  }
};

export const ExplainerVideo: React.FC<VideoProps> = (props) => {
  const items: React.ReactNode[] = [];

  props.scenes.forEach((scene, index) => {
    const frames = Math.max(1, Math.ceil(scene.durationSec * FPS));
    items.push(
      <TransitionSeries.Sequence key={scene.id} durationInFrames={frames}>
        <SceneBody id={scene.id} data={props} />
        {scene.audio ? <Audio src={staticFile(scene.audio)} /> : null}
      </TransitionSeries.Sequence>,
    );
    if (index < props.scenes.length - 1) {
      items.push(
        <TransitionSeries.Transition
          key={`${scene.id}-slide`}
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />,
      );
    }
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.bg }}>
      {props.music ? (
        <Audio src={staticFile(props.music)} volume={props.musicVolume ?? 0.18} />
      ) : null}
      <TransitionSeries>{items}</TransitionSeries>
    </AbsoluteFill>
  );
};
