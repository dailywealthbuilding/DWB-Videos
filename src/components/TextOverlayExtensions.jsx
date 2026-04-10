// -----------------------------------------------------------------------------
// src/components/TextOverlayExtensions.jsx
// DWB Phase 4 Animations -- 15 new viral animation types
//
// HOW TO USE:
//   In TextOverlay.jsx, add at top:
//     import * as Ext from './TextOverlayExtensions.jsx';
//   Then in the main switch/if chain, before the final return:
//     const extResult = Ext.tryRenderExtension(overlay, frame, fps);
//     if (extResult) return extResult;
//
// ANIMATION NAMES (add to validate.js KNOWN_ANIMATIONS array too):
//   word-pop, stamp-impact, newspaper-highlight, stacked-giant,
//   kinetic-mixed, diagonal-cascade, magnetic-snap, spotlight-reveal,
//   comic-impact, gold-foil-sweep, neon-flicker, elastic-snap,
//   wave-cascade, ticker-news, rotate-y-flip
// -----------------------------------------------------------------------------

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// -- Shared constants (duplicated from TextOverlay.jsx for standalone use) --
const BASE_SHADOW  = '0 2px 0 rgba(0,0,0,1), 0 4px 12px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.8)';
const HEAVY_SHADOW = '0 2px 0 rgba(0,0,0,1), 0 4px 16px rgba(0,0,0,0.95), 0 8px 32px rgba(0,0,0,0.9), 0 0 48px rgba(0,0,0,0.7)';

const FONT_MAP = {
  Anton:      "'Anton', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  Bebas:      "'Bebas Neue', sans-serif",
  Oswald:     "'Oswald', sans-serif",
  Mono:       "'JetBrains Mono', monospace",
  Playfair:   "'Playfair Display', serif",
  Archivo:    "'Archivo Black', sans-serif",
  Barlow:     "'Barlow Condensed', sans-serif",
  Grotesk:    "'Space Grotesk', sans-serif",
};

const POSITION_STYLES = {
  'top-center':    { top: '14%',   left: 0, right: 0, alignItems: 'center', justifyContent: 'flex-start' },
  top:             { top: '14%',   left: 0, right: 0, alignItems: 'center', justifyContent: 'flex-start' },
  middle:          { top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  center:          { top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  'bottom-center': { bottom: '18%', left: 0, right: 0, alignItems: 'center', justifyContent: 'flex-end' },
  bottom:          { bottom: '18%', left: 0, right: 0, alignItems: 'center', justifyContent: 'flex-end' },
};

function ensureVisible(color) {
  if (!color || color === 'transparent') return '#FFFFFF';
  return color;
}

function getFontFamily(font) {
  return FONT_MAP[font] || "'Montserrat', sans-serif";
}

// =============================================================================
// 1. WORD-POP
// One word at a time. Previous word disappears before next appears.
// Drumbeat rhythm. Most viral format on TikTok right now.
// =============================================================================
export const WordPop = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const words = (overlay.text || '').split(' ').filter(Boolean);
  const framesPerWord = Math.floor(totalFrames / Math.max(words.length, 1));
  const currentWordIdx = Math.min(Math.floor(frame / framesPerWord), words.length - 1);
  const localFrame = frame % framesPerWord;

  const fontFamily = getFontFamily(overlay.font);
  const color      = ensureVisible(overlay.color);
  const fontSize   = overlay.fontSize || 88;
  const posStyle   = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const s = spring({ fps, frame: localFrame, config: { damping: 8, stiffness: 300, mass: 0.6 } });
  const scale   = interpolate(s, [0, 1], [0.4, 1]);
  const opacity = interpolate(localFrame,
    [0, 3, framesPerWord - 4, framesPerWord - 1],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '3px #000000' };

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 40px',
    }}>
      <div style={{
        fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
        color, textAlign: 'center', lineHeight: 1.0,
        textShadow: HEAVY_SHADOW,
        transform: 'scale(' + scale + ')',
        opacity,
        letterSpacing: overlay.letterSpacing || '0.02em',
        textTransform: 'uppercase',
        ...strokeStyle,
      }}>
        {words[currentWordIdx] || ''}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 2. STAMP-IMPACT
