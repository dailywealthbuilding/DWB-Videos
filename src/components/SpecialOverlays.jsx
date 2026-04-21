// src/components/SpecialOverlays.jsx -- DWB v10.0
// FILE PATH: src/components/SpecialOverlays.jsx
//
// v10 CHANGES:
//   1. Watermark opacity reduced to 0.60 (was 0.75) -- less intrusive on light clips
//   2. DAY badge has softer border -- fits aesthetic aesthetic better
//   3. Progress bar kept -- works great as a content rhythm signal
//   4. All sub-exports unchanged (StatsDashboard, FloatingInfoCard, etc.)

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

// =============================================================================
// MAIN EXPORT -- watermark + DAY badge + progress bar
// =============================================================================
export const SpecialOverlays = ({ videoId = 'day37', totalFrames = 900 }) => {
  const frame = useCurrentFrame();

  const dayNum = parseInt((videoId || 'day0').replace('day', '')) || 0;

  // Fade in on entry
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Progress bar 0 -> 100% over video duration
  const progressW = interpolate(frame, [0, totalFrames], [0, 100], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 50 }}>

      {/* TOP LEFT: @DailyWealthBuilding watermark */}
      {/* v10: opacity reduced to 0.60 -- softer on light aesthetic clips */}
      <div style={{
        position:   'absolute',
        top:        '4%',
        left:       '4%',
        opacity:    opacity * 0.60,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize:   '20px',
        fontWeight: '700',
        color:      '#FFFFFF',
        letterSpacing: '0.04em',
        textShadow: '0 1px 10px rgba(0,0,0,0.95), 0 2px 24px rgba(0,0,0,0.7)',
      }}>
        @DailyWealthBuilding
      </div>

      {/* TOP RIGHT: DAY XX/90 badge */}
      {/* v10: softer border color -- rgba(202,255,0,0.35) vs old 0.4 */}
      <div style={{
        position:   'absolute',
        top:        '3.8%',
        right:      '3.5%',
        opacity:    opacity,
        display:    'flex',
        alignItems: 'center',
        gap:        '0px',
        background: 'rgba(0,0,0,0.72)',
        border:     '1px solid rgba(202,255,0,0.35)',
        padding:    '4px 10px',
      }}>
        <span style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      '20px',
          fontWeight:    '900',
          color:         '#CAFF00',
          letterSpacing: '0.06em',
        }}>
          DAY {dayNum}
        </span>
        <span style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      '14px',
          fontWeight:    '400',
          color:         'rgba(202,255,0,0.50)',
          letterSpacing: '0.04em',
          marginLeft:    '2px',
        }}>
          /90
        </span>
      </div>

      {/* BOTTOM: Progress bar */}
      <div style={{
        position:   'absolute',
        bottom:     0,
        left:       0,
        right:      0,
        height:     '3px',
        background: 'rgba(255,255,255,0.06)',
      }}>
        <div style={{
          height:     '100%',
          width:      progressW + '%',
          background: 'linear-gradient(to right, #CAFF00, #FFD700)',
          boxShadow:  '0 0 8px rgba(202,255,0,0.55)',
          transition: 'width 0.016s linear',
        }} />
      </div>

    </AbsoluteFill>
  );
};

