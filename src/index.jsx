// src/index.jsx -- DWB Remotion Root v7.1
//
// RULE: Only import week content files that EXIST in the repo.
// Static imports fail hard if the file is missing -- no try/catch rescue.
//
// CURRENT STATE: week6-content.js only.
// When you upload week7-content.js to src/, uncomment the week7 lines.
// Same pattern for week8, week9 etc.

import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition.jsx';

// ── Week content imports ──────────────────────────────────────────────────────
// Only uncomment a line once that file is uploaded to src/ in the repo.

import week6Videos from './week6-content.js';           // ✅ exists
// import { week7Videos } from './week7-content.js';    // ❌ upload first
// import { week8Videos } from './week8-content.js';    // ❌ upload first

// ── Groq-generated video ─────────────────────────────────────────────────────
// When Groq runs, it writes src/current-video.js.
// Import it here so Remotion can render it.
// Comment this out if current-video.js doesn't exist yet.
// import { currentVideo } from './current-video.js';

// ── Collect all entries ───────────────────────────────────────────────────────
const week6 = Array.isArray(week6Videos) ? week6Videos : [];
// const week7 = Array.isArray(week7Videos) ? week7Videos : [];

const allEntries = [
  ...week6,
  // ...week7,
  // ...(currentVideo ? [currentVideo] : []),
];

// ── Validate ──────────────────────────────────────────────────────────────────
const validEntries = allEntries.filter(function(e) {
  return e && e.id && Array.isArray(e.overlays);
});

if (validEntries.length === 0) {
  console.error('[DWB] ERROR: No valid compositions! Check week content files exist in src/');
} else {
  console.log('[DWB] ' + validEntries.length + ' compositions: ' + validEntries.map(function(e) { return e.id; }).join(', '));
}

// ── Root ──────────────────────────────────────────────────────────────────────
export const RemotionRoot = () => (
  <>
    {validEntries.map(function(entry) {
      return (
        <Composition
          key={entry.id}
          id={entry.id}
          component={VideoComposition}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoId:        entry.id,
            music:          entry.music         || (entry.id + '.mp3'),
            overlays:       entry.overlays       || [],
            backgroundMode: entry.backgroundMode || undefined,
            customClips:    entry.customClips    || undefined,
            photos:         entry.photos         || undefined,
            photoSpeed:     entry.photoSpeed     || undefined,
          }}
        />
      );
    })}
  </>
);

registerRoot(RemotionRoot);
