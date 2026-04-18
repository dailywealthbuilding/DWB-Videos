#!/usr/bin/env node
// validate.js -- DWB Pre-Render Validator v2.0
// FILE PATH: validate.js (repo root)
// v2 UPDATE: Added all v8 animation types to KNOWN_ANIMATIONS
const fs   = require('fs');
const path = require('path');

const TOTAL_FRAMES    = 900;
const MAX_TEXT_LEN    = 100;
const MIN_AUDIO_BYTES = 50000;

const REQUIRED_SCHEMA_FIELDS = ['id','filename','overlays','tiktokCaption','youtubeTitle','youtubeDescription','pinnedComment'];

const KNOWN_ANIMATIONS = [
  // Phase 1 Core
  'fade','pop','slide-left','slide-right','slide-up','slide-down',
  'bounce','zoom-punch','zoom-out','heartbeat','shake','glitch',
  'letter-expand','typewriter','word-highlight','scramble','stagger',
  'multi-line','strike','ellipsis','counter','neon-glow','highlight-box',
  'shimmer','frosted','color-pulse','3d-extrude','caption-bar',
  // Phase 2
  'gradient-text','outlined','mask-reveal','pixel-dissolve','vhs',
  'strobe','pulse-ring','underline-draw','weight-shift','diagonal-wipe',
  'caps','outline','gradient-sweep',
  // Phase 3
  'liquid-drip','text-clip','outline-stroke','split-reveal','blur-in',
  'flip-up','letter-drop','panel-split','kinetic','word-bounce',
  'gradient-shift','outline-fill','color-burn',
  // Phase 4 (TextOverlayExtensions.jsx)
  'word-pop','stamp-impact','newspaper-highlight','stacked-giant',
  'kinetic-mixed','diagonal-cascade','magnetic-snap','spotlight-reveal',
  'comic-impact','gold-foil-sweep','neon-flicker','elastic-snap',
  'wave-cascade','ticker-news','rotate-y-flip',
  // v8 New Editorial Animations (TextOverlay.jsx)
  'elegant-rise','script-pair','pill-card','mixed-weight','editorial-body',
  'letter-breathe','fade-word','accent-reveal','cinematic-title','ghost-repeat',
];

const REQUIRED_OVERLAY_FIELDS = ['text','position','animation','startFrame','endFrame'];
const GOOGLE_FONTS = ['Anton','Montserrat','Bebas Neue','Oswald','Playfair Display','JetBrains Mono','Cormorant Garamond','Great Vibes','Dancing Script'];

let errors = [], warnings = [], info = [];
const err  = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const ok   = (m) => info.push(m);

function loadContentFiles() {
  const args  = process.argv.slice(2);
  let files   = args.length > 0 ? args : [];
  if (files.length === 0) {
    const srcDir = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcDir)) {
      files = fs.readdirSync(srcDir)
        .filter(f => f.match(/^week\d+-content\.js$/))
        .map(f => path.join(srcDir, f));
    }
  }
  if (files.length === 0) { warn('No content files found'); return []; }
  const allEntries = [];
  for (const file of files) {
    if (!fs.existsSync(file)) { err('File not found: ' + file); continue; }
    try {
      const source = fs.readFileSync(file, 'utf8');
      const dm = source.match(/export\s+default\s+(\[[\s\S]*?\]);?\s*$/m);
      const nm = source.match(/export\s+const\s+\w+\s*=\s*(\[[\s\S]*?\]);\s*(?=export|$)/m);
      const arrayStr = dm ? dm[1] : (nm ? nm[1] : null);
      if (!arrayStr) { err('Cannot parse export from ' + path.basename(file)); continue; }
      const entries = eval(arrayStr);
      allEntries.push(...entries);
      ok('Loaded ' + entries.length + ' entries from ' + path.basename(file));
    } catch(e) { err('Parse error in ' + path.basename(file) + ': ' + e.message); }
  }
  return allEntries;
}

function checkSchema(entries) {
  for (const e of entries) {
    for (const f of REQUIRED_SCHEMA_FIELDS) {
      if (e[f] === undefined || e[f] === null || e[f] === '') {
        err('[Schema] ' + (e.id||'?') + ': missing "' + f + '"');
      }
    }
  }
  ok('[Schema] Schema checked for ' + entries.length + ' entries');
}

function checkMissingDays(entries) {
  const nums = entries.map(e => parseInt((e.id||'').replace('day',''))).filter(n => !isNaN(n)).sort((a,b) => a-b);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i-1] > 1) warn('[MissingDay] Gap: day' + nums[i-1] + ' to day' + nums[i]);
  }
  ok('[MissingDay] Days ' + (nums[0]||'?') + '-' + (nums[nums.length-1]||'?') + ' checked');
}

