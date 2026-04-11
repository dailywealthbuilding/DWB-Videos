// src/components/BackgroundVideo.jsx -- DWB v7.0
//
// KEY FIXES vs v6:
// - VIDEO_SETS uses EXPLICIT entries (not dynamic loop) so Remotion
//   bundler can statically analyze which files are needed.
// - 6 clips per day (clip1 through clip6) matching the 6 bRollQueries
//   downloaded by render.yml.
// - staticFile() usage: staticFile('videos/name.mp4') -- NO 'public/' prefix.
//   Remotion resolves this correctly against the public dir.
// - loop muted on OffthreadVideo -- prevents frozen last-frame bug.
// - kb (Ken Burns) max 0.04 -- CSS scale above 1.06 blurs video frames.
// - Photo carousel mode supported via backgroundMode: 'photo-carousel'.
// - Custom clips via customClips: ['custom/myfile.mp4'] in content file.

import {
  OffthreadVideo, Img, useCurrentFrame, useVideoConfig,
  interpolate, spring, Easing, staticFile,
} from 'remotion';
import { AbsoluteFill } from 'remotion';

// -----------------------------------------------------------------------------
// PATH HELPERS
// staticFile('videos/name.mp4') → Remotion resolves against public dir
// DO NOT add 'public/' prefix here -- that causes double-pathing.
// -----------------------------------------------------------------------------
const V = (name) =>
  name.startsWith('custom/')
    ? staticFile('videos/' + name)
    : staticFile('videos/' + name + '.mp4');

const P = (name) => staticFile('photos/' + name);

