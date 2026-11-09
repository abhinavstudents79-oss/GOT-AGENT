export interface CustomAiVideoScene {
  title: string;
  narration: string;
  visualType:
    | 'nuclear_city'
    | 'shelter_indoors'
    | 'space_cosmos'
    | 'nature_ecosystem'
    | 'medical_biology'
    | 'tech_network'
    | 'finance_growth'
    | 'character_story';
  accentColor: string;
  keyObjects: string[];
}

export interface CustomAiVideoSpec {
  title?: string;
  badge?: string;
  theme?: string;
  scenes?: CustomAiVideoScene[];
  keywords?: string[];
  chapters?: string[];
  subtitles?: string[];
  metrics?: Array<{ label: string; value: number }>;
}

/**
 * Detects whenever the user asks GOT Agent to create an animated/animative HTML5/2D video
 * or turn a prompt/script into a playable video.
 */
export function isHtmlVideoRequest(prompt: string, agentMode?: string): boolean {
  if (agentMode === 'HTML Video Studio') return true;
  const clean = String(prompt || '').trim().toLowerCase();
  if (!clean) return false;

  return (
    /\b(html\s*5?\s*(type\s*)?(video|animation|animative|canvas)|animat(e|ed|ive|ion)\s+(html\s*)?(type\s*)?video|(create|make|build|generate|give)\s+(me\s+)?(an?\s+)?(2d\s+|html\s*|canvas\s*|animat(e|ed|ive|ion)\s*)+(type\s*)?(video|animation|explainer|movie|clip)|video\s*in\s*html|canvas\s*video|2d\s*(html\s*)?(type\s*)?(video|canvas|animation|animative)|html\s+canva+s\s+video|playable\s+(2d\s+)?html\s*video|turn\s+(this|my|the|past|previous)\s+(prompt|chat|topic|story|script)\s+into\s+(an?\s+)?(2d\s+|html\s*)?video)\b/i.test(
      clean
    ) ||
    ((clean.includes('html') || clean.includes('2d') || clean.includes('canvas') || clean.includes('animat')) &&
      clean.includes('video') &&
      /\b(create|make|build|generate|code|write|design|turn|render|give|show)\b/i.test(
        clean
      ))
  );
}

/**
 * Extracts the core subject/script from the user's current prompt or recent chat history.
 */
export function extractVideoTopicFromPromptOrHistory(
  prompt: string,
  history: Array<{ role: string; text: string }> = [],
  pastSessionsSummary = ''
): string {
  const clean = String(prompt || '').trim();

  const refersToPast =
    /\b(past\s+prompt|previous\s+prompt|last\s+prompt|above\s+prompt|previous\s+chat|last\s+topic|what\s+i\s+said|my\s+previous|from\s+earlier|that\s+topic)\b/i.test(
      clean
    );

  if (refersToPast && history.length > 0) {
    const prevUserMsgs = history
      .filter((h) => h.role === 'user' && h.text && h.text.trim() !== clean)
      .reverse();
    for (const msg of prevUserMsgs) {
      const candidate = msg.text
        .replace(
          /\b(create|make|generate|build)\s+(an?\s+)?(html\s*5?\s*)?(type\s*)?(video|animation|animative)\b/gi,
          ''
        )
        .trim();
      if (candidate.length > 8) {
        return candidate.slice(0, 600);
      }
    }
  }

  let stripped = clean
    .replace(
      /^(please\s+)?(can\s+you\s+|could\s+you\s+)?(create|make|build|generate|write|code|design|give|show)\s+(me\s+)?(an?\s+)?(interactive\s+|playable\s+|working\s+|custom\s+|animated\s+|animative\s+|2d\s+)?(html\s*5?\s*|canvas\s*|2d\s*)?(type\s+|style\s+)?(animated\s+|animative\s+)?(video|animation|explainer|presentation|canvas)(\s+(about|on|for|of|explaining|showing|describing))?\s*/i,
      ''
    )
    .replace(
      /\b(like\s+this\s+type(\s+that\s+i\s+uploaded)?|in\s+html\s*5?\s*(canvas)?|with\s+subtitles(\s+and\s+voiceover)?|100\s*percent\s*working|using\s+html\s+canvas)\b/gi,
      ''
    )
    .trim();

  if (stripped.length < 4 && history.length > 0) {
    const lastUser = [...history].reverse().find((h) => h.role === 'user');
    if (lastUser?.text) stripped = lastUser.text.trim();
  }

  if (stripped.length < 4 && pastSessionsSummary) {
    const firstLine = pastSessionsSummary.split('\n').find((l) => l.trim().length > 10);
    if (firstLine) stripped = firstLine.replace(/^•\s*/, '').trim();
  }

  return stripped || 'Interactive 2D Visual Story & Animated Simulation';
}

