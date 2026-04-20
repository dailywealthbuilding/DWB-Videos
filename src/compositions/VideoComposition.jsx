// src/compositions/VideoComposition.jsx -- DWB v9.1
// FILE PATH: src/compositions/VideoComposition.jsx

import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { BackgroundVideo }       from '../components/BackgroundVideo.jsx';
import { TextOverlay }           from '../components/TextOverlay.jsx';
import { AudioTrack }            from '../components/AudioTrack.jsx';
import { Particles }             from '../components/Particles.jsx';
import { SpecialOverlays }       from '../components/SpecialOverlays.jsx';
import { tryRenderExtension }    from '../components/TextOverlayExtensions.jsx';

// Extended animation names handled by TextOverlayExtensions
const EXTENDED_ANIMATIONS = new Set([
  'word-pop','stamp-impact','newspaper-highlight','stacked-giant',
  'kinetic-mixed','diagonal-cascade','magnetic-snap','spotlight-reveal',
  'comic-impact','gold-foil-sweep','neon-flicker','elastic-snap',
  'wave-cascade','ticker-news','rotate-y-flip',
]);

// Wrapper that calls tryRenderExtension correctly
const ExtOverlay = ({ overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const result = tryRenderExtension(overlay, frame, fps);
  return result || null;
};

export const VideoComposition = ({
  videoId        = 'day37',
  music          = 'day37.mp3',
  overlays       = [],
  backgroundMode,
  customClips,
  photos,
  photoSpeed,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const validOverlays = (overlays || []).filter(o =>
    o && o.text && o.animation &&
    typeof o.startFrame === 'number' &&
    typeof o.endFrame   === 'number' &&
    o.startFrame < o.endFrame &&
    o.endFrame <= durationInFrames
  );

  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>

      {/* 1. BACKGROUND VIDEO */}
      <BackgroundVideo
        videoId={videoId}
        overlays={validOverlays}
        customClips={customClips}
        backgroundMode={backgroundMode}
      />

      {/* 2. PARTICLES */}
      <Particles videoId={videoId} />

      {/* 3. TEXT OVERLAYS */}
      {validOverlays.map((overlay, i) => {
        const duration = overlay.endFrame - overlay.startFrame;
        if (duration <= 0) return null;

        const relOverlay = {
          ...overlay,
          startFrame: 0,
          endFrame:   duration,
        };

        return (
          <Sequence
            key={i}
            from={overlay.startFrame}
            durationInFrames={duration}
          >
            {EXTENDED_ANIMATIONS.has(overlay.animation)
              ? <ExtOverlay overlay={relOverlay} />
              : <TextOverlay overlay={relOverlay} />
            }
          </Sequence>
        );
      })}

      {/* 4. SPECIAL OVERLAYS */}
      <SpecialOverlays videoId={videoId} totalFrames={durationInFrames} />

      {/* 5. AUDIO */}
      <AudioTrack music={music} videoId={videoId} />

    </AbsoluteFill>
  );
};
