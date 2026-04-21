// src/components/BackgroundVideo.jsx -- DWB v10.0
// FILE PATH: src/components/BackgroundVideo.jsx
//
// v10 CHANGES:
//   1. CLIP MANIFEST SYSTEM -- reads public/clip-manifest.json for auto-ID'd clips
//   2. LOOP FIX -- clips normalized to 30s by render.yml (ffmpeg step)
//      OffthreadVideo loop prop still set as safety net
//   3. DARKER OVERLAY -- rgba(0,0,0,0.18) was 0.06 -- better text readability
//      on light aesthetic clips
//   4. MOOD MATCHING -- still works, now reads from manifest tags if available
//   5. STORYSET SUPPORT -- IllustrationLayer reads from public/illustrations/

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
// MOOD TAG SYSTEM -- v10 reads from clip-manifest.json if available
// Falls back to filename scanning if manifest not present
// =============================================================================

function getClipMoodTags(filename, manifestTags) {
  // Prefer manifest tags (pre-catalogued)
  if (manifestTags && manifestTags.length > 0) return manifestTags;

  // Fallback: scan filename keywords
  const f = (filename || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');
  const tags = new Set();

  if (/money|cash|wallet|dollar|bank|coin|wealth|rich|invest|stock|finance/.test(f)) tags.add('money');
  if (/city|street|urban|downtown|building|skyline|traffic/.test(f))               tags.add('city');
  if (/desk|laptop|work|office|notebook|plan|typing|keyboard/.test(f))             tags.add('focus');
  if (/cafe|coffee|morning|cup|drink|latte|table|cozy/.test(f))                    tags.add('calm');
  if (/nature|outdoor|trees|forest|mountain|park|green|sky/.test(f))               tags.add('peaceful');
  if (/mirror|selfie|fashion|outfit|style|aesthetic|minimal|clean|white|room/.test(f)) tags.add('aesthetic');
  if (/luxury|penthouse|mansion|car|watch|travel|holiday|beach|pool/.test(f))      tags.add('luxury');
  if (/hands|rings|jewelry|nails|wrist|bracelet/.test(f))                          tags.add('aesthetic');
  if (/candle|book|reading|flower|plant|window|curtain|light/.test(f))             tags.add('calm');
  if (/phone|scroll|screen|app|notification|chat/.test(f))                         tags.add('focus');
  if (/walk|run|freedom|open|wide|space|horizon/.test(f))                          tags.add('peaceful');
  if (/dynamic|fast|energy|motion|blur|crowd/.test(f))                             tags.add('energy');

  if (tags.size === 0) tags.add('general');
  return [...tags];
}

function getOverlayMoodNeeded(overlay, position, totalOverlays) {
  if (position === 0)                      return 'energy';
  if (position === totalOverlays - 1)      return 'aesthetic';

  const t = (overlay.text || '').toLowerCase();

  if (/money|income|earn|salary|wealth|rich|bank|invest|tax|debt|savings|budget/.test(t)) return 'money';
  if (/freedom|escape|success|dream|goal|achieve|retire|independent|wealthy/.test(t))     return 'luxury';
  if (/formula|system|track|habit|method|step|strategy|plan|action|schedule/.test(t))     return 'focus';
  if (/stress|problem|trapped|stuck|broke|fail|behind|struggle|hard/.test(t))             return 'city';
  if (/calm|peace|simple|quiet|balance|mindset|focus|clarity/.test(t))                    return 'calm';

  return 'general';
}

function scoreClip(filename, neededMood, manifestTags) {
  const clipTags = getClipMoodTags(filename, manifestTags);

  const MOOD_MATCHES = {
    energy:    ['city', 'energy', 'aesthetic'],
    money:     ['money', 'focus', 'luxury'],
    luxury:    ['luxury', 'aesthetic', 'calm'],
    focus:     ['focus', 'calm', 'aesthetic'],
    calm:      ['calm', 'peaceful', 'aesthetic'],
    city:      ['city', 'energy', 'focus'],
    aesthetic: ['aesthetic', 'calm', 'luxury'],
    peaceful:  ['peaceful', 'calm', 'aesthetic'],
    general:   ['general', 'aesthetic', 'calm'],
  };

  const wantedTags = MOOD_MATCHES[neededMood] || ['general'];
  let score = 0;
  for (const tag of clipTags) {
    const idx = wantedTags.indexOf(tag);
    if (idx === 0) score += 3;
    if (idx === 1) score += 2;
    if (idx === 2) score += 1;
  }
  return score;
}

function seededRandom(seed) {
  let s = seed;
  s = (s ^ 61) ^ (s >>> 16);
  s *= 9;
  s = s ^ (s >>> 4);
  s *= 0x27d4eb2d;
  s = s ^ (s >>> 15);
  return Math.abs(s) / 0x7fffffff;
}

function buildClipSchedule(overlays, availableClips, dayNum, manifest) {
  if (!availableClips || availableClips.length === 0) return [];
  const total = overlays.length;

  return overlays.map((overlay, i) => {
    const neededMood = getOverlayMoodNeeded(overlay, i, total);

    // Get manifest tags for each clip if available
    const scored = availableClips.map((f, j) => {
      const clipEntry = manifest ? Object.values(manifest.clips || {}).find(c => c.filename === f) : null;
      const mTags     = clipEntry ? clipEntry.tags : null;
      return {
        file: f,
        score: scoreClip(f, neededMood, mTags),
        seedRank: seededRandom(dayNum * 100 + i * 10 + j),
      };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.seedRank - b.seedRank;
    });

    let picked = scored[0].file;
    if (i > 0 && scored.length > 1) {
      const prevClip = availableClips[i - 1];
      if (picked === prevClip) picked = scored[1].file;
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
];

function KenBurnsPhoto({ photoUrl, segmentIndex }) {
  const frame = useCurrentFrame();

  const zoomStart = 1.0 + (segmentIndex % 2) * 0.04;
  const zoomEnd   = zoomStart + 0.06;
  const panXStart = (segmentIndex % 3 === 0) ? 0 : (segmentIndex % 3 === 1) ? -30 : 30;
  const panXEnd   = -panXStart;

  const scale = interpolate(frame, [0, 900], [zoomStart, zoomEnd]);
  const panX  = interpolate(frame, [0, 900], [panXStart, panXEnd]);

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
          filter: 'brightness(0.80) saturate(1.05)',
        }}
      />
    </AbsoluteFill>
  );
}

// =============================================================================
// SINGLE CLIP RENDERER -- v10
// loop={true} is set as a safety net.
// Primary loop fix is done by render.yml ffmpeg step that extends clips to 30s.
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
          objectPosition: 'center top',  // bias to top for portrait-style aesthetic clips
          filter: 'brightness(0.82) saturate(1.06) contrast(1.02)',
        }}
        muted
        loop
      />
    </AbsoluteFill>
  );
}

