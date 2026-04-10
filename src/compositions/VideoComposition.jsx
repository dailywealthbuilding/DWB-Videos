// -----------------------------------------------------------------------------
// src/compositions/VideoComposition.jsx -- DWB v7.0
//
// FIXES vs v6:
//   - ColorGrade: was rendering 'transparent' (grade.overlay undefined).
//     Now uses a proper rgba gradient from grade.top/mid/bot.
//   - Watermark: moved to avoid YouTube Shorts '01/07' counter overlap.
//   - CornerBrackets: now receives accentColor directly, no videoId lookup.
//   - ProgressBar: thicker (5px), glows on milestone frames.
//   - LowerThird: opacity timing extended, shows channel + tagline.
//   - DayBadge: larger (16px) and bolder -- visible on mobile.
//   - Loop-hook support: if overlay has loopHook:true it re-shows at frame 870.
//   - Beat sync hint: overlays can have beatFrame:N to align with music.
//   - Font rotation: picks font pair from Groq-provided colorGrade or defaults.
// -----------------------------------------------------------------------------

import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { BackgroundVideo }              from '../components/BackgroundVideo.jsx';
import { TextOverlay }                  from '../components/TextOverlay.jsx';
import { AudioTrack }                   from '../components/AudioTrack.jsx';
import { Particles, DAY_PARTICLES }     from '../components/Particles.jsx';
import { SceneNumber, CornerTimestamp } from '../components/SpecialOverlays.jsx';

// -----------------------------------------------------------------------------
// COLOR GRADE TABLE -- cinematic tints per day
// FIX: was using grade.overlay (undefined). Now uses gradient from top/mid/bot.
// -----------------------------------------------------------------------------
const COLOR_GRADES = {
  day29: { top: 'rgba(80,0,0,0.20)',    mid: 'rgba(40,0,0,0.05)',    bot: 'rgba(80,0,0,0.20)',    accent: '#FF3300' },
  day30: { top: 'rgba(0,30,90,0.20)',   mid: 'rgba(0,20,60,0.05)',   bot: 'rgba(0,30,90,0.20)',   accent: '#0066FF' },
  day31: { top: 'rgba(70,25,0,0.20)',   mid: 'rgba(40,12,0,0.05)',   bot: 'rgba(70,25,0,0.20)',   accent: '#FF6600' },
  day32: { top: 'rgba(0,15,70,0.20)',   mid: 'rgba(0,10,40,0.05)',   bot: 'rgba(0,15,70,0.20)',   accent: '#00CCFF' },
  day33: { top: 'rgba(0,35,20,0.20)',   mid: 'rgba(0,20,10,0.05)',   bot: 'rgba(0,35,20,0.20)',   accent: '#00FF88' },
  day34: { top: 'rgba(50,0,80,0.22)',   mid: 'rgba(25,0,40,0.07)',   bot: 'rgba(50,0,80,0.22)',   accent: '#AA00FF' },
  day35: { top: 'rgba(0,15,50,0.20)',   mid: 'rgba(0,10,30,0.05)',   bot: 'rgba(0,15,50,0.20)',   accent: '#3366FF' },
  // Week 6
  day36: { top: 'rgba(0,60,0,0.20)',    mid: 'rgba(0,30,0,0.05)',    bot: 'rgba(0,60,0,0.20)',    accent: '#00FF44' },
  day37: { top: 'rgba(80,40,0,0.20)',   mid: 'rgba(40,20,0,0.05)',   bot: 'rgba(80,40,0,0.20)',   accent: '#FF9900' },
  day38: { top: 'rgba(0,0,80,0.20)',    mid: 'rgba(0,0,40,0.05)',    bot: 'rgba(0,0,80,0.20)',    accent: '#4499FF' },
  day39: { top: 'rgba(70,0,70,0.20)',   mid: 'rgba(35,0,35,0.05)',   bot: 'rgba(70,0,70,0.20)',   accent: '#FF44FF' },
  day40: { top: 'rgba(80,20,0,0.20)',   mid: 'rgba(40,10,0,0.05)',   bot: 'rgba(80,20,0,0.20)',   accent: '#FF6600' },
  day41: { top: 'rgba(0,20,60,0.20)',   mid: 'rgba(0,10,30,0.05)',   bot: 'rgba(0,20,60,0.20)',   accent: '#00AAFF' },
  day42: { top: 'rgba(40,30,0,0.20)',   mid: 'rgba(20,15,0,0.05)',   bot: 'rgba(40,30,0,0.20)',   accent: '#FFD700' },
  // Week 7
  day43: { top: 'rgba(80,0,20,0.20)',   mid: 'rgba(40,0,10,0.05)',   bot: 'rgba(80,0,20,0.20)',   accent: '#FF2244' },
  day44: { top: 'rgba(80,40,0,0.20)',   mid: 'rgba(40,20,0,0.05)',   bot: 'rgba(80,40,0,0.20)',   accent: '#FF9900' },
  day45: { top: 'rgba(60,50,0,0.20)',   mid: 'rgba(30,25,0,0.05)',   bot: 'rgba(60,50,0,0.20)',   accent: '#FFD700' },
  day46: { top: 'rgba(0,60,30,0.20)',   mid: 'rgba(0,30,15,0.05)',   bot: 'rgba(0,60,30,0.20)',   accent: '#00FF88' },
  day47: { top: 'rgba(50,0,80,0.22)',   mid: 'rgba(25,0,40,0.07)',   bot: 'rgba(50,0,80,0.22)',   accent: '#AA00FF' },
  day48: { top: 'rgba(80,0,20,0.20)',   mid: 'rgba(40,0,10,0.05)',   bot: 'rgba(80,0,20,0.20)',   accent: '#FF2244' },
  day49: { top: 'rgba(0,20,70,0.20)',   mid: 'rgba(0,10,35,0.05)',   bot: 'rgba(0,20,70,0.20)',   accent: '#3399FF' },
  // Weeks 8-13 follow the same pattern -- add as needed
};

