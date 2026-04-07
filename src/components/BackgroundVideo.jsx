import { OffthreadVideo, Img, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, staticFile } from 'remotion';
import { AbsoluteFill } from 'remotion';

// -----------------------------------------------------------------------------
// CUSTOM GALLERY SUPPORT
// Upload YOUR OWN videos to: public/videos/custom/myfile.mp4
// Upload YOUR OWN photos to: public/photos/custom/myfile.jpg
// Reference in week content file:
//   customClips: ['custom/myvid1.mp4', 'custom/myvid2.mp4']   (video mode)
//   photos: ['custom/img1.jpg', 'custom/img2.jpg']             (photo-carousel mode)
// -----------------------------------------------------------------------------

const V = (name) => name.startsWith('custom/') ? staticFile('videos/' + name) : staticFile('videos/' + name + '.mp4');
const P = (name) => staticFile('photos/' + name);

// 6 clips per day
const VIDEO_SETS = {
  day29: [V('day29_clip1'),V('day29_clip2'),V('day29_clip3'),V('day29_clip4')],
  day30: [V('day30_clip1'),V('day30_clip2'),V('day30_clip3'),V('day30_clip4')],
  day31: [V('day31_clip1'),V('day31_clip2'),V('day31_clip3'),V('day31_clip4')],
  day32: [V('day32_clip1'),V('day32_clip2'),V('day32_clip3'),V('day32_clip4')],
  day33: [V('day33_clip1'),V('day33_clip2'),V('day33_clip3'),V('day33_clip4')],
  day34: [V('day34_clip1'),V('day34_clip2'),V('day34_clip3'),V('day34_clip4')],
  day35: [V('day35_clip1'),V('day35_clip2'),V('day35_clip3'),V('day35_clip4')],
  day36: [V('day36_clip1'),V('day36_clip2'),V('day36_clip3'),V('day36_clip4')],
  day37: [V('day37_clip1'),V('day37_clip2'),V('day37_clip3'),V('day37_clip4')],
  day38: [V('day38_clip1'),V('day38_clip2'),V('day38_clip3'),V('day38_clip4')],
  day39: [V('day39_clip1'),V('day39_clip2'),V('day39_clip3'),V('day39_clip4')],
  day40: [V('day40_clip1'),V('day40_clip2'),V('day40_clip3'),V('day40_clip4')],
  day41: [V('day41_clip1'),V('day41_clip2'),V('day41_clip3'),V('day41_clip4')],
  day42: [V('day42_clip1'),V('day42_clip2'),V('day42_clip3'),V('day42_clip4')],
  day43: [V('day43_clip1'),V('day43_clip2'),V('day43_clip3'),V('day43_clip4')],
  day44: [V('day44_clip1'),V('day44_clip2'),V('day44_clip3'),V('day44_clip4')],
  day45: [V('day45_clip1'),V('day45_clip2'),V('day45_clip3'),V('day45_clip4')],
  day46: [V('day46_clip1'),V('day46_clip2'),V('day46_clip3'),V('day46_clip4')],
  day47: [V('day47_clip1'),V('day47_clip2'),V('day47_clip3'),V('day47_clip4')],
  day48: [V('day48_clip1'),V('day48_clip2'),V('day48_clip3'),V('day48_clip4')],
  day49: [V('day49_clip1'),V('day49_clip2'),V('day49_clip3'),V('day49_clip4')],
  day50: [V('day50_clip1'),V('day50_clip2'),V('day50_clip3'),V('day50_clip4')],
  day51: [V('day51_clip1'),V('day51_clip2'),V('day51_clip3'),V('day51_clip4')],
  day52: [V('day52_clip1'),V('day52_clip2'),V('day52_clip3'),V('day52_clip4')],
  day53: [V('day53_clip1'),V('day53_clip2'),V('day53_clip3'),V('day53_clip4')],
  day54: [V('day54_clip1'),V('day54_clip2'),V('day54_clip3'),V('day54_clip4')],
  day55: [V('day55_clip1'),V('day55_clip2'),V('day55_clip3'),V('day55_clip4')],
  day56: [V('day56_clip1'),V('day56_clip2'),V('day56_clip3'),V('day56_clip4')],
  day57: [V('day57_clip1'),V('day57_clip2'),V('day57_clip3'),V('day57_clip4')],
  day58: [V('day58_clip1'),V('day58_clip2'),V('day58_clip3'),V('day58_clip4')],
  day59: [V('day59_clip1'),V('day59_clip2'),V('day59_clip3'),V('day59_clip4')],
  day60: [V('day60_clip1'),V('day60_clip2'),V('day60_clip3'),V('day60_clip4')],
  day61: [V('day61_clip1'),V('day61_clip2'),V('day61_clip3'),V('day61_clip4')],
  day62: [V('day62_clip1'),V('day62_clip2'),V('day62_clip3'),V('day62_clip4')],
  day63: [V('day63_clip1'),V('day63_clip2'),V('day63_clip3'),V('day63_clip4')],
  day64: [V('day64_clip1'),V('day64_clip2'),V('day64_clip3'),V('day64_clip4')],
  day65: [V('day65_clip1'),V('day65_clip2'),V('day65_clip3'),V('day65_clip4')],
  day66: [V('day66_clip1'),V('day66_clip2'),V('day66_clip3'),V('day66_clip4')],
  day67: [V('day67_clip1'),V('day67_clip2'),V('day67_clip3'),V('day67_clip4')],
  day68: [V('day68_clip1'),V('day68_clip2'),V('day68_clip3'),V('day68_clip4')],
  day69: [V('day69_clip1'),V('day69_clip2'),V('day69_clip3'),V('day69_clip4')],
  day70: [V('day70_clip1'),V('day70_clip2'),V('day70_clip3'),V('day70_clip4')],
  day71: [V('day71_clip1'),V('day71_clip2'),V('day71_clip3'),V('day71_clip4')],
  day72: [V('day72_clip1'),V('day72_clip2'),V('day72_clip3'),V('day72_clip4')],
  day73: [V('day73_clip1'),V('day73_clip2'),V('day73_clip3'),V('day73_clip4')],
  day74: [V('day74_clip1'),V('day74_clip2'),V('day74_clip3'),V('day74_clip4')],
  day75: [V('day75_clip1'),V('day75_clip2'),V('day75_clip3'),V('day75_clip4')],
  day76: [V('day76_clip1'),V('day76_clip2'),V('day76_clip3'),V('day76_clip4')],
  day77: [V('day77_clip1'),V('day77_clip2'),V('day77_clip3'),V('day77_clip4')],
  day78: [V('day78_clip1'),V('day78_clip2'),V('day78_clip3'),V('day78_clip4')],
  day79: [V('day79_clip1'),V('day79_clip2'),V('day79_clip3'),V('day79_clip4')],
  day80: [V('day80_clip1'),V('day80_clip2'),V('day80_clip3'),V('day80_clip4')],
  day81: [V('day81_clip1'),V('day81_clip2'),V('day81_clip3'),V('day81_clip4')],
  day82: [V('day82_clip1'),V('day82_clip2'),V('day82_clip3'),V('day82_clip4')],
  day83: [V('day83_clip1'),V('day83_clip2'),V('day83_clip3'),V('day83_clip4')],
  day84: [V('day84_clip1'),V('day84_clip2'),V('day84_clip3'),V('day84_clip4')],
  day85: [V('day85_clip1'),V('day85_clip2'),V('day85_clip3'),V('day85_clip4')],
  day86: [V('day86_clip1'),V('day86_clip2'),V('day86_clip3'),V('day86_clip4')],
  day87: [V('day87_clip1'),V('day87_clip2'),V('day87_clip3'),V('day87_clip4')],
  day88: [V('day88_clip1'),V('day88_clip2'),V('day88_clip3'),V('day88_clip4')],
  day89: [V('day89_clip1'),V('day89_clip2'),V('day89_clip3'),V('day89_clip4')],
  day90: [V('day90_clip1'),V('day90_clip2'),V('day90_clip3'),V('day90_clip4')],
};

