// src/index.jsx -- DWB Remotion Root v8.0
// FILE PATH: src/index.jsx
//
// TEMPORARY VERSION: week7 import commented out.
// week7-content.js does not exist in src/ yet.
//
// TO ACTIVATE WEEK 7:
// 1. Upload week7-content.js to src/ first
// 2. Then uncomment the 3 week7 lines below

import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition.jsx';

// Week 6: default export (days 36-42) -- ACTIVE
import week6Videos from './week6-content.js';

// Week 7: named export (days 43-49) -- UNCOMMENT AFTER UPLOADING week7-content.js
// import { week7Videos } from './week7-content.js';

const week6 = Array.isArray(week6Videos) ? week6Videos : [];
// const week7 = Array.isArray(week7Videos) ? week7Videos : [];

const allEntries = [
  ...week6,
  // ...week7,
];

const validEntries = allEntries.filter(function(e) {
  return e && e.id && Array.isArray(e.overlays);
});

if (validEntries.length === 0) {
  console.error('[DWB] ERROR: No valid compositions found!');
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