function detectVisualTypeForText(text: string): CustomAiVideoScene['visualType'] {
  const lower = text.toLowerCase();
  if (/\b(nuclear|blast|bomb|explosion|shockwave|fallout|radiation|missile|siren|flash)\b/.test(lower)) {
    return 'nuclear_city';
  }
  if (/\b(shelter|basement|indoors|concrete|wall|room|hide|table|water|radio|supply|inside)\b/.test(lower)) {
    return 'shelter_indoors';
  }
  if (/\b(space|planet|star|sun|orbit|galaxy|black\s*hole|rocket|moon|cosmos|universe|satellite|earth|mars)\b/.test(lower)) {
    return 'space_cosmos';
  }
  if (/\b(tree|forest|plant|leaf|water|ocean|rain|cloud|sunlight|nature|climate|weather|photosynthesis|animal|earth)\b/.test(lower)) {
    return 'nature_ecosystem';
  }
  if (/\b(heart|brain|cell|blood|dna|virus|bacteria|body|medical|health|lung|neuron|organ|doctor|anatomy)\b/.test(lower)) {
    return 'medical_biology';
  }
  if (/\b(market|stock|money|finance|revenue|profit|economy|trade|crypto|bank|invest|growth|sales)\b/.test(lower)) {
    return 'finance_growth';
  }
  if (/\b(code|ai|robot|computer|server|cloud|algorithm|data|cyber|network|software|chip|neural)\b/.test(lower)) {
    return 'tech_network';
  }
  return 'character_story';
}

/**
 * Parses any user prompt or multi-line script into 6 distinct animated story scenes
 * so the video depicts the user's exact story/topic rather than fixed generic text.
 */
export function buildDynamicScenesFromTopic(
  rawTopic: string,
  aiSpec?: CustomAiVideoSpec
): {
  title: string;
  badge: string;
  scenes: CustomAiVideoScene[];
} {
  if (aiSpec?.scenes && Array.isArray(aiSpec.scenes) && aiSpec.scenes.length >= 4) {
    const padded = aiSpec.scenes.slice(0, 6);
    while (padded.length < 6) {
      padded.push(padded[padded.length - 1]);
    }
    return {
      title: aiSpec.title || rawTopic.slice(0, 60),
      badge: aiSpec.badge || 'CUSTOM 2D CANVAS ANIMATION',
      scenes: padded,
    };
  }

  const cleanTopic = rawTopic.replace(/\s+/g, ' ').trim();
  const shortTitle =
    aiSpec?.title ||
    (cleanTopic.length > 58 ? cleanTopic.slice(0, 55) + '...' : cleanTopic);

  // Split user's prompt into sentences or lines if they provided a detailed description
  const sentences = rawTopic
    .split(/(?:[.!?\n]+|\s+-\s+|\s+•\s+)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const primaryType = detectVisualTypeForText(cleanTopic);
  const palette = [
    '#f97316',
    '#38bdf8',
    '#10b981',
    '#a855f7',
    '#eab308',
    '#ec4899',
  ];

  const extractNouns = (str: string): string[] => {
    const stop = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your',
      'have', 'will', 'what', 'when', 'where', 'which', 'how', 'about',
      'create', 'make', 'video', 'html', 'canvas', 'animated', 'animative',
      'type', 'show', 'explain', 'part', 'scene',
    ]);
    const words = str
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stop.has(w.toLowerCase()));
    return words.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  };

  if (sentences.length >= 3) {
    const builtScenes: CustomAiVideoScene[] = [];
    for (let i = 0; i < 6; i++) {
      const line = sentences[i % sentences.length];
      const vType = detectVisualTypeForText(line + ' ' + cleanTopic);
      const objs = extractNouns(line);
      builtScenes.push({
        title:
          aiSpec?.chapters?.[i] ||
          objs.slice(0, 2).join(' & ') ||
          `Scene ${i + 1}`,
        narration: aiSpec?.subtitles?.[i] || line.slice(0, 130),
        visualType: vType,
        accentColor: palette[i % palette.length],
        keyObjects:
          objs.length >= 2
            ? objs
            : [shortTitle.slice(0, 18), `Stage ${i + 1}`, 'Live Motion'],
      });
    }
    return {
      title: shortTitle,
      badge: aiSpec?.badge || 'CUSTOM 2D ANIMATED STORY',
      scenes: builtScenes,
    };
  }

  // Topic-driven 6-scene story arc when user gives a short topic name
  const nouns =
    aiSpec?.keywords && aiSpec.keywords.length >= 4
      ? aiSpec.keywords
      : extractNouns(cleanTopic);
  const subject = nouns[0] || shortTitle.slice(0, 22);

  const sceneVisualOrder: CustomAiVideoScene['visualType'][] =
    primaryType === 'nuclear_city'
      ? [
          'nuclear_city',
          'nuclear_city',
          'shelter_indoors',
          'shelter_indoors',
          'medical_biology',
          'character_story',
        ]
      : primaryType === 'space_cosmos'
      ? [
          'space_cosmos',
          'space_cosmos',
          'tech_network',
          'space_cosmos',
          'nature_ecosystem',
          'finance_growth',
        ]
      : primaryType === 'nature_ecosystem'
      ? [
          'nature_ecosystem',
          'space_cosmos',
          'nature_ecosystem',
          'medical_biology',
          'character_story',
          'finance_growth',
        ]
      : primaryType === 'medical_biology'
      ? [
          'medical_biology',
          'medical_biology',
          'tech_network',
          'medical_biology',
          'character_story',
          'finance_growth',
        ]
      : [
          primaryType,
          'character_story',
          'tech_network',
          'nature_ecosystem',
          'shelter_indoors',
          'finance_growth',
        ];

  const defaultNarrations = [
    aiSpec?.subtitles?.[0] ||
      `Welcome to this custom 2D animated visual story exploring ${cleanTopic}.`,
    aiSpec?.subtitles?.[2] ||
      `Here we see how ${subject} begins in real time and interacts with the surrounding environment.`,
    aiSpec?.subtitles?.[4] ||
      `Inside the active mechanism of ${cleanTopic}, energy and motion flow across every stage.`,
    aiSpec?.subtitles?.[6] ||
      `Watch closely as ${subject} transforms and responds to changing forces and conditions.`,
    aiSpec?.subtitles?.[8] ||
      `Key real-world actions and step-by-step dynamics make ${cleanTopic} work effectively.`,
    aiSpec?.subtitles?.[10] ||
      `Summary of ${cleanTopic}: complete 2D visual breakdown and real-world impact.`,
  ];

  const defaultTitles = [
    aiSpec?.chapters?.[0] || `1. ${subject} Overview`,
    aiSpec?.chapters?.[1] || `2. Live Action & Motion`,
    aiSpec?.chapters?.[2] || `3. Core Mechanism`,
    aiSpec?.chapters?.[3] || `4. Environment & Forces`,
    aiSpec?.chapters?.[4] || `5. Step-by-Step Guide`,
    aiSpec?.chapters?.[5] || `6. Impact & Outcome`,
  ];

  return {
    title: shortTitle,
    badge: aiSpec?.badge || '2D CANVAS ANIMATED VIDEO',
    scenes: Array.from({ length: 6 }).map((_, i) => ({
      title: defaultTitles[i],
      narration: defaultNarrations[i],
      visualType: sceneVisualOrder[i],
      accentColor: palette[i % palette.length],
      keyObjects: [
        nouns[i % Math.max(1, nouns.length)] || subject,
        defaultTitles[i].replace(/^\d+\.\s*/, ''),
        `Scene ${i + 1}/6`,
      ],
    })),
  };
}