// -----------------------------------------------------------------------------
// VIDEO_SETS -- 6 clips per day
// EXPLICIT entries required for Remotion's static bundle analysis.
// Covers days 29-90 (Weeks 5-13).
// -----------------------------------------------------------------------------
const VIDEO_SETS = {
  // Week 5 (days 29-35)
  day29: [V('day29_clip1'),V('day29_clip2'),V('day29_clip3'),V('day29_clip4'),V('day29_clip5'),V('day29_clip6')],
  day30: [V('day30_clip1'),V('day30_clip2'),V('day30_clip3'),V('day30_clip4'),V('day30_clip5'),V('day30_clip6')],
  day31: [V('day31_clip1'),V('day31_clip2'),V('day31_clip3'),V('day31_clip4'),V('day31_clip5'),V('day31_clip6')],
  day32: [V('day32_clip1'),V('day32_clip2'),V('day32_clip3'),V('day32_clip4'),V('day32_clip5'),V('day32_clip6')],
  day33: [V('day33_clip1'),V('day33_clip2'),V('day33_clip3'),V('day33_clip4'),V('day33_clip5'),V('day33_clip6')],
  day34: [V('day34_clip1'),V('day34_clip2'),V('day34_clip3'),V('day34_clip4'),V('day34_clip5'),V('day34_clip6')],
  day35: [V('day35_clip1'),V('day35_clip2'),V('day35_clip3'),V('day35_clip4'),V('day35_clip5'),V('day35_clip6')],
  // Week 6 (days 36-42)
  day36: [V('day36_clip1'),V('day36_clip2'),V('day36_clip3'),V('day36_clip4'),V('day36_clip5'),V('day36_clip6')],
  day37: [V('day37_clip1'),V('day37_clip2'),V('day37_clip3'),V('day37_clip4'),V('day37_clip5'),V('day37_clip6')],
  day38: [V('day38_clip1'),V('day38_clip2'),V('day38_clip3'),V('day38_clip4'),V('day38_clip5'),V('day38_clip6')],
  day39: [V('day39_clip1'),V('day39_clip2'),V('day39_clip3'),V('day39_clip4'),V('day39_clip5'),V('day39_clip6')],
  day40: [V('day40_clip1'),V('day40_clip2'),V('day40_clip3'),V('day40_clip4'),V('day40_clip5'),V('day40_clip6')],
  day41: [V('day41_clip1'),V('day41_clip2'),V('day41_clip3'),V('day41_clip4'),V('day41_clip5'),V('day41_clip6')],
  day42: [V('day42_clip1'),V('day42_clip2'),V('day42_clip3'),V('day42_clip4'),V('day42_clip5'),V('day42_clip6')],
  // Week 7 (days 43-49)
  day43: [V('day43_clip1'),V('day43_clip2'),V('day43_clip3'),V('day43_clip4'),V('day43_clip5'),V('day43_clip6')],
  day44: [V('day44_clip1'),V('day44_clip2'),V('day44_clip3'),V('day44_clip4'),V('day44_clip5'),V('day44_clip6')],
  day45: [V('day45_clip1'),V('day45_clip2'),V('day45_clip3'),V('day45_clip4'),V('day45_clip5'),V('day45_clip6')],
  day46: [V('day46_clip1'),V('day46_clip2'),V('day46_clip3'),V('day46_clip4'),V('day46_clip5'),V('day46_clip6')],
  day47: [V('day47_clip1'),V('day47_clip2'),V('day47_clip3'),V('day47_clip4'),V('day47_clip5'),V('day47_clip6')],
  day48: [V('day48_clip1'),V('day48_clip2'),V('day48_clip3'),V('day48_clip4'),V('day48_clip5'),V('day48_clip6')],
  day49: [V('day49_clip1'),V('day49_clip2'),V('day49_clip3'),V('day49_clip4'),V('day49_clip5'),V('day49_clip6')],
  // Week 8 (days 50-56)
  day50: [V('day50_clip1'),V('day50_clip2'),V('day50_clip3'),V('day50_clip4'),V('day50_clip5'),V('day50_clip6')],
  day51: [V('day51_clip1'),V('day51_clip2'),V('day51_clip3'),V('day51_clip4'),V('day51_clip5'),V('day51_clip6')],
  day52: [V('day52_clip1'),V('day52_clip2'),V('day52_clip3'),V('day52_clip4'),V('day52_clip5'),V('day52_clip6')],
  day53: [V('day53_clip1'),V('day53_clip2'),V('day53_clip3'),V('day53_clip4'),V('day53_clip5'),V('day53_clip6')],
  day54: [V('day54_clip1'),V('day54_clip2'),V('day54_clip3'),V('day54_clip4'),V('day54_clip5'),V('day54_clip6')],
  day55: [V('day55_clip1'),V('day55_clip2'),V('day55_clip3'),V('day55_clip4'),V('day55_clip5'),V('day55_clip6')],
  day56: [V('day56_clip1'),V('day56_clip2'),V('day56_clip3'),V('day56_clip4'),V('day56_clip5'),V('day56_clip6')],
  // Week 9 (days 57-63)
  day57: [V('day57_clip1'),V('day57_clip2'),V('day57_clip3'),V('day57_clip4'),V('day57_clip5'),V('day57_clip6')],
  day58: [V('day58_clip1'),V('day58_clip2'),V('day58_clip3'),V('day58_clip4'),V('day58_clip5'),V('day58_clip6')],
  day59: [V('day59_clip1'),V('day59_clip2'),V('day59_clip3'),V('day59_clip4'),V('day59_clip5'),V('day59_clip6')],
  day60: [V('day60_clip1'),V('day60_clip2'),V('day60_clip3'),V('day60_clip4'),V('day60_clip5'),V('day60_clip6')],
  day61: [V('day61_clip1'),V('day61_clip2'),V('day61_clip3'),V('day61_clip4'),V('day61_clip5'),V('day61_clip6')],
  day62: [V('day62_clip1'),V('day62_clip2'),V('day62_clip3'),V('day62_clip4'),V('day62_clip5'),V('day62_clip6')],
  day63: [V('day63_clip1'),V('day63_clip2'),V('day63_clip3'),V('day63_clip4'),V('day63_clip5'),V('day63_clip6')],
  // Week 10 (days 64-70)
  day64: [V('day64_clip1'),V('day64_clip2'),V('day64_clip3'),V('day64_clip4'),V('day64_clip5'),V('day64_clip6')],
  day65: [V('day65_clip1'),V('day65_clip2'),V('day65_clip3'),V('day65_clip4'),V('day65_clip5'),V('day65_clip6')],
  day66: [V('day66_clip1'),V('day66_clip2'),V('day66_clip3'),V('day66_clip4'),V('day66_clip5'),V('day66_clip6')],
  day67: [V('day67_clip1'),V('day67_clip2'),V('day67_clip3'),V('day67_clip4'),V('day67_clip5'),V('day67_clip6')],
  day68: [V('day68_clip1'),V('day68_clip2'),V('day68_clip3'),V('day68_clip4'),V('day68_clip5'),V('day68_clip6')],
  day69: [V('day69_clip1'),V('day69_clip2'),V('day69_clip3'),V('day69_clip4'),V('day69_clip5'),V('day69_clip6')],
  day70: [V('day70_clip1'),V('day70_clip2'),V('day70_clip3'),V('day70_clip4'),V('day70_clip5'),V('day70_clip6')],
  // Weeks 11-13 (days 71-90)
  day71: [V('day71_clip1'),V('day71_clip2'),V('day71_clip3'),V('day71_clip4'),V('day71_clip5'),V('day71_clip6')],
  day72: [V('day72_clip1'),V('day72_clip2'),V('day72_clip3'),V('day72_clip4'),V('day72_clip5'),V('day72_clip6')],
  day73: [V('day73_clip1'),V('day73_clip2'),V('day73_clip3'),V('day73_clip4'),V('day73_clip5'),V('day73_clip6')],
  day74: [V('day74_clip1'),V('day74_clip2'),V('day74_clip3'),V('day74_clip4'),V('day74_clip5'),V('day74_clip6')],
  day75: [V('day75_clip1'),V('day75_clip2'),V('day75_clip3'),V('day75_clip4'),V('day75_clip5'),V('day75_clip6')],
  day76: [V('day76_clip1'),V('day76_clip2'),V('day76_clip3'),V('day76_clip4'),V('day76_clip5'),V('day76_clip6')],
  day77: [V('day77_clip1'),V('day77_clip2'),V('day77_clip3'),V('day77_clip4'),V('day77_clip5'),V('day77_clip6')],
  day78: [V('day78_clip1'),V('day78_clip2'),V('day78_clip3'),V('day78_clip4'),V('day78_clip5'),V('day78_clip6')],
  day79: [V('day79_clip1'),V('day79_clip2'),V('day79_clip3'),V('day79_clip4'),V('day79_clip5'),V('day79_clip6')],
  day80: [V('day80_clip1'),V('day80_clip2'),V('day80_clip3'),V('day80_clip4'),V('day80_clip5'),V('day80_clip6')],
  day81: [V('day81_clip1'),V('day81_clip2'),V('day81_clip3'),V('day81_clip4'),V('day81_clip5'),V('day81_clip6')],
  day82: [V('day82_clip1'),V('day82_clip2'),V('day82_clip3'),V('day82_clip4'),V('day82_clip5'),V('day82_clip6')],
  day83: [V('day83_clip1'),V('day83_clip2'),V('day83_clip3'),V('day83_clip4'),V('day83_clip5'),V('day83_clip6')],
  day84: [V('day84_clip1'),V('day84_clip2'),V('day84_clip3'),V('day84_clip4'),V('day84_clip5'),V('day84_clip6')],
  day85: [V('day85_clip1'),V('day85_clip2'),V('day85_clip3'),V('day85_clip4'),V('day85_clip5'),V('day85_clip6')],
  day86: [V('day86_clip1'),V('day86_clip2'),V('day86_clip3'),V('day86_clip4'),V('day86_clip5'),V('day86_clip6')],
  day87: [V('day87_clip1'),V('day87_clip2'),V('day87_clip3'),V('day87_clip4'),V('day87_clip5'),V('day87_clip6')],
  day88: [V('day88_clip1'),V('day88_clip2'),V('day88_clip3'),V('day88_clip4'),V('day88_clip5'),V('day88_clip6')],
  day89: [V('day89_clip1'),V('day89_clip2'),V('day89_clip3'),V('day89_clip4'),V('day89_clip5'),V('day89_clip6')],
  day90: [V('day90_clip1'),V('day90_clip2'),V('day90_clip3'),V('day90_clip4'),V('day90_clip5'),V('day90_clip6')],
};

