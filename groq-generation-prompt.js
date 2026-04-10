// -----------------------------------------------------------------------------
// groq-generation-prompt.js
// Generates the full Groq prompt for script + style generation.
// Called by render.yml Groq step. Drop this at repo root.
//
// Usage in render.yml:
//   node -e "
//     const { buildPrompt } = require('./groq-generation-prompt.js');
//     const p = buildPrompt({ dayNum: 50, recentTopics: '...', trending: [] });
//     console.log(p);
//   "
// Or just inline the returned string into the API call.
// -----------------------------------------------------------------------------

const ASHLEY_IDEAS = [
  'The 3-account money system every wealthy person uses',
  'Why your salary is your most dangerous asset in 2026',
  'The 24-hour rule that permanently stops impulse spending',
  'Why renting is not throwing money away -- the actual math',
  'The debt payoff order that saves the most money',
  'What wealthy people do with their first $1,000 vs everyone else',
  'The one tax move that reduces your bill by up to 30% legally',
  'How inflation silently steals 3% of your money every single year',
  'The automatic money system that runs without willpower',
  'Why most budgets fail by week two and the fix that actually works',
  'The investment that has beaten savings accounts every decade for 100 years',
  'Why credit cards can make you rich if you know this one rule',
  'The side hustle that earned nothing for 60 days then paid rent in month 3',
  'How to negotiate your salary when you think you have no leverage',
  'The wealth gap is not about income -- its about what you do with it',
  'Why the stock market is not gambling if you know this one difference',
  'The money habit that separates millionaires from everyone else at age 30',
  'How to make money while you sleep -- and its not what influencers sell',
  'The emergency fund math most people get wrong',
  'Why paying off debt first is wrong for half of people',
  'The compound effect of spending $15/day vs investing it from age 22',
  'What banks do not want you to know about high-yield savings accounts',
  'The one financial decision that changes everything and takes 15 minutes',
  'Why most financial advice was written for people who had pensions',
  'The income streams that work without showing your face or going viral',
  'The net worth number you need at each age to stay on track',
  'Why your car is the single biggest wealth destroyer for most people',
  'The 50/30/20 rule is wrong for low income earners -- here is the fix',
  'What actually happens to your money when you invest in an index fund',
  'The psychological trick that makes saving feel effortless',
  'Why people who earn $200K still go broke -- lifestyle creep explained',
  'The only 3 financial metrics that actually matter and how to track them',
];

// All 66 animation types (51 existing + 15 new from TextOverlayExtensions)
const ALL_ANIMATIONS = [
  // Phase 1 Core
  'fade','pop','slide-left','slide-right','slide-up','slide-down',
  'bounce','zoom-punch','zoom-out','heartbeat','glitch',
  'typewriter','word-highlight','scramble','stagger','multi-line',
  'strike','ellipsis','counter','neon-glow','shimmer','frosted',
  'color-pulse','3d-extrude','caption-bar',
  // Phase 2
  'gradient-text','outlined','mask-reveal','pixel-dissolve','vhs',
  'strobe','pulse-ring','underline-draw','weight-shift','diagonal-wipe',
  'caps','outline','gradient-sweep',
  // Phase 3
  'liquid-drip','text-clip','outline-stroke','split-reveal','blur-in',
  'flip-up','letter-drop','panel-split','kinetic','word-bounce',
  'gradient-shift','outline-fill','color-burn',
  // Phase 4 (new)
  'word-pop','stamp-impact','newspaper-highlight','stacked-giant',
  'kinetic-mixed','diagonal-cascade','magnetic-snap','spotlight-reveal',
  'comic-impact','gold-foil-sweep','neon-flicker','elastic-snap',
  'wave-cascade','ticker-news','rotate-y-flip',
];

// Hook-optimized animations (highest scroll-stopping power)
const HOOK_ANIMATIONS = [
  'zoom-punch','stamp-impact','word-pop','stacked-giant',
  'kinetic-mixed','spotlight-reveal','comic-impact','neon-flicker',
  'elastic-snap','magnetic-snap','glitch','liquid-drip',
];

// Body animations (readable, clear)
const BODY_ANIMATIONS = [
  'stagger','word-bounce','blur-in','split-reveal','fade',
  'flip-up','letter-drop','panel-split','multi-line','gradient-shift',
  'diagonal-cascade','wave-cascade','outline-fill','slide-left','slide-up',
];

