// src/index.jsx -- DWB Remotion Root v10.2
// FILE PATH: src/index.jsx
// SELECT ALL → DELETE → PASTE → COMMIT
//
// v10.2 CHANGES:
//   1. Week 7 ACTIVE -- days 43-49 now rendering
//   2. Local clips AUTO-DETECTED from public/clip-manifest.json
//      (manifest is written by render.yml -- zero manual work needed)
//   3. 8 clips per video distributed automatically
//   4. No manual LOCAL_CLIPS array -- everything is automatic

import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition.jsx';

// ─── WEEK IMPORTS ─────────────────────────────────────────────
import week6Videos from './week6-content.js';
import { week7Videos } from './week7-content.js';

// ─── AUTO CLIP MANIFEST ───────────────────────────────────────
// render.yml writes public/clip-manifest.json before Remotion runs.
// We read it here automatically -- no manual clip listing ever needed.
// If the manifest doesn't exist yet (first run), we skip local clips.
let clipManifest = null;
let localClipPaths = [];

try {
  clipManifest = require('../public/clip-manifest.json');
  if (clipManifest && Array.isArray(clipManifest.clips)) {
    localClipPaths = clipManifest.clips.map(function(f) {
      return { src: 'videos/' + f, type: 'local' };
    });
    console.log('[DWB] Auto-loaded ' + localClipPaths.length + ' local clips from manifest.');
  }
} catch (e) {
  console.log('[DWB] No clip-manifest.json found. Using API clips only.');
}

// ─── DISTRIBUTE LOCAL CLIPS ───────────────────────────────────
// Rotates through available local clips so each video gets variety.
// Each video gets up to 8 clips. Falls back to API if fewer exist.
function getClipsForVideo(videoIndex) {
  if (localClipPaths.length === 0) return undefined;
  const clipsPerVideo = 8;
  const start  = (videoIndex * clipsPerVideo) % localClipPaths.length;
  const result = [];
  for (var i = 0; i < clipsPerVideo; i++) {
    result.push(localClipPaths[(start + i) % localClipPaths.length]);
  }
  return result;
}

// ─── MERGE ALL WEEKS ──────────────────────────────────────────
var week6 = Array.isArray(week6Videos) ? week6Videos : [];
var week7 = Array.isArray(week7Videos) ? week7Videos : [];

var allEntries = week6.concat(week7);

var validEntries = allEntries.filter(function(e) {
  return e && e.id && Array.isArray(e.overlays);
});

if (validEntries.length === 0) {
  console.error('[DWB] ERROR: No valid compositions found!');
} else {
  console.log('[DWB] ' + validEntries.length + ' compositions ready: ' + validEntries.map(function(e) { return e.id; }).join(', '));
}

// ─── REGISTER ─────────────────────────────────────────────────
export const RemotionRoot = () => (
  <>
    {validEntries.map(function(entry, idx) {
      var localClips = getClipsForVideo(idx);
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
            customClips:    localClips           || entry.customClips || undefined,
            photos:         entry.photos         || undefined,
            photoSpeed:     entry.photoSpeed     || undefined,
            clipManifest:   clipManifest         || undefined,
          }}
        />
      );
    })}
  </>
);

registerRoot(RemotionRoot);