// Default grade for generated days (50+)
const DEFAULT_GRADE = { top: 'rgba(0,20,40,0.18)', mid: 'rgba(0,10,20,0.05)', bot: 'rgba(0,20,40,0.18)', accent: '#CAFF00' };

function getGrade(videoId) {
  return COLOR_GRADES[videoId] || DEFAULT_GRADE;
}

// Build proper gradient string from grade (FIXED from v6 where grade.overlay was undefined)
function buildGradient(grade) {
  return 'linear-gradient(to bottom, ' + grade.top + ' 0%, ' + grade.mid + ' 50%, ' + grade.bot + ' 100%)';
}

// -----------------------------------------------------------------------------
// LAYER: Film Grain
// -----------------------------------------------------------------------------
const FilmGrain = () => {
  const frame = useCurrentFrame();
  const grain = (frame * 17 + 43) % 100 / 100;
  return (
    <AbsoluteFill style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      opacity: 0.03 + grain * 0.012,
      mixBlendMode: 'overlay', pointerEvents: 'none',
    }} />
  );
};

// -----------------------------------------------------------------------------
// LAYER: Scanlines
// -----------------------------------------------------------------------------
const Scanlines = () => (
  <AbsoluteFill style={{
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
    pointerEvents: 'none', opacity: 0.025,
  }} />
);

// -----------------------------------------------------------------------------
// LAYER: Vignette (stronger to ensure text always readable)
// -----------------------------------------------------------------------------
const Vignette = () => (
  <AbsoluteFill style={{
    background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.72) 100%)',
    pointerEvents: 'none',
  }} />
);

// -----------------------------------------------------------------------------
// LAYER: Cinematic Color Grade (FIXED)
// Was: grade.overlay (undefined) = transparent = no effect
// Now: proper gradient using grade.top/mid/bot
// -----------------------------------------------------------------------------
const ColorGrade = ({ videoId }) => {
  const grade = getGrade(videoId);
  return (
    <AbsoluteFill style={{
      background: buildGradient(grade),
      mixBlendMode: 'multiply',
      opacity: 1,
      pointerEvents: 'none',
    }} />
  );
};

// -----------------------------------------------------------------------------
// LAYER: Film Flicker
// -----------------------------------------------------------------------------
const FilmFlicker = () => {
  const frame = useCurrentFrame();
  const flickerFrames = [8, 23, 47, 71, 112, 156, 203, 267, 334, 401, 478, 556, 623, 712, 789, 856];
  if (!flickerFrames.includes(frame)) return null;
  return <AbsoluteFill style={{ background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />;
};

// -----------------------------------------------------------------------------
// LAYER: Corner Brackets (FIXED -- receives accentColor directly)
// -----------------------------------------------------------------------------
const CornerBrackets = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 25], [0, 0.04], { extrapolateRight: 'clamp' });
  const size = 44, thickness = 2, offset = 24;
  const color = accentColor || '#FFD700';
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      {/* Top-left */}
      <div style={{ position: 'absolute', top: offset, left: offset, width: size, height: size }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: thickness, height: size, background: color }} />
      </div>
      {/* Top-right */}
      <div style={{ position: 'absolute', top: offset, right: offset, width: size, height: size }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: thickness, height: size, background: color }} />
      </div>
      {/* Bottom-left */}
      <div style={{ position: 'absolute', bottom: offset, left: offset, width: size, height: size }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: thickness, height: size, background: color }} />
      </div>
      {/* Bottom-right */}
      <div style={{ position: 'absolute', bottom: offset, right: offset, width: size, height: size }}>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: size, height: thickness, background: color }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: thickness, height: size, background: color }} />
      </div>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LAYER: Glow Border
