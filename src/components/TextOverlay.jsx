// src/components/TextOverlay.jsx -- DWB v10.0
// FILE PATH: src/components/TextOverlay.jsx
//
// v10 OVERHAUL:
//   1. WORD SPACING FIX -- removed wordSpacing CSS (broken in Remotion headless Chrome)
//      Words now rendered as plain text strings with natural browser spacing.
//      For word-by-word animations, lines split first by \n then by space,
//      with flex gap providing word separation instead of CSS wordSpacing.
//   2. SCALE FIX -- scaleFontSize tiers less aggressive (text was rendering at 39px)
//   3. NEW ANIMATIONS -- aesthetic-card, glass-lower, line-reveal
//   4. KINETIC CTA -- controlled, not chaotic
//   5. STAGGER -- properly defined line-by-line
//   6. DARK OVERLAY SUPPORT -- overlays can request textBackground: 'glass'|'dark'
//   7. AESTHETIC POSITIONING -- 'lower-third' and 'upper-third' positions added

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

// =============================================================================
// FONT MAP -- values must match Google Fonts family names EXACTLY
// =============================================================================
const FONT_MAP = {
  Anton:         "'Anton', sans-serif",
  Bebas:         "'Bebas Neue', sans-serif",
  Oswald:        "'Oswald', sans-serif",
  Barlow:        "'Barlow Condensed', sans-serif",
  Archivo:       "'Archivo Black', sans-serif",
  Impact:        "'Impact', 'Anton', sans-serif",
  Playfair:      "'Playfair Display', serif",
  Cormorant:     "'Cormorant Garamond', serif",
  Montserrat:    "'Montserrat', sans-serif",
  Grotesk:       "'Space Grotesk', sans-serif",
  Mono:          "'JetBrains Mono', monospace",
  GreatVibes:    "'Great Vibes', cursive",
  DancingScript: "'Dancing Script', cursive",
  Italianno:     "'Italianno', cursive",
};

// =============================================================================
// POSITION MAP -- includes aesthetic positions
// =============================================================================
const POSITION_STYLES = {
  'top-center':    { top: '12%',  left: 0, right: 0, bottom: 'auto', alignItems: 'center', justifyContent: 'flex-start' },
  top:             { top: '12%',  left: 0, right: 0, bottom: 'auto', alignItems: 'center', justifyContent: 'flex-start' },
  middle:          { top: 0,      left: 0, right: 0, bottom: 0,       alignItems: 'center', justifyContent: 'center'     },
  center:          { top: 0,      left: 0, right: 0, bottom: 0,       alignItems: 'center', justifyContent: 'center'     },
  'bottom-center': { top: 'auto', left: 0, right: 0, bottom: '16%',   alignItems: 'center', justifyContent: 'flex-end'  },
  bottom:          { top: 'auto', left: 0, right: 0, bottom: '16%',   alignItems: 'center', justifyContent: 'flex-end'  },
  'lower-third':   { top: 'auto', left: 0, right: 0, bottom: '22%',   alignItems: 'center', justifyContent: 'flex-end'  },
  'upper-third':   { top: '22%',  left: 0, right: 0, bottom: 'auto',  alignItems: 'center', justifyContent: 'flex-start'},
  'top-left':      { top: '12%',  left: '6%', right: 'auto', bottom: 'auto', alignItems: 'flex-start', justifyContent: 'flex-start' },
  'bottom-left':   { top: 'auto', left: '6%', right: 'auto', bottom: '16%',  alignItems: 'flex-start', justifyContent: 'flex-end'   },
  'top-right':     { top: '12%',  right: '6%', left: 'auto', bottom: 'auto', alignItems: 'flex-end',   justifyContent: 'flex-start' },
};

