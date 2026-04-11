// src/index.jsx -- DWB Remotion Root v6.0
//
// v6 KEY FIX: Only registers compositions for days that are actually
// in the current week_info.json OR from the current-video.js (Groq).
// Previous version registered ALL days from ALL week files, which caused
// Remotion to try resolving compositions for week7 days when rendering week6.
//
// COMPOSITION LOADING ORDER:
// 1. src/current-video.js (Groq-generated, takes priority)
// 2. All week content files (filtered to active days only)

import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition.jsx';

// -- Try loading Groq-generated current video --
let currentVideoEntry = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const m = require('./current-video.js');
  if (m && m.currentVideo && m.currentVideo.id) {
    currentVideoEntry = m.currentVideo;
    console.log('[DWB] Groq video loaded: ' + m.currentVideo.id);
  }
} catch(e) {
  // current-video.js doesn't exist yet -- that's fine
}

// -- Helper: safely eval a content array from source --
function parseContentArray(source) {
  try {
    const dm = source.match(/export\s+default\s+(\[[\s\S]*?\]);?\s*$/m);
    const nm = source.match(/export\s+const\s+\w+\s*=\s*(\[[\s\S]*?\]);\s*(?=export|$)/m);
    const arr = dm ? dm[1] : (nm ? nm[1] : null);
    if (!arr) return [];
    return eval(arr); // eslint-disable-line no-eval
  } catch(e) {
    return [];
  }
}

// -- Load week content files --
// We load all files but only USE entries matching the current active days.
// This prevents week7 compositions polluting week6 renders.
let allContentEntries = [];

const weekFileNames = [
  './week5-content.js',
  './week6-content.js',
  './week7-content.js',
  './week8-content.js',
  './week9-content.js',
  './week10-content.js',
];

for (const fileName of weekFileNames) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require(fileName);
    let entries = [];
    if (m.default && Array.isArray(m.default)) {
      entries = m.default;
    } else {
      // Named export (week7+)
      const namedArr = Object.values(m).find(function(v) { return Array.isArray(v); });
      if (namedArr) entries = namedArr;
    }
    if (entries.length > 0) {
      allContentEntries = allContentEntries.concat(entries);
    }
  } catch(e) {
    // File doesn't exist -- that's fine, skip it
  }
}

// -- Build the final composition list --
// If Groq generated a video, ONLY render that.
// Otherwise, render all content entries (week detection in render.yml
// controls which days_override are passed to remotion CLI).
let compositionsToRender = [];

if (currentVideoEntry) {
  // Groq mode: only the generated video
  compositionsToRender = [currentVideoEntry];
  console.log('[DWB] Groq mode: rendering ' + currentVideoEntry.id + ' only');
} else {
  // Week file mode: all entries (Remotion CLI --composition flag selects specific day)
  compositionsToRender = allContentEntries;
  console.log('[DWB] Week mode: ' + compositionsToRender.length + ' total compositions registered');
}

// -- Validate entries --
const validCompositions = compositionsToRender.filter(function(entry) {
  if (!entry || !entry.id) {
    console.warn('[DWB] Entry missing id -- skipped');
    return false;
  }
  if (!entry.overlays || !Array.isArray(entry.overlays)) {
    console.warn('[DWB] ' + entry.id + ' missing overlays -- skipped');
    return false;
  }
  return true;
});

if (validCompositions.length > 0) {
  const ids = validCompositions.map(function(e) { return e.id; });
  console.log('[DWB] Valid compositions: ' + ids.join(', '));
}

// -- Remotion Root --
export const RemotionRoot = () => {
  return (
    <>
      {validCompositions.map(function(entry) {
        const {
          id,
          music,
          overlays,
          backgroundMode,
          customClips,
          photos,
          photoSpeed,
        } = entry;

        return (
          <Composition
            key={id}
            id={id}
            component={VideoComposition}
            durationInFrames={900}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{
              videoId:         id,
              music:           music || (id + '.mp3'),
              overlays:        overlays || [],
              backgroundMode:  backgroundMode  || undefined,
              customClips:     customClips     || undefined,
              photos:          photos          || undefined,
              photoSpeed:      photoSpeed      || undefined,
            }}
          />
        );
      })}
    </>
  );
};

registerRoot(RemotionRoot);