function checkFrameBounds(entries) {
  for (const e of entries) {
    if (!e.overlays) continue;
    for (let i = 0; i < e.overlays.length; i++) {
      const o = e.overlays[i];
      if (o.endFrame > TOTAL_FRAMES) err('[FrameBounds] ' + e.id + ' ov[' + i + ']: endFrame ' + o.endFrame + ' > ' + TOTAL_FRAMES);
      if (o.startFrame >= o.endFrame) err('[FrameBounds] ' + e.id + ' ov[' + i + ']: startFrame >= endFrame');
      if (o.startFrame < 0) err('[FrameBounds] ' + e.id + ' ov[' + i + ']: startFrame < 0');
    }
  }
  ok('[FrameBounds] Frame bounds checked');
}

function checkAnimations(entries) {
  let unknown = 0;
  for (const e of entries) {
    if (!e.overlays) continue;
    for (let i = 0; i < e.overlays.length; i++) {
      const anim = e.overlays[i].animation || '';
      if (!KNOWN_ANIMATIONS.includes(anim)) {
        warn('[Animation] ' + e.id + ' ov[' + i + ']: unknown "' + anim + '"');
        unknown++;
      }
    }
  }
  if (unknown === 0) ok('[Animation] All animations valid');
}

function checkOverlaps(entries) {
  let found = 0;
  for (const e of entries) {
    if (!e.overlays) continue;
    const o = e.overlays;
    for (let i = 0; i < o.length; i++) {
      for (let j = i+1; j < o.length; j++) {
        if (o[i].position === o[j].position && o[i].startFrame < o[j].endFrame && o[j].startFrame < o[i].endFrame) {
          warn('[Overlap] ' + e.id + ': ov[' + i + '] and ov[' + j + '] overlap at "' + o[i].position + '"');
          found++;
        }
      }
    }
  }
  if (found === 0) ok('[Overlap] No overlaps detected');
}

function checkTextLength(entries) {
  for (const e of entries) {
    if (!e.overlays) continue;
    for (let i = 0; i < e.overlays.length; i++) {
      const text = (e.overlays[i].text || '').replace(/\n/g, '');
      if (text.length > MAX_TEXT_LEN) warn('[TextLen] ' + e.id + ' ov[' + i + ']: ' + text.length + ' chars > ' + MAX_TEXT_LEN);
    }
  }
  ok('[TextLen] Text length checked');
}

function checkRequiredOverlayFields(entries) {
  let missing = 0;
  for (const e of entries) {
    if (!e.overlays) continue;
    for (let i = 0; i < e.overlays.length; i++) {
      for (const f of REQUIRED_OVERLAY_FIELDS) {
        if (e.overlays[i][f] === undefined || e.overlays[i][f] === null) {
          err('[OverlayFields] ' + e.id + ' ov[' + i + ']: missing "' + f + '"');
          missing++;
        }
      }
    }
  }
  if (missing === 0) ok('[OverlayFields] All overlay fields present');
}

function checkColorContrast(entries) {
  for (const e of entries) {
    if (!e.overlays) continue;
    for (const ov of e.overlays) {
      if (!ov.color || !ov.color.startsWith('#')) continue;
      const h    = ov.color.replace('#','');
      const full = h.length === 3 ? h.split('').map(c => c+c).join('') : h.padEnd(6,'0');
      const r = parseInt(full.slice(0,2),16)/255;
      const g = parseInt(full.slice(2,4),16)/255;
      const b = parseInt(full.slice(4,6),16)/255;
      const lum = 0.2126*r + 0.7152*g + 0.0722*b;
      if (lum < 0.05) warn('[Contrast] ' + e.id + ': color "' + ov.color + '" is very dark -- text may be invisible');
    }
  }
  ok('[Contrast] Color contrast checked');
}

function checkChronologicalOrder(entries) {
  for (const e of entries) {
    if (!e.overlays) continue;
    for (let i = 1; i < e.overlays.length; i++) {
      if (e.overlays[i].startFrame < e.overlays[i-1].startFrame) {
        warn('[Order] ' + e.id + ': ov[' + i + '] startFrame ' + e.overlays[i].startFrame + ' < ov[' + (i-1) + '] startFrame ' + e.overlays[i-1].startFrame);
      }
    }
  }
  ok('[Order] Chronological order checked');
}

function checkDuplicateQueries(entries) {
  const map = {};
  for (const e of entries) {
    for (const q of (e.bRollQueries || [])) {
      map[q] = map[q] || [];
      map[q].push(e.id);
    }
  }
  for (const [q, days] of Object.entries(map)) {
    if (days.length > 1) warn('[DupQuery] "' + q + '" used in: ' + days.join(', '));
  }
  ok('[DupQuery] Duplicate queries checked');
}

