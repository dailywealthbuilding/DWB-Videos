// -----------------------------------------------------------------------------
// src/index.jsx -- DWB Remotion Root v5.0
//
// v5.0 changes:
//   - Loads src/current-video.js (Groq-generated script) if present
//   - current-video takes priority in composition list
//   - Supports 6 clips per day in BackgroundVideo
//   - Removed LowerThird import (defined locally in VideoComposition)
// -----------------------------------------------------------------------------

import { registerRoot, Composition } from 'remotion';
import { VideoComposition } from './compositions/VideoComposition.jsx';

// -- Groq-generated video (current run) --
// Written fresh by render.yml Groq generation step.
// If this file doesn't exist, falls back to week content files.
let currentVideoArr = [];
try {
  const m = require('./current-video.js');
  if (m.currentVideo && m.currentVideo.id) {
    currentVideoArr = [m.currentVideo];
    console.log('[DWB v5] Generated video loaded: ' + m.currentVideo.id);
  }
} catch(e) {}

// -- Week content files --
let week5Content = [];
try {
  const m = require('./week5-content.js');
  week5Content = (m.default && Array.isArray(m.default)) ? m.default
    : (Object.values(m).find(function(v) { return Array.isArray(v); }) || []);
} catch(e) {}

let week6Content = [];
try {
  const m = require('./week6-content.js');
  week6Content = (m.default && Array.isArray(m.default)) ? m.default
    : (Object.values(m).find(function(v) { return Array.isArray(v); }) || []);
} catch(e) {}

let week7Videos = [];
try {
  const m = require('./week7-content.js');
  week7Videos = (m.default && Array.isArray(m.default)) ? m.default
    : (Object.values(m).find(function(v) { return Array.isArray(v); }) || []);
} catch(e) {}

let week8Videos = [];
try {
  const m = require('./week8-content.js');
  week8Videos = (m.default && Array.isArray(m.default)) ? m.default
    : (Object.values(m).find(function(v) { return Array.isArray(v); }) || []);
} catch(e) {}

let week9Videos = [];
try {
  const m = require('./week9-content.js');
  week9Videos = (m.default && Array.isArray(m.default)) ? m.default
    : (Object.values(m).find(function(v) { return Array.isArray(v); }) || []);
} catch(e) {}

let week10Videos = [];
try {
  const m = require('./week10-content.js');
  week10Videos = (m.default && Array.isArray(m.default)) ? m.default
    : (Object.values(m).find(function(v) { return Array.isArray(v); }) || []);
} catch(e) {}

// -----------------------------------------------------------------------------
// ALL_CONTENT -- current-video first, then week files
// -----------------------------------------------------------------------------
const ALL_CONTENT = [
  ...currentVideoArr,  // Groq-generated (if exists, this is what renders)
  ...week5Content,
  ...week6Content,
  ...week7Videos,
  ...week8Videos,
  ...week9Videos,
  ...week10Videos,
];

// -----------------------------------------------------------------------------
// Validate entries
// -----------------------------------------------------------------------------
function validateEntry(entry) {
  const required = ['id', 'overlays'];
  const missing = required.filter(function(f) { return !entry[f]; });
  if (missing.length > 0) {
    console.warn('[DWB] ' + (entry.id || 'UNKNOWN') + ' missing: ' + missing.join(', '));
  }
  return missing;
}

// -----------------------------------------------------------------------------
// RemotionRoot
// -----------------------------------------------------------------------------
export const RemotionRoot = () => {
  const valid = ALL_CONTENT.filter(function(entry) {
    return validateEntry(entry).length === 0;
  });

  if (currentVideoArr.length > 0) {
    console.log('[DWB v5] Groq mode: ' + currentVideoArr[0].id + ' | total compositions: ' + valid.length);
  } else {
    console.log('[DWB v5] Week mode: ' + valid.length + ' compositions | ' + (valid[0] && valid[0].id) + ' -> ' + (valid[valid.length - 1] && valid[valid.length - 1].id));
  }

  return (
    <>
      {valid.map(({ id, music, overlays, backgroundMode, customClips, photos, photoSpeed }) => (
        <Composition
          key={id}
          id={id}
          component={VideoComposition}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            videoId: id,
            music: music || '',
            overlays: overlays || [],
            backgroundMode: backgroundMode || undefined,
            customClips: customClips || undefined,
            photos: photos || undefined,
            photoSpeed: photoSpeed || undefined,
          }}
        />
      ))}
    </>
  );
};

registerRoot(RemotionRoot);