// CTA animations (urgent, action-driving)
const CTA_ANIMATIONS = [
  'kinetic','word-bounce','stamp-impact','word-pop','neon-flicker',
  'bounce','zoom-punch','elastic-snap','caps','gold-foil-sweep',
];

// Font pairs -- Groq picks one pair per video
const FONT_PAIRS = [
  { hookFont: 'Anton',   bodyFont: 'Montserrat', name: 'Classic Power' },
  { hookFont: 'Bebas',   bodyFont: 'Archivo',    name: 'Condensed Punch' },
  { hookFont: 'Barlow',  bodyFont: 'Grotesk',    name: 'Modern Sharp' },
  { hookFont: 'Anton',   bodyFont: 'Mono',        name: 'Hacker Data' },
  { hookFont: 'Oswald',  bodyFont: 'Montserrat', name: 'Athletic Strong' },
  { hookFont: 'Barlow',  bodyFont: 'Montserrat', name: 'Editorial Clean' },
];

// Color schemes -- one per video, consistent throughout
const COLOR_SCHEMES = [
  { id: 'A', hook: '#CAFF00', body: '#FFFFFF', alt: '#FFD700', cta: '#CAFF00', name: 'Neon Gold' },
  { id: 'B', hook: '#FF4444', body: '#FFFFFF', alt: '#FFD700', cta: '#FF4444', name: 'Red Alarm' },
  { id: 'C', hook: '#00D4FF', body: '#FFFFFF', alt: '#CAFF00', cta: '#00D4FF', name: 'Ice Blue' },
  { id: 'D', hook: '#FFFFFF', body: '#CAFF00', alt: '#FFD700', cta: '#FF4444', name: 'Inverse' },
  { id: 'E', hook: '#FF9900', body: '#FFFFFF', alt: '#FF4444', cta: '#CAFF00', name: 'Fire Orange' },
  { id: 'F', hook: '#CAFF00', body: '#FF4444', alt: '#FFFFFF', cta: '#CAFF00', name: 'Danger Green' },
];

// Hashtag pool -- Groq picks 4-5 per video
const HASHTAG_POOL = [
  'personalfinance','wealthbuilding','financialfreedom','moneytips',
  'moneyhabits','investing101','sidehustle','passiveincome',
  'makemoneyonline','budgeting','richvswealth','compoundinterest',
  'financialliteracy','wealthmindset','moneymindset','savemoney',
  'debtfree','stockmarket','retirementplanning','incomestreams',
  'affiliatemarketing','moneymoves','getrich','wealthtips',
  'financetok','moneycoach','buildwealth','financialgoals',
];

