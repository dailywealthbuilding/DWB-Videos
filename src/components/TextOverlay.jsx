// =============================================================================
// src/components/TextOverlay.jsx -- DWB v8.0 EDITORIAL REWRITE
//
// DESIGN MANIFESTO:
//   Class. Not meme. Weight hierarchy. 2 colors max.
//   Script fonts for elegance. Heavy sans for impact.
//   NO stroke on body text. Soft shadow only.
//   #CAFF00 on ONE accent word only — never the whole overlay.
//   Size contrast is everything: hook 110px, body 52-68px.
//
// NEW FONTS (add to public/index.html Google Fonts import):
//   Great Vibes — flowing script (like Sloop/Italianno refs)
//   Cormorant Garamond — editorial serif (like Bethany Elingston ref)
//   Dancing Script — casual handwrite (like handwrite ref Image 1)
//   Playfair Display — already in map
//
// STROKE RULE: ONLY render stroke if explicitly provided in overlay data.
//   Body text gets NO stroke by default. Hook/CTA get thin stroke max size 2.
//
// =============================================================================

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// =============================================================================
// FONT MAP — v8 additions marked NEW
// =============================================================================
const FONT_MAP = {
  // --- Impact fonts (hooks, CTAs) ---
  Anton:      "'Anton', sans-serif",
  Bebas:      "'Bebas Neue', sans-serif",
  Oswald:     "'Oswald', sans-serif",
  Barlow:     "'Barlow Condensed', sans-serif",
  Archivo:    "'Archivo Black', sans-serif",
  Impact:     "'Impact', 'Anton', sans-serif",

  // --- Editorial serifs ---
  Playfair:   "'Playfair Display', serif",
  Cormorant:  "'Cormorant Garamond', serif",   // NEW — Bethany Elingston style

  // --- Clean body fonts ---
  Montserrat: "'Montserrat', sans-serif",
  Grotesk:    "'Space Grotesk', sans-serif",
  Mono:       "'JetBrains Mono', monospace",

  // --- Script / handwrite (NEW) ---
  GreatVibes:     "'Great Vibes', cursive",        // Sloop Script style
  DancingScript:  "'Dancing Script', cursive",      // Handwrite style
  Italianno:      "'Italianno', cursive",            // Ultra-thin script
};

