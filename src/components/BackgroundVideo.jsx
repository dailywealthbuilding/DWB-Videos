// src/components/BackgroundVideo.jsx -- DWB v9.0
// FILE PATH: src/components/BackgroundVideo.jsx
//
// KEY FIXES:
//   1. Sequence-based clip rendering -- each clip starts fresh at its segment
//   2. loop prop on every OffthreadVideo -- no frozen last frame
//   3. Clips switch ONLY at overlay boundaries -- never mid-sentence
//   4. Mood-tag matching -- clip filename keywords matched to overlay text
//   5. Proper fallback chain: personal clips -> downloaded clips -> placeholder
//
// MOOD TAG SYSTEM:
//   Clip filenames are scanned for keywords → assigned a mood tag
//   Overlay text is scanned for keywords  → assigned a mood tag
//   Best-matching clip is assigned to each overlay segment
//   Seed = (dayNumber * 100 + overlayIndex) → same render = same clips every time

import {
  AbsoluteFill,
  OffthreadVideo,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  interpolate,
} from 'remotion';

// =============================================================================
// MOOD TAG SYSTEM
// =============================================================================

// Extract mood tags from a clip filename
function getClipMoodTags(filename) {
  const f = (filename || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const tags = new Set();

  if (/money|cash|wallet|dollar|bank|coin|wealth|rich|invest|stock|finance/.test(f)) tags.add('money');
  if (/city|street|urban|downtown|building|skyline|traffic/.test(f)) tags.add('city');
  if (/desk|laptop|work|office|notebook|plan|typing|keyboard/.test(f)) tags.add('focus');
  if (/cafe|coffee|morning|cup|drink|latte|table|cozy/.test(f)) tags.add('calm');
  if (/nature|outdoor|trees|forest|mountain|park|green|sky/.test(f)) tags.add('peaceful');
  if (/mirror|selfie|fashion|outfit|style|aesthetic|minimal|clean/.test(f)) tags.add('aesthetic');
  if (/luxury|penthouse|mansion|car|watch|travel|holiday|beach|pool/.test(f)) tags.add('luxury');
  if (/hands|rings|jewelry|nails|wrist|bracelet/.test(f)) tags.add('aesthetic');
  if (/candle|book|reading|flower|plant|window|curtain|light/.test(f)) tags.add('calm');
  if (/phone|scroll|screen|app|notification|chat/.test(f)) tags.add('focus');
  if (/walk|run|freedom|open|wide|space|horizon/.test(f)) tags.add('peaceful');
  if (/dynamic|fast|energy|motion|blur|crowd/.test(f)) tags.add('energy');

  if (tags.size === 0) tags.add('general');
  return [...tags];
}

// Determine what mood an overlay NEEDS based on its text and position
function getOverlayMoodNeeded(overlay, position, totalOverlays) {
  // Hook (first overlay) → needs energy/impact
  if (position === 0) return 'energy';
  // CTA (last overlay) → needs aesthetic/aspirational
  if (position === totalOverlays - 1) return 'aesthetic';

  const t = (overlay.text || '').toLowerCase();

  if (/money|income|earn|salary|wealth|rich|bank|invest|tax|debt|savings|budget/.test(t)) return 'money';
  if (/freedom|escape|success|dream|goal|achieve|retire|independent|wealthy/.test(t)) return 'luxury';
  if (/formula|system|track|habit|method|step|strategy|plan|action|schedule/.test(t)) return 'focus';
  if (/stress|problem|trapped|stuck|broke|fail|behind|struggle|hard/.test(t)) return 'city';
  if (/calm|peace|simple|quiet|balance|mindset|focus|clarity/.test(t)) return 'calm';

  return 'general';
}

// Score a clip against a needed mood
function scoreClip(filename, neededMood) {
  const clipTags = getClipMoodTags(filename);

  const MOOD_MATCHES = {
    energy:    ['city', 'energy', 'aesthetic'],
    money:     ['money', 'focus', 'luxury'],
    luxury:    ['luxury', 'aesthetic', 'calm'],
    focus:     ['focus', 'calm', 'aesthetic'],
    calm:      ['calm', 'peaceful', 'aesthetic'],
    city:      ['city', 'energy', 'focus'],
    aesthetic: ['aesthetic', 'calm', 'luxury'],
    peaceful:  ['peaceful', 'calm', 'nature'],
    general:   ['general', 'aesthetic', 'calm'],
  };

  const wantedTags = MOOD_MATCHES[neededMood] || ['general'];
  let score = 0;
  for (const tag of clipTags) {
    const idx = wantedTags.indexOf(tag);
    if (idx === 0) score += 3; // primary match
    if (idx === 1) score += 2; // secondary
    if (idx === 2) score += 1; // tertiary
  }
  return score;
}

// Seeded random number (deterministic for same day + position)
function seededRandom(seed) {
  let s = seed;
  s = (s ^ 61) ^ (s >>> 16);
  s *= 9;
  s = s ^ (s >>> 4);
  s *= 0x27d4eb2d;
  s = s ^ (s >>> 15);
  return Math.abs(s) / 0x7fffffff;
}

// Build the clip assignment list: one clip per overlay segment
// Returns: [{ startFrame, durationInFrames, clipFile }, ...]
function buildClipSchedule(overlays, availableClips, dayNum) {
  if (!availableClips || availableClips.length === 0) return [];
  const total = overlays.length;

  return overlays.map((overlay, i) => {
    const neededMood = getOverlayMoodNeeded(overlay, i, total);

    // Score every available clip against the needed mood
    const scored = availableClips.map((f, j) => ({
      file: f,
      score: scoreClip(f, neededMood),
      seedRank: seededRandom(dayNum * 100 + i * 10 + j),
    }));

    // Sort: highest score first, then seeded random as tiebreaker
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.seedRank - b.seedRank;
    });

    // Pick top candidate, but don't repeat the previous clip if possible
    let picked = scored[0].file;
    if (i > 0 && picked === availableClips[i - 1] && scored.length > 1) {
      picked = scored[1].file;
    }

    return {
      startFrame:       overlay.startFrame || 0,
      durationInFrames: (overlay.endFrame || 900) - (overlay.startFrame || 0),
      clipFile:         picked,
      mood:             neededMood,
    };
  });
}