function checkBRollCount(entries) {
  for (const e of entries) {
    const queries = e.bRollQueries || [];
    if (queries.length === 0) warn('[BRoll] ' + e.id + ': no bRollQueries defined');
    if (queries.length > 0 && queries.length < 6) warn('[BRoll] ' + e.id + ': only ' + queries.length + ' bRollQueries -- need 6');
    if (queries.length > 6) warn('[BRoll] ' + e.id + ': ' + queries.length + ' bRollQueries -- expected exactly 6');
  }
  ok('[BRoll] B-roll query counts checked');
}

function checkAudioFiles(entries) {
  for (const e of entries) {
    if (!e.music) continue;
    const p = path.join(process.cwd(), 'public', 'music', e.music);
    if (!fs.existsSync(p)) { warn('[Audio] ' + e.id + ': music not found: ' + e.music); continue; }
    if (fs.statSync(p).size < MIN_AUDIO_BYTES) warn('[Audio] ' + e.id + ': music file too small');
  }
  ok('[Audio] Audio files checked');
}

function checkOverlayCount(entries) {
  for (const e of entries) {
    if (!e.overlays) continue;
    if (e.overlays.length > 5) warn('[OverlayCount] ' + e.id + ': ' + e.overlays.length + ' overlays (max 5 recommended for week 7+)');
    if (e.overlays.length === 0) err('[OverlayCount] ' + e.id + ': no overlays defined');
  }
  ok('[OverlayCount] Overlay counts checked');
}

function checkRemotionConfig() {
  const p = path.join(process.cwd(), 'remotion.config.js');
  if (!fs.existsSync(p)) { warn('[RemotionConfig] remotion.config.js not found'); return; }
  const s = fs.readFileSync(p, 'utf8');
  if (s.includes('setCrf')) ok('[RemotionConfig] CRF setting confirmed');
  else warn('[RemotionConfig] Check CRF setting in remotion.config.js');
}

function checkFontPreloader() {
  const p = path.join(process.cwd(), 'public', 'index.html');
  if (!fs.existsSync(p)) { warn('[Fonts] public/index.html not found'); return; }
  const html = fs.readFileSync(p, 'utf8');
  for (const font of GOOGLE_FONTS) {
    const key = font.replace(/ /g,'+');
    if (!html.includes(key)) warn('[Fonts] "' + font + '" not in public/index.html');
  }
  ok('[Fonts] Font preload checked');
}

function checkCustomClips(entries) {
  for (const e of entries) {
    if (!e.customClips) continue;
    for (const clip of e.customClips) {
      const p = path.join(process.cwd(), 'public', 'videos', clip);
      if (!fs.existsSync(p)) warn('[CustomClips] ' + e.id + ': clip not found in public/videos/: ' + clip);
    }
  }
  ok('[CustomClips] Custom clip paths checked');
}

function main() {
  console.log('\n+----------------------------------------------+');
  console.log('|  DWB Pre-Render Validator v2.0               |');
  console.log('|  Supports v8 animations + customClips        |');
  console.log('+----------------------------------------------+\n');

  const entries = loadContentFiles();
  if (entries.length > 0) {
    console.log('Validating ' + entries.length + ' entries...\n');
    checkSchema(entries);
    checkMissingDays(entries);
    checkFrameBounds(entries);
    checkAnimations(entries);
    checkOverlaps(entries);
    checkTextLength(entries);
    checkRequiredOverlayFields(entries);
    checkColorContrast(entries);
    checkChronologicalOrder(entries);
    checkDuplicateQueries(entries);
    checkBRollCount(entries);
    checkAudioFiles(entries);
    checkOverlayCount(entries);
    checkCustomClips(entries);
  }
  checkRemotionConfig();
  checkFontPreloader();

  console.log('\n----------------------------------------------\n');
  if (info.length > 0)     { console.log('[OK] (' + info.length + '):');     info.forEach(m => console.log('  + ' + m));     console.log(''); }
  if (warnings.length > 0) { console.log('[WARN] (' + warnings.length + '):'); warnings.forEach(m => console.log('  ! ' + m)); console.log(''); }
  if (errors.length > 0)   { console.log('[ERROR] (' + errors.length + '):');  errors.forEach(m => console.log('  x ' + m));  console.log(''); }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('[OK] ALL CHECKS PASSED\n'); process.exit(0);
  } else if (errors.length === 0) {
    console.log('[WARN] ' + warnings.length + ' warnings, 0 errors -- safe to render\n'); process.exit(0);
  } else {
    console.log('[ERROR] ' + errors.length + ' errors -- FIX BEFORE RENDERING\n'); process.exit(1);
  }
}

main();
