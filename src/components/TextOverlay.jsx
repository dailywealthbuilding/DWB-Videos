// src/components/TextOverlay.jsx -- DWB v10.2
// FILE PATH: src/components/TextOverlay.jsx
//
// v10.2 FIXES:
//   1. WORD SPACING -- ALL animations use WordBlock (flex gap:9px between words)
//      Headless Chrome collapses CSS word-spacing. Fix: flex gap only, no CSS wordSpacing.
//   2. FONT UPGRADE -- Cormorant Garamond for all body text (elegant serif)
//      Anton stays for hooks/CTAs. Cinzel added for luxury titles.
//   3. POSITION SHIFT -- body animations default to 'lower-third' (not middle)
//      so text sits over dark lower area of aesthetic clips, not centre of clip.
//   4. LINE HEIGHT -- increased to 1.55 for body, 1.1 for hooks

import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Easing,
} from 'remotion';

// =============================================================================
// FONT MAP
// =============================================================================
const FONT_MAP = {
  Anton:            "'Anton', sans-serif",
  Bebas:            "'Bebas Neue', sans-serif",
  Oswald:           "'Oswald', sans-serif",
  Barlow:           "'Barlow Condensed', sans-serif",
  Archivo:          "'Archivo Black', sans-serif",
  Impact:           "'Impact', 'Anton', sans-serif",
  Playfair:         "'Playfair Display', serif",
  Cormorant:        "'Cormorant Garamond', serif",
  Cinzel:           "'Cinzel', serif",
  Lora:             "'Lora', serif",
  LibreBaskerville: "'Libre Baskerville', serif",
  Montserrat:       "'Montserrat', sans-serif",
  Grotesk:          "'Space Grotesk', sans-serif",
  Raleway:          "'Raleway', sans-serif",
  Mono:             "'JetBrains Mono', monospace",
  GreatVibes:       "'Great Vibes', cursive",
  DancingScript:    "'Dancing Script', cursive",
  Italianno:        "'Italianno', cursive",
};

// =============================================================================
// POSITION MAP
// =============================================================================
const POSITION_STYLES = {
  'top-center':    { top: '12%',  left: 0, right: 0, bottom: 'auto', alignItems: 'center', justifyContent: 'flex-start' },
  top:             { top: '12%',  left: 0, right: 0, bottom: 'auto', alignItems: 'center', justifyContent: 'flex-start' },
  middle:          { top: 0,      left: 0, right: 0, bottom: 0,      alignItems: 'center', justifyContent: 'center'     },
  center:          { top: 0,      left: 0, right: 0, bottom: 0,      alignItems: 'center', justifyContent: 'center'     },
  'bottom-center': { top: 'auto', left: 0, right: 0, bottom: '15%',  alignItems: 'center', justifyContent: 'flex-end'  },
  bottom:          { top: 'auto', left: 0, right: 0, bottom: '15%',  alignItems: 'center', justifyContent: 'flex-end'  },
  'lower-third':   { top: 'auto', left: 0, right: 0, bottom: '18%',  alignItems: 'center', justifyContent: 'flex-end'  },
  'upper-third':   { top: '20%',  left: 0, right: 0, bottom: 'auto', alignItems: 'center', justifyContent: 'flex-start'},
  'top-left':      { top: '12%',  left: '5%', right: 'auto', bottom: 'auto', alignItems: 'flex-start', justifyContent: 'flex-start' },
  'bottom-left':   { top: 'auto', left: '5%', right: 'auto', bottom: '15%',  alignItems: 'flex-start', justifyContent: 'flex-end'   },
  'top-right':     { top: '12%',  right: '5%', left: 'auto', bottom: 'auto', alignItems: 'flex-end',   justifyContent: 'flex-start' },
};