/**
 * Generates a 100% working, custom-drawn 2D HTML5 <canvas> animated video
 * with rich visual scenes (animated characters, cities, cosmos, nature, biology, shelters, networks),
 * timeline scrubber, voiceover synthesis, and karaoke subtitles.
 */
export function buildPlayableHtmlCanvasVideoCode(
  rawTopic: string,
  aiSpec?: CustomAiVideoSpec
): string {
  const plan = buildDynamicScenesFromTopic(rawTopic, aiSpec);
  const safeHtmlTitle = plan.title.replace(/[<>&"']/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeHtmlTitle} — 2D Animated Video</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #07090e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    overflow: hidden;
    color: #f8fafc;
    user-select: none;
  }
  #hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 96vw;
  }
  .badge {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
    padding: 4px 11px;
    border-radius: 999px;
    background: rgba(249, 115, 22, 0.16);
    border: 1px solid rgba(249, 115, 22, 0.45);
    color: #fdba74;
    text-transform: uppercase;
  }
  #wrap {
    position: relative;
    width: min(420px, 95vw);
    aspect-ratio: 9 / 16;
    max-height: 78vh;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12);
    background: #0b0f19;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  #sub-box {
    position: absolute;
    bottom: 62px;
    left: 12px;
    right: 12px;
    text-align: center;
    pointer-events: none;
    z-index: 10;
  }
  #sub {
    display: inline-block;
    background: rgba(5, 8, 18, 0.88);
    backdrop-filter: blur(10px);
    color: #ffffff;
    font-size: clamp(11px, 2.7vw, 13.5px);
    font-weight: 700;
    line-height: 1.45;
    padding: 8px 14px;
    border-radius: 13px;
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }
  #sub .hl {
    color: #fbbf24;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  #ctrl {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 54px;
    background: linear-gradient(transparent, rgba(2,6,23,0.96));
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    z-index: 15;
  }
  .btn {
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.22);
    color: #fff;
    border-radius: 999px;
    padding: 5px 12px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }
  .btn:hover { background: rgba(255,255,255,0.24); }
  #pbar {
    flex: 1;
    height: 6px;
    background: rgba(255,255,255,0.18);
    border-radius: 4px;
    cursor: pointer;
    overflow: hidden;
  }
  #pfill {
    height: 100%;
    background: linear-gradient(90deg, #f97316, #38bdf8);
    width: 0%;
  }
  #tdisp {
    color: rgba(255,255,255,0.75);
    font-size: 10px;
    font-family: monospace;
    min-width: 64px;
    text-align: right;
  }
  #chbar {
    display: flex;
    gap: 5px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: min(460px, 96vw);
  }
  .cpill {
    font-size: 10px;
    padding: 4px 9px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.65);
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.12);
    font-weight: 600;
  }
  .cpill.on {
    background: rgba(249, 115, 22, 0.24);
    color: #fdba74;
    border-color: rgba(249, 115, 22, 0.55);
  }
