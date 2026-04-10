import { OffthreadVideo, Img, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, staticFile } from 'remotion';
import { AbsoluteFill } from 'remotion';

// -----------------------------------------------------------------------------
// CUSTOM GALLERY SUPPORT
// Upload YOUR OWN videos to: public/videos/custom/myfile.mp4
// Upload YOUR OWN photos to: public/photos/custom/myfile.jpg
// Reference in week content file:
//   customClips: ['custom/myvid1.mp4', 'custom/myvid2.mp4']   (video mode)
//   photos: ['custom/img1.jpg', 'custom/img2.jpg']             (photo-carousel mode)
// -----------------------------------------------------------------------------

// v6 FIX: custom paths use full filename; standard clips get .mp4 appended
const V = (name) => name.startsWith('custom/') ? staticFile('videos/' + name) : staticFile('videos/' + name + '.mp4');
const P = (name) => staticFile('photos/' + name);

// -----------------------------------------------------------------------------
// VIDEO_SETS -- 6 clips per day (days 29-90)
// Generated dynamically to avoid 300-line manual list.
// Render.yml downloads 6 clips per day matching the 6 bRollQueries.
// -----------------------------------------------------------------------------
const VIDEO_SETS = {};
for (let d = 29; d <= 90; d++) {
  VIDEO_SETS['day' + d] = [
    V('day' + d + '_clip1'),
    V('day' + d + '_clip2'),
    V('day' + d + '_clip3'),
    V('day' + d + '_clip4'),
    V('day' + d + '_clip5'),
    V('day' + d + '_clip6'),
  ];
}

// -----------------------------------------------------------------------------
// MOTION PROFILES
// kb (Ken Burns intensity) capped at 0.04 -- CSS scale above 1.06 blurs video.
// All profiles adjusted for 6-clip distribution across 900 frames.
// -----------------------------------------------------------------------------
const MOTION_PROFILES = {
  // Week 5
  day29:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.07,panY:true},
  day30:{clipDur:145,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:true},
  day31:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day32:{clipDur:148,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:false},
  day33:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day34:{clipDur:138,xfade:5,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day35:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  // Week 6
  day36:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:true},
  day37:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day38:{clipDur:150,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:false},
  day39:{clipDur:143,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:true},
  day40:{clipDur:138,xfade:5,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day41:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:false},
  day42:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  // Week 7
  day43:{clipDur:145,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day44:{clipDur:150,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day45:{clipDur:155,xfade:7,hookBurst:true,kb:0.03,rot:0.04,panY:true},
  day46:{clipDur:148,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day47:{clipDur:143,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day48:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day49:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  // Week 8
  day50:{clipDur:150,xfade:7,hookBurst:true,kb:0.03,rot:0.05,panY:true},
  day51:{clipDur:150,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day52:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day53:{clipDur:150,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day54:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day55:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day56:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  // Week 9
  day57:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:true},
  day58:{clipDur:150,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:false},
  day59:{clipDur:145,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day60:{clipDur:155,xfade:7,hookBurst:true,kb:0.03,rot:0.04,panY:true},
  day61:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day62:{clipDur:150,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day63:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  // Week 10
  day64:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day65:{clipDur:150,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:false},
  day66:{clipDur:143,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day67:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day68:{clipDur:145,xfade:6,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day69:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day70:{clipDur:155,xfade:7,hookBurst:true,kb:0.03,rot:0.04,panY:true},
  // Weeks 11-13 (generated days will use day50+ profiles as fallback)
  day71:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.05,panY:false},
  day72:{clipDur:148,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day73:{clipDur:148,xfade:7,hookBurst:false,kb:0.035,rot:0.05,panY:false},
  day74:{clipDur:143,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day75:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day76:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day77:{clipDur:138,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day78:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day79:{clipDur:150,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day80:{clipDur:152,xfade:7,hookBurst:true,kb:0.03,rot:0.05,panY:true},
  day81:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day82:{clipDur:152,xfade:7,hookBurst:true,kb:0.03,rot:0.05,panY:true},
  day83:{clipDur:145,xfade:6,hookBurst:false,kb:0.035,rot:0.06,panY:false},
  day84:{clipDur:148,xfade:7,hookBurst:true,kb:0.035,rot:0.05,panY:false},
  day85:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.05,panY:false},
  day86:{clipDur:140,xfade:6,hookBurst:true,kb:0.04,rot:0.07,panY:false},
  day87:{clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.06,panY:false},
  day88:{clipDur:152,xfade:7,hookBurst:false,kb:0.03,rot:0.05,panY:true},
  day89:{clipDur:155,xfade:7,hookBurst:false,kb:0.03,rot:0.04,panY:true},
  day90:{clipDur:150,xfade:7,hookBurst:true,kb:0.03,rot:0.04,panY:true},
};

// Default profile for generated videos (day91+)
const DEFAULT_PROFILE = {clipDur:150,xfade:7,hookBurst:true,kb:0.035,rot:0.05,panY:true};

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
  const flashOpacity = interpolate(frame, [0, duration], [0.55, 0], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
  });
  return <AbsoluteFill style={{ background: '#FFFFFF', opacity: flashOpacity, pointerEvents: 'none' }} />;
};

const HookBurst = ({ active }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!active || frame > 14) return null;
  const s = spring({ fps, frame, config: { damping: 6, stiffness: 320, mass: 0.5 } });
  const burstScale = interpolate(s, [0, 1], [1.05, 1.0]);
  const burstOpacity = interpolate(frame, [0, 2, 14], [0.35, 0, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ transform: 'scale(' + burstScale + ')', opacity: burstOpacity, pointerEvents: 'none', background: 'rgba(255,255,255,0.04)' }} />;
};

// KEY FIX: loop={true} prevents frozen last-frame bug when clip ends before slot finishes
// KEY FIX: kb values max 0.04 to eliminate blur from CSS scale transforms
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
        transform: 'scale(' + zoom + ') translateX(' + panX + 'px) translateY(' + panY + 'px) rotate(' + rotation + 'deg)'
      }}>
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

// Photo carousel mode -- rapid image slideshow with Ken Burns
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
        const dir  = KB_DIRS[i % KB_DIRS.length];
        const zoom = interpolate(local, [0, framesPerPhoto],
          dir.zoomDir === 1 ? [1.0, 1.04] : [1.04, 1.0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const panX = dir.panXDir === 0 ? 0 : interpolate(local, [0, framesPerPhoto],
          dir.panXDir === 1 ? [0, 7] : [7, 0],
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

// -----------------------------------------------------------------------------
// MAIN EXPORT
// Props: videoId, backgroundMode, customClips, photos, photoSpeed
// -----------------------------------------------------------------------------
export const BackgroundVideo = ({ videoId, backgroundMode, customClips, photos, photoSpeed }) => {
  // Look up profile -- default for generated days (50+) that don't have explicit entries
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

  // Custom clips mode (from content file or generated video)
  const clips = (customClips && customClips.length > 0)
    ? customClips.map(c => c.startsWith('custom/')
        ? staticFile('videos/' + c)
        : staticFile('videos/' + c + '.mp4'))
    : (VIDEO_SETS[videoId] || VIDEO_SETS['day50']);  // fallback to day50 if not found

  // Distribute clips evenly across 900 frames
  const baseClipDur = Math.floor(durationInFrames / clips.length);
  const schedule = [];
  let cursor = 0;
  clips.forEach((src, i) => {
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
      <AmbientPulse />
      <EndFade />
    </AbsoluteFill>
  );
};
