// src/compositions/VideoComposition.jsx -- DWB v10.0
// FILE PATH: src/compositions/VideoComposition.jsx
//
// v10 CHANGES:
//   1. Passes clipManifest to BackgroundVideo for mood-aware clip selection
//   2. Extended animation set -- routes to TextOverlayExtensions for special anims
//   3. Cleaner Sequence handling

import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { BackgroundVideo }    from '../components/BackgroundVideo.jsx';
import { TextOverlay }        from '../components/TextOverlay.jsx';
import { AudioTrack }         from '../components/AudioTrack.jsx';
import { Particles }          from '../components/Particles.jsx';
import { SpecialOverlays }    from '../components/SpecialOverlays.jsx';
import { tryRenderExtension } from '../components/TextOverlayExtensions.jsx';

// Animations handled by TextOverlayExtensions (v8/v9 special effects)
// TextOverlay v10 handles everything else natively
const EXTENDED_ANIMATIONS = new Set([
  'word-pop', 'stamp-impact-ext', 'newspaper-highlight', 'stacked-giant',
  'kinetic-mixed', 'diagonal-cascade', 'magnetic-snap', 'spotlight-reveal',
  'comic-impact', 'gold-foil-sweep', 'neon-flicker', 'elastic-snap',
  'wave-cascade', 'ticker-news', 'rotate-y-flip',
]);

// Wrapper that calls tryRenderExtension with correct frame/fps
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
  clipManifest,   // v10 NEW: passed from index.jsx if public/clip-manifest.json exists
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const validOverlays = (overlays || []).filter(o =>
    o &&
    o.text &&
    o.animation &&
    typeof o.startFrame === 'number' &&
    typeof o.endFrame   === 'number' &&
    o.startFrame < o.endFrame &&
    o.endFrame <= durationInFrames
  );

  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>

      {/* 1. BACKGROUND VIDEO -- v10: receives clipManifest for mood-aware selection */}
      <BackgroundVideo
        videoId={videoId}
        overlays={validOverlays}
        customClips={customClips}
        backgroundMode={backgroundMode}
        clipManifest={clipManifest}
      />

      {/* 2. PARTICLES */}
      <Particles videoId={videoId} />

      {/* 3. TEXT OVERLAYS */}
      {validOverlays.map((overlay, i) => {
        const duration = overlay.endFrame - overlay.startFrame;
        if (duration <= 0) return null;

        // Pass overlay with startFrame=0 -- Sequence handles the timing offset
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

      {/* 4. SPECIAL OVERLAYS -- watermark, day badge, progress bar */}
      <SpecialOverlays videoId={videoId} totalFrames={durationInFrames} />

      {/* 5. AUDIO */}
      <AudioTrack music={music} videoId={videoId} />

    </AbsoluteFill>
  );
};