// =============================================================================
// KEN BURNS FALLBACK PHOTOS
// =============================================================================
const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1080&q=80',
  'https://images.unsplash.com/photo-1579621970590-9d152b3e5cb4?w=1080&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1080&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1080&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1080&q=80',
];

function KenBurnsPhoto({ photoUrl, segmentIndex }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const zoomStart = 1.0 + (segmentIndex % 2) * 0.04;
  const zoomEnd   = zoomStart + 0.06;
  const panXStart = (segmentIndex % 3 === 0) ? 0 : (segmentIndex % 3 === 1) ? -30 : 30;
  const panXEnd   = -panXStart;

  const scale   = interpolate(frame, [0, 900], [zoomStart, zoomEnd]);
  const panX    = interpolate(frame, [0, 900], [panXStart, panXEnd]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={photoUrl}
        style={{
          width: '120%',
          height: '120%',
          objectFit: 'cover',
          objectPosition: 'center',
          transform: `scale(${scale}) translateX(${panX}px)`,
          transformOrigin: 'center center',
          marginLeft: '-10%',
          marginTop: '-10%',
          filter: 'brightness(0.82) saturate(1.05)',
        }}
      />
    </AbsoluteFill>
  );
}

// =============================================================================
// SINGLE CLIP RENDERER
// =============================================================================
function ClipRenderer({ clipFile }) {
  const src = staticFile('videos/' + clipFile);
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          filter: 'brightness(0.85) saturate(1.08)',
        }}
        muted
        loop
      />
    </AbsoluteFill>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================
export const BackgroundVideo = ({
  videoId,
  overlays = [],
  customClips,       // explicit list of filenames (legacy support)
  backgroundMode,    // 'photo', 'video', 'color'
}) => {
  const frame       = useCurrentFrame();
  const { fps }     = useVideoConfig();
  const dayNum      = parseInt((videoId || 'day0').replace('day', '')) || 0;

  // ── DETERMINE CLIP SOURCE ──────────────────────────────────────────────────
  // Priority:
  //   1. customClips prop (if explicitly set in content file)
  //   2. Downloaded pipeline clips: dayXX_clip1.mp4 ... dayXX_clip6.mp4
  //   Note: personal library clips were COPIED to dayXX_clipY.mp4 by render.yml
  //         so we always reference by the dayXX_clipY.mp4 naming
  let availableClips = [];

  if (customClips && customClips.length > 0) {
    // Explicit list from content file
    availableClips = customClips;
  } else {
    // Standard pipeline clips (downloaded or copied from personal library)
    for (let i = 1; i <= 6; i++) {
      availableClips.push(videoId + '_clip' + i + '.mp4');
    }
  }

  // ── BUILD CLIP SCHEDULE ────────────────────────────────────────────────────
  // If we have overlays, sync clips to overlay timing (one clip per overlay)
  // If no overlays, just cycle through clips evenly
  let clipSchedule = [];

  if (overlays.length > 0) {
    clipSchedule = buildClipSchedule(overlays, availableClips, dayNum);
  } else {
    // No overlays: divide 900 frames evenly among available clips
    const framesPerClip = Math.floor(900 / availableClips.length);
    availableClips.forEach((f, i) => {
      clipSchedule.push({
        startFrame:       i * framesPerClip,
        durationInFrames: i === availableClips.length - 1
          ? 900 - i * framesPerClip
          : framesPerClip,
        clipFile: f,
        mood: 'general',
      });
    });
  }

  // ── FALLBACK: no clips → KenBurns photos ──────────────────────────────────
  if (availableClips.length === 0 || backgroundMode === 'photo') {
    return (
      <AbsoluteFill style={{ background: '#080c14' }}>
        {FALLBACK_PHOTOS.slice(0, Math.max(overlays.length, 1)).map((url, i) => {
          const startFrame = overlays[i]?.startFrame ?? Math.floor(i * 900 / FALLBACK_PHOTOS.length);
          const duration   = overlays[i]
            ? (overlays[i].endFrame - overlays[i].startFrame)
            : Math.floor(900 / FALLBACK_PHOTOS.length);
          return (
            <Sequence key={i} from={startFrame} durationInFrames={duration}>
              <KenBurnsPhoto photoUrl={url} segmentIndex={i} />
            </Sequence>
          );
        })}
        {/* Dark overlay */}
        <AbsoluteFill style={{ background: 'rgba(0,0,0,0.08)', zIndex: 10 }} />
      </AbsoluteFill>
    );
  }

  // ── MAIN: Sequence-based clip rendering ────────────────────────────────────
  // Each overlay gets ONE clip that starts fresh from its segment start.
  // OffthreadVideo with loop ensures short clips repeat within the segment.
  return (
    <AbsoluteFill style={{ background: '#080c14' }}>

      {clipSchedule.map((seg, i) => (
        <Sequence
          key={i}
          from={seg.startFrame}
          durationInFrames={seg.durationInFrames}
        >
          <ClipRenderer clipFile={seg.clipFile} />
        </Sequence>
      ))}

      {/* Subtle dark overlay for text readability -- max rgba(0,0,0,0.06) */}
      <AbsoluteFill
        style={{
          background: 'rgba(0,0,0,0.06)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

    </AbsoluteFill>
  );
};
