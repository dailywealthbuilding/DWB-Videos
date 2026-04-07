import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";

// -----------------------------------------------------------------------------
// FONT MAP
// -----------------------------------------------------------------------------
const FONT_MAP = {
  Anton:      "'Anton', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
  Gabon:      "'Cabin Sketch', sans-serif",
  Bebas:      "'Bebas Neue', sans-serif",
  Oswald:     "'Oswald', sans-serif",
  Mono:       "'JetBrains Mono', monospace",
  Playfair:   "'Playfair Display', serif",
  // NEW -- premium display fonts
  Archivo:    "'Archivo Black', sans-serif",
  Barlow:     "'Barlow Condensed', sans-serif",
  Grotesk:    "'Space Grotesk', sans-serif",
  Impact:     "'Impact', 'Anton', sans-serif",
};

// -----------------------------------------------------------------------------
// POSITION MAP
// -----------------------------------------------------------------------------
const POSITION_STYLES = {
  "top-center":    { top: "18%",    left: 0, right: 0, alignItems: "center", justifyContent: "flex-start" },
  top:             { top: "18%",    left: 0, right: 0, alignItems: "center", justifyContent: "flex-start" },
  middle:          { top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  center:          { top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  "bottom-center": { bottom: "22%", left: 0, right: 0, alignItems: "center", justifyContent: "flex-end" },
  bottom:          { bottom: "22%", left: 0, right: 0, alignItems: "center", justifyContent: "flex-end" },
  "top-left":      { top: "18%", left: "5%", alignItems: "flex-start", justifyContent: "flex-start" },
  "bottom-left":   { bottom: "22%", left: "5%", alignItems: "flex-start", justifyContent: "flex-end" },
};

// -----------------------------------------------------------------------------
// GLOBAL SHADOW CONSTANTS
// [FIXED: were missing -- referenced throughout but never defined]
// -----------------------------------------------------------------------------
const BASE_SHADOW  = "0 2px 0 rgba(0,0,0,1), 0 4px 12px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.8)";
const HEAVY_SHADOW = "0 2px 0 rgba(0,0,0,1), 0 4px 12px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)";

// -----------------------------------------------------------------------------
// HELPERS
// [FIXED: ensureVisibleColor had <= operators eaten; buildTextGlow header stripped;
//         computeFontSize was entirely missing]
// -----------------------------------------------------------------------------

function ensureVisibleColor(color) {
  if (!color) return "#FFFFFF";
  const c = String(color).trim();
  const darkNames = ["black", "#000", "#000000", "transparent", "none", ""];
  if (darkNames.includes(c.toLowerCase())) return "#FFFFFF";
  if (c.startsWith("#")) {
    const hex = c.replace("#", "");
    const full = hex.length === 3 ? hex.split("").map(h => h + h).join("") : hex.padEnd(6, "0");
    const r = parseInt(full.substring(0, 2), 16);
    const g = parseInt(full.substring(2, 4), 16);
    const b = parseInt(full.substring(4, 6), 16);
    if ((0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.4) return "#FFFFFF";
  }
  if (c.startsWith("rgb")) {
    const nums = c.match(/[\d.]+/g) || [];
    if (nums.length >= 3 && (0.299 * +nums[0] + 0.587 * +nums[1] + 0.114 * +nums[2]) / 255 < 0.4) return "#FFFFFF";
  }
  return c;
}

function buildTextGlow(color) {
  return [
    `0 0 7px ${color}`,
    `0 0 14px ${color}`,
    `0 0 28px ${color}`,
    `0 0 56px ${color}80`,
    "0 2px 0 rgba(0,0,0,1)",
    "0 4px 12px rgba(0,0,0,0.9)",
  ].join(", ");
}

function computeFontSize(base, text) {
  const len = (text || "").replace(/\n/g, "").length;
  if (len <= 20) return base;
  if (len <= 40) return Math.round(base * 0.88);
  if (len <= 60) return Math.round(base * 0.76);
  return Math.round(base * 0.65);
}

const SCRAMBLE_CHARS = "!@#$%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function getScrambleChar(seed) {
  return SCRAMBLE_CHARS[seed % SCRAMBLE_CHARS.length];
}

// -----------------------------------------------------------------------------
// SUB-COMPONENTS
// -----------------------------------------------------------------------------

// -- TYPEWRITER --
// [FIXED: cursorVisible condition stripped; return JSX stripped]
const TypewriterText = ({ text, fontSize, fontFamily, color, fontWeight }) => {
  const frame = useCurrentFrame();
  const chars = text.split("");
  const charsToShow = Math.floor(
    interpolate(frame, [0, 100], [0, chars.length], { extrapolateRight: "clamp" })
  );
  const visible = chars.slice(0, charsToShow).join("");
  const cursorVisible = charsToShow < chars.length;
  return (
    <div style={{
      fontFamily, fontSize: `${fontSize}px`, fontWeight, color,
      textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
      textShadow: BASE_SHADOW,
    }}>
      {visible}
      {cursorVisible && (
        <span style={{ opacity: Math.round(frame / 8) % 2 === 0 ? 1 : 0, marginLeft: 2 }}>|</span>
      )}
    </div>
  );
};

// -- WORD-HIGHLIGHT --
// [FIXED: isPast condition stripped; return JSX stripped]
const WordHighlightText = ({ text, fontSize, fontFamily, color, fontWeight, totalFrames }) => {
  const frame = useCurrentFrame();
  const lines = text.split("\n");
  let globalIdx = 0;
  const lineWords = lines.map(line =>
    line.split(" ").filter(w => w.length > 0).map(word => ({ word, idx: globalIdx++ }))
  );
  const totalWords = globalIdx;
  const framesPerWord = Math.max(1, Math.floor(totalFrames / Math.max(totalWords, 1)));
  const currentIdx = Math.min(Math.floor(frame / framesPerWord), totalWords - 1);
  const blockOpacity = interpolate(frame, [totalFrames - 10, totalFrames], [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2em", opacity: blockOpacity }}>
      {lineWords.map((words, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.2em" }}>
          {words.map(({ word, idx }, wi) => {
            const isCurrent = idx === currentIdx;
            const isPast = idx < currentIdx;
            return (
              <span key={`${li}-${wi}`} style={{
                fontFamily, fontSize: `${fontSize}px`, fontWeight,
                color: isCurrent ? "#FFD700" : (isPast ? "rgba(255,255,255,0.45)" : color),
                textShadow: isCurrent ? buildTextGlow("#FFD700") : BASE_SHADOW,
                transition: "color 0.08s",
              }}>{word}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// -- SCRAMBLE --
// [FIXED: return JSX stripped]
const ScrambleText = ({ text, fontSize, fontFamily, color, fontWeight, totalFrames }) => {
  const frame = useCurrentFrame();
  const chars = text.split("");
  const resolveEnd = Math.floor(totalFrames * 0.6);
  const opacity = Math.min(
    interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );
  return (
    <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color, textAlign: "center", lineHeight: 1.2, opacity, whiteSpace: "pre-line", textShadow: BASE_SHADOW }}>
      {chars.map((ch, i) => {
        if (ch === "\n") return <br key={i} />;
        if (ch === " ") return <span key={i}>&nbsp;</span>;
        const charResolveFrame = Math.floor((i / Math.max(chars.length, 1)) * resolveEnd);
        if (frame >= charResolveFrame) return <span key={i}>{ch}</span>;
        const seed = (frame * 7 + i * 13) % SCRAMBLE_CHARS.length;
        return (
          <span key={i} style={{ opacity: 0.6, color: "#FFD700" }}>
            {getScrambleChar(seed)}
          </span>
        );
      })}
    </div>
  );
};

// -- MULTI-LINE STAGGER --
// [FIXED: return JSX stripped]
const MultiLineText = ({ text, fontSize, fontFamily, color, fontWeight, totalFrames }) => {
  const frame = useCurrentFrame();
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  const LINE_DELAY = 12;
  const blockOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15em", opacity: blockOpacity }}>
      {lines.map((line, i) => {
        const lineFrame = frame - i * LINE_DELAY;
        const lineOpacity = interpolate(lineFrame, [0, 8], [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const lineY = interpolate(lineFrame, [0, 10], [24, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic) });
        return (
          <div key={i} style={{
            fontFamily, fontSize: `${fontSize}px`, fontWeight, color,
            textAlign: "center", lineHeight: 1.2,
            textShadow: BASE_SHADOW,
            opacity: lineOpacity,
            transform: `translateY(${lineY}px)`,
          }}>{line}</div>
        );
      })}
    </div>
  );
};

// -- STRIKE-THROUGH --
// [FIXED: return JSX stripped]
const StrikeText = ({ text, fontSize, fontFamily, color, fontWeight, totalFrames }) => {
  const frame = useCurrentFrame();
  const parts = text.split("||");
  const wrongText = parts[0] || text;
  const correctText = parts[1] || "";
  const strikeWidth = interpolate(frame, [8, Math.floor(totalFrames * 0.4)], [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const correctOpacity = interpolate(frame,
    [Math.floor(totalFrames * 0.4), Math.floor(totalFrames * 0.6)], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blockOpacity = Math.min(
    interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3em", opacity: blockOpacity }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color, textShadow: BASE_SHADOW, textAlign: "center" }}>{wrongText}</div>
        <div style={{ position: "absolute", top: "50%", left: 0, height: 4, background: "#FF3300", width: strikeWidth + "%", transform: "translateY(-50%)" }} />
      </div>
      {correctText.length > 0 && (
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: "#00FF88", textShadow: BASE_SHADOW, textAlign: "center", opacity: correctOpacity }}>{correctText}</div>
      )}
    </div>
  );
};

// -- ELLIPSIS LOADER --
// [FIXED: showLoader condition broken; dot1 missing; return JSX stripped]
const EllipsisText = ({ text, fontSize, fontFamily, color, fontWeight, totalFrames }) => {
  const frame = useCurrentFrame();
  const LOADER_FRAMES = 40;
  const showLoader = frame < LOADER_FRAMES;
  const dot1 = Math.round(frame / 8) % 3 >= 0 ? 1 : 0.2;
  const dot2 = Math.round(frame / 8) % 3 >= 1 ? 1 : 0.2;
  const dot3 = Math.round(frame / 8) % 3 >= 2 ? 1 : 0.2;
  return (
    <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color, textAlign: "center", textShadow: BASE_SHADOW }}>
      {showLoader ? (
        <div style={{ display: "flex", gap: "0.3em", justifyContent: "center", alignItems: "center" }}>
          <span style={{ opacity: dot1 }}>•</span>
          <span style={{ opacity: dot2 }}>•</span>
          <span style={{ opacity: dot3 }}>•</span>
        </div>
      ) : (
        <div style={{ lineHeight: 1.2, whiteSpace: "pre-line" }}>
          {text}
        </div>
      )}
    </div>
  );
};

// -- GRADIENT TEXT (Phase 2) --
// [FIXED: return JSX stripped]
const GradientText = ({ text, fontSize, fontFamily, fontWeight, totalFrames, strokeStyle }) => {
  const frame = useCurrentFrame();
  const sweep = ((frame % 90) / 90) * 160 - 30;
  const opacity = Math.min(
    interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
  );
  return (
    <div style={{
      fontFamily, fontSize: `${fontSize}px`, fontWeight,
      textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
      background: `linear-gradient(${sweep + 90}deg, #FFD700 0%, #FFFFFF 40%, #FFD700 70%, #FF9900 100%)`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.95))",
      opacity,
      ...strokeStyle,
    }}>{text}</div>
  );
};

// -- PULSE RING BG (Phase 2) --
// [FIXED: return JSX stripped]
const PulseRingBG = ({ color }) => {
  const frame = useCurrentFrame();
  const cycleFrame = frame % 60;
  const scale = interpolate(cycleFrame, [0, 55], [0.2, 2.2], { extrapolateRight: "clamp" });
  const ringOpacity = interpolate(cycleFrame, [0, 10, 50, 55], [0, 0.5, 0.2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{
        width: `${200 * scale}px`,
        height: `${200 * scale}px`,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        opacity: ringOpacity,
        flexShrink: 0,
      }} />
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN EXPORT
// -----------------------------------------------------------------------------
export const TextOverlay = ({ overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalFrames = overlay.endFrame - overlay.startFrame;
  const rawText = overlay.text || "";

  const safeColor    = ensureVisibleColor(overlay.color);
  const posStyle     = POSITION_STYLES[overlay.position] || POSITION_STYLES.middle;
  const baseFontSize = overlay.fontSize || 68;
  const fontSize     = computeFontSize(baseFontSize, rawText);
  const fontFamily   = FONT_MAP[overlay.font] || "'Montserrat', sans-serif";
  const fontWeight   = overlay.font === "Montserrat" ? "800" : "bold";
  const fontStyle    = overlay.italic ? "italic" : "normal";
  const extraSpacing = overlay.letterSpacing || "normal";
  const useHeavyShadow = overlay.heavyShadow || overlay.font === "Anton" || overlay.font === "Archivo";

  // [FIXED: shadowBase was referenced but not declared]
  const shadowBase = buildTextGlow(safeColor);

  let opacity         = 1;
  let translateX      = 0;
  let translateY      = 0;
  let scale           = 1;
  let glitchRGBOffset = 0;
  let letterSpacing   = "normal";

  // -- FADE --
  if (overlay.animation === "fade") {
    opacity = interpolate(frame, [0, 8, totalFrames - 8, totalFrames], [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  }

  // -- POP --
  if (overlay.animation === "pop") {
    const s = spring({ fps, frame, config: { damping: 12, stiffness: 200 } });
    scale = interpolate(s, [0, 1], [0.5, 1]);
    opacity = Math.min(
      interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- SLIDE-LEFT --
  if (overlay.animation === "slide-left") {
    translateX = interpolate(frame, [0, 12], [-320, 0],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(
      interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- SLIDE-RIGHT --
  if (overlay.animation === "slide-right") {
    translateX = interpolate(frame, [0, 12], [320, 0],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(
      interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- SLIDE-UP --
  if (overlay.animation === "slide-up") {
    translateY = interpolate(frame, [0, 12], [80, 0],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(
      interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- SLIDE-DOWN --
  if (overlay.animation === "slide-down") {
    translateY = interpolate(frame, [0, 12], [-80, 0],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(
      interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- BOUNCE --
  if (overlay.animation === "bounce") {
    const s = spring({ fps, frame, config: { damping: 8, stiffness: 180, mass: 0.8 } });
    translateY = interpolate(s, [0, 1], [40, 0]);
    opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  }

  // -- ZOOM-PUNCH --
  if (overlay.animation === "zoom-punch") {
    const s = spring({ fps, frame, config: { damping: 7, stiffness: 280, mass: 0.6 } });
    scale = interpolate(s, [0, 1], [3.2, 1]);
    opacity = Math.min(
      interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- ZOOM-OUT --
  if (overlay.animation === "zoom-out") {
    scale = interpolate(frame, [0, 30], [1.8, 1],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    opacity = Math.min(
      interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- HEARTBEAT --
  if (overlay.animation === "heartbeat") {
    const beatFrame = frame % 45;
    scale = beatFrame < 8
      ? interpolate(beatFrame, [0, 4, 8], [1, 1.06, 1], { extrapolateRight: "clamp" })
      : 1;
  }

  // -- GLITCH --
  if (overlay.animation === "glitch") {
    const glitchCycle = frame % 18;
    glitchRGBOffset = glitchCycle < 3 ? interpolate(glitchCycle, [0, 3], [0, 1]) : 0;
    translateX = glitchCycle < 3 ? (Math.sin(frame * 13.7) * 6) : 0;
    opacity = Math.min(
      interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 6, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
  }

  // -- RGB SPLIT (glitch overlay effect) --
  const rgbSplit = glitchRGBOffset > 0.05
    ? Math.round(glitchRGBOffset * 6) + "px 0 rgba(255,0,60,0.85), " + (-Math.round(glitchRGBOffset * 6)) + "px 0 rgba(0,255,220,0.85), "
    : "";
  const computedTextShadow = rgbSplit + shadowBase;
  const strokeStyle = overlay.stroke
    ? { WebkitTextStroke: overlay.stroke.size + "px " + overlay.stroke.color, textShadow: computedTextShadow }
    : { textShadow: computedTextShadow };

  // -------------------------------------------------------------------------
  // COMPLEX RENDER BRANCHES
  // -------------------------------------------------------------------------

  // -- TYPEWRITER --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "typewriter") {
    const twOpacity = Math.min(
      interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: twOpacity, ...posStyle }}>
        <TypewriterText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} />
      </div>
    );
  }

  // -- WORD-HIGHLIGHT --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "word-highlight") {
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px", ...posStyle }}>
        <WordHighlightText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} totalFrames={totalFrames} />
      </div>
    );
  }

  // -- SCRAMBLE --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "scramble") {
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px", ...posStyle }}>
        <ScrambleText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} totalFrames={totalFrames} />
      </div>
    );
  }

  // -- STAGGER --
  // [FIXED: outer div style stripped; word div style stripped]
  if (overlay.animation === "stagger") {
    const words = rawText.split(" ");
    const DELAY = 4;
    const blockOpacity = Math.min(
      interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: blockOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.2em" }}>
          {words.map((word, i) => {
            const wf = frame - i * DELAY;
            const wo = interpolate(wf, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const wy = interpolate(wf, [0, 8], [18, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (
              <div key={i} style={{
                fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
                textShadow: useHeavyShadow ? HEAVY_SHADOW : BASE_SHADOW,
                transform: `translateY(${wy}px)`,
                opacity: wo,
                fontStyle,
                display: "inline-block",
              }}>{word}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // -- MULTI-LINE --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "multi-line") {
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px", ...posStyle }}>
        <MultiLineText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} totalFrames={totalFrames} />
      </div>
    );
  }

  // -- STRIKE --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "strike") {
    const blockOpacity = Math.min(
      interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: blockOpacity, ...posStyle }}>
        <StrikeText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} totalFrames={totalFrames} />
      </div>
    );
  }

  // -- ELLIPSIS --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "ellipsis") {
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px", ...posStyle }}>
        <EllipsisText text={rawText} fontSize={fontSize} fontFamily={fontFamily} color={safeColor} fontWeight={fontWeight} totalFrames={totalFrames} />
      </div>
    );
  }

  // -- COUNTER --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "counter") {
    const numMatch = rawText.match(/[\d,]+(\.\d+)?/);
    const targetRaw = numMatch ? numMatch[0].replace(/,/g, "") : "0";
    const target = parseFloat(targetRaw);
    const hasComma = numMatch && numMatch[0].includes(",");
    const progress = interpolate(frame, [0, Math.max(totalFrames - 20, 10)], [0, 1],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const current = Math.round(progress * target);
    const formatted = hasComma ? current.toLocaleString("en-US") : String(current);
    const displayText = numMatch ? rawText.replace(numMatch[0], formatted) : rawText;
    const cOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: cOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: useHeavyShadow ? HEAVY_SHADOW : BASE_SHADOW,
          textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle }}>{displayText}</div>
      </div>
    );
  }

  // -- NEON-GLOW --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "neon-glow") {
    const glowColor = overlay.glowColor || safeColor;
    const pulseIntensity = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.7, 1]);
    const nOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: nOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: glowColor,
          textShadow: buildTextGlow(glowColor),
          textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          filter: `brightness(${pulseIntensity})` }}>{rawText}</div>
      </div>
    );
  }

  // -- HIGHLIGHT-BOX --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "highlight-box") {
    const boxColor = overlay.boxColor || "#FFD700";
    const boxWidth = interpolate(frame, [0, 14], [0, 100],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const hOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: hOpacity, ...posStyle }}>
        <div style={{ position: "relative", display: "inline-block", textAlign: "center" }}>
          <div style={{ position: "absolute", inset: "-8px -16px", background: boxColor, width: boxWidth + "%", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, fontFamily, fontSize: `${fontSize}px`, fontWeight,
            color: "#000000", textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // -- GRADIENT-SWEEP --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "gradient-sweep") {
    const sweepPos = interpolate(frame, [0, totalFrames], [-200, 200],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: gOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight,
          background: `linear-gradient(${sweepPos + 90}deg, ${safeColor}, #FFFFFF, ${safeColor})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.9))" }}>{rawText}</div>
      </div>
    );
  }

  // -- OUTLINE --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "outline") {
    const oOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    const strokeColor = overlay.strokeColor || safeColor;
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: oOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight,
          color: "transparent", WebkitTextStroke: `3px ${strokeColor}`,
          textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.9))" }}>{rawText}</div>
      </div>
    );
  }

  // -- SHIMMER --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "shimmer") {
    const shimmerCycle = frame % 90;
    const shimmerPos = interpolate(shimmerCycle, [0, 60], [-50, 150],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: sOpacity, ...posStyle }}>
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
            textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle }}>{rawText}</div>
          <div style={{ position: "absolute", inset: 0,
            background: `linear-gradient(${shimmerPos + 90}deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontFamily, fontSize: `${fontSize}px`, fontWeight,
            textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line" }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // -- FROSTED --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "frosted") {
    const panelOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
    const fOpacity = Math.min(panelOpacity,
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" }));
    const translateYFrosted = interpolate(frame, [0, 12], [30, 0],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: fOpacity, ...posStyle }}>
        <div style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)", padding: "18px 28px",
          transform: `translateY(${translateYFrosted}px)`, borderRadius: "4px" }}>
          <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
            textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // -- COLOR-PULSE --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "color-pulse") {
    const t = (Math.sin(frame * 0.15) + 1) / 2;
    const pulseOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: pulseOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          filter: `hue-rotate(${t * 40}deg) brightness(${0.9 + t * 0.2})` }}>{rawText}</div>
      </div>
    );
  }

  // -- 3D-EXTRUDE --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "3d-extrude") {
    const rotateX = interpolate(frame, [0, 20], [-25, 0],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const e3dOpacity = Math.min(
      interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: e3dOpacity, perspective: "800px", ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: HEAVY_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          transform: `rotateX(${rotateX}deg)`, transformOrigin: "center bottom" }}>{rawText}</div>
      </div>
    );
  }

  // -- CAPTION-BAR --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "caption-bar") {
    const barColor = overlay.barColor || "#D4A017";
    const slideY = interpolate(frame, [0, 10], [60, 0],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const cBarOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: cBarOpacity, transform: `translateY(${slideY}px)`, ...posStyle }}>
        <div style={{ background: barColor, padding: "10px 20px", display: "inline-block" }}>
          <div style={{ fontFamily, fontSize: `${Math.round(fontSize * 0.85)}px`, fontWeight,
            color: "#000000", textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
            letterSpacing: "0.05em" }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // PHASE 2 NEW ANIMATIONS
  // ====================================================================

  // -- GRADIENT-TEXT (moving gold-to-white sweep) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "gradient-text") {
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px", ...posStyle }}>
        <GradientText text={rawText} fontSize={fontSize} fontFamily={fontFamily} fontWeight={fontWeight} totalFrames={totalFrames} strokeStyle={strokeStyle} />
      </div>
    );
  }

  // -- OUTLINED (hollow text -- stroke only) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "outlined") {
    const outOpacity = Math.min(
      interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: outOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight,
          color: "transparent", WebkitTextStroke: `3px ${safeColor}`,
          textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.9))" }}>{rawText}</div>
      </div>
    );
  }

  // -- MASK-REVEAL (circle expands to reveal text) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "mask-reveal") {
    const maskProgress = interpolate(frame, [0, 18], [0, 100],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const exitOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0],
      { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: exitOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          clipPath: `circle(${maskProgress}% at 50% 50%)` }}>{rawText}</div>
      </div>
    );
  }

  // -- PIXEL-DISSOLVE (pixelates out on exit) --
  // [FIXED: outer div wrapper was stripped]
  if (overlay.animation === "pixel-dissolve") {
    const DISSOLVE_START = totalFrames - 20;
    const entryOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
    const dissolveProgress = interpolate(frame, [DISSOLVE_START, totalFrames], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pixelSize = interpolate(dissolveProgress, [0, 0.5, 1], [0, 8, 32]);
    const exitOpacity = interpolate(dissolveProgress, [0.7, 1.0], [1, 0], { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: Math.min(entryOpacity, exitOpacity), ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
          filter: pixelSize > 0 ? `blur(${pixelSize * 0.3}px) contrast(${1 + dissolveProgress})` : "none",
          transform: `scale(${1 + dissolveProgress * 0.08})`,
        }}>{rawText}</div>
      </div>
    );
  }

  // -- VHS (tracking lines + position distortion) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "vhs") {
    const trackingY = ((frame * 3.5) % 200) - 20;
    const distort = Math.sin(frame * 0.4) * 3;
    const vhsOpacity = Math.min(
      interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: vhsOpacity, ...posStyle }}>
        <div style={{ position: "absolute", top: `${trackingY}%`, left: 0, right: 0, height: 2,
          background: "rgba(255,255,255,0.15)", pointerEvents: "none" }} />
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight,
          color: "rgba(255,80,80,0.55)", textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
          transform: `translateX(${distort}px)`, position: "absolute",
          top: 0, left: 60, right: 60, bottom: 0,
          display: "flex", alignItems: posStyle.alignItems || "center", justifyContent: posStyle.justifyContent || "center",
          pointerEvents: "none" }}>{rawText}</div>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
          transform: `translateX(${-distort * 0.5}px)` }}>{rawText}</div>
      </div>
    );
  }

  // -- STROBE (white flash bursts at fixed frames) --
  // [FIXED: for loop condition stripped; return JSX stripped]
  if (overlay.animation === "strobe") {
    const strobeFrames = overlay.strobeFrames || [0, 30, 60];
    const BURST_DURATION = 4;
    let strobeIntensity = 0;
    for (const sf of strobeFrames) {
      if (frame >= sf && frame < sf + BURST_DURATION) {
        strobeIntensity = interpolate(frame - sf, [0, BURST_DURATION], [1, 0], { extrapolateRight: "clamp" });
      }
    }
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px", ...posStyle }}>
        {strobeIntensity > 0 && (
          <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${strobeIntensity})`,
            pointerEvents: "none", zIndex: 10 }} />
        )}
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle }}>{rawText}</div>
      </div>
    );
  }

  // -- PULSE-RING (expanding ring behind text) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "pulse-ring") {
    const ringColor = overlay.ringColor || safeColor;
    const prOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: prOpacity, ...posStyle }}>
        <PulseRingBG color={ringColor} />
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
          fontStyle, position: "relative" }}>{rawText}</div>
      </div>
    );
  }

  // -- UNDERLINE-DRAW (SVG line draws under text) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "underline-draw") {
    const lineProgress = interpolate(frame, [8, 24], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const udOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: udOpacity, ...posStyle }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
            textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle }}>{rawText}</div>
          <svg style={{ position: "absolute", bottom: -8, left: 0, right: 0, width: "100%", height: 6, overflow: "visible" }}
            viewBox="0 0 100 6" preserveAspectRatio="none">
            <line x1="0" y1="3" x2={lineProgress * 100} y2="3"
              stroke={safeColor} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  // -- WEIGHT-SHIFT (font weight 300->900 on entry) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "weight-shift") {
    const weightProgress = interpolate(frame, [0, 16], [0, 1],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const weight = Math.round(interpolate(weightProgress, [0, 1], [300, 900]));
    const wsOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: wsOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight: weight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle }}>{rawText}</div>
      </div>
    );
  }

  // -- DIAGONAL-WIPE (diagonal clip-path entrance) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "diagonal-wipe") {
    const wipe = interpolate(frame, [0, 18], [0, 100],
      { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const exitOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0],
      { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: exitOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          clipPath: `polygon(0 0, ${wipe}% 0, ${Math.min(wipe + 30, 100)}% 100%, 0 100%)` }}>{rawText}</div>
      </div>
    );
  }

  // -- CAPS (force uppercase + wide letter spacing) --
  // [FIXED: return JSX was stripped]
  if (overlay.animation === "caps") {
    const capsSpacing = interpolate(frame, [0, 14], [0.6, 0.1], { extrapolateRight: "clamp" });
    const capsOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: capsOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: HEAVY_SHADOW, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", fontStyle,
          textTransform: "uppercase", letterSpacing: `${capsSpacing}em` }}>{rawText}</div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // PHASE 3 ANIMATIONS (TikTok research)
  // -------------------------------------------------------------------------

  // -- LIQUID-DRIP --
  if (overlay.animation === "liquid-drip") {
    const dripColor = overlay.glowColor || "#E8A920";
    const entryOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
    const exitOpacity  = interpolate(frame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    const dripProgress = interpolate(frame, [8, Math.floor(totalFrames * 0.5)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dripLength   = interpolate(dripProgress, [0, 1], [0, 280]);
    const glowIntensity = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.7, 1.0]);
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: Math.min(entryOpacity, exitOpacity), ...posStyle }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight,
            textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
            background: `linear-gradient(180deg, #FFFFFF 0%, ${dripColor} 60%, #FF4400 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: `drop-shadow(0 0 ${12 * glowIntensity}px ${dripColor}) drop-shadow(0 4px 20px rgba(0,0,0,0.9))`,
            fontStyle, letterSpacing: extraSpacing !== "normal" ? extraSpacing : "0.02em",
          }}>{rawText}</div>
          {rawText.replace(/\s/g, "").split("").map((_, i) => {
            const colCount = Math.min(rawText.replace(/\s/g, "").length, 10);
            if (i >= colCount) return null;
            const leftPct = 10 + (i / colCount) * 80;
            const delay  = i * 3;
            const localDrip = interpolate(frame - delay, [0, 40], [0, dripLength], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ position: "absolute", bottom: `-${localDrip}px`,
                left: `${leftPct}%`, transform: "translateX(-50%)",
                width: "4px", height: `${localDrip}px`,
                background: `linear-gradient(180deg, ${dripColor} 0%, rgba(255,68,0,0.6) 60%, transparent 100%)`,
                borderRadius: "0 0 4px 4px", boxShadow: `0 0 8px ${dripColor}80`, pointerEvents: "none" }} />
            );
          })}
        </div>
      </div>
    );
  }

  // -- TEXT-CLIP --
  if (overlay.animation === "text-clip") {
    const clipColor1 = overlay.clipColor1 || "#E8A920";
    const clipColor2 = overlay.clipColor2 || "#FF6B35";
    const clipColor3 = overlay.clipColor3 || "#00D68F";
    const tcOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    const sweepX = interpolate(frame, [0, totalFrames], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 30px",
        opacity: tcOpacity, ...posStyle }}>
        <div style={{ position: "relative", fontFamily, fontSize: `${Math.round(fontSize * 1.1)}px`, fontWeight,
          textAlign: "center", lineHeight: 1.1, whiteSpace: "pre-line",
          WebkitTextStroke: "2px rgba(255,255,255,0.3)", WebkitTextFillColor: "transparent",
          letterSpacing: "0.05em", filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.8))", fontStyle }}>{rawText}</div>
        <div style={{ position: "absolute", inset: 0, display: "flex",
          alignItems: posStyle.alignItems || "center", justifyContent: posStyle.justifyContent || "center", padding: "0 30px" }}>
          <div style={{ fontFamily, fontSize: `${Math.round(fontSize * 1.1)}px`, fontWeight,
            textAlign: "center", lineHeight: 1.1, whiteSpace: "pre-line", letterSpacing: "0.05em",
            background: `linear-gradient(${sweepX + 90}deg, ${clipColor1} 0%, ${clipColor2} 35%, ${clipColor3} 65%, ${clipColor1} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: `drop-shadow(0 0 16px ${clipColor1}80) drop-shadow(0 4px 24px rgba(0,0,0,0.95))`, fontStyle }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // -- OUTLINE-STROKE --
  if (overlay.animation === "outline-stroke") {
    const strokeColor = overlay.strokeColor || "#FFFFFF";
    const strokeWidth = overlay.strokeWidth || 4;
    const fillColor   = overlay.fillColor   || "transparent";
    const osOpacity = Math.min(
      interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    const entryScale = interpolate(frame, [0, 12], [0.85, 1.0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 20px",
        opacity: osOpacity, transform: `scale(${entryScale})`, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${Math.round(fontSize * 1.15)}px`, fontWeight: "900",
          textAlign: "center", lineHeight: 1.05, whiteSpace: "pre-line",
          WebkitTextStroke: `${strokeWidth}px ${strokeColor}`, WebkitTextFillColor: fillColor, color: fillColor,
          letterSpacing: "0.04em", fontStyle: overlay.italic ? "italic" : "normal",
          filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.95)) drop-shadow(0 0 2px rgba(0,0,0,1))",
          textTransform: overlay.uppercase ? "uppercase" : "none" }}>{rawText}</div>
      </div>
    );
  }

  // -- SPLIT-REVEAL --
  if (overlay.animation === "split-reveal") {
    const words = rawText.split(" ");
    const srOpacity = Math.min(
      interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: srOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0.2em" }}>
          {words.map((word, i) => {
            const wordDelay = i * 5;
            const progress  = interpolate(frame - wordDelay, [0, 14], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.5)),
            });
            const direction  = i % 2 === 0 ? -1 : 1;
            const wTranslateX = interpolate(progress, [0, 1], [direction * 120, 0]);
            const wordOpacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
                textShadow: useHeavyShadow ? HEAVY_SHADOW : BASE_SHADOW,
                transform: `translateX(${wTranslateX}px)`, opacity: wordOpacity, fontStyle }}>{word}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // -- BLUR-IN --
  if (overlay.animation === "blur-in") {
    const blurAmount = interpolate(frame, [0, 18], [20, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const biOpacity = Math.min(
      interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    const biScale = interpolate(frame, [0, 18], [1.06, 1.0], { extrapolateRight: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: biOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
          textShadow: useHeavyShadow ? HEAVY_SHADOW : BASE_SHADOW,
          textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
          filter: `blur(${blurAmount}px)`, transform: `scale(${biScale})`, fontStyle,
          letterSpacing: extraSpacing !== "normal" ? extraSpacing : "normal" }}>{rawText}</div>
      </div>
    );
  }

  // -- FLIP-UP --
  if (overlay.animation === "flip-up") {
    const words = rawText.split(" ");
    const fuOpacity = Math.min(
      interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: fuOpacity, perspective: "800px", ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0.25em", perspective: "800px" }}>
          {words.map((word, i) => {
            const delay = i * 6;
            const rotateX = interpolate(frame - delay, [0, 16], [-90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            const wOpacity = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
                textShadow: useHeavyShadow ? HEAVY_SHADOW : BASE_SHADOW,
                transform: `rotateX(${rotateX}deg)`, transformOrigin: "center bottom",
                opacity: wOpacity, display: "inline-block", fontStyle }}>{word}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // -- LETTER-DROP --
  if (overlay.animation === "letter-drop") {
    const chars = rawText.split("");
    const ldOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 40px",
        opacity: ldOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
          {chars.map((ch, i) => {
            const FRAMES_PER_CHAR = 3;
            const dropFrame = frame - i * FRAMES_PER_CHAR;
            const ldTranslateY = interpolate(dropFrame, [0, 12], [-120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.bounce) });
            const charOpacity = interpolate(dropFrame, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (ch === "\n") return <div key={i} style={{ width: "100%", height: 0 }} />;
            if (ch === " ") return <div key={i} style={{ width: "0.3em" }} />;
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
                textShadow: useHeavyShadow ? HEAVY_SHADOW : BASE_SHADOW,
                transform: `translateY(${ldTranslateY}px)`, opacity: charOpacity, display: "inline-block", fontStyle }}>{ch}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // -- PANEL-SPLIT --
  if (overlay.animation === "panel-split") {
    const panelColor = overlay.boxColor || "rgba(0,0,0,0.82)";
    const panelWidth = interpolate(frame, [0, 14], [0, 100], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const textShift  = interpolate(frame, [6, 22], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const textOpacity = interpolate(frame, [8, 20], [0, 1], { extrapolateRight: "clamp" });
    const psExit = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 40px",
        opacity: psExit, ...posStyle }}>
        <div style={{ position: "relative", alignSelf: "stretch", padding: "18px 32px" }}>
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${panelWidth}%`,
            background: panelColor, borderRight: `3px solid ${overlay.accentColor || "#E8A920"}`,
            boxShadow: `4px 0 20px ${overlay.accentColor || "#E8A920"}40`, zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
            textShadow: BASE_SHADOW, textAlign: "center", lineHeight: 1.25, whiteSpace: "pre-line",
            transform: `translateX(${textShift}px)`, opacity: textOpacity, fontStyle }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // -- KINETIC --
  if (overlay.animation === "kinetic") {
    const words = rawText.split(" ");
    const sizePattern = [1.4, 0.8, 1.15, 0.75, 1.3, 0.9, 1.2];
    const colorPattern = [safeColor, overlay.accentColor || "#E8A920", safeColor, "#FFFFFF", safeColor];
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 40px", ...posStyle }}>
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
              <div key={i} style={{ fontFamily, fontSize: `${wordSize}px`, fontWeight: isLarge ? "900" : "700",
                color: wordColor, textShadow: HEAVY_SHADOW, transform: `scale(${s})`,
                opacity: Math.min(wOpacity, exitOp), display: "inline-block", fontStyle,
                lineHeight: 1.0, textTransform: isLarge ? "uppercase" : "none" }}>{word}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // -- WORD-BOUNCE --
  if (overlay.animation === "word-bounce") {
    const words = rawText.split(" ");
    const wbOpacity = interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 50px",
        opacity: wbOpacity, ...posStyle }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0.2em" }}>
          {words.map((word, i) => {
            const delay = i * 3;
            const bounceVal = spring({ fps, frame: frame - delay, config: { damping: 6, stiffness: 260, mass: 0.7 } });
            const wScale = interpolate(bounceVal, [0, 1], [0, 1]);
            const wOpacity = interpolate(frame - delay, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
                textShadow: useHeavyShadow ? HEAVY_SHADOW : BASE_SHADOW,
                transform: `scale(${wScale})`, opacity: wOpacity, display: "inline-block",
                fontStyle, transformOrigin: "center bottom" }}>{word}</div>
            );
          })}
        </div>
      </div>
    );
  }

  // -- GRADIENT-SHIFT --
  if (overlay.animation === "gradient-shift") {
    const gsOpacity = Math.min(
      interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    const hue1 = overlay.hue1 || 45;
    const hue2 = overlay.hue2 || 200;
    const cycle = (frame / totalFrames) * 360;
    const gradAngle = interpolate(frame, [0, totalFrames], [0, 360], { extrapolateRight: "clamp" });
    const c1 = `hsl(${(hue1 + cycle * 0.5) % 360}, 100%, 70%)`;
    const c2 = `hsl(${(hue2 + cycle * 0.3) % 360}, 80%, 60%)`;
    const c3 = `hsl(${(hue1 + 180 + cycle * 0.4) % 360}, 90%, 80%)`;
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: gsOpacity, ...posStyle }}>
        <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight,
          textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
          background: `linear-gradient(${gradAngle}deg, ${c1}, ${c2}, ${c3})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.95)) drop-shadow(0 0 24px rgba(0,0,0,0.8))",
          fontStyle, letterSpacing: extraSpacing !== "normal" ? extraSpacing : "normal" }}>{rawText}</div>
      </div>
    );
  }

  // -- OUTLINE-FILL (starts hollow, color floods in left→right) --
  if (overlay.animation === "outline-fill") {
    const fillColor   = overlay.fillColor   || safeColor;
    const strokeColor = overlay.strokeColor || safeColor;
    const fillProgress = interpolate(frame, [4, Math.floor(totalFrames * 0.55)], [0, 100], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
    });
    const ofOpacity = Math.min(
      interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: ofOpacity, ...posStyle }}>
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ fontFamily, fontSize: `${fontSize}px`, fontWeight,
            textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
            WebkitTextStroke: `3px ${strokeColor}`, WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.95))", fontStyle }}>{rawText}</div>
          <div style={{ position: "absolute", inset: 0,
            clipPath: `inset(0 ${100 - fillProgress}% 0 0)`,
            fontFamily, fontSize: `${fontSize}px`, fontWeight,
            textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line",
            color: fillColor, textShadow: BASE_SHADOW, fontStyle }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // -- COLOR-BURN --
  if (overlay.animation === "color-burn") {
    const burnColor  = overlay.burnColor  || "#E8A920";
    const cbProgress = interpolate(frame, [0, Math.floor(totalFrames * 0.5)], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
    });
    const cbOpacity = Math.min(
      interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(frame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: "clamp" })
    );
    const colorOverlayOpacity = interpolate(cbProgress, [0, 0.6, 1.0], [0.95, 0.4, 0.0]);
    const textOpacity          = interpolate(cbProgress, [0, 0.3, 1.0], [0.0, 0.7, 1.0]);
    const glowSize             = interpolate(cbProgress, [0, 1], [0, 32]);
    return (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", padding: "0 60px",
        opacity: cbOpacity, ...posStyle }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: "-20px",
            background: `radial-gradient(ellipse at center, ${burnColor} 0%, transparent 70%)`,
            opacity: colorOverlayOpacity, borderRadius: "8px",
            filter: `blur(${interpolate(cbProgress, [0, 1], [20, 0])}px)` }} />
          <div style={{ position: "relative", fontFamily, fontSize: `${fontSize}px`, fontWeight, color: safeColor,
            textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line", opacity: textOpacity,
            filter: `drop-shadow(0 0 ${glowSize}px ${burnColor}) drop-shadow(0 4px 16px rgba(0,0,0,0.9))`,
            fontStyle }}>{rawText}</div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STANDARD RENDER -- all simple transform animations (fade, pop, slide-*, etc.)
  // [FIXED: return JSX was stripped]
  // -------------------------------------------------------------------------
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", flexDirection: "column", padding: "0 60px",
      opacity, transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      ...posStyle }}>
      <div style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        fontWeight,
        color: safeColor,
        ...strokeStyle,
        textAlign: "center",
        lineHeight: 1.25,
        whiteSpace: "pre-line",
        fontStyle,
        letterSpacing: extraSpacing !== "normal" ? extraSpacing : "0.01em",
        wordSpacing: "0.05em",
      }}>{rawText}</div>
    </div>
  );
};
