// src/components/BackgroundVideo.jsx -- DWB Background Engine v2.1
//
// PIPELINE RULES (never break these):
//   - OffthreadVideo ONLY -- never use <Video />
//   - staticFile() for all asset paths
//   - 4 clips per day, 900 frames total, 225 frames per clip
//   - Clip files named: dayXX_clip1.mp4 ... dayXX_clip4.mp4
//   - Stored in public/videos/
//   - AbsoluteFill wraps everything
// -----------------------------------------------------------------------------

import {
  AbsoluteFill,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from 'remotion';

// -----------------------------------------------------------------------------
// HELPER -- shorthand for video file paths
// -----------------------------------------------------------------------------
const V = (name) => staticFile('videos/' + name + '.mp4');

// -----------------------------------------------------------------------------
// PER-DAY CLIP SETS
// 4 clips per day -- downloaded via GitHub Actions (Pixabay Smart Multi-Source)
// -----------------------------------------------------------------------------
const VIDEO_SETS = {
  // -- Week 5 (Days 29-35) --
  day29: [ V('day29_clip1'), V('day29_clip2'), V('day29_clip3'), V('day29_clip4') ],
  day30: [ V('day30_clip1'), V('day30_clip2'), V('day30_clip3'), V('day30_clip4') ],
  day31: [ V('day31_clip1'), V('day31_clip2'), V('day31_clip3'), V('day31_clip4') ],
  day32: [ V('day32_clip1'), V('day32_clip2'), V('day32_clip3'), V('day32_clip4') ],
  day33: [ V('day33_clip1'), V('day33_clip2'), V('day33_clip3'), V('day33_clip4') ],
  day34: [ V('day34_clip1'), V('day34_clip2'), V('day34_clip3'), V('day34_clip4') ],
  day35: [ V('day35_clip1'), V('day35_clip2'), V('day35_clip3'), V('day35_clip4') ],
  // -- Week 6 (Days 36-42) --
  day36: [ V('day36_clip1'), V('day36_clip2'), V('day36_clip3'), V('day36_clip4') ],
  day37: [ V('day37_clip1'), V('day37_clip2'), V('day37_clip3'), V('day37_clip4') ],
  day38: [ V('day38_clip1'), V('day38_clip2'), V('day38_clip3'), V('day38_clip4') ],
  day39: [ V('day39_clip1'), V('day39_clip2'), V('day39_clip3'), V('day39_clip4') ],
  day40: [ V('day40_clip1'), V('day40_clip2'), V('day40_clip3'), V('day40_clip4') ],
  day41: [ V('day41_clip1'), V('day41_clip2'), V('day41_clip3'), V('day41_clip4') ],
  day42: [ V('day42_clip1'), V('day42_clip2'), V('day42_clip3'), V('day42_clip4') ],
  // -- Week 7 (Days 43-49) --
  day43: [ V('day43_clip1'), V('day43_clip2'), V('day43_clip3'), V('day43_clip4') ],
  day44: [ V('day44_clip1'), V('day44_clip2'), V('day44_clip3'), V('day44_clip4') ],
  day45: [ V('day45_clip1'), V('day45_clip2'), V('day45_clip3'), V('day45_clip4') ],
  day46: [ V('day46_clip1'), V('day46_clip2'), V('day46_clip3'), V('day46_clip4') ],
  day47: [ V('day47_clip1'), V('day47_clip2'), V('day47_clip3'), V('day47_clip4') ],
  day48: [ V('day48_clip1'), V('day48_clip2'), V('day48_clip3'), V('day48_clip4') ],
  day49: [ V('day49_clip1'), V('day49_clip2'), V('day49_clip3'), V('day49_clip4') ],
  // -- Week 8 (Days 50-56) --
  day50: [ V('day50_clip1'), V('day50_clip2'), V('day50_clip3'), V('day50_clip4') ],
  day51: [ V('day51_clip1'), V('day51_clip2'), V('day51_clip3'), V('day51_clip4') ],
  day52: [ V('day52_clip1'), V('day52_clip2'), V('day52_clip3'), V('day52_clip4') ],
  day53: [ V('day53_clip1'), V('day53_clip2'), V('day53_clip3'), V('day53_clip4') ],
  day54: [ V('day54_clip1'), V('day54_clip2'), V('day54_clip3'), V('day54_clip4') ],
  day55: [ V('day55_clip1'), V('day55_clip2'), V('day55_clip3'), V('day55_clip4') ],
  day56: [ V('day56_clip1'), V('day56_clip2'), V('day56_clip3'), V('day56_clip4') ],
  // -- Week 9 (Days 57-63) --
  day57: [ V('day57_clip1'), V('day57_clip2'), V('day57_clip3'), V('day57_clip4') ],
  day58: [ V('day58_clip1'), V('day58_clip2'), V('day58_clip3'), V('day58_clip4') ],
  day59: [ V('day59_clip1'), V('day59_clip2'), V('day59_clip3'), V('day59_clip4') ],
  day60: [ V('day60_clip1'), V('day60_clip2'), V('day60_clip3'), V('day60_clip4') ],
  day61: [ V('day61_clip1'), V('day61_clip2'), V('day61_clip3'), V('day61_clip4') ],
  day62: [ V('day62_clip1'), V('day62_clip2'), V('day62_clip3'), V('day62_clip4') ],
  day63: [ V('day63_clip1'), V('day63_clip2'), V('day63_clip3'), V('day63_clip4') ],
  // -- Week 10 (Days 64-70) --
  day64: [ V('day64_clip1'), V('day64_clip2'), V('day64_clip3'), V('day64_clip4') ],
  day65: [ V('day65_clip1'), V('day65_clip2'), V('day65_clip3'), V('day65_clip4') ],
  day66: [ V('day66_clip1'), V('day66_clip2'), V('day66_clip3'), V('day66_clip4') ],
  day67: [ V('day67_clip1'), V('day67_clip2'), V('day67_clip3'), V('day67_clip4') ],
  day68: [ V('day68_clip1'), V('day68_clip2'), V('day68_clip3'), V('day68_clip4') ],
  day69: [ V('day69_clip1'), V('day69_clip2'), V('day69_clip3'), V('day69_clip4') ],
  day70: [ V('day70_clip1'), V('day70_clip2'), V('day70_clip3'), V('day70_clip4') ],
  // -- Week 11 (Days 71-77) --
  day71: [ V('day71_clip1'), V('day71_clip2'), V('day71_clip3'), V('day71_clip4') ],
  day72: [ V('day72_clip1'), V('day72_clip2'), V('day72_clip3'), V('day72_clip4') ],
  day73: [ V('day73_clip1'), V('day73_clip2'), V('day73_clip3'), V('day73_clip4') ],
  day74: [ V('day74_clip1'), V('day74_clip2'), V('day74_clip3'), V('day74_clip4') ],
  day75: [ V('day75_clip1'), V('day75_clip2'), V('day75_clip3'), V('day75_clip4') ],
  day76: [ V('day76_clip1'), V('day76_clip2'), V('day76_clip3'), V('day76_clip4') ],
  day77: [ V('day77_clip1'), V('day77_clip2'), V('day77_clip3'), V('day77_clip4') ],
  // -- Week 12 (Days 78-84) --
  day78: [ V('day78_clip1'), V('day78_clip2'), V('day78_clip3'), V('day78_clip4') ],
  day79: [ V('day79_clip1'), V('day79_clip2'), V('day79_clip3'), V('day79_clip4') ],
  day80: [ V('day80_clip1'), V('day80_clip2'), V('day80_clip3'), V('day80_clip4') ],
  day81: [ V('day81_clip1'), V('day81_clip2'), V('day81_clip3'), V('day81_clip4') ],
  day82: [ V('day82_clip1'), V('day82_clip2'), V('day82_clip3'), V('day82_clip4') ],
  day83: [ V('day83_clip1'), V('day83_clip2'), V('day83_clip3'), V('day83_clip4') ],
  day84: [ V('day84_clip1'), V('day84_clip2'), V('day84_clip3'), V('day84_clip4') ],
  // -- Week 13 -- GRAND FINALE (Days 85-90) --
  day85: [ V('day85_clip1'), V('day85_clip2'), V('day85_clip3'), V('day85_clip4') ],
  day86: [ V('day86_clip1'), V('day86_clip2'), V('day86_clip3'), V('day86_clip4') ],
  day87: [ V('day87_clip1'), V('day87_clip2'), V('day87_clip3'), V('day87_clip4') ],
  day88: [ V('day88_clip1'), V('day88_clip2'), V('day88_clip3'), V('day88_clip4') ],
  day89: [ V('day89_clip1'), V('day89_clip2'), V('day89_clip3'), V('day89_clip4') ],
  day90: [ V('day90_clip1'), V('day90_clip2'), V('day90_clip3'), V('day90_clip4') ],
};

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------
const CLIPS_PER_DAY    = 4;
const FRAMES_PER_CLIP  = 225;   // 900 frames / 4 clips = 225 each (7.5s @ 30fps)
const CROSSFADE_FRAMES = 12;    // smooth crossfade between clips

// -----------------------------------------------------------------------------
// CLIP SCHEDULE BUILDER
// Returns array of { src, startFrame, endFrame } objects
// -----------------------------------------------------------------------------
function buildClipSchedule(clips) {
  const schedule = [];
  let cursor = 0;
  for (let i = 0; i < clips.length; i++) {
    const src        = clips[i];
    const startFrame = cursor;
    const dur        = Math.min(FRAMES_PER_CLIP, 900 - cursor);
    schedule.push({ src, clipIndex: i, startFrame, endFrame: startFrame + dur });
    cursor += dur;
  }
  return schedule;
}

// -----------------------------------------------------------------------------
// SINGLE CLIP RENDERER
// Renders one OffthreadVideo clip with opacity crossfade on entry/exit
// -----------------------------------------------------------------------------
const BgClip = ({ src, clipIndex, startFrame, endFrame }) => {
  const frame = useCurrentFrame();

  // Only render when this clip is active (+ crossfade window)
  if (frame < startFrame - CROSSFADE_FRAMES || frame > endFrame + CROSSFADE_FRAMES) {
    return null;
  }

  const opacity = interpolate(
    frame,
    [
      startFrame - CROSSFADE_FRAMES,
      startFrame,
      endFrame,
      endFrame + CROSSFADE_FRAMES,
    ],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // playbackRate kept at 1; startFrom offset within the clip file itself
  const playbackOffset = 0;

  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        startFrom={playbackOffset}
        muted
      />
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// FALLBACK -- solid color when no clips are available for a day
// -----------------------------------------------------------------------------
const FallbackBg = ({ videoId }) => {
  const FALLBACK_COLORS = {
    default: '#0a0a0a',
    day29:   '#1a0000',
    day30:   '#000a1a',
    day60:   '#1a1a00',
    day90:   '#1a0a00',
  };
  const bg = FALLBACK_COLORS[videoId] || FALLBACK_COLORS.default;
  return (
    <AbsoluteFill style={{ background: bg }} />
  );
};

// -----------------------------------------------------------------------------
// MAIN EXPORT -- BackgroundVideo
//
// Props:
//   videoId {string}  -- e.g. 'day37'
// -----------------------------------------------------------------------------
export const BackgroundVideo = ({ videoId }) => {
  const clips = VIDEO_SETS[videoId];

  if (!clips || clips.length === 0) {
    return <FallbackBg videoId={videoId} />;
  }

  const schedule = buildClipSchedule(clips);

  return (
    <AbsoluteFill>
      {schedule.map((clip) => (
        <BgClip
          key={clip.clipIndex}
          src={clip.src}
          clipIndex={clip.clipIndex}
          startFrame={clip.startFrame}
          endFrame={clip.endFrame}
        />
      ))}
    </AbsoluteFill>
  );
};
