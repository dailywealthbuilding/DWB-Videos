// =============================================================================
// DWB v8 ANIMATION REFERENCE — New Overlay Examples
// Drop these into week8-content.js and beyond
// =============================================================================

// ──────────────────────────────────────────────────────────────────────────────
// 1. ELEGANT-RISE
// Clean editorial body text. Default for truth/proof/system overlays.
// No stroke. Soft shadow. Gentle lift.
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "Most people budget wrong.\nHere's the math that works.",
  font: "Cormorant",          // Editorial serif
  color: "#FFFFFF",
  animation: "elegant-rise",
  startFrame: 90,
  endFrame: 270,
  position: "middle",
  fontSize: 68,
  // NO stroke — that's the point
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. SCRIPT-PAIR
// Large flowing script + small clean body. Like the refs Images 4-11.
// overlay.scriptText = the big script word
// overlay.text       = the small body below (optional)
// ──────────────────────────────────────────────────────────────────────────────
{
  scriptText: "Wealthy",         // Big Great Vibes script ~100px
  text: "is a decision you make daily",  // Small Cormorant below
  scriptFont: "GreatVibes",
  scriptColor: "#CAFF00",        // Accent on the script word ONLY
  bodyColor: "#FFFFFF",
  font: "Cormorant",
  animation: "script-pair",
  startFrame: 270,
  endFrame: 450,
  position: "middle",
  fontSize: 34,                  // body size
  scriptFontSize: 108,           // script size
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. PILL-CARD
// Dark frosted pill sits behind text. Ref Image 2.
// overlay.boldWord = ONE word to render in bold
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "The Secret of staying consistent (even when you want to quit)",
  boldWord: "Secret",           // This word renders bold inside the pill
  font: "Montserrat",
  color: "#FFFFFF",
  animation: "pill-card",
  startFrame: 0,
  endFrame: 90,
  position: "middle",
  fontSize: 56,
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. MIXED-WEIGHT
// Line 1: heavy caps sans. Line 2: flowing script. Ref Image 14.
// Split your text with \n
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "HOW TO BUILD\nWealth From Zero",     // Line 1 = heavy, Line 2 = script
  heavyFont: "Anton",
  scriptFont: "GreatVibes",
  heavyFontSize: 74,
  scriptFontSize: 96,
  color: "#FFFFFF",
  accentColor: "#CAFF00",       // Script line gets the accent color
  animation: "mixed-weight",
  startFrame: 0,
  endFrame: 90,
  position: "middle",
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. EDITORIAL-BODY
// Left-weighted, line-by-line stagger. Refs 15 & 16.
// First line gets accent color automatically.
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "The 3-step system:\nTrack every rand\nCut the bottom 3\nInvest the rest",
  font: "Cormorant",
  color: "#FFFFFF",
  accentColor: "#CAFF00",      // Line 1 gets this color
  animation: "editorial-body",
  startFrame: 450,
  endFrame: 720,
  position: "middle",
  fontSize: 52,
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. LETTER-BREATHE
// Letter spacing expands on entry. Airy and premium.
// Best for one-word hooks or short 2-word statements.
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "WEALTH",
  font: "Cormorant",
  color: "#CAFF00",
  animation: "letter-breathe",
  startFrame: 0,
  endFrame: 90,
  position: "middle",
  fontSize: 110,
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. FADE-WORD
// Words appear one by one, gently. No bounce. Elegant pacing.
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "Your savings account is quietly stealing from you",
  font: "Playfair",
  color: "#FFFFFF",
  animation: "fade-word",
  startFrame: 90,
  endFrame: 270,
  position: "middle",
  fontSize: 66,
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. ACCENT-REVEAL
// White text. Then ONE word pops in #CAFF00 with soft glow.
// overlay.accentWord = exact word to highlight (case-insensitive match)
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "The wealthy invest FIRST then live on what's left",
  font: "Anton",
  color: "#FFFFFF",
  accentWord: "FIRST",         // This word goes #CAFF00
  accentColor: "#CAFF00",
  animation: "accent-reveal",
  startFrame: 0,
  endFrame: 90,
  position: "middle",
  fontSize: 80,
  letterSpacing: "0.02em",
  // NO stroke needed — the glow does the work
}

// ──────────────────────────────────────────────────────────────────────────────
// 9. CINEMATIC-TITLE
// Clean light-weight title + thin underline draws beneath it.
// For premium, editorial look.
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "DAY 52 OF 90",
  font: "Cormorant",
  color: "#FFFFFF",
  accentColor: "#CAFF00",      // Underline color
  animation: "cinematic-title",
  startFrame: 0,
  endFrame: 90,
  position: "top-center",
  fontSize: 56,
}

// ──────────────────────────────────────────────────────────────────────────────
// 10. GHOST-REPEAT
// "FOCUS × 5" stacked at decreasing opacity. From vault notes.
// overlay.repeatCount = how many ghost rows (default 5)
// ──────────────────────────────────────────────────────────────────────────────
{
  text: "CONSISTENCY",
  font: "Anton",
  color: "#FFFFFF",
  animation: "ghost-repeat",
  startFrame: 450,
  endFrame: 720,
  position: "middle",
  fontSize: 76,
  repeatCount: 5,
}

// =============================================================================
// FONT QUICK REFERENCE
// =============================================================================
// GreatVibes      → Flowing luxury script (Sloop Script style)
// Italianno       → Ultra-thin romantic script
// DancingScript   → Casual handwrite
// Cormorant       → Editorial serif (Bethany Elingston style)
// Playfair        → Classic editorial serif
// Anton           → Impact heavy (hooks, CTAs)
// Bebas           → Condensed caps
// Montserrat      → Clean body copy
// Barlow          → Modern condensed
// Grotesk         → Tech-forward body

// =============================================================================
// STROKE RULES v8
// =============================================================================
// Body text (truth/proof/system): NO stroke. Soft shadow handles it.
// Hook/CTA only: stroke size 2, color "#000000" — only if text is thin font
// Script fonts: NEVER stroke. The shadow IS the legibility.

// =============================================================================
// COLOR RULES v8
// =============================================================================
// #CAFF00 = ONE accent word or ONE overlay. Never more.
// White = primary text
// #FFD700 = secondary accent (warm gold for proof/data)
// Never 5 colors in one video. 2 max.