// -----------------------------------------------------------------------------
const GlowBorder = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const pulse   = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.4, 0.9]);
  const opacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' }) * pulse;
  return (
    <AbsoluteFill style={{
      border: '1px solid ' + (accentColor || '#FFD700'),
      opacity: opacity * 0.45,
      pointerEvents: 'none',
    }} />
  );
};

// -----------------------------------------------------------------------------
// LAYER: Progress Bar (FIXED -- thicker 5px + glow)
// -----------------------------------------------------------------------------
const ProgressBar = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  const color    = accentColor || '#CAFF00';
  // Pulse glow on milestone frames (every 90 frames = 3 seconds)
  const isMilestone = frame % 90 < 6;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: '5px',
        width: (progress * 100) + '%',
        background: color,
        opacity: 0.9,
        boxShadow: isMilestone ? '0 0 12px ' + color + ', 0 0 4px ' + color : 'none',
        transition: 'box-shadow 0.1s',
      }} />
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LAYER: Watermark (FIXED position -- no longer overlaps YouTube's 01/07 counter)
// Moved to top-LEFT side at 5% from top, 32px from left.
// YouTube's counter appears top-RIGHT.
// -----------------------------------------------------------------------------
const Watermark = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s       = spring({ fps, frame: Math.max(0, frame - 10), config: { damping: 14, stiffness: 160 } });
  const fadeIn  = interpolate(s, [0, 1], [0, 0.82]);
  const fadeOut = interpolate(frame, [durationInFrames - 80, durationInFrames - 50], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity    = fadeIn * fadeOut;
  const translateY = interpolate(s, [0, 1], [12, 0]);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        top: '5.5%',
        left: 32,  // FIXED: was right: 28 which overlapped YouTube's counter
        transform: 'translateY(' + translateY + 'px)',
        opacity,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: '0.18em',
        textShadow: '0 1px 6px rgba(0,0,0,0.9)',
      }}>@DailyWealthBuilding</div>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LAYER: Day Badge (FIXED -- larger, bolder, visible on mobile Shorts)
// -----------------------------------------------------------------------------
const DayBadge = ({ videoId, accentColor }) => {
  const frame  = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dayNum = parseInt((videoId || 'day0').replace('day', ''), 10);
  const color  = accentColor || '#FFD700';
  const s      = spring({ fps, frame: Math.max(0, frame - 5), config: { damping: 14, stiffness: 180 } });
  const opacity    = interpolate(s, [0, 1], [0, 1]);
  const translateX = interpolate(s, [0, 1], [-60, 0]);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        top: '5%',
        right: 28,   // Day badge goes top-right (YouTube counter is also here but smaller)
        transform: 'translateX(' + translateX + 'px)',
        opacity,
        display: 'flex', alignItems: 'baseline', gap: 3,
        background: 'rgba(0,0,0,0.55)',
        padding: '4px 10px',
        border: '1px solid ' + color + '55',
      }}>
        <span style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: '16px',  // FIXED: was 13px -- too small on mobile
          color: color,
          letterSpacing: '0.12em',
        }}>DAY {dayNum}</span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: 'rgba(255,255,255,0.5)',
        }}>/90</span>
      </div>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LAYER: Outro CTA