// =============================================================================
// STATS DASHBOARD -- 3-stat mini grid (for milestone days)
// =============================================================================
export const StatsDashboard = ({
  stats       = [],
  accentColor = '#FFD700',
  startFrame  = 90,
  endFrame    = 450,
}) => {
  const frame      = useCurrentFrame();
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > totalFrames + 10) return null;

  const slideY = interpolate(localFrame, [0, 14], [60, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = Math.min(
    interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      top:             'auto',
      bottom:          '22%',
    }}>
      <div style={{
        transform: `translateY(${slideY}px)`,
        opacity,
        display:   'flex',
        gap:       '12px',
        padding:   '0 24px',
      }}>
        {stats.map((stat, i) => {
          const statDelay      = i * 8;
          const statLocalFrame = localFrame - statDelay;
          const progress       = interpolate(
            statLocalFrame,
            [0, Math.max(totalFrames - 40, 20)],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          );
          const current = Math.round(progress * (stat.value || 0));

          return (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.82)',
              border:     `1px solid ${accentColor}44`,
              padding:    '14px 18px',
              textAlign:  'center',
              minWidth:   '120px',
            }}>
              <div style={{
                fontFamily: "'Anton', sans-serif",
                fontSize:   '36px',
                color:      accentColor,
                lineHeight: 1,
              }}>
                {stat.prefix || ''}{current.toLocaleString()}{stat.suffix || ''}
              </div>
              <div style={{
                fontFamily:    "'Montserrat', sans-serif",
                fontSize:      '14px',
                color:         'rgba(255,255,255,0.55)',
                marginTop:     '4px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// FLOATING INFO CARD -- slides in from side
// =============================================================================
export const FloatingInfoCard = ({
  icon        = '',
  text        = '',
  accentColor = '#FFD700',
  side        = 'left',
  yPosition   = '35%',
  startFrame  = 0,
  endFrame    = 90,
}) => {
  const frame       = useCurrentFrame();
  const localFrame  = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > totalFrames + 10) return null;

  const fromX       = side === 'left' ? -260 : 260;
  const translateX  = interpolate(localFrame, [0, 14], [fromX, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = Math.min(
    interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 8, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill>
      <div style={{
        position:    'absolute',
        top:         yPosition,
        [side]:      '5%',
        transform:   `translateX(${translateX}px)`,
        opacity,
        background:  'rgba(0,0,0,0.84)',
        border:      `1px solid ${accentColor}55`,
        borderLeft:  `3px solid ${accentColor}`,
        padding:     '10px 16px',
        display:     'flex',
        alignItems:  'center',
        gap:         '10px',
        maxWidth:    '260px',
      }}>
        {icon && (
          <span style={{ fontSize: '24px' }}>{icon}</span>
        )}
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize:   '18px',
          color:      '#FFFFFF',
          lineHeight: 1.4,
        }}>
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// LOWER THIRD -- channel name + label sliding in
// =============================================================================
export const LowerThird = ({
  handle      = '@DailyWealthBuilding',
  label       = 'AFFILIATE MARKETING JOURNEY',
  accentColor = '#CAFF00',
  startFrame  = 0,
  endFrame    = 120,
}) => {
  const frame       = useCurrentFrame();
  const localFrame  = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  if (localFrame < 0 || localFrame > totalFrames + 10) return null;

  const slideX = interpolate(localFrame, [0, 14], [-400, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = Math.min(
    interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(localFrame, [totalFrames - 10, totalFrames], [1, 0], { extrapolateLeft: 'clamp' })
  );

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'flex-start', padding: '0 0 18% 5%' }}>
      <div style={{ transform: `translateX(${slideX}px)`, opacity }}>
        <div style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: '12px' }}>
          <div style={{
            fontFamily:    "'Anton', sans-serif",
            fontSize:      '30px',
            color:         '#FFFFFF',
            letterSpacing: '0.04em',
            textShadow:    '0 2px 8px rgba(0,0,0,0.9)',
          }}>
            {handle}
          </div>
          <div style={{
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      '14px',
            color:         accentColor,
            letterSpacing: '0.12em',
            marginTop:     '2px',
          }}>
            {label}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// SCENE NUMBER -- 01/07 documentary style
// =============================================================================
export const SceneNumber = ({
  current    = 1,
  total      = 7,
  startFrame = 0,
  endFrame   = 900,
}) => {
  const frame      = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > endFrame) return null;

  const opacity = interpolate(localFrame, [0, 15], [0, 0.65], { extrapolateRight: 'clamp' });
  const pad     = (n) => String(n).padStart(2, '0');

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', padding: '6% 0 0 5%' }}>
      <div style={{
        opacity,
        fontFamily:    "'JetBrains Mono', monospace",
        fontSize:      '16px',
        color:         'rgba(255,255,255,0.55)',
        letterSpacing: '0.12em',
        textShadow:    '0 1px 6px rgba(0,0,0,0.8)',
      }}>
        {pad(current)}/{pad(total)}
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// CORNER TIMESTAMP
// =============================================================================
export const CornerTimestamp = ({
  startFrame = 0,
  endFrame   = 900,
  label      = '',
}) => {
  const frame      = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > endFrame) return null;

  const opacity = interpolate(localFrame, [0, 20], [0, 0.55], { extrapolateRight: 'clamp' });
  const secs    = Math.floor(localFrame / 30);
  const frac    = String(localFrame % 30).padStart(2, '0');
  const timeStr = label || ('00:' + String(secs).padStart(2, '0') + ':' + frac);

  return (
    <AbsoluteFill style={{ alignItems: 'flex-end', justifyContent: 'flex-start', padding: '0 0 5% 5%' }}>
      <div style={{
        opacity,
        fontFamily:    "'JetBrains Mono', monospace",
        fontSize:      '14px',
        color:         'rgba(255,255,255,0.40)',
        letterSpacing: '0.1em',
        textShadow:    '0 1px 4px rgba(0,0,0,0.8)',
      }}>
        {timeStr}
      </div>
    </AbsoluteFill>
  );
};
