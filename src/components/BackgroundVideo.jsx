import { AbsoluteFill, OffthreadVideo, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// -----------------------------------------------------------------------------
// CLIP HELPER
// -----------------------------------------------------------------------------
const V = (name) => staticFile('videos/' + name + '.mp4');

// -----------------------------------------------------------------------------
// PER-DAY CLIP SETS  (4 clips per day -- downloaded by GitHub Actions via Pixabay)
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
  // -- Week 13 Final (Days 85-90) --
  day85: [ V('day85_clip1'), V('day85_clip2'), V('day85_clip3'), V('day85_clip4') ],
  day86: [ V('day86_clip1'), V('day86_clip2'), V('day86_clip3'), V('day86_clip4') ],
  day87: [ V('day87_clip1'), V('day87_clip2'), V('day87_clip3'), V('day87_clip4') ],
  day88: [ V('day88_clip1'), V('day88_clip2'), V('day88_clip3'), V('day88_clip4') ],
  day89: [ V('day89_clip1'), V('day89_clip2'), V('day89_clip3'), V('day89_clip4') ],
  day90: [ V('day90_clip1'), V('day90_clip2'), V('day90_clip3'), V('day90_clip4') ],
};

// -----------------------------------------------------------------------------
// PER-DAY MOTION PROFILES -- All 90 days
// clipDur: frames per clip | xfade: crossfade frames | hookBurst: zoom on frame 0
// kb: Ken Burns intensity | rot: rotation drift | panY: enable vertical pan
// -----------------------------------------------------------------------------
const MOTION_PROFILES = {
  // -- Week 5 --
  day29: { clipDur: 280, xfade: 14, flash: 'rgba(255, 80,  0,  0.5)',  hookBurst: true,  kb: 0.055, rot: 0.18, panY: true  },
  day30: { clipDur: 210, xfade: 10, flash: 'rgba( 20,120,255, 0.5)',   hookBurst: true,  kb: 0.06,  rot: 0.12, panY: true  },
  day31: { clipDur: 165, xfade:  7, flash: 'rgba(255, 90,  0,  0.55)', hookBurst: true,  kb: 0.07,  rot: 0.22, panY: false },
  day32: { clipDur: 195, xfade:  9, flash: 'rgba(  0,200,255, 0.5)',   hookBurst: false, kb: 0.05,  rot: 0.10, panY: false },
  day33: { clipDur: 250, xfade: 12, flash: 'rgba(  0,210,100, 0.45)',  hookBurst: false, kb: 0.045, rot: 0.08, panY: true  },
  day34: { clipDur: 155, xfade:  6, flash: 'rgba(170,  0,255, 0.55)',  hookBurst: true,  kb: 0.08,  rot: 0.25, panY: false },
  day35: { clipDur: 260, xfade: 13, flash: 'rgba( 30, 80,255, 0.45)',  hookBurst: false, kb: 0.04,  rot: 0.08, panY: true  },
  // -- Week 6 --
  day36: { clipDur: 195, xfade:  9, flash: 'rgba(  0,200, 60,  0.5)',  hookBurst: true,  kb: 0.065, rot: 0.15, panY: true  },
  day37: { clipDur: 175, xfade:  8, flash: 'rgba(255,150,  0,  0.5)',  hookBurst: true,  kb: 0.07,  rot: 0.20, panY: false },
  day38: { clipDur: 200, xfade: 10, flash: 'rgba( 50,130,255, 0.5)',   hookBurst: false, kb: 0.055, rot: 0.12, panY: false },
  day39: { clipDur: 180, xfade:  8, flash: 'rgba(220,  0,220, 0.5)',   hookBurst: true,  kb: 0.075, rot: 0.22, panY: true  },
  day40: { clipDur: 160, xfade:  7, flash: 'rgba(255, 80,  0,  0.55)', hookBurst: true,  kb: 0.08,  rot: 0.24, panY: false },
  day41: { clipDur: 215, xfade: 11, flash: 'rgba(  0,150,255, 0.5)',   hookBurst: false, kb: 0.05,  rot: 0.10, panY: false },
  day42: { clipDur: 255, xfade: 13, flash: 'rgba(220,175,  0,  0.45)', hookBurst: false, kb: 0.042, rot: 0.08, panY: true  },
  // -- Week 7 --
  day43: { clipDur: 185, xfade:  9, flash: 'rgba(255, 30, 60,  0.5)',  hookBurst: true,  kb: 0.068, rot: 0.18, panY: false },
  day44: { clipDur: 200, xfade: 10, flash: 'rgba(255,140,  0,  0.5)',  hookBurst: false, kb: 0.055, rot: 0.12, panY: true  },
  day45: { clipDur: 240, xfade: 12, flash: 'rgba(220,170,  0,  0.45)', hookBurst: true,  kb: 0.048, rot: 0.10, panY: true  },
  day46: { clipDur: 195, xfade:  9, flash: 'rgba(  0,200,120, 0.5)',   hookBurst: false, kb: 0.06,  rot: 0.14, panY: false },
  day47: { clipDur: 180, xfade:  8, flash: 'rgba(160,  0,255, 0.55)',  hookBurst: true,  kb: 0.07,  rot: 0.20, panY: false },
  day48: { clipDur: 170, xfade:  7, flash: 'rgba(255, 30, 60,  0.55)', hookBurst: true,  kb: 0.075, rot: 0.22, panY: false },
  day49: { clipDur: 258, xfade: 13, flash: 'rgba( 30,120,255, 0.45)',  hookBurst: false, kb: 0.042, rot: 0.08, panY: true  },
  // -- Week 8 --
  day50: { clipDur: 235, xfade: 12, flash: 'rgba(220,170,  0,  0.48)', hookBurst: true,  kb: 0.05,  rot: 0.12, panY: true  },
  day51: { clipDur: 200, xfade: 10, flash: 'rgba(  0,185,255, 0.5)',   hookBurst: false, kb: 0.06,  rot: 0.14, panY: false },
  day52: { clipDur: 168, xfade:  7, flash: 'rgba(255, 65,  0,  0.55)', hookBurst: true,  kb: 0.078, rot: 0.24, panY: false },
  day53: { clipDur: 210, xfade: 10, flash: 'rgba( 50,220,100, 0.45)',  hookBurst: false, kb: 0.055, rot: 0.12, panY: true  },
  day54: { clipDur: 245, xfade: 12, flash: 'rgba(160,  0,240, 0.5)',   hookBurst: false, kb: 0.045, rot: 0.08, panY: true  },
  day55: { clipDur: 220, xfade: 11, flash: 'rgba(255, 60,150, 0.48)',  hookBurst: false, kb: 0.052, rot: 0.10, panY: true  },
  day56: { clipDur: 252, xfade: 13, flash: 'rgba(220,165,  0,  0.45)', hookBurst: false, kb: 0.044, rot: 0.08, panY: true  },
  // -- Week 9 --
  day57: { clipDur: 205, xfade: 10, flash: 'rgba(255,140,  0,  0.5)',  hookBurst: true,  kb: 0.062, rot: 0.16, panY: true  },
  day58: { clipDur: 195, xfade:  9, flash: 'rgba(  0,180,255, 0.5)',   hookBurst: false, kb: 0.058, rot: 0.12, panY: false },
  day59: { clipDur: 185, xfade:  8, flash: 'rgba(200,  0,220, 0.52)',  hookBurst: true,  kb: 0.07,  rot: 0.20, panY: false },
  day60: { clipDur: 240, xfade: 12, flash: 'rgba(220,170,  0,  0.48)', hookBurst: true,  kb: 0.05,  rot: 0.10, panY: true  },
  day61: { clipDur: 175, xfade:  8, flash: 'rgba(255, 30, 60,  0.55)', hookBurst: true,  kb: 0.072, rot: 0.22, panY: false },
  day62: { clipDur: 200, xfade: 10, flash: 'rgba(160, 60,255, 0.52)',  hookBurst: false, kb: 0.06,  rot: 0.14, panY: false },
  day63: { clipDur: 250, xfade: 13, flash: 'rgba(  0,180,255, 0.45)',  hookBurst: false, kb: 0.044, rot: 0.08, panY: true  },
  // -- Week 10 --
  day64: { clipDur: 190, xfade:  9, flash: 'rgba(255,100,  0,  0.5)',  hookBurst: true,  kb: 0.065, rot: 0.18, panY: false },
  day65: { clipDur: 205, xfade: 10, flash: 'rgba(  0,160,255, 0.5)',   hookBurst: false, kb: 0.058, rot: 0.12, panY: false },
  day66: { clipDur: 180, xfade:  8, flash: 'rgba(180,  0,255, 0.52)',  hookBurst: true,  kb: 0.07,  rot: 0.20, panY: false },
  day67: { clipDur: 225, xfade: 11, flash: 'rgba(255, 60,150, 0.48)',  hookBurst: false, kb: 0.052, rot: 0.10, panY: true  },
  day68: { clipDur: 185, xfade:  8, flash: 'rgba(255,140,  0,  0.5)',  hookBurst: true,  kb: 0.068, rot: 0.18, panY: false },
  day69: { clipDur: 215, xfade: 11, flash: 'rgba( 50,200, 80,  0.48)', hookBurst: false, kb: 0.055, rot: 0.12, panY: true  },
  day70: { clipDur: 240, xfade: 12, flash: 'rgba(220,165,  0,  0.48)', hookBurst: true,  kb: 0.05,  rot: 0.10, panY: true  },
  // -- Week 11 --
  day71: { clipDur: 200, xfade: 10, flash: 'rgba( 50,220,100, 0.5)',   hookBurst: true,  kb: 0.062, rot: 0.16, panY: false },
  day72: { clipDur: 195, xfade:  9, flash: 'rgba(255,100,  0,  0.5)',  hookBurst: false, kb: 0.058, rot: 0.12, panY: true  },
  day73: { clipDur: 205, xfade: 10, flash: 'rgba(  0,180,255, 0.5)',   hookBurst: false, kb: 0.06,  rot: 0.14, panY: false },
  day74: { clipDur: 185, xfade:  8, flash: 'rgba(200,  0,220, 0.52)',  hookBurst: true,  kb: 0.07,  rot: 0.20, panY: false },
  day75: { clipDur: 245, xfade: 12, flash: 'rgba(220,170,  0,  0.48)', hookBurst: false, kb: 0.046, rot: 0.08, panY: true  },
  day76: { clipDur: 175, xfade:  8, flash: 'rgba(255, 60,  0,  0.55)', hookBurst: true,  kb: 0.072, rot: 0.22, panY: false },
  day77: { clipDur: 168, xfade:  7, flash: 'rgba(255, 30, 60,  0.55)', hookBurst: true,  kb: 0.076, rot: 0.24, panY: false },
  // -- Week 12 --
  day78: { clipDur: 195, xfade:  9, flash: 'rgba(255,130,  0,  0.5)',  hookBurst: true,  kb: 0.064, rot: 0.16, panY: false },
  day79: { clipDur: 210, xfade: 10, flash: 'rgba( 40,140,255, 0.5)',   hookBurst: false, kb: 0.058, rot: 0.12, panY: true  },
  day80: { clipDur: 220, xfade: 11, flash: 'rgba(220,165,  0,  0.48)', hookBurst: true,  kb: 0.055, rot: 0.12, panY: true  },
  day81: { clipDur: 190, xfade:  9, flash: 'rgba( 50,210, 90,  0.5)',  hookBurst: true,  kb: 0.066, rot: 0.18, panY: false },
  day82: { clipDur: 215, xfade: 11, flash: 'rgba(220,165,  0,  0.5)',  hookBurst: true,  kb: 0.056, rot: 0.12, panY: true  },
  day83: { clipDur: 185, xfade:  8, flash: 'rgba(170, 50,255, 0.52)',  hookBurst: false, kb: 0.068, rot: 0.18, panY: false },
  day84: { clipDur: 200, xfade: 10, flash: 'rgba(255, 90,  0,  0.5)',  hookBurst: true,  kb: 0.062, rot: 0.16, panY: false },
  // -- Week 13 Final --
  day85: { clipDur: 210, xfade: 10, flash: 'rgba(  0,180,255, 0.5)',   hookBurst: true,  kb: 0.06,  rot: 0.14, panY: false },
  day86: { clipDur: 175, xfade:  8, flash: 'rgba(255, 30, 60,  0.55)', hookBurst: true,  kb: 0.074, rot: 0.22, panY: false },
  day87: { clipDur: 200, xfade: 10, flash: 'rgba(220,165,  0,  0.5)',  hookBurst: true,  kb: 0.062, rot: 0.16, panY: false },
  day88: { clipDur: 215, xfade: 11, flash: 'rgba(  0,160,255, 0.5)',   hookBurst: false, kb: 0.056, rot: 0.12, panY: true  },
  day89: { clipDur: 230, xfade: 11, flash: 'rgba(255, 60,150, 0.48)',  hookBurst: false, kb: 0.05,  rot: 0.10, panY: true  },
  day90: { clipDur: 270, xfade: 14, flash: 'rgba(220,165,  0,  0.55)', hookBurst: true,  kb: 0.045, rot: 0.08, panY: true  },
};