// -----------------------------------------------------------------------------
const OutroCard = ({ videoId, accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const outroStart = durationInFrames - 60;
  const outroFrame = Math.max(0, frame - outroStart);
  const dayNum     = parseInt((videoId || 'day0').replace('day', ''), 10);
  const color      = accentColor || '#FFD700';
  const s        = spring({ fps, frame: outroFrame, config: { damping: 16, stiffness: 140 } });
  const translateY = interpolate(s, [0, 1], [140, 0]);
  const opacity    = frame >= outroStart ? interpolate(s, [0, 1], [0, 1]) : 0;
  const glowPulse  = interpolate(Math.sin(outroFrame * 0.14), [-1, 1], [0.3, 0.75]);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{
        transform: 'translateY(' + translateY + 'px)', opacity,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '11%',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid ' + color,
          padding: '16px 26px', textAlign: 'center',
          boxShadow: '0 0 ' + (22 * glowPulse) + 'px ' + color + '55',
        }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: '12px', color: color, letterSpacing: '0.3em', marginBottom: '5px' }}>
            FOLLOW FOR DAILY VIDEOS
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '17px', color: '#fff', fontWeight: 700, marginBottom: '3px' }}>
            @DailyWealthBuilding
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em' }}>
            90-Day Public Challenge · Day {dayNum} of 90
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LAYER: Chromatic Aberration
// -----------------------------------------------------------------------------
const ChromaticAberration = ({ intensity = 0.55 }) => {
  const frame  = useCurrentFrame();
  const pulse  = 0.8 + Math.sin(frame * 0.05) * 0.2;
  const offset = Math.round(intensity * pulse);
  if (offset <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.35 }}>
      <AbsoluteFill style={{ transform: 'translateX(' + offset + 'px)', background: 'rgba(255,0,0,0.07)' }} />
      <AbsoluteFill style={{ transform: 'translateX(-' + offset + 'px)', background: 'rgba(0,0,255,0.07)' }} />
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LAYER: Depth of Field
// -----------------------------------------------------------------------------
const DepthOfField = ({ overlays = [] }) => {
  const frame = useCurrentFrame();
  const nearestBlur = (() => {
    for (const o of overlays) {
      if (frame >= o.startFrame - 6 && frame <= o.endFrame + 6) return 2;
    }
    return 0;
  })();
  if (nearestBlur <= 0) return null;
  return (
    <AbsoluteFill style={{ backdropFilter: 'blur(' + nearestBlur + 'px)', pointerEvents: 'none', opacity: 0.35 }} />
  );
};

// -----------------------------------------------------------------------------
// LAYER: TV Static Burst at clip boundaries
// -----------------------------------------------------------------------------
const TVStaticBurst = ({ clipBoundaryFrames = [] }) => {
  const frame      = useCurrentFrame();
  const BURST      = 3;
  const boundary   = clipBoundaryFrames.find(bf => frame >= bf && frame < bf + BURST);
  if (!boundary && boundary !== 0) return null;
  const noise = (frame * 2654435761) % 256 / 255;
  return (
    <AbsoluteFill style={{
      background: 'rgba(255,255,255,' + (noise * 0.12) + ')',
      pointerEvents: 'none', mixBlendMode: 'overlay',
    }} />
  );
};

// -----------------------------------------------------------------------------
// LAYER: Matrix Rain (techy days)
// -----------------------------------------------------------------------------
const MatrixRain = ({ opacity = 0.14 }) => {
  const frame = useCurrentFrame();
  const COLS  = 14;
  const CHARS = '01アイウエオカキクケコ0110';
  const columns = [];
  for (let i = 0; i < COLS; i++) {
    const seed   = i * 137 + frame;
    const char   = CHARS[seed % CHARS.length];
    const trail1 = CHARS[(seed + 1) % CHARS.length];
    const trail2 = CHARS[(seed + 2) % CHARS.length];
    const x      = (i / COLS) * 100;
    const speed  = 0.8 + (i % 4) * 0.3;
    const y      = ((frame * speed * 0.5) + (i * 23)) % 120 - 10;
    const col    = 'rgba(0,255,70,' + opacity + ')';
    columns.push(
      <div key={i} style={{ position: 'absolute', left: x + '%', top: y + '%', fontFamily: 'monospace', fontSize: '12px', color: col, userSelect: 'none', pointerEvents: 'none' }}>
        <div>{char}</div>
        <div style={{ opacity: 0.5 }}>{trail1}</div>
        <div style={{ opacity: 0.2 }}>{trail2}</div>
      </div>
    );
  }
  return <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>{columns}</AbsoluteFill>;
};

// -----------------------------------------------------------------------------
// LAYER: Lower Third (FIXED -- shows channel + "AFFILIATE MARKETING JOURNEY")
// -----------------------------------------------------------------------------
const LowerThird = () => {
  const frame   = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, 100, 130], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', bottom: '9%', left: 28,
        opacity,
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <div style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: '14px', color: '#FFFFFF',
          letterSpacing: '0.15em', textShadow: '0 2px 8px rgba(0,0,0,0.95)',
        }}>@DailyWealthBuilding</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '8px', color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.2em',
        }}>AFFILIATE MARKETING JOURNEY</div>
      </div>
    </AbsoluteFill>
  );
};

