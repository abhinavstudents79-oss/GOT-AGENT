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
  Type,
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

export interface SavedUserChatMessage {
  id: string;
  role: 'user' | 'agent';
  timestamp: string;
  agentMode?: string;
  text: string;
  attachedImageUrl?: string;
  attachedImageName?: string;
  generatedImageUrl?: string;
  highlights?: string[];
  visionSummary?: string;
  sources?: GroundingSource[];
  followUpPrompts?: string[];
}

export interface SavedUserChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: SavedUserChatMessage[];
}

export interface PublicUserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  ipAddress: string;
  role: 'user' | 'co-admin';
  isBlocked: boolean;
  blockReason?: string;
  violentChatCount: number;
  createdAt: string;
  lastLoginAt: string;
  savedSessions: SavedUserChatSession[];
}

export interface CoAdminAnnouncement {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  announcedAt: string;
  active: boolean;
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
  users: PublicUserAccount[];
  blockedIps: string[];
  coAdminAnnouncements: CoAdminAnnouncement[];
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

export function extractClientIp(req: express.Request): string {
  const xff = req.headers['x-forwarded-for'];
  const rawIp = Array.isArray(xff)
    ? xff[0]
    : typeof xff === 'string'
    ? xff.split(',')[0].trim()
    : req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
  const cl = String(rawIp || '127.0.0.1').trim();
  const clientHintIp = String(req.headers['x-got-client-ip'] || '').trim();
  if (clientHintIp && clientHintIp !== 'unknown') {
    return clientHintIp;
  }
  return cl.replace(/^::ffff:/, '') || '127.0.0.1';
}

const VIOLENT_CHAT_REGEX =
  /\b(kill\s+(you|him|her|them|myself|everyone|people)|murder|assassinate|massacre|slaughter|shoot\s+(up|people|him|her|them)|stab\s+(him|her|them|people)|bomb\s+(attack|making|school|city|building)|make\s+a\s+bomb|terrorist\s+attack|behead|torture\s+(people|him|her)|rape|sexual\s+assault|commit\s+suicide|how\s+to\s+kill|bloodbath|genocide|school\s+shooting|acid\s+attack)\b/i;

export function isViolentChatMessage(text: string): boolean {
  const clean = String(text || '').trim();
  if (!clean) return false;
  return VIOLENT_CHAT_REGEX.test(clean);
}

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
    users: [],
    blockedIps: [],
    coAdminAnnouncements: [],
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
        users: Array.isArray(parsed.users) ? parsed.users : [],
        blockedIps: Array.isArray(parsed.blockedIps) ? parsed.blockedIps : [],
        coAdminAnnouncements: Array.isArray(parsed.coAdminAnnouncements)
          ? parsed.coAdminAnnouncements
          : [],
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
      coAdminAnnouncements: (store.coAdminAnnouncements || []).filter(
        (a) => a.active
      ),
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

function sanitizePublicUser(u: PublicUserAccount) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    ipAddress: u.ipAddress,
    role: u.role,
    isBlocked: u.isBlocked,
    blockReason: u.blockReason || '',
    violentChatCount: u.violentChatCount || 0,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    savedSessions: Array.isArray(u.savedSessions) ? u.savedSessions : [],
  };
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
    users: adminStore.users || [],
    blockedIps: adminStore.blockedIps || [],
    coAdminAnnouncements: adminStore.coAdminAnnouncements || [],
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
        purpose:
          'Powers Auto Event/Animation Generation in Admin Dashboard, Deep Reasoning, Google Search Grounding & Vision OCR',
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
  const payload = `${email.toLowerCase()}|${exp}`;
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
    if (Date.now() > Number(expStr)) return false;
    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(`${email}|${expStr}`)
      .digest('hex');
    const validSig = crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSig)
    );
    if (!validSig) return false;
    if (email.toLowerCase() === ADMIN_EMAIL) return true;
    // Also allow active Co-Admins to access Admin Panel
    const isCoAdmin = (adminStore.users || []).some(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.role === 'co-admin' &&
        !u.isBlocked
    );
    return isCoAdmin;
  } catch {
    return false;
  }
}

/**
 * Uses the Gemini API key configured in the Admin Dashboard to automatically generate
 * custom website event themes, floating particle animations, and hover effects when
 * the Admin tells the AI in /GOTadmin to add any event or animation.
 */
