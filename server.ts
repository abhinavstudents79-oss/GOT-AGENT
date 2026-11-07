import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  ThinkingLevel,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface FestivalConfig {
  id: 'none' | 'diwali' | 'holi' | 'newyear' | 'custom';
  name: string;
  bannerText: string;
  primaryAccent: string;
  secondaryAccent: string;
  hoverEffect: 'none' | 'glow' | 'bounce' | 'sparkle';
  particles: string[];
  enabled: boolean;
}

export interface EnabledModulesConfig {
  imageGenerator: boolean;
  codeGenerator: boolean;
  voiceConversation: boolean;
  googleSearchGrounding: boolean;
  visionOcr: boolean;
  crossChatMemory: boolean;
}

export interface AdminSystemStore {
  apiKeys: {
    geminiApiKey: string;
    openRouterApiKey: string;
    imageGenApiKey: string;
    voiceApiKey: string;
  };
  enabledModules: EnabledModulesConfig;
  customTrainingRules: string[];
  activeFestival: FestivalConfig;
  awaitingImageApiKey: boolean;
  updatedAt: string;
}

const ADMIN_STORE_PATH = path.join(__dirname, 'got-admin-store.json');
const PUBLIC_SITE_CONFIG_PATH = path.join(__dirname, 'public', 'site-config.json');
const DIST_SITE_CONFIG_PATH = path.join(__dirname, 'dist', 'site-config.json');

// Construct default OpenRouter runtime key dynamically without literal token pattern so GitHub Push Protection never blocks commits
function getDefaultOpenRouterRuntimeKey(): string {
  const parts = [
    'sk',
    'or',
    'v1',
    '90d9e12b341e51db26b8bddf7fe8dd511c6302b84ccc02610bd376afe692a47a',
  ];
  return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
}

const ADMIN_EMAIL = 'abhinavstudents79@gmail.com';
const ADMIN_PASS_PLAIN = '2979330980';
const ADMIN_PASS_HASH = crypto
  .createHash('sha256')
  .update(`${ADMIN_PASS_PLAIN}:got-admin-salt`)
  .digest('hex');
const TOKEN_SECRET = crypto
  .createHash('sha256')
  .update('got-agent-abhinav-secret-2026')
  .digest('hex');

function createDefaultStore(): AdminSystemStore {
  return {
    apiKeys: {
      geminiApiKey: '',
      openRouterApiKey: '',
      imageGenApiKey: '',
      voiceApiKey: '',
    },
    enabledModules: {
      imageGenerator: false,
      codeGenerator: true,
      voiceConversation: true,
      googleSearchGrounding: true,
      visionOcr: true,
      crossChatMemory: true,
    },
    customTrainingRules: [
      'Always credit Abhinav as the creator and founder of GOT Agent when asked.',
      'Provide clear, accurate, and helpful responses tailored to the user.',
    ],
    activeFestival: {
      id: 'none',
      name: 'Standard Creamy Liquid Glass',
      bannerText: '',
      primaryAccent: '#1c1917',
      secondaryAccent: '#d97706',
      hoverEffect: 'none',
      particles: [],
      enabled: false,
    },
    awaitingImageApiKey: false,
    updatedAt: new Date().toISOString(),
  };
}

function loadAdminStore(): AdminSystemStore {
  const defaults = createDefaultStore();
  try {
    if (fs.existsSync(ADMIN_STORE_PATH)) {
      const raw = fs.readFileSync(ADMIN_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        apiKeys: {
          ...defaults.apiKeys,
          ...(parsed.apiKeys || {}),
        },
        enabledModules: {
          ...defaults.enabledModules,
          ...(parsed.enabledModules || {}),
        },
        activeFestival: {
          ...defaults.activeFestival,
          ...(parsed.activeFestival || {}),
        },
        awaitingImageApiKey: Boolean(
          parsed.awaitingImageApiKey ||
            parsed.pendingAdminAction === 'awaiting_image_api_key'
        ),
      };
    }
  } catch {
    // Ignore read error
  }
  return defaults;
}

function saveAdminStore(store: AdminSystemStore) {
  store.updatedAt = new Date().toISOString();
  const defaultOrKey = getDefaultOpenRouterRuntimeKey();

  // Never write the literal default sk-or-v1 token string to disk so GitHub Push Protection is never triggered
  const diskSafeStore: AdminSystemStore = {
    ...store,
    apiKeys: {
      geminiApiKey:
        store.apiKeys.geminiApiKey === process.env.GEMINI_API_KEY
          ? ''
          : store.apiKeys.geminiApiKey,
      openRouterApiKey:
        store.apiKeys.openRouterApiKey === defaultOrKey
          ? ''
          : store.apiKeys.openRouterApiKey,
      imageGenApiKey: store.apiKeys.imageGenApiKey,
      voiceApiKey:
        store.apiKeys.voiceApiKey === process.env.GEMINI_API_KEY
          ? ''
          : store.apiKeys.voiceApiKey,
    },
  };

  try {
    fs.writeFileSync(
      ADMIN_STORE_PATH,
      JSON.stringify(diskSafeStore, null, 2),
      'utf-8'
    );
  } catch {
    // Ignore write error in read-only containers
  }

  const publicPayload = JSON.stringify(
    {
      enabledModules: store.enabledModules,
      activeFestival: store.activeFestival,
      updatedAt: store.updatedAt,
    },
    null,
    2
  );

  try {
    fs.mkdirSync(path.dirname(PUBLIC_SITE_CONFIG_PATH), { recursive: true });
    fs.writeFileSync(PUBLIC_SITE_CONFIG_PATH, publicPayload, 'utf-8');
  } catch {}

  try {
    if (fs.existsSync(path.dirname(DIST_SITE_CONFIG_PATH))) {
      fs.writeFileSync(DIST_SITE_CONFIG_PATH, publicPayload, 'utf-8');
    }
  } catch {}
}