// =============================================================================
// SHADOW PRESETS
// =============================================================================
const SHADOW = {
  none:   'none',
  soft:   '0 2px 12px rgba(0,0,0,0.85), 0 4px 28px rgba(0,0,0,0.6)',
  medium: '0 2px 14px rgba(0,0,0,1),    0 5px 32px rgba(0,0,0,0.8)',
  heavy:  '0 2px 8px rgba(0,0,0,1),     0 5px 24px rgba(0,0,0,1), 0 10px 48px rgba(0,0,0,0.9)',
};

// =============================================================================
// HELPERS
// =============================================================================
function ensureColor(c) {
  if (!c) return '#FFFFFF';
  const s = String(c).trim().toLowerCase();
  if (['black','#000','#000000','transparent','none',''].includes(s)) return '#FFFFFF';
  return String(c).trim();
}

// v10 FIX: Less aggressive scaling -- old version was reducing 60px to 39px
// New tiers: 20->100%, 40->93%, 65->84%, 90->76%, 90+->68%
function scaleFontSize(base, text) {
  const len = (text || '').replace(/\n/g, '').length;
  if (len <= 20) return base;
  if (len <= 40) return Math.round(base * 0.93);
  if (len <= 65) return Math.round(base * 0.84);
  if (len <= 90) return Math.round(base * 0.76);
  return Math.round(base * 0.68);
}

function strokeStyle(stroke) {
  if (!stroke || !stroke.size || !stroke.color) return {};
  return { WebkitTextStroke: stroke.size + 'px ' + stroke.color };
}

// v10 FIX: Base text NO LONGER uses wordSpacing CSS (broken in Remotion headless)
// Word spacing now comes from natural browser rendering of actual space characters
const BASE_TEXT = {
  letterSpacing: '0.01em',
  lineHeight: 1.65,
  whiteSpace: 'pre-wrap',
  textAlign: 'center',
};

// Glass card background -- used by aesthetic overlays on light backgrounds
const glassCard = {
  background: 'rgba(0,0,0,0.68)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderLeft: '3px solid rgba(202,255,0,0.6)',
  padding: '18px 28px',
  maxWidth: '88%',
};

const darkCard = {
  background: 'rgba(5,5,7,0.85)',
  padding: '16px 24px',
  maxWidth: '90%',
};

function getCardStyle(textBackground) {
  if (textBackground === 'glass') return glassCard;
  if (textBackground === 'dark')  return darkCard;
  return null;
}

