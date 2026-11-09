export interface MasonryGalleryItem {
  id: string;
  title: string;
  category: 'artwork' | 'html-video' | 'vision-arch';
  aspectClass: 'aspect-[4/5]' | 'aspect-square' | 'aspect-[9/16]' | 'aspect-[16/10]';
  prompt: string;
  modelTag: string;
  resolution: string;
  imageUrl: string;
  htmlVideoUrl?: string;
  htmlVideoCode?: string;
}

export interface CustomAiVideoSpec {
  title?: string;
  theme?: 'space' | 'science' | 'coding' | 'nature' | 'medical' | 'finance' | 'nuclear' | 'general';
  primaryColor?: string;
  secondaryColor?: string;
  chapters?: string[];
  subtitles?: Array<[number, string]>;
  keywords?: string[];
  metrics?: Array<{ label: string; value: number }>;
}

/**
 * Generates rich, high-resolution SVG artwork data URLs for the Masonry Gallery
 * matching the warm editorial Liquid Glass theme.
 */
function createMasonrySvgArt(params: {
  title: string;
  subtitle: string;
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  orb1: string;
  orb2: string;
  accent: string;
  width: number;
  height: number;
  motif: 'architecture' | 'portrait' | 'cosmos' | 'botanical' | 'kinetic' | 'cyber';
}): string {
  const {
    title,
    subtitle,
    bgStart,
    bgMid,
    bgEnd,
    orb1,
    orb2,
    accent,
    width,
    height,
    motif,
  } = params;

  const cx = Math.round(width / 2);
  const cy = Math.round(height * 0.44);

  let motifSvg = '';
  if (motif === 'architecture') {
    motifSvg = `
      <g stroke="rgba(255,255,255,0.45)" stroke-width="2" fill="none">
        <rect x="${cx - 170}" y="${cy - 150}" width="340" height="280" rx="28" fill="rgba(255,255,255,0.08)" />
        <rect x="${cx - 130}" y="${cy - 110}" width="260" height="200" rx="20" fill="rgba(255,255,255,0.12)" />
        <line x1="${cx - 170}" y1="${cy}" x2="${cx + 170}" y2="${cy}" stroke="rgba(255,255,255,0.25)" />
        <line x1="${cx}" y1="${cy - 150}" x2="${cx}" y2="${cy + 130}" stroke="rgba(255,255,255,0.25)" />
        <circle cx="${cx}" cy="${cy}" r="54" fill="${accent}" fill-opacity="0.35" stroke="${accent}" stroke-width="2.5" />
      </g>
    `;
  } else if (motif === 'cosmos') {
    motifSvg = `
      <g>
        <ellipse cx="${cx}" cy="${cy}" rx="220" ry="74" fill="none" stroke="${accent}" stroke-width="3" transform="rotate(-18 ${cx} ${cy})" />
        <ellipse cx="${cx}" cy="${cy}" rx="165" ry="52" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" transform="rotate(-18 ${cx} ${cy})" />
        <circle cx="${cx}" cy="${cy}" r="68" fill="#09090b" stroke="rgba(255,255,255,0.85)" stroke-width="3" />
        <circle cx="${cx + 120}" cy="${cy - 85}" r="14" fill="${orb1}" />
        <circle cx="${cx - 140}" cy="${cy + 65}" r="9" fill="#ffffff" />
      </g>
    `;
  } else if (motif === 'botanical') {
    motifSvg = `
      <g stroke="rgba(255,255,255,0.65)" stroke-width="2" fill="rgba(255,255,255,0.12)">
        <path d="M ${cx} ${cy + 130} C ${cx - 140} ${cy + 40}, ${cx - 140} ${cy - 120}, ${cx} ${cy - 160} C ${cx + 140} ${cy - 120}, ${cx + 140} ${cy + 40}, ${cx} ${cy + 130} Z" />
        <path d="M ${cx} ${cy + 110} C ${cx - 80} ${cy + 20}, ${cx - 80} ${cy - 80}, ${cx} ${cy - 115} C ${cx + 80} ${cy - 80}, ${cx + 80} ${cy + 20}, ${cx} ${cy + 110} Z" fill="${accent}" fill-opacity="0.28" />
        <line x1="${cx}" y1="${cy - 150}" x2="${cx}" y2="${cy + 140}" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" />
      </g>
    `;
  } else if (motif === 'kinetic') {
    motifSvg = `
      <g fill="none">
        <circle cx="${cx}" cy="${cy}" r="145" stroke="rgba(255,255,255,0.22)" stroke-width="18" />
        <circle cx="${cx}" cy="${cy}" r="105" stroke="${accent}" stroke-width="4" stroke-dasharray="28 14" />
        <polygon points="${cx - 26},${cy - 42} ${cx - 26},${cy + 42} ${cx + 46},${cy}" fill="#ffffff" />
      </g>
    `;
  } else if (motif === 'cyber') {
    motifSvg = `
      <g stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none">
        <polygon points="${cx},${cy - 140} ${cx + 135},${cy - 40} ${cx + 85},${cy + 120} ${cx - 85},${cy + 120} ${cx - 135},${cy - 40}" fill="rgba(255,255,255,0.1)" />
        <polygon points="${cx},${cy - 95} ${cx + 90},${cy - 25} ${cx + 56},${cy + 82} ${cx - 56},${cy + 82} ${cx - 90},${cy - 25}" stroke="${accent}" stroke-width="2.5" fill="${accent}" fill-opacity="0.22" />
      </g>
    `;
  } else {
    motifSvg = `
      <g>
        <circle cx="${cx}" cy="${cy - 20}" r="118" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.55)" stroke-width="2" />
        <circle cx="${cx}" cy="${cy - 45}" r="42" fill="rgba(255,255,255,0.75)" />
        <path d="M ${cx - 72} ${cy + 68} Q ${cx} ${cy + 5} ${cx + 72} ${cy + 68}" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="14" stroke-linecap="round" />
      </g>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="52%" stop-color="${bgMid}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
      <radialGradient id="o1" cx="28%" cy="26%" r="55%">
        <stop offset="0%" stop-color="${orb1}" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="${orb1}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="o2" cx="76%" cy="72%" r="50%">
        <stop offset="0%" stop-color="${orb2}" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="${orb2}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <circle cx="${Math.round(width * 0.28)}" cy="${Math.round(height * 0.26)}" r="${Math.round(width * 0.48)}" fill="url(#o1)"/>
    <circle cx="${Math.round(width * 0.76)}" cy="${Math.round(height * 0.72)}" r="${Math.round(width * 0.45)}" fill="url(#o2)"/>
    ${motifSvg}
    <rect x="44" y="${height - 156}" width="${width - 88}" height="112" rx="24" fill="rgba(12,10,9,0.58)" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"/>
    <text x="76" y="${height - 102}" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="bold">${title}</text>
    <text x="76" y="${height - 68}" fill="#e7e5e4" font-family="monospace" font-size="15">${subtitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MASONRY_GALLERY_ITEMS: MasonryGalleryItem[] = [
  {
    id: 'art-nuclear-survival-video',
    title: 'Nuclear Survival in 92 Seconds (Interactive 2D HTML5 Video)',
    category: 'html-video',
    aspectClass: 'aspect-[9/16]',
    prompt:
      'Create a 2D HTML5 Canvas animated video about How Solar Panels & Clean Energy Work with 6 chapters, live 2D vector diagrams, voiceover narration, and timeline controls.',
    modelTag: 'GOT Agent 2D HTML Video Studio',
    resolution: '1080×1920 · 60fps 2D Canvas',
    htmlVideoUrl: '/assets/aistudio/Nuclear_Survival_in_92_Seconds_1a10c10d.html',
    imageUrl: createMasonrySvgArt({
      title: '2D HTML5 Canvas Video Engine',
      subtitle: '6 Chapters · Live Voice · Interactive 2D Canvas',
      bgStart: '#1b1230',
      bgMid: '#7c2d12',
      bgEnd: '#0c0a09',
      orb1: '#f59e0b',
      orb2: '#ef4444',
      accent: '#ffd700',
      width: 720,
      height: 1120,
      motif: 'kinetic',
    }),
  },
  {
    id: 'art-liquid-sanctuary',
    title: 'Refractive Liquid Glass Sanctuary Pavilion',
    category: 'artwork',
    aspectClass: 'aspect-[4/5]',
    prompt:
      'Generate an image of a refractive Liquid Glass architectural pavilion floating over a warm alabaster desert oasis at golden hour.',
    modelTag: 'GOT Agent Image Studio',
    resolution: '1024×1280 · Specular HDR',
    imageUrl: createMasonrySvgArt({
      title: 'Liquid Glass Sanctuary',
      subtitle: 'Architectural Render · Warm Alabaster & Gold',
      bgStart: '#1c1917',
      bgMid: '#44403c',
      bgEnd: '#78350f',
      orb1: '#f59e0b',
      orb2: '#fbbf24',
      accent: '#f59e0b',
      width: 800,
      height: 1000,
      motif: 'architecture',
    }),
  },
  {
    id: 'art-event-horizon',
    title: 'Gargantua Relativistic Accretion Horizon',
    category: 'artwork',
    aspectClass: 'aspect-square',
    prompt:
      'Create a 2D HTML5 Canvas video about Black Holes & Gravitational Lensing with orbital physics and live telemetry.',
    modelTag: 'GOT LOCAL + 2D Studio',
    resolution: '1024×1024 · Deep Cosmos',
    imageUrl: createMasonrySvgArt({
      title: 'Relativistic Event Horizon',
      subtitle: 'Astrophysics Simulation · Gravitational Lensing',
      bgStart: '#09090b',
      bgMid: '#1e1b4b',
      bgEnd: '#31102f',
      orb1: '#f97316',
      orb2: '#38bdf8',
      accent: '#fb923c',
      width: 900,
      height: 900,
      motif: 'cosmos',
    }),
  },
  {
    id: 'art-bioluminescent-flora',
    title: 'Bioluminescent Botanical Glass Atrium',
    category: 'artwork',
    aspectClass: 'aspect-[4/5]',
    prompt:
      'Create a 2D HTML5 Canvas video explaining Photosynthesis & Cellular ATP Synthesis step by step.',
    modelTag: 'GOT Agent 2D Science Studio',
    resolution: '1024×1280 · Botanical Glass',
    imageUrl: createMasonrySvgArt({
      title: 'Bioluminescent Atrium',
      subtitle: 'Botanical Specular Study · Emerald & Amber',
      bgStart: '#064e3b',
      bgMid: '#115e59',
      bgEnd: '#1c1917',
      orb1: '#10b981',
      orb2: '#f59e0b',
      accent: '#34d399',
      width: 800,
      height: 1000,
      motif: 'botanical',
    }),
  },
  {
    id: 'art-neural-blueprint',
    title: 'Autonomous Multi-Agent Neural Topology & Graph',
    category: 'vision-arch',
    aspectClass: 'aspect-[16/10]',
    prompt:
      'Create an interactive 2D graph and architecture diagram of a multi-agent AI reasoning pipeline.',
    modelTag: 'Part-Wise Graph & Project Architect',
    resolution: '1280×800 · System Blueprint',
    imageUrl: createMasonrySvgArt({
      title: 'Multi-Agent Neural Topology',
      subtitle: 'Part-Wise System Architecture · 2D Graph Studio',
      bgStart: '#0f172a',
      bgMid: '#1e293b',
      bgEnd: '#334155',
      orb1: '#38bdf8',
      orb2: '#a855f7',
      accent: '#38bdf8',
      width: 960,
      height: 640,
      motif: 'cyber',
    }),
  },
  {
    id: 'art-solarpunk-citadel',
    title: 'Neo-Jaipur Solarpunk Sandstone & Glass Citadel',
    category: 'artwork',
    aspectClass: 'aspect-square',
    prompt:
      'Generate an image of a futuristic Neo-Jaipur solarpunk citadel blending carved pink sandstone with curved liquid-glass skybridges.',
    modelTag: 'GOT Agent Image Studio',
    resolution: '1024×1024 · Heritage Futurism',
    imageUrl: createMasonrySvgArt({
      title: 'Neo-Jaipur Solarpunk Citadel',
      subtitle: 'Sandstone & Liquid Glass · Golden Hour',
      bgStart: '#431407',
      bgMid: '#7c2d12',
      bgEnd: '#292524',
      orb1: '#fb923c',
      orb2: '#f43f5e',
      accent: '#fbbf24',
      width: 900,
      height: 900,
      motif: 'portrait',
    }),
  },
];

/**
 * Detects if the user is asking GOT Agent to create a 2D HTML5 video, canvas animation video,
 * or turn their current/past prompt into a playable 2D HTML5 Canvas video.
 */
export function isHtmlVideoRequest(prompt: string, agentMode?: string): boolean {
  if (agentMode === 'HTML Video Studio') return true;
  const clean = String(prompt || '').toLowerCase();
  if (!clean) return false;

  const hasVideoKeyword =
    /\b(2d\s*html|2d\s*video|2d\s*canvas|2d\s*animation|html\s*video|html5\s*video|canvas\s*video|video\s*in\s*html|html\s*type\s*video|animated\s*video|animation\s*video|playable\s*video|video\s*code|explainer\s*video|9\s*:\s*16\s*video|short\s*video|video\s*like\s*this|create\s+a?\s*(2d\s*)?video|make\s+a?\s*(2d\s*)?video|generate\s+a?\s*(2d\s*)?video|build\s+a?\s*(2d\s*)?video|html\s*canvas\s*animation)\b/i.test(
      clean
    );

  const referencesPastPromptForVideo =
    /\b(video|animation|canvas)\b/i.test(clean) &&
    /\b(past\s*prompt|previous\s*prompt|last\s*prompt|my\s*prompt|above\s*topic|previous\s*chat|past\s*chat)\b/i.test(
      clean
    );

  return hasVideoKeyword || referencesPastPromptForVideo;
}

/**
 * Extracts the core video subject from the user's prompt or falls back to their previous chat messages
 * when the user says "create a 2D HTML video from my past prompt".
 */
export function extractVideoTopicFromPromptOrHistory(
  prompt: string,
  history: Array<{ role: string; text: string }> = [],
  pastSummary = ''
): string {
  const clean = String(prompt || '').trim();
  const lower = clean.toLowerCase();

  const refersToPast =
    /\b(past\s*prompt|previous\s*prompt|last\s*prompt|earlier\s*prompt|previous\s*question|last\s*question|from\s*my\s*chat|about\s*my\s*past)\b/i.test(
      lower
    );

  const stripped = clean
    .replace(
      /^(please\s+)?(can\s+you\s+)?(create|make|generate|build|write|code|give\s+me)\s+(an?\s+)?(interactive\s+|playable\s+|9:16\s+|vertical\s+|2d\s+|custom\s+|new\s+)*(2d\s+html5?\s+type\s+video|2d\s+html\s+video|2d\s+canvas\s+video|2d\s+video|html5?\s+canvas\s+video|html\s+type\s+video|html\s+video|canvas\s+video|animated\s+video|video|canvas\s+animation)\s*(like\s+this\s+type\s*)?(about|on|for|of|from|explaining|showing)?\s*/i,
      ''
    )
    .replace(
      /\b(from\s+my\s+past\s+prompt|using\s+my\s+past\s+prompt|like\s+the\s+uploaded\s+video|in\s+html|part\s+wise|with\s+canvas)\b/gi,
      ''
    )
    .trim();

  if (!refersToPast && stripped.length >= 3) {
    return stripped.slice(0, 120);
  }

  // Look back in conversation history for the most recent meaningful user prompt
  const priorUserTurns = [...history]
    .reverse()
    .filter(
      (h) =>
        h.role === 'user' &&
        h.text &&
        h.text.trim() !== clean &&
        !isHtmlVideoRequest(h.text) &&
        h.text.trim().length > 3
    );

  if (priorUserTurns.length > 0) {
    return priorUserTurns[0].text.trim().slice(0, 120);
  }

  if (pastSummary && pastSummary.trim().length > 10) {
    const matches = [...pastSummary.matchAll(/\[User\]:\s*([^\n|]+)/gi)];
    for (let i = matches.length - 1; i >= 0; i--) {
      const candidate = matches[i][1]?.trim();
      if (candidate && !isHtmlVideoRequest(candidate) && candidate.length > 3) {
        return candidate.slice(0, 120);
      }
    }
  }

  return stripped || 'Interactive 2D Physics, Energy & System Architecture';
}

/**
 * Deeply analyzes the user's topic + prompt (and optional AI-generated spec) to construct a bespoke
 * 2D HTML5 <canvas> animated video where EVERY scene is dynamically tailored to the user's exact topic!
 */
export function buildPlayableHtmlCanvasVideoCode(
  rawTopic: string,
  userInstructions = '',
  aiSpec?: CustomAiVideoSpec
): {
  title: string;
  durationSec: number;
  chapters: string[];
  htmlCode: string;
} {
  const cleanTopic =
    (aiSpec?.title || rawTopic || 'Interactive 2D System Explainer')
      .trim()
      .replace(/[<>"']/g, '');
  const combinedLower = `${cleanTopic} ${userInstructions}`.toLowerCase();

  // Detect domain theme from prompt analysis
  const theme: NonNullable<CustomAiVideoSpec['theme']> =
    aiSpec?.theme ||
    (/\b(space|black\s*hole|planet|galaxy|mars|moon|star|orbit|rocket|solar\s*system|universe|cosmos|astronomy|gravity)\b/i.test(
      combinedLower
    )
      ? 'space'
      : /\b(plant|photosynthesis|leaf|tree|water\s*cycle|nature|climate|earth|ecosystem|ocean|rain|forest|solar\s*panel|green\s*energy)\b/i.test(
          combinedLower
        )
      ? 'nature'
      : /\b(heart|brain|dna|cell|blood|virus|immune|body|medicine|health|neuron|lung|biology|human)\b/i.test(
          combinedLower
        )
      ? 'medical'
      : /\b(code|coding|python|javascript|ai|neural\s*network|algorithm|computer|software|database|server|cyber|robot|machine\s*learning)\b/i.test(
          combinedLower
        )
      ? 'coding'
      : /\b(money|finance|stock|market|crypto|bitcoin|economy|business|startup|sales|revenue|trading)\b/i.test(
          combinedLower
        )
      ? 'finance'
      : /\b(atom|quantum|physics|engine|electric|battery|motor|chemical|reaction|force|energy|wave)\b/i.test(
          combinedLower
        )
      ? 'science'
      : /\b(nuclear\s+survival|atomic\s+blast|fallout\s+shelter)\b/i.test(
          combinedLower
        )
      ? 'nuclear'
      : 'general');

  const title =
    cleanTopic.length > 52
      ? `${cleanTopic.slice(0, 49)}...`
      : cleanTopic.replace(/\b\w/g, (c) => c.toUpperCase());

  // Extract meaningful topic keywords from the user's prompt to display as live 2D node labels
  const stopWords = new Set([
    'create', 'make', 'generate', 'build', 'video', 'html', 'html5', 'canvas', 'type', 'about', 'how',
    'what', 'why', 'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'like', 'please', 'explain',
    'work', 'works', 'working', 'step', 'steps', 'animated', 'animation', 'short', 'seconds',
  ]);
  const extractedWords = cleanTopic
    .split(/[^a-zA-Z0-9]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()))
    .map((w) => w.toUpperCase().slice(0, 14));

  const kw1 = aiSpec?.keywords?.[0] || extractedWords[0] || 'CORE INPUT';
  const kw2 = aiSpec?.keywords?.[1] || extractedWords[1] || 'PROCESS ENGINE';
  const kw3 = aiSpec?.keywords?.[2] || extractedWords[2] || 'ENERGY FLOW';
  const kw4 = aiSpec?.keywords?.[3] || extractedWords[3] || 'TRANSFORMATION';
  const kw5 = aiSpec?.keywords?.[4] || extractedWords[4] || 'OPTIMIZATION';
  const kw6 = aiSpec?.keywords?.[5] || extractedWords[5] || 'FINAL OUTPUT';

  const paletteMap: Record<
    NonNullable<CustomAiVideoSpec['theme']>,
    {
      primary: string;
      secondary: string;
      bgTop: string;
      bgBot: string;
      icons: [string, string, string, string];
    }
  > = {
    space: {
      primary: '#38BDF8',
      secondary: '#A855F7',
      bgTop: '#060814',
      bgBot: '#1E1B4B',
      icons: ['🚀', '🪐', '🌌', '✨'],
    },
    nature: {
      primary: '#10B981',
      secondary: '#F59E0B',
      bgTop: '#052E16',
      bgBot: '#064E3B',
      icons: ['☀️', '🌿', '💧', '⚡'],
    },
    medical: {
      primary: '#F43F5E',
      secondary: '#38BDF8',
      bgTop: '#1F0916',
      bgBot: '#0F172A',
      icons: ['🧬', '🫀', '🧠', '🔬'],
    },
    coding: {
      primary: '#10B981',
      secondary: '#06B6D4',
      bgTop: '#090D16',
      bgBot: '#111827',
      icons: ['💻', '🧠', '⚡', '🔐'],
    },
    finance: {
      primary: '#F59E0B',
      secondary: '#10B981',
      bgTop: '#141109',
      bgBot: '#1C1917',
      icons: ['📈', '💎', '⚡', '🏦'],
    },
    science: {
      primary: '#F59E0B',
      secondary: '#38BDF8',
      bgTop: '#0F172A',
      bgBot: '#1E293B',
      icons: ['⚛️', '⚡', '🔬', '🧲'],
    },
    nuclear: {
      primary: '#FFD700',
      secondary: '#FF4500',
      bgTop: '#1A1128',
      bgBot: '#7C2D12',
      icons: ['⚠️', '🛡️', '☢️', '📻'],
    },
    general: {
      primary: '#F59E0B',
      secondary: '#EC4899',
      bgTop: '#0F172A',
      bgBot: '#1E1B4B',
      icons: ['✨', '⚡', '🎯', '🚀'],
    },
  };

  const pal = paletteMap[theme] || paletteMap.general;
  const primaryColor = aiSpec?.primaryColor || pal.primary;
  const secondaryColor = aiSpec?.secondaryColor || pal.secondary;

  const chapters =
    Array.isArray(aiSpec?.chapters) && aiSpec!.chapters.length === 6
      ? aiSpec!.chapters
      : [
          `1. ${title.slice(0, 20)}: Core Overview`,
          `2. How ${kw1} Triggers ${kw2}`,
          `3. Inside the 2D ${kw3} Engine`,
          `4. Multi-Stage ${kw4} Pipeline`,
          `5. Key Rules & ${kw5} Checklist`,
          `6. Live Data Graph & Final Summary`,
        ];

  const subtitles: Array<[number, string]> =
    Array.isArray(aiSpec?.subtitles) && aiSpec!.subtitles.length >= 6
      ? aiSpec!.subtitles
      : [
          [
            0,
            `Welcome to this custom 2D animated explainer video on ${title}.`,
          ],
          [
            7,
            `Chapter 1: Let us examine the primary foundation of ${title} and how ${kw1} begins the cycle.`,
          ],
          [
            15,
            `Chapter 2: Watch the 2D vector simulation as energy flows directly from ${kw1} into ${kw2}.`,
          ],
          [
            23,
            `Each animated particle represents active momentum transferring across the system boundary in real time.`,
          ],
          [
            30,
            `Chapter 3: Inside the core mechanism — ${kw3} and ${kw4} synchronize at peak efficiency.`,
          ],
          [
            39,
            `Notice the real-time 2D gauge reaching optimal balance as pressure and throughput stabilize.`,
          ],
          [
            46,
            `Chapter 4: Here is the multi-layer structural diagram showing how ${title} scales reliably.`,
          ],
          [
            56,
            `Every connected node filters and amplifies the signal before passing it to the next stage.`,
          ],
          [
            66,
            `Chapter 5: Three critical takeaways for mastering ${title} in real-world applications.`,
          ],
          [
            74,
            `Stage 1 initializes ${kw1}, Stage 2 accelerates ${kw3}, and Stage 3 locks in verified output.`,
          ],
          [
            81,
            `Chapter 6: Look at the live 2D performance growth curve for ${title} — click Replay anytime!`,
          ],
        ];

  const metrics =
    Array.isArray(aiSpec?.metrics) && aiSpec!.metrics.length >= 4
      ? aiSpec!.metrics
      : [
          { label: kw1.slice(0, 8), value: 34 },
          { label: kw2.slice(0, 8), value: 56 },
          { label: kw3.slice(0, 8), value: 74 },
          { label: kw4.slice(0, 8), value: 86 },
          { label: kw5.slice(0, 8), value: 94 },
          { label: kw6.slice(0, 8), value: 99 },
        ];

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title} — 2D HTML5 Canvas Video</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet">
<style>
:root{--bg:#0e0e12;--fg:#f5f5f4;--panel:#18181c;--ac:${primaryColor};box-sizing:border-box}
html,body{height:100%;margin:0}
body{background:var(--bg);color:var(--fg);font-family:'Archivo Black',Impact,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:8px;box-sizing:border-box}
canvas{height:calc(100dvh - 130px);max-width:96vw;aspect-ratio:9/16;border:4px solid #0c0c0c;border-radius:16px;background:#0c0a09;box-shadow:0 18px 42px rgba(0,0,0,0.45)}
.bar{display:flex;align-items:center;gap:8px;background:var(--panel);border:3px solid #0c0c0c;border-radius:12px;padding:8px 10px;width:min(96vw,calc((100dvh - 130px)*.5625));box-sizing:border-box}
button{font:inherit;font-size:12px;background:var(--ac);color:#0c0c0c;border:3px solid #0c0c0c;border-radius:8px;padding:6px 10px;cursor:pointer;white-space:nowrap}
button:hover{filter:brightness(1.08)}
input[type=range]{flex:1;accent-color:${secondaryColor};min-width:0;cursor:pointer}
#tm{font-size:12px;min-width:86px;text-align:right;font-family:monospace;font-weight:bold}
#ch{font-size:12px;width:min(96vw,calc((100dvh - 130px)*.5625));margin:0;opacity:.9;display:flex;justify-content:space-between}
</style>
</head>
<body>
<canvas id="c" width="1080" height="1920"></canvas>
<p id="ch"><span id="chName">Chapter 1</span><span>2D HTML5 Canvas Engine</span></p>
<div class="bar">
  <button id="pp">Play</button>
  <button id="rp">Replay</button>
  <button id="mu">Voice on</button>
  <input id="sc" type="range" min="0" max="9200" value="0" aria-label="Timeline">
  <span id="tm">00:00 / 01:32</span>
</div>
<script>
const C=document.getElementById('c'),x=C.getContext('2d'),W=1080,H=1920,D=92,O='#0c0c0c';
const TITLE=${JSON.stringify(title.toUpperCase().slice(0, 28))};
const SUBTITLE_TOPIC=${JSON.stringify(title.slice(0, 44))};
const THEME=${JSON.stringify(theme)};
const KW=${JSON.stringify([kw1, kw2, kw3, kw4, kw5, kw6])};
const ICONS=${JSON.stringify(pal.icons)};
const METRICS=${JSON.stringify(metrics)};
const CH=[0,15,30,46,66,81,92];
const NM=${JSON.stringify(chapters)};
const SUB=${JSON.stringify(subtitles)};
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),pr=(t,a,b)=>cl((t-a)/(b-a)),eo=p=>1-Math.pow(1-p,3),lr=(a,b,p)=>a+(b-a)*p;
const rn=i=>{const v=Math.sin(i*12.9898+4.1)*43758.5453;return v-Math.floor(v)};

function RC(a,b,w,h,f,r=0){x.beginPath();x.roundRect(a,b,w,h,r);x.fillStyle=f;x.fill();x.lineWidth=6;x.strokeStyle=O;x.stroke()}
function CI(a,b,r,f,o=1){x.beginPath();x.arc(a,b,r,0,7);x.fillStyle=f;x.fill();if(o){x.lineWidth=6;x.strokeStyle=O;x.stroke()}}
function LM(a,b,c,d,col,w){x.lineCap='round';x.strokeStyle=O;x.lineWidth=w+8;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.strokeStyle=col;x.lineWidth=w;x.stroke()}
function TX(s,a,b,sz,col='#fff',al='center'){x.font=sz+"px 'Archivo Black',Impact,sans-serif";x.textAlign=al;x.fillStyle=col;x.fillText(s,a,b)}
function EM(s,a,b,sz,sc=1){x.save();x.translate(a,b);x.scale(sc,sc);x.font=sz+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(s,0,0);x.restore()}
function bg(a,b,h=H){const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(-300,-300,W+600,h+300)}

function draw2DGrid(alpha=0.08){
  x.strokeStyle='rgba(255,255,255,'+alpha+')';x.lineWidth=2;
  for(let i=0;i<20;i++){x.beginPath();x.moveTo(i*60,0);x.lineTo(i*60,H);x.stroke()}
  for(let j=0;j<32;j++){x.beginPath();x.moveTo(0,j*60);x.lineTo(W,j*60);x.stroke()}
}

/* Scene 1: Bespoke 2D Topic Hook & Orbital/Kinetic Core */
function s1(t){
  bg('${pal.bgTop}','${pal.bgBot}');
  draw2DGrid(0.06);
  const p=eo(pr(t,0.5,14));
  // Animated background particles
  for(let i=0;i<36;i++){
    const px=(rn(i)*W+t*28*(i%2?1:-1)+W)%W;
    const py=(rn(i+40)*1400+t*35)%1450;
    CI(px,py,4+rn(i)*6,i%2?'${primaryColor}':'${secondaryColor}',0);
  }
  // Central 2D Interactive Core Diagram for the Topic
  const cx=540,cy=840,baseR=190+Math.sin(t*3)*14;
  for(let ring=3;ring>=1;ring--){
    x.beginPath();
    x.arc(cx,cy,baseR+ring*68,0,Math.PI*2);
    x.strokeStyle=ring%2?'${primaryColor}':'${secondaryColor}';
    x.lineWidth=6;
    x.setLineDash([28,18]);
    x.lineDashOffset=-t*60*(ring%2?1:-1);
    x.stroke();
    x.setLineDash([]);
  }
  CI(cx,cy,baseR,'#111827');
  CI(cx,cy,baseR*0.68,'${primaryColor}');
  EM(ICONS[0],cx,cy,130,0.9+0.12*Math.sin(t*4));

  // Orbiting 2D Topic Keyword Satellites
  for(let k=0;k<4;k++){
    const ang=t*0.85+k*1.5708;
    const ox=cx+Math.cos(ang)*340;
    const oy=cy+Math.sin(ang)*340;
    LM(cx+Math.cos(ang)*baseR,cy+Math.sin(ang)*baseR,ox,oy,'${secondaryColor}',8);
    RC(ox-115,oy-44,230,88,'#18181b',20);
    TX(KW[k],ox,oy+12,26,'${primaryColor}');
  }

  RC(80,190,920,150,'rgba(12,12,16,0.92)',26);
  TX(TITLE,540,262,42,'${primaryColor}');
  TX('2D INTERACTIVE VISUAL EXPLAINER',540,312,24,'#e5e7eb');
}

/* Scene 2: 2D Animated Energy & Process Flow Pipeline */
function s2(t){
  bg('#090d16','${pal.bgBot}');
  draw2DGrid(0.07);
  TX('2D PROCESS & SIGNAL FLOW',540,210,40,'${primaryColor}');
  TX(SUBTITLE_TOPIC.toUpperCase(),540,265,26,'#cbd5e1');

  const nodes=[
    [240,520,KW[0],ICONS[0]],
    [840,520,KW[1],ICONS[1]],
    [240,960,KW[2],ICONS[2]],
    [840,960,KW[3],ICONS[3]],
    [540,1320,KW[4],'⚡']
  ];
  const edges=[[0,1],[1,2],[2,3],[3,4],[0,2],[1,3]];
  edges.forEach((e,idx)=>{
    const [a,b]=e;
    const [x1,y1]=nodes[a],[x2,y2]=nodes[b];
    LM(x1,y1,x2,y2,'#334155',14);
    const pulse=((t*0.9+idx*0.22)%1);
    const px=lr(x1,x2,pulse),py=lr(y1,y2,pulse);
    CI(px,py,18,'${primaryColor}');
  });

  nodes.forEach((n,idx)=>{
    const [nx,ny,lbl,ic]=n;
    const active=pr(t,15+idx*2.2,17+idx*2.2);
    const sc=0.85+0.15*eo(active);
    x.save();x.translate(nx,ny);x.scale(sc,sc);
    RC(-175,-95,350,190,active>0.5?'#1e293b':'#0f172a',28);
    CI(-105,0,52,idx%2?'${secondaryColor}':'${primaryColor}');
    EM(ic,-105,0,58,1);
    TX('STEP '+(idx+1),35,-22,24,'#94a3b8');
    TX(lbl,35,28,30,'#ffffff');
    x.restore();
  });
}

/* Scene 3: Live 2D Physics & Equilibrium Simulation */
function s3(t){
  bg('#0f172a','#18181b');
  draw2DGrid(0.08);
  const g=lr(0.18,0.96,eo(pr(t,31,44)));
  TX('REAL-TIME 2D SYSTEM SIMULATION',540,200,38,'#fff');

  // Top telemetry bar
  RC(140,250,800,68,'#111827',18);
  RC(140,250,800*g,68,g>0.72?'#10B981':'${primaryColor}',18);
  TX(KW[2]+' EFFICIENCY: '+Math.round(g*100)+'%',540,298,32,'#0c0c0c');

  // 2D Wave & Piston Chamber Simulation
  RC(120,420,840,760,'#090d16',32);
  x.save();
  x.beginPath();x.roundRect(130,430,820,740,26);x.clip();
  for(let w=0;w<3;w++){
    x.beginPath();
    for(let px=130;px<=950;px+=12){
      const py=820+Math.sin(px*0.018+t*(4+w)+w)*95*g+w*45;
      px===130?x.moveTo(px,py):x.lineTo(px,py);
    }
    x.strokeStyle=w===0?'${primaryColor}':w===1?'${secondaryColor}':'#10B981';
    x.lineWidth=10-w*2;
    x.stroke();
  }
  // Floating 2D energy spheres inside chamber
  for(let i=0;i<14;i++){
    const bx=200+((i*67+t*120)%680);
    const by=520+Math.sin(t*3+i)*180;
    CI(bx,by,22,i%2?'${primaryColor}':'${secondaryColor}');
  }
  x.restore();

  RC(160,1240,760,150,'#1e293b',24);
  TX(KW[3]+' + '+KW[4]+' SYNCHRONIZED',540,1305,32,'${primaryColor}');
  TX('PEAK STABILITY ACHIEVED AT '+Math.round(g*100)+'%',540,1355,24,'#e2e8f0');
}

/* Scene 4: 2D Multi-Layer Architecture & Blueprint */
function s4(t){
  bg('${pal.bgTop}','#090d16');
  draw2DGrid(0.07);
  TX('2D ARCHITECTURE BLUEPRINT',540,200,40,'${primaryColor}');

  const layers=[
    ['LAYER 1: '+KW[0]+' INTERFACE',ICONS[0],'${primaryColor}'],
    ['LAYER 2: '+KW[1]+' CONTROLLER',ICONS[1],'${secondaryColor}'],
    ['LAYER 3: '+KW[2]+' ENGINE',ICONS[2],'#10B981'],
    ['LAYER 4: '+KW[5]+' VERIFICATION',ICONS[3],'#38BDF8']
  ];
  layers.forEach((ly,i)=>{
    const y=310+i*260;
    const p=eo(pr(t,46+i*3,50+i*3));
    const slide=(1-p)*180;
    x.save();x.translate(slide,0);
    RC(120,y,840,200,'#1e293b',26);
    RC(145,y+25,150,150,ly[2],22);
    EM(ly[1],220,y+100,76,1);
    TX(ly[0],330,y+92,30,'#ffffff','left');
    TX('ACTIVE THROUGHPUT · 100% VERIFIED',330,y+142,22,ly[2],'left');
    x.restore();
    if(i<3){
      LM(540,y+200,540,y+260,'${primaryColor}',12);
    }
  });
}

/* Scene 5: Step-by-Step Action & Mastery Checklist */
function s5(t){
  bg('#111827','#18181b');
  draw2DGrid(0.06);
  const u=eo(pr(t,66,79));
  TX('KEY ACTION STEPS: '+TITLE.slice(0,18),540,220,38,'${primaryColor}');
  const steps=[
    ['INITIALIZE '+KW[0], 'Configure core inputs and baseline parameters'],
    ['ACCELERATE '+KW[2], 'Engage real-time 2D feedback and optimization'],
    ['VERIFY '+KW[5], 'Lock in high-efficiency output and analytics']
  ];
  for(let i=0;i<3;i++){
    const y=340+i*310,done=u>(i+1)*0.26;
    RC(100,y,880,240,done?'#064e3b':'#1f2937',28);
    CI(215,y+120,62,done?'#10B981':'${primaryColor}');
    TX(done?'✓':String(i+1),215,y+140,50,'#0c0c0c');
    TX(steps[i][0],315,y+102,36,'#ffffff','left');
    TX(steps[i][1].toUpperCase(),315,y+155,21,'#cbd5e1','left');
  }
}

/* Scene 6: Live 2D Bar + Curve Data Graph & Takeaway */
function s6(t){
  bg('#090d16','#18181b');
  draw2DGrid(0.06);
  TX(TITLE.slice(0,22)+' — 2D DATA GRAPH',540,200,36,'${primaryColor}');
  RC(80,250,920,760,'#111827',26);

  // Axes
  LM(160,330,160,910,'#64748b',6);
  LM(160,910,930,910,'#64748b',6);

  const pp=eo(pr(t,81.3,88.5));
  const maxM=Math.max(...METRICS.map(m=>m.value),100);
  const slot=740/METRICS.length;

  // 2D Bars
  METRICS.forEach((m,idx)=>{
    const bh=(m.value/maxM)*510*pp;
    const bx=185+idx*slot;
    const by=910-bh;
    RC(bx,by,slot*0.62,Math.max(8,bh),idx%2?'${secondaryColor}':'${primaryColor}',12);
    TX(String(Math.round(m.value*pp))+'%',bx+slot*0.31,by-18,24,'#ffffff');
    TX(m.label,bx+slot*0.31,955,20,'#cbd5e1');
  });

  // Smooth Trendline Overlay
  x.beginPath();
  METRICS.forEach((m,idx)=>{
    const px=185+idx*slot+slot*0.31;
    const py=910-(m.value/maxM)*510*pp;
    idx===0?x.moveTo(px,py):x.lineTo(px,py);
  });
  x.strokeStyle='#10B981';x.lineWidth=10;x.stroke();

  RC(120,1070,840,240,'#1e293b',28);
  TX('COMPLETE 2D EXPLAINER VERIFIED',540,1165,36,'#10B981');
  TX('Topic: '+SUBTITLE_TOPIC,540,1225,26,'#f8fafc');
}

function cam(t,i){
  const u=pr(t,CH[i],CH[i+1]);
  if(i==0)return[lr(1,1.15,u),540,840,0];
  if(i==1)return[lr(1,1.08,u),540,880,0];
  if(i==2)return[lr(1.14,1,eo(u)),540,820,0];
  if(i==3)return[lr(1,1.12,eo(pr(t,50,62))),540,860,0];
  if(i==4)return[lr(1,1.06,u),540,820,0];
  return[lr(1.12,1,eo(pr(t,81,86))),540,760,0];
}

function hud(t,si){
  for(let i=0;i<6;i++){
    x.fillStyle='rgba(255,255,255,.25)';x.fillRect(20+i*173,34,167,10);
    x.fillStyle='${primaryColor}';x.fillRect(20+i*173,34,167*pr(t,CH[i],CH[i+1]),10);
  }
  x.save();x.shadowColor='#000';x.shadowBlur=8;TX(NM[si],24,92,30,'#fff','left');x.restore();
}

function subs(t){
  let s=0;for(let i=0;i<SUB.length;i++)if(t>=SUB[i][0])s=i;
  const tx=SUB[s][1],st=SUB[s][0],en=SUB[s+1]?SUB[s+1][0]:D,ws=tx.split(' ');
  x.font="40px 'Archivo Black',Impact,sans-serif";x.textAlign='left';
  const L=[];let cur=[];
  for(const w of ws){const tt=cur.concat(w).join(' ');if(x.measureText(tt).width>880&&cur.length){L.push(cur);cur=[w]}else cur.push(w)}
  L.push(cur);
  const bh=L.length*58+44,by=1790-bh,n=Math.floor(pr(t,st,st+(en-st)*.78)*ws.length+1);
  x.fillStyle='rgba(10,10,12,.92)';x.fillRect(60,by,960,bh);
  x.fillStyle='${primaryColor}';x.fillRect(60,by,14,bh);
  let c=0;
  L.forEach((ln,li)=>{
    let px=100;
    ln.forEach(w=>{
      x.fillStyle=c<n?'#fff':'rgba(255,255,255,.28)';
      x.fillText(w,px,by+52+li*58);
      px+=x.measureText(w+' ').width;c++;
    });
  });
}

function trans(t){
  const B=[15,30,46,66,81];
  for(let i=0;i<5;i++){
    const d=t-B[i];if(Math.abs(d)>=.42)continue;
    const l=d<0?W*(1-eo((d+.42)/.42)):0,r=d<0?W:W*(1-eo(d/.42));
    x.save();x.beginPath();x.rect(l,0,r-l,H);x.clip();
    x.fillStyle='${primaryColor}';x.fillRect(0,0,W,H);
    RC(60,880,960,140,O,12);TX(NM[i+1],540,968,42,'${primaryColor}');
    x.restore();
  }
}

let t=0,playing=true,last=0,vo=true,si0=-1;
function render(){
  x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);
  let si=5;for(let i=0;i<5;i++)if(t<CH[i+1]){si=i;break}
  const[s,fx,fy,sh]=cam(t,si);
  x.save();x.beginPath();x.rect(0,0,W,H);x.clip();
  x.translate(fx+sh,fy);x.scale(s,s);x.translate(-fx,-fy);
  [s1,s2,s3,s4,s5,s6][si](t);
  x.restore();
  hud(t,si);subs(t);trans(t);
  if(t===0&&!playing){
    x.fillStyle='rgba(0,0,0,.48)';x.fillRect(0,0,W,H);
    CI(540,860,115,'${primaryColor}');
    x.fillStyle=O;x.beginPath();x.moveTo(505,800);x.lineTo(505,920);x.lineTo(610,860);x.fill();
  }
  document.getElementById('chName').textContent='Chapter: '+NM[si];
}

const $=id=>document.getElementById(id),mmss=v=>String(Math.floor(v/60)).padStart(2,'0')+':'+String(Math.floor(v%60)).padStart(2,'0');
function say(){
  if(!vo||!playing||!window.speechSynthesis)return;
  let s=0;for(let i=0;i<SUB.length;i++)if(t>=SUB[i][0])s=i;
  if(s!==si0){
    si0=s;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(SUB[s][1]);
      u.rate=1.08;
      speechSynthesis.speak(u);
    }catch(e){}
  }
}
function stopV(){si0=-1;try{speechSynthesis.cancel()}catch(e){}}
function ui(){$('pp').textContent=playing?'Pause':'Play';$('sc').value=Math.round(t*100);$('tm').textContent=mmss(t)+' / 01:32'}
function frame(ts){
  if(playing){t=Math.min(D,t+(ts-last)/1000);if(t>=D){playing=false;stopV()}}
  last=ts;say();render();ui();requestAnimationFrame(frame);
}
$('pp').onclick=()=>{if(t>=D)t=0;playing=!playing;if(!playing)stopV()};
$('rp').onclick=()=>{t=0;stopV();playing=true};
$('mu').onclick=()=>{vo=!vo;$('mu').textContent=vo?'Voice on':'Voice off';if(!vo)stopV()};
$('sc').oninput=e=>{t=e.target.value/100;stopV()};
C.onclick=()=>$('pp').click();
requestAnimationFrame(ts=>{last=ts;frame(ts)});
</script>
</body>
</html>`;

  return {
    title,
    durationSec: 92,
    chapters,
    htmlCode,
  };
}

/**
 * Builds a complete, structured Part-Wise (Claude AI style) response containing
 * the custom 2D storyboard analysis AND the 100% playable 2D HTML5 Canvas Video code block.
 */
export function buildPartWiseHtmlVideoResponse(
  prompt: string,
  history: Array<{ role: string; text: string }> = [],
  pastSummary = '',
  agentMode = 'GOT LOCAL',
  aiSpec?: CustomAiVideoSpec
) {
  const topic = extractVideoTopicFromPromptOrHistory(
    prompt,
    history,
    pastSummary
  );
  const videoPkg = buildPlayableHtmlCanvasVideoCode(topic, prompt, aiSpec);

  const reply = `### Part 1 — Custom 2D Video Analysis & Storyboard
I have analyzed your topic **"${videoPkg.title}"** and generated a custom **9:16 2D HTML5 Canvas Animated Video**:
• **Topic Analyzed**: **${videoPkg.title}**
• **2D Canvas Resolution & Frame Rate**: \`1080×1920\` Vertical 2D Vector Canvas at 60 FPS (Auto-Playing)
• **Custom 6-Chapter Storyboard (${videoPkg.durationSec}s)**: ${videoPkg.chapters.join(' → ')}
• **2D Scenes Included**: Orbital Topic Core (\`s1\`), 2D Signal & Process Pipeline (\`s2\`), Real-Time Wave & Chamber Simulation (\`s3\`), 4-Layer Architecture Blueprint (\`s4\`), Action Checklist (\`s5\`), and Live 2D Bar + Trendline Graph (\`s6\`).

---

### Part 2 — Interactive 2D HTML5 Canvas Video Player & Code
Your custom 2D HTML5 video is playing live below (use **Pause / Play**, **Replay**, **Voice on/off**, or drag the timeline scrubber, or click **Download .HTML Video** to save it):

\`\`\`html
${videoPkg.htmlCode}
\`\`\`

---

### Part 3 — Customizing Chapters, 2D Graphics & Voiceover
1. **Interactive Timeline**: Drag the scrubber to inspect any of the 6 custom 2D scenes or toggle Web Speech API voiceover narration.
2. **Expand or Modify**: Ask me to *"Change the 2D graph data in Chapter 6"* or *"Create a 2D graph for ${videoPkg.title}"* anytime!`;

  return {
    reply,
    highlights: [
      `Custom 2D HTML5 Video: ${videoPkg.title.slice(0, 22)}`,
      '6 Custom 2D Canvas Scenes + Voice',
      `Model: ${agentMode}`,
    ],
    visionSummary: '',
    sources: [],
    followUpPrompts: [
      `Create an interactive 2D graph and chart for "${videoPkg.title.slice(0, 24)}"`,
      `Add project "${videoPkg.title.slice(0, 24)}" to my AI Project Workspace`,
      `Create a 2D HTML5 video based on my previous chat topic`,
    ],
  };
}