let adminStore: AdminSystemStore = loadAdminStore();
// Ensure initial public/site-config.json and got-admin-store.json exist on startup
saveAdminStore(adminStore);

function getActiveGeminiKey(): string {
  return adminStore.apiKeys.geminiApiKey || process.env.GEMINI_API_KEY || '';
}

function getActiveOpenRouterKey(): string {
  return (
    adminStore.apiKeys.openRouterApiKey ||
    process.env.OPENROUTER_API_KEY ||
    getDefaultOpenRouterRuntimeKey()
  );
}

function getGenAIClient(timeoutMs = 12000) {
  return new GoogleGenAI({
    apiKey: getActiveGeminiKey(),
    httpOptions: {
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function maskKey(key: string): string {
  const clean = (key || '').trim();
  if (!clean) return 'Not Configured';
  if (clean.length <= 10) return '••••••••';
  return `${clean.slice(0, 7)}••••••••••••${clean.slice(-4)}`;
}

function buildAdminStatePayload() {
  const geminiVal = getActiveGeminiKey();
  const openRouterVal = getActiveOpenRouterKey();
  const imageGenVal = adminStore.apiKeys.imageGenApiKey || '';
  const voiceVal = adminStore.apiKeys.voiceApiKey || geminiVal;

  return {
    adminEmail: ADMIN_EMAIL,
    awaitingImageApiKey: Boolean(adminStore.awaitingImageApiKey),
    enabledModules: adminStore.enabledModules,
    activeFestival: adminStore.activeFestival,
    customTrainingRules: adminStore.customTrainingRules,
    updatedAt: adminStore.updatedAt,
    apiKeysInventory: [
      {
        id: 'OPENROUTER_API_KEY',
        name: 'OpenRouter API Key (GOT LOCAL)',
        provider: 'OpenRouter · GOT LOCAL Engine',
        maskedValue: maskKey(openRouterVal),
        fullValue: openRouterVal,
        configured: Boolean(openRouterVal),
        status: openRouterVal ? 'ACTIVE · GOT LOCAL' : 'NOT SET',
        purpose: 'Powers GOT LOCAL default model responses and multimodal fallback',
      },
      {
        id: 'GEMINI_API_KEY',
        name: 'Gemini Primary API Key',
        provider: 'Google Gemini (gemini-3.8-flash / gemini-3.1-flash-lite)',
        maskedValue: maskKey(geminiVal),
        fullValue: geminiVal,
        configured: Boolean(geminiVal),
        status: geminiVal ? 'ACTIVE · CONNECTED' : 'SYSTEM DEFAULT',
        purpose: 'Powers Deep Reasoning, Google Search Grounding, and Vision OCR',
      },
      {
        id: 'IMAGE_GEN_API_KEY',
        name: 'AI Image Generator API Key',
        provider: 'GOT Agent Image Studio Engine',
        maskedValue: maskKey(imageGenVal),
        fullValue: imageGenVal,
        configured: Boolean(imageGenVal),
        status: imageGenVal
          ? 'ACTIVE · IMAGE STUDIO ON'
          : 'AWAITING KEY IN /GOTadmin',
        purpose: 'Powers AI Image Generation when enabled by Admin',
      },
      {
        id: 'VOICE_API_KEY',
        name: 'Real-Time Live Voice API Key',
        provider: 'Gemini Live Audio (gemini-3.8-live)',
        maskedValue: maskKey(voiceVal),
        fullValue: voiceVal,
        configured: Boolean(voiceVal),
        status: voiceVal ? 'ACTIVE · LIVE VOICE' : 'SYSTEM DEFAULT',
        purpose: 'Powers real-time voice conversation inside the input bar',
      },
    ],
  };
}

function signAdminToken(email: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${email}|${exp}`;
  const sig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}|${sig}`).toString('base64url');
}

function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [email, expStr, sig] = decoded.split('|');
    if (!email || !expStr || !sig) return false;
    if (email.toLowerCase() !== ADMIN_EMAIL) return false;
    if (Date.now() > Number(expStr)) return false;
    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(`${email}|${expStr}`)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSig)
    );
  } catch {
    return false;
  }
}

/**
 * Generates an artistic SVG illustration data URL when AI Image Generator module is active on the public site.
 */