// -----------------------------------------------------------------------------
// KEN BURNS DIRECTION TABLE
// Each clip index gets a unique direction combination
// [zoomDir, panXDir, panYDir]
//   zoomDir:  1 = zoom in,  -1 = zoom out
//   panXDir:  1 = move right, -1 = move left,  0 = no X pan
//   panYDir:  1 = move down,  -1 = move up,    0 = no Y pan
// -----------------------------------------------------------------------------
const KB_DIRS = [
  {  zoomDir:  1, panXDir: -1, panYDir:  0 },  // clip 0: zoom in + pan left
  {  zoomDir: -1, panXDir:  1, panYDir:  0 },  // clip 1: zoom out + pan right
  {  zoomDir:  1, panXDir:  0, panYDir: -1 },  // clip 2: zoom in + tilt up
  {  zoomDir: -1, panXDir: -1, panYDir:  1 },  // clip 3: zoom out + pan left + tilt down
  {  zoomDir:  1, panXDir:  1, panYDir:  1 },  // clip 4: zoom in + pan right + tilt down
  {  zoomDir: -1, panXDir:  0, panYDir: -1 },  // clip 5: zoom out + tilt up
];

// -----------------------------------------------------------------------------
// FLASH TRANSITION
// -----------------------------------------------------------------------------
const FlashTransition = ({ clipIndex, flashColor, duration }) => {
  const frame = useCurrentFrame();
  if (clipIndex === 0) return null;
  const flashOpacity = interpolate(frame, [0, duration], [1, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{
      background: '#FFFFFF',
      opacity: flashOpacity,
      pointerEvents: 'none',
    }} />
  );
};