// Fallback set for any day not in VIDEO_SETS (Groq-generated day 50+)
const FALLBACK_CLIPS = [
  V('day50_clip1'),V('day50_clip2'),V('day50_clip3'),
  V('day50_clip4'),V('day50_clip5'),V('day50_clip6'),
];

// -----------------------------------------------------------------------------
// MOTION PROFILES -- per day
// kb max 0.04: CSS scale above 1.06 blurs video frames
// -----------------------------------------------------------------------------
const MOTION_PROFILES = {
  day29:{clipDur:150,xfade:7,hookBurst:true, kb:0.035,rot:0.07,panY:true},
  day30:{clipDur:145,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:true},
  day31:{clipDur:140,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day32:{clipDur:148,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:false},
  day33:{clipDur:152,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day34:{clipDur:138,xfade:5,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day35:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day36:{clipDur:148,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:true},
  day37:{clipDur:148,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:false},
  day38:{clipDur:150,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:false},
  day39:{clipDur:143,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:true},
  day40:{clipDur:138,xfade:5,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day41:{clipDur:152,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:false},
  day42:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day43:{clipDur:145,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:false},
  day44:{clipDur:150,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:true},
  day45:{clipDur:155,xfade:7,hookBurst:true, kb:0.03, rot:0.04,panY:true},
  day46:{clipDur:148,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day47:{clipDur:143,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day48:{clipDur:140,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day49:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day50:{clipDur:150,xfade:7,hookBurst:true, kb:0.03, rot:0.05,panY:true},
  day51:{clipDur:150,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day52:{clipDur:140,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day53:{clipDur:150,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:true},
  day54:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day55:{clipDur:152,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day56:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day57:{clipDur:148,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:true},
  day58:{clipDur:150,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:false},
  day59:{clipDur:145,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day60:{clipDur:155,xfade:7,hookBurst:true, kb:0.03, rot:0.04,panY:true},
  day61:{clipDur:140,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day62:{clipDur:150,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day63:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day64:{clipDur:148,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:false},
  day65:{clipDur:150,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:false},
  day66:{clipDur:143,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day67:{clipDur:152,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day68:{clipDur:145,xfade:6,hookBurst:true, kb:0.035,rot:0.06,panY:false},
  day69:{clipDur:152,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:true},
  day70:{clipDur:155,xfade:7,hookBurst:true, kb:0.03, rot:0.04,panY:true},
  day71:{clipDur:150,xfade:7,hookBurst:true, kb:0.035,rot:0.05,panY:false},
  day72:{clipDur:148,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:true},
  day73:{clipDur:148,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day74:{clipDur:143,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day75:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day76:{clipDur:140,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day77:{clipDur:138,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day78:{clipDur:148,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:false},
  day79:{clipDur:150,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:true},
  day80:{clipDur:152,xfade:7,hookBurst:true, kb:0.03, rot:0.05,panY:true},
  day81:{clipDur:148,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:false},
  day82:{clipDur:152,xfade:7,hookBurst:true, kb:0.03, rot:0.05,panY:true},
  day83:{clipDur:145,xfade:6,hookBurst:false,kb:0.035,rot:0.06,panY:false},
  day84:{clipDur:148,xfade:7,hookBurst:true, kb:0.035,rot:0.05,panY:false},
  day85:{clipDur:150,xfade:7,hookBurst:true, kb:0.035,rot:0.05,panY:false},
  day86:{clipDur:140,xfade:6,hookBurst:true, kb:0.04, rot:0.07,panY:false},
  day87:{clipDur:150,xfade:7,hookBurst:true, kb:0.035,rot:0.06,panY:false},
  day88:{clipDur:152,xfade:7,hookBurst:false,kb:0.03, rot:0.05,panY:true},
  day89:{clipDur:155,xfade:7,hookBurst:false,kb:0.03, rot:0.04,panY:true},
  day90:{clipDur:150,xfade:7,hookBurst:true, kb:0.03, rot:0.04,panY:true},
};

const DEFAULT_PROFILE = { clipDur:150, xfade:7, hookBurst:true, kb:0.035, rot:0.05, panY:true };

const KB_DIRS = [
  {zoomDir:1,  panXDir:-1, panYDir:0},
  {zoomDir:-1, panXDir:1,  panYDir:0},
  {zoomDir:1,  panXDir:0,  panYDir:-1},
  {zoomDir:-1, panXDir:-1, panYDir:1},
  {zoomDir:1,  panXDir:1,  panYDir:1},
  {zoomDir:-1, panXDir:0,  panYDir:-1},
];

// -----------------------------------------------------------------------------
// Flash Transition between clips
// -----------------------------------------------------------------------------
const FlashTransition = ({ clipIndex, duration }) => {
  const frame = useCurrentFrame();
  if (clipIndex === 0) return null;
  const op = interpolate(frame, [0, duration], [0.5, 0], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  return (
    <AbsoluteFill style={{ background: '#FFFFFF', opacity: op, pointerEvents: 'none' }} />
  );
};

// -----------------------------------------------------------------------------
// Hook burst on first clip
// -----------------------------------------------------------------------------
const HookBurst = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!active || frame > 14) return null;
  const s = spring({ fps, frame, config: { damping: 6, stiffness: 320, mass: 0.5 } });
  const scale = interpolate(s, [0, 1], [1.05, 1.0]);
  const op    = interpolate(frame, [0, 2, 14], [0.35, 0, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ transform: 'scale(' + scale + ')', opacity: op, pointerEvents: 'none', background: 'rgba(255,255,255,0.04)' }} />
  );
};

// -----------------------------------------------------------------------------
// Background Clip with Ken Burns + flash transition
// loop muted: prevents frozen last-frame bug when clip is shorter than slot
// -----------------------------------------------------------------------------
const BackgroundClip = ({ src, clipIndex, startFrame, clipDuration, profile, isFirst }) => {
  const frame  = useCurrentFrame();
  const endFrame = startFrame + clipDuration;
  const dir    = KB_DIRS[clipIndex % KB_DIRS.length];

  const opacity = interpolate(frame,
    [startFrame, startFrame + profile.xfade, endFrame - profile.xfade, endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const zoom = interpolate(frame, [startFrame, endFrame],
    dir.zoomDir === 1 ? [1.0, 1.0 + profile.kb] : [1.0 + profile.kb, 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const panX = dir.panXDir === 0 ? 0 : interpolate(frame, [startFrame, endFrame],
    dir.panXDir === 1 ? [0, 9] : [9, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const panY = (!profile.panY || dir.panYDir === 0) ? 0 : interpolate(frame, [startFrame, endFrame],
    dir.panYDir === 1 ? [0, 5] : [5, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rotation = interpolate(frame, [startFrame, endFrame],
    clipIndex % 2 === 0 ? [0, profile.rot * 0.4] : [profile.rot * 0.4, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{
        transform: 'scale(' + zoom + ') translateX(' + panX + 'px) translateY(' + panY + 'px) rotate(' + rotation + 'deg)',
      }}>
        {/* loop muted: critical -- prevents frozen last-frame when clip is short */}
        <OffthreadVideo
          src={src}
          loop
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      <FlashTransition clipIndex={clipIndex} duration={profile.xfade} />
      {isFirst && profile.hookBurst && <HookBurst active={true} />}
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// Photo Carousel mode
// Usage in content: backgroundMode:'photo-carousel', photos:['custom/img.jpg'], photoSpeed:20
// -----------------------------------------------------------------------------
const PhotoCarousel = ({ photos, framesPerPhoto = 20 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  if (!photos || photos.length === 0) return null;

  const schedule = [];
  let cursor = 0, idx = 0;
  while (cursor < durationInFrames + framesPerPhoto) {
    schedule.push({ src: P(photos[idx % photos.length]), startFrame: cursor, idx });
    cursor += framesPerPhoto;
    idx++;
  }

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {schedule.map(({ src, startFrame, idx: i }) => {
        const local = frame - startFrame;
        if (local < -3 || local > framesPerPhoto + 3) return null;
        const opacity = interpolate(local,
          [0, 4, framesPerPhoto - 4, framesPerPhoto],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const dir  = KB_DIRS[i % KB_DIRS.length];
        const zoom = interpolate(local, [0, framesPerPhoto],
          dir.zoomDir === 1 ? [1.0, 1.04] : [1.04, 1.0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const panX = dir.panXDir === 0 ? 0 : interpolate(local, [0, framesPerPhoto],
          dir.panXDir === 1 ? [0, 7] : [7, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            <AbsoluteFill style={{ transform: 'scale(' + zoom + ') translateX(' + panX + 'px)' }}>
              <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// Subtle ambient pulse between clips
const AmbientPulse = () => {
  const frame = useCurrentFrame();
  const pulses = [120, 240, 360, 480, 600, 720];
  const nearest = pulses.find(p => frame >= p && frame < p + 12);
  if (nearest === undefined) return null;
  const op = interpolate(frame - nearest, [0, 4, 12], [0, 0.035, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: 'rgba(255,255,255,' + op + ')', pointerEvents: 'none' }} />;
};

// Fade to black at end
const EndFade = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [870, 900], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (op <= 0) return null;
  return <AbsoluteFill style={{ background: '#000', opacity: op, pointerEvents: 'none' }} />;
};

// -----------------------------------------------------------------------------
// MAIN EXPORT
// Props: videoId, backgroundMode, customClips, photos, photoSpeed
// -----------------------------------------------------------------------------
export const BackgroundVideo = ({ videoId, backgroundMode, customClips, photos, photoSpeed }) => {
  const profile = MOTION_PROFILES[videoId] || DEFAULT_PROFILE;
  const { durationInFrames } = useVideoConfig();

  // Photo carousel mode
  if (backgroundMode === 'photo-carousel') {
    return (
      <AbsoluteFill style={{ background: '#000' }}>
        <PhotoCarousel photos={photos || []} framesPerPhoto={photoSpeed || 20} />
        <AmbientPulse />
        <EndFade />
      </AbsoluteFill>
    );
  }

  // Determine clip list
  // Priority: customClips prop > VIDEO_SETS lookup > FALLBACK_CLIPS
  let clips;
  if (customClips && customClips.length > 0) {
    clips = customClips.map(function(c) {
      return c.startsWith('custom/')
        ? staticFile('videos/' + c)
        : staticFile('videos/' + c + '.mp4');
    });
  } else {
    clips = VIDEO_SETS[videoId] || FALLBACK_CLIPS;
  }

  // Distribute clips evenly across 900 frames
  const baseClipDur = Math.floor(durationInFrames / clips.length);
  const schedule = [];
  let cursor = 0;
  clips.forEach(function(src, i) {
    if (cursor >= durationInFrames) return;
    const isLast = i === clips.length - 1;
    const dur = isLast
      ? Math.max(durationInFrames - cursor, baseClipDur)
      : Math.min(baseClipDur, durationInFrames - cursor);
    schedule.push({ src, clipIndex: i, startFrame: cursor, dur });
    cursor += dur;
  });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {schedule.map(function({ src, clipIndex, startFrame, dur }, i) {
        return (
          <BackgroundClip
            key={i}
            src={src}
            clipIndex={clipIndex}
            startFrame={startFrame}
            clipDuration={dur}
            profile={profile}
            isFirst={i === 0}
          />
        );
      })}
      <AmbientPulse />
      <EndFade />
    </AbsoluteFill>
  );
};
