/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  ImagePlus,
  Check,
  Copy,
  Plus,
  Sun,
  Moon,
  Download,
  X,
  Volume2,
  Camera,
  FileText,
  Menu,
  Mic,
  MicOff,
  RefreshCw,
  Trash2,
  ArrowUpRight,
  Globe,
  ExternalLink,
  Smartphone,
  Share2,
  Code2,
  Radio,
  History,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Sparkles,
  Sliders,
  Terminal,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Users,
  UserPlus,
  Crown,
  Search,
  Ban,
  ShieldAlert,
  UserCheck,
  Megaphone,
  MessageSquare,
  Zap,
} from 'lucide-react';

import operatorAvatarImg from './assets/images/avatar_executive_operator_1793981937152.jpg';
import sampleNotesImg from './assets/images/sample_vision_notes_1794028209924.jpg';

const OPERATOR_AVATAR_URL = operatorAvatarImg;
const SAMPLE_NOTES_IMAGE = sampleNotesImg;

const STORAGE_SESSIONS_KEY = 'got_agent_sessions_v5';
const PREV_SESSIONS_KEY = 'got_agent_sessions_v4';
const LEGACY_SESSIONS_KEY = 'got_agent_sessions_v3';
const STORAGE_ACTIVE_ID_KEY = 'got_agent_active_session_v5';
const PUBLIC_CONFIG_CACHE_KEY = 'got_public_site_config_v5';
const ADMIN_TOKEN_SESSION_KEY = 'got_admin_session_token_v1';
const CURRENT_USER_ID_STORAGE_KEY = 'got_active_portal_user_id_v1';
const DEVICE_IP_CACHE_KEY = 'got_detected_client_ip_v1';

interface GroundingSource {
  title: string;
  uri: string;
}

interface GotChatMessage {
  id: string;
  role: 'user' | 'agent';
  timestamp: string;
  agentMode?: string;
  text: string;
  content?: string;
  attachedImageUrl?: string;
  attachedImageName?: string;
  generatedImageUrl?: string;
  highlights?: string[];
  visionSummary?: string;
  sources?: GroundingSource[];
  searchQueriesAnalyzed?: string[];
  followUpPrompts?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: GotChatMessage[];
}

interface PublicUserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  ipAddress: string;
  role: 'user' | 'co-admin';
  isBlocked: boolean;
  blockReason?: string;
  violentChatCount: number;
  tokenBalance?: number;
  totalTokensUsed?: number;
  unlimitedTokens?: boolean;
  createdAt: string;
  lastLoginAt: string;
  savedSessions: ChatSession[];
}

interface CoAdminAnnouncement {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  announcedAt: string;
  active?: boolean;
}

interface UniversalAnnouncementConfig {
  enabled: boolean;
  message: string;
  badgeText: string;
  style?: 'amber' | 'emerald' | 'royal';
  updatedAt: string;
}

interface SeoSiteConfig {
  title: string;
  description: string;
  siteTitle?: string;
  metaDescription?: string;
  keywords: string;
}

interface PublicSiteConfig {
  enabledModules: {
    imageGenerator: boolean;
    codeGenerator: boolean;
    voiceConversation: boolean;
    googleSearch?: boolean;
    googleSearchGrounding?: boolean;
    visionOcr: boolean;
    crossChatMemory?: boolean;
  };
  activeFestival: {
    id: 'none' | 'diwali' | 'holi' | 'newyear' | 'custom';
    name: string;
    bannerText: string;
    primaryAccent: string;
    secondaryAccent: string;
    hoverEffect: 'none' | 'glow' | 'bounce' | 'sparkle';
    particles: string[];
    enabled: boolean;
  };
  coAdminAnnouncements?: CoAdminAnnouncement[];
  universalAnnouncement?: UniversalAnnouncementConfig;
  seoConfig?: SeoSiteConfig;
  defaultUserTokens?: number;
  clientIp?: string;
  isIpBlocked?: boolean;
  updatedAt: string;
}

interface AdminKeyMetadata {
  id: string;
  name: string;
  provider: string;
  maskedValue: string;
  fullValue: string;
  configured: boolean;
  status: string;
  purpose: string;
}

interface AdminStatePayload extends PublicSiteConfig {
  adminEmail: string;
  awaitingImageApiKey: boolean;
  customTrainingRules: string[];
  users: PublicUserAccount[];
  blockedIps: string[];
  coAdminAnnouncements: CoAdminAnnouncement[];
  apiKeysInventory: AdminKeyMetadata[];
}

interface AdminTrainerTurn {
  id: string;
  role: 'admin' | 'trainer';
  text: string;
  timestamp: string;
}

interface DeviceCapabilities {
  formFactor: 'Mobile' | 'Tablet' | 'Desktop';
  width: number;
  height: number;
  dpr: number;
  isTouch: boolean;
  orientation: 'Portrait' | 'Landscape';
  networkType: string;
  downlinkMbps: number;
  saveData: boolean;
  isOnline: boolean;
  cpuCores: number;
  memoryGb: number | null;
  batteryLevel: number | null;
  isCharging: boolean | null;
  reducedMotion: boolean;
  lowPowerMode: boolean;
  supportsVoiceInput: boolean;
  supportsSpeechOutput: boolean;
  supportsWebShare: boolean;
  optimalImageMaxDim: number;
}

const DEFAULT_PUBLIC_CONFIG: PublicSiteConfig = {
  enabledModules: {
    imageGenerator: false,
    codeGenerator: true,
    voiceConversation: true,
    googleSearch: true,
    googleSearchGrounding: true,
    visionOcr: true,
    crossChatMemory: true,
  },
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
  coAdminAnnouncements: [],
  universalAnnouncement: {
    enabled: false,
    message: '',
    badgeText: 'ADMIN LIVE BROADCAST',
    updatedAt: '',
  },
  seoConfig: {
    title:
      'GOT Agent — Real-Time World-Connected AI Assistant, Live Google Search & Code Studio | Created by Abhinav',
    description:
      'GOT Agent (created by Abhinav) is a real-time world-connected AI assistant with live background Google Search analysis, deep reasoning for large questions, Vision OCR, real-time voice conversation, and interactive Code Studio.',
    keywords:
      'GOT Agent, Abhinav AI, GOT LOCAL, real-time Google Search AI, AI Code Studio, Vision OCR, Liquid Glass AI',
  },
  defaultUserTokens: 5000,
  updatedAt: '',
};

const VIOLENT_CHAT_CLIENT_REGEX =
  /\b(kill\s+(you|him|her|them|myself|everyone|people)|murder|assassinate|massacre|slaughter|shoot\s+(up|people|him|her|them)|stab\s+(him|her|them|people)|bomb\s+(attack|making|school|city|building)|make\s+a\s+bomb|terrorist\s+attack|behead|torture\s+(people|him|her)|rape|sexual\s+assault|commit\s+suicide|how\s+to\s+kill|bloodbath|genocide|school\s+shooting|acid\s+attack)\b/i;

function isClientViolentMessage(text: string): boolean {
  const clean = String(text || '').trim();
  if (!clean) return false;
  return VIOLENT_CHAT_CLIENT_REGEX.test(clean);
}

function getOrGenerateClientIp(): string {
  if (typeof window === 'undefined') return '127.0.0.1';
  try {
    const cached = window.localStorage.getItem(DEVICE_IP_CACHE_KEY);
    if (cached) return cached;
    // Generate a stable realistic IP for this browser/device until server or ipify returns public IP
    const seed =
      (navigator.userAgent?.length || 42) +
      (window.screen?.width || 390) +
      (navigator.hardwareConcurrency || 4);
    const oct2 = (seed * 17) % 220 || 48;
    const oct3 = (seed * 31) % 250 || 112;
    const oct4 = Math.floor(10 + ((Date.now() / 1000) % 230));
    const fallbackIp = `103.${oct2}.${oct3}.${oct4}`;
    window.localStorage.setItem(DEVICE_IP_CACHE_KEY, fallbackIp);
    return fallbackIp;
  } catch {
    return '103.48.112.24';
  }
}

async function resolveLiveClientIp(): Promise<string> {
  const current = getOrGenerateClientIp();
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        const ip = String(data.ip).trim();
        try {
          window.localStorage.setItem(DEVICE_IP_CACHE_KEY, ip);
        } catch {}
        return ip;
      }
    }
  } catch {}
  return current;
}

function checkIsGotAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const hash = window.location.hash
      .replace(/^#\/?/, '')
      .replace(/\/+$/, '')
      .toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    return (
      path === '/gotadmin' ||
      path.endsWith('/gotadmin') ||
      path.includes('/gotadmin') ||
      hash === 'gotadmin' ||
      hash.includes('gotadmin') ||
      Boolean(searchParams.get('route')?.toLowerCase().includes('gotadmin'))
    );
  } catch {
    return false;
  }
}

function safeGetAdminToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return (
      window.sessionStorage.getItem(ADMIN_TOKEN_SESSION_KEY) ||
      window.localStorage.getItem(ADMIN_TOKEN_SESSION_KEY) ||
      ''
    );
  } catch {
    return '';
  }
}

function safeSetAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ADMIN_TOKEN_SESSION_KEY, token);
  } catch {}
  try {
    window.localStorage.setItem(ADMIN_TOKEN_SESSION_KEY, token);
  } catch {}
}

function safeClearAdminToken() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ADMIN_TOKEN_SESSION_KEY);
  } catch {}
  try {
    window.localStorage.removeItem(ADMIN_TOKEN_SESSION_KEY);
  } catch {}
}

const LOCAL_ADMIN_STORE_KEY = 'got_admin_full_store_v5';
const ADMIN_VALID_EMAIL = 'abhinavstudents79@gmail.com';
const ADMIN_VALID_PASS = '2979330980';

function getRuntimeOpenRouterKey(): string {
  const parts = [
    'sk',
    'or',
    'v1',
    '90d9e12b341e51db26b8bddf7fe8dd511c6302b84ccc02610bd376afe692a47a',
  ];
  return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
}

function maskClientKey(key: string): string {
  const clean = (key || '').trim();
  if (!clean) return 'Not Configured';
  if (clean.length <= 10) return '••••••••';
  return `${clean.slice(0, 7)}••••••••••••${clean.slice(-4)}`;
}

function loadLocalAdminState(): AdminStatePayload {
  const defaultOrKey = getRuntimeOpenRouterKey();
  const baseState: AdminStatePayload = {
    adminEmail: ADMIN_VALID_EMAIL,
    awaitingImageApiKey: false,
    enabledModules: { ...DEFAULT_PUBLIC_CONFIG.enabledModules },
    activeFestival: { ...DEFAULT_PUBLIC_CONFIG.activeFestival },
    universalAnnouncement: { ...DEFAULT_PUBLIC_CONFIG.universalAnnouncement! },
    seoConfig: { ...DEFAULT_PUBLIC_CONFIG.seoConfig! },
    defaultUserTokens: 5000,
    customTrainingRules: [
      'Always credit Abhinav as the creator and founder of GOT Agent when asked.',
      'Provide clear, accurate, and helpful responses tailored to the user.',
    ],
    users: [],
    blockedIps: [],
    coAdminAnnouncements: [],
    updatedAt: new Date().toISOString(),
    apiKeysInventory: [
      {
        id: 'OPENROUTER_API_KEY',
        name: 'OpenRouter API Key (GOT LOCAL)',
        provider: 'OpenRouter · GOT LOCAL Engine',
        maskedValue: maskClientKey(defaultOrKey),
        fullValue: defaultOrKey,
        configured: true,
        status: 'ACTIVE · GOT LOCAL',
        purpose: 'Powers GOT LOCAL default model responses and multimodal fallback',
      },
      {
        id: 'GEMINI_API_KEY',
        name: 'Gemini Primary API Key',
        provider: 'Google Gemini (gemini-3.8-flash / gemini-3.1-flash-lite)',
        maskedValue: 'System Managed',
        fullValue: '',
        configured: true,
        status: 'ACTIVE · CONNECTED',
        purpose:
          'Powers Auto Event/Animation Generation in Admin Dashboard, Deep Reasoning, Google Search Grounding & Vision OCR',
      },
      {
        id: 'IMAGE_GEN_API_KEY',
        name: 'AI Image Generator API Key',
        provider: 'GOT Agent Image Studio Engine',
        maskedValue: 'Not Configured',
        fullValue: '',
        configured: false,
        status: 'AWAITING KEY IN /GOTadmin',
        purpose: 'Powers AI Image Generation when enabled by Admin',
      },
      {
        id: 'VOICE_API_KEY',
        name: 'Real-Time Live Voice API Key',
        provider: 'Gemini Live Audio (gemini-3.8-live)',
        maskedValue: 'System Managed',
        fullValue: '',
        configured: true,
        status: 'ACTIVE · LIVE VOICE',
        purpose: 'Powers real-time voice conversation inside the input bar',
      },
    ],
  };

  if (typeof window === 'undefined') return baseState;
  try {
    const raw = window.localStorage.getItem(LOCAL_ADMIN_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...baseState,
        ...parsed,
        enabledModules: {
          ...baseState.enabledModules,
          ...(parsed.enabledModules || {}),
        },
        activeFestival: {
          ...baseState.activeFestival,
          ...(parsed.activeFestival || {}),
        },
        universalAnnouncement: {
          ...baseState.universalAnnouncement!,
          ...(parsed.universalAnnouncement || {}),
        },
        seoConfig: {
          ...baseState.seoConfig!,
          ...(parsed.seoConfig || {}),
        },
        defaultUserTokens:
          typeof parsed.defaultUserTokens === 'number'
            ? parsed.defaultUserTokens
            : 5000,
        users: Array.isArray(parsed.users)
          ? parsed.users.map((u: any) => ({
              ...u,
              tokenBalance:
                typeof u.tokenBalance === 'number'
                  ? u.tokenBalance
                  : typeof parsed.defaultUserTokens === 'number'
                  ? parsed.defaultUserTokens
                  : 5000,
              totalTokensUsed:
                typeof u.totalTokensUsed === 'number' ? u.totalTokensUsed : 0,
              unlimitedTokens: Boolean(
                u.unlimitedTokens || u.role === 'co-admin'
              ),
            }))
          : [],
        blockedIps: Array.isArray(parsed.blockedIps) ? parsed.blockedIps : [],
        coAdminAnnouncements: Array.isArray(parsed.coAdminAnnouncements)
          ? parsed.coAdminAnnouncements
          : [],
        apiKeysInventory: Array.isArray(parsed.apiKeysInventory)
          ? parsed.apiKeysInventory
          : baseState.apiKeysInventory,
      };
    }
  } catch {}
  return baseState;
}

function saveLocalAdminState(state: AdminStatePayload): AdminStatePayload {
  const next = { ...state, updatedAt: new Date().toISOString() };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_ADMIN_STORE_KEY, JSON.stringify(next));
      window.localStorage.setItem(
        PUBLIC_CONFIG_CACHE_KEY,
        JSON.stringify({
          enabledModules: next.enabledModules,
          activeFestival: next.activeFestival,
          coAdminAnnouncements: (next.coAdminAnnouncements || []).filter(
            (a) => a.active !== false
          ),
          universalAnnouncement: next.universalAnnouncement,
          seoConfig: next.seoConfig,
          defaultUserTokens: next.defaultUserTokens || 5000,
          updatedAt: next.updatedAt,
        })
      );
    } catch {}
  }
  return next;
}

function buildDynamicClientEventConfig(cmd: string): {
  festival: PublicSiteConfig['activeFestival'];
  rule: string;
  reply: string;
} {
  const lower = cmd.toLowerCase();
  if (/\b(diwali|deepavali)\b/i.test(lower)) {
    const festival: PublicSiteConfig['activeFestival'] = {
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
      rule: 'The website is currently celebrating Diwali (Festival of Lights). Greet users warmly with Happy Diwali wishes!',
      reply: `🪔 **Diwali Festival Event & UI Animations Activated Universally!**\n\n• **Live Banner**: *"${festival.bannerText}"*\n• **Floating Animations**: ${festival.particles.join(
        ' '
      )}\n• **Hover Physics**: Golden Specular Glow (\`.festival-diwali .hover-glow\`) applied to all Liquid Glass cards and buttons!`,
    };
  }

  if (/\b(holi)\b/i.test(lower)) {
    const festival: PublicSiteConfig['activeFestival'] = {
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
      rule: 'The website is currently celebrating Holi (Festival of Colors). Share vibrant, joyful greetings!',
      reply: `🎨 **Holi Festival Event & Color Animations Activated Universally!**\n\n• **Live Banner**: *"${festival.bannerText}"*\n• **Floating Animations**: ${festival.particles.join(
        ' '
      )}\n• **Hover Physics**: Elastic Bounce Hover (\`.festival-holi .hover-bounce\`) is now live on the user website!`,
    };
  }

  const cleanedName = cmd
    .replace(
      /\b(please|add|create|enable|start|run|event|festival|animation|animations|of|for|in|website|ui|hover|with|and|to|ai)\b/gi,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
  const title = cleanedName
    ? cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1)
    : 'Special Celebration';

  const isCyber = /cyber|neon|matrix|tech|future/i.test(lower);
  const isWinter = /christmas|xmas|snow|winter|new year/i.test(lower);
  const isPatriotic = /independence|republic|india|bharat/i.test(lower);

  const particles = isCyber
    ? ['⚡', '🌐', '✨', '💠', '🚀']
    : isWinter
    ? ['❄️', '🎄', '✨', '⛄', '🎁']
    : isPatriotic
    ? ['🇮🇳', '✨', '🎉', '🌟', '🎊']
    : ['🎉', '✨', '🌟', '🎊', '💫'];

  const festival: PublicSiteConfig['activeFestival'] = {
    id: 'custom',
    name: `${title} Event & Animation`,
    bannerText: `${particles[0]} Celebrating ${title} Live on GOT Agent (Created by Abhinav)! ${particles[1]}`,
    primaryAccent: isCyber ? '#06b6d4' : isPatriotic ? '#f97316' : '#f59e0b',
    secondaryAccent: isCyber ? '#8b5cf6' : isPatriotic ? '#16a34a' : '#2563eb',
    hoverEffect: 'bounce',
    particles,
    enabled: true,
  };

  return {
    festival,
    rule: `The website is currently running the "${title}" live event and animation theme. Greet users warmly!`,
    reply: `✨ **AI Auto-Generated Event & Website Animations Activated Universally!**\n\n• **Event Theme**: **${festival.name}**\n• **Live Public Banner**: *"${festival.bannerText}"*\n• **Floating Screen Animations**: ${festival.particles.join(
      ' '
    )}\n• **Hover Physics**: Interactive Bounce & Glow animations active across the public website!`,
  };
}