// -----------------------------------------------------------------------------
// HOOK BURST (frame 0-14: rapid zoom punch on first clip entry)
// -----------------------------------------------------------------------------
const HookBurst = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!active) return null;
  const s = spring({ fps, frame, config: { damping: 6, stiffness: 320, mass: 0.5 } });
  const burstScale = interpolate(s, [0, 1], [1.12, 1.0]);
  const burstOpacity = interpolate(frame, [0, 3, 14], [0.7, 0, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{
      transform: `scale(${burstScale})`,
      opacity: burstOpacity,
      pointerEvents: 'none',
      background: 'rgba(255,255,255,0.06)',
    }} />
  );
};

// -----------------------------------------------------------------------------
// INDIVIDUAL CLIP
// Handles: Ken Burns zoom/pan/tilt/rotation, crossfade, flash, hook burst
// -----------------------------------------------------------------------------
const BackgroundClip = ({ src, clipIndex, startFrame, clipDuration, profile, isFirst }) => {
  const frame = useCurrentFrame();
  const endFrame = startFrame + clipDuration;
  const dir = KB_DIRS[clipIndex % KB_DIRS.length];

  // -- Crossfade opacity --
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + profile.xfade, endFrame - profile.xfade, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // -- Ken Burns zoom --
  const zoomBase  = 1.0;
  const zoomRange = profile.kb;
  const zoom = interpolate(
    frame,
    [startFrame, endFrame],
    dir.zoomDir === 1
      ? [zoomBase, zoomBase + zoomRange]
      : [zoomBase + zoomRange, zoomBase],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // -- Horizontal pan --
  const PAN_X_RANGE = 18;
  const panX = dir.panXDir === 0 ? 0 : interpolate(
    frame,
    [startFrame, endFrame],
    dir.panXDir === 1 ? [0, PAN_X_RANGE] : [PAN_X_RANGE, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // -- Vertical pan (optional per profile) --
  const PAN_Y_RANGE = 12;
  const panY = (!profile.panY || dir.panYDir === 0) ? 0 : interpolate(
    frame,
    [startFrame, endFrame],
    dir.panYDir === 1 ? [0, PAN_Y_RANGE] : [PAN_Y_RANGE, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // -- Subtle rotation drift --
  const ROT_RANGE = profile.rot;
  const rotation = interpolate(
    frame,
    [startFrame, endFrame],
    clipIndex % 2 === 0 ? [0, ROT_RANGE] : [ROT_RANGE, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{
        transform: `scale(${zoom}) translateX(${panX}px) translateY(${panY}px) rotate(${rotation}deg)`,
      }}>
        <OffthreadVideo
          src={staticFile('videos/' + src)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* Flash at clip entry */}
      <FlashTransition clipIndex={clipIndex} duration={profile.xfade} />

      {/* Hook burst on very first clip only */}
      {isFirst && profile.hookBurst && <HookBurst active={true} />}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// AMBIENT PULSE (very subtle global brightness pulse -- once every ~120 frames)
// Keeps the video feeling alive during longer text holds
// -----------------------------------------------------------------------------
const AmbientPulse = () => {
  const frame = useCurrentFrame();
  const pulseFrames = [120, 240, 360, 480, 600, 720];
  const nearestPulse = pulseFrames.find(p => frame >= p && frame
  );
};

// -----------------------------------------------------------------------------
// OUTRO FADE TO BLACK (last 25 frames -- clean black exit)
// -----------------------------------------------------------------------------
const OutroFade = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeOpacity = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  if (fadeOpacity
  );
};

// -----------------------------------------------------------------------------
// MAIN EXPORT
// -----------------------------------------------------------------------------
// -- End Fade --
const EndFade = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [870, 900], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (opacity <= 0) return null;
  return <AbsoluteFill style={{ background: '#000', opacity, pointerEvents: 'none' }} />;
};

export const BackgroundVideo = ({ videoId }) => {
  const clips   = VIDEO_SETS[videoId]      || VIDEO_SETS.day29;
  const profile = MOTION_PROFILES[videoId] || MOTION_PROFILES.day29;

  // Distribute clips evenly across 900 frames regardless of clip count
  const totalFrames = 900;
  const baseClipDur = profile.clipDur;

  // Build clip schedule -- fill 900 frames
  const schedule = [];
  let cursor = 0;
  clips.forEach((src, i) => {
    if (cursor >= totalFrames) return;
    const isLast = i === clips.length - 1;
    const dur = isLast
      ? Math.max(totalFrames - cursor, baseClipDur)
      : Math.min(baseClipDur, totalFrames - cursor);
    schedule.push({ src, clipIndex: i, startFrame: cursor, dur });
    cursor += dur;
  });

  return (
    <AbsoluteFill style={{ background: '#000' }}>

      {schedule.map(({ src, clipIndex, startFrame, dur }, i) => (
        <BackgroundClip
          key={i}
          src={src}
          clipIndex={clipIndex}
          startFrame={startFrame}
          clipDuration={dur}
          profile={profile}
          isFirst={i === 0}
        />
      ))}

      {/* Ambient brightness pulses -- keeps long text holds alive */}
      <AmbientPulse />

      {/* Clean black fade at very end -- handled by EndFade component */}
      <EndFade />

    </AbsoluteFill>
  );
};