</style>
</head>
<body>
<div id="hdr">
  <span class="badge">${plan.badge.replace(/[<>&"']/g, '')}</span>
</div>
<div id="wrap">
  <canvas id="c" width="420" height="746"></canvas>
  <div id="sub-box"><div id="sub">Press Play to start custom 2D animation</div></div>
  <div id="ctrl">
    <button class="btn" id="pbtn">&#9654; Play</button>
    <button class="btn" id="vbtn">&#128266; Voice</button>
    <div id="pbar"><div id="pfill"></div></div>
    <div id="tdisp">0:00 / 1:12</div>
  </div>
</div>
<div id="chbar"></div>

<script>
const VIDEO_TITLE = ${JSON.stringify(plan.title)};
const SCENES = ${JSON.stringify(plan.scenes)};
const SCENE_DUR = 12;
const TOTAL = SCENES.length * SCENE_DUR;

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const W = cv.width, H = cv.height;

let elapsed = 0, playing = false, lastTs = null;
let voiceOn = true, lastSpokenIdx = -1;

// Build chapter buttons
const chbar = document.getElementById('chbar');
SCENES.forEach((sc, i) => {
  const b = document.createElement('div');
  b.className = 'cpill' + (i === 0 ? ' on' : '');
  b.textContent = sc.title;
  b.onclick = () => {
    elapsed = i * SCENE_DUR + 0.05;
    lastSpokenIdx = -1;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    renderFrame();
  };
  chbar.appendChild(b);
});

function speakLine(text) {
  if (!voiceOn || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.03;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function updateSubtitles(scIdx, scProg) {
  const sc = SCENES[scIdx] || SCENES[0];
  const words = String(sc.narration || '').split(' ');
  const activeWord = Math.floor(scProg * words.length);
  const html = words.map((w, idx) => idx === activeWord ? '<span class="hl">' + w + '</span>' : w).join(' ');
  document.getElementById('sub').innerHTML = html;
  if (playing && lastSpokenIdx !== scIdx) {
    lastSpokenIdx = scIdx;
    speakLine(sc.narration);
  }
}

// Helper: Draw 2D animated stick character / person
function drawPerson(x, y, scale, walkPhase, color, label) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color || '#f8fafc';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(0, -48, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#fde68a';
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.lineTo(0, -8);
  ctx.stroke();

  // Arms swinging
  const armSwing = Math.sin(walkPhase) * 14;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.lineTo(-14 + armSwing, -14);
  ctx.moveTo(0, -30);
  ctx.lineTo(14 - armSwing, -14);
  ctx.stroke();

  // Legs walking
  const legSwing = Math.sin(walkPhase) * 16;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-12 + legSwing, 18);
  ctx.moveTo(0, -8);
  ctx.lineTo(12 - legSwing, 18);
  ctx.stroke();

  if (label) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, -68);
  }
  ctx.restore();
}

// Scene Renderer 1: City Skyline + Flash / Shockwave / Action
function drawNuclearOrCityScene(sc, p, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1e1b4b');
  sky.addColorStop(0.55, '#7c2d12');
  sky.addColorStop(1, '#090d16');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Expanding shockwave / energy dome
  const domeR = 40 + p * 260;
  const domeGrad = ctx.createRadialGradient(W * 0.5, H * 0.44, 5, W * 0.5, H * 0.44, domeR);
  domeGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
  domeGrad.addColorStop(0.35, 'rgba(251,191,36,0.75)');
  domeGrad.addColorStop(0.7, 'rgba(239,68,68,0.45)');
  domeGrad.addColorStop(1, 'rgba(239,68,68,0)');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.44, domeR, 0, Math.PI * 2);
  ctx.fill();

  // Shockwave rings
  for (let r = 0; r < 3; r++) {
    const rad = ((p * 320 + r * 85) % 320);
    ctx.strokeStyle = 'rgba(253, 186, 116, ' + (1 - rad / 320) * 0.7 + ')';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.44, rad, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2D City Buildings Silhouette
  const bWidths = [42, 56, 38, 64, 48, 52, 44, 58];
  const bHeights = [140, 195, 125, 220, 160, 185, 135, 170];
  let bx = 10;
  const groundY = H * 0.68;
  for (let i = 0; i < bWidths.length; i++) {
    const bw = bWidths[i], bh = bHeights[i];
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = 'rgba(249,115,22,0.45)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bx, groundY - bh, bw, bh);
    ctx.strokeRect(bx, groundY - bh, bw, bh);
    // Windows
    ctx.fillStyle = 'rgba(251,191,36,0.55)';
    for (let wy = groundY - bh + 14; wy < groundY - 16; wy += 20) {
      for (let wx = bx + 8; wx < bx + bw - 10; wx += 14) {
        if ((wx + wy) % 3 !== 0) ctx.fillRect(wx, wy, 6, 9);
      }
    }
    bx += bw + 6;
  }

  // Ground road
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, groundY, W, H - groundY);

  // Running person seeking cover
  const px = 70 + ((t * 65) % (W - 140));
  drawPerson(px, groundY + 24, 0.95, t * 9, '#38bdf8', sc.keyObjects[0] || 'Action');
}

// Scene Renderer 2: Indoor Shelter / Room Cross-Section
function drawShelterIndoorsScene(sc, p, t) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // Building Cross Section walls
  const rx = 44, ry = 185, rw = W - 88, rh = 340;
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 8;
  ctx.fillRect(rx, ry, rw, rh);
  ctx.strokeRect(rx, ry, rw, rh);

  // Floor divider (Upper room vs Underground Basement Shelter)
  ctx.beginPath();
  ctx.moveTo(rx, ry + rh * 0.48);
  ctx.lineTo(rx + rw, ry + rh * 0.48);
  ctx.stroke();

  // Shield waves blocked outside walls
  for (let i = 0; i < 4; i++) {
    const waveX = rx - 10 - Math.sin(t * 3 + i) * 12;
    ctx.strokeStyle = 'rgba(239,68,68,0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(waveX, ry + 30 + i * 70);
    ctx.lineTo(rx - 4, ry + 50 + i * 70);
    ctx.stroke();
  }

  // Safe zone glow in basement
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.fillRect(rx + 4, ry + rh * 0.48 + 4, rw - 8, rh * 0.52 - 8);

  // Table & Emergency Kit inside shelter
  const floorY = ry + rh - 16;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(rx + 40, floorY - 55, 110, 8);
  ctx.fillRect(rx + 50, floorY - 47, 8, 47);
  ctx.fillRect(rx + 132, floorY - 47, 8, 47);

  // Water & Radio icons on shelf
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(rx + 210, floorY - 48, 28, 42);
  ctx.fillStyle = '#eab308';
  ctx.fillRect(rx + 250, floorY - 38, 36, 32);

  // Person safe inside shelter
  drawPerson(rx + 175, floorY - 18, 0.9, Math.sin(t * 2) * 0.3, '#10b981', sc.keyObjects[0] || 'Protected');
}