// Motion profiles -- kb reduced to max 0.04 to eliminate blur from scale transforms
const MOTION_PROFILES = {
  day29:{clipDur:165,xfade:8,hookBurst:true,kb:0.035,rot:0.08,panY:true},
  day30:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:true},
  day31:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day32:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:false},
  day33:{clipDur:160,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day34:{clipDur:135,xfade:5,hookBurst:true,kb:0.04,rot:0.08,panY:false},
  day35:{clipDur:165,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day36:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:true},
  day37:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.07,panY:false},
  day38:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:false},
  day39:{clipDur:145,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:true},
  day40:{clipDur:135,xfade:5,hookBurst:true,kb:0.04,rot:0.08,panY:false},
  day41:{clipDur:158,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:false},
  day42:{clipDur:162,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day43:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day44:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day45:{clipDur:162,xfade:8,hookBurst:true,kb:0.03,rot:0.04,panY:true},
  day46:{clipDur:150,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day47:{clipDur:145,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day48:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day49:{clipDur:160,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day50:{clipDur:155,xfade:7,hookBurst:true,kb:0.03,rot:0.05,panY:true},
  day51:{clipDur:155,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day52:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day53:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day54:{clipDur:160,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day55:{clipDur:157,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day56:{clipDur:162,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day57:{clipDur:152,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:true},
  day58:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:false},
  day59:{clipDur:148,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day60:{clipDur:160,xfade:8,hookBurst:true,kb:0.03,rot:0.04,panY:true},
  day61:{clipDur:142,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day62:{clipDur:155,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day63:{clipDur:160,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day64:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day65:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:false},
  day66:{clipDur:145,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day67:{clipDur:158,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day68:{clipDur:148,xfade:6,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day69:{clipDur:157,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day70:{clipDur:160,xfade:8,hookBurst:true,kb:0.03,rot:0.04,panY:true},
  day71:{clipDur:155,xfade:7,hookBurst:true,kb:0.035,rot:0.05,panY:false},
  day72:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day73:{clipDur:152,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day74:{clipDur:148,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day75:{clipDur:160,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day76:{clipDur:142,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day77:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day78:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day79:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day80:{clipDur:157,xfade:7,hookBurst:true,kb:0.03,rot:0.05,panY:true},
  day81:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day82:{clipDur:157,xfade:7,hookBurst:true,kb:0.03,rot:0.05,panY:true},
  day83:{clipDur:148,xfade:6,hookBurst:false,kb:0.035,rot:0.06,panY:false},
  day84:{clipDur:152,xfade:7,hookBurst:true,kb:0.035,rot:0.05,panY:false},
  day85:{clipDur:155,xfade:7,hookBurst:true,kb:0.035,rot:0.05,panY:false},
  day86:{clipDur:142,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day87:{clipDur:155,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day88:{clipDur:157,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day89:{clipDur:160,xfade:8,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day90:{clipDur:165,xfade:8,hookBurst:true,kb:0.03,rot:0.04,panY:true},
};

const KB_DIRS = [
  {zoomDir:1,panXDir:-1,panYDir:0},
  {zoomDir:-1,panXDir:1,panYDir:0},
  {zoomDir:1,panXDir:0,panYDir:-1},
  {zoomDir:-1,panXDir:-1,panYDir:1},
  {zoomDir:1,panXDir:1,panYDir:1},
  {zoomDir:-1,panXDir:0,panYDir:-1},
];

const FlashTransition = ({ clipIndex, duration }) => {
  const frame = useCurrentFrame();
  if (clipIndex === 0) return null;
  const flashOpacity = interpolate(frame, [0, duration], [0.6, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  return <AbsoluteFill style={{ background: '#FFFFFF', opacity: flashOpacity, pointerEvents: 'none' }} />;
};

const HookBurst = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!active || frame > 14) return null;
  const s = spring({ fps, frame, config: { damping: 6, stiffness: 320, mass: 0.5 } });
  const burstScale = interpolate(s, [0, 1], [1.05, 1.0]);
  const burstOpacity = interpolate(frame, [0, 2, 14], [0.4, 0, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ transform: 'scale(' + burstScale + ')', opacity: burstOpacity, pointerEvents: 'none', background: 'rgba(255,255,255,0.04)' }} />;
};

// [KEY FIX] loop={true} on OffthreadVideo -- prevents frozen last-frame bug
// [KEY FIX] kb values max 0.04 -- eliminates blur from CSS scale transforms
const BackgroundClip = ({ src, clipIndex, startFrame, clipDuration, profile, isFirst }) => {
  const frame = useCurrentFrame();
  const endFrame = startFrame + clipDuration;
  const dir = KB_DIRS[clipIndex % KB_DIRS.length];

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
    dir.panXDir === 1 ? [0, 10] : [10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const panY = (!profile.panY || dir.panYDir === 0) ? 0 : interpolate(frame, [startFrame, endFrame],
    dir.panYDir === 1 ? [0, 6] : [6, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rotation = interpolate(frame, [startFrame, endFrame],
    clipIndex % 2 === 0 ? [0, profile.rot * 0.4] : [profile.rot * 0.4, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: 'scale(' + zoom + ') translateX(' + panX + 'px) translateY(' + panY + 'px) rotate(' + rotation + 'deg)' }}>
        <OffthreadVideo src={src} loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <FlashTransition clipIndex={clipIndex} duration={profile.xfade} />
      {isFirst && profile.hookBurst && <HookBurst active={true} />}
    </AbsoluteFill>
  );
};

// Photo carousel -- rapid image slideshow with Ken Burns
// Usage in week content: backgroundMode:'photo-carousel', photos:['custom/img1.jpg',...], photoSpeed:20
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
        const opacity = interpolate(local, [0, 4, framesPerPhoto - 4, framesPerPhoto], [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const dir = KB_DIRS[i % KB_DIRS.length];
        const zoom = interpolate(local, [0, framesPerPhoto],
          dir.zoomDir === 1 ? [1.0, 1.04] : [1.04, 1.0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const panX = dir.panXDir === 0 ? 0 : interpolate(local, [0, framesPerPhoto],
          dir.panXDir === 1 ? [0, 8] : [8, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
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

const AmbientPulse = () => {
  const frame = useCurrentFrame();
  const pulseFrames = [120, 240, 360, 480, 600, 720];
  const nearest = pulseFrames.find(p => frame >= p && frame < p + 12);
  if (nearest === undefined) return null;
  const op = interpolate(frame - nearest, [0, 4, 12], [0, 0.04, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: 'rgba(255,255,255,' + op + ')', pointerEvents: 'none' }} />;
};

const EndFade = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [870, 900], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (op <= 0) return null;
  return <AbsoluteFill style={{ background: '#000', opacity: op, pointerEvents: 'none' }} />;
};

// Main export
// New props: backgroundMode, customClips, photos, photoSpeed
export const BackgroundVideo = ({ videoId, backgroundMode, customClips, photos, photoSpeed }) => {
  const profile = MOTION_PROFILES[videoId] || MOTION_PROFILES.day29;
  const { durationInFrames } = useVideoConfig();

  if (backgroundMode === 'photo-carousel') {
    return (
      <AbsoluteFill style={{ background: '#000' }}>
        <PhotoCarousel photos={photos || []} framesPerPhoto={photoSpeed || 20} />
        <AmbientPulse />
        <EndFade />
      </AbsoluteFill>
    );
  }

  const clips = (customClips && customClips.length > 0)
    ? customClips.map(c => c.startsWith('custom/') ? staticFile('videos/' + c) : staticFile('videos/' + c + '.mp4'))
    : (VIDEO_SETS[videoId] || VIDEO_SETS.day29);

  const baseClipDur = Math.floor(durationInFrames / clips.length);
  const schedule = [];
  let cursor = 0;
  clips.forEach((src, i) => {
    if (cursor >= durationInFrames) return;
    const isLast = i === clips.length - 1;
    const dur = isLast ? Math.max(durationInFrames - cursor, baseClipDur) : Math.min(baseClipDur, durationInFrames - cursor);
    schedule.push({ src, clipIndex: i, startFrame: cursor, dur });
    cursor += dur;
  });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {schedule.map(({ src, clipIndex, startFrame, dur }, i) => (
        <BackgroundClip key={i} src={src} clipIndex={clipIndex} startFrame={startFrame} clipDuration={dur} profile={profile} isFirst={i === 0} />
      ))}
      <AmbientPulse />
      <EndFade />
    </AbsoluteFill>
  );
};