// =============================================================================
// POSITION MAP
// =============================================================================
const POSITION_STYLES = {
  "top-center":    { top: "14%",  left: 0, right: 0,    alignItems: "center",     justifyContent: "flex-start" },
  top:             { top: "14%",  left: 0, right: 0,    alignItems: "center",     justifyContent: "flex-start" },
  middle:          { top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  center:          { top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  "bottom-center": { bottom: "18%", left: 0, right: 0,  alignItems: "center",     justifyContent: "flex-end" },
  bottom:          { bottom: "18%", left: 0, right: 0,  alignItems: "center",     justifyContent: "flex-end" },
  "top-left":      { top: "14%",  left: "6%", alignItems: "flex-start", justifyContent: "flex-start" },
  "bottom-left":   { bottom: "18%", left: "6%", alignItems: "flex-start", justifyContent: "flex-end" },
  "top-right":     { top: "14%",  right: "6%", alignItems: "flex-end", justifyContent: "flex-start" },
};

// =============================================================================
// SHADOW PRESETS — no more thick black borders
// =============================================================================
const SHADOW = {
  // Body text — barely there, just enough to read on bright backgrounds
  soft:    "0 1px 8px rgba(0,0,0,0.65), 0 2px 20px rgba(0,0,0,0.4)",
  // Hook text — stronger but still not a stroke
  medium:  "0 2px 12px rgba(0,0,0,0.85), 0 4px 30px rgba(0,0,0,0.6)",
  // Heavy — for script on bright backgrounds
  heavy:   "0 2px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.9), 0 8px 40px rgba(0,0,0,0.7)",
  // Glow version for #CAFF00 accent
  neonSoft: "0 0 12px rgba(202,255,0,0.4), 0 2px 8px rgba(0,0,0,0.8)",
};

// =============================================================================
// HELPERS
// =============================================================================

function ensureVisibleColor(color) {
  if (!color) return "#FFFFFF";
  const c = String(color).trim();
  if (["black", "#000", "#000000", "transparent", "none", ""].includes(c.toLowerCase())) return "#FFFFFF";
  return c;
}

// Compute font size — scales down for long text
function computeFontSize(base, text) {
  const len = (text || "").replace(/\n/g, "").length;
  if (len <= 18) return base;
  if (len <= 35) return Math.round(base * 0.88);
  if (len <= 55) return Math.round(base * 0.76);
  return Math.round(base * 0.64);
}

// Build stroke style — ONLY if explicitly provided
function buildStrokeStyle(stroke) {
  if (!stroke || !stroke.size || !stroke.color) return {};
  return { WebkitTextStroke: `${stroke.size}px ${stroke.color}` };
}

// =============================================================================
// REUSABLE TEXT BLOCK — the clean default render
// =============================================================================
function TextBlock({ text, fontFamily, fontSize, fontWeight, color, shadow, stroke, letterSpacing, textAlign, italic, style = {} }) {
  return (
    <div style={{
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      color,
      textShadow: shadow || SHADOW.soft,
      textAlign: textAlign || "center",
      lineHeight: 1.2,
      whiteSpace: "pre-line",
      fontStyle: italic ? "italic" : "normal",
      letterSpacing: letterSpacing || "normal",
      ...buildStrokeStyle(stroke),
      ...style,
    }}>
      {text}
    </div>
  );
}

// =============================================================================
// ANIMATION: elegant-rise
// Soft opacity + slight upward drift. The default for class content.
// =============================================================================
function ElegantRise({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = computeFontSize(overlay.fontSize || 68, overlay.text);
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const translateY = interpolate(frame, [0, 20], [24, 0], {
    extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const opacity = Math.min(
    interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 52px" }}>
      <div style={{ transform: `translateY(${translateY}px)`, opacity }}>
        <TextBlock
          text={overlay.text}
          fontFamily={fontFamily}
          fontSize={fontSize}
          fontWeight={overlay.font === "Montserrat" ? "700" : "bold"}
          color={color}
          shadow={SHADOW.soft}
          stroke={overlay.stroke}
          letterSpacing={overlay.letterSpacing}
          italic={overlay.italic}
        />
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: script-pair
// Large flowing script on top, smaller clean sans below.
// The editorial pairing from refs Images 4-11.
// overlay.scriptText = large script line (e.g. "Consistency")
// overlay.text       = small clean body below
// =============================================================================
function ScriptPair({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const scriptFont = FONT_MAP[overlay.scriptFont] || FONT_MAP.GreatVibes;
  const bodyFont   = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const scriptColor = ensureVisibleColor(overlay.scriptColor || overlay.color);
  const bodyColor   = ensureVisibleColor(overlay.bodyColor || "#FFFFFF");
  const scriptSize  = overlay.scriptFontSize || 100;
  const bodySize    = overlay.fontSize || 36;

  // Script slides in from slight left + fades
  const scriptX = interpolate(frame, [0, 22], [-30, 0], {
    extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const scriptOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Body fades in slightly after
  const bodyOp = Math.min(
    interpolate(frame, [10, 26], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );
  const scriptExitOp = interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 40px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        {/* Large script */}
        <div style={{ transform: `translateX(${scriptX}px)`, opacity: scriptOp * scriptExitOp }}>
          <div style={{
            fontFamily: scriptFont,
            fontSize: `${scriptSize}px`,
            fontWeight: "400",
            color: scriptColor,
            textShadow: SHADOW.heavy,
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "0.01em",
          }}>
            {overlay.scriptText || overlay.text}
          </div>
        </div>
        {/* Small clean body — only if both scriptText and text exist */}
        {overlay.scriptText && overlay.text && (
          <div style={{ opacity: bodyOp }}>
            <div style={{
              fontFamily: bodyFont,
              fontSize: `${bodySize}px`,
              fontWeight: "400",
              color: bodyColor,
              textShadow: SHADOW.soft,
              textAlign: "center",
              lineHeight: 1.3,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              {overlay.text}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: pill-card
// Dark frosted rounded rectangle sits behind text.
// From ref Image 2 — "The Secret of Staying Consistent" pill style.
// =============================================================================
function PillCard({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = computeFontSize(overlay.fontSize || 64, overlay.text);
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const scaleY = interpolate(frame, [0, 14], [0.85, 1], {
    extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const opacity = Math.min(
    interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );

  // Bold word — make one word bold if specified
  const boldWord = overlay.boldWord;
  const parts = boldWord ? overlay.text.split(boldWord) : null;

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 32px" }}>
      <div style={{
        transform: `scaleY(${scaleY})`,
        opacity,
        background: "rgba(15, 15, 15, 0.82)",
        backdropFilter: "blur(8px)",
        borderRadius: "14px",
        padding: "18px 28px",
        maxWidth: "88%",
        textAlign: "center",
      }}>
        {boldWord && parts ? (
          <div style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            color,
            textShadow: "none",
            lineHeight: 1.3,
          }}>
            {parts[0]}
            <span style={{ fontWeight: "800" }}>{boldWord}</span>
            {parts[1]}
          </div>
        ) : (
          <div style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight: "600",
            color,
            textShadow: "none",
            lineHeight: 1.3,
          }}>
            {overlay.text}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: mixed-weight
// "HOW TO ADD" heavy caps + flowing script on next line.
// From ref Image 14.
// =============================================================================
function MixedWeight({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const lines = (overlay.text || "").split("\n");
  const heavyLine  = lines[0] || "";
  const scriptLine = lines[1] || "";

  const heavyFont  = FONT_MAP[overlay.heavyFont] || FONT_MAP.Anton;
  const scriptFont = FONT_MAP[overlay.scriptFont] || FONT_MAP.GreatVibes;
  const color = ensureVisibleColor(overlay.color);
  const heavySize  = overlay.heavyFontSize  || 72;
  const scriptSize = overlay.scriptFontSize || 90;

  const opacity = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );

  const heavyY  = interpolate(frame, [0, 18], [16, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const scriptY = interpolate(frame, [6, 24], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 40px", opacity }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px" }}>
        {/* Heavy uppercase line */}
        {heavyLine && (
          <div style={{ transform: `translateY(${heavyY}px)` }}>
            <div style={{
              fontFamily: heavyFont,
              fontSize: `${heavySize}px`,
              fontWeight: "900",
              color,
              textShadow: SHADOW.medium,
              textAlign: "center",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.0,
              WebkitTextStroke: overlay.stroke ? `${overlay.stroke.size}px ${overlay.stroke.color}` : "none",
            }}>
              {heavyLine}
            </div>
          </div>
        )}
        {/* Script flowing line */}
        {scriptLine && (
          <div style={{ transform: `translateY(${scriptY}px)` }}>
            <div style={{
              fontFamily: scriptFont,
              fontSize: `${scriptSize}px`,
              fontWeight: "400",
              color: overlay.accentColor || color,
              textShadow: SHADOW.heavy,
              textAlign: "center",
              lineHeight: 1.0,
              marginTop: "-8px",
            }}>
              {scriptLine}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: editorial-body
// Clean white serif, left-aligned, minimal. From refs 15 & 16.
// =============================================================================
function EditorialBody({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = overlay.fontSize || 54;
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const opacity = Math.min(
    interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }),
    interpolate(frame, [totalFrames - 16, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );

  // Stagger each line
  const lines = (overlay.text || "").split("\n").filter(l => l.trim());

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 52px", opacity }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {lines.map((line, i) => {
          const lineOp = interpolate(frame - i * 8, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const lineY  = interpolate(frame - i * 8, [0, 16], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ opacity: lineOp, transform: `translateY(${lineY}px)` }}>
              <div style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight: i === 0 ? "700" : "400",
                color: i === 0 ? (overlay.accentColor || color) : color,
                textShadow: SHADOW.soft,
                textAlign: "left",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
                fontStyle: i === 0 ? "normal" : "normal",
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
// ANIMATION: letter-breathe
// Letter spacing expands from 0 → normal on entry. Elegant, airy.
// =============================================================================
function LetterBreathe({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = computeFontSize(overlay.fontSize || 72, overlay.text);
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const spacing = interpolate(frame, [0, 28], [-0.05, 0.22], {
    extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const opacity = Math.min(
    interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 40px", opacity }}>
      <div style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight: "300",
        color,
        textShadow: SHADOW.medium,
        textAlign: "center",
        lineHeight: 1.2,
        whiteSpace: "pre-line",
        letterSpacing: `${spacing}em`,
        textTransform: "uppercase",
      }}>
        {overlay.text}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: fade-word
// Words appear one by one, gently. No bounce, no slam.
// =============================================================================
function FadeWord({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = computeFontSize(overlay.fontSize || 68, overlay.text);
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const words = (overlay.text || "").split(" ");
  const framesPerWord = Math.max(6, Math.floor((totalFrames * 0.7) / Math.max(words.length, 1)));

  const exitOp = interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 52px", opacity: exitOp }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.22em" }}>
        {words.map((word, i) => {
          const wordStart = i * framesPerWord;
          const wOp = interpolate(frame - wordStart, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const wY  = interpolate(frame - wordStart, [0, 12], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
          return (
            <div key={i} style={{ opacity: wOp, transform: `translateY(${wY}px)`, display: "inline-block" }}>
              <div style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight: "600",
                color,
                textShadow: SHADOW.soft,
              }}>
                {word}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: accent-reveal
// White text, then ONE word swaps to #CAFF00 with a soft glow pulse.
// overlay.accentWord = the word to highlight in CAFF00
// =============================================================================
function AccentReveal({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = computeFontSize(overlay.fontSize || 82, overlay.text);
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const accentColor = overlay.accentColor || "#CAFF00";
  const accentWord  = overlay.accentWord || "";

  const opacity = Math.min(
    interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 12, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );

  // Accent word pops at frame 18
  const accentOp = interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const accentScale = interpolate(frame, [18, 26], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const glowPulse = 0.5 + Math.sin(frame * 0.1) * 0.3;

  const words = (overlay.text || "").split(" ");

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 44px", opacity }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "0.18em" }}>
        {words.map((word, i) => {
          const isAccent = word.replace(/[^a-zA-Z]/g, "").toLowerCase() === accentWord.toLowerCase();
          return (
            <span key={i} style={{
              fontFamily,
              fontSize: isAccent ? `${Math.round(fontSize * 1.08)}px` : `${fontSize}px`,
              fontWeight: "bold",
              color: isAccent ? accentColor : color,
              textShadow: isAccent
                ? `0 0 ${12 * glowPulse}px ${accentColor}88, ${SHADOW.medium}`
                : SHADOW.medium,
              display: "inline-block",
              transform: isAccent ? `scale(${accentScale})` : "scale(1)",
              opacity: isAccent ? accentOp : 1,
              letterSpacing: overlay.letterSpacing || "0.02em",
              WebkitTextStroke: overlay.stroke ? `${overlay.stroke.size}px ${overlay.stroke.color}` : "none",
              lineHeight: 1.1,
            }}>
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: cinematic-title
// Full-width title. Thin horizontal line draws under it. Editorial.
// =============================================================================
function CinematicTitle({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Cormorant;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = computeFontSize(overlay.fontSize || 80, overlay.text);
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;

  const opacity = Math.min(
    interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );
  const lineW = interpolate(frame, [12, 32], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
  });
  const textY = interpolate(frame, [0, 18], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 44px", opacity }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div style={{ transform: `translateY(${textY}px)` }}>
          <div style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight: "300",
            color,
            textShadow: SHADOW.medium,
            textAlign: "center",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}>
            {overlay.text}
          </div>
        </div>
        {/* Underline draws left → right */}
        <div style={{
          width: "100%",
          height: "1px",
          background: `linear-gradient(to right, transparent 0%, ${overlay.accentColor || color} ${lineW}%, transparent ${lineW}%)`,
          opacity: 0.7,
        }} />
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ANIMATION: ghost-repeat
// "FOCUS × 6" fading repeat pattern. Text stacks vertically at decreasing opacity.
// From vault notes on Pinterest refs.
// =============================================================================
function GhostRepeat({ overlay, frame, fps }) {
  const totalFrames = overlay.endFrame - overlay.startFrame;
  const fontFamily = FONT_MAP[overlay.font] || FONT_MAP.Anton;
  const color = ensureVisibleColor(overlay.color);
  const fontSize = overlay.fontSize || 72;
  const posStyle = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const repeatCount = overlay.repeatCount || 5;

  const entryOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const exitOp  = interpolate(frame, [totalFrames - 14, totalFrames], [1, 0], { extrapolateLeft: "clamp" });

  const rows = Array.from({ length: repeatCount }, (_, i) => ({
    text: overlay.text,
    opacity: Math.max(0.06, 1 - i * (0.85 / (repeatCount - 1))),
    scale: Math.max(0.7, 1 - i * (0.18 / (repeatCount - 1))),
  }));

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...posStyle, padding: "0 32px", opacity: Math.min(entryOp, exitOp) }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        {rows.map((row, i) => (
          <div key={i} style={{ opacity: row.opacity, transform: `scale(${row.scale})` }}>
            <div style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight: "900",
              color,
              textShadow: i === 0 ? SHADOW.heavy : "none",
              textAlign: "center",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.0,
            }}>
              {overlay.text}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// =============================================================================
// ── KEEPING ALL LEGACY ANIMATIONS ─────────────────────────────────────────────
// These power days 36-49. They are NOT deleted — just kept below.
// =============================================================================

const SCRAMBLE_CHARS = "!@#$%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function getScrambleChar(seed) { return SCRAMBLE_CHARS[seed % SCRAMBLE_CHARS.length]; }

// Legacy: TypewriterText
const TypewriterText = ({ text, fontSize, fontFamily, color, fontWeight }) => {
  const frame = useCurrentFrame();
  const chars = text.split("");
  const charsToShow = Math.floor(interpolate(frame, [0, 100], [0, chars.length], { extrapolateRight: "clamp" }));
  const visible = chars.slice(0, charsToShow).join("");
  const cursorVisible = charsToShow < chars.length;
  return (
    <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", textShadow: SHADOW.soft }}>
      {visible}
      {cursorVisible && <span style={{ opacity: Math.round(frame / 8) % 2 === 0 ? 1 : 0, marginLeft: 2 }}>|</span>}
    </div>
  );
};

// Legacy: WordHighlightText
const WordHighlightText = ({ text, fontSize, fontFamily, color, fontWeight, totalFrames }) => {
  const frame = useCurrentFrame();
  const lines = text.split("\n");
  let globalIdx = 0;
  const lineWords = lines.map(line => line.split(" ").filter(w => w.length > 0).map(word => ({ word, idx: globalIdx++ })));
  const totalWords = globalIdx;
  const framesPerWord = Math.max(1, Math.floor(totalFrames / Math.max(totalWords, 1)));
  const currentIdx = Math.min(Math.floor(frame / framesPerWord), totalWords - 1);
  const blockOpacity = interpolate(frame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2em", opacity: blockOpacity }}>
      {lineWords.map((words, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.2em" }}>
          {words.map(({ word, idx }, wi) => {
            const isCurrent = idx === currentIdx;
            const isPast = idx < currentIdx;
            return (
              <span key={`${li}-${wi}`} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: isCurrent ? "#FFD700" : (isPast ? "rgba(255,255,255,0.45)" : color), textShadow: isCurrent ? SHADOW.neonSoft : SHADOW.soft }}>
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// MAIN EXPORT
// =============================================================================
export const TextOverlay = ({ overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = overlay.endFrame - overlay.startFrame;
  const rawText     = overlay.text || "";
  const safeColor   = ensureVisibleColor(overlay.color);
  const posStyle    = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const baseFontSize = overlay.fontSize || 68;
  const fontSize    = computeFontSize(baseFontSize, rawText);
  const fontFamily  = FONT_MAP[overlay.font] || FONT_MAP.Montserrat;
  const fontWeight  = (overlay.font === "Montserrat" || overlay.font === "Grotesk") ? "700" : "bold";
  const fontStyle   = overlay.italic ? "italic" : "normal";
  const extraSpacing = overlay.letterSpacing || "normal";
  const strokeStyle  = buildStrokeStyle(overlay.stroke);

  // ── NEW v8 ANIMATIONS ────────────────────────────────────────────────────────
  if (overlay.animation === "elegant-rise")    return <ElegantRise   overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "script-pair")     return <ScriptPair    overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "pill-card")       return <PillCard      overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "mixed-weight")    return <MixedWeight   overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "editorial-body")  return <EditorialBody overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "letter-breathe")  return <LetterBreathe overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "fade-word")       return <FadeWord      overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "accent-reveal")   return <AccentReveal  overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "cinematic-title") return <CinematicTitle overlay={overlay} frame={frame} fps={fps} />;
  if (overlay.animation === "ghost-repeat")    return <GhostRepeat   overlay={overlay} frame={frame} fps={fps} />;

  // ── LEGACY ANIMATIONS (days 36-49 backward compat) ──────────────────────────

  let opacity = 1, translateX = 0, translateY = 0, scale = 1, glitchRGBOffset = 0;

  if (overlay.animation === "fade") {
    opacity = interpolate(frame, [0, 8, totalFrames - 8, totalFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }
  if (overlay.animation === "pop") {
    const s = spring({ fps, frame, config: { damping: 12, stiffness: 200 } });
    scale = interpolate(s, [0, 1], [0.5, 1]);
    opacity = Math.min(interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }
  if (overlay.animation === "slide-left") {
    translateX = interpolate(frame, [0, 12], [-320, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }
  if (overlay.animation === "slide-right") {
    translateX = interpolate(frame, [0, 12], [320, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }
  if (overlay.animation === "slide-up") {
    translateY = interpolate(frame, [0, 12], [80, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }
  if (overlay.animation === "slide-down") {
    translateY = interpolate(frame, [0, 12], [-80, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }
  if (overlay.animation === "bounce") {
    const s = spring({ fps, frame, config: { damping: 8, stiffness: 180, mass: 0.8 } });
    translateY = interpolate(s, [0, 1], [40, 0]);
    opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  }
  if (overlay.animation === "zoom-punch") {
    const s = spring({ fps, frame, config: { damping: 7, stiffness: 280, mass: 0.6 } });
    scale = interpolate(s, [0, 1], [3.2, 1]);
    opacity = Math.min(interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }
  if (overlay.animation === "zoom-out") {
    scale = interpolate(frame, [0, 30], [1.8, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }
  if (overlay.animation === "heartbeat") {
    const beatFrame = frame % 45;
    scale = beatFrame < 8 ? interpolate(beatFrame, [0, 4, 8], [1, 1.06, 1], { extrapolateRight: "clamp" }) : 1;
  }
  if (overlay.animation === "glitch") {
    const glitchCycle = frame % 18;
    glitchRGBOffset = glitchCycle < 3 ? interpolate(glitchCycle, [0, 3], [0, 1]) : 0;
    translateX = glitchCycle < 3 ? (Math.sin(frame * 13.7) * 6) : 0;
    opacity = Math.min(interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
  }

  // RGB glitch shadow
  const rgbSplit = glitchRGBOffset > 0.05
    ? `${Math.round(glitchRGBOffset * 6)}px 0 rgba(255,0,60,0.85), ${-Math.round(glitchRGBOffset * 6)}px 0 rgba(0,255,220,0.85), `
    : "";
  const computedTextShadow = rgbSplit + SHADOW.medium;
  const legacyStyle = { textShadow: computedTextShadow, ...strokeStyle };

  // ── Complex legacy renders ────────────────────────────────────────────────

  if (overlay.animation === "typewriter") {
    const twOpacity = Math.min(interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: twOpacity, ...posStyle }}>
        <TypewriterText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} />
      </div>
    );
  }
  if (overlay.animation === "word-highlight") {
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", ...posStyle }}>
        <WordHighlightText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} totalFrames={totalFrames} />
      </div>
    );
  }
  if (overlay.animation === "stagger") {
    const words = rawText.split(" ");
    const DELAY = 4;
    const blockOpacity = Math.min(interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: blockOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.2em" }}>
          {words.map((word, i) => {
            const wf = frame - i * DELAY;
            const wo = interpolate(wf, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const wy = interpolate(wf, [0, 8], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textShadow: SHADOW.soft, transform: `translateY(${wy}px)`, opacity: wo, fontStyle, display: "inline-block", ...strokeStyle }}>
                {word}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (overlay.animation === "split-reveal") {
    const words = rawText.split(" ");
    const srOpacity = Math.min(interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: srOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0.2em" }}>
          {words.map((word, i) => {
            const wordDelay = i * 5;
            const progress = interpolate(frame - wordDelay, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)) });
            const direction = i % 2 === 0 ? -1 : 1;
            const wTX = interpolate(progress, [0, 1], [direction * 120, 0]);
            const wordOpacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textShadow: SHADOW.soft, transform: `translateX(${wTX}px)`, opacity: wordOpacity, fontStyle, ...strokeStyle }}>
                {word}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (overlay.animation === "blur-in") {
    const blurAmount = interpolate(frame, [0, 18], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const biOpacity = Math.min(interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    const biScale = interpolate(frame, [0, 18], [1.06, 1.0], { extrapolateRight: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: biOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textShadow: SHADOW.soft, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", filter: `blur(${blurAmount}px)`, transform: `scale(${biScale})`, fontStyle, ...strokeStyle }}>
          {rawText}
        </div>
      </div>
    );
  }
  if (overlay.animation === "word-bounce") {
    const words = rawText.split(" ");
    const wbOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 50px", opacity: wbOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0.2em" }}>
          {words.map((word, i) => {
            const delay = i * 3;
            const bounceVal = spring({ fps, frame: frame - delay, config: { damping: 6, stiffness: 260, mass: 0.7 } });
            const wScale = interpolate(bounceVal, [0, 1], [0, 1]);
            const wOpacity = interpolate(frame - delay, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textShadow: SHADOW.soft, transform: `scale(${wScale})`, opacity: wOpacity, display: "inline-block", fontStyle, transformOrigin: "center bottom", ...strokeStyle }}>
                {word}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (overlay.animation === "kinetic") {
    const words = rawText.split(" ");
    const sizePattern = [1.4, 0.8, 1.15, 0.75, 1.3, 0.9, 1.2];
    const colorPattern = [safeColor, overlay.accentColor || "#CAFF00", safeColor, "#FFFFFF", safeColor];
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 40px", ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "0.15em", rowGap: "0.05em" }}>
          {words.map((word, i) => {
            const delay = i * 4;
            const wordScale = spring({ fps, frame: frame - delay, config: { damping: 10, stiffness: 220 } });
            const s = interpolate(wordScale, [0, 1], [0, 1]);
            const wOpacity = interpolate(frame - delay, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const exitOp = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
            const wordSize = fontSize * (sizePattern[i % sizePattern.length] || 1);
            const wordColor = colorPattern[i % colorPattern.length];
            const isLarge = (sizePattern[i % sizePattern.length] || 1) >= 1.2;
            return (
              <div key={i} style={{ fontFamily, fontSize: `${wordSize}px`, fontWeight: isLarge ? "900" : "700", color: wordColor, textShadow: SHADOW.heavy, transform: `scale(${s})`, opacity: Math.min(wOpacity, exitOp), display: "inline-block", fontStyle, lineHeight: 1.0, textTransform: isLarge ? "uppercase" : "none", ...strokeStyle }}>
                {word}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (overlay.animation === "stamp-impact") {
    const SLAM_FRAMES = 8;
    const scaleY = frame < SLAM_FRAMES ? interpolate(frame, [0, 2, 5, SLAM_FRAMES], [2.4, 0.75, 1.08, 1.0], { extrapolateRight: "clamp" }) : 1.0;
    const scaleX = frame < SLAM_FRAMES ? interpolate(frame, [0, 2, 5, SLAM_FRAMES], [0.6, 1.15, 0.96, 1.0], { extrapolateRight: "clamp" }) : 1.0;
    const exitOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 30px", opacity: exitOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight: "bold", color: safeColor, textAlign: "center", lineHeight: 1.05, whiteSpace: "pre-line", textShadow: SHADOW.heavy, transform: `scaleX(${scaleX}) scaleY(${scaleY})`, letterSpacing: overlay.letterSpacing || "0.03em", textTransform: "uppercase", ...strokeStyle }}>
          {rawText}
        </div>
      </div>
    );
  }
  if (overlay.animation === "flip-up") {
    const words = rawText.split(" ");
    const fuOpacity = Math.min(interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: fuOpacity, perspective: "800px", ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0.25em", perspective: "800px" }}>
          {words.map((word, i) => {
            const delay = i * 6;
            const rotateX = interpolate(frame - delay, [0, 16], [-90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            const wOpacity = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textShadow: SHADOW.soft, transform: `rotateX(${rotateX}deg)`, transformOrigin: "center bottom", opacity: wOpacity, display: "inline-block", fontStyle, ...strokeStyle }}>
                {word}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (overlay.animation === "letter-drop") {
    const chars = rawText.split("");
    const ldOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 40px", opacity: ldOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
          {chars.map((ch, i) => {
            const FRAMES_PER_CHAR = 3;
            const dropFrame = frame - i * FRAMES_PER_CHAR;
            const ldTranslateY = interpolate(dropFrame, [0, 12], [-120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.bounce) });
            const charOpacity = interpolate(dropFrame, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (ch === "\n") return <div key={i} style={{ width: "100%", height: 0 }} />;
            if (ch === " ") return <div key={i} style={{ width: "0.3em" }} />;
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textShadow: SHADOW.soft, transform: `translateY(${ldTranslateY}px)`, opacity: charOpacity, display: "inline-block", fontStyle, ...strokeStyle }}>
                {ch}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (overlay.animation === "neon-glow") {
    const glowColor = overlay.glowColor || safeColor;
    const pulseIntensity = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.7, 1]);
    const nOpacity = Math.min(interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: nOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: glowColor, textShadow: `0 0 7px ${glowColor}, 0 0 14px ${glowColor}, 0 0 28px ${glowColor}80, 0 2px 8px rgba(0,0,0,0.9)`, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle, filter: `brightness(${pulseIntensity})` }}>
          {rawText}
        </div>
      </div>
    );
  }
  if (overlay.animation === "caps") {
    const capsSpacing = interpolate(frame, [0, 14], [0.6, 0.1], { extrapolateRight: "clamp" });
    const capsOpacity = Math.min(interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: capsOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textShadow: SHADOW.heavy, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle, textTransform: "uppercase", letterSpacing: `${capsSpacing}em`, ...strokeStyle }}>
          {rawText}
        </div>
      </div>
    );
  }
  if (overlay.animation === "multi-line") {
    const lines = rawText.split("\n").filter(l => l.trim().length > 0);
    const LINE_DELAY = 12;
    const blockOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", padding: "0 60px", opacity: blockOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15em" }}>
          {lines.map((line, i) => {
            const lineFrame = frame - i * LINE_DELAY;
            const lineOpacity = interpolate(lineFrame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const lineY = interpolate(lineFrame, [0, 10], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor, textAlign: "center", lineHeight: 1.2, textShadow: SHADOW.soft, opacity: lineOpacity, transform: `translateY(${lineY}px)`, ...strokeStyle }}>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── All other legacy animations fall through to default render ────────────
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", flexDirection: "column", padding: "0 56px",
      opacity,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      ...posStyle,
    }}>
      <div style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight,
        color: safeColor,
        textShadow: computedTextShadow,
        textAlign: "center",
        lineHeight: 1.25,
        whiteSpace: "pre-line",
        fontStyle,
        letterSpacing: extraSpacing !== "normal" ? extraSpacing : "0.01em",
        wordSpacing: "0.05em",
        ...strokeStyle,
      }}>
        {rawText}
      </div>
    </div>
  );
};