// Text slams down like a rubber stamp with a shockwave ring.
// Hits frame 0 instantly with a bounce-back.
// =============================================================================
export const StampImpact = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 90;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  // Stamp slam - squash then bounce
  const SLAM_FRAMES = 8;
  const scaleY = frame < SLAM_FRAMES
    ? interpolate(frame, [0, 2, 5, SLAM_FRAMES], [2.4, 0.75, 1.08, 1.0], { extrapolateRight: 'clamp' })
    : 1.0;
  const scaleX = frame < SLAM_FRAMES
    ? interpolate(frame, [0, 2, 5, SLAM_FRAMES], [0.6, 1.15, 0.96, 1.0], { extrapolateRight: 'clamp' })
    : 1.0;

  // Shockwave ring
  const ringScale   = interpolate(frame, [0, 20], [0, 2.5], { extrapolateRight: 'clamp' });
  const ringOpacity = interpolate(frame, [0, 3, 20], [0, 0.6, 0], { extrapolateRight: 'clamp' });

  // Exit
  const exitOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '4px #000000' };

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...posStyle, padding: '0 30px', opacity: exitOpacity }}>
      {/* Shockwave */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: 600 * ringScale + 'px',
          height: 120 * ringScale + 'px',
          borderRadius: '50%',
          border: '6px solid ' + color,
          opacity: ringOpacity,
          flexShrink: 0,
        }} />
      </div>
      {/* Text */}
      <div style={{
        fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
        color, textAlign: 'center', lineHeight: 1.05, whiteSpace: 'pre-line',
        textShadow: HEAVY_SHADOW,
        transform: 'scaleX(' + scaleX + ') scaleY(' + scaleY + ')',
        letterSpacing: overlay.letterSpacing || '0.03em',
        textTransform: 'uppercase',
        ...strokeStyle,
      }}>
        {overlay.text || ''}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 3. NEWSPAPER-HIGHLIGHT
