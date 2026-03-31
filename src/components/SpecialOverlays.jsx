  // -----------------------------------------------------------------------------
// src/components/SpecialOverlays.jsx -- DWB Composition Layouts v1.0
//
// Components:
//             -- 3-2-1 spring countdown before hook
//     -- 3-stat mini grid (Day 30 reveal)
//           -- pill card floats in with data point
//           -- vertical split reveal left/right
//           -- TikTok-style notification popup
//     -- animated bar chart comparison
//             -- code terminal overlay
//                 -- broadcast lower third nameplate
//                -- scene progress indicator
//            -- documentary corner timestamp
//
// All components accept: startFrame, endFrame, and component-specific props
// Use via overlay.animation field or wire directly in VideoComposition
// -----------------------------------------------------------------------------

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// -----------------------------------------------------------------------------
// COUNTDOWN INTRO -- 3-2-1 before hook
// Proven retention: builds tension, primes viewer for impact
// -----------------------------------------------------------------------------
export const CountdownIntro = ({ accentColor = '#FFD700', onComplete }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each number gets 15 frames
  const STEP = 15;
  const TOTAL = STEP * 3; // 45 frames total
  if (frame >= TOTAL) return null;

  const currentNum = 3 - Math.floor(frame / STEP);
  const localFrame = frame % STEP;

  const s = spring({ fps, frame: localFrame, config: { damping: 8, stiffness: 300, mass: 0.7 } });
  const scale = interpolate(s, [0, 1], [2.2, 1]);
  const opacity = interpolate(localFrame, [STEP - 5, STEP], [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (


        {currentNum}


  );
};

// -----------------------------------------------------------------------------
// STATS DASHBOARD -- 3-stat mini grid overlay
// Perfect for milestone days (Day 30, 40, 60, 90)
//
// stats = [
//   { label: 'TikTok Followers', value: 15, suffix: '' },
//   { label: 'Top Video Views', value: 322, suffix: '' },
//   { label: 'Income', value: 0, prefix: '$' },
// ]
// -----------------------------------------------------------------------------
export const StatsDashboard = ({
  stats = [],
  accentColor = '#FFD700',
  startFrame = 90,
  endFrame = 450,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > endFrame + 10) return null;

  const slideY = interpolate(localFrame, [0, 14], [60, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const opacity = Math.min(
    interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (


        {stats.map((stat, i) => {
          const statDelay = i * 8;
          const statLocalFrame = localFrame - statDelay;
          const progress = interpolate(statLocalFrame, [0, Math.max(totalFrames - 40, 20)], [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const current = Math.round(progress * (stat.value || 0));

          return (


                {stat.prefix || ''}{current.toLocaleString()}{stat.suffix || ''}


                {stat.label}


          );
        })}


  );
};

// -----------------------------------------------------------------------------
// FLOATING INFO CARD -- pill card floats in with supporting data
// -----------------------------------------------------------------------------
export const FloatingInfoCard = ({
  icon = '📊',
  text = '',
  accentColor = '#FFD700',
  side = 'left',        // 'left' | 'right'
  yPosition = '35%',
  startFrame = 0,
  endFrame = 90,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > endFrame + 10) return null;

  const fromX = side === 'left' ? -260 : 260;
  const translateX = interpolate(localFrame, [0, 14], [fromX, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const opacity = Math.min(
    interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (


        {icon}
        {text}


  );
};

// -----------------------------------------------------------------------------
// BEFORE / AFTER SPLIT REVEAL
// Vertical divider sweeps across -- perfect for myth-busting content
//
// leftText  = "BEFORE" or wrong state
// rightText = "AFTER" or correct state
// -----------------------------------------------------------------------------
export const BeforeAfterSplit = ({
  leftLabel  = 'BEFORE',
  rightLabel = 'AFTER',
  leftText   = '',
  rightText  = '',
  startFrame = 0,
  endFrame   = 150,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > endFrame + 10) return null;

  // Divider sweeps from center to full split
  const dividerProgress = interpolate(localFrame, [0, 20], [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const leftOpacity = Math.min(
    interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );
  const rightOpacity = Math.min(
    interpolate(localFrame, [8, 22], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (

      {/* Left panel -- BEFORE (red tint) */}

        {leftLabel}
        {leftText && (
          {leftText}
        )}


      {/* Right panel -- AFTER (green tint) */}

        {rightLabel}
        {rightText && (
          {rightText}
        )}


      {/* Center divider line */}


  );
};

// -----------------------------------------------------------------------------
// SOCIAL PROOF POPUP -- TikTok-style notification
// Shows follower count jump, milestone, or comment
// -----------------------------------------------------------------------------
export const SocialProofPopup = ({
  platform = 'tiktok',   // 'tiktok' | 'youtube'
  text = '+1 Follower',
  startFrame = 0,
  endFrame = 75,
  yPosition = '25%',
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > endFrame + 10) return null;

  const translateY = interpolate(localFrame, [0, 12], [40, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const opacity = Math.min(
    interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  const platformColor = platform === 'tiktok' ? '#FF0050' : '#FF0000';
  const platformIcon  = platform === 'tiktok' ? '♪' : '▶';

  return (



          {platformIcon}

        {text}


  );
};

// -----------------------------------------------------------------------------
// DATA BAR CHART -- animated bar chart, bars grow from 0
//
// bars = [
//   { label: 'TikTok', value: 70, color: '#FF0050' },
//   { label: 'YouTube', value: 100, color: '#FF0000' },
// ]
// -----------------------------------------------------------------------------
export const DataBarChart = ({
  bars = [],
  title = '',
  startFrame = 0,
  endFrame = 150,
  maxValue,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > endFrame + 10) return null;

  const max = maxValue || Math.max(...bars.map(b => b.value), 1);
  const opacity = Math.min(
    interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (


        {title && (
          {title}
        )}

          {bars.map((bar, i) => {
            const barDelay = i * 6;
            const barProgress = interpolate(localFrame - barDelay,
              [0, Math.max(totalFrames - 30, 20)], [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            const barHeight = (bar.value / max) * 100 * barProgress;

            return (


                  {Math.round(bar.value * barProgress)}




                {bar.label}

            );
          })}



  );
};

// -----------------------------------------------------------------------------
// TERMINAL WINDOW -- code editor overlay
// Perfect for tutorial/tool reveal days
// -----------------------------------------------------------------------------
export const TerminalWindow = ({
  lines = [],
  title = 'terminal',
  startFrame = 0,
  endFrame = 180,
  accentColor = '#00FF88',
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > endFrame + 10) return null;

  const CHARS_PER_FRAME = 2;
  const allText = lines.join('\n');
  const charsToShow = Math.min(
    Math.floor(localFrame * CHARS_PER_FRAME),
    allText.length
  );
  const visibleText = allText.slice(0, charsToShow);
  const showCursor = charsToShow

        {/* Title bar */}

          {['#FF5F56', '#FFBD2E', '#27C93F'].map((c, i) => (

          ))}
          {title}

        {/* Content */}

          $
          {visibleText}
          {showCursor && █}



  );
};

// -----------------------------------------------------------------------------
// LOWER THIRD -- broadcast news nameplate
// -----------------------------------------------------------------------------
export const LowerThird = ({
  handle = '@DailyWealthBuilding',
  label = 'Affiliate Marketing Journey',
  accentColor = '#FFD700',
  startFrame = 10,
  endFrame = 120,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > endFrame + 10) return null;

  const slideX = interpolate(localFrame, [0, 14], [-400, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const opacity = Math.min(
    interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (


        {/* Accent bar */}

        {/* Text block */}

          {handle}
          {label}



  );
};

// -----------------------------------------------------------------------------
// SCENE NUMBER -- 01/07 documentary indicator
// -----------------------------------------------------------------------------
export const SceneNumber = ({
  current = 1,
  total = 7,
  startFrame = 0,
  endFrame = 900,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > endFrame) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 0.7],
    { extrapolateRight: 'clamp' });

  const pad = (n) => String(n).padStart(2, '0');

  return (


        {pad(current)}/{pad(total)}


  );
};

// -----------------------------------------------------------------------------
// CORNER TIMESTAMP -- documentary authenticity
// -----------------------------------------------------------------------------
export const CornerTimestamp = ({
  startFrame = 0,
  endFrame = 900,
  label = '',  // e.g. "DAY 30/90"
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > endFrame) return null;

  const opacity = interpolate(localFrame, [0, 20], [0, 0.6],
    { extrapolateRight: 'clamp' });
  const secs = Math.floor(localFrame / 30);
  const frac = String(localFrame % 30).padStart(2, '0');
  const timeStr = label || `00:${String(secs).padStart(2, '0')}:${frac}`;

  return (


        {timeStr}


  );
};
