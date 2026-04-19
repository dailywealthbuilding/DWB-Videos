// src/compositions/VideoComposition.jsx -- DWB v9.0
// FILE PATH: src/compositions/VideoComposition.jsx
//
// v9 UPDATE: Passes overlays to BackgroundVideo so it can sync clips to text timing

import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { BackgroundVideo }      from '../components/BackgroundVideo.jsx';
import { TextOverlay }          from '../components/TextOverlay.jsx';
import { AudioTrack }           from '../components/AudioTrack.jsx';
import { Particles }            from '../components/Particles.jsx';
import { SpecialOverlays }      from '../components/SpecialOverlays.jsx';
import { TextOverlayExtensions } from '../components/TextOverlayExtensions.jsx';

// Animation registry -- determines which component handles which animation
const EXTENDED_ANIMATIONS = new Set([
  'word-pop','stamp-impact','newspaper-highlight','stacked-giant',
  'kinetic-mixed','diagonal-cascade','magnetic-snap','spotlight-reveal',
  'comic-impact','gold-foil-sweep','neon-flicker','elastic-snap',
  'wave-cascade','ticker-news','rotate-y-flip',
]);

export const VideoComposition = ({
  videoId        = 'day37',
  music          = 'day37.mp3',
  overlays       = [],
  backgroundMode,
  customClips,
  photos,
  photoSpeed,
}) => {
  const frame        = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Validate overlays
  const validOverlays = (overlays || []).filter(o =>
    o && o.text && o.animation &&
    typeof o.startFrame === 'number' &&
    typeof o.endFrame   === 'number' &&
    o.startFrame < o.endFrame &&
    o.endFrame <= durationInFrames
  );

  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>

      {/* 1. BACKGROUND VIDEO
          Now receives overlays so it can sync clips to overlay timing.
          Each overlay segment gets its own mood-matched clip. */}
      <BackgroundVideo
        videoId={videoId}
        overlays={validOverlays}
        customClips={customClips}
        backgroundMode={backgroundMode}
      />

      {/* 2. PARTICLES (optional ambient effect) */}
      <Particles videoId={videoId} />

      {/* 3. TEXT OVERLAYS
          Each overlay is wrapped in a Sequence so it only renders during its window.
          Extended animations use TextOverlayExtensions, standard use TextOverlay. */}
      {validOverlays.map((overlay, i) => {
        const duration = overlay.endFrame - overlay.startFrame;
        if (duration <= 0) return null;

        // The overlay component receives frame relative to its Sequence start
        const Component = EXTENDED_ANIMATIONS.has(overlay.animation)
          ? TextOverlayExtensions
          : TextOverlay;

        return (
          <Sequence
            key={i}
            from={overlay.startFrame}
            durationInFrames={duration}
          >
            <Component
              overlay={{
                ...overlay,
                // Make endFrame/startFrame relative to Sequence (starts at 0)
                startFrame: 0,
                endFrame:   duration,
              }}
            />
          </Sequence>
        );
      })}

      {/* 4. SPECIAL OVERLAYS: channel name, day counter, progress bar */}
      <SpecialOverlays videoId={videoId} totalFrames={durationInFrames} />

      {/* 5. AUDIO */}
      <AudioTrack music={music} videoId={videoId} />

    </AbsoluteFill>
  );
};