function buildPrompt({ dayNum, recentTopics, trendingSounds }) {
  const dayId    = 'day' + dayNum;
  const ideaIdx  = dayNum % ASHLEY_IDEAS.length;
  const mainIdea = ASHLEY_IDEAS[ideaIdx];
  const extraIdea = ASHLEY_IDEAS[(ideaIdx + 11) % ASHLEY_IDEAS.length];

  const trendingCtx = trendingSounds && trendingSounds.length > 0
    ? 'TRENDING SOUNDS THIS WEEK:\n' + trendingSounds.slice(0, 5).map(function(s) { return '- ' + s.title + ' by ' + s.artist; }).join('\n')
    : '';

  return 'You are Ashley, AI creative director for @DailyWealthBuilding -- a faceless automated personal finance YouTube Shorts channel.\n\n' +

  'YOUR MISSION: Generate a complete, scroll-stopping video script + full visual style config.\n\n' +

  'RECENT TOPICS USED (do NOT repeat these topics):\n' +
  (recentTopics || 'none yet') + '\n\n' +

  (trendingCtx ? trendingCtx + '\n\n' : '') +

  'IDEAS TO BUILD ON (pick one or fuse two):\n' +
  '1. ' + mainIdea + '\n' +
  '2. ' + extraIdea + '\n\n' +

  '=== CONTENT RULES ===\n' +
  '- Target: Level 4 Unaware Audience (they do not know they have a money problem yet)\n' +
  '- Hook MUST work without sound -- pure visual pattern interrupt\n' +
  '- Max 2 lines per overlay, 1 idea per overlay, never more\n' +
  '- Open loop: hook creates a question only answered at 80% watch time\n' +
  '- Must include a specific number (e.g. "3 habits", "$100/month", "67%")\n' +
  '- Identity targeting when possible ("If you earn under X", "People born before Y")\n' +
  '- CTA must create personal stake ("Comment if your bank has ever paid you more than 1%")\n' +
  '- No income promises ("you will earn $X"). Frame as education.\n' +
  '- Loop potential: last overlay should echo the hook so video loops naturally\n\n' +

  '=== OVERLAY TIMING (900 frames = 30 seconds at 30fps) ===\n' +
  '[0] HOOK:   startFrame 0,   endFrame 90  (3s) -- ONE sentence. Pure pattern interrupt.\n' +
  '[1] TRUTH:  startFrame 90,  endFrame 270 (6s) -- The uncomfortable reality they were not told.\n' +
  '[2] PROOF:  startFrame 270, endFrame 450 (6s) -- Data, contrast, or personal story frame.\n' +
  '[3] SYSTEM: startFrame 450, endFrame 720 (9s) -- Simple actionable 3-step framework.\n' +
  '[4] CTA:    startFrame 720, endFrame 900 (6s) -- Comment bait + follow ask + identity trigger.\n\n' +

  '=== ANIMATION SELECTION ===\n' +
  'HOOK animations (pick 1): ' + HOOK_ANIMATIONS.join(', ') + '\n' +
  'BODY animations (pick 1 per body overlay, never repeat same one twice): ' + BODY_ANIMATIONS.join(', ') + '\n' +
  'CTA animations (pick 1): ' + CTA_ANIMATIONS.join(', ') + '\n\n' +

  '=== FONT PAIRS (pick ONE pair, use hookFont for hook+CTA, bodyFont for all others) ===\n' +
  FONT_PAIRS.map(function(p) { return p.name + ': hookFont=' + p.hookFont + ', bodyFont=' + p.bodyFont; }).join('\n') + '\n\n' +

  '=== COLOR SCHEMES (pick ONE scheme, use consistently) ===\n' +
  COLOR_SCHEMES.map(function(s) {
    return s.name + ' (' + s.id + '): hook=' + s.hook + ', body=' + s.body + ', alt=' + s.alt + ', cta=' + s.cta;
  }).join('\n') + '\n\n' +

  '=== TEXT SIZE RULES ===\n' +
  '- Hook fontSize: 82-95px (varies by animation type -- stacked-giant uses 110px+ internally)\n' +
  '- Truth/Proof fontSize: 68-80px\n' +
  '- System fontSize: 64-74px (most text, needs to be readable)\n' +
  '- CTA fontSize: 76-88px\n' +
  '- NEVER use the same fontSize twice in one video\n' +
  '- Include letterSpacing: "0.02em" to "0.06em" on hook and CTA overlays\n\n' +

  '=== STROKE RULES ===\n' +
  '- Anton/Bebas/Barlow/Oswald fonts: stroke size 3, color #000000\n' +
  '- Montserrat/Archivo/Grotesk/Mono fonts: stroke size 2, color #000000\n' +
  '- EVERY overlay must have a stroke object\n\n' +

  '=== B-ROLL QUERIES (6 required) ===\n' +
  '- Query 1: matches HOOK visually -- something SHOCKING or surprising, not generic\n' +
  '- Query 2: matches TRUTH -- shows the PAIN POINT being described\n' +
  '- Query 3: matches PROOF -- CONTRAST visual (broke vs wealthy, before vs after)\n' +
  '- Query 4: matches SYSTEM -- someone TAKING ACTION (planning, working, investing)\n' +
  '- Query 5: ASPIRATION -- the outcome they want (freedom, luxury, success)\n' +
  '- Query 6: ENERGY -- city life, people reacting, trending visual\n' +
  '- Each query MUST end with "vertical"\n' +
  '- Be SPECIFIC: "person shocked checking phone paycheck vertical" not "money vertical"\n' +
  '- NEVER use: "finance vertical", "money vertical", "wealth vertical" -- too generic\n\n' +

  '=== HASHTAG POOL (pick 4-5 most relevant) ===\n' +
  HASHTAG_POOL.join(', ') + ', day' + dayNum + 'of90\n\n' +

  '=== MUSIC MOOD (pick one) ===\n' +
  'punchy, motivational, confident, dramatic, focused, rebellious, uplifting, emotional, epic\n\n' +

  '=== OUTPUT FORMAT ===\n' +
  'Return ONLY valid JSON. No markdown. No backticks. No explanation. No comments in JSON.\n\n' +
  '{\n' +
  '  "title": "internal short title",\n' +
  '  "musicMood": "punchy",\n' +
  '  "fontPair": "Classic Power",\n' +
  '  "hookFont": "Anton",\n' +
  '  "bodyFont": "Montserrat",\n' +
  '  "colorScheme": "A",\n' +
  '  "hookColor": "#CAFF00",\n' +
  '  "bodyColor": "#FFFFFF",\n' +
  '  "altColor": "#FFD700",\n' +
  '  "ctaColor": "#CAFF00",\n' +
  '  "accentColor": "#CAFF00",\n' +
  '  "bRollQueries": [\n' +
  '    "person shocked checking bank account phone vertical",\n' +
  '    "person stressed bills empty wallet apartment vertical",\n' +
  '    "wealthy person vs broke person car comparison vertical",\n' +
  '    "person laptop investing planning financial goals vertical",\n' +
  '    "person freedom city rooftop sunrise success vertical",\n' +
  '    "young people reacting surprised phone notification vertical"\n' +
  '  ],\n' +
  '  "overlays": [\n' +
  '    {\n' +
  '      "text": "HOOK TEXT HERE",\n' +
  '      "font": "Anton",\n' +
  '      "color": "#CAFF00",\n' +
  '      "stroke": {"size": 3, "color": "#000000"},\n' +
  '      "animation": "stamp-impact",\n' +
  '      "startFrame": 0,\n' +
  '      "endFrame": 90,\n' +
  '      "position": "middle",\n' +
  '      "fontSize": 88,\n' +
  '      "letterSpacing": "0.03em"\n' +
  '    },\n' +
  '    {\n' +
  '      "text": "Truth text here\\nmulti-line supported",\n' +
  '      "font": "Montserrat",\n' +
  '      "color": "#FFFFFF",\n' +
  '      "stroke": {"size": 2, "color": "#000000"},\n' +
  '      "animation": "word-bounce",\n' +
  '      "startFrame": 90,\n' +
  '      "endFrame": 270,\n' +
  '      "position": "middle",\n' +
  '      "fontSize": 76\n' +
  '    },\n' +
  '    {\n' +
  '      "text": "Proof / data / contrast",\n' +
  '      "font": "Montserrat",\n' +
  '      "color": "#FFD700",\n' +
  '      "stroke": {"size": 2, "color": "#000000"},\n' +
  '      "animation": "stagger",\n' +
  '      "startFrame": 270,\n' +
  '      "endFrame": 450,\n' +
  '      "position": "middle",\n' +
  '      "fontSize": 72\n' +
  '    },\n' +
  '    {\n' +
  '      "text": "The system:\\nStep 1\\nStep 2\\nStep 3",\n' +
  '      "font": "Montserrat",\n' +
  '      "color": "#FFFFFF",\n' +
  '      "stroke": {"size": 2, "color": "#000000"},\n' +
  '      "animation": "blur-in",\n' +
  '      "startFrame": 450,\n' +
  '      "endFrame": 720,\n' +
  '      "position": "middle",\n' +
  '      "fontSize": 68\n' +
  '    },\n' +
  '    {\n' +
  '      "text": "Comment if [identity trigger] 👇\\nFollow for the full breakdown.",\n' +
  '      "font": "Anton",\n' +
  '      "color": "#CAFF00",\n' +
  '      "stroke": {"size": 3, "color": "#000000"},\n' +
  '      "animation": "word-pop",\n' +
  '      "startFrame": 720,\n' +
  '      "endFrame": 900,\n' +
  '      "position": "bottom-center",\n' +
  '      "fontSize": 84,\n' +
  '      "letterSpacing": "0.02em"\n' +
  '    }\n' +
  '  ],\n' +
  '  "youtubeTitle": "Scroll-Stopping Title | Day ' + dayNum + '/90 | Daily Wealth Building",\n' +
  '  "youtubeDescription": "Day ' + dayNum + ' of 90 -- [description 150-250 words with arrow bullets]\\n\\n🔔 Subscribe for daily wealth building content\\n@DailyWealthBuilding\\n\\n#DailyWealthBuilding #hashtag1 #hashtag2 #hashtag3",\n' +
  '  "tiktokCaption": "[Punchy caption max 150 chars ends with emoji] 👇 #tag1 #tag2 #tag3 #day' + dayNum + 'of90",\n' +
  '  "pinnedComment": "[Key insight that adds value and triggers algorithm keyword]"\n' +
  '}';
}

module.exports = { buildPrompt, ASHLEY_IDEAS, ALL_ANIMATIONS, HASHTAG_POOL, FONT_PAIRS, COLOR_SCHEMES };
