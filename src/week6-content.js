// -----------------------------------------------------------------------------
// src/week6-content.js -- DWB Week 6 -- Days 36-42
// Theme: Money Myths & The Wealth Gap
// Export: default (weeks 5-6 use default export)
//
// v3 -- 6 bRollQueries per video (aligned to overlay content)
//       Removed pexelsSearchTerms (replaced by bRollQueries)
//       No highlight-box animation anywhere
//       Stroke on every overlay
//       Fonts/sizes consistent with v7 style guide
//
// Overlay timing (900 frames = 30s):
//   [0] HOOK          0 -  90  (3.0s)
//   [1] EXPAND       90 - 270  (6.0s)
//   [2] PAIN        270 - 450  (6.0s)
//   [3] PATTERN     450 - 540  (3.0s)
//   [4] EXPOSE      540 - 630  (3.0s)
//   [5] FORMULA     630 - 720  (3.0s)
//   [6] PROOF       720 - 810  (3.0s)
//   [7] CTA         810 - 900  (3.0s)
// -----------------------------------------------------------------------------

export default [

  // -- DAY 36 ------------------------------------------------------------------
  {
    id: "day36",
    filename: "day36_final.mp4",
    music: "day36.mp3",
    musicMood: "punchy",
    title: "Why Your Savings Account Is Losing You Money",
    bRollQueries: [
      "person shocked checking bank account phone vertical",
      "coins money jar savings piggy bank close vertical",
      "inflation grocery store prices expensive shopping vertical",
      "bank building corporate finance institution vertical",
      "person investing laptop stock market success vertical",
      "person celebrating financial freedom city rooftop vertical"
    ],
    overlays: [
      {
        text: "YOUR SAVINGS ACCOUNT\nIS LOSING YOU MONEY.",
        font: "Anton",
        color: "#CAFF00",
        stroke: { size: 3, color: "#000000" },
        animation: "zoom-punch",
        startFrame: 0,
        endFrame: 90,
        position: "middle",
        fontSize: 86,
        letterSpacing: "0.02em"
      },
      {
        text: "You've been told\nsaving money = smart.\nThat's only half the truth.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "split-reveal",
        startFrame: 90,
        endFrame: 270,
        position: "middle",
        fontSize: 76
      },
      {
        text: "Meanwhile inflation\neats your savings\nevery single year.\n3% gone. Silently.",
        font: "Montserrat",
        color: "#FF4444",
        stroke: { size: 2, color: "#000000" },
        animation: "word-bounce",
        startFrame: 270,
        endFrame: 450,
        position: "middle",
        fontSize: 74
      },
      {
        text: "Your bank earns MORE\nfrom YOUR money\nthan you ever will.",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "glitch",
        startFrame: 450,
        endFrame: 540,
        position: "middle",
        fontSize: 82
      },
      {
        text: "The formula:\nKeep 3 months expenses\nas emergency fund.\nInvest everything else.",
        font: "Montserrat",
        color: "#CAFF00",
        stroke: { size: 2, color: "#000000" },
        animation: "stagger",
        startFrame: 540,
        endFrame: 720,
        position: "middle",
        fontSize: 72
      },
      {
        text: "Wealthy people keep\nsavings lean.\nThey put money to work.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "blur-in",
        startFrame: 720,
        endFrame: 810,
        position: "middle",
        fontSize: 76
      },
      {
        text: "Is your money working\nFOR you or AGAINST you?\nComment YES or NO 👇",
        font: "Anton",
        color: "#CAFF00",
        stroke: { size: 3, color: "#000000" },
        animation: "word-bounce",
        startFrame: 810,
        endFrame: 900,
        position: "bottom-center",
        fontSize: 82
      }
    ],
    tiktokCaption: "Your savings account feels safe -- but that feeling costs you thousands 💸 Is your money working FOR you or AGAINST you? Comment YES or NO 👇 #savingsaccount #moneytips #wealthbuilding #day36",
    youtubeTitle: "Why Your Savings Account Is Losing You Money | Day 36/90 | Daily Wealth Building",
    youtubeDescription: "Day 36 of 90 -- Why 'just save more' is keeping you financially stuck and what to do instead.\n\n→ How inflation silently erodes your savings every year\n→ How banks profit from your money while you earn pennies\n→ The 3-month emergency fund rule\n→ What to do with money beyond your safety net\n→ The mindset shift from saving to investing\n\n🔔 Subscribe for daily wealth building content\n@DailyWealthBuilding\n\n#DailyWealthBuilding #savingsaccount #moneytips #wealthbuilding #financialliteracy",
    pinnedComment: "Saving is not bad -- saving ONLY is. Keep 3 months of expenses liquid, put everything else to work. Your bank is already investing your money. Why aren't you?"
  },

  // -- DAY 37 ------------------------------------------------------------------
  {
    id: "day37",
    filename: "day37_final.mp4",
    music: "day37.mp3",
    musicMood: "motivational",
    title: "If You Earn Under 1K Per Month Stop These Habits",
    bRollQueries: [
      "young person empty wallet broke stressed urban vertical",
      "person checking phone empty bank account notification vertical",
      "coffee shop spending lifestyle daily expenses vertical",
      "subscription apps phone screen cancel services vertical",
      "person budget planning notebook pen table vertical",
      "person success city street confident walking vertical"
    ],
    overlays: [
      {
        text: "EARNING UNDER\n$1K/MONTH?\nSTOP THESE HABITS.",
        font: "Anton",
        color: "#FF9900",
        stroke: { size: 3, color: "#000000" },
        animation: "stamp-impact",
        startFrame: 0,
        endFrame: 90,
        position: "middle",
        fontSize: 84,
        letterSpacing: "0.02em"
      },
      {
        text: "At this income level\nevery bad habit costs\nyou months of progress.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "blur-in",
        startFrame: 90,
        endFrame: 270,
        position: "middle",
        fontSize: 76
      },
      {
        text: "You work hard.\nNothing is left\nby month end.\nEvery. Single. Month.",
        font: "Montserrat",
        color: "#FF4444",
        stroke: { size: 2, color: "#000000" },
        animation: "word-bounce",
        startFrame: 270,
        endFrame: 450,
        position: "middle",
        fontSize: 74
      },
      {
        text: "What's eating it:\nSubscriptions.\nEating out.\nImpulse purchases.",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "stagger",
        startFrame: 450,
        endFrame: 540,
        position: "middle",
        fontSize: 78
      },
      {
        text: "The formula:\nTrack every expense\nfor 7 days straight.\nCut the bottom 3.",
        font: "Montserrat",
        color: "#CAFF00",
        stroke: { size: 2, color: "#000000" },
        animation: "split-reveal",
        startFrame: 540,
        endFrame: 720,
        position: "middle",
        fontSize: 72
      },
      {
        text: "People who escaped\nthis income range\nspent less BEFORE\nthey earned more.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "fade",
        startFrame: 720,
        endFrame: 810,
        position: "middle",
        fontSize: 74
      },
      {
        text: "What do you spend on\nthat you KNOW\nyou shouldn't? Drop it 👇",
        font: "Anton",
        color: "#FF9900",
        stroke: { size: 3, color: "#000000" },
        animation: "word-bounce",
        startFrame: 810,
        endFrame: 900,
        position: "bottom-center",
        fontSize: 80
      }
    ],
    tiktokCaption: "Earning under $1K/month -- these habits are exactly why nothing is left at month end 🚫 What's the ONE thing you spend on that you KNOW you shouldn't? Drop it below 👇 #budgeting #moneytips #financialfreedom #day37",
    youtubeTitle: "If You Earn Under $1K Per Month Stop These Habits | Day 37/90 | Daily Wealth Building",
    youtubeDescription: "Day 37 of 90 -- Why earning more won't fix anything until you plug the leaks first.\n\n→ The hidden expenses draining low-income earners monthly\n→ Why subscriptions and daily eating out are silent killers\n→ The 7-day expense tracking challenge\n→ How to cut the bottom 3 expenses without suffering\n→ Why spending habits always change before income does\n\n🔔 Subscribe for daily wealth building content\n@DailyWealthBuilding\n\n#DailyWealthBuilding #budgeting #moneytips #financialliteracy #wealthbuilding",
    pinnedComment: "Earning more without fixing habits just means losing more, faster. Track everything for 7 days -- you'll find at least 3 things you forgot you were paying for."
  },

  // -- DAY 38 ------------------------------------------------------------------
  {
    id: "day38",
    filename: "day38_final.mp4",
    music: "day38.mp3",
    musicMood: "confident",
    title: "Rich People Don't Save Money -- Here's What They Do Instead",
    bRollQueries: [
      "wealthy businessman confident city skyscraper view vertical",
      "stock market investment portfolio growth chart vertical",
      "luxury penthouse apartment interior modern vertical",
      "person laptop investing automating money system vertical",
      "drone shot aerial city financial district vertical",
      "person celebrating wealth success freedom vertical"
    ],
    overlays: [
      {
        text: "RICH PEOPLE\nDON'T SAVE MONEY.",
        font: "Anton",
        color: "#4499FF",
        stroke: { size: 3, color: "#000000" },
        animation: "zoom-punch",
        startFrame: 0,
        endFrame: 90,
        position: "middle",
        fontSize: 90,
        letterSpacing: "0.02em"
      },
      {
        text: "This doesn't mean\nthey spend everything.\nThey do something\ncompletely different.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "split-reveal",
        startFrame: 90,
        endFrame: 270,
        position: "middle",
        fontSize: 74
      },
      {
        text: "Idle money = losing money.\nEvery day it sits still\nis a day it shrinks.",
        font: "Montserrat",
        color: "#FF4444",
        stroke: { size: 2, color: "#000000" },
        animation: "word-bounce",
        startFrame: 270,
        endFrame: 450,
        position: "middle",
        fontSize: 76
      },
      {
        text: "They pay themselves FIRST.\nThen deploy capital.\nNot the other way around.",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "glitch",
        startFrame: 450,
        endFrame: 540,
        position: "middle",
        fontSize: 78
      },
      {
        text: "The formula:\nEarn → Invest first\n→ Live on what's left.\nNot the other way.",
        font: "Montserrat",
        color: "#CAFF00",
        stroke: { size: 2, color: "#000000" },
        animation: "stagger",
        startFrame: 540,
        endFrame: 720,
        position: "middle",
        fontSize: 72
      },
      {
        text: "Every wealthy person\ninvests BEFORE they enjoy.\nNot after.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "blur-in",
        startFrame: 720,
        endFrame: 810,
        position: "middle",
        fontSize: 76
      },
      {
        text: "Are you saving money\nor deploying it?\nTell me below 👇",
        font: "Anton",
        color: "#4499FF",
        stroke: { size: 3, color: "#000000" },
        animation: "kinetic",
        startFrame: 810,
        endFrame: 900,
        position: "bottom-center",
        fontSize: 82
      }
    ],
    tiktokCaption: "Rich people don't just save money -- they deploy it 🔑 Are you saving money or deploying it? Tell me your approach below 👇 #investing #wealthmindset #richmindset #moneytips #day38",
    youtubeTitle: "Rich People Don't Save Money -- Here's What They Do Instead | Day 38/90 | Daily Wealth Building",
    youtubeDescription: "Day 38 of 90 -- The difference between saving money and deploying capital, and why it changes everything.\n\n→ Why idle money is losing money every day\n→ The pay yourself first method wealthy people use\n→ The invest-before-you-spend framework\n→ How to start deploying even tiny amounts\n→ Why you cannot save your way to financial freedom\n\n🔔 Subscribe for daily wealth building content\n@DailyWealthBuilding\n\n#DailyWealthBuilding #investing #wealthmindset #moneytips #financialfreedom",
    pinnedComment: "The formula is: earn → invest first → live on the rest. Not earn → spend → invest whatever's left. That ordering is everything."
  },

  // -- DAY 39 ------------------------------------------------------------------
  {
    id: "day39",
    filename: "day39_final.mp4",
    music: "day39.mp3",
    musicMood: "dramatic",
    title: "Getting a Raise Won't Make You Rich -- Here's Why",
    bRollQueries: [
      "person buying luxury car dealership upgrade lifestyle vertical",
      "expensive shopping designer bags retail store vertical",
      "person moving into bigger apartment upgrade lifestyle vertical",
      "salary raise celebration office work vertical",
      "person freezing expenses minimalist lifestyle discipline vertical",
      "person investing future wealth mindset vertical"
    ],
    overlays: [
      {
        text: "A RAISE WON'T\nMAKE YOU RICH.",
        font: "Anton",
        color: "#FF44FF",
        stroke: { size: 3, color: "#000000" },
        animation: "stamp-impact",
        startFrame: 0,
        endFrame: 90,
        position: "middle",
        fontSize: 90,
        letterSpacing: "0.02em"
      },
      {
        text: "Most people get a raise\nand immediately upgrade\ntheir lifestyle to match.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "blur-in",
        startFrame: 90,
        endFrame: 270,
        position: "middle",
        fontSize: 76
      },
      {
        text: "New car. Bigger place.\nBetter phone.\nSame empty bank account.",
        font: "Montserrat",
        color: "#FF4444",
        stroke: { size: 2, color: "#000000" },
        animation: "word-bounce",
        startFrame: 270,
        endFrame: 450,
        position: "middle",
        fontSize: 76
      },
      {
        text: "It's called lifestyle inflation.\nIt eats every raise\nbefore you feel it.",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "glitch",
        startFrame: 450,
        endFrame: 540,
        position: "middle",
        fontSize: 78
      },
      {
        text: "The formula:\nFreeze your lifestyle.\nInvest 100% of\nevery future raise.",
        font: "Montserrat",
        color: "#CAFF00",
        stroke: { size: 2, color: "#000000" },
        animation: "stagger",
        startFrame: 540,
        endFrame: 720,
        position: "middle",
        fontSize: 72
      },
      {
        text: "Income up. Lifestyle flat.\nThe gap between them?\nThat's your wealth.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "split-reveal",
        startFrame: 720,
        endFrame: 810,
        position: "middle",
        fontSize: 76
      },
      {
        text: "Did your last raise\nchange your finances?\nHonest answers 👇",
        font: "Anton",
        color: "#FF44FF",
        stroke: { size: 3, color: "#000000" },
        animation: "word-bounce",
        startFrame: 810,
        endFrame: 900,
        position: "bottom-center",
        fontSize: 82
      }
    ],
    tiktokCaption: "Getting a raise won't make you rich if lifestyle inflation eats it first ❌ Did your last raise actually improve your financial position? Honest answers only 👇 #lifestyleinflation #wealthbuilding #moneymindset #day39",
    youtubeTitle: "Getting a Raise Won't Make You Rich -- Here's Why | Day 39/90 | Daily Wealth Building",
    youtubeDescription: "Day 39 of 90 -- Why lifestyle inflation destroys every raise before you feel it, and how to break the cycle.\n\n→ What lifestyle inflation is and how to spot it\n→ Why I'll invest when I earn more never works\n→ The freeze your lifestyle strategy\n→ How to invest 100% of every future raise automatically\n→ The gap between income and expenses is your real wealth\n\n🔔 Subscribe for daily wealth building content\n@DailyWealthBuilding\n\n#DailyWealthBuilding #lifestyleinflation #wealthbuilding #moneymindset #salary",
    pinnedComment: "Wealth = the gap between what you earn and what you spend. Every raise widens that gap -- unless you upgrade your lifestyle to close it again. Choose wisely."
  },

  // -- DAY 40 ------------------------------------------------------------------
  {
    id: "day40",
    filename: "day40_final.mp4",
    music: "day40.mp3",
    musicMood: "focused",
    title: "The Investing Method Most People Completely Overlook",
    bRollQueries: [
      "person laptop investing coffee shop calm focused vertical",
      "stock market graph line steady growth long term vertical",
      "calendar monthly automatic investment schedule vertical",
      "compound interest math equation numbers growing vertical",
      "index fund ETF investment portfolio diversified vertical",
      "person financial freedom outdoors success morning vertical"
    ],
    overlays: [
      {
        text: "THE INVESTING METHOD\nMOST PEOPLE\nCOMPLETELY OVERLOOK.",
        font: "Anton",
        color: "#FF6600",
        stroke: { size: 3, color: "#000000" },
        animation: "zoom-punch",
        startFrame: 0,
        endFrame: 90,
        position: "middle",
        fontSize: 82,
        letterSpacing: "0.02em"
      },
      {
        text: "Everyone chases crypto,\nstocks, side hustles.\nMeanwhile this\nworks quietly.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "split-reveal",
        startFrame: 90,
        endFrame: 270,
        position: "middle",
        fontSize: 74
      },
      {
        text: "Most people think\ninvesting requires\nlarge capital.\nSo they wait.\nYears pass.",
        font: "Montserrat",
        color: "#FF4444",
        stroke: { size: 2, color: "#000000" },
        animation: "word-bounce",
        startFrame: 270,
        endFrame: 450,
        position: "middle",
        fontSize: 74
      },
      {
        text: "The truth:\nTime IN the market\nbeats TIMING the market.\nAlways.",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "glitch",
        startFrame: 450,
        endFrame: 540,
        position: "middle",
        fontSize: 78
      },
      {
        text: "The method: DCA.\nBuy a fixed amount\nevery month.\nRegardless of price.",
        font: "Montserrat",
        color: "#CAFF00",
        stroke: { size: 2, color: "#000000" },
        animation: "stagger",
        startFrame: 540,
        endFrame: 720,
        position: "middle",
        fontSize: 72
      },
      {
        text: "Dollar Cost Averaging\nremoves emotion.\nYou win in dips.\nYou win in peaks.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "blur-in",
        startFrame: 720,
        endFrame: 810,
        position: "middle",
        fontSize: 74
      },
      {
        text: "Investing consistently\nor waiting for the\n'right time'? 👇",
        font: "Anton",
        color: "#FF6600",
        stroke: { size: 3, color: "#000000" },
        animation: "kinetic",
        startFrame: 810,
        endFrame: 900,
        position: "bottom-center",
        fontSize: 82
      }
    ],
    tiktokCaption: "The boring investing method that actually works and most people overlook 👀 Are you investing consistently or still waiting for the right time? 👇 #indexfunds #dca #investing101 #wealthbuilding #day40",
    youtubeTitle: "The Investing Method Most People Completely Overlook | Day 40/90 | Daily Wealth Building",
    youtubeDescription: "Day 40 of 90 -- Dollar Cost Averaging explained and why it beats every complicated strategy.\n\n→ Why waiting for the right time destroys years of growth\n→ What Dollar Cost Averaging (DCA) actually is\n→ How DCA removes emotion from investing entirely\n→ How to set it up automatically in under 10 minutes\n→ Why boring consistent investing beats exciting risky bets\n\n🔔 Subscribe for daily wealth building content\n@DailyWealthBuilding\n\n#DailyWealthBuilding #indexfunds #DCA #investing101 #wealthbuilding #compoundinterest",
    pinnedComment: "DCA = buy a fixed amount every single month, no matter what the market is doing. You win when prices drop (you buy more units) and you win when it rises (your units gain value). Simple. Boring. It works."
  },

  // -- DAY 41 ------------------------------------------------------------------
  {
    id: "day41",
    filename: "day41_final.mp4",
    music: "day41.mp3",
    musicMood: "rebellious",
    title: "3 Money Lies Your Parents Taught You",
    bRollQueries: [
      "parent child family talking advice home vertical",
      "student graduation university degree diploma vertical",
      "job office corporate employee desk salary vertical",
      "debt credit card bills stressed person vertical",
      "multiple income streams laptop phone side hustle vertical",
      "person unlearning reading book new mindset vertical"
    ],
    overlays: [
      {
        text: "3 MONEY LIES YOUR\nPARENTS TAUGHT YOU.",
        font: "Anton",
        color: "#00AAFF",
        stroke: { size: 3, color: "#000000" },
        animation: "zoom-punch",
        startFrame: 0,
        endFrame: 90,
        position: "middle",
        fontSize: 86,
        letterSpacing: "0.02em"
      },
      {
        text: "They weren't wrong.\nThey taught what they knew.\nBut the rules changed.\nThe advice didn't.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "blur-in",
        startFrame: 90,
        endFrame: 270,
        position: "middle",
        fontSize: 74
      },
      {
        text: "Lie 1:\n'Get a stable job\nand save for retirement.'\nPensions barely exist now.",
        font: "Montserrat",
        color: "#FF4444",
        stroke: { size: 2, color: "#000000" },
        animation: "word-bounce",
        startFrame: 270,
        endFrame: 450,
        position: "middle",
        fontSize: 72
      },
      {
        text: "Lie 2: 'Debt is always bad.'\nGood debt builds assets.\nBad debt buys things.",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "glitch",
        startFrame: 450,
        endFrame: 540,
        position: "middle",
        fontSize: 76
      },
      {
        text: "Lie 3:\n'One income is enough.'\nThe wealthy average\n7 income streams.",
        font: "Montserrat",
        color: "#CAFF00",
        stroke: { size: 2, color: "#000000" },
        animation: "stagger",
        startFrame: 540,
        endFrame: 720,
        position: "middle",
        fontSize: 72
      },
      {
        text: "The rules changed.\nJob security is gone.\nOne income isn't enough.\nUnlearning is step one.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "split-reveal",
        startFrame: 720,
        endFrame: 810,
        position: "middle",
        fontSize: 72
      },
      {
        text: "Which lie were you\ntold growing up?\nComment 1, 2 or 3 👇",
        font: "Anton",
        color: "#00AAFF",
        stroke: { size: 3, color: "#000000" },
        animation: "word-bounce",
        startFrame: 810,
        endFrame: 900,
        position: "bottom-center",
        fontSize: 82
      }
    ],
    tiktokCaption: "3 money lies your parents taught you -- they weren't wrong, the rules just changed 🚨 Which of these were you told growing up? Comment 1, 2 or 3 below 👇 #moneymindset #financialliteracy #wealthbuilding #day41",
    youtubeTitle: "3 Money Lies Your Parents Taught You | Day 41/90 | Daily Wealth Building",
    youtubeDescription: "Day 41 of 90 -- Three pieces of financial advice that made sense decades ago but are hurting you today.\n\n→ Why get a stable job and save is broken advice in 2026\n→ The difference between good debt and bad debt\n→ Why one income stream is now a liability, not a plan\n→ The new rules of wealth building in the modern economy\n→ How to identify which outdated belief is holding you back\n\n🔔 Subscribe for daily wealth building content\n@DailyWealthBuilding\n\n#DailyWealthBuilding #moneymindset #financialliteracy #multipleincomestreams #wealthbuilding",
    pinnedComment: "They taught us to survive in an economy that no longer exists. The rules changed. Job security is gone, pensions are rare, one income is not enough. Unlearning is the first step."
  },

  // -- DAY 42 ------------------------------------------------------------------
  {
    id: "day42",
    filename: "day42_final.mp4",
    music: "day42.mp3",
    musicMood: "uplifting",
    title: "How I Started Earning Online From Zero -- The Exact Method",
    bRollQueries: [
      "person laptop working home office online income vertical",
      "affiliate marketing phone notification payment received vertical",
      "content creator filming faceless channel vertical",
      "link in bio social media affiliate earning vertical",
      "person financial independence digital nomad cafe vertical",
      "person celebrating first online income success vertical"
    ],
    overlays: [
      {
        text: "FROM $0 TO EARNING\nONLINE --\nTHE METHOD.",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "zoom-punch",
        startFrame: 0,
        endFrame: 90,
        position: "middle",
        fontSize: 88,
        letterSpacing: "0.02em"
      },
      {
        text: "Not a course.\nNot a coach.\nA method you can start\ntoday for free.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "split-reveal",
        startFrame: 90,
        endFrame: 270,
        position: "middle",
        fontSize: 76
      },
      {
        text: "Everyone says\n'make money online'\nbut nobody shows\nthe actual steps.",
        font: "Montserrat",
        color: "#FF4444",
        stroke: { size: 2, color: "#000000" },
        animation: "word-bounce",
        startFrame: 270,
        endFrame: 450,
        position: "middle",
        fontSize: 74
      },
      {
        text: "The truth:\nAffiliate marketing lets\nyou earn without\nbuilding a product.",
        font: "Anton",
        color: "#CAFF00",
        stroke: { size: 3, color: "#000000" },
        animation: "glitch",
        startFrame: 450,
        endFrame: 540,
        position: "middle",
        fontSize: 76
      },
      {
        text: "The formula:\nNiche → Content\n→ Recommend products\n→ Earn commissions.",
        font: "Montserrat",
        color: "#FFD700",
        stroke: { size: 2, color: "#000000" },
        animation: "stagger",
        startFrame: 540,
        endFrame: 720,
        position: "middle",
        fontSize: 72
      },
      {
        text: "No upfront cost.\nNo inventory.\nNo customer service.\nJust content and links.",
        font: "Montserrat",
        color: "#FFFFFF",
        stroke: { size: 2, color: "#000000" },
        animation: "blur-in",
        startFrame: 720,
        endFrame: 810,
        position: "middle",
        fontSize: 74
      },
      {
        text: "What's stopping you\nfrom starting online\nincome today? 👇",
        font: "Anton",
        color: "#FFD700",
        stroke: { size: 3, color: "#000000" },
        animation: "kinetic",
        startFrame: 810,
        endFrame: 900,
        position: "bottom-center",
        fontSize: 82
      }
    ],
    tiktokCaption: "From $0 to earning online -- the actual method, not the hype 🔥 What's the ONE thing stopping you from starting right now? Drop your honest answer 👇 #affiliatemarketing #makemoneyonline #passiveincome #day42",
    youtubeTitle: "How I Started Earning Online From Zero -- The Exact Method | Day 42/90 | Daily Wealth Building",
    youtubeDescription: "Day 42 of 90 -- Week 6 finale. The exact affiliate marketing method that costs nothing to start.\n\n→ Why affiliate marketing works without a product or audience\n→ The 4-step formula: niche → content → recommend → earn\n→ How to find legitimate free affiliate programs today\n→ Why this model has zero upfront cost\n→ Week 6 recap and what's coming in Week 7\n\n🔔 Subscribe for daily wealth building content\n@DailyWealthBuilding\n\n#DailyWealthBuilding #affiliatemarketing #makemoneyonline #passiveincome #sidehustle #day42of90",
    pinnedComment: "Affiliate marketing = recommend products you already believe in, earn a commission when someone buys through your link. No product. No inventory. No customer service. Just content and consistency."
  },

];