// Yellow/accent marker sweeps left → right under ONE key word.
// The word to highlight goes in overlay.highlightWord, defaults to last word.
// =============================================================================
export const NewspaperHighlight = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 76;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const highlightColor = overlay.highlightColor || '#CAFF00';

  const words = (overlay.text || '').split(' ');
  const targetWord = overlay.highlightWord || words[words.length - 1];

  // Text entrance
  const textOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  // Marker sweep starts at frame 15
  const SWEEP_START = 15;
  const SWEEP_DUR   = 18;
  const sweepProgress = interpolate(frame, [SWEEP_START, SWEEP_START + SWEEP_DUR], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  // Exit
  const exitOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 50px', opacity: Math.min(textOpacity, exitOpacity),
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: '0.18em' }}>
        {words.map((word, i) => {
          const isTarget = word === targetWord || word.replace(/[^a-zA-Z]/g, '') === targetWord.replace(/[^a-zA-Z]/g, '');
          return (
            <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
              {/* Highlight marker behind target word */}
              {isTarget && (
                <div style={{
                  position: 'absolute',
                  bottom: '-4px', left: '-6px', right: '-6px',
                  height: '14px',
                  background: highlightColor,
                  clipPath: 'inset(0 ' + (100 - sweepProgress) + '% 0 0)',
                  opacity: 0.85,
                  borderRadius: '2px',
                  zIndex: 0,
                }} />
              )}
              <span style={{
                fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
                color: isTarget ? '#000000' : color,
                textShadow: isTarget ? 'none' : BASE_SHADOW,
                position: 'relative', zIndex: 1,
                letterSpacing: overlay.letterSpacing || '0.01em',
              }}>{word}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 4. STACKED-GIANT
// ONE word takes 90%+ of screen width. Supporting text stacks below tiny.
// overlay.giantWord = the dominant word (default: first word)
// overlay.supportText = the small text below (default: rest of overlay.text)
// =============================================================================
export const StackedGiant = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const words = (overlay.text || '').split(' ');
  const giantWord   = overlay.giantWord || words[0] || '';
  const supportText = overlay.supportText || words.slice(1).join(' ');

  // Giant word entrance - fast punch
  const giantSpring = spring({ fps, frame, config: { damping: 7, stiffness: 350, mass: 0.5 } });
  const giantScale  = interpolate(giantSpring, [0, 1], [0.2, 1]);
  const giantOp     = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });

  // Support text fades in after giant settles
  const supportOp   = interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp      = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '4px #000000' };

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: posStyle.justifyContent || 'center',
      padding: '0 8px', opacity: exitOp,
    }}>
      {/* GIANT word -- fluid font-size fills ~95% width */}
      <div style={{
        fontFamily, fontSize: 'clamp(80px, 22vw, 160px)', fontWeight: '900',
        color, textAlign: 'center', lineHeight: 0.9,
        textShadow: HEAVY_SHADOW,
        transform: 'scale(' + giantScale + ')',
        opacity: giantOp,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        width: '100%',
        ...strokeStyle,
      }}>
        {giantWord}
      </div>
      {/* Support text */}
      {supportText ? (
        <div style={{
          fontFamily, fontSize: (overlay.fontSize || 44) + 'px', fontWeight: 'bold',
          color: overlay.supportColor || 'rgba(255,255,255,0.9)',
          textAlign: 'center', lineHeight: 1.2,
          textShadow: BASE_SHADOW,
          marginTop: '8px',
          opacity: supportOp,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          WebkitTextStroke: '1px rgba(0,0,0,0.8)',
        }}>
          {supportText}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// =============================================================================
// 5. KINETIC-MIXED
// Per-word random size (40%-200% of base) AND per-word rotation (-15° to +15°).
// Pure visual chaos. Highest viral potential for short punchy statements.
// =============================================================================
export const KineticMixed = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const baseFontSize = overlay.fontSize || 72;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const words = (overlay.text || '').split(' ').filter(Boolean);
  // Deterministic per-word params so they don't change frame to frame
  const wordParams = words.map((w, i) => {
    const seed    = (i * 137 + 7) % 100;
    const sizeMul = 0.55 + (seed % 60) / 100;     // 0.55 to 1.15
    const rot     = ((i * 53 + 11) % 30) - 15;     // -15 to +15 degrees
    const colors  = [color, overlay.accentColor || '#CAFF00', '#FFFFFF', '#FFD700'];
    const c       = colors[(i * 3) % colors.length];
    return { sizeMul, rot, color: c };
  });

  const exitOp = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 24px', opacity: exitOp,
    }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'baseline', gap: '0.1em', rowGap: '0.0em',
      }}>
        {words.map((word, i) => {
          const delay = i * 4;
          const s     = spring({ fps, frame: frame - delay, config: { damping: 9, stiffness: 240 } });
          const scale = interpolate(s, [0, 1], [0, 1]);
          const wOp   = interpolate(frame - delay, [0, 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const p     = wordParams[i];
          const ws    = Math.round(baseFontSize * p.sizeMul);

          return (
            <div key={i} style={{
              fontFamily,
              fontSize: ws + 'px',
              fontWeight: '900',
              color: p.color,
              textShadow: HEAVY_SHADOW,
              transform: 'scale(' + scale + ') rotate(' + p.rot + 'deg)',
              opacity: wOp,
              display: 'inline-block',
              lineHeight: 1.0,
              textTransform: 'uppercase',
              WebkitTextStroke: '2px #000',
            }}>{word}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 6. DIAGONAL-CASCADE
// Words cascade across screen at ~18° angle, fading in sequentially.
// Like the social platforms list in Image 4.
// =============================================================================
export const DiagonalCascade = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 64;
  const lines       = (overlay.text || '').split('\n').filter(Boolean);

  const exitOp = interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ overflow: 'hidden', opacity: exitOp }}>
      {lines.map((line, i) => {
        const delay  = i * 6;
        const lineOp = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const slideX = interpolate(frame - delay, [0, 14], [-80, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
        });
        // Diagonal positioning
        const startY = 20 + i * (fontSize * 1.35);
        const startX = 20 + i * 18; // diagonal offset

        return (
          <div key={i} style={{
            position: 'absolute',
            top: startY + 'px',
            left: startX + slideX + 'px',
            fontFamily,
            fontSize: fontSize + 'px',
            fontWeight: 'bold',
            color: i % 2 === 0 ? color : (overlay.accentColor || 'rgba(255,255,255,0.55)'),
            textShadow: BASE_SHADOW,
            opacity: lineOp,
            letterSpacing: '0.05em',
            WebkitTextStroke: '1px rgba(0,0,0,0.7)',
            whiteSpace: 'nowrap',
          }}>
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// =============================================================================
// 7. MAGNETIC-SNAP
// Letters fly in from random screen positions and lock into place.
// =============================================================================
export const MagneticSnap = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 80;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const chars = (overlay.text || '').split('');
  const exitOp = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '3px #000000' };

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...posStyle, padding: '0 30px', opacity: exitOp }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {chars.map((ch, i) => {
          if (ch === '\n') return <div key={i} style={{ width: '100%', height: 0 }} />;
          if (ch === ' ')  return <div key={i} style={{ width: '0.3em' }} />;

          const seed = i * 97 + 13;
          const startX = ((seed * 37) % 400) - 200;
          const startY = ((seed * 53) % 400) - 200;
          const delay  = i * 2;

          const s = spring({ fps, frame: frame - delay, config: { damping: 11, stiffness: 280, mass: 0.8 } });
          const tx = interpolate(s, [0, 1], [startX, 0]);
          const ty = interpolate(s, [0, 1], [startY, 0]);
          const op = interpolate(frame - delay, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={i} style={{
              fontFamily, fontSize: fontSize + 'px', fontWeight: '900',
              color, textShadow: HEAVY_SHADOW,
              transform: 'translate(' + tx + 'px, ' + ty + 'px)',
              opacity: op,
              display: 'inline-block',
              lineHeight: 1.1,
              ...strokeStyle,
            }}>{ch}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 8. SPOTLIGHT-REVEAL
// Dark overlay with a spotlight that sweeps left → right revealing text.
// =============================================================================
export const SpotlightReveal = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 82;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const REVEAL_START = 5;
  const REVEAL_DUR   = 28;
  const spotProgress = interpolate(frame, [REVEAL_START, REVEAL_START + REVEAL_DUR], [-20, 120], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });

  // Text clips left → right following spotlight
  const textReveal = interpolate(frame, [REVEAL_START, REVEAL_START + REVEAL_DUR], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const exitOp = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '3px #000' };

  return (
    <AbsoluteFill style={{ opacity: exitOp }}>
      {/* Dark veil */}
      <AbsoluteFill style={{ background: 'rgba(0,0,0,0.7)', pointerEvents: 'none' }} />
      {/* Spotlight gradient sweeps across */}
      <AbsoluteFill style={{
        background: 'radial-gradient(ellipse 280px 400px at ' + spotProgress + '% 50%, rgba(255,255,255,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Text revealed behind spotlight */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', ...posStyle, padding: '0 40px',
      }}>
        <div style={{ position: 'relative' }}>
          {/* Revealed portion */}
          <div style={{
            fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
            color, textShadow: HEAVY_SHADOW,
            textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line',
            clipPath: 'inset(0 ' + (100 - textReveal) + '% 0 0)',
            ...strokeStyle,
          }}>{overlay.text || ''}</div>
          {/* Hidden silhouette */}
          <div style={{
            position: 'absolute', inset: 0,
            fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
            color: 'rgba(255,255,255,0.08)',
            textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line',
            clipPath: 'inset(0 0 0 ' + textReveal + '%)',
          }}>{overlay.text || ''}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 9. COMIC-IMPACT
// Thick outline + starburst / halftone feel. CapCut SHOW template style.
// =============================================================================
export const ComicImpact = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 86;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const burstColor  = overlay.burstColor || '#FFEE00';

  const s    = spring({ fps, frame, config: { damping: 6, stiffness: 400, mass: 0.4 } });
  const scale = interpolate(s, [0, 1], [2.0, 1.0]);
  const op    = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp = interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  // Starburst points
  const numPoints = 16;
  const outerR = 340, innerR = 200;
  const points = Array.from({ length: numPoints * 2 }, (_, i) => {
    const angle = (i / (numPoints * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return Math.round(r * Math.cos(angle)) + ',' + Math.round(r * Math.sin(angle));
  }).join(' ');

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 20px', opacity: Math.min(op, exitOp),
    }}>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {/* Starburst SVG */}
        <svg style={{ position: 'absolute', width: '680px', height: '680px', opacity: 0.92 }} viewBox='-340 -340 680 680'>
          <polygon points={points} fill={burstColor} />
          <polygon points={points} fill='none' stroke='#000' strokeWidth='8' />
        </svg>
        {/* Text */}
        <div style={{
          position: 'relative', zIndex: 1,
          fontFamily, fontSize: fontSize + 'px', fontWeight: '900',
          color: color === '#FFFFFF' ? '#000000' : color,
          textAlign: 'center', lineHeight: 1.0, whiteSpace: 'pre-line',
          WebkitTextStroke: '3px #000000',
          textShadow: '4px 4px 0 rgba(0,0,0,0.4)',
          transform: 'scale(' + scale + ')',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}>{overlay.text || ''}</div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 10. GOLD-FOIL-SWEEP
// Premium metallic gold shimmer passes repeatedly left → right over text.
// =============================================================================
export const GoldFoilSweep = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const fontSize    = overlay.fontSize || 80;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const entryOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp  = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });
  // Sweep cycles every 45 frames
  const cycle = frame % 45;
  const sweepX = interpolate(cycle, [0, 45], [-60, 160], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 40px', opacity: Math.min(entryOp, exitOp),
    }}>
      <div style={{ position: 'relative' }}>
        {/* Base gold text */}
        <div style={{
          fontFamily, fontSize: fontSize + 'px', fontWeight: '900',
          background: 'linear-gradient(135deg, #B8860B 0%, #FFD700 30%, #FFF4A0 50%, #FFD700 70%, #B8860B 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          textAlign: 'center', lineHeight: 1.15, whiteSpace: 'pre-line',
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.95)) drop-shadow(0 0 24px rgba(200,150,0,0.4))',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>{overlay.text || ''}</div>
        {/* Sweep highlight */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(' + (sweepX + 90) + 'deg, transparent 30%, rgba(255,255,220,0.9) 48%, rgba(255,255,255,1) 50%, rgba(255,255,220,0.9) 52%, transparent 70%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          fontFamily, fontSize: fontSize + 'px', fontWeight: '900',
          textAlign: 'center', lineHeight: 1.15, whiteSpace: 'pre-line',
          letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>{overlay.text || ''}</div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 11. NEON-FLICKER
// Realistic neon sign with random voltage flicker timing.
// =============================================================================
export const NeonFlicker = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = overlay.glowColor || overlay.color || '#CAFF00';
  const fontSize    = overlay.fontSize || 82;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  // Neon flicker pattern -- deterministic based on frame
  const flickerFrames = [3, 4, 12, 13, 28, 45, 46, 60, 77, 78, 92, 93, 110];
  const isFlicker = flickerFrames.includes(frame % 120);
  const isOff     = [4, 13, 46, 78, 93].includes(frame % 120);
  const baseGlow  = isFlicker ? (isOff ? 0 : 0.4) : 1.0;
  // Slow pulse between flickers
  const pulse     = 0.85 + Math.sin(frame * 0.08) * 0.15;
  const intensity = baseGlow * pulse;

  const entryOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp  = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 40px', opacity: Math.min(entryOp, exitOp),
    }}>
      <div style={{
        fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
        color, textAlign: 'center', lineHeight: 1.15, whiteSpace: 'pre-line',
        textShadow: [
          '0 0 4px ' + color,
          '0 0 8px ' + color,
          '0 0 16px ' + color,
          '0 0 32px ' + color + 'cc',
          '0 0 64px ' + color + '66',
          '0 4px 16px rgba(0,0,0,0.9)',
        ].join(', '),
        filter: 'brightness(' + intensity + ')',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>{overlay.text || ''}</div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 12. ELASTIC-SNAP
// Text overshoots its target position, pulls back, settles elastically.
// =============================================================================
export const ElasticSnap = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 80;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const s     = spring({ fps, frame, config: { damping: 4, stiffness: 200, mass: 1.2 } });
  const scale = interpolate(s, [0, 1], [0, 1]);
  const op    = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '3px #000' };

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 40px', opacity: Math.min(op, exitOp),
    }}>
      <div style={{
        fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
        color, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line',
        textShadow: HEAVY_SHADOW,
        transform: 'scale(' + scale + ')',
        transformOrigin: 'center center',
        letterSpacing: overlay.letterSpacing || '0.02em',
        ...strokeStyle,
      }}>{overlay.text || ''}</div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 13. WAVE-CASCADE
// Letters animate in on a sine wave path, creating a flowing entrance.
// =============================================================================
export const WaveCascade = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const fontSize    = overlay.fontSize || 76;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const chars = (overlay.text || '').split('');
  const exitOp = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '2px #000' };

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...posStyle, padding: '0 30px', opacity: exitOp }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {chars.map((ch, i) => {
          if (ch === '\n') return <div key={i} style={{ width: '100%', height: 0 }} />;
          if (ch === ' ')  return <div key={i} style={{ width: '0.25em' }} />;

          const delay = i * 2;
          const entryOp = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const entryY  = interpolate(frame - delay, [0, 14], [40, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
          });
          // Ongoing wave oscillation after entry
          const waveY = frame > delay + 14
            ? Math.sin((frame - delay) * 0.12 + i * 0.8) * 6
            : 0;

          return (
            <div key={i} style={{
              fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
              color, textShadow: BASE_SHADOW,
              transform: 'translateY(' + (entryY + waveY) + 'px)',
              opacity: entryOp,
              display: 'inline-block',
              lineHeight: 1.1,
              ...strokeStyle,
            }}>{ch}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 14. TICKER-NEWS
// Text scrolls horizontally like a news chyron. Loops continuously.
// Use for: lists, facts, multi-item CTAs.
// overlay.speed = pixels per frame (default 3)
// =============================================================================
export const TickerNews = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = '#000000';
  const bgColor     = overlay.barColor || '#CAFF00';
  const fontSize    = overlay.fontSize || 52;
  const speed       = overlay.speed || 3;

  const totalWidth  = 1080 + (overlay.text || '').length * (fontSize * 0.6);
  const scrollX     = -(frame * speed) % totalWidth;

  const entryOp = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp  = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: Math.min(entryOp, exitOp), pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', bottom: '22%', left: 0, right: 0,
        background: bgColor,
        height: fontSize * 1.8 + 'px',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        borderTop: '3px solid rgba(0,0,0,0.4)',
        borderBottom: '3px solid rgba(0,0,0,0.4)',
      }}>
        <div style={{
          transform: 'translateX(' + scrollX + 'px)',
          whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: '80px',
        }}>
          {/* Repeat text 3 times to fill scroll */}
          {[0, 1, 2].map(rep => (
            <span key={rep} style={{
              fontFamily, fontSize: fontSize + 'px', fontWeight: '900',
              color, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {overlay.text || ''} &nbsp;&nbsp;◆&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// 15. ROTATE-Y-FLIP
// The entire text block does a 3D Y-axis flip like turning a card.
// overlay.backText = text shown after flip (defaults to overlay.text)
// =============================================================================
export const RotateYFlip = ({ overlay, frame, fps }) => {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily  = getFontFamily(overlay.font);
  const color       = ensureVisible(overlay.color);
  const backColor   = overlay.backColor || overlay.accentColor || '#CAFF00';
  const fontSize    = overlay.fontSize || 80;
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const FLIP_START = 12;
  const FLIP_DUR   = 20;
  const rotateY = interpolate(frame, [FLIP_START, FLIP_START + FLIP_DUR], [0, 180], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });
  const isFrontVisible = rotateY < 90;
  const entryOp = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const exitOp  = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + 'px ' + overlay.stroke.color }
    : { WebkitTextStroke: '3px #000' };

  const frontText = overlay.text || '';
  const backText  = overlay.backText || frontText;

  return (
    <AbsoluteFill style={{
      display: 'flex', flexDirection: 'column', ...posStyle,
      padding: '0 40px', perspective: '1200px',
      opacity: Math.min(entryOp, exitOp),
    }}>
      <div style={{ position: 'relative', transformStyle: 'preserve-3d', transform: 'rotateY(' + rotateY + 'deg)' }}>
        {/* Front */}
        <div style={{
          fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
          color, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line',
          textShadow: HEAVY_SHADOW, backfaceVisibility: 'hidden',
          ...strokeStyle,
        }}>{frontText}</div>
        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0,
          fontFamily, fontSize: fontSize + 'px', fontWeight: 'bold',
          color: backColor, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line',
          textShadow: HEAVY_SHADOW, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          WebkitTextStroke: '3px #000',
        }}>{backText}</div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// DISPATCHER
// Called from TextOverlay.jsx main export.
// Add this line at the top of TextOverlay.jsx:
//   import { tryRenderExtension } from './TextOverlayExtensions.jsx';
// Add this block before the final return statement in TextOverlay:
//   const ext = tryRenderExtension(overlay, frame, fps);
//   if (ext !== null) return ext;
// =============================================================================
export function tryRenderExtension(overlay, frame, fps) {
  const anim = overlay.animation;

  // frame is RELATIVE to overlay startFrame when called from within Sequence
  // Pass raw frame - the components handle their own timing

  switch (anim) {
    case 'word-pop':             return <WordPop             overlay={overlay} frame={frame} fps={fps} />;
    case 'stamp-impact':         return <StampImpact         overlay={overlay} frame={frame} fps={fps} />;
    case 'newspaper-highlight':  return <NewspaperHighlight  overlay={overlay} frame={frame} fps={fps} />;
    case 'stacked-giant':        return <StackedGiant        overlay={overlay} frame={frame} fps={fps} />;
    case 'kinetic-mixed':        return <KineticMixed        overlay={overlay} frame={frame} fps={fps} />;
    case 'diagonal-cascade':     return <DiagonalCascade     overlay={overlay} frame={frame} fps={fps} />;
    case 'magnetic-snap':        return <MagneticSnap        overlay={overlay} frame={frame} fps={fps} />;
    case 'spotlight-reveal':     return <SpotlightReveal     overlay={overlay} frame={frame} fps={fps} />;
    case 'comic-impact':         return <ComicImpact         overlay={overlay} frame={frame} fps={fps} />;
    case 'gold-foil-sweep':      return <GoldFoilSweep       overlay={overlay} frame={frame} fps={fps} />;
    case 'neon-flicker':         return <NeonFlicker         overlay={overlay} frame={frame} fps={fps} />;
    case 'elastic-snap':         return <ElasticSnap         overlay={overlay} frame={frame} fps={fps} />;
    case 'wave-cascade':         return <WaveCascade         overlay={overlay} frame={frame} fps={fps} />;
    case 'ticker-news':          return <TickerNews          overlay={overlay} frame={frame} fps={fps} />;
    case 'rotate-y-flip':        return <RotateYFlip         overlay={overlay} frame={frame} fps={fps} />;
    default:                     return null; // not an extension animation, TextOverlay handles it
  }
}