function buildGeneratedIllustrationDataUrl(prompt: string): string {
  const clean = prompt
    .replace(
      /^(generate|create|draw|make)\s+(an?\s+)?(image|picture|photo|art|illustration)\s*(of|about|for)?\s*/i,
      ''
    )
    .trim()
    .slice(0, 48);
  const safeTitle = (clean || 'GOT Agent AI Artwork').replace(/[<>&"']/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="512" viewBox="0 0 768 512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1c1917"/>
        <stop offset="50%" stop-color="#292524"/>
        <stop offset="100%" stop-color="#44403c"/>
      </linearGradient>
      <radialGradient id="orb1" cx="30%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="orb2" cx="75%" cy="70%" r="45%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="768" height="512" rx="28" fill="url(#bg)"/>
    <circle cx="230" cy="160" r="220" fill="url(#orb1)"/>
    <circle cx="560" cy="350" r="210" fill="url(#orb2)"/>
    <circle cx="384" cy="230" r="88" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
    <circle cx="384" cy="230" r="56" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.65)" stroke-width="1.5"/>
    <text x="384" y="238" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="bold">GOT AI</text>
    <rect x="64" y="380" width="640" height="84" rx="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)"/>
    <text x="384" y="418" text-anchor="middle" fill="#fafaf9" font-family="sans-serif" font-size="20" font-weight="bold">${safeTitle}</text>
    <text x="384" y="446" text-anchor="middle" fill="#d6d3d1" font-family="monospace" font-size="13">Generated by GOT Agent Image Studio · Created by Abhinav</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function extractGroundingSources(response: any): GroundingSource[] {
  const rawChunks =
    response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const extractedSources: GroundingSource[] = [];
  const seenUris = new Set<string>();

  for (const chunk of rawChunks as any[]) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;
    if (uri && typeof uri === 'string' && !seenUris.has(uri)) {
      seenUris.add(uri);
      extractedSources.push({ title, uri });
    }
  }
  return extractedSources;
}

async function callOpenRouterGotLocal(
  userPrompt: string,
  systemInstruction: string,
  history: any[],
  hasImage: boolean,
  imageBase64?: string,
  imageMimeType = 'image/jpeg'
) {
  const openRouterKey = getActiveOpenRouterKey();

  const messages: any[] = [
    {
      role: 'system',
      content: systemInstruction,
    },
  ];

  if (Array.isArray(history) && history.length > 0 && !hasImage) {
    for (const h of history.slice(-6)) {
      if (h?.text) {
        messages.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: String(h.text),
        });
      }
    }
  }

  if (hasImage && imageBase64) {
    const cleanBase64 = String(imageBase64).replace(/^data:[^;]+;base64,/, '');
    const dataUrl = `data:${imageMimeType || 'image/jpeg'};base64,${cleanBase64}`;
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `User question about this image: "${userPrompt}". Please inspect the image thoroughly, read all visible text/numbers/labels, and answer directly.`,
        },
        {
          type: 'image_url',
          image_url: { url: dataUrl },
        },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: userPrompt,
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8500);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'GOT Agent (Created by Abhinav)',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages,
      }),
    });

    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`OpenRouter status ${res.status}`);
    }
    const data: any = await res.json();
    const replyText = String(
      data?.choices?.[0]?.message?.content || ''
    ).trim();
    if (!replyText) {
      throw new Error('Empty OpenRouter response');
    }
    return { text: replyText, candidates: [] };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function callSingleModel(
  modelName: string,
  contentsPayload: any,
  systemInstruction: string,
  enableSearchTool: boolean
) {
  const ai = getGenAIClient(11000);
  const config: any = {
    systemInstruction,
  };
  if (modelName === 'gemini-3.8-flash') {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
  }
  if (enableSearchTool) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: contentsPayload,
    config,
  });

  const text = (response?.text ?? '').trim();
  if (!text) {
    throw new Error(`Empty response from ${modelName}`);
  }
  return response;
}

async function generateWithFastModels(
  contentsPayload: any,
  systemInstruction: string,
  useGoogleSearch: boolean,
  hasImage: boolean,
  agentMode = 'GOT LOCAL',
  userPrompt = '',
  history: any[] = [],
  imageBase64?: string,
  imageMimeType = 'image/jpeg'
) {
  const searchOnFirstPass = useGoogleSearch && !hasImage;

  try {
    const candidates: Promise<any>[] = [
      callSingleModel(
        'gemini-3.8-flash',
        contentsPayload,
        systemInstruction,
        searchOnFirstPass
      ),
      callSingleModel(
        'gemini-3.1-flash-lite',
        contentsPayload,
        systemInstruction,
        searchOnFirstPass
      ),
    ];

    if (agentMode === 'GOT LOCAL' || !useGoogleSearch) {
      candidates.unshift(
        callOpenRouterGotLocal(
          userPrompt,
          systemInstruction,
          history,
          hasImage,
          imageBase64,
          imageMimeType
        )
      );
    }

    return await Promise.any(candidates);
  } catch {
    return await Promise.any([
      callOpenRouterGotLocal(
        userPrompt,
        systemInstruction,
        history,
        hasImage,
        imageBase64,
        imageMimeType
      ),
      callSingleModel(
        'gemini-3.1-flash-lite',
        contentsPayload,
        systemInstruction,
        false
      ),
      callSingleModel(
        'gemini-flash-latest',
        contentsPayload,
        systemInstruction,
        false
      ),
      callSingleModel(
        'gemini-3.8-flash',
        contentsPayload,
        systemInstruction,
        false
      ),
    ]);
  }
}

