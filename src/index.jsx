// src/index.jsx -- DWB Remotion Root v7.0
//
// KEY FIX: Static imports only. No require(). No try/catch swallowing errors.
// Remotion bundler (esbuild) cannot mix require() with ES module files.
// Previous version: require() inside try/catch silently swallowed all errors
// and registered ZERO compositions -> "Could not find composition with ID day37"
//
// HOW THIS WORKS:
// 1. Static imports bring in all week content arrays.
// 2. ALL compositions registered with Remotion.
// 3. render.yml passes `--composition day37` to pick specific day.
// 4. No week-detection needed in index.jsx -- render.yml handles that.
//
// ADDING FUTURE WEEKS: add import below + spread into allEntries.

import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition.jsx';

// -- Week content: static imports --
// week6: default export
import week6Videos from './week6-content.js';
// week7: named export
import { week7Videos } from './week7-content.js';

// Safely coerce to array
const week6 = Array.isArray(week6Videos) ? week6Videos : [];
const week7 = Array.isArray(week7Videos) ? week7Videos : [];

// All entries combined
// Add week8, week9 etc here as you create those files:
// import { week8Videos } from './week8-content.js';
// const week8 = Array.isArray(week8Videos) ? week8Videos : [];
const allEntries = [
  ...week6,
  ...week7,
  // ...week8,
];

// Filter invalid
const validEntries = allEntries.filter(function(e) {
  return e && e.id && Array.isArray(e.overlays);
});

if (validEntries.length === 0) {
  console.error('[DWB] ERROR: No valid compositions found! Check week content files.');
} else {
  console.log('[DWB] ' + validEntries.length + ' compositions: ' + validEntries.map(function(e){return e.id;}).join(', '));
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
            music:          entry.music          || (entry.id + '.mp3'),
            overlays:       entry.overlays        || [],
            backgroundMode: entry.backgroundMode  || undefined,
            customClips:    entry.customClips      || undefined,
            photos:         entry.photos           || undefined,
            photoSpeed:     entry.photoSpeed       || undefined,
          }}
        />
      );
    })}
  </>
);

registerRoot(RemotionRoot);
