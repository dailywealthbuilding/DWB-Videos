// src/index.jsx -- DWB Remotion Root v8.0
// FILE PATH: src/index.jsx
//
// KEY RULES (never break):
// 1. STATIC IMPORTS ONLY. No require(). esbuild cannot mix require() with ESM.
// 2. Only import week files that EXIST in the repo.
// 3. Week 6 = default export. Week 7+ = named export.
// 4. Upload week file to repo FIRST -- then uncomment import here.
//
// CURRENT STATUS: Week 6 + Week 7 active. Days 36-49 registered.

import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition.jsx';

// -- Week content: static imports --
// Week 6: default export (days 36-42)
import week6Videos from './week6-content.js';
// Week 7: named export (days 43-49)
import { week7Videos } from './week7-content.js';
// Week 8+: add here AFTER uploading the file to repo
// import { week8Videos } from './week8-content.js';

// Safely coerce to arrays
const week6 = Array.isArray(week6Videos) ? week6Videos : [];
const week7 = Array.isArray(week7Videos) ? week7Videos : [];
// const week8 = Array.isArray(week8Videos) ? week8Videos : [];

// All entries combined -- add new weeks here as you create them
const allEntries = [
  ...week6,
  ...week7,
  // ...week8,
];

// Filter out any invalid entries
const validEntries = allEntries.filter(function(e) {
  return e && e.id && Array.isArray(e.overlays);
});

if (validEntries.length === 0) {
  console.error('[DWB] ERROR: No valid compositions found! Check week content files.');
} else {
  console.log('[DWB] ' + validEntries.length + ' compositions: ' + validEntries.map(function(e) { return e.id; }).join(', '));
}

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