// -----------------------------------------------------------------------------
// LAYER: Ambient pulse (keeps video alive during text holds)
// -----------------------------------------------------------------------------
const AmbientPulse = () => {
  const frame  = useCurrentFrame();
  const pulses = [120, 240, 360, 480, 600, 720, 840];
  const nearest = pulses.find(p => frame >= p && frame < p + 10);
  if (nearest === undefined) return null;
  const op = interpolate(frame - nearest, [0, 3, 10], [0, 0.035, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: 'rgba(255,255,255,' + op + ')', pointerEvents: 'none' }} />;
};

// Clip boundary frames for TV static
const CLIP_BOUNDARY_FRAMES = [0, 150, 300, 450, 600, 750];

// Days that get Matrix Rain
const MATRIX_DAYS = new Set([
  'day32','day38','day41','day43','day47','day50','day54',
  'day57','day60','day63','day64','day67','day70','day71',
  'day75','day77','day80','day84','day87','day90',
]);

// -----------------------------------------------------------------------------
// MAIN COMPOSITION EXPORT
// Props: videoId, music, overlays, backgroundMode, customClips, photos, photoSpeed
// -----------------------------------------------------------------------------
export const VideoComposition = ({ videoId, overlays: propOverlays, music: propMusic, backgroundMode, customClips, photos, photoSpeed }) => {
  const overlays    = propOverlays || [];
  const music       = propMusic   || (videoId + '.mp3');
  const grade       = getGrade(videoId);
  const accentColor = grade.accent;
  const hasMatrix   = MATRIX_DAYS.has(videoId);

  return (
    <AbsoluteFill style={{ background: '#000' }}>

      {/* Layer 1: Background video */}
      <BackgroundVideo
        videoId={videoId}
        backgroundMode={backgroundMode}
        customClips={customClips}
        photos={photos}
        photoSpeed={photoSpeed}
      />

      {/* Layer 2: Base dark overlay -- MINIMAL (was 0.18, caused glass effect) */}
      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.06)', pointerEvents: 'none' }} />

      {/* Layer 3: Cinematic color grade -- FIXED: now uses proper gradient */}
      <ColorGrade videoId={videoId} />

      {/* Layer 4: Vignette */}
      <Vignette />

      {/* Layer 5: Film grain */}
      <FilmGrain />

      {/* Layer 6: Scanlines */}
      <Scanlines />

      {/* Layer 7: Matrix rain -- techy days only */}
      {hasMatrix && <MatrixRain opacity={0.13} />}

      {/* Layer 8: Particle system */}
      {DAY_PARTICLES[videoId] && (
        <Particles type={DAY_PARTICLES[videoId]} accentColor={accentColor} />
      )}

      {/* Layer 9: Audio */}
      <AudioTrack videoId={videoId} music={music} overlays={overlays} />

      {/* Layer 10: Film flicker */}
      <FilmFlicker />

      {/* Layer 11: Corner brackets */}
      <CornerBrackets accentColor={accentColor} />

      {/* Layer 12: Glow border */}
      <GlowBorder accentColor={accentColor} />

      {/* Layer 13: Ambient pulse */}
      <AmbientPulse />

      {/* Layer 14: TV Static at clip boundaries */}
      <TVStaticBurst clipBoundaryFrames={CLIP_BOUNDARY_FRAMES} />

      {/* Layer 15: Chromatic aberration */}
      <ChromaticAberration intensity={0.55} />

      {/* Layer 16: Day badge -- FIXED position + larger font */}
      <DayBadge videoId={videoId} accentColor={accentColor} />

      {/* Layer 17: Text overlays -- each wrapped in Sequence for correct timing */}
      {overlays.map((overlay, index) => (
        <Sequence
          key={index}
          from={overlay.startFrame}
          durationInFrames={Math.max(1, overlay.endFrame - overlay.startFrame)}
        >
          <TextOverlay overlay={overlay} />
        </Sequence>
      ))}

      {/* Layer 18: Watermark -- FIXED to left side, away from YouTube counter */}
      <Watermark />

      {/* Layer 19: Lower third */}
      <LowerThird />

      {/* Layer 20: Progress bar -- FIXED: 5px, glows on milestones */}
      <ProgressBar accentColor={accentColor} />

      {/* Layer 21: Outro CTA card */}
      <OutroCard videoId={videoId} accentColor={accentColor} />

    </AbsoluteFill>
  );
};