// =============================================================================
// ILLUSTRATION OVERLAY -- Storyset integration
// Renders a pre-downloaded SVG from public/illustrations/
// Usage in overlay: { ..., storyset: 'money-growth' }
// File expected: public/illustrations/money-growth.svg
// =============================================================================
function IllustrationLayer({ overlays }) {
  const frame = useCurrentFrame();

  const illustrationOverlays = (overlays || []).filter(o => o.storyset);

  if (illustrationOverlays.length === 0) return null;

  return (
    <>
      {illustrationOverlays.map((overlay, i) => {
        const duration = (overlay.endFrame || 900) - (overlay.startFrame || 0);
        const localFrame = frame - (overlay.startFrame || 0);

        if (localFrame < 0 || localFrame > duration) return null;

        const op = Math.min(
          interpolate(localFrame, [0, 20], [0, 0.85], { extrapolateRight: 'clamp' }),
          interpolate(localFrame, [duration - 20, duration], [0.85, 0], { extrapolateLeft: 'clamp' })
        );

        const src = staticFile('illustrations/' + overlay.storyset + '.svg');

        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: '8%',
            right: '5%',
            width: '220px',
            height: '220px',
            opacity: op,
            zIndex: 30,
          }}>
            <Img
              src={src}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        );
      })}
    </>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================
export const BackgroundVideo = ({
  videoId,
  overlays    = [],
  customClips,
  backgroundMode,
  clipManifest,   // optional: pre-loaded manifest object from index.jsx
}) => {
  const { fps }  = useVideoConfig();
  const dayNum   = parseInt((videoId || 'day0').replace('day', '')) || 0;

  // ── DETERMINE CLIP SOURCE ──────────────────────────────────────────────────
  let availableClips = [];

  if (customClips && customClips.length > 0) {
    availableClips = customClips;
  } else {
    for (let i = 1; i <= 6; i++) {
      availableClips.push(videoId + '_clip' + i + '.mp4');
    }
  }

  // ── BUILD CLIP SCHEDULE ────────────────────────────────────────────────────
  let clipSchedule = [];

  if (overlays.length > 0) {
    clipSchedule = buildClipSchedule(overlays, availableClips, dayNum, clipManifest || null);
  } else {
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
        <AbsoluteFill style={{ background: 'rgba(0,0,0,0.12)', zIndex: 10 }} />
      </AbsoluteFill>
    );
  }

  // ── MAIN: Sequence-based clip rendering ────────────────────────────────────
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

      {/* Illustration overlays (Storyset SVGs) */}
      <IllustrationLayer overlays={overlays} />

      {/* v10 FIX: Darker overlay (0.18 vs old 0.06) for text readability on light aesthetic clips */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.32) 100%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

    </AbsoluteFill>
  );
};