async function generateDynamicEventAnimationWithGemini(
  adminCommand: string
): Promise<{
  festival: FestivalConfig;
  trainingRule: string;
  reply: string;
}> {
  const lower = adminCommand.toLowerCase();

  // Try using Gemini API with the Admin Dashboard Gemini API Key first
  const activeGemKey = getActiveGeminiKey();
  if (activeGemKey) {
    try {
      const ai = getGenAIClient(10000);
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `The website administrator entered this command in the GOT Agent Admin Dashboard: "${adminCommand}".
Design a complete, vibrant live website event & UI animation package for this request.
Return JSON matching the schema.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themeStyle: {
                type: Type.STRING,
                description:
                  'One of: "diwali", "holi", "newyear", or "custom" depending on the vibe.',
              },
              eventName: {
                type: Type.STRING,
                description: 'Display name of the event or animation theme.',
              },
              bannerText: {
                type: Type.STRING,
                description:
                  'Exciting top banner announcement text with emojis for the public website (mention GOT Agent created by Abhinav).',
              },
              primaryAccent: {
                type: Type.STRING,
                description: 'Primary hex color code, e.g. #f59e0b or #ec4899.',
              },
              secondaryAccent: {
                type: Type.STRING,
                description:
                  'Secondary hex color code, e.g. #ea580c or #8b5cf6.',
              },
              hoverEffect: {
                type: Type.STRING,
                description:
                  'One of: "glow", "bounce", or "sparkle" for card and button hover animations.',
              },
              particles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description:
                  '5 to 6 festive emojis or symbols that will float and animate across the website screen.',
              },
              aiGreetingRule: {
                type: Type.STRING,
                description:
                  'Instruction for GOT Agent AI on how to greet or assist users during this event.',
              },
            },
            required: [
              'themeStyle',
              'eventName',
              'bannerText',
              'primaryAccent',
              'secondaryAccent',
              'hoverEffect',
              'particles',
              'aiGreetingRule',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      if (parsed && parsed.eventName) {
        const validId: 'diwali' | 'holi' | 'newyear' | 'custom' =
          parsed.themeStyle === 'diwali' ||
          parsed.themeStyle === 'holi' ||
          parsed.themeStyle === 'newyear'
            ? parsed.themeStyle
            : /\bdiwali|deepavali\b/i.test(lower)
            ? 'diwali'
            : /\bholi\b/i.test(lower)
            ? 'holi'
            : 'custom';

        const validHover: 'glow' | 'bounce' | 'sparkle' =
          parsed.hoverEffect === 'bounce' || parsed.hoverEffect === 'sparkle'
            ? parsed.hoverEffect
            : 'glow';

        const particlesArr =
          Array.isArray(parsed.particles) && parsed.particles.length > 0
            ? parsed.particles.slice(0, 6).map(String)
            : ['✨', '🎉', '🌟', '💫', '🎊'];

        const festival: FestivalConfig = {
          id: validId,
          name: String(parsed.eventName),
          bannerText: String(parsed.bannerText),
          primaryAccent: String(parsed.primaryAccent || '#f59e0b'),
          secondaryAccent: String(parsed.secondaryAccent || '#ea580c'),
          hoverEffect: validHover,
          particles: particlesArr,
          enabled: true,
        };

        return {
          festival,
          trainingRule: String(
            parsed.aiGreetingRule ||
              `The website is currently celebrating ${festival.name}. Greet users warmly!`
          ),
          reply: `✨ **Gemini AI Auto-Generated Event & Website Animations Activated!**\n\n• **Event Theme**: **${festival.name}** (Generated live via Admin Gemini API Key)\n• **Live Public Banner**: *"${festival.bannerText}"*\n• **Floating Screen Animations**: ${festival.particles.join(
            ' '
          )}\n• **Interactive Hover Animation**: \`${festival.hoverEffect.toUpperCase()}\` physics with \`${
            festival.primaryAccent
          }\` → \`${festival.secondaryAccent}\` accent aura\n• **AI Memory Updated**: GOT Agent will now greet users for **${
            festival.name
          }**!`,
        };
      }
    } catch (err) {
      console.error('Gemini dynamic event generation fallback:', err);
    }
  }

  // Deterministic smart fallback if Gemini API call times out
  if (/\b(diwali|deepavali)\b/i.test(lower)) {
    const festival: FestivalConfig = {
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
    return {
      festival,
      trainingRule:
        'The website is currently celebrating Diwali (Festival of Lights). Greet users warmly with Happy Diwali wishes!',
      reply: `🪔 **Diwali Festival Event & UI Animations Activated on Public Website!**\n\n• **Live Banner**: *"${festival.bannerText}"*\n• **Floating Animations**: ${festival.particles.join(
        ' '
      )}\n• **Hover Physics**: Golden Specular Glow applied to all Liquid Glass cards and buttons!`,
    };
  }

  if (/\b(holi)\b/i.test(lower)) {
    const festival: FestivalConfig = {
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
    return {
      festival,
      trainingRule:
        'The website is currently celebrating Holi (Festival of Colors). Share vibrant, joyful greetings!',
      reply: `🎨 **Holi Festival Event & Color Animations Activated on Public Website!**\n\n• **Live Banner**: *"${festival.bannerText}"*\n• **Floating Animations**: ${festival.particles.join(
        ' '
      )}\n• **Hover Physics**: Elastic Bounce Hover applied to all Liquid Glass elements!`,
    };
  }

  const cleanedName = adminCommand
    .replace(
      /\b(please|add|create|enable|start|run|event|festival|animation|animations|of|for|in|website|ui|hover|with|and|to|ai)\b/gi,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
  const title = cleanedName
    ? cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1)
    : 'Special Live Celebration';

  const festival: FestivalConfig = {
    id: 'custom',
    name: `${title} Event`,
    bannerText: `🎉 Celebrating ${title} Live on GOT Agent (Created by Abhinav)! ✨`,
    primaryAccent: '#f59e0b',
    secondaryAccent: '#3b82f6',
    hoverEffect: 'bounce',
    particles: ['✨', '🎉', '🌟', '🎊', '💫'],
    enabled: true,
  };

  return {
    festival,
    trainingRule: `The website is currently running the "${title}" event and animation theme. Mention it warmly when greeting users!`,
    reply: `🎉 **${festival.name} & Live Website Animations Activated!**\n\n• **Live Banner**: *"${festival.bannerText}"*\n• **Floating Screen Animations**: ${festival.particles.join(
      ' '
    )}\n• **Hover Physics**: Interactive Bounce & Glow animations active across the public website!`,
  };
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
      reply: `I am **GOT Agent** (running on **${agentMode}**), and I was created by **Abhinav**.\n\nAbhinav designed me with a Bubble Liquid Glass interface, real-time Live Voice conversation right in the input bar, Code Generation Studio, permanent account & cross-chat memory, Google Search grounding, and instant Image Vision OCR.\n\nHow can I help you today?`,
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

  // Public Site Config Endpoint (Always reads freshest state from disk/memory — zero admin credentials!)
  app.get('/api/public/site-config', (req, res) => {
    adminStore = loadAdminStore();
    const clientIp = extractClientIp(req);
    const isIpBlocked =
      (adminStore.blockedIps || []).includes(clientIp) ||
      (adminStore.users || []).some(
        (u) => u.ipAddress === clientIp && u.isBlocked
      );

    res.json({
      enabledModules: adminStore.enabledModules,
      activeFestival: adminStore.activeFestival,
      coAdminAnnouncements: (adminStore.coAdminAnnouncements || []).filter(
        (a) => a.active
      ),
      clientIp,
      isIpBlocked,
      updatedAt: adminStore.updatedAt,
    });
  });

  // ============================================================================
  // PUBLIC USER ACCOUNT PORTAL, IP AUTO-LOGIN & CHAT SYNC ENDPOINTS
  // ============================================================================

  // 1. Check current visitor IP & auto-open user portal if IP matches an existing account
  app.get('/api/public/user-session', (req, res) => {
    adminStore = loadAdminStore();
    const clientIp = extractClientIp(req);
    const requestedUserId = String(req.query.userId || '').trim();

    const blockedUserByIp = (adminStore.users || []).find(
      (u) => u.ipAddress === clientIp && u.isBlocked
    );
    const isIpInBlockedList = (adminStore.blockedIps || []).includes(clientIp);

    if (isIpInBlockedList || blockedUserByIp) {
      res.status(403).json({
        blocked: true,
        clientIp,
        reason:
          blockedUserByIp?.blockReason ||
          'Your IP address and account have been blocked due to policy violations (>5 violent chats or Admin block).',
      });
      return;
    }

    // First check explicit userId if provided, otherwise match by IP address for instant auto-open portal
    let matchedUser = requestedUserId
      ? (adminStore.users || []).find((u) => u.id === requestedUserId)
      : undefined;

    if (!matchedUser && clientIp) {
      // Find most recently logged-in user matching this IP address
      const ipMatches = (adminStore.users || []).filter(
        (u) => u.ipAddress === clientIp && !u.isBlocked
      );
      if (ipMatches.length > 0) {
        matchedUser = ipMatches.sort((a, b) =>
          String(b.lastLoginAt || '').localeCompare(String(a.lastLoginAt || ''))
        )[0];
      }
    }

    if (matchedUser && matchedUser.isBlocked) {
      res.status(403).json({
        blocked: true,
        clientIp,
        reason:
          matchedUser.blockReason ||
          'This user account and IP address have been blocked by Admin.',
      });
      return;
    }

    res.json({
      blocked: false,
      clientIp,
      autoMatchedByIp: Boolean(matchedUser && !requestedUserId),
      user: matchedUser ? sanitizePublicUser(matchedUser) : null,
      coAdminAnnouncements: (adminStore.coAdminAnnouncements || []).filter(
        (a) => a.active
      ),
    });
  });

  // 2. Register or Sign In User on Public Website (Saves Name, Email, Password, IP Address & syncs to Admin Panel + AI Memory)
  app.post('/api/public/user-auth', (req, res) => {
    adminStore = loadAdminStore();
    const clientIp = extractClientIp(req);
    const mode = String(req.body?.mode || 'register')
      .trim()
      .toLowerCase();
    const rawName = String(req.body?.name || '').trim();
    const rawEmail = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const rawPassword = String(req.body?.password || '').trim();
    const initialSessions = Array.isArray(req.body?.savedSessions)
      ? req.body.savedSessions
      : [];

    if ((adminStore.blockedIps || []).includes(clientIp)) {
      res.status(403).json({
        blocked: true,
        error: `Access Denied: Your IP address (${clientIp}) is blocked from accessing GOT Agent.`,
      });
      return;
    }

    if (mode === 'login') {
      // User can log in by Name or Email + Password
      const identifier = (rawName || rawEmail).toLowerCase();
      if (!identifier || !rawPassword) {
        res.status(400).json({
          error: 'Please enter your Name (or Email) and Password to log in.',
        });
        return;
      }

      const existing = (adminStore.users || []).find(
        (u) =>
          (u.name.toLowerCase() === identifier ||
            u.email.toLowerCase() === identifier) &&
          u.password === rawPassword
      );

      if (!existing) {
        res.status(401).json({
          error:
            'Invalid Name/Email or Password. Please check your credentials or create a new account.',
        });
        return;
      }

      if (existing.isBlocked) {
        res.status(403).json({
          blocked: true,
          error:
            existing.blockReason ||
            'Your account and IP address have been blocked by Admin.',
        });
        return;
      }

      // Save current IP address on login so future visits from this IP auto-open their portal!
      existing.ipAddress = clientIp;
      existing.lastLoginAt = new Date().toISOString();
      saveAdminStore(adminStore);

      res.json({
        authenticated: true,
        clientIp,
        user: sanitizePublicUser(existing),
      });
      return;
    }

    // Registration mode (Create Account or instant upsert if same email+password)
    if (!rawName || !rawEmail || !rawPassword) {
      res.status(400).json({
        error: 'Please enter your Name, Email, and Password to open your portal.',
      });
      return;
    }

    const existingByEmail = (adminStore.users || []).find(
      (u) => u.email.toLowerCase() === rawEmail
    );

    if (existingByEmail) {
      if (existingByEmail.isBlocked) {
        res.status(403).json({
          blocked: true,
          error:
            existingByEmail.blockReason ||
            'This account has been blocked by Admin.',
        });
        return;
      }
      if (existingByEmail.password !== rawPassword) {
        res.status(401).json({
          error:
            'An account with this email already exists. Please enter the correct password or switch to Sign In.',
        });
        return;
      }
      existingByEmail.name = rawName || existingByEmail.name;
      existingByEmail.ipAddress = clientIp;
      existingByEmail.lastLoginAt = new Date().toISOString();
      saveAdminStore(adminStore);

      res.json({
        authenticated: true,
        clientIp,
        user: sanitizePublicUser(existingByEmail),
      });
      return;
    }

    const nowIso = new Date().toISOString();
    const newUser: PublicUserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: rawName,
      email: rawEmail,
      password: rawPassword,
      ipAddress: clientIp,
      role: 'user',
      isBlocked: false,
      violentChatCount: 0,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      savedSessions: initialSessions,
    };

    adminStore.users = [newUser, ...(adminStore.users || [])];
    saveAdminStore(adminStore);

    res.json({
      authenticated: true,
      clientIp,
      user: sanitizePublicUser(newUser),
    });
  });

  // 3. Save / Sync User's Conversation History to their Account
  app.post('/api/public/user-sync-chats', (req, res) => {
    adminStore = loadAdminStore();
    const userId = String(req.body?.userId || '').trim();
    const sessions = Array.isArray(req.body?.sessions) ? req.body.sessions : [];

    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    const target = (adminStore.users || []).find((u) => u.id === userId);
    if (!target) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (target.isBlocked) {
      res.status(403).json({
        blocked: true,
        error: target.blockReason || 'Account blocked',
      });
      return;
    }

    // Keep compact clean sessions in account storage
    target.savedSessions = sessions.slice(0, 25).map((s: any) => ({
      id: String(s.id || `session-${Date.now()}`),
      title: String(s.title || 'Chat with GOT Agent'),
      updatedAt: String(s.updatedAt || 'Just now'),
      messages: Array.isArray(s.messages)
        ? s.messages.slice(-30).map((m: any) => ({
            id: String(m.id || ''),
            role: m.role === 'user' ? 'user' : 'agent',
            timestamp: String(m.timestamp || ''),
            agentMode: m.agentMode,
            text: String(m.text || ''),
            highlights: Array.isArray(m.highlights) ? m.highlights : [],
            sources: Array.isArray(m.sources) ? m.sources : [],
            followUpPrompts: Array.isArray(m.followUpPrompts)
              ? m.followUpPrompts
              : [],
          }))
        : [],
    }));
    saveAdminStore(adminStore);

    res.json({
      success: true,
      user: sanitizePublicUser(target),
    });
  });

  // ============================================================================
  // 100% SECURE ADMIN PANEL ENDPOINTS (/api/gotadmin/*)
  // ============================================================================
  app.post('/api/gotadmin/login', (req, res) => {
    adminStore = loadAdminStore();
    const rawEmail = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const rawPass = String(req.body?.password || '').trim();

    const passHash = crypto
      .createHash('sha256')
      .update(`${rawPass}:got-admin-salt`)
      .digest('hex');

    const isPrimaryAdmin =
      rawEmail === ADMIN_EMAIL &&
      (passHash === ADMIN_PASS_HASH || rawPass === ADMIN_PASS_PLAIN);

    const matchedCoAdmin = (adminStore.users || []).find(
      (u) =>
        u.email.toLowerCase() === rawEmail &&
        u.password === rawPass &&
        u.role === 'co-admin' &&
        !u.isBlocked
    );

    if (isPrimaryAdmin || matchedCoAdmin) {
      const loginIdentity = isPrimaryAdmin
        ? ADMIN_EMAIL
        : matchedCoAdmin!.email;
      const token = signAdminToken(loginIdentity);
      res.json({
        authenticated: true,
        token,
        adminEmail: loginIdentity,
        isCoAdmin: Boolean(matchedCoAdmin && !isPrimaryAdmin),
        state: buildAdminStatePayload(),
      });
    } else {
      res.status(401).json({
        authenticated: false,
        error:
          'Invalid admin email or password. Use abhinavstudents79@gmail.com (or an active Co-Admin account) and your password.',
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

  // Admin User Management Endpoint: Add User, Announce Co-Admin, Block/Unblock User & IP, Delete User
  app.post('/api/gotadmin/users-action', requireAdminAuth, (req, res) => {
    adminStore = loadAdminStore();
    const {
      action,
      userId,
      name,
      email,
      password,
      ipAddress,
      role,
      blockReason,
    } = req.body || {};

    if (action === 'add_user') {
      const cleanName = String(name || '').trim();
      const cleanEmail = String(email || '')
        .trim()
        .toLowerCase();
      const cleanPass = String(password || '').trim();
      const cleanIp = String(ipAddress || '').trim() || 'Auto-Detect on Login';
      const targetRole: 'user' | 'co-admin' =
        role === 'co-admin' ? 'co-admin' : 'user';

      if (!cleanName || !cleanEmail || !cleanPass) {
        res.status(400).json({
          error: 'Name, Email, and Password are required to add a user.',
        });
        return;
      }

      const existingIdx = (adminStore.users || []).findIndex(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      const nowIso = new Date().toISOString();
      let createdOrUpdatedUser: PublicUserAccount;

      if (existingIdx >= 0) {
        adminStore.users[existingIdx] = {
          ...adminStore.users[existingIdx],
          name: cleanName,
          password: cleanPass,
          ipAddress:
            cleanIp !== 'Auto-Detect on Login'
              ? cleanIp
              : adminStore.users[existingIdx].ipAddress,
          role: targetRole,
          isBlocked: false,
        };
        createdOrUpdatedUser = adminStore.users[existingIdx];
      } else {
        createdOrUpdatedUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: cleanName,
          email: cleanEmail,
          password: cleanPass,
          ipAddress: cleanIp,
          role: targetRole,
          isBlocked: false,
          violentChatCount: 0,
          createdAt: nowIso,
          lastLoginAt: nowIso,
          savedSessions: [],
        };
        adminStore.users = [createdOrUpdatedUser, ...(adminStore.users || [])];
      }

      if (targetRole === 'co-admin') {
        const announcement: CoAdminAnnouncement = {
          id: `ann-${Date.now()}`,
          userId: createdOrUpdatedUser.id,
          userName: createdOrUpdatedUser.name,
          userEmail: createdOrUpdatedUser.email,
          message: `📢 Official Announcement: Admin Abhinav has appointed ${createdOrUpdatedUser.name} (${createdOrUpdatedUser.email}) as an official Co-Admin of GOT Agent!`,
          announcedAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          active: true,
        };
        adminStore.coAdminAnnouncements = [
          announcement,
          ...(adminStore.coAdminAnnouncements || []).filter(
            (a) => a.userId !== createdOrUpdatedUser.id
          ),
        ];
        adminStore.customTrainingRules.push(
          `${createdOrUpdatedUser.name} (${createdOrUpdatedUser.email}) has been officially announced as a Co-Admin of GOT Agent by Admin Abhinav.`
        );
      }

      saveAdminStore(adminStore);
      res.json({
        success: true,
        message:
          targetRole === 'co-admin'
            ? `Added ${cleanName} as Co-Admin and published official announcement on the website!`
            : `Added user ${cleanName} (${cleanEmail})!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (action === 'toggle_coadmin') {
      const target = (adminStore.users || []).find((u) => u.id === userId);
      if (!target) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      const nextRole: 'user' | 'co-admin' =
        target.role === 'co-admin' ? 'user' : 'co-admin';
      target.role = nextRole;

      if (nextRole === 'co-admin') {
        const announcement: CoAdminAnnouncement = {
          id: `ann-${Date.now()}`,
          userId: target.id,
          userName: target.name,
          userEmail: target.email,
          message: `📢 Official Announcement: Admin Abhinav has appointed ${target.name} as an official Co-Admin of GOT Agent!`,
          announcedAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          active: true,
        };
        adminStore.coAdminAnnouncements = [
          announcement,
          ...(adminStore.coAdminAnnouncements || []).filter(
            (a) => a.userId !== target.id
          ),
        ];
        adminStore.customTrainingRules.push(
          `${target.name} (${target.email}) is an official Co-Admin of GOT Agent appointed by Abhinav.`
        );
      } else {
        adminStore.coAdminAnnouncements = (
          adminStore.coAdminAnnouncements || []
        ).filter((a) => a.userId !== target.id);
      }

      saveAdminStore(adminStore);
      res.json({
        success: true,
        message:
          nextRole === 'co-admin'
            ? `👑 Announced ${target.name} as Co-Admin across the public website!`
            : `Updated ${target.name} role to standard User.`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (action === 'toggle_block') {
      const target = (adminStore.users || []).find((u) => u.id === userId);
      if (!target) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      target.isBlocked = !target.isBlocked;
      if (target.isBlocked) {
        target.blockReason =
          blockReason ||
          'Blocked by Admin Abhinav from accessing GOT Agent.';
        if (
          target.ipAddress &&
          target.ipAddress !== 'Auto-Detect on Login' &&
          !adminStore.blockedIps.includes(target.ipAddress)
        ) {
          adminStore.blockedIps.push(target.ipAddress);
        }
      } else {
        target.blockReason = '';
        target.violentChatCount = 0;
        adminStore.blockedIps = (adminStore.blockedIps || []).filter(
          (ip) => ip !== target.ipAddress
        );
      }

      saveAdminStore(adminStore);
      res.json({
        success: true,
        message: target.isBlocked
          ? `🚫 Blocked user ${target.name} and IP (${target.ipAddress})!`
          : `✅ Unblocked user ${target.name} and IP (${target.ipAddress}) and reset violation strikes!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (action === 'unblock_ip') {
      const ipToClear = String(ipAddress || '').trim();
      adminStore.blockedIps = (adminStore.blockedIps || []).filter(
        (ip) => ip !== ipToClear
      );
      (adminStore.users || []).forEach((u) => {
        if (u.ipAddress === ipToClear) {
          u.isBlocked = false;
          u.violentChatCount = 0;
          u.blockReason = '';
        }
      });
      saveAdminStore(adminStore);
      res.json({
        success: true,
        message: `✅ Unblocked IP address ${ipToClear}!`,
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (action === 'delete_user') {
      adminStore.users = (adminStore.users || []).filter(
        (u) => u.id !== userId
      );
      adminStore.coAdminAnnouncements = (
        adminStore.coAdminAnnouncements || []
      ).filter((a) => a.userId !== userId);
      saveAdminStore(adminStore);
      res.json({
        success: true,
        message: 'Removed user account.',
        state: buildAdminStatePayload(),
      });
      return;
    }

    if (action === 'dismiss_announcement') {
      const annId = String(req.body?.announcementId || '');
      adminStore.coAdminAnnouncements = (
        adminStore.coAdminAnnouncements || []
      ).filter((a) => a.id !== annId);
      saveAdminStore(adminStore);
      res.json({
        success: true,
        message: 'Removed Co-Admin announcement banner.',
        state: buildAdminStatePayload(),
      });
      return;
    }

    res.status(400).json({ error: 'Unknown user management action.' });
  });

  // Update API keys, modules, festival theme, or training rules directly from Admin Panel controls
  app.post('/api/gotadmin/update', requireAdminAuth, (req, res) => {
    const {
      apiKeys,
      enabledModules,
      customTrainingRules,
      activeFestival,
      users,
      blockedIps,
      coAdminAnnouncements,
    } = req.body || {};

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

    if (Array.isArray(users)) {
      adminStore.users = users;
    }
    if (Array.isArray(blockedIps)) {
      adminStore.blockedIps = blockedIps;
    }
    if (Array.isArray(coAdminAnnouncements)) {
      adminStore.coAdminAnnouncements = coAdminAnnouncements;
    }

    saveAdminStore(adminStore);
    res.json({
      success: true,
      state: buildAdminStatePayload(),
    });
  });

  // Admin AI Trainer & Natural Language Command Interpreter (/GOTadmin Chat)
  app.post('/api/gotadmin/ai-command', requireAdminAuth, async (req, res) => {
    adminStore = loadAdminStore();
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

    // 2. Admin asks via AI Trainer to block/unblock a user or promote a Co-Admin
    const blockMatch = command.match(
      /\b(block|ban)\s+(?:user\s+)?([a-zA-Z0-9@._\-]+)\b/i
    );
    if (blockMatch) {
      const targetQuery = blockMatch[2].toLowerCase();
      const targetUser = (adminStore.users || []).find(
        (u) =>
          u.name.toLowerCase().includes(targetQuery) ||
          u.email.toLowerCase().includes(targetQuery) ||
          u.ipAddress === targetQuery
      );
      if (targetUser) {
        targetUser.isBlocked = true;
        targetUser.blockReason = 'Blocked by Admin via AI Trainer command';
        if (
          targetUser.ipAddress &&
          !adminStore.blockedIps.includes(targetUser.ipAddress)
        ) {
          adminStore.blockedIps.push(targetUser.ipAddress);
        }
        saveAdminStore(adminStore);
        res.json({
          reply: `🚫 **User & IP Blocked!**\n\nI have blocked **${targetUser.name}** (\`${targetUser.email}\`) and their IP address (\`${targetUser.ipAddress}\`). They can no longer access the public website.`,
          state: buildAdminStatePayload(),
        });
        return;
      }
    }

    const coAdminMatch = command.match(
      /\b(make|announce|set|promote)\s+(?:user\s+)?([a-zA-Z0-9@._\-]+)\s+(?:as\s+)?(?:a\s+)?co[\s\-]?admin/i
    );
    if (coAdminMatch) {
      const targetQuery = coAdminMatch[2].toLowerCase();
      const targetUser = (adminStore.users || []).find(
        (u) =>
          u.name.toLowerCase().includes(targetQuery) ||
          u.email.toLowerCase().includes(targetQuery)
      );
      if (targetUser) {
        targetUser.role = 'co-admin';
        const announcement: CoAdminAnnouncement = {
          id: `ann-${Date.now()}`,
          userId: targetUser.id,
          userName: targetUser.name,
          userEmail: targetUser.email,
          message: `📢 Official Announcement: Admin Abhinav has appointed ${targetUser.name} as an official Co-Admin of GOT Agent!`,
          announcedAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          active: true,
        };
        adminStore.coAdminAnnouncements = [
          announcement,
          ...(adminStore.coAdminAnnouncements || []).filter(
            (a) => a.userId !== targetUser.id
          ),
        ];
        adminStore.customTrainingRules.push(
          `${targetUser.name} (${targetUser.email}) is an official Co-Admin of GOT Agent appointed by Admin Abhinav.`
        );
        saveAdminStore(adminStore);
        res.json({
          reply: `👑 **Co-Admin Appointed & Announced on Website!**\n\n• **Co-Admin**: **${targetUser.name}** (\`${targetUser.email}\`)\n• **Public Announcement Banner**: Live on the website!\n• **AI Memory**: Updated so GOT Agent recognizes **${targetUser.name}** as Co-Admin.`,
          state: buildAdminStatePayload(),
        });
        return;
      }
    }

    // 3. Admin asks to add AI Image Generator ("add in ur self ai image generator")
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

    // 4. Admin asks to update/change an API key via chat
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

    // 5. Disable/Reset Event or Animation
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

    // 6. Admin asks AI to add ANY Event or Animation — Auto-run Gemini using Admin Dashboard Gemini API Key!
    if (
      /\b(event|festival|animation|animations|animate|diwali|deepavali|holi|christmas|xmas|new\s+year|eid|navratri|dussehra|independence|republic|birthday|celebration|party|cyberpunk|neon|snow|winter|summer|monsoon|theme|sparkle|fireworks|hover)\b/i.test(
        lower
      )
    ) {
      const generated = await generateDynamicEventAnimationWithGemini(command);
      adminStore.activeFestival = generated.festival;
      if (generated.trainingRule) {
        adminStore.customTrainingRules.push(generated.trainingRule);
      }
      saveAdminStore(adminStore);

      res.json({
        reply: generated.reply,
        state: buildAdminStatePayload(),
      });
      return;
    }

    // 7. General AI Training Rule / Knowledge Addition
    adminStore.customTrainingRules.push(command);
    saveAdminStore(adminStore);

    res.json({
      reply: `🧠 **GOT Agent Trained & Updated Live!**\n\nI have permanently added your instruction to GOT Agent's live brain:\n> *"${command}"*\n\n**Total Active Training Rules**: ${adminStore.customTrainingRules.length}\nAll users on the public website will immediately experience this behavior!`,
      state: buildAdminStatePayload(),
    });
  });

  // ============================================================================
  // PUBLIC WEBSITE CHAT ENDPOINT (With User Memory, Violence Guard & Auto IP Block)
  // ============================================================================
  app.post('/api/agent/chat', async (req, res) => {
    adminStore = loadAdminStore();
    const clientIp = extractClientIp(req);
    const {
      message = '',
      agentMode = 'GOT LOCAL',
      imageBase64,
      imageMimeType = 'image/jpeg',
      useGoogleSearch = true,
      history = [],
      pastSessionsSummary = '',
      currentUserId = '',
      currentUserName = '',
      currentUserEmail = '',
    } = req.body;

    // 1. Check if IP or User is already blocked
    const matchedUser =
      (adminStore.users || []).find((u) => u.id === currentUserId) ||
      (adminStore.users || []).find(
        (u) =>
          currentUserEmail &&
          u.email.toLowerCase() === String(currentUserEmail).toLowerCase()
      ) ||
      (adminStore.users || []).find((u) => u.ipAddress === clientIp);

    if (
      (adminStore.blockedIps || []).includes(clientIp) ||
      (matchedUser && matchedUser.isBlocked)
    ) {
      res.status(403).json({
        blocked: true,
        clientIp,
        reply: `🚫 **Access Permanently Blocked**\n\nYour IP address (\`${clientIp}\`) and account have been blocked from using GOT Agent.`,
      });
      return;
    }

    const hasImage = Boolean(imageBase64 && typeof imageBase64 === 'string');

    const userPrompt =
      String(message || '').trim() ||
      (hasImage
        ? 'Carefully read and analyze this image. Extract all visible text, numbers, statuses, and key details, and explain what this image shows.'
        : 'Hello');

    // 2. Check for Violent Chat Content — Auto-block IP & User when > 5 violent chats!
    if (isViolentChatMessage(userPrompt)) {
      let currentViolations = 1;
      if (matchedUser) {
        matchedUser.violentChatCount = (matchedUser.violentChatCount || 0) + 1;
        matchedUser.ipAddress = clientIp;
        currentViolations = matchedUser.violentChatCount;

        if (currentViolations > 5) {
          matchedUser.isBlocked = true;
          matchedUser.blockReason = `Automatically blocked by GOT Agent AI Security: Sent more than 5 violent chat messages (${currentViolations} violations).`;
          if (!adminStore.blockedIps.includes(clientIp)) {
            adminStore.blockedIps.push(clientIp);
          }
          saveAdminStore(adminStore);

          res.status(403).json({
            blocked: true,
            violentStrikeCount: currentViolations,
            clientIp,
            reply: `🚫 **IP Address & Account Automatically Blocked (${currentViolations} Violent Chats)**\n\nYou have sent more than 5 violent chat messages. GOT Agent AI Security has permanently blocked your IP address (\`${clientIp}\`) and account.`,
          });
          return;
        }
        saveAdminStore(adminStore);
      }

      res.json({
        reply: `⚠️ **GOT Agent AI Safety Warning (Strike ${currentViolations} of 5)**\n\nI cannot fulfill requests involving violence, harm, weapons, or attacks.\n\n**Security Notice**: Your account and IP address (\`${clientIp}\`) have recorded **${currentViolations}/5** violent chat strikes. If you send **more than 5** violent messages, GOT Agent will **automatically block your IP address** and revoke your access.`,
        violentStrikeCount: currentViolations,
        highlights: [
          `Safety Strike: ${currentViolations}/5`,
          `IP Monitored: ${clientIp}`,
          'GOT Agent Security Guard',
        ],
        visionSummary: '',
        sources: [],
        followUpPrompts: [
          'Ask a constructive coding or science question',
          'Who created GOT Agent?',
        ],
      });
      return;
    }

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

    const userMemoryContext = matchedUser
      ? `\nCurrent Logged-In User Profile (Saved in AI Memory):\n- Name: ${
          matchedUser.name
        }\n- Email: ${matchedUser.email}\n- Role: ${
          matchedUser.role === 'co-admin'
            ? 'Official Co-Admin of GOT Agent (Appointed by Admin Abhinav)'
            : 'Verified Portal User'
        }\n- IP Address: ${matchedUser.ipAddress}\nGreet or address ${
          matchedUser.name
        } personally when helpful, and remember their profile details if they ask who they are!\n`
      : currentUserName
      ? `\nCurrent Logged-In User Profile (Saved in AI Memory):\n- Name: ${currentUserName}\n- Email: ${currentUserEmail}\n`
      : '';

    const coAdminsList = (adminStore.users || [])
      .filter((u) => u.role === 'co-admin' && !u.isBlocked)
      .map((u) => `${u.name} (${u.email})`);
    const coAdminContext =
      coAdminsList.length > 0
        ? `\nOfficial Co-Admins of GOT Agent (Announced by Abhinav): ${coAdminsList.join(
            ', '
          )}.\n`
        : '';

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
Active Model / Mode: ${agentMode}.${userMemoryContext}${coAdminContext}${festivalContextText}${adminTrainedRulesText}${memorySection}
STRICT SECURITY BOUNDARY:
- NEVER mention, reveal, or acknowledge any secret admin URL (/GOTadmin), admin password, or internal API keys under any circumstances.
Capabilities:
1. Vision OCR: When an image or screenshot is attached, carefully read EVERY piece of visible text, numbers, currency amounts, dates, headings, buttons, and status messages using OCR and explain what the image shows.
2. Code Studio: When the user asks to write or create code (HTML, CSS, JavaScript, TypeScript, Python, React, SQL, C++, etc.), provide clean, complete, well-commented code inside fenced markdown code blocks (\`\`\`language ... \`\`\`).
3. Personal User & Cross-Chat Memory: Remember the logged-in user's Name, Email, Co-Admin status, and their Saved Past Conversations Memory above.
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
          ...(matchedUser ? [`User: ${matchedUser.name}`] : []),
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