// Scene Renderer 3: Space / Solar System / Cosmos
function drawSpaceCosmosScene(sc, p, t) {
  const bg = ctx.createRadialGradient(W * 0.5, H * 0.45, 10, W * 0.5, H * 0.45, H * 0.65);
  bg.addColorStop(0, '#1e1b4b');
  bg.addColorStop(0.6, '#090d16');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Twinkling stars
  for (let i = 0; i < 45; i++) {
    const sx = (i * 97) % W;
    const sy = (i * 151) % (H - 120);
    const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i));
    ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const cx = W * 0.5, cy = H * 0.45;
  // Glowing Central Star / Sun
  const sunG = ctx.createRadialGradient(cx, cy, 4, cx, cy, 58);
  sunG.addColorStop(0, '#fffbeb');
  sunG.addColorStop(0.4, '#f59e0b');
  sunG.addColorStop(1, 'rgba(245,158,11,0)');
  ctx.fillStyle = sunG;
  ctx.beginPath();
  ctx.arc(cx, cy, 58, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting Planets with labels
  const orbits = [
    { r: 85, speed: 1.4, size: 11, col: '#38bdf8', name: sc.keyObjects[0] || 'Orbit 1' },
    { r: 132, speed: 0.9, size: 15, col: '#10b981', name: sc.keyObjects[1] || 'Orbit 2' },
    { r: 176, speed: 0.55, size: 13, col: '#a855f7', name: sc.keyObjects[2] || 'Orbit 3' }
  ];
  orbits.forEach((ob, idx) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, ob.r, 0, Math.PI * 2);
    ctx.stroke();

    const ang = t * ob.speed + idx * 2.1;
    const px = cx + Math.cos(ang) * ob.r;
    const py = cy + Math.sin(ang) * ob.r;
    ctx.fillStyle = ob.col;
    ctx.beginPath();
    ctx.arc(px, py, ob.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ob.name.slice(0, 15), px, py - ob.size - 6);
  });
}