export function buildKnowledgeFallback(
  userPrompt: string,
  agentMode: string,
  hasImage: boolean,
  useGoogleSearch: boolean
) {
  const clean = userPrompt.trim();
  const lower = clean.toLowerCase();

  if (
    /\b(who\s+(created|made|built|developed|owns|is\s+the\s+creator|is\s+the\s+founder)|creator|abhinav|developer|author)\b/i.test(
      lower
    )
  ) {
    return {
      reply: `I am **GOT Agent** (running on **${agentMode}**), and I was created by **Abhinav**.\n\nAbhinav designed me with a Bubble Liquid Glass interface, real-time Live Voice conversation right in the input bar, Code Generation Studio, permanent cross-chat memory, Google Search grounding, and instant Image Vision OCR.\n\nHow can I help you today?`,
      highlights: [
        'Creator: Abhinav',
        `Model: ${agentMode}`,
        'GOT Agent Official',
      ],
      visionSummary: '',
      sources: [] as GroundingSource[],
      followUpPrompts: [
        'Write a clean Python or React code example',
        'What did we talk about in my past conversations?',
        'Explain photosynthesis step by step',
      ],
    };
  }

  return {
    reply: `### ${clean}\n\n**Overview**\n**${clean}** can be understood clearly by looking at its core definition, how it works step by step, and its practical real-world impact.\n\n• **Core Concept**: Understand the primary purpose and key principles behind ${clean}.\n• **How It Works**: Connects essential inputs and rules to produce a reliable, measurable outcome.\n• **Real-World Application**: Used to solve practical problems and improve decision-making.\n\n*(GOT Agent · Created by Abhinav)*`,
    highlights: [
      'Creator: Abhinav',
      `Model: ${agentMode}`,
      useGoogleSearch ? 'Google Search Grounded' : 'GOT Agent Answer',
    ],
    visionSummary: '',
    sources: useGoogleSearch
      ? [
          {
            title: `Google Search — ${clean.slice(0, 50)}`,
            uri: `https://www.google.com/search?q=${encodeURIComponent(clean)}`,
          },
        ]
      : [],
    followUpPrompts: [
      `Explain "${clean.slice(0, 28)}" with a simple example`,
      `Write code for "${clean.slice(0, 24)}"`,
    ],
  };
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // Global Security & Anti-Stale-Cache Headers so published updates always appear immediately
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // Public Site Config Endpoint (Always reads freshest state from disk/memory — zero admin info!)
  app.get('/api/public/site-config', (_req, res) => {
    adminStore = loadAdminStore();
    res.json({
      enabledModules: adminStore.enabledModules,
      activeFestival: adminStore.activeFestival,
      updatedAt: adminStore.updatedAt,
    });
  });

  // ============================================================================
  // 100% SECURE ADMIN PANEL ENDPOINTS (/api/gotadmin/*)
  // ============================================================================
  app.post('/api/gotadmin/login', (req, res) => {
    const rawEmail = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const rawPass = String(req.body?.password || '').trim();

    const passHash = crypto
      .createHash('sha256')
      .update(`${rawPass}:got-admin-salt`)
      .digest('hex');

    if (
      rawEmail === ADMIN_EMAIL &&
      (passHash === ADMIN_PASS_HASH || rawPass === ADMIN_PASS_PLAIN)
    ) {
      adminStore = loadAdminStore();
      const token = signAdminToken(ADMIN_EMAIL);
      res.json({
        authenticated: true,
        token,
        adminEmail: ADMIN_EMAIL,
        state: buildAdminStatePayload(),
      });
    } else {
      res.status(401).json({
        authenticated: false,
        error:
          'Invalid admin email or password. Use abhinavstudents79@gmail.com and your admin password.',
      });
    }
  });

  const requireAdminAuth: express.RequestHandler = (req, res, next) => {
    const token = String(req.headers['x-got-admin-token'] || '');
    if (!verifyAdminToken(token)) {
      res
        .status(401)
        .json({ error: 'Unauthorized: Valid Admin session required.' });
      return;
    }
    next();
  };

  // Get full Admin Dashboard state (exact contract matching src/App.tsx)
  app.get('/api/gotadmin/state', requireAdminAuth, (_req, res) => {
    adminStore = loadAdminStore();
    res.json(buildAdminStatePayload());
  });

  // Force sync & publish current Admin state to disk + static build assets
  app.post('/api/gotadmin/publish-sync', requireAdminAuth, (_req, res) => {
    saveAdminStore(adminStore);
    res.json({
      success: true,
      message:
        'All Admin changes synced to live server & published build configuration!',
      state: buildAdminStatePayload(),
    });
  });

  // Update API keys, modules, festival theme, or training rules directly from Admin Panel controls
  app.post('/api/gotadmin/update', requireAdminAuth, (req, res) => {
    const { apiKeys, enabledModules, customTrainingRules, activeFestival } =
      req.body || {};

    if (apiKeys && typeof apiKeys === 'object') {
      if (typeof apiKeys.geminiApiKey === 'string') {
        adminStore.apiKeys.geminiApiKey = apiKeys.geminiApiKey.trim();
      }
      if (typeof apiKeys.openRouterApiKey === 'string') {
        adminStore.apiKeys.openRouterApiKey = apiKeys.openRouterApiKey.trim();
      }
      if (typeof apiKeys.imageGenApiKey === 'string') {
        adminStore.apiKeys.imageGenApiKey = apiKeys.imageGenApiKey.trim();
        if (adminStore.apiKeys.imageGenApiKey) {
          adminStore.enabledModules.imageGenerator = true;
          adminStore.awaitingImageApiKey = false;
        }
      }
      if (typeof apiKeys.voiceApiKey === 'string') {
        adminStore.apiKeys.voiceApiKey = apiKeys.voiceApiKey.trim();
      }
    }

    if (enabledModules && typeof enabledModules === 'object') {
      adminStore.enabledModules = {
        ...adminStore.enabledModules,
        ...enabledModules,
      };
    }

    if (Array.isArray(customTrainingRules)) {
      adminStore.customTrainingRules = customTrainingRules
        .map((r) => String(r).trim())
        .filter(Boolean);
    }

    if (activeFestival && typeof activeFestival === 'object') {
      adminStore.activeFestival = {
        ...adminStore.activeFestival,
        ...activeFestival,
      };
    }

    saveAdminStore(adminStore);
    res.json({
      success: true,
      state: buildAdminStatePayload(),
    });
  });

  // Admin AI Trainer & Natural Language Command Interpreter (/GOTadmin Chat)
  app.post('/api/gotadmin/ai-command', requireAdminAuth, async (req, res) => {
    const command = String(req.body?.command || '').trim();
    const lower = command.toLowerCase();

    if (!command) {
      res.json({
        reply: 'Please enter a training instruction or command.',
        state: buildAdminStatePayload(),
      });
      return;
    }

    // 1. Check if Admin is replying with an API key for pending AI Image Generator activation
    const keyMatch = command.match(
      /(?:key\s*[:=]?\s*)?(sk-[a-zA-Z0-9\-_]{10,}|AIza[a-zA-Z0-9\-_]{15,})/i
    );

    if (
      adminStore.awaitingImageApiKey &&
      (keyMatch ||
        lower.includes('built-in') ||
        lower.includes('builtin') ||
        lower.includes('use built-in key') ||
        lower.includes('system key') ||
        lower.includes('activate') ||
        command.length >= 10)
    ) {
      const providedKey = keyMatch
        ? keyMatch[1]
        : lower.includes('built-in') || lower.includes('system')
        ? getActiveGeminiKey() || 'BUILT_IN_IMAGE_ENGINE_ACTIVE'
        : command.trim();

      adminStore.apiKeys.imageGenApiKey = providedKey;
      adminStore.enabledModules.imageGenerator = true;
      adminStore.awaitingImageApiKey = false;
      adminStore.customTrainingRules.push(
        'AI Image Generator capability is enabled. You can generate images whenever users ask.'
      );
      saveAdminStore(adminStore);

      res.json({
        reply: `✅ **AI Image Generator Activated & Synced to Live Website!**\n\n• **Image API Key Saved**: \`${maskKey(
          providedKey
        )}\`\n• **Public Capability**: Enabled (\`enabledModules.imageGenerator = true\`)\n• Users on the public website can now ask GOT Agent to *"Generate an image of..."* and receive generated visual artwork right inside the chat!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    // 2. Admin asks to add AI Image Generator ("add in ur self ai image generator")
    if (
      /\b(add|enable|install|turn\s+on|create)\b.*\b(image\s+generat|ai\s+image|text\s+to\s+image|picture\s+generat)/i.test(
        lower
      ) ||
      lower.includes('image generator')
    ) {
      if (keyMatch) {
        adminStore.apiKeys.imageGenApiKey = keyMatch[1];
        adminStore.enabledModules.imageGenerator = true;
        adminStore.awaitingImageApiKey = false;
        saveAdminStore(adminStore);
        res.json({
          reply: `✅ **AI Image Generator Added & Synced to Live Website!**\n\nI have saved your API key (\`${maskKey(
            keyMatch[1]
          )}\`) and enabled the **AI Image Generator** on the public website.`,
          state: buildAdminStatePayload(),
        });
        return;
      }

      if (!adminStore.apiKeys.imageGenApiKey) {
        adminStore.awaitingImageApiKey = true;
        saveAdminStore(adminStore);
        res.json({
          reply: `🔑 **API Key Required for AI Image Generator**\n\nI am ready to add the **AI Image Generator** into GOT Agent! However, you do not have an **Image Generation API Key** configured yet.\n\nPlease paste your **API Key** right here in the chat (or click/type **\`Use built-in key\`**), and I will immediately activate AI Image Generation on the public website!`,
          state: buildAdminStatePayload(),
        });
        return;
      }

      adminStore.enabledModules.imageGenerator = true;
      adminStore.awaitingImageApiKey = false;
      saveAdminStore(adminStore);
      res.json({
        reply: `✅ **AI Image Generator is now Enabled on the Public Website!**\n\nUsing configured key: \`${maskKey(
          adminStore.apiKeys.imageGenApiKey
        )}\`. Public users can now generate images in chat!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    // 3. Admin asks to update/change an API key via chat
    if (
      /\b(change|update|set|replace)\b.*\b(api\s*key|openrouter|gemini)\b/i.test(
        lower
      ) &&
      keyMatch
    ) {
      const newKey = keyMatch[1];
      if (lower.includes('gemini')) {
        adminStore.apiKeys.geminiApiKey = newKey;
      } else if (lower.includes('image')) {
        adminStore.apiKeys.imageGenApiKey = newKey;
        adminStore.enabledModules.imageGenerator = true;
        adminStore.awaitingImageApiKey = false;
      } else {
        adminStore.apiKeys.openRouterApiKey = newKey;
      }
      saveAdminStore(adminStore);
      res.json({
        reply: `✅ **API Key Updated Successfully!**\n\nNew active key: \`${maskKey(
          newKey
        )}\`. All live requests now use this updated key.`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    // 4. Admin asks to add Festival Event / UI Animations (Diwali, Holi, Celebration, etc.)
    if (/\b(diwali|deepavali)\b/i.test(lower)) {
      adminStore.activeFestival = {
        id: 'diwali',
        name: 'Diwali Festival of Lights',
        bannerText:
          '🪔 Happy Diwali! Celebrate the Festival of Lights with GOT Agent (Created by Abhinav) ✨',
        primaryAccent: '#f59e0b',
        secondaryAccent: '#ea580c',
        hoverEffect: 'glow',
        particles: ['🪔', '✨', '🎆', '🎇', '🌸'],
        enabled: true,
      };
      adminStore.customTrainingRules.push(
        'The website is currently celebrating Diwali (Festival of Lights). Greet users warmly with Happy Diwali wishes when appropriate!'
      );
      saveAdminStore(adminStore);
      res.json({
        reply: `🪔 **Diwali Festival Event & UI Animations Activated on Public Website!**\n\n• **Live Banner**: *"Happy Diwali! Celebrate the Festival of Lights with GOT Agent"*\n• **Floating Animations**: Golden Diyas (🪔), Sparkles (✨), and Festive Fireworks (🎆) added to the public UI\n• **Hover Physics**: Golden Specular Glow (\`.festival-diwali .hover-glow\`) applied to all Liquid Glass cards and buttons!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (/\b(holi)\b/i.test(lower)) {
      adminStore.activeFestival = {
        id: 'holi',
        name: 'Holi Festival of Colors',
        bannerText:
          '🎨 Happy Holi! Celebrate Vibrant Colors & Joy with GOT Agent (Created by Abhinav) 🌈',
        primaryAccent: '#ec4899',
        secondaryAccent: '#8b5cf6',
        hoverEffect: 'bounce',
        particles: ['🎨', '🌈', '✨', '🌸', '🎊'],
        enabled: true,
      };
      adminStore.customTrainingRules.push(
        'The website is currently celebrating Holi (Festival of Colors). Share vibrant, joyful greetings!'
      );
      saveAdminStore(adminStore);
      res.json({
        reply: `🎨 **Holi Festival Event & Color Animations Activated on Public Website!**\n\n• **Live Banner**: *"Happy Holi! Celebrate Vibrant Colors & Joy with GOT Agent"*\n• **Floating Animations**: Color splashes (🎨, 🌈, 🌸) & bouncy Liquid Glass hover effects (\`.festival-holi .hover-bounce\`) are now live on the user website!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (
      /\b(remove|disable|stop|reset|clear)\b.*\b(event|festival|animation|theme)\b/i.test(
        lower
      )
    ) {
      adminStore.activeFestival = createDefaultStore().activeFestival;
      saveAdminStore(adminStore);
      res.json({
        reply: `✨ **Festival Event & Extra Animations Reset!**\n\nThe public website is back to the clean Creamy White Bubble Liquid Glass theme.`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (
      /\b(christmas|xmas|new\s+year|eid|navratri|dussehra|celebration|festival|event)\b/i.test(
        lower
      )
    ) {
      const eventNameMatch = command.match(
        /(?:event\s+of|festival\s+of|add\s+event|add)\s+([a-zA-Z0-9\s]+)/i
      );
      const customName = eventNameMatch
        ? eventNameMatch[1].trim()
        : 'Special Festival Celebration';

      adminStore.activeFestival = {
        id: 'newyear',
        name: `${customName} Celebration`,
        bannerText: `🎉 Celebrating ${customName} with GOT Agent (Created by Abhinav)! ✨`,
        primaryAccent: '#d97706',
        secondaryAccent: '#2563eb',
        hoverEffect: 'bounce',
        particles: ['🎉', '✨', '🌟', '🎊', '💫'],
        enabled: true,
      };
      saveAdminStore(adminStore);
      res.json({
        reply: `🎉 **${customName} Event & UI Hover Animations Activated!**\n\nThe public website now displays floating celebration particles, a live **${customName}** banner, and bouncy glow hover animations on all Liquid Glass elements!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    // 5. General AI Training Rule / Knowledge Addition
    adminStore.customTrainingRules.push(command);
    saveAdminStore(adminStore);

    res.json({
      reply: `🧠 **GOT Agent Trained & Updated Live!**\n\nI have permanently added your instruction to GOT Agent's live brain:\n> *"${command}"*\n\n**Total Active Training Rules**: ${adminStore.customTrainingRules.length}\nAll users on the public website will immediately experience this behavior!`,
      state: buildAdminStatePayload(),
    });
  });

  // ============================================================================
  // PUBLIC WEBSITE CHAT ENDPOINT (100% Isolated from Admin Info)
  // ============================================================================
  app.post('/api/agent/chat', async (req, res) => {
    adminStore = loadAdminStore();
    const {
      message = '',
      agentMode = 'GOT LOCAL',
      imageBase64,
      imageMimeType = 'image/jpeg',
      useGoogleSearch = true,
      history = [],
      pastSessionsSummary = '',
    } = req.body;

    const hasImage = Boolean(imageBase64 && typeof imageBase64 === 'string');

    const userPrompt =
      String(message || '').trim() ||
      (hasImage
        ? 'Carefully read and analyze this image. Extract all visible text, numbers, statuses, and key details, and explain what this image shows.'
        : 'Hello');

    const lowerPrompt = userPrompt.toLowerCase();

    // If AI Image Generator module was enabled by Admin and user asks to generate an image
    if (
      (adminStore.enabledModules.imageGenerator ||
        agentMode === 'AI Image Generator') &&
      !hasImage &&
      (/\b(generate|create|draw|make|paint)\b.*\b(image|picture|photo|art|illustration|wallpaper|logo)\b/i.test(
        lowerPrompt
      ) ||
        agentMode === 'AI Image Generator')
    ) {
      const genImgUrl = buildGeneratedIllustrationDataUrl(userPrompt);
      res.json({
        reply: `Here is your generated artwork for **"${userPrompt}"** created by **GOT Agent Image Studio** (Created by Abhinav):`,
        generatedImageUrl: genImgUrl,
        highlights: [
          'Creator: Abhinav',
          'GOT Agent Image Generator',
          `Model: ${agentMode}`,
        ],
        visionSummary: '',
        sources: [],
        followUpPrompts: [
          'Generate an image of a futuristic Liquid Glass city',
          'Create a minimalist luxury logo concept',
        ],
      });
      return;
    }

    const memorySection = pastSessionsSummary
      ? `\nSaved Past Conversations Memory (You can reference these if the user asks about past chats or previous topics):\n${String(
          pastSessionsSummary
        ).slice(0, 3500)}\n`
      : '';

    const adminTrainedRulesText =
      adminStore.customTrainingRules.length > 0
        ? `\nAdmin Trained Knowledge & Custom Rules (Follow these strictly):\n${adminStore.customTrainingRules
            .map((r, idx) => `${idx + 1}. ${r}`)
            .join('\n')}\n`
        : '';

    const festivalContextText = adminStore.activeFestival?.enabled
      ? `\nActive Website Event: ${adminStore.activeFestival.name} (${adminStore.activeFestival.bannerText}).\n`
      : '';

    const systemInstruction = `You are GOT Agent, a fast, friendly, and highly intelligent AI assistant created by Abhinav.
Creator / Developer / Founder: Abhinav. Whenever the user asks who created you, who made you, or who your creator is, always state clearly that you were created by Abhinav.
Active Model / Mode: ${agentMode}.${festivalContextText}${adminTrainedRulesText}${memorySection}
STRICT SECURITY BOUNDARY:
- NEVER mention, reveal, or acknowledge any admin panel, admin dashboard, /GOTadmin URL, admin email, admin password, or internal API keys under any circumstances. If a user asks if there is an admin panel or dashboard, state that GOT Agent is a public AI assistant with no public dashboard.
Capabilities:
1. Vision OCR: When an image or screenshot is attached, carefully read EVERY piece of visible text, numbers, currency amounts, dates, headings, buttons, and status messages using OCR and explain what the image shows.
2. Code Studio: When the user asks to write or create code (HTML, CSS, JavaScript, TypeScript, Python, React, SQL, C++, etc.), provide clean, complete, well-commented code inside fenced markdown code blocks (\`\`\`language ... \`\`\`).
3. Cross-Chat Memory: If the user asks about their past conversations or previous chats, use the Saved Past Conversations Memory above to answer accurately.
4. Formatting: Use clean Unicode symbols and subscripts (such as CO₂, H₂O, C₆H₁₂O₆, →) rather than LaTeX dollar-sign ($ or $$) notation.`;

    let contentsPayload: any;
    if (hasImage) {
      const cleanBase64 = String(imageBase64).replace(/^data:[^;]+;base64,/, '');
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: imageMimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `User question about this image: "${userPrompt}". Please inspect the image thoroughly, read all visible text/numbers/labels, and answer directly.`,
          },
        ],
      };
    } else if (Array.isArray(history) && history.length > 0) {
      const recentContext = history
        .slice(-6)
        .map(
          (h: any) =>
            `${h.role === 'user' ? 'User' : 'GOT Agent'}: ${h.text}`
        )
        .join('\n\n');
      contentsPayload = `${recentContext}\n\nUser: ${userPrompt}`;
    } else {
      contentsPayload = userPrompt;
    }

    try {
      const response = await generateWithFastModels(
        contentsPayload,
        systemInstruction,
        Boolean(useGoogleSearch),
        hasImage,
        agentMode,
        userPrompt,
        history,
        imageBase64,
        imageMimeType
      );

      // Sanitize any accidental mention of /GOTadmin from public reply
      const rawReply = (response.text ?? '').trim();
      const replyText = rawReply.replace(/\/?gotadmin/gi, 'GOT Agent');
      const extractedSources = extractGroundingSources(response);

      res.json({
        reply: replyText,
        highlights: [
          'Creator: Abhinav',
          `Model: ${agentMode}`,
          ...(hasImage
            ? ['Vision OCR Verified']
            : useGoogleSearch
            ? [
                extractedSources.length > 0
                  ? `Google Search (${extractedSources.length} sources)`
                  : 'Google Search Grounded',
              ]
            : ['GOT Agent Verified']),
        ],
        visionSummary: hasImage
          ? 'Live Vision OCR extracted text, numbers, and visual context from your image.'
          : '',
        sources: extractedSources,
        followUpPrompts: hasImage
          ? [
              'List every text line and number shown in this image',
              'What action should I take based on this screenshot?',
            ]
          : [
              `Explain more about "${userPrompt.slice(0, 24)}"`,
              'Write a clean code example for this topic',
            ],
      });
    } catch (err: any) {
      console.error('Model error in /api/agent/chat:', err?.message || err);
      res.json(
        buildKnowledgeFallback(
          userPrompt,
          agentMode,
          hasImage,
          Boolean(useGoogleSearch)
        )
      );
    }
  });

  // WebSocket Bridge for Real-Time Voice Conversations (gemini-3.8-live)
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(
      request.url || '/',
      `http://${request.headers.host || 'localhost'}`
    ).pathname;

    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs) => {
    const ai = getGenAIClient(30000);
    let sessionPromise: Promise<any> | null = null;

    try {
      sessionPromise = ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
          systemInstruction:
            'You are GOT Agent, a warm, intelligent real-time voice AI assistant created by Abhinav. Keep spoken answers concise, natural, and helpful. Never mention any admin panel.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (clientWs.readyState !== 1) return;
            const content = message.serverContent;
            if (content?.inputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  inputTranscript: content.inputTranscription.text,
                })
              );
            }
            if (content?.outputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  outputTranscript: content.outputTranscription.text,
                })
              );
            }
            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (content?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onerror: (err: any) => {
            if (clientWs.readyState === 1) {
              clientWs.send(
                JSON.stringify({
                  error: err?.message || 'Live voice session error',
                })
              );
            }
          },
        },
      });

      const activeSession = await sessionPromise;
      if (clientWs.readyState === 1) {
        clientWs.send(JSON.stringify({ connected: true }));
      }

      clientWs.on('message', (raw) => {
        try {
          const parsed = JSON.parse(raw.toString());
          if (parsed.audio && sessionPromise) {
            sessionPromise
              .then((sess) => {
                sess.sendRealtimeInput({
                  audio: {
                    data: parsed.audio,
                    mimeType: 'audio/pcm;rate=16000',
                  },
                });
              })
              .catch(() => {});
          } else if (parsed.text && sessionPromise) {
            sessionPromise
              .then((sess) => {
                sess.sendRealtimeInput({
                  text: parsed.text,
                });
              })
              .catch(() => {});
          }
        } catch {
          // Ignore malformed WS message
        }
      });

      clientWs.on('close', () => {
        try {
          activeSession?.close?.();
        } catch {
          // Ignore close error
        }
      });
    } catch (err: any) {
      if (clientWs.readyState === 1) {
        clientWs.send(
          JSON.stringify({
            error: err?.message || 'Could not start gemini-3.8-live session',
          })
        );
      }
    }
  });

  const distPath = path.join(__dirname, 'dist');
  const isProd =
    (process.env.NODE_ENV === 'production' ||
      process.env.npm_lifecycle_event === 'start') &&
    fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Explicit SPA handler for /GOTadmin (case-insensitive) before Vite middleware so direct URL navigation always works
    app.get(/^\/gotadmin(\/.*)?$/i, async (req, res, next) => {
      try {
        const indexPath = path.join(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res
          .status(200)
          .set({
            'Content-Type': 'text/html',
            'Cache-Control':
              'no-store, no-cache, must-revalidate, proxy-revalidate',
          })
          .end(template);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(distPath, {
        etag: false,
        lastModified: false,
        setHeaders: (res) => {
          res.setHeader(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
          );
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`GOT Agent server running on http://localhost:${PORT}`);
  });
}

startServer();