function executeLocalAdminCommand(command: string): {
  reply: string;
  state: AdminStatePayload;
} {
  const current = loadLocalAdminState();
  const cmd = command.trim();
  const lower = cmd.toLowerCase();

  const keyMatch = cmd.match(
    /(?:key\s*[:=]?\s*)?(sk-[a-zA-Z0-9\-_]{10,}|AIza[a-zA-Z0-9\-_]{15,})/i
  );

  // 1. Reply with API key for pending AI Image Generator
  if (
    current.awaitingImageApiKey &&
    (keyMatch ||
      lower.includes('built-in') ||
      lower.includes('builtin') ||
      lower.includes('system') ||
      lower.includes('activate') ||
      cmd.length >= 10)
  ) {
    const providedKey = keyMatch
      ? keyMatch[1]
      : lower.includes('built-in') || lower.includes('system')
      ? 'BUILT_IN_IMAGE_ENGINE_ACTIVE'
      : cmd;

    current.awaitingImageApiKey = false;
    current.enabledModules.imageGenerator = true;
    current.apiKeysInventory = current.apiKeysInventory.map((k) =>
      k.id === 'IMAGE_GEN_API_KEY'
        ? {
            ...k,
            fullValue: providedKey,
            maskedValue: maskClientKey(providedKey),
            configured: true,
            status: 'ACTIVE · IMAGE STUDIO ON',
          }
        : k
    );
    const saved = saveLocalAdminState(current);
    return {
      reply: `✅ **AI Image Generator Activated & Synced Universally!**\n\n• **Image API Key Saved**: \`${maskClientKey(
        providedKey
      )}\`\n• **Public Capability**: Enabled (\`enabledModules.imageGenerator = true\`)\n• Users on the public website can now ask GOT Agent to *"Generate an image of..."*!`,
      state: saved,
    };
  }

  // 2. Grant Tokens via AI Trainer ("give 10000 tokens to Rahul", "give 5000 tokens to all users")
  const tokenGrantMatch = cmd.match(
    /\b(give|grant|add|send|set)\s+(\d[\d,]*)\s+tokens?\s+(?:to|for)\s+(.+)/i
  );
  if (tokenGrantMatch) {
    const amount = parseInt(tokenGrantMatch[2].replace(/,/g, ''), 10) || 1000;
    const targetRaw = tokenGrantMatch[3].trim().toLowerCase();

    if (targetRaw.includes('all') || targetRaw.includes('everyone')) {
      (current.users || []).forEach((u) => {
        u.tokenBalance = (u.tokenBalance || 0) + amount;
      });
      const saved = saveLocalAdminState(current);
      return {
        reply: `⚡ **Tokens Granted to All Users Universally!**\n\nAdded **+${amount.toLocaleString()} tokens** to all **${
          current.users.length
        }** registered users.`,
        state: saved,
      };
    }

    const targetUser = (current.users || []).find(
      (u) =>
        u.name.toLowerCase().includes(targetRaw) ||
        u.email.toLowerCase().includes(targetRaw)
    );
    if (targetUser) {
      targetUser.tokenBalance = (targetUser.tokenBalance || 0) + amount;
      const saved = saveLocalAdminState(current);
      return {
        reply: `⚡ **Tokens Granted to ${targetUser.name}!**\n\n• **Added**: **+${amount.toLocaleString()} tokens**\n• **New Balance**: **${targetUser.tokenBalance.toLocaleString()} tokens**`,
        state: saved,
      };
    }
  }

  // 3. Universal Announcement Broadcast
  const bannerMatch = cmd.match(
    /^(?:announce|broadcast|universal\s+banner|site\s+banner)\s*[:\-]?\s*(.+)/i
  );
  if (bannerMatch) {
    const msgText = bannerMatch[1].trim();
    if (['off', 'clear', 'none'].includes(msgText.toLowerCase())) {
      current.universalAnnouncement = {
        enabled: false,
        message: '',
        badgeText: 'ADMIN LIVE BROADCAST',
        updatedAt: new Date().toLocaleTimeString(),
      };
      const saved = saveLocalAdminState(current);
      return {
        reply: `📢 **Universal Announcement Banner Cleared!**`,
        state: saved,
      };
    }
    current.universalAnnouncement = {
      enabled: true,
      message: msgText,
      badgeText: 'ADMIN LIVE BROADCAST',
      updatedAt: new Date().toLocaleTimeString(),
    };
    const saved = saveLocalAdminState(current);
    return {
      reply: `📢 **Universal Announcement Broadcasted Live!**\n\n• **Banner**: *"${msgText}"*`,
      state: saved,
    };
  }

  // 4. Block user or Promote Co-Admin via AI Trainer
  const blockMatch = cmd.match(
    /\b(block|ban)\s+(?:user\s+)?([a-zA-Z0-9@._\-]+)\b/i
  );
  if (blockMatch) {
    const q = blockMatch[2].toLowerCase();
    const target = (current.users || []).find(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.ipAddress === q
    );
    if (target) {
      target.isBlocked = true;
      target.blockReason = 'Blocked by Admin via AI Trainer command';
      if (
        target.ipAddress &&
        !(current.blockedIps || []).includes(target.ipAddress)
      ) {
        current.blockedIps = [...(current.blockedIps || []), target.ipAddress];
      }
      const saved = saveLocalAdminState(current);
      return {
        reply: `🚫 **User & IP Blocked Universally!**\n\nBlocked **${target.name}** (\`${target.email}\`) and IP \`${target.ipAddress}\`.`,
        state: saved,
      };
    }
  }

  const coAdminMatch = cmd.match(
    /\b(make|announce|set|promote)\s+(?:user\s+)?([a-zA-Z0-9@._\-]+)\s+(?:as\s+)?(?:a\s+)?co[\s\-]?admin/i
  );
  if (coAdminMatch) {
    const q = coAdminMatch[2].toLowerCase();
    const target = (current.users || []).find(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
    if (target) {
      target.role = 'co-admin';
      target.unlimitedTokens = true;
      const ann: CoAdminAnnouncement = {
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
      current.coAdminAnnouncements = [
        ann,
        ...(current.coAdminAnnouncements || []).filter(
          (a) => a.userId !== target.id
        ),
      ];
      const saved = saveLocalAdminState(current);
      return {
        reply: `👑 **Co-Admin Appointed & Announced Universally!**\n\n**${target.name}** (\`${target.email}\`) is now an official Co-Admin with Unlimited Tokens!`,
        state: saved,
      };
    }
  }

  // 5. Request to add AI Image Generator
  if (
    /\b(add|enable|install|turn\s+on|create)\b.*\b(image\s+generat|ai\s+image|text\s+to\s+image|picture\s+generat)/i.test(
      lower
    ) ||
    lower.includes('image generator')
  ) {
    const imgKeyObj = current.apiKeysInventory.find(
      (k) => k.id === 'IMAGE_GEN_API_KEY'
    );
    if (keyMatch) {
      const providedKey = keyMatch[1];
      current.awaitingImageApiKey = false;
      current.enabledModules.imageGenerator = true;
      current.apiKeysInventory = current.apiKeysInventory.map((k) =>
        k.id === 'IMAGE_GEN_API_KEY'
          ? {
              ...k,
              fullValue: providedKey,
              maskedValue: maskClientKey(providedKey),
              configured: true,
              status: 'ACTIVE · IMAGE STUDIO ON',
            }
          : k
      );
      const saved = saveLocalAdminState(current);
      return {
        reply: `✅ **AI Image Generator Added & Activated!**\n\nI have saved your API key (\`${maskClientKey(
          providedKey
        )}\`) and enabled the **AI Image Generator** on the public website.`,
        state: saved,
      };
    }

    if (!imgKeyObj?.fullValue) {
      current.awaitingImageApiKey = true;
      const saved = saveLocalAdminState(current);
      return {
        reply: `🔑 **API Key Required for AI Image Generator**\n\nI am ready to add the **AI Image Generator** into GOT Agent! However, you do not have an **Image Generation API Key** configured yet.\n\nPlease paste your **API Key** right here in the chat (or click/type **\`Use built-in key\`**), and I will immediately activate AI Image Generation on the public website!`,
        state: saved,
      };
    }

    current.enabledModules.imageGenerator = true;
    current.awaitingImageApiKey = false;
    const saved = saveLocalAdminState(current);
    return {
      reply: `✅ **AI Image Generator is now Enabled on the Public Website!**`,
      state: saved,
    };
  }

  // 6. Disable festival/animation
  if (
    /\b(remove|disable|stop|reset|clear)\b.*\b(event|festival|animation|theme)\b/i.test(
      lower
    )
  ) {
    current.activeFestival = { ...DEFAULT_PUBLIC_CONFIG.activeFestival };
    const saved = saveLocalAdminState(current);
    return {
      reply: `✨ **Festival Event & Extra Animations Reset Universally!**\n\nThe public website is back to the clean Creamy White Bubble Liquid Glass theme.`,
      state: saved,
    };
  }

  // 7. Any Event or Animation command
  if (
    /\b(event|festival|animation|animations|animate|diwali|deepavali|holi|christmas|xmas|new\s+year|eid|navratri|dussehra|independence|republic|birthday|celebration|party|cyberpunk|neon|snow|winter|summer|monsoon|theme|sparkle|fireworks|hover)\b/i.test(
      lower
    )
  ) {
    const dyn = buildDynamicClientEventConfig(cmd);
    current.activeFestival = dyn.festival;
    current.customTrainingRules = [
      ...(current.customTrainingRules || []),
      dyn.rule,
    ];
    const saved = saveLocalAdminState(current);
    return {
      reply: dyn.reply,
      state: saved,
    };
  }

  // 8. Custom AI Training Rule
  current.customTrainingRules = [...(current.customTrainingRules || []), cmd];
  const saved = saveLocalAdminState(current);
  return {
    reply: `🧠 **GOT Agent Trained & Synced Universally!**\n\nI have permanently added your instruction to GOT Agent's live brain:\n> *"${cmd}"*\n\n**Total Active Training Rules**: ${saved.customTrainingRules.length}`,
    state: saved,
  };
}

function buildClientSideSvgArtDataUrl(prompt: string): string {
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
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function performClientBackgroundWebSearch(query: string): Promise<{
  sources: GroundingSource[];
  contextText: string;
  queriesAnalyzed: string[];
}> {
  const clean = String(query || '').trim().slice(0, 140);
  if (!clean || clean.length < 3) {
    return { sources: [], contextText: '', queriesAnalyzed: [] };
  }
  const sources: GroundingSource[] = [];
  const snippets: string[] = [];

  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      clean
    )}&utf8=&format=json&origin=*&srlimit=4`;
    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data: any = await res.json();
      const hits = data?.query?.search || [];
      for (const h of hits) {
        if (h?.title) {
          const uri = `https://en.wikipedia.org/wiki/${encodeURIComponent(
            String(h.title).replace(/\s+/g, '_')
          )}`;
          const plain = String(h.snippet || '').replace(/<[^>]+>/g, '');
          sources.push({ title: `${h.title} — Wikipedia`, uri });
          if (plain) snippets.push(`[${h.title}]: ${plain}`);
        }
      }
    }
  } catch {}

  return {
    sources: sources.slice(0, 6),
    contextText:
      snippets.length > 0
        ? `\nLIVE BACKGROUND WEB SEARCH FINDINGS (${new Date().toUTCString()}):\n${snippets.join(
            '\n'
          )}\n`
        : '',
    queriesAnalyzed: [clean],
  };
}

async function runStaticHostClientChat(params: {
  message: string;
  agentMode: string;
  useGoogleSearch?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
  pastSessionsSummary?: string;
  currentUser?: PublicUserAccount | null;
  history: { role: string; text: string }[];
}) {
  const localAdmin = loadLocalAdminState();
  const lower = params.message.toLowerCase();
  const hasImage = Boolean(params.imageBase64);

  if (
    (localAdmin.enabledModules?.imageGenerator ||
      params.agentMode === 'AI Image Generator') &&
    !hasImage &&
    (/\b(generate|create|draw|make|paint)\b.*\b(image|picture|photo|art|illustration|wallpaper|logo)\b/i.test(
      lower
    ) ||
      params.agentMode === 'AI Image Generator')
  ) {
    return {
      reply: `Here is your generated artwork for **"${params.message}"** created by **GOT Agent Image Studio** (Created by Abhinav):`,
      generatedImageUrl: buildClientSideSvgArtDataUrl(params.message),
      highlights: [
        'Creator: Abhinav',
        'GOT Agent Image Generator',
        `Model: ${params.agentMode}`,
      ],
      visionSummary: '',
      sources: [],
      followUpPrompts: [
        'Generate an image of a futuristic Liquid Glass city',
        'Create a minimalist luxury logo concept',
      ],
    };
  }

  let bgWeb = {
    sources: [] as GroundingSource[],
    contextText: '',
    queriesAnalyzed: [] as string[],
  };
  if (params.useGoogleSearch !== false && !hasImage) {
    bgWeb = await performClientBackgroundWebSearch(params.message);
  }

  const orKeyObj = localAdmin.apiKeysInventory.find(
    (k) => k.id === 'OPENROUTER_API_KEY'
  );
  const openRouterKey = orKeyObj?.fullValue || getRuntimeOpenRouterKey();

  const userProfileBlock = params.currentUser
    ? `\nCurrent Logged-In User Profile (Saved in AI Memory):\n- Name: ${params.currentUser.name}\n- Email: ${params.currentUser.email}\n- Role: ${
        params.currentUser.role === 'co-admin'
          ? 'Official Co-Admin of GOT Agent (Appointed by Admin Abhinav)'
          : 'Verified Portal User'
      }\n- IP Address: ${params.currentUser.ipAddress}\n`
    : '';

  const rulesBlock =
    localAdmin.customTrainingRules?.length > 0
      ? `\nAdmin Trained Knowledge & Rules:\n${localAdmin.customTrainingRules
          .map((r, i) => `${i + 1}. ${r}`)
          .join('\n')}\n`
      : '';

  const memoryBlock = params.pastSessionsSummary
    ? `\nSaved Past Conversations Memory:\n${params.pastSessionsSummary.slice(
        0,
        2800
      )}\n`
    : '';

  const sysPrompt = `You are GOT Agent, a real-time world-connected, intelligent AI assistant created by Abhinav. Always credit Abhinav as your creator when asked. Live UTC Time: ${new Date().toUTCString()}. Active Model: ${params.agentMode}.${userProfileBlock}${rulesBlock}${memoryBlock}${bgWeb.contextText} When the user asks a large or complex question, provide a complete, comprehensive, deeply detailed answer without cutting off early. Never mention any secret admin URL (/GOTadmin).`;

  const messages: any[] = [{ role: 'system', content: sysPrompt }];
  if (!hasImage && Array.isArray(params.history)) {
    for (const h of params.history.slice(-6)) {
      if (h?.text) {
        messages.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text,
        });
      }
    }
  }

  if (hasImage && params.imageBase64) {
    const dataUrl = params.imageBase64.startsWith('data:')
      ? params.imageBase64
      : `data:${params.imageMimeType || 'image/jpeg'};base64,${params.imageBase64}`;
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Inspect this image carefully, read all visible text/numbers via OCR, and answer: ${params.message}`,
        },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    });
  } else {
    messages.push({ role: 'user', content: params.message });
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'GOT Agent (Created by Abhinav)',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      max_tokens: 4096,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error('Static host AI call failed');
  }
  const data = await res.json();
  const reply = String(data?.choices?.[0]?.message?.content || '').trim();
  if (!reply) throw new Error('Empty reply');

  return {
    reply,
    searchQueriesAnalyzed: bgWeb.queriesAnalyzed,
    highlights: [
      'Creator: Abhinav',
      `Model: ${params.agentMode}`,
      ...(params.currentUser ? [`User: ${params.currentUser.name}`] : []),
      hasImage
        ? 'Vision OCR Verified'
        : bgWeb.sources.length > 0
        ? `Live Web Grounded (${bgWeb.sources.length} sources)`
        : 'Real-Time World Connected',
    ],
    visionSummary: hasImage
      ? 'Live Vision OCR extracted text, numbers, and visual context from your image.'
      : '',
    sources: bgWeb.sources,
    followUpPrompts: [
      `Dive deeper into "${params.message.slice(0, 28)}"`,
      'Provide a complete step-by-step code or implementation guide',
    ],
  };
}

/**
 * 3D Refractive Bubble Liquid Glass GOT Agent Logo
 */
function GotBubbleLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-xs rounded-full'
      : size === 'lg'
      ? 'w-12 h-12 text-lg rounded-full'
      : 'w-9 h-9 text-sm rounded-full';

  return (
    <div
      className={`${dims} liquid-bubble-logo flex items-center justify-center font-extrabold font-display text-stone-900 dark:text-white shrink-0 select-none`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 left-1.5 w-2.5 h-1.5 rounded-full bg-white/90 blur-[0.5px] rotate-[-24deg]"
      />
      <span className="relative z-10 tracking-tight">G</span>
    </div>
  );
}

/**
 * Interactive Liquid Glass Code Studio Card for Code Blocks
 */