// =============================================================================
// SHADOW PRESETS
// =============================================================================
const SHADOW = {
  none:   'none',
  soft:   '0 2px 12px rgba(0,0,0,0.9), 0 4px 28px rgba(0,0,0,0.7)',
  medium: '0 2px 14px rgba(0,0,0,1),   0 5px 32px rgba(0,0,0,0.85)',
  heavy:  '0 2px 8px rgba(0,0,0,1),    0 5px 24px rgba(0,0,0,1), 0 10px 48px rgba(0,0,0,0.95)',
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

function isSerifFont(fontKey) {
  return ['Cormorant','Playfair','Cinzel','Lora','LibreBaskerville'].includes(fontKey);
}

const glassCard = {
  background: 'rgba(0,0,0,0.74)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderLeft: '4px solid rgba(202,255,0,0.75)',
  padding: '20px 28px',
  maxWidth: '94%',
};

const darkCard = {
  background: 'rgba(4,4,6,0.88)',
  padding: '16px 24px',
  maxWidth: '92%',
};

function getCardStyle(textBackground) {
  if (textBackground === 'glass') return glassCard;
  if (textBackground === 'dark')  return darkCard;
  return null;
}

// =============================================================================
// WORD BLOCK -- THE CORE WORD SPACING FIX
// Every body animation uses this. Words rendered as flex children with gap:9px.
// This completely bypasses the headless Chrome CSS word-spacing bug.
// Empty \n lines become spacers. Non-empty lines split by space into word spans.
// =============================================================================
function WordBlock({
  text,
  font,
  fontSize,
  fontWeight = '500',
  color,
  shadow = SHADOW.soft,
  stroke,
  italic = false,
  uppercase = false,
  letterSpacing = '0.01em',
  lineHeight = 1.55,
  lineGap = 8,
  wordGap = 9,
  textAlign = 'center',
}) {
  const lines   = (text || '').split('\n');
  const justify = textAlign === 'left' ? 'flex-start' : 'center';
  const align   = textAlign === 'left' ? 'flex-start' : 'center';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap: lineGap + 'px' }}>
      {lines.map((line, li) => {
        const words = line.split(' ').filter(w => w.length > 0);
        if (words.length === 0) {
          return <div key={li} style={{ height: Math.round(fontSize * 0.3) + 'px' }} />;
        }
        return (
          <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: justify, gap: wordGap + 'px', alignItems: 'baseline' }}>
            {words.map((word, wi) => (
              <span key={wi} style={{
                fontFamily: font,
                fontSize: fontSize + 'px',
                fontWeight,
                color,
                textShadow: shadow,
                fontStyle: italic ? 'italic' : 'normal',
                textTransform: uppercase ? 'uppercase' : 'none',
                letterSpacing,
                lineHeight,
                display: 'inline-block',
                ...strokeStyle(stroke),
              }}>
                {word}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// ANIMATION: elegant-rise
// Serif body text. Rises and fades in. Sits at lower-third by default.
// =============================================================================
function ElegantRise({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif    = isSerifFont(overlay.font || 'Cormorant');
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const card     = getCardStyle(overlay.textBackground);

  const ty = interpolate(frame, [0, 22], [28, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = Math.min(
    interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px' }}>
      <div style={{ transform: `translateY(${ty}px)`, opacity: op, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...card }}>
          <WordBlock
            text={overlay.text}
            font={font}
            fontSize={fontSize}
            fontWeight={serif ? '400' : '600'}
            color={color}
            shadow={card ? SHADOW.none : SHADOW.soft}
            stroke={card ? null : overlay.stroke}
            italic={serif}
            lineGap={9}
            wordGap={10}
            lineHeight={1.6}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: zoom-punch (hook)
// =============================================================================
function ZoomPunch({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 100, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const sc = spring({ frame, fps: 30, from: 0.4, to: 1, config: { damping: 14, stiffness: 200 } });
  const op = Math.min(
    interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 10, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px' }}>
      <div style={{ transform: `scale(${sc})`, opacity: op }}>
        <WordBlock
          text={overlay.text}
          font={font}
          fontSize={fontSize}
          fontWeight="900"
          color={color}
          shadow={SHADOW.heavy}
          stroke={overlay.stroke}
          uppercase
          letterSpacing={overlay.letterSpacing || '0.02em'}
          lineHeight={1.1}
          lineGap={4}
          wordGap={12}
        />
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: stamp-impact (hook)
// =============================================================================
function StampImpact({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 100, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const sc = spring({ frame, fps: 30, from: 0, to: 1, config: { damping: 10, stiffness: 300, mass: 0.8 } });
  const op = Math.min(
    interpolate(frame, [0, 5], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 10, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px' }}>
      <div style={{ transform: `scale(${sc})`, opacity: op }}>
        <WordBlock
          text={overlay.text}
          font={font}
          fontSize={fontSize}
          fontWeight="900"
          color={color}
          shadow={SHADOW.heavy}
          stroke={overlay.stroke}
          uppercase
          letterSpacing="0.02em"
          lineHeight={1.1}
          lineGap={4}
          wordGap={12}
        />
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: stagger -- line-by-line serif reveal
// =============================================================================
function Stagger({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif    = isSerifFont(overlay.font || 'Cormorant');
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const card     = getCardStyle(overlay.textBackground);

  const globalOp = interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px', opacity: globalOp }}>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {lines.map((line, i) => {
          const delay  = i * 10;
          const lineOp = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lineY  = interpolate(frame - delay, [0, 16], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const words  = line.split(' ').filter(w => w.length > 0);
          const fSize  = i === 0 ? Math.round(fontSize * 1.05) : fontSize;
          const fColor = i === 0 ? (overlay.accentColor || color) : color;

          return (
            <div key={i} style={{ opacity: lineOp, transform: `translateY(${lineY}px)` }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '9px', alignItems: 'baseline' }}>
                {words.map((word, wi) => (
                  <span key={wi} style={{
                    fontFamily: font,
                    fontSize: fSize + 'px',
                    fontWeight: i === 0 ? '700' : (serif ? '400' : '500'),
                    color: fColor,
                    textShadow: card ? SHADOW.none : SHADOW.soft,
                    fontStyle: serif ? 'italic' : 'normal',
                    lineHeight: 1.55,
                    display: 'inline-block',
                    ...strokeStyle(i === 0 ? overlay.stroke : null),
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: fade-word -- words appear one by one
// =============================================================================
function FadeWord({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif    = isSerifFont(overlay.font || 'Cormorant');
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const card     = getCardStyle(overlay.textBackground);

  const lines    = (overlay.text || '').split('\n');
  const allWords = [];
  lines.forEach((line, li) => {
    line.split(' ').filter(w => w.length > 0).forEach((word, wi) => {
      allWords.push({ word, lineIndex: li, wordIndex: wi });
    });
  });

  const fpw      = Math.max(5, Math.floor((total * 0.65) / Math.max(allWords.length, 1)));
  const globalOp = interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' });
  const lineGroups = lines.map((_, li) => allWords.filter(w => w.lineIndex === li));

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px', opacity: globalOp }}>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px' }}>
        {lineGroups.map((lineWords, li) => {
          const lineStartIdx = allWords.findIndex(w => w.lineIndex === li);
          if (lineWords.length === 0) return <div key={li} style={{ height: Math.round(fontSize * 0.3) + 'px' }} />;
          return (
            <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', alignItems: 'baseline' }}>
              {lineWords.map((item, wi) => {
                const gIdx = lineStartIdx + wi;
                const wf   = frame - gIdx * fpw;
                const wOp  = interpolate(wf, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const wY   = interpolate(wf, [0, 14], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
                return (
                  <span key={wi} style={{
                    fontFamily: font,
                    fontSize: fontSize + 'px',
                    fontWeight: serif ? '400' : '600',
                    color,
                    textShadow: card ? SHADOW.none : SHADOW.soft,
                    fontStyle: serif ? 'italic' : 'normal',
                    opacity: wOp,
                    transform: `translateY(${wY}px)`,
                    display: 'inline-block',
                    lineHeight: 1.55,
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
// ANIMATION: word-bounce
// =============================================================================
function WordBounce({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 92, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const lines    = (overlay.text || '').split('\n');
  let wc = 0;
  const groups = lines.map(line => line.split(' ').filter(w => w.length > 0).map(word => ({ word, idx: wc++ })));
  const total2 = wc;
  const fpw    = Math.max(4, Math.floor((total * 0.5) / Math.max(total2, 1)));
  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {groups.map((words, li) => (
          <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', alignItems: 'baseline' }}>
            {words.map(({ word, idx }) => {
              const sc  = spring({ frame: frame - idx * fpw, fps: 30, from: 0.3, to: 1, config: { damping: 10, stiffness: 280 } });
              const wOp = interpolate(frame - idx * fpw, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              return (
                <span key={idx} style={{
                  fontFamily: font, fontSize: fontSize + 'px', fontWeight: '900',
                  color, textShadow: SHADOW.medium, transform: `scale(${sc})`,
                  opacity: wOp, display: 'inline-block', lineHeight: 1.2,
                  textTransform: 'uppercase', ...strokeStyle(overlay.stroke),
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
// ANIMATION: editorial-body
// =============================================================================
function EditorialBody({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif    = isSerifFont(overlay.font || 'Cormorant');
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const lines    = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const card     = getCardStyle(overlay.textBackground);

  const globalOp = Math.min(
    interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px', opacity: globalOp }}>
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {lines.map((line, i) => {
          const lOp = interpolate(frame - i * 9, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lY  = interpolate(frame - i * 9, [0, 17], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const words = line.split(' ').filter(w => w.length > 0);
          const fSize = i === 0 ? Math.round(fontSize * 1.08) : fontSize;
          const fCol  = i === 0 ? (overlay.accentColor || color) : color;

          return (
            <div key={i} style={{ opacity: lOp, transform: `translateY(${lY}px)` }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: card ? 'center' : 'flex-start', gap: '9px', alignItems: 'baseline' }}>
                {words.map((word, wi) => (
                  <span key={wi} style={{
                    fontFamily: font, fontSize: fSize + 'px',
                    fontWeight: i === 0 ? '700' : (serif ? '400' : '400'),
                    color: fCol, textShadow: card ? SHADOW.none : SHADOW.soft,
                    fontStyle: serif ? 'italic' : 'normal',
                    lineHeight: 1.6, display: 'inline-block',
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: kinetic (CTA)
// =============================================================================
function Kinetic({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 92, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['bottom-center'];

  const lines = (overlay.text || '').split('\n');
  let wc = 0;
  const groups = lines.map(line => line.split(' ').filter(w => w.length > 0).map(word => ({ word, idx: wc++ })));
  const fpw = Math.max(4, Math.floor((total * 0.55) / Math.max(wc, 1)));
  const globalOp = Math.min(
    interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 12, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 44px', opacity: globalOp }}>
      <div style={{ background: 'rgba(0,0,0,0.8)', padding: '14px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        {groups.map((words, li) => (
          <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '9px', alignItems: 'baseline' }}>
            {words.map(({ word, idx }) => {
              const wf  = frame - idx * fpw;
              const wOp = interpolate(wf, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
              const sc  = spring({ frame: wf, fps: 30, from: 0.6, to: 1, config: { damping: 12, stiffness: 250 } });
              const fSize     = idx === 0 ? Math.round(fontSize * 1.1) : fontSize;
              const wordColor = word.toUpperCase() === word && word.length > 2 ? (overlay.accentColor || '#CAFF00') : color;
              return (
                <span key={idx} style={{
                  fontFamily: font, fontSize: fSize + 'px', fontWeight: '900',
                  color: wordColor, textShadow: SHADOW.heavy,
                  opacity: wOp, transform: `scale(${sc})`, display: 'inline-block',
                  lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.02em',
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
// ANIMATION: aesthetic-card
// =============================================================================
function AestheticCard({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif    = isSerifFont(overlay.font || 'Cormorant');
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos      = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];

  const slideY = interpolate(frame, [0, 18], [40, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 28px' }}>
      <div style={{
        transform: `translateY(${slideY}px)`, opacity: op,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)', borderLeft: '4px solid #CAFF00',
        padding: '20px 28px', width: '100%',
      }}>
        <WordBlock
          text={overlay.text} font={font} fontSize={fontSize}
          fontWeight={serif ? '400' : '600'} color={color}
          shadow={SHADOW.none} italic={serif}
          textAlign="left" lineGap={9} wordGap={10} lineHeight={1.6}
        />
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: glass-lower
// =============================================================================
function GlassLower({ overlay, frame }) {
  const total    = overlay.endFrame - overlay.startFrame;
  const font     = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color    = ensureColor(overlay.color);
  const fontSize = scaleFontSize(overlay.fontSize || 92, overlay.text);

  const slideY = interpolate(frame, [0, 20], [80, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'stretch' }}>
      <div style={{
        transform: `translateY(${slideY}px)`, opacity: op,
        background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.74))',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        padding: '28px 44px 44px', borderTop: '2px solid rgba(202,255,0,0.5)',
      }}>
        <WordBlock
          text={overlay.text} font={font} fontSize={fontSize}
          fontWeight="900" color={color} shadow={SHADOW.medium}
          stroke={overlay.stroke} uppercase letterSpacing="0.02em"
          lineHeight={1.15} lineGap={5} wordGap={12}
        />
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: line-reveal
// =============================================================================
function LineReveal({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 100, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines  = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        {lines.map((line, i) => {
          const delay  = i * 8;
          const slideX = interpolate(frame - delay, [0, 18], [-360, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const lineOp = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const words  = line.split(' ').filter(w => w.length > 0);
          return (
            <div key={i} style={{ transform: `translateX(${slideX}px)`, opacity: lineOp }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', alignItems: 'baseline' }}>
                {words.map((word, wi) => (
                  <span key={wi} style={{
                    fontFamily: font,
                    fontSize: (i === 0 ? Math.round(fSize * 1.05) : fSize) + 'px',
                    fontWeight: '900', display: 'inline-block',
                    color: i === 0 ? (overlay.accentColor || '#CAFF00') : color,
                    textShadow: SHADOW.heavy, letterSpacing: '0.02em',
                    lineHeight: 1.1, textTransform: 'uppercase',
                    ...strokeStyle(overlay.stroke),
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// Remaining animations (blur-in, slide-up, fade, caps, flip-up, split-reveal,
// letter-drop, multi-line, script-pair, word-bounce alias)
// All updated to use WordBlock for word spacing fix
// =============================================================================

function BlurIn({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif  = isSerifFont(overlay.font || 'Cormorant');
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const card   = getCardStyle(overlay.textBackground);
  const blur   = interpolate(frame, [0, 22], [14, 0], { extrapolateRight: 'clamp' });
  const op     = Math.min(
    interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px' }}>
      <div style={{ ...card, opacity: op, filter: `blur(${blur}px)` }}>
        <WordBlock text={overlay.text} font={font} fontSize={fSize}
          fontWeight={serif ? '400' : '600'} color={color}
          shadow={card ? SHADOW.none : SHADOW.medium}
          stroke={card ? null : overlay.stroke} italic={serif}
          lineGap={9} wordGap={10} lineHeight={1.6}
        />
      </div>
    </AbsoluteFill>
  );
}

function SlideUp({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif  = isSerifFont(overlay.font || 'Cormorant');
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const card   = getCardStyle(overlay.textBackground);
  const ty     = interpolate(frame, [0, 20], [50, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const op     = Math.min(
    interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 16, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px' }}>
      <div style={{ transform: `translateY(${ty}px)`, opacity: op, ...card }}>
        <WordBlock text={overlay.text} font={font} fontSize={fSize}
          fontWeight={serif ? '400' : '500'} color={color}
          shadow={card ? SHADOW.none : SHADOW.soft}
          stroke={card ? null : overlay.stroke} italic={serif}
          lineGap={9} wordGap={10} lineHeight={1.6}
        />
      </div>
    </AbsoluteFill>
  );
}

function Fade({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif  = isSerifFont(overlay.font || 'Cormorant');
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const card   = getCardStyle(overlay.textBackground);
  const op     = Math.min(
    interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 18, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px' }}>
      <div style={{ opacity: op, ...card }}>
        <WordBlock text={overlay.text} font={font} fontSize={fSize}
          fontWeight={serif ? '400' : '500'} color={color}
          shadow={card ? SHADOW.none : SHADOW.soft}
          stroke={card ? null : overlay.stroke} italic={serif}
          lineGap={9} wordGap={10} lineHeight={1.6}
        />
      </div>
    </AbsoluteFill>
  );
}

function Caps({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 92, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const op     = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  const ls = interpolate(frame, [0, 30], [0.3, 0.02], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px' }}>
      <div style={{ opacity: op }}>
        <WordBlock text={overlay.text} font={font} fontSize={fSize}
          fontWeight="900" color={color} shadow={SHADOW.heavy}
          stroke={overlay.stroke} uppercase letterSpacing={ls + 'em'}
          lineHeight={1.1} lineGap={4} wordGap={12}
        />
      </div>
    </AbsoluteFill>
  );
}

function FlipUp({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 100, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines  = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
        {lines.map((line, i) => {
          const rotX = interpolate(frame - i * 10, [0, 16], [-90, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lOp  = interpolate(frame - i * 10, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const words = line.split(' ').filter(w => w.length > 0);
          return (
            <div key={i} style={{ opacity: lOp, transform: `perspective(800px) rotateX(${rotX}deg)`, transformOrigin: 'center bottom' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', alignItems: 'baseline' }}>
                {words.map((word, wi) => (
                  <span key={wi} style={{
                    fontFamily: font, fontSize: fSize + 'px', fontWeight: '900',
                    color: i === 0 ? (overlay.accentColor || color) : color,
                    textShadow: SHADOW.heavy, textTransform: 'uppercase',
                    lineHeight: 1.15, letterSpacing: '0.02em', display: 'inline-block',
                    ...strokeStyle(overlay.stroke),
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function SplitReveal({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 100, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const lines  = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const split  = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const op     = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px', opacity: op }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${split * 16}px` }}>
        {lines.map((line, i) => {
          const words = line.split(' ').filter(w => w.length > 0);
          return (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', alignItems: 'baseline' }}>
              {words.map((word, wi) => (
                <span key={wi} style={{
                  fontFamily: font, fontSize: fSize + 'px', fontWeight: '900',
                  color: i === 0 ? (overlay.accentColor || '#CAFF00') : color,
                  textShadow: SHADOW.heavy, textTransform: 'uppercase',
                  lineHeight: 1.1, letterSpacing: '0.02em', display: 'inline-block',
                  ...strokeStyle(overlay.stroke),
                }}>
                  {word}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function LetterDrop({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 100, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const chars  = (overlay.text || '').split('');
  const fpc    = Math.max(2, Math.floor((total * 0.5) / Math.max(chars.length, 1)));
  const globalOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px' }}>
        {chars.map((ch, i) => {
          const cf  = frame - i * fpc;
          const cOp = interpolate(cf, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const cY  = interpolate(cf, [0, 12], [-40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          return (
            <span key={i} style={{
              fontFamily: font, fontSize: fSize + 'px', fontWeight: '900',
              color, textShadow: SHADOW.medium, opacity: cOp,
              transform: `translateY(${cY}px)`, display: 'inline-block',
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

function MultiLine({ overlay, frame }) {
  const total  = overlay.endFrame - overlay.startFrame;
  const font   = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const serif  = isSerifFont(overlay.font || 'Cormorant');
  const color  = ensureColor(overlay.color);
  const fSize  = scaleFontSize(overlay.fontSize || 56, overlay.text);
  const pos    = POSITION_STYLES[overlay.position] || POSITION_STYLES['lower-third'];
  const lines  = (overlay.text || '').split('\n').filter(l => l.trim().length > 0);
  const globalOp = Math.min(
    interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' })
  );
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 36px', opacity: globalOp }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {lines.map((line, i) => {
          const lOp  = interpolate(frame - i * 10, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const lX   = interpolate(frame - i * 10, [0, 16], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const words = line.split(' ').filter(w => w.length > 0);
          return (
            <div key={i} style={{ opacity: lOp, transform: `translateX(${lX}px)` }}>
              <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: '9px', alignItems: 'baseline',
                background: i === 0 ? 'rgba(0,0,0,0.55)' : 'transparent',
                padding: i === 0 ? '4px 12px' : '0',
              }}>
                {words.map((word, wi) => (
                  <span key={wi} style={{
                    fontFamily: font,
                    fontSize: (i === 0 ? Math.round(fSize * 1.1) : fSize) + 'px',
                    fontWeight: i === 0 ? '800' : (serif ? '400' : '400'),
                    color: i === 0 ? (overlay.accentColor || '#CAFF00') : color,
                    fontStyle: serif && i > 0 ? 'italic' : 'normal',
                    textShadow: SHADOW.soft, lineHeight: 1.55, display: 'inline-block',
                  }}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function ScriptPair({ overlay, frame }) {
  const total      = overlay.endFrame - overlay.startFrame;
  const scriptFont = FONT_MAP[overlay.scriptFont] || FONT_MAP.GreatVibes;
  const bodyFont   = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const scriptColor = ensureColor(overlay.scriptColor || overlay.color);
  const bodyColor   = ensureColor(overlay.bodyColor || '#FFFFFF');
  const scriptSize  = overlay.scriptFontSize || 104;
  const bodySize    = scaleFontSize(overlay.fontSize || 36, overlay.text);
  const pos         = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const sx  = interpolate(frame, [0, 24], [-28, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const sOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const bOp = Math.min(interpolate(frame, [12, 28], [0, 1], { extrapolateRight: 'clamp' }), interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' }));
  const eOp = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp' });
  return (
    <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', ...pos, padding: '0 48px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div style={{ transform: `translateX(${sx}px)`, opacity: sOp * eOp }}>
          <WordBlock text={overlay.scriptText || overlay.text} font={scriptFont}
            fontSize={scriptSize} fontWeight="400" color={scriptColor}
            shadow={SHADOW.heavy} italic lineHeight={1.15} lineGap={6} wordGap={8}
          />
        </div>
        {overlay.scriptText && overlay.text && (
          <div style={{ opacity: bOp }}>
            <WordBlock text={overlay.text} font={bodyFont} fontSize={bodySize}
              fontWeight="400" color={bodyColor} shadow={SHADOW.soft}
              uppercase letterSpacing="0.22em" lineGap={6} wordGap={10}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

const Bounce = WordBounce;

// =============================================================================
// DISPATCH
// =============================================================================
const ANIMATION_MAP = {
  'zoom-punch':     ZoomPunch,
  'stamp-impact':   StampImpact,
  'line-reveal':    LineReveal,
  'flip-up':        FlipUp,
  'glass-lower':    GlassLower,
  'split-reveal':   SplitReveal,
  'caps':           Caps,
  'letter-drop':    LetterDrop,
  'bounce':         Bounce,
  'elegant-rise':   ElegantRise,
  'stagger':        Stagger,
  'fade-word':      FadeWord,
  'editorial-body': EditorialBody,
  'blur-in':        BlurIn,
  'slide-up':       SlideUp,
  'fade':           Fade,
  'multi-line':     MultiLine,
  'word-bounce':    WordBounce,
  'kinetic':        Kinetic,
  'aesthetic-card': AestheticCard,
  'script-pair':    ScriptPair,
};

export const TextOverlay = ({ overlay }) => {
  if (!overlay || !overlay.text) return null;
  const frame     = useCurrentFrame();
  const Animation = ANIMATION_MAP[overlay.animation];
  if (!Animation) return <ElegantRise overlay={overlay} frame={frame} />;
  return <Animation overlay={overlay} frame={frame} />;
};