// Scene Renderer 4: Nature / Ecosystem / Weather / Photosynthesis
function drawNatureEcosystemScene(sc, p, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.68);
  sky.addColorStop(0, '#0284c7');
  sky.addColorStop(1, '#bae6fd');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.68);

  // Animated Sun & Rays
  const sx = W * 0.78, sy = 155;
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(sx, sy, 34, 0, Math.PI * 2);
  ctx.fill();

  // Energy rays flowing to plant/ground
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = -t * 25;
  ctx.beginPath();
  ctx.moveTo(sx - 20, sy + 20);
  ctx.lineTo(W * 0.45, H * 0.52);
  ctx.stroke();
  ctx.setLineDash([]);

  // Rolling green hills
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.65);
  ctx.quadraticCurveTo(W * 0.5, H * 0.56, W, H * 0.66);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Animated Tree / Plant growing
  const tx = W * 0.45, ty = H * 0.64;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(tx - 10, ty - 95, 20, 95);
  const sway = Math.sin(t * 2.5) * 6;
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(tx + sway, ty - 115, 46, 0, Math.PI * 2);
  ctx.arc(tx - 28 + sway, ty - 95, 34, 0, Math.PI * 2);
  ctx.arc(tx + 28 + sway, ty - 95, 34, 0, Math.PI * 2);
  ctx.fill();

  // Floating oxygen / energy particles rising
  for (let i = 0; i < 8; i++) {
    const py = ty - 90 - ((t * 35 + i * 28) % 160);
    const px = tx - 50 + (i * 22) + Math.sin(t * 3 + i) * 10;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Scene Renderer 5: Medical / Biology / Cellular Pulse
function drawMedicalBiologyScene(sc, p, t) {
  ctx.fillStyle = '#180a1c';
  ctx.fillRect(0, 0, W, H);

  const cx = W * 0.5, cy = H * 0.45;
  const pulse = 1 + Math.sin(t * 5) * 0.08;

  // Vascular / Cellular stream
  for (let i = 0; i < 12; i++) {
    const bx = ((t * 60 + i * 42) % (W + 40)) - 20;
    const by = cy + Math.sin(bx * 0.025 + t * 2) * 85;
    ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : '#ef4444';
    ctx.beginPath();
    ctx.ellipse(bx, by, 14, 9, Math.sin(t + i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central Pulsing Organ / Cell Nucleus
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fda4af';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sc.keyObjects[0] || 'Bio Core', 0, 5);
  ctx.restore();

  // Live ECG Heartbeat Wave at bottom
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 25; x < W - 25; x += 4) {
    const phase = (x + t * 140) % 120;
    let y = H * 0.72;
    if (phase > 50 && phase < 58) y -= 38;
    else if (phase >= 58 && phase < 66) y += 26;
    else if (phase >= 66 && phase < 74) y -= 14;
    if (x === 25) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Scene Renderer 6: Interactive Character Story / Tech & Finance Visuals
function drawCharacterOrTechScene(sc, p, t) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Interactive Stage Floor
  const floorY = H * 0.66;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = sc.accentColor || '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(W, floorY);
  ctx.stroke();

  // Animated Visual Nodes / Hologram Cards above characters
  const items = sc.keyObjects && sc.keyObjects.length ? sc.keyObjects : ['Stage 1', 'Stage 2', 'Stage 3'];
  items.slice(0, 3).forEach((label, idx) => {
    const cardX = 36 + idx * 120;
    const cardY = 210 + Math.sin(t * 2.5 + idx) * 10;
    ctx.fillStyle = 'rgba(30, 41, 59, 0.88)';
    ctx.strokeStyle = sc.accentColor || '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, 106, 68, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(label).slice(0, 14), cardX + 53, cardY + 38);
  });

  // Two animated characters interacting on the stage
  const p1x = W * 0.32 + Math.sin(t * 1.5) * 18;
  const p2x = W * 0.68 - Math.sin(t * 1.5) * 18;
  drawPerson(p1x, floorY - 16, 1.05, t * 5, '#38bdf8', items[0] || 'Actor 1');
  drawPerson(p2x, floorY - 16, 1.05, t * 5 + Math.PI, '#f97316', items[1] || 'Actor 2');

  // Animated communication wave between characters
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -t * 30;
  ctx.beginPath();
  ctx.moveTo(p1x + 20, floorY - 52);
  ctx.quadraticCurveTo(W * 0.5, floorY - 95, p2x - 20, floorY - 52);
  ctx.stroke();
  ctx.setLineDash([]);
}

function renderFrame() {
  const scIdx = Math.min(SCENES.length - 1, Math.floor(elapsed / SCENE_DUR));
  const scProg = (elapsed - scIdx * SCENE_DUR) / SCENE_DUR;
  const sc = SCENES[scIdx] || SCENES[0];

  ctx.clearRect(0, 0, W, H);

  if (sc.visualType === 'nuclear_city') {
    drawNuclearOrCityScene(sc, scProg, elapsed);
  } else if (sc.visualType === 'shelter_indoors') {
    drawShelterIndoorsScene(sc, scProg, elapsed);
  } else if (sc.visualType === 'space_cosmos') {
    drawSpaceCosmosScene(sc, scProg, elapsed);
  } else if (sc.visualType === 'nature_ecosystem') {
    drawNatureEcosystemScene(sc, scProg, elapsed);
  } else if (sc.visualType === 'medical_biology') {
    drawMedicalBiologyScene(sc, scProg, elapsed);
  } else {
    drawCharacterOrTechScene(sc, scProg, elapsed);
  }

  // Top Scene Header Banner
  ctx.fillStyle = 'rgba(5, 8, 18, 0.82)';
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(14, 16, W - 28, 74, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = sc.accentColor || '#f97316';
  ctx.font = '800 10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SCENE ' + (scIdx + 1) + ' OF ' + SCENES.length + ' · ' + VIDEO_TITLE.slice(0, 32).toUpperCase(), 28, 38);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 17px sans-serif';
  ctx.fillText(sc.title, 28, 66);

  // Update UI progress bar & chapter pills
  document.getElementById('pfill').style.width = ((elapsed / TOTAL) * 100).toFixed(1) + '%';
  document.getElementById('tdisp').textContent = fmt(elapsed) + ' / ' + fmt(TOTAL);
  const pills = document.querySelectorAll('.cpill');
  pills.forEach((pl, idx) => pl.classList.toggle('on', idx === scIdx));

  updateSubtitles(scIdx, scProg);
}

function loop(ts) {
  if (!playing) return;
  if (lastTs !== null) {
    elapsed += (ts - lastTs) / 1000;
    if (elapsed >= TOTAL) {
      elapsed = TOTAL;
      playing = false;
      document.getElementById('pbtn').innerHTML = '&#8635; Replay';
      renderFrame();
      return;
    }
  }
  lastTs = ts;
  renderFrame();
  requestAnimationFrame(loop);
}

document.getElementById('pbtn').onclick = () => {
  if (elapsed >= TOTAL) elapsed = 0;
  playing = !playing;
  lastTs = null;
  document.getElementById('pbtn').innerHTML = playing ? '&#9646;&#9646; Pause' : '&#9654; Play';
  if (playing) {
    lastSpokenIdx = -1;
    requestAnimationFrame(loop);
  } else if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

document.getElementById('vbtn').onclick = () => {
  voiceOn = !voiceOn;
  document.getElementById('vbtn').innerHTML = voiceOn ? '&#128266; Voice' : '&#128263; Muted';
  if (!voiceOn && window.speechSynthesis) window.speechSynthesis.cancel();
};

document.getElementById('pbar').onclick = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  elapsed = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * TOTAL;
  lastSpokenIdx = -1;
  renderFrame();
};

renderFrame();
setTimeout(() => {
  if (!playing) document.getElementById('pbtn').click();
}, 350);
</script>
</body>
</html>`;
}

export function buildPartWiseHtmlVideoResponse(
  prompt: string,
  history: Array<{ role: string; text: string }> = [],
  pastSessionsSummary = '',
  agentMode = 'GOT LOCAL',
  aiSpec?: CustomAiVideoSpec,
  customAiHtmlCode?: string
) {
  const topic = extractVideoTopicFromPromptOrHistory(
    prompt,
    history,
    pastSessionsSummary
  );
  const htmlCode =
    customAiHtmlCode &&
    customAiHtmlCode.includes('<canvas') &&
    customAiHtmlCode.includes('</html>')
      ? customAiHtmlCode
      : buildPlayableHtmlCanvasVideoCode(topic, aiSpec);
  const plan = buildDynamicScenesFromTopic(topic, aiSpec);

  const reply = `### Part 1 — Custom 2D Animated Video Blueprint: "${plan.title}"
I have analyzed your prompt and created a custom **2D HTML5 \`<canvas>\` Animated Video** for **"${plan.title}"** with custom-drawn 2D visual scenes, animated characters & environments, chapter timeline scrubbing, karaoke subtitles, and live Web Speech API voiceover:

${plan.scenes
  .map(
    (sc, idx) =>
      `• **${sc.title}**: *${sc.narration}* (\`Visual: ${sc.visualType}\`)`
  )
  .join('\n')}

---

### Part 2 — Interactive 2D HTML5 Canvas Video Player (Auto-Playing Above Source Code)
Use **Play/Pause**, toggle **Voice**, scrub the timeline bar, or tap any **Scene pill** below the player:

\`\`\`html
${htmlCode}
\`\`\`

---

### Part 3 — Customizing Scenes, Characters & Voiceover
• Ask me to add specific scenes, change the characters or objects, or adjust the narration script and I will update the 2D animation immediately.`;

  return {
    reply,
    highlights: [
      'Custom 2D Canvas Animated Video',
      `Topic: ${plan.title.slice(0, 26)}`,
      `Model: ${agentMode}`,
    ],
    visionSummary: '',
    sources: [],
    followUpPrompts: [
      `Add more animated scenes and details to "${plan.title.slice(0, 24)}"`,
      `Create an interactive 2D graph for "${plan.title.slice(0, 24)}"`,
      `Build a complete multi-file project for "${plan.title.slice(0, 24)}"`,
    ],
  };
}

export interface MasonryGalleryItem {
  id: string;
  title: string;
  prompt: string;
  category: 'artwork' | 'html-video' | 'vision-arch';
  aspectClass: string;
  modelTag: string;
  resolution: string;
  imageUrl: string;
  htmlVideoUrl?: string;
}

function makeGallerySvgDataUri(
  bgStart: string,
  bgEnd: string,
  accent: string,
  title: string,
  subtitle: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="42%" r="48%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="1000" fill="url(#bg)"/>
    <circle cx="400" cy="420" r="340" fill="url(#glow)"/>
    <g stroke="${accent}" stroke-opacity="0.28" stroke-width="2" fill="none">
      <circle cx="400" cy="420" r="190"/>
      <circle cx="400" cy="420" r="260" stroke-dasharray="10 8"/>
      <path d="M120 740 Q400 580 680 740"/>
      <path d="M160 300 L640 540 M640 300 L160 540"/>
    </g>
    <circle cx="400" cy="420" r="54" fill="${accent}" fill-opacity="0.88"/>
    <text x="400" y="830" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="34">${title}</text>
    <text x="400" y="875" text-anchor="middle" fill="#cbd5e1" font-family="monospace" font-weight="600" font-size="20">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MASONRY_GALLERY_ITEMS: MasonryGalleryItem[] = [
  {
    id: 'html-video-nuclear-survival',
    title: 'Nuclear Survival in 92 Seconds (Interactive HTML5 Video)',
    prompt:
      'Create an animated 2D HTML5 canvas video explaining how to survive a nuclear blast in 92 seconds with animated city skyline, shockwave, and underground shelter scenes',
    category: 'html-video',
    aspectClass: 'aspect-[9/14]',
    modelTag: 'GOT HTML5 Video Engine',
    resolution: '1080×1920 · 60fps Canvas',
    imageUrl: makeGallerySvgDataUri(
      '#090d16',
      '#1e1b4b',
      '#f59e0b',
      '92s Nuclear Survival',
      'Interactive 2D HTML5 Canvas Video'
    ),
    htmlVideoUrl: '/assets/aistudio/Nuclear_Survival_in_92_Seconds_1a10c10d.html',
  },
  {
    id: 'art-quantum-citadel',
    title: 'Solaris Glass Citadel Above Neo-Tokyo',
    prompt:
      'Design a futuristic floating liquid-glass research citadel above Neo-Tokyo at golden hour with volumetric light beams',
    category: 'artwork',
    aspectClass: 'aspect-[4/5]',
    modelTag: 'GOT Vision Art',
    resolution: '2048×2560 · HDR',
    imageUrl: makeGallerySvgDataUri(
      '#0f172a',
      '#31102f',
      '#38bdf8',
      'Solaris Glass Citadel',
      'Liquid-Glass Architectural Render'
    ),
  },
  {
    id: 'vision-neural-graph',
    title: 'Autonomous Multi-Agent Neural Topology',
    prompt:
      'Create an interactive 2D architecture diagram and data flow graph for a real-time multi-agent search system',
    category: 'vision-arch',
    aspectClass: 'aspect-square',
    modelTag: 'GOT Graph & Blueprint',
    resolution: 'Vector SVG + Canvas',
    imageUrl: makeGallerySvgDataUri(
      '#052e16',
      '#0f172a',
      '#10b981',
      'Multi-Agent Topology',
      'Real-Time System Architecture'
    ),
  },
  {
    id: 'html-video-cosmos-odyssey',
    title: 'Deep Space Exoplanet Atmospheric Entry (2D Canvas Video)',
    prompt:
      'Create an animated HTML5 canvas video showing a spacecraft entering the atmosphere of an ocean exoplanet with telemetry HUD',
    category: 'html-video',
    aspectClass: 'aspect-[4/5]',
    modelTag: 'GOT HTML5 Video Engine',
    resolution: '1280×720 · 60fps Canvas',
    imageUrl: makeGallerySvgDataUri(
      '#090514',
      '#1e1b4b',
      '#a855f7',
      'Exoplanet Entry',
      '2D Canvas Animated Story Video'
    ),
  },
  {
    id: 'art-bioluminescent-reef',
    title: 'Abyssal Bioluminescent Neural Sanctuary',
    prompt:
      'Generate a bioluminescent deep-sea botanical sanctuary enclosed in a geodesic titanium dome',
    category: 'artwork',
    aspectClass: 'aspect-[3/4]',
    modelTag: 'GOT Vision Art',
    resolution: '1920×2560 · Ultra',
    imageUrl: makeGallerySvgDataUri(
      '#042f2e',
      '#020617',
      '#2dd4bf',
      'Bioluminescent Dome',
      'Deep-Sea Concept Artwork'
    ),
  },
  {
    id: 'vision-compiler-pipeline',
    title: 'Part-Wise Full-Stack Project Synthesis Blueprint',
    prompt:
      'Create a full-stack interactive SaaS dashboard project with live telemetry charts and modular TypeScript files',
    category: 'vision-arch',
    aspectClass: 'aspect-[4/3]',
    modelTag: 'GOT Project Studio',
    resolution: 'Full-Stack App Package',
    imageUrl: makeGallerySvgDataUri(
      '#1c1917',
      '#090d16',
      '#f97316',
      'Project Synthesis',
      'Multi-File Live App Studio'
    ),
  },
];