// =============================================================================
// WORD-BY-WORD RENDERER -- v10 FIX for word spacing
// Splits text by \n first (real line breaks), then by space (words).
// Uses flex gap between words instead of CSS wordSpacing.
// gap: '8px' works reliably in Remotion headless. em units do not.
// =============================================================================
function WordByWord({ text, font, fontSize, fontWeight, color, shadow, stroke, getWordStyle, lineGap = 4 }) {
  const lines = (text || '').split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: lineGap + 'px' }}>
      {lines.map((line, li) => {
        const words = line.split(' ').filter(w => w.length > 0);
        return (
          <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', alignItems: 'baseline' }}>
            {words.map((word, wi) => {
              const style = getWordStyle ? getWordStyle(li, wi, lines.length, words.length) : {};
              return (
                <span key={li + '-' + wi} style={{
                  fontFamily: font,
                  fontSize: fontSize + 'px',
                  fontWeight: fontWeight || '600',
                  color: color,
                  textShadow: shadow || SHADOW.soft,
                  lineHeight: 1.4,
                  display: 'inline-block',
                  ...strokeStyle(stroke),
                  ...style,
                }}>
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// ANIMATION: elegant-rise
// Block text that rises and fades in. For body text on clean clips.
// =============================================================================
function ElegantRise({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 72, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const card     = getCardStyle(overlay.textBackground);

  const ty = interpolate(frame, [0, 22], [30, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = Math.min(
    interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 68px' }}>
      <div style={{ transform: `translateY(${ty}px)`, opacity: op, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...card }}>
          <div style={{
            ...BASE_TEXT,
            fontFamily: font,
            fontSize: fontSize + 'px',
            fontWeight: '600',
            color,
            textShadow: card ? SHADOW.none : SHADOW.soft,
            fontStyle: overlay.italic ? 'italic' : 'normal',
            ...strokeStyle(overlay.stroke),
          }}>
            {overlay.text}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: zoom-punch (hook -- KEEP EXISTING BEHAVIOR, works great)
// =============================================================================
function ZoomPunch({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 92, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const sc = spring({ frame, fps: 30, from: 0.4, to: 1, config: { damping: 14, stiffness: 200 } });
  const op = Math.min(
    interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 10, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 60px' }}>
      <div style={{ transform: `scale(${sc})`, opacity: op }}>
        <div style={{
          ...BASE_TEXT,
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '900',
          color,
          textShadow: SHADOW.heavy,
          letterSpacing: overlay.letterSpacing || '0.02em',
          lineHeight: 1.1,
          textTransform: 'uppercase',
          ...strokeStyle(overlay.stroke),
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: stamp-impact (hook -- sharp block reveal from center)
// =============================================================================
function StampImpact({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 92, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const sc = spring({ frame, fps: 30, from: 0, to: 1, config: { damping: 10, stiffness: 300, mass: 0.8 } });
  const op = Math.min(
    interpolate(frame, [0, 5], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 10, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 56px' }}>
      <div style={{ transform: `scale(${sc})`, opacity: op }}>
        <div style={{
          ...BASE_TEXT,
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '900',
          color,
          textShadow: SHADOW.heavy,
          letterSpacing: overlay.letterSpacing || '0.02em',
          lineHeight: 1.1,
          textTransform: 'uppercase',
          ...strokeStyle(overlay.stroke),
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: stagger -- v10 FIX -- line-by-line reveal, proper word spacing
// Each line slides up from below with staggered timing.
// =============================================================================
function Stagger({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 72, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const card     = getCardStyle(overlay.textBackground);

  const globalOp = interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 64px', opacity: globalOp }}>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {lines.map((line, i) => {
          const delay   = i * 10;
          const lineOp  = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lineY   = interpolate(frame - delay, [0, 16], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

          return (
            <div key={i} style={{ opacity: lineOp, transform: `translateY(${lineY}px)` }}>
              <div style={{
                ...BASE_TEXT,
                fontFamily: font,
                fontSize: (i === 0 ? Math.round(fontSize * 1.05) : fontSize) + 'px',
                fontWeight: i === 0 ? '700' : '500',
                color: i === 0 ? (overlay.accentColor || color) : color,
                textShadow: card ? SHADOW.none : SHADOW.soft,
                lineHeight: 1.5,
                ...strokeStyle(i === 0 ? overlay.stroke : null),
              }}>
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: fade-word -- v10 FIX -- words appear one by one
// CRITICAL FIX: Words now split per LINE first, then per word.
// Gap between words uses fixed px (reliable) not em (unreliable in headless).
// =============================================================================
function FadeWord({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 72, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const card     = getCardStyle(overlay.textBackground);

  const lines    = (overlay.text || '').split('\n');
  const allWords = [];
  lines.forEach((line, li) => {
    const words = line.split(' ').filter(w => w.length > 0);
    words.forEach((word, wi) => {
      allWords.push({ word, lineIndex: li, wordIndex: wi, isLineEnd: wi === words.length - 1 });
    });
  });

  const fpw    = Math.max(5, Math.floor((total * 0.65) / Math.max(allWords.length, 1)));
  const globalOp = interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' });

  // Group back by line for rendering
  const lineGroups = lines.map((_, li) => allWords.filter(w => w.lineIndex === li));

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 68px', opacity: globalOp }}>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        {lineGroups.map((lineWords, li) => {
          const lineStartIdx = allWords.findIndex(w => w.lineIndex === li);
          return (
            <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', alignItems: 'baseline' }}>
              {lineWords.map((item, wi) => {
                const globalIdx = lineStartIdx + wi;
                const wf  = frame - globalIdx * fpw;
                const wOp = interpolate(wf, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const wY  = interpolate(wf, [0, 14], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
                return (
                  <span key={wi} style={{
                    fontFamily: font,
                    fontSize: fontSize + 'px',
                    fontWeight: '600',
                    color,
                    textShadow: card ? SHADOW.none : SHADOW.soft,
                    opacity: wOp,
                    transform: `translateY(${wY}px)`,
                    display: 'inline-block',
                    lineHeight: 1.4,
                    ...strokeStyle(overlay.stroke),
                  }}>
                    {item.word}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: word-bounce -- v10 -- words pop in with spring, clean word spacing
// =============================================================================
function WordBounce({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 80, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const lines    = (overlay.text || '').split('\n');
  let wordCounter = 0;
  const lineGroups = lines.map(line => {
    const words = line.split(' ').filter(w => w.length > 0);
    const result = words.map(word => ({ word, idx: wordCounter++ }));
    return result;
  });

  const totalWords = wordCounter;
  const fpw = Math.max(4, Math.floor((total * 0.5) / Math.max(totalWords, 1)));
  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 60px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {lineGroups.map((words, li) => (
          <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', alignItems: 'baseline' }}>
            {words.map(({ word, idx }) => {
              const sc = spring({ frame: frame - idx * fpw, fps: 30, from: 0.3, to: 1, config: { damping: 10, stiffness: 280 } });
              const wOp = interpolate(frame - idx * fpw, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <span key={idx} style={{
                  fontFamily: font,
                  fontSize: fontSize + 'px',
                  fontWeight: '900',
                  color,
                  textShadow: SHADOW.medium,
                  transform: `scale(${sc})`,
                  opacity: wOp,
                  display: 'inline-block',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  ...strokeStyle(overlay.stroke),
                }}>
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: editorial-body -- line-by-line stagger, left-aligned
// (This already looked great in screenshots -- keep behavior, fix font sizes)
// =============================================================================
function EditorialBody({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 68, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const card     = getCardStyle(overlay.textBackground);

  const globalOp = Math.min(
    interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 64px', opacity: globalOp }}>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {lines.map((line, i) => {
          const lDelay = i * 9;
          const lOp = interpolate(frame - lDelay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lY  = interpolate(frame - lDelay, [0, 17], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ opacity: lOp, transform: `translateY(${lY}px)` }}>
              <div style={{
                ...BASE_TEXT,
                textAlign: card ? 'center' : 'left',
                fontFamily: font,
                fontSize: (i === 0 ? Math.round(fontSize * 1.08) : fontSize) + 'px',
                fontWeight: i === 0 ? '700' : '400',
                color: i === 0 ? (overlay.accentColor || color) : color,
                textShadow: card ? SHADOW.none : SHADOW.soft,
                lineHeight: 1.55,
              }}>
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: kinetic -- v10 FIX -- controlled, not chaotic
// Clean word-by-word reveal with subtle scale variation (not extreme sizes)
// =============================================================================
function Kinetic({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 82, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['bottom-center'];

  const lines    = (overlay.text || '').split('\n');
  let wordCounter = 0;
  const lineGroups = lines.map(line => {
    const words = line.split(' ').filter(w => w.length > 0);
    const result = words.map(word => ({ word, idx: wordCounter++ }));
    return result;
  });

  const totalWords = wordCounter;
  const fpw      = Math.max(4, Math.floor((total * 0.55) / Math.max(totalWords, 1)));
  const globalOp = Math.min(
    interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 12, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 56px', opacity: globalOp }}>
      <div style={{
        background: 'rgba(0,0,0,0.72)',
        padding: '14px 22px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        {lineGroups.map((words, li) => (
          <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', alignItems: 'baseline' }}>
            {words.map(({ word, idx }) => {
              const wf  = frame - idx * fpw;
              const wOp = interpolate(wf, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const sc  = spring({ frame: wf, fps: 30, from: 0.6, to: 1, config: { damping: 12, stiffness: 250 } });
              // Subtle: only first word of CTA is extra large. Rest uniform.
              const fSize = (idx === 0) ? Math.round(fontSize * 1.1) : fontSize;
              const wordColor = word.toUpperCase() === word && word.length > 2 ? (overlay.accentColor || '#CAFF00') : color;
              return (
                <span key={idx} style={{
                  fontFamily: font,
                  fontSize: fSize + 'px',
                  fontWeight: '900',
                  color: wordColor,
                  textShadow: SHADOW.heavy,
                  opacity: wOp,
                  transform: `scale(${sc})`,
                  display: 'inline-block',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  ...strokeStyle(overlay.stroke),
                }}>
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: aesthetic-card -- NEW for v10
// Glassmorphism card at bottom third. Clean, minimal, high contrast.
// Perfect for light/aesthetic background clips.
// =============================================================================
function AestheticCard({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 68, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];

  const slideY = interpolate(frame, [0, 18], [40, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 32px' }}>
      <div style={{
        transform: `translateY(${slideY}px)`,
        opacity: op,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: '4px solid #CAFF00',
        padding: '20px 28px',
        width: '100%',
      }}>
        <div style={{
          ...BASE_TEXT,
          textAlign: 'left',
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '600',
          color,
          lineHeight: 1.55,
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: glass-lower -- NEW for v10
// Full-width frosted glass bar at bottom. Great for hook/CTA on aesthetic clips.
// =============================================================================
function GlassLower({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 80, overlay.text);

  const slideY = interpolate(frame, [0, 20], [80, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'stretch' }}>
      <div style={{
        transform: `translateY(${slideY}px)`,
        opacity: op,
        background: 'linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.72))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '28px 48px 44px',
        borderTop: '2px solid rgba(202,255,0,0.4)',
      }}>
        <div style={{
          ...BASE_TEXT,
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '900',
          color,
          textShadow: SHADOW.medium,
          letterSpacing: '0.02em',
          lineHeight: 1.15,
          textTransform: 'uppercase',
          ...strokeStyle(overlay.stroke),
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: line-reveal -- NEW for v10
// Each line of text cuts in from left with sharp reveal. Very cinematic.
// =============================================================================
function LineReveal({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 80, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);

  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 56px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        {lines.map((line, i) => {
          const delay  = i * 8;
          const slideX = interpolate(frame - delay, [0, 18], [-360, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const lineOp = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const isAccent = i === 0;
          return (
            <div key={i} style={{ transform: `translateX(${slideX}px)`, opacity: lineOp }}>
              <div style={{
                ...BASE_TEXT,
                fontFamily: font,
                fontSize: (isAccent ? Math.round(fontSize * 1.05) : fontSize) + 'px',
                fontWeight: '900',
                color: isAccent ? (overlay.accentColor || '#CAFF00') : color,
                textShadow: SHADOW.heavy,
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                textTransform: 'uppercase',
                ...strokeStyle(overlay.stroke),
              }}>
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: blur-in -- text fades in from blur
// =============================================================================
function BlurIn({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 68, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const card     = getCardStyle(overlay.textBackground);

  const blur = interpolate(frame, [0, 22], [14, 0], { extrapolateRight: 'clamp' });
  const op   = Math.min(
    interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 68px' }}>
      <div style={{ ...card, opacity: op, filter: `blur(${blur}px)` }}>
        <div style={{
          ...BASE_TEXT,
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '600',
          color,
          textShadow: card ? SHADOW.none : SHADOW.medium,
          ...strokeStyle(overlay.stroke),
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: slide-up -- clean upward slide for body text
// =============================================================================
function SlideUp({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 68, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const card     = getCardStyle(overlay.textBackground);

  const ty = interpolate(frame, [0, 20], [50, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const op = Math.min(
    interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 64px' }}>
      <div style={{ transform: `translateY(${ty}px)`, opacity: op, ...card }}>
        <div style={{
          ...BASE_TEXT,
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '500',
          color,
          textShadow: card ? SHADOW.none : SHADOW.soft,
          ...strokeStyle(overlay.stroke),
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: script-pair -- large flowing script + body text
// =============================================================================
function ScriptPair({ overlay, frame }) {
  const total       = overlay.endFrame - overlay.startFrame;
  const scriptFont  = FONT_MAP[overlay.scriptFont] || FONT_MAP.GreatVibes;
  const bodyFont    = FONT_MAP[overlay.font]        || FONT_MAP.Cormorant;
  const scriptColor = ensureColor(overlay.scriptColor || overlay.color);
  const bodyColor   = ensureColor(overlay.bodyColor || '#FFFFFF');
  const scriptSize  = overlay.scriptFontSize || 104;
  const bodySize    = scaleFontSize(overlay.fontSize || 36, overlay.text);
  const pos         = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const sx  = interpolate(frame, [0, 24], [-28, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const sOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const bOp = Math.min(
    interpolate(frame, [12, 28], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  const eOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div style={{ transform: `translateX(${sx}px)`, opacity: sOp * eOp }}>
          <div style={{ ...BASE_TEXT, fontFamily: scriptFont, fontSize: scriptSize + 'px', fontWeight: '400', color: scriptColor, textShadow: SHADOW.heavy, lineHeight: 1.15 }}>
            {overlay.scriptText || overlay.text}
          </div>
        </div>
        {overlay.scriptText && overlay.text && (
          <div style={{ opacity: bOp }}>
            <div style={{ ...BASE_TEXT, fontFamily: bodyFont, fontSize: bodySize + 'px', fontWeight: '400', color: bodyColor, textShadow: SHADOW.soft, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              {overlay.text}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: multi-line -- staggered multi-line with box accent on first line
// =============================================================================
function MultiLine({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 68, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);

  const globalOp = Math.min(
    interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 64px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {lines.map((line, i) => {
          const lDelay = i * 10;
          const lOp = interpolate(frame - lDelay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lX  = interpolate(frame - lDelay, [0, 16], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ opacity: lOp, transform: `translateX(${lX}px)` }}>
              <div style={{
                ...BASE_TEXT,
                fontFamily: font,
                fontSize: (i === 0 ? Math.round(fontSize * 1.1) : fontSize) + 'px',
                fontWeight: i === 0 ? '800' : '400',
                color: i === 0 ? (overlay.accentColor || '#CAFF00') : color,
                textShadow: SHADOW.soft,
                background: i === 0 ? 'rgba(0,0,0,0.55)' : 'transparent',
                padding: i === 0 ? '4px 12px' : '0',
                lineHeight: 1.5,
              }}>
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: fade (simple full-text fade)
// =============================================================================
function Fade({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 68, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const card     = getCardStyle(overlay.textBackground);

  const op = Math.min(
    interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 18, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 68px' }}>
      <div style={{ opacity: op, ...card }}>
        <div style={{
          ...BASE_TEXT,
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '500',
          color,
          textShadow: card ? SHADOW.none : SHADOW.soft,
          ...strokeStyle(overlay.stroke),
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: flip-up -- each line flips up like a scoreboard
// =============================================================================
function FlipUp({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 80, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);

  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 56px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
        {lines.map((line, i) => {
          const delay  = i * 10;
          const rotX   = interpolate(frame - delay, [0, 16], [-90, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lOp    = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{ opacity: lOp, transform: `perspective(800px) rotateX(${rotX}deg)`, transformOrigin: 'center bottom' }}>
              <div style={{
                ...BASE_TEXT,
                fontFamily: font,
                fontSize: fontSize + 'px',
                fontWeight: '900',
                color: i === 0 ? (overlay.accentColor || color) : color,
                textShadow: SHADOW.heavy,
                textTransform: 'uppercase',
                lineHeight: 1.15,
                letterSpacing: '0.02em',
                ...strokeStyle(overlay.stroke),
              }}>
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: caps -- clean caps text reveal
// =============================================================================
function Caps({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 80, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const op = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  const ls = interpolate(frame, [0, 30], [0.3, 0.02], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 56px' }}>
      <div style={{ opacity: op }}>
        <div style={{
          ...BASE_TEXT,
          fontFamily: font,
          fontSize: fontSize + 'px',
          fontWeight: '900',
          color,
          textShadow: SHADOW.heavy,
          textTransform: 'uppercase',
          letterSpacing: ls + 'em',
          lineHeight: 1.1,
          ...strokeStyle(overlay.stroke),
        }}>
          {overlay.text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: bounce (alias for word-bounce)
// =============================================================================
const Bounce = WordBounce;

// =============================================================================
// ANIMATION: letter-drop -- letters fall into place
// =============================================================================
function LetterDrop({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 80, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const chars    = (overlay.text || '').split('');
  const fpc      = Math.max(2, Math.floor((total * 0.5) / Math.max(chars.length, 1)));
  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 56px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px' }}>
        {chars.map((ch, i) => {
          const cf  = frame - i * fpc;
          const cOp = interpolate(cf, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cY  = interpolate(cf, [0, 12], [-40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          return (
            <span key={i} style={{
              fontFamily: font,
              fontSize: fontSize + 'px',
              fontWeight: '900',
              color,
              textShadow: SHADOW.medium,
              opacity: cOp,
              transform: `translateY(${cY}px)`,
              display: 'inline-block',
              whiteSpace: ch === ' ' ? 'pre' : 'normal',
              width: ch === ' ' ? '0.3em' : 'auto',
            }}>
              {ch}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: split-reveal -- text splits apart from center
// =============================================================================
function SplitReveal({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 80, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);

  const splitAmt = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 56px', opacity: op }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${splitAmt * 16}px` }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            ...BASE_TEXT,
            fontFamily: font,
            fontSize: fontSize + 'px',
            fontWeight: '900',
            color: i === 0 ? (overlay.accentColor || '#CAFF00') : color,
            textShadow: SHADOW.heavy,
            textTransform: 'uppercase',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
            ...strokeStyle(overlay.stroke),
          }}>
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// MAIN DISPATCH -- routes animation name to component
// =============================================================================
const ANIMATION_MAP = {
  // Hooks (impactful)
  'zoom-punch':    ZoomPunch,
  'stamp-impact':  StampImpact,
  'line-reveal':   LineReveal,
  'flip-up':       FlipUp,
  'glass-lower':   GlassLower,
  'split-reveal':  SplitReveal,
  'caps':          Caps,
  'letter-drop':   LetterDrop,
  'bounce':        Bounce,

  // Body (readable)
  'elegant-rise':  ElegantRise,
  'stagger':       Stagger,
  'fade-word':     FadeWord,
  'editorial-body': EditorialBody,
  'blur-in':       BlurIn,
  'slide-up':      SlideUp,
  'fade':          Fade,
  'multi-line':    MultiLine,
  'word-bounce':   WordBounce,

  // CTA
  'kinetic':       Kinetic,

  // Aesthetic
  'aesthetic-card': AestheticCard,
  'script-pair':   ScriptPair,
};

export const TextOverlay = ({ overlay }) => {
  if (!overlay || !overlay.text) return null;

  const frame = useCurrentFrame();

  // Normalise: overlay receives startFrame=0 from VideoComposition Sequence wrapper
  const Animation = ANIMATION_MAP[overlay.animation];

  if (!Animation) {
    // Unknown animation -- fall back to elegant-rise
    return <ElegantRise overlay={overlay} frame={frame} />;
  }

  return <Animation overlay={overlay} frame={frame} />;
};