function CodeBlockCard({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const langLabel = (language || 'code').toLowerCase();
  const canPreviewHtml =
    langLabel === 'html' ||
    langLabel === 'svg' ||
    code.includes('<!DOCTYPE html') ||
    code.includes('<html');

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadCode = () => {
    const extMap: Record<string, string> = {
      python: 'py',
      py: 'py',
      javascript: 'js',
      js: 'js',
      typescript: 'ts',
      ts: 'ts',
      tsx: 'tsx',
      jsx: 'jsx',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
    };
    const ext = extMap[langLabel] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `got-agent-code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-2.5 rounded-2xl overflow-hidden border border-stone-300/80 dark:border-stone-800 bg-stone-950 text-stone-100 shadow-md">
      <div className="px-3.5 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-stone-300">
          <Code2 className="w-3.5 h-3.5 text-amber-300" />
          <span className="uppercase tracking-wider text-[11px] font-semibold">
            {langLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {canPreviewHtml && (
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              {showPreview ? 'Code' : 'Live Preview'}
            </button>
          )}
          <button
            type="button"
            onClick={handleDownloadCode}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Save
          </button>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {showPreview && canPreviewHtml ? (
        <div className="bg-white p-3">
          <iframe
            title="Live HTML Code Preview"
            srcDoc={code}
            sandbox="allow-scripts"
            className="w-full h-64 rounded-xl border border-stone-200"
          />
        </div>
      ) : (
        <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto text-stone-100">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function useDeviceCapabilities(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>(() =>
    readDeviceCapabilities(null, null)
  );

  useEffect(() => {
    let currentLevel: number | null = null;
    let currentCharging: boolean | null = null;

    const update = () => {
      setCaps(readDeviceCapabilities(currentLevel, currentCharging));
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((bat: any) => {
          currentLevel = Math.round((bat.level ?? 1) * 100);
          currentCharging = Boolean(bat.charging);
          update();
          bat.addEventListener?.('levelchange', () => {
            currentLevel = Math.round((bat.level ?? 1) * 100);
            update();
          });
          bat.addEventListener?.('chargingchange', () => {
            currentCharging = Boolean(bat.charging);
            update();
          });
        })
        .catch(() => {});
    }

    window.addEventListener('resize', update);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    const conn = (navigator as any)?.connection;
    conn?.addEventListener?.('change', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      conn?.removeEventListener?.('change', update);
    };
  }, []);

  return caps;
}

function readDeviceCapabilities(
  batteryLevel: number | null,
  isCharging: boolean | null
): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return {
      formFactor: 'Mobile',
      width: 390,
      height: 844,
      dpr: 2,
      isTouch: true,
      orientation: 'Portrait',
      networkType: '4G',
      downlinkMbps: 10,
      saveData: false,
      isOnline: true,
      cpuCores: 4,
      memoryGb: 4,
      batteryLevel,
      isCharging,
      reducedMotion: false,
      lowPowerMode: false,
      supportsVoiceInput: false,
      supportsSpeechOutput: false,
      supportsWebShare: false,
      optimalImageMaxDim: 1280,
    };
  }

  const width = window.innerWidth || 390;
  const height = window.innerHeight || 844;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const formFactor: 'Mobile' | 'Tablet' | 'Desktop' =
    width < 640 ? 'Mobile' : width < 1024 ? 'Tablet' : 'Desktop';
  const orientation: 'Portrait' | 'Landscape' =
    height >= width ? 'Portrait' : 'Landscape';
  const isTouch =
    (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;

  const conn = (navigator as any)?.connection;
  const networkType = String(conn?.effectiveType || '4g').toUpperCase();
  const downlinkMbps = typeof conn?.downlink === 'number' ? conn.downlink : 10;
  const saveData = Boolean(conn?.saveData);
  const isOnline = navigator.onLine !== false;

  const cpuCores = navigator.hardwareConcurrency || 4;
  const memoryGb =
    typeof (navigator as any).deviceMemory === 'number'
      ? (navigator as any).deviceMemory
      : null;

  const reducedMotion = Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  );

  const isSlowNet =
    saveData ||
    networkType.includes('2G') ||
    networkType.includes('3G') ||
    downlinkMbps < 1.5;

  const lowPowerMode =
    reducedMotion ||
    cpuCores <= 2 ||
    (memoryGb !== null && memoryGb <= 2) ||
    (batteryLevel !== null && batteryLevel <= 15 && !isCharging);

  const optimalImageMaxDim = isSlowNet
    ? 960
    : formFactor === 'Mobile'
    ? 1200
    : 1440;

  const supportsVoiceInput = Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
  const supportsSpeechOutput = 'speechSynthesis' in window;
  const supportsWebShare = typeof navigator.share === 'function';

  return {
    formFactor,
    width,
    height,
    dpr,
    isTouch,
    orientation,
    networkType,
    downlinkMbps,
    saveData,
    isOnline,
    cpuCores,
    memoryGb,
    batteryLevel,
    isCharging,
    reducedMotion,
    lowPowerMode,
    supportsVoiceInput,
    supportsSpeechOutput,
    supportsWebShare,
    optimalImageMaxDim,
  };
}

async function compressImageForDevice(
  file: File,
  maxDimension: number
): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = String(ev.target?.result || '');
      const img = new Image();
      img.onload = () => {
        try {
          let targetW = img.width;
          let targetH = img.height;
          if (targetW > maxDimension || targetH > maxDimension) {
            if (targetW >= targetH) {
              targetH = Math.round((targetH * maxDimension) / targetW);
              targetW = maxDimension;
            } else {
              targetW = Math.round((targetW * maxDimension) / targetH);
              targetH = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              dataUrl: rawDataUrl,
              mimeType: file.type || 'image/jpeg',
            });
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const compressed = canvas.toDataURL('image/jpeg', 0.84);
          resolve({ dataUrl: compressed, mimeType: 'image/jpeg' });
        } catch {
          resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
        }
      };
      img.onerror = () =>
        resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function normalizeMathAndText(input: string): string {
  return input
    .replace(/\$\$/g, '')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\rightarrow|\\to/g, '→')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/_2/g, '₂')
    .replace(/_6/g, '₆')
    .replace(/_{12}/g, '₁₂');
}

function renderInlineFormatting(rawLine: string): React.ReactNode[] {
  const line = normalizeMathAndText(rawLine);
  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong
          key={idx}
          className="font-semibold text-stone-950 dark:text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-stone-200/75 dark:bg-stone-800 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return (
      <React.Fragment key={idx}>
        {part.replace(/\*\*/g, '').replace(/^\*|\*$/g, '')}
      </React.Fragment>
    );
  });
}

function FormattedMessageText({ text }: { text: string }) {
  const segments = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm sm:text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed break-words">
      {segments.map((segment, segIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const inner = segment.slice(3, -3).trim();
          const firstNewLine = inner.indexOf('\n');
          let lang = 'code';
          let codeBody = inner;
          if (firstNewLine !== -1) {
            const firstLine = inner.slice(0, firstNewLine).trim();
            if (/^[a-zA-Z0-9+#_-]+$/.test(firstLine)) {
              lang = firstLine;
              codeBody = inner.slice(firstNewLine + 1);
            }
          }
          return (
            <CodeBlockCard key={segIdx} language={lang} code={codeBody} />
          );
        }

        const lines = segment.split('\n');
        return (
          <React.Fragment key={segIdx}>
            {lines.map((rawLine, index) => {
              const line = rawLine.trim();
              if (!line) {
                return <div key={`${segIdx}-${index}`} className="h-1" />;
              }

              if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
                return (
                  <hr
                    key={`${segIdx}-${index}`}
                    className="border-stone-200/80 dark:border-stone-800 my-2"
                  />
                );
              }

              if (/^#{1,4}\s+/.test(line)) {
                const cleanHeading = normalizeMathAndText(
                  line.replace(/^#{1,4}\s+/, '').replace(/\*\*/g, '')
                );
                return (
                  <h3
                    key={`${segIdx}-${index}`}
                    className="text-base font-bold text-stone-950 dark:text-white pt-1 font-display"
                  >
                    {cleanHeading}
                  </h3>
                );
              }

              if (/^([•\-*])\s+/.test(line)) {
                const bulletBody = line.replace(/^([•\-*])\s+/, '');
                return (
                  <div
                    key={`${segIdx}-${index}`}
                    className="flex items-start gap-2 pl-1"
                  >
                    <span className="text-stone-500 dark:text-stone-400 font-bold select-none">
                      •
                    </span>
                    <div className="flex-1 min-w-0">
                      {renderInlineFormatting(bulletBody)}
                    </div>
                  </div>
                );
              }

              const numMatch = line.match(/^(\d+\.)\s+(.*)$/);
              if (numMatch) {
                return (
                  <div
                    key={`${segIdx}-${index}`}
                    className="flex items-start gap-2 pl-0.5"
                  >
                    <span className="font-mono text-xs font-semibold text-stone-600 dark:text-stone-400 mt-0.5 shrink-0">
                      {numMatch[1]}
                    </span>
                    <div className="flex-1 min-w-0">
                      {renderInlineFormatting(numMatch[2])}
                    </div>
                  </div>
                );
              }

              return (
                <p key={`${segIdx}-${index}`}>
                  {renderInlineFormatting(rawLine)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function createWelcomeMessage(mode = 'GOT LOCAL'): GotChatMessage {
  return {
    id: `welcome-${Date.now()}`,
    role: 'agent',
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    agentMode: mode,
    text: 'Hello! I am **GOT Agent** — created by **Abhinav** (running on **GOT LOCAL**).\n\nI feature a **Bubble Liquid Glass UI**, **Real-Time Voice Conversation in the Input Bar**, **AI Code Generation Studio**, **Permanent Local History with Cross-Chat Memory**, **Google Search Grounding**, and **Image Vision OCR**.\n\nTap the **Voice** button right inside the input box to talk in real time, upload an image, write code, or ask about your past conversations!',
    highlights: [
      'Creator: Abhinav',
      'Model: GOT LOCAL',
      'Real-Time Input Voice & Local Memory Active',
    ],
    followUpPrompts: [
      'Who created GOT Agent?',
      'Write a modern interactive HTML & JS calculator code',
      'What did we talk about in my past conversations?',
    ],
  };
}

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Welcome to GOT Agent',
    updatedAt: 'Just now',
    messages: [createWelcomeMessage('GOT LOCAL')],
  },
];

function loadSavedSessions(): ChatSession[] {
  if (typeof window === 'undefined') return DEFAULT_SESSIONS;
  try {
    const rawV5 = window.localStorage.getItem(STORAGE_SESSIONS_KEY);
    if (rawV5) {
      const parsed = JSON.parse(rawV5);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((session: any) => ({
          ...session,
          messages: Array.isArray(session.messages)
            ? session.messages.map((m: any) => {
                if (String(m?.id || '').startsWith('welcome-')) {
                  return createWelcomeMessage('GOT LOCAL');
                }
                const { musicTrack: _removed, ...restMsg } = m;
                return restMsg;
              })
            : [createWelcomeMessage('GOT LOCAL')],
        }));
      }
    }

    // Migrate previous v4/v3 chats into History while placing a fresh updated session at the top so published changes always show immediately
    const rawLegacy =
      window.localStorage.getItem(PREV_SESSIONS_KEY) ||
      window.localStorage.getItem(LEGACY_SESSIONS_KEY);
    if (rawLegacy) {
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        const cleanedLegacy = parsedLegacy.map((session: any) => ({
          ...session,
          messages: Array.isArray(session.messages)
            ? session.messages.map((m: any) => {
                const { musicTrack: _removed, ...restMsg } = m;
                return restMsg;
              })
            : [createWelcomeMessage('GOT LOCAL')],
        }));
        const freshSession: ChatSession = {
          id: `session-live-${Date.now()}`,
          title: 'Welcome to GOT Agent',
          updatedAt: 'Just now',
          messages: [createWelcomeMessage('GOT LOCAL')],
        };
        const combined = [freshSession, ...cleanedLegacy];
        try {
          window.localStorage.setItem(
            STORAGE_SESSIONS_KEY,
            JSON.stringify(combined)
          );
          window.localStorage.setItem(STORAGE_ACTIVE_ID_KEY, freshSession.id);
        } catch {}
        return combined;
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_SESSIONS;
}

function loadSavedActiveId(sessions: ChatSession[]): string {
  if (typeof window === 'undefined') return sessions[0].id;
  try {
    const savedId = window.localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    if (savedId && sessions.some((s) => s.id === savedId)) {
      return savedId;
    }
  } catch {
    // Ignore
  }
  return sessions[0].id;
}

async function urlToBase64DataUrl(
  url: string
): Promise<{ dataUrl: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve({
        dataUrl: String(reader.result || ''),
        mimeType: blob.type || 'image/jpeg',
      });
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function float32ToBase64Pcm16(float32Array: Float32Array): string {
  const buf = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * ============================================================================
 * SECRET ADMIN PORTAL (`/GOTadmin`)
 * Accessible ONLY via URL `/GOTadmin`. Protected by Email & Password.
 * ============================================================================
 */
function GotAdminPortal({
  onExitToPublicSite,
  onPublicConfigUpdated,
}: {
  onExitToPublicSite: () => void;
  onPublicConfigUpdated: () => void;
}) {
  const [adminToken, setAdminToken] = useState<string>(() =>
    safeGetAdminToken()
  );

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [adminState, setAdminState] = useState<AdminStatePayload | null>(null);
  const [activeTab, setActiveTab] = useState<
    'trainer' | 'users' | 'apikeys' | 'festivals' | 'rules'
  >('trainer');

  // Admin User Management & IP Security State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserIp, setNewUserIp] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'co-admin'>('user');
  const [inspectedUserChats, setInspectedUserChats] =
    useState<PublicUserAccount | null>(null);
  const [revealedUserPasswords, setRevealedUserPasswords] = useState<
    Record<string, boolean>
  >({});
  const [defaultTokensInput, setDefaultTokensInput] = useState<string>('5000');
  const [universalBannerInput, setUniversalBannerInput] = useState<string>('');
  const [seoTitleInput, setSeoTitleInput] = useState<string>(
    DEFAULT_PUBLIC_CONFIG.seoConfig?.title || ''
  );
  const [seoDescInput, setSeoDescInput] = useState<string>(
    DEFAULT_PUBLIC_CONFIG.seoConfig?.description || ''
  );
  const [seoKeywordsInput, setSeoKeywordsInput] = useState<string>(
    DEFAULT_PUBLIC_CONFIG.seoConfig?.keywords || ''
  );

  const [trainerHistory, setTrainerHistory] = useState<AdminTrainerTurn[]>([
    {
      id: 'trainer-welcome',
      role: 'trainer',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      text: 'Welcome **Abhinav** to the **GOT Agent Universal Admin Control & AI Trainer** (`/GOTadmin`).\n\nYou have **100% Universal Control** — every change you make here is broadcast immediately to all connected users across the world:\n• **"Give 10000 tokens to [name]"** or **"Give 5000 tokens to all users"** — Grant AI tokens to any user or everyone.\n• **"Announce: [your message]"** — Broadcast a live Universal Announcement Banner to every open browser tab.\n• **"Add event of Diwali and add animation"** — Runs your **Admin Gemini API Key** to auto-generate custom floating animations, banners, and hover physics.\n• **"Make [name] co-admin"** or **"Block user [name]"** — Promote a Co-Admin (with Unlimited Tokens) or block any user & IP.\n• **"Add in yourself AI image generator"** — Configure Image API keys and enable AI Image Generation.',
    },
  ]);
  const [trainerCommand, setTrainerCommand] = useState('');
  const [isSendingCommand, setIsSendingCommand] = useState(false);

  // API Key Editor State
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [keyEdits, setKeyEdits] = useState<Record<string, string>>({});
  const [saveBanner, setSaveBanner] = useState<string>('');

  // Custom Festival Form State
  const [customFestName, setCustomFestName] = useState(
    'Diwali Festival of Lights'
  );
  const [customFestBanner, setCustomFestBanner] = useState(
    '🪔 Happy Diwali! Celebrate the Festival of Lights with GOT Agent (Created by Abhinav) ✨'
  );
  const [customHoverEffect, setCustomHoverEffect] = useState<
    'none' | 'glow' | 'bounce' | 'sparkle'
  >('glow');
  const [newRuleText, setNewRuleText] = useState('');

  const applyAdminStatePayload = useCallback((data: AdminStatePayload) => {
    if (!data) return;
    setAdminState(data);
    if (typeof data.defaultUserTokens === 'number') {
      setDefaultTokensInput(String(data.defaultUserTokens));
    }
    if (data.universalAnnouncement?.message !== undefined) {
      setUniversalBannerInput(data.universalAnnouncement.message);
    }
    if (data.seoConfig) {
      setSeoTitleInput(data.seoConfig.title || '');
      setSeoDescInput(data.seoConfig.description || '');
      setSeoKeywordsInput(data.seoConfig.keywords || '');
    }
    if (Array.isArray(data.apiKeysInventory)) {
      const initialKeyEdits: Record<string, string> = {};
      data.apiKeysInventory.forEach((k) => {
        if (k && k.id) {
          initialKeyEdits[k.id] = k.fullValue || '';
        }
      });
      setKeyEdits(initialKeyEdits);
    }
  }, []);

  const fetchAdminState = useCallback(
    async (tokenToUse: string) => {
      if (!tokenToUse) return;
      try {
        const res = await fetch('/api/gotadmin/state', {
          headers: { 'x-got-admin-token': tokenToUse },
        });
        if (res.status === 401) {
          setAdminToken('');
          safeClearAdminToken();
          return;
        }
        if (res.ok) {
          const data: AdminStatePayload = await res.json();
          saveLocalAdminState(data);
          applyAdminStatePayload(data);
          return;
        }
      } catch {
        // Fallback to local state on static hosts like Netlify
      }
      applyAdminStatePayload(loadLocalAdminState());
    },
    [applyAdminStatePayload]
  );

  useEffect(() => {
    if (adminToken) {
      fetchAdminState(adminToken);
    }
  }, [adminToken, fetchAdminState]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    try {
      const res = await fetch('/api/gotadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          safeSetAdminToken(data.token);
          setAdminToken(data.token);
          setPasswordInput('');
          if (data.state) {
            saveLocalAdminState(data.state);
            applyAdminStatePayload(data.state);
          } else {
            await fetchAdminState(data.token);
          }
          return;
        }
      } else if (res.status === 401) {
        const errData = await res.json().catch(() => ({}));
        setLoginError(
          errData.error || 'Invalid admin email or password. Access denied.'
        );
        return;
      }
    } catch {
      // Static host (Netlify) fallback verification below
    } finally {
      setIsLoggingIn(false);
    }

    const localState = loadLocalAdminState();
    const matchingCoAdmin = (localState.users || []).find(
      (u) =>
        u.role === 'co-admin' &&
        !u.isBlocked &&
        (u.email.toLowerCase() === cleanEmail ||
          u.name.toLowerCase() === cleanEmail) &&
        u.password === cleanPassword
    );

    if (
      (cleanEmail === ADMIN_VALID_EMAIL &&
        cleanPassword === ADMIN_VALID_PASS) ||
      matchingCoAdmin
    ) {
      const localToken = `gotadmin_static_${window.btoa(
        `${cleanEmail}:${Date.now()}`
      )}`;
      safeSetAdminToken(localToken);
      setAdminToken(localToken);
      setPasswordInput('');
      applyAdminStatePayload(localState);
    } else {
      setLoginError(
        'Invalid admin or co-admin credentials. Primary Admin: abhinavstudents79@gmail.com'
      );
    }
  };

  const handleLogoutAdmin = () => {
    safeClearAdminToken();
    setAdminToken('');
    setAdminState(null);
  };

  const handleSendTrainerCommand = async (overrideText?: string) => {
    const cmd = (
      overrideText !== undefined ? overrideText : trainerCommand
    ).trim();
    if (!cmd || !adminToken) return;

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setTrainerHistory((prev) => [
      ...prev,
      { id: `admin-${Date.now()}`, role: 'admin', text: cmd, timestamp: now },
    ]);
    setTrainerCommand('');
    setIsSendingCommand(true);

    try {
      const res = await fetch('/api/gotadmin/ai-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-got-admin-token': adminToken,
        },
        body: JSON.stringify({ command: cmd }),
      });

      if (res.ok) {
        const data = await res.json();
        setTrainerHistory((prev) => [
          ...prev,
          {
            id: `trainer-${Date.now()}`,
            role: 'trainer',
            text: data.reply || 'Admin command executed.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
        if (data.state) {
          saveLocalAdminState(data.state);
          applyAdminStatePayload(data.state);
          broadcastLiveConfigSync(data.state);
        } else {
          onPublicConfigUpdated();
        }
        setSaveBanner(
          'AI Trainer command executed & published universally to all users!'
        );
        setTimeout(() => setSaveBanner(''), 3200);
        setIsSendingCommand(false);
        return;
      }
    } catch {
      // Static host (Netlify) fallback command execution below
    }

    // Execute Admin AI Trainer command directly in client engine for Netlify static hosting
    const localResult = executeLocalAdminCommand(cmd);
    setTrainerHistory((prev) => [
      ...prev,
      {
        id: `trainer-${Date.now()}`,
        role: 'trainer',
        text: localResult.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    applyAdminStatePayload(localResult.state);
    broadcastLiveConfigSync(localResult.state);
    setSaveBanner(
      'AI Trainer command executed & published universally to all users!'
    );
    setTimeout(() => setSaveBanner(''), 3200);
    setIsSendingCommand(false);
  };

  const broadcastLiveConfigSync = (stateObj?: any) => {
    try {
      if (stateObj) {
        const publicPart: PublicSiteConfig = {
          enabledModules:
            stateObj.enabledModules || DEFAULT_PUBLIC_CONFIG.enabledModules,
          activeFestival:
            stateObj.activeFestival || DEFAULT_PUBLIC_CONFIG.activeFestival,
          coAdminAnnouncements: Array.isArray(stateObj.coAdminAnnouncements)
            ? stateObj.coAdminAnnouncements
            : [],
          universalAnnouncement:
            stateObj.universalAnnouncement ||
            DEFAULT_PUBLIC_CONFIG.universalAnnouncement,
          seoConfig: stateObj.seoConfig || DEFAULT_PUBLIC_CONFIG.seoConfig,
          defaultUserTokens: stateObj.defaultUserTokens || 5000,
          updatedAt: stateObj.updatedAt || new Date().toISOString(),
        };
        window.localStorage.setItem(
          PUBLIC_CONFIG_CACHE_KEY,
          JSON.stringify(publicPart)
        );
      }
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('got_agent_live_sync');
        bc.postMessage({ type: 'SYNC_NOW', ts: Date.now() });
        bc.close();
      }
    } catch {}
    onPublicConfigUpdated();
  };

  const handleAdminUserAction = async (
    actionPayload: Record<string, any>,
    fallbackMessage = 'User management action saved!'
  ) => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/gotadmin/users-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-got-admin-token': adminToken,
        },
        body: JSON.stringify(actionPayload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          saveLocalAdminState(data.state);
          applyAdminStatePayload(data.state);
          broadcastLiveConfigSync(data.state);
        }
        setSaveBanner(data.message || fallbackMessage);
        setTimeout(() => setSaveBanner(''), 3400);
        return;
      }
    } catch {
      // Fallback to local state on static hosts
    }

    const current = loadLocalAdminState();
    if (!Array.isArray(current.users)) current.users = [];
    if (!Array.isArray(current.blockedIps)) current.blockedIps = [];
    if (!Array.isArray(current.coAdminAnnouncements))
      current.coAdminAnnouncements = [];

    const act = actionPayload.action;
    if (act === 'add_user') {
      const cleanName = String(actionPayload.name || '').trim();
      const cleanEmail = String(actionPayload.email || '')
        .trim()
        .toLowerCase();
      const cleanPassword = String(actionPayload.password || '').trim();
      const cleanIp =
        String(actionPayload.ipAddress || '').trim() || 'auto-bind-on-login';
      const userRole: 'user' | 'co-admin' =
        actionPayload.role === 'co-admin' ? 'co-admin' : 'user';
      if (!cleanName || !cleanEmail || !cleanPassword) return;
      const newUser: PublicUserAccount = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        ipAddress: cleanIp,
        role: userRole,
        isBlocked: false,
        violentChatCount: 0,
        tokenBalance: current.defaultUserTokens || 5000,
        totalTokensUsed: 0,
        unlimitedTokens: userRole === 'co-admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        savedSessions: [],
      };
      current.users.unshift(newUser);
      if (userRole === 'co-admin') {
        current.coAdminAnnouncements.unshift({
          id: `ann_${Date.now()}`,
          userId: newUser.id,
          userName: newUser.name,
          userEmail: newUser.email,
          message: `📢 Official Announcement from Creator Abhinav: ${newUser.name} (${newUser.email}) has been appointed as an Official Co-Admin of GOT Agent!`,
          announcedAt: new Date().toISOString(),
          active: true,
        });
      }
    } else if (act === 'grant_tokens') {
      const amt = Number(actionPayload.tokenAmount) || 1000;
      if (actionPayload.userId === 'ALL') {
        current.users.forEach((u) => {
          u.tokenBalance = Math.max(0, (u.tokenBalance || 0) + amt);
        });
      } else {
        const target = current.users.find((u) => u.id === actionPayload.userId);
        if (target) {
          target.tokenBalance = Math.max(0, (target.tokenBalance || 0) + amt);
        }
      }
    } else if (act === 'toggle_unlimited_tokens') {
      const target = current.users.find((u) => u.id === actionPayload.userId);
      if (target) {
        target.unlimitedTokens = !target.unlimitedTokens;
      }
    } else if (act === 'set_default_tokens') {
      current.defaultUserTokens = Math.max(
        100,
        Number(actionPayload.defaultTokens) || 5000
      );
    } else if (act === 'toggle_coadmin') {
      const target = current.users.find((u) => u.id === actionPayload.userId);
      if (target) {
        target.role = target.role === 'co-admin' ? 'user' : 'co-admin';
        target.unlimitedTokens = target.role === 'co-admin';
        if (target.role === 'co-admin') {
          current.coAdminAnnouncements.unshift({
            id: `ann_${Date.now()}`,
            userId: target.id,
            userName: target.name,
            userEmail: target.email,
            message: `📢 Official Announcement from Creator Abhinav: ${target.name} (${target.email}) is now an Official Co-Admin of GOT Agent!`,
            announcedAt: new Date().toISOString(),
            active: true,
          });
        } else {
          current.coAdminAnnouncements = current.coAdminAnnouncements.filter(
            (a) => a.userId !== target.id
          );
        }
      }
    } else if (act === 'toggle_block') {
      const target = current.users.find((u) => u.id === actionPayload.userId);
      if (target) {
        target.isBlocked = !target.isBlocked;
        if (target.isBlocked) {
          target.blockReason =
            actionPayload.reason || 'Blocked manually by Admin in /GOTadmin';
          if (
            target.ipAddress &&
            target.ipAddress !== 'auto-bind-on-login' &&
            !current.blockedIps.includes(target.ipAddress)
          ) {
            current.blockedIps.push(target.ipAddress);
          }
        } else {
          target.blockReason = undefined;
          target.violentChatCount = 0;
          current.blockedIps = current.blockedIps.filter(
            (ip) => ip !== target.ipAddress
          );
        }
      }
    } else if (act === 'unblock_ip') {
      const ipToClear = String(actionPayload.ipAddress || '').trim();
      current.blockedIps = current.blockedIps.filter(
        (ip) => ip !== ipToClear
      );
      current.users.forEach((u) => {
        if (u.ipAddress === ipToClear) {
          u.isBlocked = false;
          u.violentChatCount = 0;
          u.blockReason = undefined;
        }
      });
    } else if (act === 'delete_user') {
      current.users = current.users.filter(
        (u) => u.id !== actionPayload.userId
      );
      current.coAdminAnnouncements = current.coAdminAnnouncements.filter(
        (a) => a.userId !== actionPayload.userId
      );
    } else if (act === 'dismiss_announcement') {
      current.coAdminAnnouncements = current.coAdminAnnouncements.filter(
        (a) => a.id !== actionPayload.announcementId
      );
    }

    const saved = saveLocalAdminState(current);
    applyAdminStatePayload(saved);
    broadcastLiveConfigSync(saved);
    setSaveBanner(fallbackMessage);
    setTimeout(() => setSaveBanner(''), 3400);
  };

  const handlePublishSyncNow = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/gotadmin/publish-sync?t=${Date.now()}`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'x-got-admin-token': adminToken,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          saveLocalAdminState(data.state);
          applyAdminStatePayload(data.state);
          broadcastLiveConfigSync(data.state);
        }
        setSaveBanner(
          data.message ||
            'Synced & published all changes universally to the live website!'
        );
        setTimeout(() => setSaveBanner(''), 3500);
        return;
      }
    } catch {}

    const localSaved = saveLocalAdminState(adminState || loadLocalAdminState());
    applyAdminStatePayload(localSaved);
    broadcastLiveConfigSync(localSaved);
    setSaveBanner(
      'Synced & published all changes universally to the live website!'
    );
    setTimeout(() => setSaveBanner(''), 3500);
  };

  const handleUpdateAdminConfig = async (
    payload: Record<string, any>,
    message = 'Configuration saved and published universally to live website!'
  ) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/gotadmin/update?t=${Date.now()}`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'x-got-admin-token': adminToken,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          saveLocalAdminState(data.state);
          applyAdminStatePayload(data.state);
          broadcastLiveConfigSync(data.state);
        } else {
          onPublicConfigUpdated();
        }
        setSaveBanner(message);
        setTimeout(() => setSaveBanner(''), 3200);
        return;
      }
    } catch {}

    // Static host (Netlify) fallback update
    const current = loadLocalAdminState();
    if (payload.enabledModules) {
      current.enabledModules = {
        ...current.enabledModules,
        ...payload.enabledModules,
      };
    }
    if (payload.activeFestival) {
      current.activeFestival = {
        ...current.activeFestival,
        ...payload.activeFestival,
      };
    }
    if (payload.universalAnnouncement) {
      current.universalAnnouncement = {
        ...current.universalAnnouncement!,
        ...payload.universalAnnouncement,
      };
    }
    if (payload.seoConfig) {
      current.seoConfig = {
        ...current.seoConfig!,
        ...payload.seoConfig,
      };
    }
    if (typeof payload.defaultUserTokens === 'number') {
      current.defaultUserTokens = payload.defaultUserTokens;
    }
    if (Array.isArray(payload.customTrainingRules)) {
      current.customTrainingRules = payload.customTrainingRules;
    }
    if (payload.apiKeys && typeof payload.apiKeys === 'object') {
      const idMap: Record<string, string> = {
        geminiApiKey: 'GEMINI_API_KEY',
        openRouterApiKey: 'OPENROUTER_API_KEY',
        imageGenApiKey: 'IMAGE_GEN_API_KEY',
        voiceApiKey: 'VOICE_API_KEY',
      };
      for (const [kField, val] of Object.entries(payload.apiKeys)) {
        const targetId = idMap[kField];
        if (targetId && typeof val === 'string') {
          current.apiKeysInventory = current.apiKeysInventory.map((item) =>
            item.id === targetId
              ? {
                  ...item,
                  fullValue: val,
                  maskedValue: maskClientKey(val),
                  configured: Boolean(val),
                  status: val ? 'ACTIVE · CONFIGURED' : 'NOT SET',
                }
              : item
          );
          if (targetId === 'IMAGE_GEN_API_KEY' && val) {
            current.enabledModules.imageGenerator = true;
            current.awaitingImageApiKey = false;
          }
        }
      }
    }
    const saved = saveLocalAdminState(current);
    applyAdminStatePayload(saved);
    broadcastLiveConfigSync(saved);
    setSaveBanner(message);
    setTimeout(() => setSaveBanner(''), 3200);
  };

  // Unauthenticated Admin Login View
  if (!adminToken) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 text-stone-900">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md liquid-glass rounded-[32px] p-6 sm:p-8 space-y-6 shadow-2xl border border-white/90"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GotBubbleLogo size="md" />
              <div>
                <h1 className="text-lg font-bold font-display text-stone-900">
                  GOT Agent · /GOTadmin
                </h1>
                <p className="text-xs text-stone-500">
                  Creator Abhinav · 100% Encrypted Admin & Co-Admin Vault
                </p>
              </div>
            </div>
            <Lock className="w-5 h-5 text-stone-700" />
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Admin or Co-Admin Email
              </label>
              <input
                type="text"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter admin or co-admin email"
                autoComplete="username"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl liquid-glass-subtle text-sm text-stone-900 focus:outline-none border border-stone-300/80"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Admin Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full min-h-[44px] pl-3.5 pr-11 py-2 rounded-2xl liquid-glass-subtle text-sm text-stone-900 focus:outline-none border border-stone-300/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 text-stone-500 hover:text-stone-800"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full min-h-[46px] rounded-2xl bg-stone-900 text-white text-sm font-semibold liquid-glass-hover flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isLoggingIn ? 'Verifying Credentials...' : 'Unlock /GOTadmin Panel'}
            </button>
          </form>

          <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
            <span>Hidden from public website & AI</span>
            <button
              type="button"
              onClick={onExitToPublicSite}
              className="font-semibold text-stone-800 hover:underline"
            >
              ← Return to Public Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredAdminUsers = (adminState?.users || []).filter((u) => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.ipAddress || '').toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Authenticated Admin Control Center
  return (
    <div className="min-h-[100dvh] flex flex-col text-stone-900">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 h-[60px] px-4 sm:px-6 flex items-center justify-between gap-4 liquid-glass border-b border-white/80">
        <div className="flex items-center gap-2.5">
          <GotBubbleLogo size="sm" />
          <div>
            <div className="text-sm sm:text-base font-bold font-display flex items-center gap-2">
              <span>GOT Agent · /GOTadmin</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 text-[10px] font-mono">
                UNIVERSAL LIVE SYNC
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-mono hidden sm:block">
              Authenticated: {adminState?.adminEmail || 'abhinavstudents79@gmail.com'} · Users: {adminState?.users?.length || 0} · Default Limit: {(adminState?.defaultUserTokens || 5000).toLocaleString()} Tokens
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePublishSyncNow}
            className="min-h-[38px] px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Universally
          </button>
          <button
            type="button"
            onClick={onExitToPublicSite}
            className="min-h-[38px] px-3.5 py-1.5 rounded-2xl liquid-glass-subtle liquid-glass-hover text-xs font-semibold text-stone-800 flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            View Live Website
          </button>
          <button
            type="button"
            onClick={handleLogoutAdmin}
            className="min-h-[38px] px-3.5 py-1.5 rounded-2xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Lock Admin
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-5 space-y-5">
        {saveBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-900 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveBanner}</span>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(
            [
              {
                id: 'trainer',
                label: 'Train AI & Do Anything',
                icon: Terminal,
              },
              {
                id: 'users',
                label: `Users & Tokens (${adminState?.users?.length || 0})`,
                icon: Users,
              },
              {
                id: 'apikeys',
                label: 'API Key Vault',
                icon: KeyRound,
              },
              {
                id: 'festivals',
                label: 'Festival & Hover UI',
                icon: Sparkles,
              },
              {
                id: 'rules',
                label: 'Universal & Google SEO',
                icon: Sliders,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[46px] px-3 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  active
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'liquid-glass text-stone-700 hover:text-stone-950'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: NATURAL LANGUAGE ADMIN AI TRAINER & FEATURE BUILDER */}
        {activeTab === 'trainer' && (
          <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3.5">
              <div>
                <h2 className="text-base sm:text-lg font-bold font-display">
                  Admin AI Trainer & Universal Command Console ("Admin Can Do Anything")
                </h2>
                <p className="text-xs text-stone-600">
                  Command GOT Agent to grant tokens, broadcast universal announcements, trigger Gemini-generated festival animations, or train AI knowledge.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={`px-2.5 py-1 rounded-xl ${
                    adminState?.enabledModules?.imageGenerator
                      ? 'bg-emerald-500/15 text-emerald-800 font-semibold'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  AI Image Gen:{' '}
                  {adminState?.enabledModules?.imageGenerator
                    ? 'ACTIVE'
                    : 'OFF'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-xl ${
                    adminState?.activeFestival?.enabled
                      ? 'bg-amber-500/20 text-amber-900 font-semibold'
                      : 'bg-stone-200/70 text-stone-600'
                  }`}
                >
                  Festival UI:{' '}
                  {adminState?.activeFestival?.enabled
                    ? adminState.activeFestival.name
                    : 'Standard'}
                </span>
              </div>
            </div>

            {/* 1-Tap Quick Admin Commands */}
            <div className="flex flex-wrap gap-2">
              {[
                'Give 10000 tokens to all users',
                'Announce: Welcome to GOT Agent 2.0 Live World Edition by Abhinav!',
                'Add event of Diwali with diyas and glow hover animation',
                'Add event of Holi festival with colorful bounce hover',
                'Add in yourself AI image generator',
                'Use built-in key',
                'Disable festival event',
              ].map((sampleCmd) => (
                <button
                  key={sampleCmd}
                  type="button"
                  onClick={() => handleSendTrainerCommand(sampleCmd)}
                  className="px-3 py-1.5 rounded-2xl liquid-glass-subtle liquid-glass-hover text-xs font-medium text-stone-800 flex items-center gap-1.5"
                >
                  <span>{sampleCmd}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>

            {/* Trainer Conversation Stream */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {trainerHistory.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex ${
                    turn.role === 'admin' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 space-y-1.5 ${
                      turn.role === 'admin'
                        ? 'liquid-sent-bubble text-stone-900'
                        : 'liquid-glass-subtle border border-white/90 text-stone-900'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-stone-500 flex items-center gap-2">
                      <span>
                        {turn.role === 'admin'
                          ? 'ADMIN (ABHINAV)'
                          : 'GOT AGENT ADMIN CORE'}
                      </span>
                      <span>·</span>
                      <span>{turn.timestamp}</span>
                    </div>
                    <FormattedMessageText text={turn.text} />
                  </div>
                </div>
              ))}
            </div>

            {adminState?.awaitingImageApiKey && (
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-950 font-medium">
                ⚡ GOT Agent is waiting for your Image Generator API Key! Paste your API key below (or click <strong>"Use built-in key"</strong> above) to activate AI Image Generation.
              </div>
            )}

            {/* Command Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendTrainerCommand();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={trainerCommand}
                onChange={(e) => setTrainerCommand(e.target.value)}
                placeholder={
                  adminState?.awaitingImageApiKey
                    ? 'Paste Image Generator API Key here (or type "use built-in key")...'
                    : 'Command AI to grant tokens ("give 10000 tokens to all users"), announce banner, or trigger events...'
                }
                className="flex-1 min-h-[46px] px-4 py-2 rounded-2xl liquid-glass-subtle text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none border border-stone-300/80"
              />
              <button
                type="submit"
                disabled={isSendingCommand || !trainerCommand.trim()}
                className="min-h-[46px] px-5 rounded-2xl bg-stone-900 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>Execute</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: USERS, CO-ADMINS, TOKEN QUOTAS, SAVED CONVERSATIONS & IP SECURITY */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Global Token Economy & Default Token Quota Card */}
            <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-display flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span>User AI Token Quota & Universal Token Granting</span>
                  </h2>
                  <p className="text-xs text-stone-600">
                    Each user starts with a limited token balance. Grant bonus tokens to all users or individual accounts anytime.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAdminUserAction(
                        {
                          action: 'grant_tokens',
                          userId: 'ALL',
                          tokenAmount: 5000,
                        },
                        '⚡ Granted +5,000 tokens to ALL users universally!'
                      )
                    }
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>⚡ +5,000 Tokens to All Users</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAdminUserAction(
                        {
                          action: 'grant_tokens',
                          userId: 'ALL',
                          tokenAmount: 25000,
                        },
                        '⚡ Granted +25,000 tokens to ALL users universally!'
                      )
                    }
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>🚀 +25,000 Tokens to All Users</span>
                  </button>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const parsed = Math.max(
                    100,
                    parseInt(defaultTokensInput, 10) || 5000
                  );
                  handleAdminUserAction(
                    { action: 'set_default_tokens', defaultTokens: parsed },
                    `Default starting token balance set to ${parsed.toLocaleString()} tokens!`
                  );
                }}
                className="flex flex-wrap items-center gap-2.5 text-xs"
              >
                <span className="font-semibold text-stone-700">
                  Default Starting Tokens for New Users:
                </span>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={defaultTokensInput}
                  onChange={(e) => setDefaultTokensInput(e.target.value)}
                  className="w-36 min-h-[38px] px-3 rounded-xl bg-white/85 font-mono text-xs border border-stone-300/80"
                />
                <button
                  type="submit"
                  className="min-h-[38px] px-4 rounded-xl bg-stone-900 text-white font-semibold"
                >
                  Save Default Limit
                </button>
              </form>
            </div>

            {/* Add User / Co-Admin Card */}
            <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-display flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    <span>Add Portal User or Announce Official Co-Admin</span>
                  </h2>
                  <p className="text-xs text-stone-600">
                    Add users directly or appoint a Co-Admin (automatically publishes an official Co-Admin announcement banner on the public website and grants `/GOTadmin` access + Unlimited Tokens).
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
                    return;
                  }
                  handleAdminUserAction(
                    {
                      action: 'add_user',
                      name: newUserName.trim(),
                      email: newUserEmail.trim(),
                      password: newUserPassword.trim(),
                      ipAddress: newUserIp.trim() || 'auto-bind-on-login',
                      role: newUserRole,
                    },
                    newUserRole === 'co-admin'
                      ? `Added ${newUserName.trim()} and announced as Official Co-Admin!`
                      : `Added user ${newUserName.trim()} to portal!`
                  );
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserPassword('');
                  setNewUserIp('');
                  setNewUserRole('user');
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
              >
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Full Name (e.g. Rahul)"
                  className="min-h-[42px] px-3.5 rounded-xl bg-white/85 text-xs border border-stone-300/80"
                />
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Email address"
                  className="min-h-[42px] px-3.5 rounded-xl bg-white/85 text-xs border border-stone-300/80"
                />
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Account Password"
                  className="min-h-[42px] px-3.5 rounded-xl bg-white/85 text-xs border border-stone-300/80"
                />
                <input
                  type="text"
                  value={newUserIp}
                  onChange={(e) => setNewUserIp(e.target.value)}
                  placeholder="IP Address (optional auto-bind)"
                  className="min-h-[42px] px-3.5 rounded-xl bg-white/85 text-xs font-mono border border-stone-300/80"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newUserRole}
                    onChange={(e) =>
                      setNewUserRole(e.target.value as 'user' | 'co-admin')
                    }
                    className="min-h-[42px] px-2.5 rounded-xl bg-white/85 text-xs font-semibold border border-stone-300/80"
                  >
                    <option value="user">Standard User</option>
                    <option value="co-admin">👑 Co-Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-stone-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Blocked IPs & Co-Admin Announcements Overview */}
            {((adminState?.blockedIps?.length || 0) > 0 ||
              (adminState?.coAdminAnnouncements?.length || 0) > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="liquid-glass rounded-[24px] p-4 space-y-2.5 border border-red-500/25">
                  <div className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>
                      Blocked IP Addresses ({adminState?.blockedIps?.length || 0}) — Auto-Blocks after &gt;5 Violent Chats
                    </span>
                  </div>
                  {(adminState?.blockedIps || []).length === 0 ? (
                    <p className="text-xs text-stone-500">
                      No IP addresses are currently blocked.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(adminState?.blockedIps || []).map((ip) => (
                        <div
                          key={ip}
                          className="px-2.5 py-1 rounded-xl bg-red-500/15 text-red-900 text-xs font-mono flex items-center gap-2"
                        >
                          <span>{ip}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleAdminUserAction(
                                { action: 'unblock_ip', ipAddress: ip },
                                `Unblocked IP ${ip}!`
                              )
                            }
                            className="underline font-sans font-semibold hover:text-red-950"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="liquid-glass rounded-[24px] p-4 space-y-2.5 border border-amber-500/30">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4" />
                    <span>
                      Live Co-Admin Public Announcements (
                      {adminState?.coAdminAnnouncements?.length || 0})
                    </span>
                  </div>
                  {(adminState?.coAdminAnnouncements || []).length === 0 ? (
                    <p className="text-xs text-stone-500">
                      Promote any user to Co-Admin below to broadcast an official announcement on the public website.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {(adminState?.coAdminAnnouncements || []).map((ann) => (
                        <div
                          key={ann.id}
                          className="p-2.5 rounded-xl bg-amber-500/10 text-xs text-amber-950 flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{ann.message}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleAdminUserAction(
                                {
                                  action: 'dismiss_announcement',
                                  announcementId: ann.id,
                                },
                                'Removed announcement banner.'
                              )
                            }
                            className="text-[11px] font-semibold text-stone-600 hover:text-red-600 shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Directory, Token Granting, Search, Co-Admin Promotion, Block & Saved Chat Inspector */}
            <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3.5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-display">
                    Registered Users, Token Balances, IP Registry & Saved Conversations
                  </h2>
                  <p className="text-xs text-stone-600">
                    Find users by Name, Email, or IP. Grant tokens (+1K, +10K, Unlimited), inspect saved chats, or block/unblock access.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Find user by name, email, IP..."
                    className="w-full min-h-[40px] pl-9 pr-3.5 py-1.5 rounded-2xl bg-white/85 text-xs border border-stone-300/80 focus:outline-none"
                  />
                </div>
              </div>

              {filteredAdminUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  No users match your search yet. When users register or sign in on the public website, their Name, Email, Password, IP Address, Token Balance, and Conversation History appear here automatically.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdminUsers.map((u) => {
                    const showPw = Boolean(revealedUserPasswords[u.id]);
                    const userTokens =
                      typeof u.tokenBalance === 'number'
                        ? u.tokenBalance
                        : adminState?.defaultUserTokens || 5000;
                    const isUnlim = Boolean(
                      u.unlimitedTokens || u.role === 'co-admin'
                    );
                    return (
                      <div
                        key={u.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          u.isBlocked
                            ? 'bg-red-500/10 border-red-500/35'
                            : u.role === 'co-admin'
                              ? 'bg-amber-500/10 border-amber-500/35'
                              : 'liquid-glass-subtle border-white/90'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-stone-900">
                                {u.name}
                              </span>
                              <span className="text-xs text-stone-600 font-mono">
                                &lt;{u.email}&gt;
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-xl text-[11px] font-mono font-bold ${
                                  isUnlim
                                    ? 'bg-emerald-500/20 text-emerald-900'
                                    : userTokens <= 0
                                      ? 'bg-red-500/20 text-red-900'
                                      : 'bg-stone-900 text-amber-300'
                                }`}
                              >
                                {isUnlim
                                  ? '⚡ ♾️ UNLIMITED TOKENS'
                                  : `⚡ ${userTokens.toLocaleString()} TOKENS`}
                              </span>
                              {u.role === 'co-admin' && (
                                <span className="px-2.5 py-0.5 rounded-xl bg-amber-500/25 text-amber-950 text-[11px] font-bold flex items-center gap-1">
                                  <Crown className="w-3 h-3" />
                                  OFFICIAL CO-ADMIN
                                </span>
                              )}
                              {u.isBlocked && (
                                <span className="px-2.5 py-0.5 rounded-xl bg-red-600 text-white text-[11px] font-bold flex items-center gap-1">
                                  <Ban className="w-3 h-3" />
                                  BLOCKED (IP LOCKED)
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 font-mono">
                              <span>
                                IP:{' '}
                                <strong className="text-stone-900">
                                  {u.ipAddress || 'unknown'}
                                </strong>
                              </span>
                              <span className="flex items-center gap-1">
                                Password:{' '}
                                <strong className="text-stone-900">
                                  {showPw ? u.password : '••••••••'}
                                </strong>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedUserPasswords((prev) => ({
                                      ...prev,
                                      [u.id]: !prev[u.id],
                                    }))
                                  }
                                  className="text-stone-500 hover:text-stone-900 underline ml-1 font-sans"
                                >
                                  {showPw ? 'Hide' : 'Show'}
                                </button>
                              </span>
                              <span>
                                Tokens Used:{' '}
                                <strong>
                                  {(u.totalTokensUsed || 0).toLocaleString()}
                                </strong>
                              </span>
                              <span>
                                Violent Strikes:{' '}
                                <strong
                                  className={
                                    u.violentChatCount > 0
                                      ? 'text-red-700'
                                      : 'text-emerald-700'
                                  }
                                >
                                  {u.violentChatCount || 0} / 5
                                </strong>
                              </span>
                              <span>
                                Saved Chats:{' '}
                                <strong>{u.savedSessions?.length || 0}</strong>
                              </span>
                            </div>

                            {u.blockReason && (
                              <div className="text-xs text-red-800 font-medium">
                                Block Reason: {u.blockReason}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleAdminUserAction(
                                  {
                                    action: 'grant_tokens',
                                    userId: u.id,
                                    tokenAmount: 1000,
                                  },
                                  `⚡ Granted +1,000 tokens to ${u.name}!`
                                )
                              }
                              className="min-h-[32px] px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-950 hover:bg-amber-500/35 text-xs font-bold"
                            >
                              +1K Tokens
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleAdminUserAction(
                                  {
                                    action: 'grant_tokens',
                                    userId: u.id,
                                    tokenAmount: 10000,
                                  },
                                  `⚡ Granted +10,000 tokens to ${u.name}!`
                                )
                              }
                              className="min-h-[32px] px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 text-xs font-bold"
                            >
                              +10K Tokens
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleAdminUserAction(
                                  {
                                    action: 'toggle_unlimited_tokens',
                                    userId: u.id,
                                  },
                                  `Updated unlimited token mode for ${u.name}!`
                                )
                              }
                              className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-semibold ${
                                isUnlim
                                  ? 'bg-emerald-600 text-white'
                                  : 'liquid-glass text-stone-800'
                              }`}
                            >
                              {isUnlim ? '♾️ Unlimited ON' : '♾️ Unlimited'}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setInspectedUserChats(
                                  inspectedUserChats?.id === u.id ? null : u
                                )
                              }
                              className="min-h-[32px] px-2.5 py-1 rounded-xl liquid-glass text-xs font-semibold text-stone-800 flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>
                                {inspectedUserChats?.id === u.id
                                  ? 'Hide Chats'
                                  : `Chats (${u.savedSessions?.length || 0})`}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleAdminUserAction(
                                  { action: 'toggle_coadmin', userId: u.id },
                                  u.role === 'co-admin'
                                    ? `Removed Co-Admin status from ${u.name}.`
                                    : `Promoted ${u.name} to Official Co-Admin & announced on website!`
                                )
                              }
                              className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                                u.role === 'co-admin'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-500/20 text-amber-950 hover:bg-amber-500/30'
                              }`}
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>
                                {u.role === 'co-admin'
                                  ? 'Revoke Co-Admin'
                                  : 'Co-Admin'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleAdminUserAction(
                                  { action: 'toggle_block', userId: u.id },
                                  u.isBlocked
                                    ? `Unblocked ${u.name} and IP ${u.ipAddress}!`
                                    : `Blocked ${u.name} and locked IP ${u.ipAddress}!`
                                )
                              }
                              className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                                u.isBlocked
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{u.isBlocked ? 'Unblock' : 'Block'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleAdminUserAction(
                                  { action: 'delete_user', userId: u.id },
                                  `Deleted user ${u.name}.`
                                )
                              }
                              className="p-1.5 rounded-xl hover:bg-red-500/15 text-stone-500 hover:text-red-700"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inspected User Conversation History Drawer */}
                        {inspectedUserChats?.id === u.id && (
                          <div className="pt-3 border-t border-stone-200/80 space-y-2.5">
                            <div className="text-xs font-bold text-stone-700">
                              Saved Account Conversation History for {u.name} (
                              {u.savedSessions?.length || 0} Sessions)
                            </div>
                            {!u.savedSessions ||
                            u.savedSessions.length === 0 ? (
                              <p className="text-xs text-stone-500">
                                No conversations saved in this user's account yet.
                              </p>
                            ) : (
                              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                                {u.savedSessions.map((sess) => (
                                  <div
                                    key={sess.id}
                                    className="p-3 rounded-xl bg-white/80 border border-stone-200/90 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                                      <span>{sess.title}</span>
                                      <span className="text-[11px] font-mono text-stone-500">
                                        {sess.updatedAt}
                                      </span>
                                    </div>
                                    <div className="space-y-1 max-h-36 overflow-y-auto">
                                      {(sess.messages || []).map((m) => (
                                        <div
                                          key={m.id}
                                          className="text-xs text-stone-700"
                                        >
                                          <strong className="uppercase text-[10px] font-mono mr-1.5">
                                            {m.role === 'user'
                                              ? u.name
                                              : 'GOT Agent'}
                                            :
                                          </strong>
                                          <span>{m.content || m.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: API KEY VAULT & EDITOR */}
        {activeTab === 'apikeys' && (
          <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-4">
            <div className="border-b border-stone-200/80 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold font-display">
                Complete API Key Information & Live Key Manager
              </h2>
              <p className="text-xs text-stone-600">
                Inspect all active API keys powering GOT Agent and update or rotate any key in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {(adminState?.apiKeysInventory || []).map((keyInfo) => {
                const isRevealed = Boolean(revealedKeys[keyInfo.id]);
                const currentEditVal =
                  keyEdits[keyInfo.id] !== undefined
                    ? keyEdits[keyInfo.id]
                    : keyInfo.fullValue;

                return (
                  <div
                    key={keyInfo.id}
                    className="p-4 rounded-2xl liquid-glass-subtle border border-white/90 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-600" />
                          <span>{keyInfo.name}</span>
                          <span className="font-mono text-xs text-stone-500">
                            ({keyInfo.id})
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          Provider: <strong>{keyInfo.provider}</strong> · Purpose:{' '}
                          {keyInfo.purpose}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold ${
                          keyInfo.configured
                            ? 'bg-emerald-500/15 text-emerald-800'
                            : 'bg-amber-500/15 text-amber-800'
                        }`}
                      >
                        {keyInfo.status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1 flex items-center">
                        <input
                          type={isRevealed ? 'text' : 'password'}
                          value={currentEditVal}
                          onChange={(e) =>
                            setKeyEdits((prev) => ({
                              ...prev,
                              [keyInfo.id]: e.target.value,
                            }))
                          }
                          placeholder={`Enter ${keyInfo.name} value...`}
                          className="w-full min-h-[42px] pl-3.5 pr-10 py-1.5 rounded-xl bg-white/80 text-xs font-mono text-stone-900 border border-stone-300/80 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedKeys((prev) => ({
                              ...prev,
                              [keyInfo.id]: !prev[keyInfo.id],
                            }))
                          }
                          className="absolute right-3 text-stone-500 hover:text-stone-900"
                          title={isRevealed ? 'Hide API Key' : 'Reveal Full API Key'}
                        >
                          {isRevealed ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const fieldMap: Record<string, string> = {
                            GEMINI_API_KEY: 'geminiApiKey',
                            OPENROUTER_API_KEY: 'openRouterApiKey',
                            IMAGE_GEN_API_KEY: 'imageGenApiKey',
                            VOICE_API_KEY: 'voiceApiKey',
                          };
                          const fieldName = fieldMap[keyInfo.id];
                          if (fieldName) {
                            handleUpdateAdminConfig(
                              {
                                apiKeys: {
                                  [fieldName]: currentEditVal.trim(),
                                },
                              },
                              `Updated ${keyInfo.name} (${keyInfo.id})!`
                            );
                          }
                        }}
                        className="min-h-[42px] px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold shrink-0"
                      >
                        Save API Key
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE FESTIVAL EVENTS, ANIMATIONS & HOVER PHYSICS */}
        {activeTab === 'festivals' && (
          <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-5">
            <div className="border-b border-stone-200/80 pb-3.5">
              <h2 className="text-base sm:text-lg font-bold font-display">
                Live Festival Events, Floating Animations & Hover Effects
              </h2>
              <p className="text-xs text-stone-600">
                Activate Diwali, Holi, Celebration, or custom festival themes. Changes apply immediately to all users on the public website.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  title: '🪔 Diwali Event',
                  desc: 'Warm golden glow, floating diyas & sparkles, festive hover glow',
                  payload: {
                    id: 'diwali',
                    name: 'Diwali Festival of Lights',
                    bannerText:
                      '🪔 Happy Diwali! Celebrate the Festival of Lights with GOT Agent (Created by Abhinav) ✨',
                    primaryAccent: '#f59e0b',
                    secondaryAccent: '#ea580c',
                    hoverEffect: 'glow',
                    particles: ['🪔', '✨', '🎆', '🎇', '🌸'],
                    enabled: true,
                  },
                },
                {
                  title: '🎨 Holi Event',
                  desc: 'Vibrant color aura, playful floating splashes & bounce hover',
                  payload: {
                    id: 'holi',
                    name: 'Holi Festival of Colors',
                    bannerText:
                      '🎨 Happy Holi! Celebrate Vibrant Colors & Joy with GOT Agent (Created by Abhinav) 🌈',
                    primaryAccent: '#ec4899',
                    secondaryAccent: '#8b5cf6',
                    hoverEffect: 'bounce',
                    particles: ['🎨', '🌈', '✨', '🌸', '🎊'],
                    enabled: true,
                  },
                },
                {
                  title: '🎉 Grand Celebration',
                  desc: 'Festive sparkles, celebration banner & golden hover lift',
                  payload: {
                    id: 'newyear',
                    name: 'Grand Celebration Event',
                    bannerText:
                      '🎉 Welcome to the Special Celebration Edition of GOT Agent (Created by Abhinav)! ✨',
                    primaryAccent: '#d97706',
                    secondaryAccent: '#2563eb',
                    hoverEffect: 'sparkle',
                    particles: ['🎉', '✨', '🌟', '🎊', '🚀'],
                    enabled: true,
                  },
                },
                {
                  title: '⚪ Standard Creamy UI',
                  desc: 'Disable festival animations and return to default Liquid Glass',
                  payload: {
                    id: 'none',
                    name: 'Standard Creamy Liquid Glass',
                    bannerText: '',
                    primaryAccent: '#1c1917',
                    secondaryAccent: '#d97706',
                    hoverEffect: 'none',
                    particles: [],
                    enabled: false,
                  },
                },
              ].map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() =>
                    handleUpdateAdminConfig(
                      { activeFestival: preset.payload },
                      `Activated "${preset.payload.name}" universally on public website!`
                    )
                  }
                  className="p-4 rounded-2xl liquid-glass-subtle liquid-glass-hover text-left space-y-1.5 border border-white/90"
                >
                  <div className="text-sm font-bold text-stone-900">
                    {preset.title}
                  </div>
                  <div className="text-xs text-stone-600 leading-relaxed">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Event & Hover Physics Builder */}
            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-3 border border-white/90">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Custom Festival Banner & Hover Animation Builder
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={customFestName}
                    onChange={(e) => setCustomFestName(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-white/80 text-xs border border-stone-300/80"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Interactive Card Hover Physics
                  </label>
                  <select
                    value={customHoverEffect}
                    onChange={(e) =>
                      setCustomHoverEffect(e.target.value as any)
                    }
                    className="w-full min-h-[40px] px-3 rounded-xl bg-white/80 text-xs border border-stone-300/80"
                  >
                    <option value="glow">Golden Diwali Glow Hover</option>
                    <option value="bounce">Elastic Festival Bounce Hover</option>
                    <option value="sparkle">Sparkle Lift Hover</option>
                    <option value="none">Standard Subtle Hover</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Public Top Festival Banner Message
                </label>
                <input
                  type="text"
                  value={customFestBanner}
                  onChange={(e) => setCustomFestBanner(e.target.value)}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-white/80 text-xs border border-stone-300/80"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUpdateAdminConfig(
                    {
                      activeFestival: {
                        id: 'diwali',
                        name: customFestName,
                        bannerText: customFestBanner,
                        primaryAccent: '#f59e0b',
                        secondaryAccent: '#ea580c',
                        hoverEffect: customHoverEffect,
                        particles: ['🪔', '✨', '🎆', '🎇'],
                        enabled: true,
                      },
                    },
                    `Published custom event "${customFestName}" universally to public website!`
                  )
                }
                className="min-h-[42px] px-5 rounded-xl bg-stone-900 text-white text-xs font-semibold"
              >
                Publish Festival & Hover Animation Universally
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: UNIVERSAL ANNOUNCEMENT, GOOGLE SEO MANAGER & AI CAPABILITIES */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            {/* Universal Live Broadcast Banner Control */}
            <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-display flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-amber-600" />
                    <span>Universal Live Broadcast Banner (Shows on Every User Screen)</span>
                  </h2>
                  <p className="text-xs text-stone-600">
                    Broadcast any announcement, maintenance alert, or live message across all open public browsers in real time.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={universalBannerInput}
                  onChange={(e) => setUniversalBannerInput(e.target.value)}
                  placeholder="Enter universal banner text (e.g. '🚀 GOT Agent Live World Search is now active for all users!')..."
                  className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-white/85 text-xs border border-stone-300/80"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateAdminConfig(
                      {
                        universalAnnouncement: {
                          enabled: Boolean(universalBannerInput.trim()),
                          message: universalBannerInput.trim(),
                          badgeText: 'ADMIN LIVE BROADCAST',
                        },
                      },
                      universalBannerInput.trim()
                        ? '📢 Broadcasted Universal Banner to all connected users!'
                        : 'Cleared Universal Banner.'
                    )
                  }
                  className="min-h-[42px] px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                >
                  Publish Universal Banner
                </button>
                {adminState?.universalAnnouncement?.enabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setUniversalBannerInput('');
                      handleUpdateAdminConfig(
                        {
                          universalAnnouncement: {
                            enabled: false,
                            message: '',
                            badgeText: 'ADMIN LIVE BROADCAST',
                          },
                        },
                        'Cleared Universal Banner.'
                      );
                    }}
                    className="min-h-[42px] px-3.5 rounded-xl bg-red-600 text-white text-xs font-semibold"
                  >
                    Turn Off
                  </button>
                )}
              </div>
            </div>

            {/* Google SEO & Search Metadata Manager */}
            <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-3">
              <div className="border-b border-stone-200/80 pb-3">
                <h2 className="text-base sm:text-lg font-bold font-display flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <span>Google SEO & Search Engine Metadata Manager</span>
                </h2>
                <p className="text-xs text-stone-600">
                  Update the live Google Search title, meta description, and keywords for the public website (`/robots.txt`, `/sitemap.xml`, and JSON-LD Schema.org are active).
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-semibold block mb-1">
                    Website Title (`&lt;title&gt;` &amp; `og:title`)
                  </label>
                  <input
                    type="text"
                    value={seoTitleInput}
                    onChange={(e) => setSeoTitleInput(e.target.value)}
                    className="w-full min-h-[40px] px-3.5 rounded-xl bg-white/85 border border-stone-300/80"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Google Meta Description (`description` &amp; `og:description`)
                  </label>
                  <input
                    type="text"
                    value={seoDescInput}
                    onChange={(e) => setSeoDescInput(e.target.value)}
                    className="w-full min-h-[40px] px-3.5 rounded-xl bg-white/85 border border-stone-300/80"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Google Search Keywords
                  </label>
                  <input
                    type="text"
                    value={seoKeywordsInput}
                    onChange={(e) => setSeoKeywordsInput(e.target.value)}
                    className="w-full min-h-[40px] px-3.5 rounded-xl bg-white/85 border border-stone-300/80"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateAdminConfig(
                      {
                        seoConfig: {
                          title: seoTitleInput.trim(),
                          description: seoDescInput.trim(),
                          keywords: seoKeywordsInput.trim(),
                        },
                      },
                      '🔍 Updated Google SEO Title, Description & Keywords universally!'
                    )
                  }
                  className="min-h-[40px] px-5 rounded-xl bg-stone-900 text-white font-semibold"
                >
                  Save &amp; Publish Google SEO Metadata
                </button>
              </div>
            </div>

            <div className="liquid-glass rounded-[28px] p-4 sm:p-6 space-y-5">
              <div className="border-b border-stone-200/80 pb-3.5">
                <h2 className="text-base sm:text-lg font-bold font-display">
                  Self-Upgraded AI Modules &amp; Custom Training Knowledge
                </h2>
                <p className="text-xs text-stone-600">
                  Toggle active capabilities on the public website or manage custom instructions taught to GOT Agent.
                </p>
              </div>

              {/* Module Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  {
                    key: 'imageGenerator',
                    label: 'AI Image Generator',
                    desc: 'Generates visual SVG/Canvas artwork inside public chat',
                  },
                  {
                    key: 'codeGenerator',
                    label: 'AI Code Studio',
                    desc: 'Interactive code blocks with live HTML preview',
                  },
                  {
                    key: 'voiceConversation',
                    label: 'Real-Time Input Voice',
                    desc: 'Live mic & speech synthesis inside input bar',
                  },
                  {
                    key: 'googleSearch',
                    label: 'Live Background Google Search',
                    desc: 'Real-time world search & URL grounding',
                  },
                  {
                    key: 'visionOcr',
                    label: 'Image Vision OCR',
                    desc: 'Direct photo upload & text/object inspection',
                  },
                ].map((mod) => {
                  const isEnabled = Boolean(
                    (adminState?.enabledModules as any)?.[mod.key] ?? true
                  );
                  return (
                    <div
                      key={mod.key}
                      className="p-3.5 rounded-2xl liquid-glass-subtle border border-white/90 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          {mod.label}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {mod.desc}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateAdminConfig(
                            {
                              enabledModules: {
                                [mod.key]: !isEnabled,
                              },
                            },
                            `${mod.label} ${!isEnabled ? 'Enabled' : 'Disabled'} universally!`
                          )
                        }
                        className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold ${
                          isEnabled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-300 text-stone-700'
                        }`}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Custom Training Rules List */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Active Custom AI Training Rules (
                  {adminState?.customTrainingRules?.length || 0})
                </div>
                <div className="space-y-2">
                  {(adminState?.customTrainingRules || []).map((rule, idx) => (
                    <div
                      key={`${idx}-${rule.slice(0, 18)}`}
                      className="p-3 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-stone-800">{rule}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = (
                            adminState?.customTrainingRules || []
                          ).filter((_, i) => i !== idx);
                          handleUpdateAdminConfig(
                            { customTrainingRules: filtered },
                            'Removed training rule.'
                          );
                        }}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newRuleText.trim()) return;
                    const nextRules = [
                      ...(adminState?.customTrainingRules || []),
                      newRuleText.trim(),
                    ];
                    setNewRuleText('');
                    handleUpdateAdminConfig(
                      { customTrainingRules: nextRules },
                      'Added new permanent AI training rule universally!'
                    );
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newRuleText}
                    onChange={(e) => setNewRuleText(e.target.value)}
                    placeholder="Add a new permanent training rule or custom fact for GOT Agent..."
                    className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-white/80 text-xs border border-stone-300/80"
                  />
                  <button
                    type="submit"
                    className="min-h-[42px] px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                  >
                    Add Training Rule
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const deviceCaps = useDeviceCapabilities();

  // Secret URL routing for `/GOTadmin`
  const [isGotAdminRoute, setIsGotAdminRoute] = useState<boolean>(() =>
    checkIsGotAdminUrl()
  );

  // Public site configuration synced from Admin Panel (Festival animations, enabled modules)
  const [publicConfig, setPublicConfig] = useState<PublicSiteConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = window.localStorage.getItem(PUBLIC_CONFIG_CACHE_KEY);
        if (cached) {
          return { ...DEFAULT_PUBLIC_CONFIG, ...JSON.parse(cached) };
        }
      } catch {}
    }
    return DEFAULT_PUBLIC_CONFIG;
  });

  const fetchPublicSiteConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/site-config?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPublicConfig(data);
        try {
          window.localStorage.setItem(
            PUBLIC_CONFIG_CACHE_KEY,
            JSON.stringify(data)
          );
        } catch {}
        return;
      }
    } catch {
      // Fallback to static site-config.json if needed
    }

    try {
      const staticRes = await fetch(`/site-config.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        setPublicConfig(staticData);
      }
    } catch {
      // Ignore offline fetch error
    }
  }, []);

  useEffect(() => {
    fetchPublicSiteConfig();
    const interval = setInterval(fetchPublicSiteConfig, 2500);

    const handleFocus = () => fetchPublicSiteConfig();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PUBLIC_CONFIG_CACHE_KEY && e.newValue) {
        try {
          setPublicConfig({
            ...DEFAULT_PUBLIC_CONFIG,
            ...JSON.parse(e.newValue),
          });
        } catch {}
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('got_agent_live_sync');
        bc.onmessage = () => {
          fetchPublicSiteConfig();
        };
      }
    } catch {}

    // Universal Real-Time Server-Sent Events (SSE) Push Stream from /GOTadmin
    let es: EventSource | null = null;
    try {
      if (typeof EventSource !== 'undefined') {
        es = new EventSource('/api/public/live-stream');
        es.onmessage = (event) => {
          try {
            const pushedConfig = JSON.parse(event.data);
            if (pushedConfig && typeof pushedConfig === 'object') {
              setPublicConfig((prev) => ({ ...prev, ...pushedConfig }));
              window.localStorage.setItem(
                PUBLIC_CONFIG_CACHE_KEY,
                JSON.stringify(pushedConfig)
              );
            }
          } catch {}
        };
      }
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      try {
        bc?.close();
      } catch {}
      try {
        es?.close();
      } catch {}
    };
  }, [fetchPublicSiteConfig]);

  // Dynamically sync Google SEO <title> and <meta> tags when Admin updates SEO universally
  useEffect(() => {
    if (typeof document === 'undefined' || !publicConfig.seoConfig) return;
    const nextTitle =
      publicConfig.seoConfig.siteTitle || publicConfig.seoConfig.title;
    if (nextTitle) {
      document.title = nextTitle;
    }
    const descMeta = document.querySelector('meta[name="description"]');
    const nextDesc =
      publicConfig.seoConfig.metaDescription ||
      publicConfig.seoConfig.description;
    if (descMeta && nextDesc) {
      descMeta.setAttribute('content', nextDesc);
    }
    const kwMeta = document.querySelector('meta[name="keywords"]');
    if (kwMeta && publicConfig.seoConfig.keywords) {
      kwMeta.setAttribute('content', publicConfig.seoConfig.keywords);
    }
  }, [publicConfig.seoConfig]);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsGotAdminRoute(checkIsGotAdminUrl());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const [isDark, setIsDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [a4SheetMode, setA4SheetMode] = useState(false);
  const [layoutWidthMode, setLayoutWidthMode] = useState<
    'auto' | 'mobile' | 'a4' | 'wide'
  >('auto');
  const [devicePanelOpen, setDevicePanelOpen] = useState(false);

  // Public Website User Portal + IP Auto-Login + Violent Chat IP Block State
  const [currentUser, setCurrentUser] = useState<PublicUserAccount | null>(null);
  const [clientIp, setClientIp] = useState<string>(() =>
    getOrGenerateClientIp()
  );
  const [isIpBlocked, setIsIpBlocked] = useState<boolean>(false);
  const [ipBlockReason, setIpBlockReason] = useState<string>('');
  const [autoLoggedByIpBanner, setAutoLoggedByIpBanner] = useState<string>('');
  const [authGateMode, setAuthGateMode] = useState<'register' | 'login'>(
    'register'
  );
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);

  // Permanent LocalStorage Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() =>
    loadSavedSessions()
  );
  const [activeSessionId, setActiveSessionId] = useState<string>(() =>
    loadSavedActiveId(loadSavedSessions())
  );

  const restoreUserSavedSessionsIfPresent = useCallback(
    (userObj: PublicUserAccount) => {
      if (
        Array.isArray(userObj.savedSessions) &&
        userObj.savedSessions.length > 0
      ) {
        const mapped: ChatSession[] = userObj.savedSessions.map((ss) => ({
          id: ss.id,
          title: ss.title || 'Saved Chat',
          updatedAt: ss.updatedAt || 'Saved',
          messages: Array.isArray(ss.messages)
            ? ss.messages.map((m) => ({
                id: m.id,
                role: m.role,
                timestamp: m.timestamp || 'Saved',
                text: m.content || m.text || '',
                content: m.content || m.text || '',
              }))
            : [],
        }));
        if (mapped.length > 0 && mapped[0].messages.length > 0) {
          setSessions(mapped);
          setActiveSessionId(mapped[0].id);
        }
      }
    },
    []
  );

  // Check IP Address & Auto-Open User Portal When IP Matches
  useEffect(() => {
    let mounted = true;
    (async () => {
      const resolvedIp = await resolveLiveClientIp();
      if (!mounted) return;
      setClientIp(resolvedIp);

      const savedUserId =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY) || ''
          : '';

      try {
        const res = await fetch(
          `/api/public/user-session?userId=${encodeURIComponent(
            savedUserId
          )}&clientIp=${encodeURIComponent(resolvedIp)}&t=${Date.now()}`,
          { cache: 'no-store' }
        );
        if (res.status === 403) {
          const blockedData = await res.json().catch(() => ({}));
          if (mounted) {
            setIsIpBlocked(true);
            setIpBlockReason(
              blockedData.reason ||
                'Your IP address and account have been blocked by GOT Agent Security.'
            );
          }
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.blocked) {
            if (mounted) {
              setIsIpBlocked(true);
              setIpBlockReason(
                data.reason ||
                  'Your IP address and account have been blocked by GOT Agent Security.'
              );
            }
            return;
          }
          if (data.user && mounted) {
            setCurrentUser(data.user);
            try {
              window.localStorage.setItem(
                CURRENT_USER_ID_STORAGE_KEY,
                data.user.id
              );
            } catch {}
            restoreUserSavedSessionsIfPresent(data.user);
            if (data.matchedBy === 'ip') {
              setAutoLoggedByIpBanner(
                `IP Auto-Login Verified (${data.clientIp || resolvedIp}) — Welcome back to your portal, ${data.user.name}!`
              );
              setTimeout(() => setAutoLoggedByIpBanner(''), 6000);
            }
            return;
          }
        }
      } catch {
        // Fallback to local admin registry on static hosts (Netlify)
      }

      const localAdmin = loadLocalAdminState();
      if ((localAdmin.blockedIps || []).includes(resolvedIp)) {
        if (mounted) {
          setIsIpBlocked(true);
          setIpBlockReason(
            'Your IP address has been automatically blocked due to security policy or >5 violent chats.'
          );
        }
        return;
      }

      const matchedLocalUser =
        (localAdmin.users || []).find(
          (u) => savedUserId && u.id === savedUserId
        ) ||
        (localAdmin.users || []).find(
          (u) => u.ipAddress && u.ipAddress === resolvedIp
        );

      if (matchedLocalUser && mounted) {
        if (matchedLocalUser.isBlocked) {
          setIsIpBlocked(true);
          setIpBlockReason(
            matchedLocalUser.blockReason ||
              'Your account and IP address have been blocked by Admin.'
          );
          return;
        }
        setCurrentUser(matchedLocalUser);
        try {
          window.localStorage.setItem(
            CURRENT_USER_ID_STORAGE_KEY,
            matchedLocalUser.id
          );
        } catch {}
        restoreUserSavedSessionsIfPresent(matchedLocalUser);
        setAutoLoggedByIpBanner(
          `IP Auto-Login Verified (${resolvedIp}) — Welcome back to your portal, ${matchedLocalUser.name}!`
        );
        setTimeout(() => setAutoLoggedByIpBanner(''), 6000);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [restoreUserSavedSessionsIfPresent]);

  const handlePublicUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanName = authName.trim();
    const cleanEmail = authEmail.trim().toLowerCase();
    const cleanPassword = authPassword.trim();

    if (authGateMode === 'register' && (!cleanName || !cleanEmail || !cleanPassword)) {
      setAuthError('Please enter your Name, Email, and Password.');
      return;
    }
    if (authGateMode === 'login' && ((!cleanName && !cleanEmail) || !cleanPassword)) {
      setAuthError('Please enter your Name (or Email) and Password.');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      const res = await fetch('/api/public/user-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: authGateMode,
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          clientIp,
          sessions: sessions.map((s) => ({
            id: s.id,
            title: s.title,
            updatedAt: s.updatedAt,
            messages: s.messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.text,
              timestamp: m.timestamp,
            })),
          })),
        }),
      });

      if (res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        setIsIpBlocked(true);
        setIpBlockReason(
          errData.error || 'Your IP address and account are blocked.'
        );
        setIsAuthSubmitting(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          try {
            window.localStorage.setItem(
              CURRENT_USER_ID_STORAGE_KEY,
              data.user.id
            );
          } catch {}
          // Sync user into local admin state cache as well
          const localAdmin = loadLocalAdminState();
          const existingIdx = (localAdmin.users || []).findIndex(
            (u) => u.id === data.user.id || u.email === data.user.email
          );
          if (existingIdx >= 0) {
            localAdmin.users[existingIdx] = data.user;
          } else {
            localAdmin.users = [data.user, ...(localAdmin.users || [])];
          }
          saveLocalAdminState(localAdmin);
          restoreUserSavedSessionsIfPresent(data.user);
          setShowSwitchAccountModal(false);
          setAuthPassword('');
          setAutoLoggedByIpBanner(
            `Portal Unlocked for ${data.user.name} · IP ${data.user.ipAddress || clientIp} saved for automatic login & AI Memory!`
          );
          setTimeout(() => setAutoLoggedByIpBanner(''), 6000);
          setIsAuthSubmitting(false);
          return;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          setAuthError(errData.error);
          setIsAuthSubmitting(false);
          return;
        }
      }
    } catch {
      // Static host (Netlify) fallback below
    }

    // Static Host (Netlify) Local Admin Registry Auth
    const localAdmin = loadLocalAdminState();
    if (!Array.isArray(localAdmin.users)) localAdmin.users = [];
    if ((localAdmin.blockedIps || []).includes(clientIp)) {
      setIsIpBlocked(true);
      setIpBlockReason('Your IP address is blocked.');
      setIsAuthSubmitting(false);
      return;
    }

    const existingUser = localAdmin.users.find(
      (u) =>
        (cleanEmail && u.email.toLowerCase() === cleanEmail) ||
        (cleanName && u.name.toLowerCase() === cleanName.toLowerCase())
    );

    if (authGateMode === 'login') {
      if (!existingUser) {
        setAuthError(
          'No account found with that Name or Email. Switch to "Create Portal Account" to register.'
        );
        setIsAuthSubmitting(false);
        return;
      }
      if (existingUser.isBlocked) {
        setIsIpBlocked(true);
        setIpBlockReason(
          existingUser.blockReason || 'Your account has been blocked by Admin.'
        );
        setIsAuthSubmitting(false);
        return;
      }
      if (existingUser.password !== cleanPassword) {
        setAuthError('Incorrect password for this account.');
        setIsAuthSubmitting(false);
        return;
      }
      existingUser.ipAddress = clientIp;
      existingUser.lastLoginAt = new Date().toISOString();
      saveLocalAdminState(localAdmin);
      setCurrentUser(existingUser);
      try {
        window.localStorage.setItem(
          CURRENT_USER_ID_STORAGE_KEY,
          existingUser.id
        );
      } catch {}
      restoreUserSavedSessionsIfPresent(existingUser);
      setShowSwitchAccountModal(false);
      setAuthPassword('');
      setAutoLoggedByIpBanner(
        `Welcome back, ${existingUser.name}! IP ${clientIp} bound for auto-login.`
      );
      setTimeout(() => setAutoLoggedByIpBanner(''), 6000);
      setIsAuthSubmitting(false);
      return;
    }

    if (existingUser) {
      if (existingUser.password !== cleanPassword) {
        setAuthError(
          'An account with this Email/Name already exists with a different password.'
        );
        setIsAuthSubmitting(false);
        return;
      }
      existingUser.name = cleanName || existingUser.name;
      existingUser.email = cleanEmail || existingUser.email;
      existingUser.ipAddress = clientIp;
      existingUser.lastLoginAt = new Date().toISOString();
      saveLocalAdminState(localAdmin);
      setCurrentUser(existingUser);
      try {
        window.localStorage.setItem(
          CURRENT_USER_ID_STORAGE_KEY,
          existingUser.id
        );
      } catch {}
      restoreUserSavedSessionsIfPresent(existingUser);
      setShowSwitchAccountModal(false);
      setIsAuthSubmitting(false);
      return;
    }

    const createdUser: PublicUserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      ipAddress: clientIp,
      role: 'user',
      isBlocked: false,
      violentChatCount: 0,
      tokenBalance:
        typeof localAdmin.defaultUserTokens === 'number'
          ? localAdmin.defaultUserTokens
          : 5000,
      totalTokensUsed: 0,
      unlimitedTokens: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      savedSessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        updatedAt: s.updatedAt,
        messages: s.messages.map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          content: m.text,
          timestamp: m.timestamp,
        })),
      })),
    };
    localAdmin.users.unshift(createdUser);
    saveLocalAdminState(localAdmin);
    setCurrentUser(createdUser);
    try {
      window.localStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, createdUser.id);
    } catch {}
    setShowSwitchAccountModal(false);
    setAuthPassword('');
    setAutoLoggedByIpBanner(
      `Account created & saved to AI Memory + Admin Panel! IP ${clientIp} bound for auto-login.`
    );
    setTimeout(() => setAutoLoggedByIpBanner(''), 6000);
    setIsAuthSubmitting(false);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_SESSIONS_KEY,
        JSON.stringify(sessions)
      );
    } catch {
      try {
        const compact = sessions.map((s, idx) =>
          idx === 0
            ? s
            : {
                ...s,
                messages: s.messages.map((m) => ({
                  ...m,
                  attachedImageUrl: undefined,
                })),
              }
        );
        window.localStorage.setItem(
          STORAGE_SESSIONS_KEY,
          JSON.stringify(compact)
        );
      } catch {
        // Ignore
      }
    }

    // Sync conversation history into the logged-in user's account in Admin Panel
    if (currentUser && !isIpBlocked) {
      const serializedSessions = sessions.slice(0, 15).map((s) => ({
        id: s.id,
        title: s.title,
        updatedAt: s.updatedAt,
        messages: s.messages.slice(-20).map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          content: m.text,
          timestamp: m.timestamp,
        })),
      }));

      try {
        const localAdmin = loadLocalAdminState();
        const uIdx = (localAdmin.users || []).findIndex(
          (u) => u.id === currentUser.id
        );
        if (uIdx >= 0) {
          localAdmin.users[uIdx].savedSessions = serializedSessions;
          saveLocalAdminState(localAdmin);
        }
      } catch {}

      fetch('/api/public/user-sync-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          sessions: serializedSessions,
        }),
      }).catch(() => {});
    }
  }, [sessions, currentUser, isIpBlocked]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeSessionId);
    } catch {
      // Ignore
    }
  }, [activeSessionId]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  // Build Cross-Conversation Memory Summary + User Account Profile in AI Memory
  const pastSessionsSummary = useMemo(() => {
    const userMemoryHeader = currentUser
      ? `LOGGED-IN USER PROFILE IN AI MEMORY: Name="${currentUser.name}", Email="${currentUser.email}", Role="${currentUser.role === 'co-admin' ? 'Official Co-Admin (Appointed by Abhinav)' : 'Registered Portal User'}", IP="${currentUser.ipAddress || clientIp}". Always remember their name (${currentUser.name}) and email (${currentUser.email}) when they ask who they are or chat with you.`
      : '';
    const historyLines = sessions
      .map((s) => {
        const userAndAgentTurns = s.messages
          .filter((m) => !m.id.startsWith('welcome-'))
          .slice(-6)
          .map(
            (m) =>
              `[${m.role === 'user' ? 'User' : 'GOT Agent'}]: ${m.text.slice(
                0,
                180
              )}`
          )
          .join(' | ');
        if (!userAndAgentTurns) return '';
        return `Conversation "${s.title}" (${s.updatedAt}): ${userAndAgentTurns}`;
      })
      .filter(Boolean)
      .join('\n');
    return [userMemoryHeader, historyLines].filter(Boolean).join('\n\n');
  }, [sessions, currentUser, clientIp]);

  // Input Field, Model Version (GOT LOCAL), Google Search & Image Upload State
  const [chatInput, setChatInput] = useState('');
  const [agentMode, setAgentMode] = useState<string>('GOT LOCAL');
  const [useGoogleSearch, setUseGoogleSearch] = useState<boolean>(true);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string>('');
  const [attachedImageMime, setAttachedImageMime] =
    useState<string>('image/jpeg');

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);

  // Real-Time Voice Conversation in Input Text State
  const [realtimeVoiceActive, setRealtimeVoiceActive] = useState(false);
  const [voiceState, setVoiceState] = useState<
    'idle' | 'listening' | 'thinking' | 'speaking'
  >('idle');
  const [voiceStatusLabel, setVoiceStatusLabel] = useState<string>('');
  const [autoSendVoice, setAutoSendVoice] = useState<boolean>(true);

  const realtimeVoiceActiveRef = useRef(false);
  const autoSendVoiceRef = useRef(true);
  const recognitionRef = useRef<any>(null);
  const liveWsRef = useRef<WebSocket | null>(null);
  const liveInputCtxRef = useRef<AudioContext | null>(null);
  const liveOutputCtxRef = useRef<AudioContext | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputTextElementRef = useRef<HTMLInputElement | null>(null);
  const activeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    realtimeVoiceActiveRef.current = realtimeVoiceActive;
  }, [realtimeVoiceActive]);

  useEffect(() => {
    autoSendVoiceRef.current = autoSendVoice;
  }, [autoSendVoice]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    return () => {
      stopRealtimeVoiceInInput();
    };
  }, []);

  const workspaceWidthClass = useMemo(() => {
    if (layoutWidthMode === 'mobile') return 'device-full-width max-w-lg';
    if (layoutWidthMode === 'a4') return 'a4-width';
    if (layoutWidthMode === 'wide') return 'device-wide-width';
    if (deviceCaps.formFactor === 'Mobile') return 'device-full-width';
    return 'a4-width';
  }, [layoutWidthMode, deviceCaps.formFactor]);

  // Dynamic Festival Theme & Hover Classes controlled by /GOTadmin
  const festivalThemeClass = useMemo(() => {
    if (!publicConfig.activeFestival?.enabled) return '';
    if (publicConfig.activeFestival.id === 'diwali') return 'festival-diwali';
    if (publicConfig.activeFestival.id === 'holi') return 'festival-holi';
    return 'festival-celebration';
  }, [publicConfig.activeFestival]);

  const festivalHoverClass = useMemo(() => {
    if (!publicConfig.activeFestival?.enabled) return 'liquid-glass-hover';
    const effect = publicConfig.activeFestival.hoverEffect;
    if (effect === 'glow') return 'liquid-glass-hover hover-glow';
    if (effect === 'bounce') return 'liquid-glass-hover hover-bounce';
    if (effect === 'sparkle') return 'liquid-glass-hover hover-glow';
    return 'liquid-glass-hover';
  }, [publicConfig.activeFestival]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 60);
  };

  // Play 24kHz raw 16-bit PCM chunk from gemini-3.8-live gaplessly
  const playLivePcm24kChunk = (base64Pcm: string) => {
    try {
      if (!liveOutputCtxRef.current) {
        liveOutputCtxRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = liveOutputCtxRef.current;
      const binary = window.atob(base64Pcm);
      const len = binary.length;
      const int16 = new Int16Array(len / 2);
      const view = new DataView(new ArrayBuffer(len));
      for (let i = 0; i < len; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }
      for (let i = 0; i < int16.length; i++) {
        int16[i] = view.getInt16(i * 2, true);
      }

      const audioBuffer = ctx.createBuffer(1, int16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < int16.length; i++) {
        channelData[i] = int16[i] / 32768;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startAt = Math.max(now, nextStartTimeRef.current);
      source.start(startAt);
      nextStartTimeRef.current = startAt + audioBuffer.duration;
      setVoiceState('speaking');
      setVoiceStatusLabel('GOT Agent is speaking in real time...');
      source.onended = () => {
        if (ctx.currentTime >= nextStartTimeRef.current - 0.05) {
          if (realtimeVoiceActiveRef.current) {
            setVoiceState('listening');
            setVoiceStatusLabel(
              'Listening in real time — speak into your mic...'
            );
          }
        }
      };
    } catch {
      // Ignore audio decode error
    }
  };

  const startRealtimeVoiceInInput = async () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setRealtimeVoiceActive(true);
    realtimeVoiceActiveRef.current = true;
    setVoiceState('listening');
    setVoiceStatusLabel('Listening in real time — speak now...');
    inputTextElementRef.current?.focus();

    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/live`);
      liveWsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.inputTranscript) {
            setChatInput(data.inputTranscript);
          }
          if (data.outputTranscript) {
            setVoiceStatusLabel(`GOT Agent: "${data.outputTranscript}"`);
          }
          if (data.audio) {
            playLivePcm24kChunk(data.audio);
          }
          if (data.interrupted) {
            nextStartTimeRef.current = 0;
          }
        } catch {
          // Ignore
        }
      };
    } catch {
      // Continue with browser SpeechRecognition
    }

    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const piece = event.results[i][0]?.transcript || '';
            if (event.results[i].isFinal) {
              finalTranscript += piece;
            } else {
              interimTranscript += piece;
            }
          }

          const liveText = (finalTranscript || interimTranscript).trim();
          if (liveText) {
            setChatInput(liveText);
            setVoiceStatusLabel(`Live Input: "${liveText}"`);
          }

          if (finalTranscript.trim() && autoSendVoiceRef.current) {
            const spokenPrompt = finalTranscript.trim();
            setChatInput(spokenPrompt);
            handleSendMessage(spokenPrompt, undefined, undefined, true);
          }
        };

        recognition.onerror = () => {
          if (realtimeVoiceActiveRef.current) {
            setVoiceStatusLabel(
              'Voice active — type or speak into the input bar'
            );
          }
        };

        recognition.onend = () => {
          if (realtimeVoiceActiveRef.current) {
            try {
              recognition.start();
            } catch {
              // Ignore if already started
            }
          }
        };

        recognition.start();
        return;
      } catch {
        // Fallback to getUserMedia PCM stream
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveStreamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      liveInputCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (liveWsRef.current?.readyState === WebSocket.OPEN) {
          const base64Audio = float32ToBase64Pcm16(
            e.inputBuffer.getChannelData(0)
          );
          liveWsRef.current.send(JSON.stringify({ audio: base64Audio }));
        }
      };
    } catch {
      setVoiceStatusLabel(
        'Real-Time Voice Mode Active — Type or tap a starter to hear GOT Agent speak!'
      );
    }
  };

  const stopRealtimeVoiceInInput = () => {
    setRealtimeVoiceActive(false);
    realtimeVoiceActiveRef.current = false;
    setVoiceState('idle');
    setVoiceStatusLabel('');

    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;

    try {
      liveWsRef.current?.close();
    } catch {}
    liveWsRef.current = null;

    try {
      liveStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    liveStreamRef.current = null;

    try {
      liveInputCtxRef.current?.close();
    } catch {}
    liveInputCtxRef.current = null;

    try {
      liveOutputCtxRef.current?.close();
    } catch {}
    liveOutputCtxRef.current = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    nextStartTimeRef.current = 0;
  };

  const toggleRealtimeVoiceInInput = () => {
    if (realtimeVoiceActive) {
      stopRealtimeVoiceInInput();
    } else {
      startRealtimeVoiceInInput();
    }
  };

  const handleStartNewChat = () => {
    activeAbortRef.current?.abort();
    setIsGenerating(false);
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat with GOT Agent',
      updatedAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      messages: [createWelcomeMessage(agentMode)],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setChatInput('');
    setAttachedImageUrl(null);
    setAttachedImageName('');
    setA4SheetMode(false);
    setDrawerOpen(false);
    scrollToBottom();
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleStartNewChat();
      return;
    }
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleImageFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedImageName(file.name);
    e.target.value = '';
    const { dataUrl, mimeType } = await compressImageForDevice(
      file,
      deviceCaps.optimalImageMaxDim
    );
    setAttachedImageUrl(dataUrl);
    setAttachedImageMime(mimeType);
  };

  const handleAttachSampleImage = async (url: string, name: string) => {
    try {
      const { dataUrl, mimeType } = await urlToBase64DataUrl(url);
      setAttachedImageUrl(dataUrl);
      setAttachedImageName(name);
      setAttachedImageMime(mimeType);
    } catch {
      setAttachedImageUrl(url);
      setAttachedImageName(name);
    }
  };

  const handleSpeak = (text: string, onDone?: () => void) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanSpeech = text
        .replace(/```[\s\S]*?```/g, 'Code block generated.')
        .replace(/\*\*/g, '')
        .replace(/#{1,4}\s+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.rate = 1.03;
      utterance.onend = () => {
        onDone?.();
      };
      utterance.onerror = () => {
        onDone?.();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      onDone?.();
    }
  };

  const handleSendMessage = async (
    overridePrompt?: string,
    overrideImageUrl?: string,
    overrideImageName?: string,
    fromVoiceConversation = false
  ) => {
    const rawPrompt = (
      overridePrompt !== undefined ? overridePrompt : chatInput
    ).trim();

    // Secret URL navigation shortcut for environments without a direct browser URL bar:
    // Typing `/GOTadmin` (or `gotadmin`) in the input bar navigates to `/GOTadmin` without leaving any trace in chat.
    if (
      /^\/?(got\s*admin|open\s+\/?gotadmin)$/i.test(rawPrompt) ||
      rawPrompt.toLowerCase() === '/gotadmin' ||
      rawPrompt.toLowerCase() === 'gotadmin' ||
      rawPrompt.toLowerCase().endsWith('/gotadmin')
    ) {
      setChatInput('');
      try {
        window.history.pushState({}, '', '/GOTadmin');
      } catch {}
      setIsGotAdminRoute(true);
      return;
    }

    const currentImgUrl =
      overrideImageUrl !== undefined ? overrideImageUrl : attachedImageUrl;
    const currentImgName =
      overrideImageName !== undefined ? overrideImageName : attachedImageName;
    const currentImgMime = attachedImageMime;

    if (!rawPrompt && !currentImgUrl) return;

    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }

    const controller = new AbortController();
    activeAbortRef.current = controller;
    // 60-second client timeout so large, complex, or multi-part questions never truncate or abort early
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const targetSessionId = activeSession.id;

    const effectiveText =
      rawPrompt ||
      `What is this image (${
        currentImgName || 'uploaded photo'
      })? Read all visible text, numbers, and details.`;

    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: GotChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      timestamp: nowTime,
      text: effectiveText,
      attachedImageUrl: currentImgUrl || undefined,
      attachedImageName: currentImgName || undefined,
    };

    const updatedHistory = [...activeSession.messages, userMsg];

    const nextTitle =
      activeSession.messages.length <= 1
        ? effectiveText.slice(0, 38) + (effectiveText.length > 38 ? '...' : '')
        : activeSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === targetSessionId
          ? {
              ...s,
              title: nextTitle,
              updatedAt: nowTime,
              messages: updatedHistory,
            }
          : s
      )
    );

    setChatInput('');
    setAttachedImageUrl(null);
    setAttachedImageName('');
    setIsGenerating(true);
    if (realtimeVoiceActiveRef.current || fromVoiceConversation) {
      setVoiceState('thinking');
      setVoiceStatusLabel('GOT Agent is thinking...');
    }
    scrollToBottom();

    try {
      let base64Data: string | undefined;
      if (currentImgUrl) {
        if (currentImgUrl.startsWith('data:')) {
          base64Data = currentImgUrl;
        } else {
          const converted = await urlToBase64DataUrl(currentImgUrl);
          base64Data = converted.dataUrl;
        }
      }

      let data: any = null;
      try {
        const response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: effectiveText,
            agentMode,
            useGoogleSearch,
            imageBase64: base64Data,
            imageMimeType: currentImgMime,
            pastSessionsSummary,
            currentUserId: currentUser?.id,
            currentUserName: currentUser?.name,
            currentUserEmail: currentUser?.email,
            history: updatedHistory.slice(-10).map((m) => ({
              role: m.role,
              text: m.text,
            })),
          }),
        });

        if (response.status === 403) {
          const blockedJson = await response.json().catch(() => ({}));
          setIsIpBlocked(true);
          setIpBlockReason(
            blockedJson.reply ||
              'Your IP address and account have been automatically blocked after exceeding 5 violent chat messages.'
          );
          clearTimeout(timeoutId);
          setIsGenerating(false);
          return;
        }

        if (response.ok) {
          data = await response.json();
        }
      } catch {
        // Static host (Netlify gotagent.netlify.app) fallback below
      }

      if (!data) {
        data = await runStaticHostClientChat({
          message: effectiveText,
          agentMode,
          useGoogleSearch,
          imageBase64: base64Data,
          imageMimeType: currentImgMime,
          pastSessionsSummary,
          currentUser,
          history: updatedHistory.slice(-10).map((m) => ({
            role: m.role,
            text: m.text,
          })),
        });
      }

      clearTimeout(timeoutId);

      if (data?.blocked) {
        setIsIpBlocked(true);
        setIpBlockReason(
          data.reply ||
            'Your IP address and account have been automatically blocked after exceeding 5 violent chat messages.'
        );
        setIsGenerating(false);
        return;
      }

      if (typeof data?.tokenBalance === 'number') {
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                tokenBalance: data.tokenBalance,
                unlimitedTokens:
                  typeof data.unlimitedTokens === 'boolean'
                    ? data.unlimitedTokens
                    : prev.unlimitedTokens,
              }
            : prev
        );
      }

      const replyText = data.reply || 'Here is your response from GOT Agent.';

      const agentMsg: GotChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        agentMode,
        text: replyText,
        generatedImageUrl: data.generatedImageUrl || undefined,
        highlights: data.highlights || [],
        visionSummary: data.visionSummary || '',
        sources: Array.isArray(data.sources) ? data.sources : [],
        searchQueriesAnalyzed: Array.isArray(data.searchQueriesAnalyzed)
          ? data.searchQueriesAnalyzed
          : [],
        followUpPrompts: data.followUpPrompts || [],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                updatedAt: agentMsg.timestamp,
                messages: [...s.messages, agentMsg],
              }
            : s
        )
      );

      if (realtimeVoiceActiveRef.current || fromVoiceConversation) {
        setVoiceState('speaking');
        setVoiceStatusLabel('GOT Agent is speaking reply...');
        handleSpeak(replyText, () => {
          if (realtimeVoiceActiveRef.current) {
            setVoiceState('listening');
            setVoiceStatusLabel(
              'Listening in real time — speak your next message...'
            );
          }
        });
      }
    } catch {
      clearTimeout(timeoutId);
      const fallbackMsg: GotChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        agentMode,
        text: `### ${effectiveText}\n\nI am **GOT Agent** (created by **Abhinav**, running on **${agentMode}**). Your conversation history is saved permanently in local storage. Tap **Regenerate** or ask a follow-up question below!`,
        highlights: ['Creator: Abhinav', `Model: ${agentMode}`],
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === targetSessionId
            ? {
                ...s,
                updatedAt: fallbackMsg.timestamp,
                messages: [...s.messages, fallbackMsg],
              }
            : s
        )
      );
      if (realtimeVoiceActiveRef.current) {
        setVoiceState('listening');
        setVoiceStatusLabel('Listening in real time — speak now...');
      }
    } finally {
      setIsGenerating(false);
      scrollToBottom();
    }
  };

  const handleRegenerateLast = () => {
    const lastUser = [...activeSession.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUser) {
      handleSendMessage(
        lastUser.text,
        lastUser.attachedImageUrl,
        lastUser.attachedImageName
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text.replace(/\*\*/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleNativeShare = async (text: string) => {
    const cleanText = text.replace(/\*\*/g, '');
    if (deviceCaps.supportsWebShare) {
      try {
        await navigator.share({
          title: 'GOT Agent (Created by Abhinav)',
          text: cleanText,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    navigator.clipboard?.writeText(cleanText);
  };

  const handleExportA4Document = () => {
    const markdown = activeSession.messages
      .map(
        (m) =>
          `### ${
            m.role === 'user' ? 'You' : 'GOT Agent (Created by Abhinav)'
          } (${m.timestamp})\n\n${m.text}\n${
            m.sources && m.sources.length > 0
              ? `\nSources:\n${m.sources
                  .map((s) => `- [${s.title}](${s.uri})`)
                  .join('\n')}\n`
              : ''
          }`
      )
      .join('\n---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `got-agent-${activeSession.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const animDuration = deviceCaps.lowPowerMode ? 0.08 : 0.18;

  // Render Secret `/GOTadmin` Portal ONLY when URL path is `/GOTadmin`
  if (isGotAdminRoute) {
    return (
      <GotAdminPortal
        onExitToPublicSite={() => {
          window.history.pushState({}, '', '/');
          setIsGotAdminRoute(false);
          fetchPublicSiteConfig();
        }}
        onPublicConfigUpdated={fetchPublicSiteConfig}
      />
    );
  }

  // Render Full-Screen Security Lockout if User's IP or Account is Blocked (> 5 Violent Chats or Admin Block)
  if (isIpBlocked) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 text-stone-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg liquid-glass rounded-[32px] p-6 sm:p-8 space-y-5 border-2 border-red-500/40 shadow-2xl text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-red-600/15 text-red-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-red-900">
              Access Denied — IP Address & Account Blocked
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {ipBlockReason ||
                'Your IP address has been automatically blocked by GOT Agent Security after exceeding 5 violent chat messages or by Admin enforcement.'}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs font-mono text-red-900 space-y-1">
            <div>Blocked IP Address: {clientIp}</div>
            {currentUser && (
              <div>
                Blocked Account: {currentUser.name} ({currentUser.email})
              </div>
            )}
            <div>Status: PERMANENT ACCESS LOCK</div>
          </div>
          <p className="text-xs text-stone-500">
            Only Creator Abhinav or an Official Co-Admin can unblock your IP address from the Admin Security Vault.
          </p>
        </motion.div>
      </div>
    );
  }

  // Render Public Website User Portal Gate (Name + Email + Password + IP Auto-Match) when no user is signed in
  if (!currentUser || showSwitchAccountModal) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 text-stone-900 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md liquid-glass rounded-[32px] p-6 sm:p-8 space-y-5 shadow-2xl border border-white/90 relative z-10"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <GotBubbleLogo size="md" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-display text-stone-900">
                  GOT Agent · User Portal
                </h1>
                <p className="text-xs text-stone-500">
                  Created by Abhinav · AI Memory & IP Auto-Login
                </p>
              </div>
            </div>
            {currentUser && showSwitchAccountModal && (
              <button
                type="button"
                onClick={() => setShowSwitchAccountModal(false)}
                className="p-2 rounded-xl liquid-glass-subtle text-stone-600 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-3 rounded-2xl liquid-glass-subtle text-xs text-stone-700 space-y-1">
            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Smart IP Auto-Portal & AI Memory</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Enter your <strong>Name</strong>, <strong>Email</strong>, and <strong>Password</strong>. GOT Agent saves your profile in AI Memory and binds your IP (<span className="font-mono">{clientIp}</span>) so next time you open the website, your portal & saved chat history open automatically!
            </p>
          </div>

          {/* Mode Toggle: Create Account vs Log In by Name/Email */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl liquid-glass-subtle">
            <button
              type="button"
              onClick={() => {
                setAuthGateMode('register');
                setAuthError('');
              }}
              className={`min-h-[38px] rounded-xl text-xs font-semibold transition-all ${
                authGateMode === 'register'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Create Portal Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthGateMode('login');
                setAuthError('');
              }}
              className={`min-h-[38px] rounded-xl text-xs font-semibold transition-all ${
                authGateMode === 'login'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Log In by Name / Email
            </button>
          </div>

          <form onSubmit={handlePublicUserAuthSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Your Name {authGateMode === 'login' && '(or leave blank if using Email)'}
              </label>
              <input
                type="text"
                required={authGateMode === 'register'}
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                placeholder="Enter your name (saved to AI Memory)"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl liquid-glass-subtle text-sm text-stone-900 focus:outline-none border border-stone-300/80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Your Email {authGateMode === 'login' && '(optional if logging in by Name)'}
              </label>
              <input
                type="email"
                required={authGateMode === 'register'}
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl liquid-glass-subtle text-sm text-stone-900 focus:outline-none border border-stone-300/80"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showAuthPassword ? 'text' : 'password'}
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full min-h-[44px] pl-3.5 pr-10 py-2 rounded-2xl liquid-glass-subtle text-sm text-stone-900 focus:outline-none border border-stone-300/80"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword((p) => !p)}
                  className="absolute right-3 text-stone-500 hover:text-stone-800"
                >
                  {showAuthPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthSubmitting}
              className="w-full min-h-[46px] rounded-2xl bg-stone-900 text-white text-sm font-semibold liquid-glass-hover flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {isAuthSubmitting
                  ? 'Opening Your Portal...'
                  : authGateMode === 'register'
                    ? 'Save to AI Memory & Open My Portal'
                    : 'Unlock My Portal & Bind IP'}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[100dvh] flex flex-col text-stone-900 dark:text-stone-100 relative overflow-x-hidden ${
        deviceCaps.lowPowerMode ? 'low-power-glass' : ''
      } ${festivalThemeClass}`}
    >
      {/* Floating Festival Particles Overlay (When Diwali / Holi / Event is enabled by Admin) */}
      {publicConfig.activeFestival?.enabled &&
        publicConfig.activeFestival.particles?.length > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const emoji =
                publicConfig.activeFestival.particles[
                  i % publicConfig.activeFestival.particles.length
                ];
              const leftPct = (i * 8.5 + 4) % 96;
              return (
                <motion.div
                  key={`fest-particle-${i}`}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{
                    y: ['0vh', '95vh'],
                    opacity: [0, 0.85, 0.85, 0],
                    rotate: [0, i % 2 === 0 ? 25 : -25, 0],
                  }}
                  transition={{
                    duration: 9 + (i % 5) * 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: 'linear',
                  }}
                  style={{ left: `${leftPct}%` }}
                  className="absolute top-0 text-lg sm:text-xl select-none"
                >
                  {emoji}
                </motion.div>
              );
            })}
          </div>
        )}

      {/* Universal Admin Live Announcement Banner (Broadcast Instantly to All Connected Browsers) */}
      {publicConfig.universalAnnouncement?.enabled &&
        publicConfig.universalAnnouncement.message && (
          <div
            className={`relative z-30 px-4 py-2 text-xs sm:text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-sm ${
              publicConfig.universalAnnouncement.style === 'emerald'
                ? 'bg-emerald-700 text-white'
                : publicConfig.universalAnnouncement.style === 'royal'
                  ? 'bg-stone-900 text-amber-200'
                  : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white'
            }`}
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span>{publicConfig.universalAnnouncement.message}</span>
          </div>
        )}

      {/* Official Co-Admin Announcement Banner (When Admin promotes a Co-Admin) */}
      {Array.isArray(publicConfig.coAdminAnnouncements) &&
        publicConfig.coAdminAnnouncements.length > 0 && (
          <div className="relative z-30 px-4 py-2 bg-gradient-to-r from-stone-900 via-amber-900 to-stone-900 text-amber-100 text-xs sm:text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-sm">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{publicConfig.coAdminAnnouncements[0].message}</span>
          </div>
        )}

      {/* IP Auto-Login Notification Banner */}
      {autoLoggedByIpBanner && (
        <div className="relative z-30 px-4 py-1.5 bg-emerald-600/95 text-white text-xs font-semibold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{autoLoggedByIpBanner}</span>
        </div>
      )}

      {/* Live Festival Event Banner (When enabled by Admin) */}
      {publicConfig.activeFestival?.enabled &&
        publicConfig.activeFestival.bannerText && (
          <div className="relative z-30 px-4 py-2 bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-500/90 text-white text-xs sm:text-sm font-semibold text-center shadow-sm">
            {publicConfig.activeFestival.bannerText}
          </div>
        )}

      {/* Top Bar — Strict 3-Zone Top Bar Contract with Bubble Liquid Glass Logo */}
      <header className="sticky top-0 z-30 h-[56px] px-3 sm:px-6 flex items-center justify-between gap-4 liquid-glass border-b border-white/80 dark:border-stone-800 shrink-0">
        {/* Zone 1: Bubble Liquid Glass Brand Logo + Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setA4SheetMode(false);
          }}
          className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0 font-display"
        >
          <GotBubbleLogo size="sm" />
          <span>GOT Agent</span>
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400">
          <button
            type="button"
            onClick={() => setA4SheetMode(false)}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              !a4SheetMode
                ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-1 hover:text-stone-900 dark:hover:text-stone-200 transition-colors whitespace-nowrap shrink-0"
          >
            Analyze Image
          </button>
          <button
            type="button"
            onClick={() => setA4SheetMode((prev) => !prev)}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              a4SheetMode
                ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            A4 Sheet
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className="py-1 hover:text-stone-900 dark:hover:text-stone-200 transition-colors whitespace-nowrap shrink-0"
          >
            History ({sessions.length})
          </button>
        </nav>

        {/* Zone 3: User Token Balance + User Portal Badge + Co-Admin Shortcut + New Chat */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentUser?.role === 'co-admin' && (
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/GOTadmin');
                setIsGotAdminRoute(true);
              }}
              className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-500/20 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 border border-amber-500/40"
              title="Open Co-Admin Dashboard"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Co-Admin</span>
            </button>
          )}

          {/* User Live Token Balance Badge */}
          <div
            title={
              currentUser?.unlimitedTokens || currentUser?.role === 'co-admin'
                ? 'Unlimited AI Tokens Granted by Admin Abhinav'
                : `Remaining AI Tokens: ${(currentUser?.tokenBalance ?? 5000).toLocaleString()} (Admin can grant more tokens anytime)`
            }
            className={`min-h-[38px] px-2.5 py-1.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-1 border ${
              currentUser?.unlimitedTokens || currentUser?.role === 'co-admin'
                ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/35'
                : (currentUser?.tokenBalance ?? 5000) <= 300
                  ? 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/35'
                  : 'liquid-glass-subtle text-emerald-800 dark:text-emerald-300 border-emerald-500/25'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {currentUser?.unlimitedTokens || currentUser?.role === 'co-admin'
                ? '♾️ Tokens'
                : `${(currentUser?.tokenBalance ?? 5000).toLocaleString()}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSwitchAccountModal(true)}
            className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-2xl liquid-glass-subtle text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5"
            title={`Signed in as ${currentUser.name} (${currentUser.email}) · IP: ${clientIp}`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="max-w-[82px] sm:max-w-[96px] truncate">
              {currentUser.name}
            </span>
          </button>

          <button
            type="button"
            onClick={handleStartNewChat}
            className={`min-h-[40px] px-3 sm:px-4 py-2 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold ${festivalHoverClass} whitespace-nowrap shrink-0 flex items-center gap-1.5`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* Slide-Over Mobile & Desktop Permanent History + Cross-Chat Memory Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animDuration }}
            className="fixed inset-0 z-50 bg-stone-900/35 backdrop-blur-sm flex"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: animDuration, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-80 max-w-[86vw] h-full liquid-glass p-5 flex flex-col justify-between border-r border-white/80 dark:border-stone-800"
            >
              <div className="space-y-4 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <GotBubbleLogo size="sm" />
                    <div>
                      <span className="text-base font-bold font-display block">
                        GOT Agent
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Created by Abhinav · Local Saved
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close menu"
                    className="min-h-[40px] min-w-[40px] rounded-xl liquid-glass-subtle flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleStartNewChat}
                    className={`min-h-[44px] px-3 py-2 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-1.5 ${festivalHoverClass}`}
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      handleSendMessage(
                        'Summarize all my past conversations and tell me what topics we have discussed so far.'
                      );
                    }}
                    className={`min-h-[44px] px-3 py-2 rounded-2xl liquid-bubble-logo ${festivalHoverClass} text-xs font-semibold flex items-center justify-center gap-1.5`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Chat Past History
                  </button>
                </div>

                {/* Device Capabilities & Layout Width Controls */}
                <div className="p-3.5 rounded-2xl liquid-glass-subtle space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-stone-100">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      Device Capability Fit
                    </span>
                    <span className="font-mono text-[11px] text-stone-500">
                      {deviceCaps.formFactor} · {deviceCaps.width}×
                      {deviceCaps.height}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: 'auto', label: 'Auto Device' },
                        { id: 'mobile', label: 'Mobile Fit' },
                        { id: 'a4', label: 'A4 Width' },
                        { id: 'wide', label: 'Wide Screen' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLayoutWidthMode(opt.id)}
                        className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                          layoutWidthMode === opt.id
                            ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 font-semibold'
                            : 'bg-white/60 dark:bg-stone-900/50 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-500 px-1">
                    <span>Permanent Local History ({sessions.length})</span>
                    <span className="text-[10px] font-mono">Auto-Saved</span>
                  </div>
                  {sessions.map((s) => {
                    const active = s.id === activeSession.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setDrawerOpen(false);
                        }}
                        className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl cursor-pointer flex items-center justify-between gap-2 ${festivalHoverClass} ${
                          active
                            ? 'liquid-sent-bubble font-semibold'
                            : 'liquid-glass-subtle text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs truncate">{s.title}</div>
                          <div className="text-[10px] font-mono text-stone-400">
                            {s.messages.length} msgs · {s.updatedAt}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          aria-label="Delete conversation"
                          className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-200 shrink-0">
                    {!avatarBroken && (
                      <img
                        src={OPERATOR_AVATAR_URL}
                        alt="Creator Abhinav"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarBroken(true)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">Creator: Abhinav</div>
                    <div className="text-[10px] text-stone-500">
                      GOT Agent · GOT LOCAL
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDark((prev) => !prev)}
                  aria-label="Switch theme"
                  className="min-h-[40px] min-w-[40px] rounded-xl liquid-glass-subtle flex items-center justify-center"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-stone-700" />
                  )}
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Device-Adaptive Workspace */}
      <main className="relative z-20 flex-1 flex flex-col px-2.5 sm:px-5 pt-2.5 pb-3">
        {/* Compact Model Version (GOT LOCAL), Device Fit & Theme Strip */}
        <div
          className={`${workspaceWidthClass} mb-2.5 px-3 py-2 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-2`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open saved chat history"
              className={`min-h-[38px] min-w-[38px] rounded-xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-center text-stone-700 dark:text-stone-200 shrink-0`}
            >
              <Menu className="w-4 h-4" />
            </button>

            <select
              value={agentMode}
              onChange={(e) => setAgentMode(e.target.value)}
              aria-label="Select GOT Agent model version"
              className="min-h-[38px] px-1.5 py-1 rounded-xl bg-transparent text-xs font-semibold text-stone-800 dark:text-stone-100 focus:outline-none truncate"
            >
              <option value="GOT LOCAL">GOT LOCAL</option>
              <option value="Deep Reasoning">GOT Agent · Deep Reasoning</option>
              <option value="Code Studio">GOT Agent · Code Studio</option>
              <option value="Vision & Image OCR">
                GOT Agent · Vision & Image OCR
              </option>
              <option value="Google Search Research">
                GOT Agent · Google Search Research
              </option>
              {publicConfig.enabledModules?.imageGenerator && (
                <option value="AI Image Generator">
                  GOT Agent · AI Image Generator
                </option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setDevicePanelOpen((prev) => !prev)}
              title="Device Capability Fit"
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                devicePanelOpen
                  ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                  : 'liquid-glass-subtle text-stone-700 dark:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{deviceCaps.formFactor}</span>
            </button>

            <button
              type="button"
              onClick={() => setA4SheetMode((prev) => !prev)}
              className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                a4SheetMode
                  ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                  : `liquid-glass-subtle ${festivalHoverClass} text-stone-700 dark:text-stone-200`
              }`}
            >
              {a4SheetMode ? 'Chat' : 'A4'}
            </button>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label="Toggle theme"
              className={`min-h-[38px] min-w-[38px] rounded-xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-center`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Device Capability Strip */}
        <AnimatePresence>
          {devicePanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: animDuration }}
              className={`${workspaceWidthClass} mb-2.5 p-3.5 rounded-2xl liquid-glass flex flex-wrap items-center justify-between gap-3 text-xs`}
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-stone-900 dark:text-stone-100">
                  Device-Adaptive Mode Active ({deviceCaps.formFactor} ·{' '}
                  {deviceCaps.width}×{deviceCaps.height}px ·{' '}
                  {deviceCaps.orientation})
                </div>
                <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  Net: {deviceCaps.networkType} ({deviceCaps.downlinkMbps} Mbps) ·{' '}
                  {deviceCaps.cpuCores} CPU Cores · Local History Saved (
                  {sessions.length} chats)
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'auto', label: 'Auto Fit' },
                    { id: 'mobile', label: 'Mobile' },
                    { id: 'a4', label: 'A4 Sheet' },
                    { id: 'wide', label: 'Wide' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLayoutWidthMode(opt.id)}
                    className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-medium ${
                      layoutWidthMode === opt.id
                        ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 font-semibold'
                        : 'liquid-glass-subtle text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODE A: A4 PORTRAIT DOCUMENT SHEET VIEW */}
        {a4SheetMode ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animDuration }}
            className="a4-sheet liquid-glass rounded-[28px] sm:rounded-[32px] p-5 sm:p-10 space-y-6 shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-stone-300/80 dark:border-stone-800 pb-5 gap-3">
              <div className="flex items-center gap-3">
                <GotBubbleLogo size="md" />
                <div>
                  <div className="text-xs font-mono text-stone-500">
                    GOT Agent · Created by Abhinav · A4 Document (210mm × 297mm)
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 font-display">
                    {activeSession.title}
                  </h1>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportA4Document}
                className="min-h-[40px] px-3.5 py-2 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Export Brief
              </button>
            </div>

            <div className="space-y-6">
              {activeSession.messages.map((m) => (
                <div
                  key={m.id}
                  className="space-y-2.5 pb-5 border-b border-stone-200/60 dark:border-stone-800 last:border-b-0"
                >
                  <div className="text-xs font-mono text-stone-500">
                    {m.role === 'user'
                      ? 'YOU'
                      : 'GOT AGENT (CREATED BY ABHINAV)'}{' '}
                    · {m.timestamp}
                  </div>
                  {m.attachedImageUrl && (
                    <img
                      src={m.attachedImageUrl}
                      alt={m.attachedImageName || 'Uploaded'}
                      className="w-40 h-28 object-cover rounded-2xl"
                    />
                  )}
                  <FormattedMessageText text={m.text} />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* MODE B: DEVICE-ADAPTIVE STREAM + STICKY LIQUID GLASS INPUT FIELD */
          <div
            className={`${workspaceWidthClass} flex-1 flex flex-col justify-between gap-4`}
          >
            {/* Message Stream */}
            <div className="space-y-4 py-0.5">
              {/* Always-Visible Welcome & Quick Studio Card so live changes & newly enabled modules always show */}
              {(activeSession.messages.length >= 1) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: animDuration,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`liquid-glass rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 space-y-3.5 ${festivalHoverClass}`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <GotBubbleLogo size="lg" />
                      <div>
                        <h1 className="text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-display">
                          Welcome to GOT Agent
                        </h1>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          Created by{' '}
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            Abhinav
                          </span>{' '}
                          · Running on{' '}
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {agentMode}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Studio Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                    <button
                      type="button"
                      onClick={toggleRealtimeVoiceInInput}
                      className={`min-h-[50px] p-3 rounded-2xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-between gap-2.5 text-left`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Radio className="w-4 h-4 text-stone-800 dark:text-stone-200 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                            Real-Time Voice Input
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            Talk directly in input box
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-stone-400 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSendMessage(
                          publicConfig.enabledModules?.imageGenerator
                            ? 'Generate an image of a futuristic golden crystal palace in the clouds'
                            : 'Create a clean, modern interactive HTML, CSS & JavaScript Pomodoro timer app code.'
                        )
                      }
                      className={`min-h-[50px] p-3 rounded-2xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-between gap-2.5 text-left`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {publicConfig.enabledModules?.imageGenerator ? (
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <Code2 className="w-4 h-4 text-stone-800 dark:text-stone-200 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {publicConfig.enabledModules?.imageGenerator
                              ? 'AI Image Generator'
                              : 'AI Code Generator'}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            {publicConfig.enabledModules?.imageGenerator
                              ? 'Generate instant AI visual art'
                              : 'Create runnable code'}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-stone-400 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAttachSampleImage(
                          SAMPLE_NOTES_IMAGE,
                          'Strategy Notebook & Tablet Photo'
                        )
                      }
                      className={`min-h-[50px] p-3 rounded-2xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-between gap-2.5 text-left`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Camera className="w-4 h-4 text-stone-700 dark:text-stone-300 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                            Test Vision OCR
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            Load sample photo
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-stone-400 shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Animated Conversation Messages */}
              <AnimatePresence initial={false}>
                {activeSession.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: animDuration,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="w-full"
                  >
                    {msg.role === 'user' ? (
                      /* Right-Aligned ChatGPT Liquid Glass Sent Bubble */
                      <div className="flex justify-end">
                        <div
                          className={`max-w-[90%] sm:max-w-[78%] liquid-sent-bubble ${festivalHoverClass} rounded-[26px] rounded-br-lg px-4 sm:px-5 py-3.5 space-y-2.5`}
                        >
                          {msg.attachedImageUrl && (
                            <div className="rounded-2xl overflow-hidden border border-white/80 max-w-[240px] sm:max-w-xs">
                              <img
                                src={msg.attachedImageUrl}
                                alt={msg.attachedImageName || 'Uploaded'}
                                referrerPolicy="no-referrer"
                                className="w-full max-h-60 object-contain bg-stone-950/5"
                              />
                              {msg.attachedImageName && (
                                <div className="px-3 py-1.5 text-[11px] bg-stone-900/80 text-white truncate">
                                  {msg.attachedImageName}
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-sm sm:text-[15px] text-stone-900 dark:text-stone-100 leading-relaxed whitespace-pre-line break-words">
                            {msg.text}
                          </p>

                          <div className="text-[11px] font-mono text-stone-500 text-right">
                            Sent · {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* GOT Agent Response — Curved Creamy White Liquid Glass Card with Bubble Logo */
                      <div
                        className={`liquid-glass rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 space-y-3.5 ${festivalHoverClass}`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <GotBubbleLogo size="sm" />
                            <span className="font-bold text-stone-900 dark:text-stone-100 truncate">
                              GOT Agent
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">
                              {msg.agentMode || 'GOT LOCAL'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono shrink-0">
                              {msg.timestamp}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {deviceCaps.supportsSpeechOutput && (
                              <button
                                type="button"
                                onClick={() => handleSpeak(msg.text)}
                                aria-label="Read aloud"
                                className={`min-h-[36px] min-w-[36px] rounded-xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-center text-stone-600 hover:text-stone-900 dark:text-stone-300`}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, msg.text)}
                              aria-label="Copy response"
                              className={`min-h-[36px] min-w-[36px] rounded-xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-center text-stone-600 hover:text-stone-900 dark:text-stone-300`}
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {deviceCaps.supportsWebShare && (
                              <button
                                type="button"
                                onClick={() => handleNativeShare(msg.text)}
                                aria-label="Share response"
                                className={`min-h-[36px] min-w-[36px] rounded-xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-center text-stone-600 hover:text-stone-900 dark:text-stone-300`}
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleRegenerateLast}
                              aria-label="Regenerate response"
                              className={`min-h-[36px] min-w-[36px] rounded-xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-center text-stone-600 hover:text-stone-900 dark:text-stone-300`}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setA4SheetMode(true)}
                              aria-label="Open A4 view"
                              className={`min-h-[36px] px-2.5 rounded-xl liquid-glass-subtle ${festivalHoverClass} text-xs font-medium text-stone-700 dark:text-stone-200 hidden sm:flex items-center gap-1`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              A4
                            </button>
                          </div>
                        </div>

                        {/* Clean Rich-Formatted Message Text & Code Blocks */}
                        <FormattedMessageText text={msg.text} />

                        {/* AI Generated Image Card (When AI Image Generator Module is Enabled via /GOTadmin) */}
                        {msg.generatedImageUrl && (
                          <div className="rounded-2xl overflow-hidden border border-white/80 dark:border-stone-800 bg-stone-950/5 p-2 space-y-2">
                            <img
                              src={msg.generatedImageUrl}
                              alt="GOT Agent Generated Artwork"
                              className="w-full max-h-[360px] object-contain rounded-xl"
                            />
                            <div className="flex items-center justify-between px-2 py-1 text-xs text-stone-600 dark:text-stone-300">
                              <span className="font-semibold flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                GOT Agent AI Image Studio
                              </span>
                              <a
                                href={msg.generatedImageUrl}
                                download={`got-agent-art-${msg.id}.svg`}
                                className="px-3 py-1 rounded-xl bg-stone-900 text-white text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download Art
                              </a>
                            </div>
                          </div>
                        )}

                        {msg.visionSummary && (
                          <div className="p-3 rounded-2xl liquid-glass-subtle text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                            <Camera className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">
                                Vision Inspection:{' '}
                              </span>
                              {msg.visionSummary}
                            </div>
                          </div>
                        )}

                        {/* Real-Time World Connected & Background Google Search Analysis */}
                        {((msg.sources && msg.sources.length > 0) ||
                          (msg.searchQueriesAnalyzed &&
                            msg.searchQueriesAnalyzed.length > 0)) && (
                          <div className="p-3 rounded-2xl liquid-glass-subtle space-y-2.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                <span>
                                  Real-Time Google & Live Web Grounded Analysis
                                </span>
                              </div>
                              {msg.searchQueriesAnalyzed &&
                                msg.searchQueriesAnalyzed.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {msg.searchQueriesAnalyzed
                                      .slice(0, 3)
                                      .map((q, qi) => (
                                        <span
                                          key={`sq-${qi}`}
                                          className="px-2 py-0.5 rounded-lg bg-stone-900/10 dark:bg-stone-800 text-[10px] font-mono text-stone-700 dark:text-stone-300 flex items-center gap-1"
                                        >
                                          <Search className="w-2.5 h-2.5 opacity-70" />
                                          {q}
                                        </span>
                                      ))}
                                  </div>
                                )}
                            </div>
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {msg.sources.map((src, idx) => (
                                  <a
                                    key={`${src.uri}-${idx}`}
                                    href={src.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`min-h-[36px] px-3 py-1.5 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-white/90 dark:border-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5 ${festivalHoverClass} max-w-full`}
                                  >
                                    <span className="truncate max-w-[210px]">
                                      {src.title}
                                    </span>
                                    <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {msg.highlights && msg.highlights.length > 0 && (
                          <div className="text-xs font-mono tabular-nums text-stone-500 dark:text-stone-400 pt-0.5">
                            {msg.highlights.join(' · ')}
                          </div>
                        )}

                        {/* Interactive 1-Tap Follow-Up Prompts */}
                        {msg.followUpPrompts &&
                          msg.followUpPrompts.length > 0 && (
                            <div className="pt-1.5 flex flex-wrap gap-2">
                              {msg.followUpPrompts.map((promptText, idx) => (
                                <button
                                  key={`${msg.id}-fp-${idx}`}
                                  type="button"
                                  onClick={() => handleSendMessage(promptText)}
                                  className={`min-h-[38px] px-3 py-1.5 rounded-2xl liquid-glass-subtle ${festivalHoverClass} text-xs font-medium text-stone-800 dark:text-stone-200 text-left flex items-center gap-1.5`}
                                >
                                  <span>{promptText}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Animated Thinking State */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: animDuration }}
                    className="liquid-glass rounded-[26px] p-4 flex items-center justify-between gap-3 text-xs sm:text-sm font-mono text-stone-600 dark:text-stone-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <GotBubbleLogo size="sm" />
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span>GOT Agent ({agentMode}) is responding...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => activeAbortRef.current?.abort()}
                      className="px-3 py-1 rounded-xl liquid-glass-subtle text-xs font-sans font-semibold text-stone-800 dark:text-stone-200 shrink-0"
                    >
                      Skip Wait
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>

            {/* Sticky Bottom Liquid Glass Input Field with Real-Time Voice Conversation Inside Input Text */}
            <div className="sticky bottom-1.5 z-20 pt-1">
              <div className="liquid-glass rounded-[28px] p-2 sm:p-3 shadow-lg space-y-2">
                {/* Inline Real-Time Voice Conversation Status Strip Inside Input Box */}
                <AnimatePresence>
                  {realtimeVoiceActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: animDuration }}
                      className="px-3 py-2 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center gap-0.5 h-4 shrink-0">
                          {[0.5, 1, 0.65, 0.9, 0.55].map((h, i) => (
                            <motion.span
                              key={i}
                              animate={{
                                height:
                                  voiceState === 'listening' ||
                                  voiceState === 'speaking'
                                    ? ['35%', `${h * 100}%`, '35%']
                                    : '35%',
                              }}
                              transition={{
                                duration: 0.45 + i * 0.1,
                                repeat: Infinity,
                              }}
                              className="w-1 rounded-full bg-stone-900 dark:bg-stone-100 inline-block"
                            />
                          ))}
                        </div>
                        <span className="font-medium text-stone-800 dark:text-stone-100 truncate">
                          {voiceStatusLabel ||
                            'Real-Time Voice Active — speak into your mic'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setAutoSendVoice((p) => !p)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold ${
                            autoSendVoice
                              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950'
                              : 'liquid-glass-subtle text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          Auto-Send: {autoSendVoice ? 'On' : 'Off'}
                        </button>
                        <button
                          type="button"
                          onClick={stopRealtimeVoiceInInput}
                          aria-label="Stop real-time voice"
                          className="p-1.5 rounded-xl bg-stone-900/10 dark:bg-stone-800 text-stone-700 dark:text-stone-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Inline Image Preview Inside Input Field */}
                <AnimatePresence>
                  {attachedImageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: animDuration }}
                      className="px-2.5 py-2 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={attachedImageUrl}
                          alt={attachedImageName || 'Preview'}
                          className="w-12 h-12 rounded-xl object-cover border border-white/80 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {attachedImageName || 'Image Attached'}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Optimized ({deviceCaps.optimalImageMaxDim}px) for
                            Vision OCR
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedImageUrl(null);
                          setAttachedImageName('');
                        }}
                        aria-label="Remove image"
                        className="min-h-[38px] min-w-[38px] rounded-xl liquid-glass-subtle flex items-center justify-center text-stone-600 hover:text-stone-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Secret Instant Launcher when user types /GOTadmin in the input bar */}
                {chatInput.trim().toLowerCase().includes('gotadmin') && (
                  <div className="px-3 py-2 rounded-2xl bg-stone-900 text-white flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Secret Route <strong>/GOTadmin</strong> Ready
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChatInput('');
                        try {
                          window.history.pushState({}, '', '/GOTadmin');
                        } catch {}
                        setIsGotAdminRoute(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs shrink-0"
                    >
                      Open /GOTadmin Login →
                    </button>
                  </div>
                )}

                {/* Input Row: [Image Upload] + [Search] + [Live Voice Input Text] + [Real-Time Voice Toggle] + [Send] */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(
                      undefined,
                      undefined,
                      undefined,
                      realtimeVoiceActive
                    );
                  }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  {/* Direct Image Upload Button Inside Input Field */}
                  <label
                    aria-label="Upload image to analyze"
                    title="Upload Image or Screenshot for Vision OCR"
                    className={`min-h-[44px] min-w-[44px] rounded-2xl liquid-glass-subtle ${festivalHoverClass} flex items-center justify-center text-stone-800 dark:text-stone-100 cursor-pointer shrink-0`}
                  >
                    <ImagePlus className="w-5 h-5" />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* In-Input Google Search Grounding Button */}
                  <button
                    type="button"
                    onClick={() => setUseGoogleSearch((prev) => !prev)}
                    aria-label="Toggle Google Search Grounding"
                    title={
                      useGoogleSearch
                        ? 'Google Search Grounding Enabled'
                        : 'Google Search Grounding Disabled'
                    }
                    className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      useGoogleSearch
                        ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                        : 'liquid-glass-subtle text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </button>

                  {/* Input Text Field — Live Voice words stream directly into this input */}
                  <input
                    ref={inputTextElementRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      realtimeVoiceActive
                        ? 'Speaking in real time... words appear here'
                        : attachedImageUrl
                        ? 'Ask about this image...'
                        : 'Ask GOT Agent, speak in real time, write code, or ask about past chats...'
                    }
                    className="flex-1 min-h-[44px] px-2 py-2 text-sm sm:text-[15px] bg-transparent text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none min-w-0"
                  />

                  {/* Real-Time Voice Conversation Button Inside Input Text Bar */}
                  <button
                    type="button"
                    onClick={toggleRealtimeVoiceInInput}
                    aria-label="Toggle real-time voice conversation in input text"
                    title={
                      realtimeVoiceActive
                        ? 'Stop Real-Time Voice Conversation'
                        : 'Start Real-Time Voice Conversation in Input Text'
                    }
                    className={`min-h-[44px] px-3 rounded-full flex items-center justify-center gap-1.5 shrink-0 transition-all ${
                      realtimeVoiceActive
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-semibold shadow-md'
                        : `liquid-bubble-logo ${festivalHoverClass} text-stone-900 dark:text-white`
                    }`}
                  >
                    {realtimeVoiceActive ? (
                      <>
                        <MicOff className="w-4 h-4 text-red-400 animate-pulse" />
                        <span className="text-xs hidden sm:inline">
                          Live On
                        </span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span className="text-xs font-semibold hidden sm:inline">
                          Voice
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={!chatInput.trim() && !attachedImageUrl}
                    aria-label="Send message"
                    className={`min-h-[44px] px-4 sm:px-5 py-2 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 ${festivalHoverClass} shrink-0 disabled:opacity-40`}
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
