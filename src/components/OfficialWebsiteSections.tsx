import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Globe,
  Code2,
  Camera,
  Mic,
  ShieldAlert,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  Zap,
  FileText,
  Users,
  ExternalLink,
} from 'lucide-react';

export type PublicWebsiteTab =
  | 'home'
  | 'chat'
  | 'features'
  | 'privacy'
  | 'terms';

interface OfficialWebsiteSectionsProps {
  activeTab: PublicWebsiteTab;
  onSelectTab: (tab: PublicWebsiteTab) => void;
  onGetStarted: (initialPrompt?: string) => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    tokenBalance?: number;
    totalTokensUsed?: number;
    unlimitedTokens?: boolean;
    role?: 'user' | 'co-admin';
  } | null;
  firebaseConnected: boolean;
  defaultUserTokens: number;
}

export const OfficialWebsiteSections: React.FC<OfficialWebsiteSectionsProps> = ({
  activeTab,
  onSelectTab,
  onGetStarted,
  currentUser,
  firebaseConnected,
  defaultUserTokens,
}) => {
  if (activeTab === 'home') {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-10">
        {/* Hero Section with Get Started CTA */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-[36px] p-6 sm:p-12 border border-white/90 dark:border-stone-800 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official GOT Agent Platform · Created by Abhinav</span>
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {firebaseConnected
                  ? 'Firebase Cloud Database Connected'
                  : 'Real-Time Cloud Sync Active'}
              </span>
            </span>
            <span className="px-3 py-1 rounded-xl liquid-glass-subtle text-stone-700 dark:text-stone-300 font-mono">
              Google Verified SEO · GOT LOCAL + Gemini
            </span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-50 leading-[1.12]">
              Real-Time World-Connected AI for Search, Vision, Voice &amp; Code.
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              Welcome to the official <strong>GOT Agent</strong> website, engineered and founded by{' '}
              <strong>Abhinav</strong>. Experience real-time background Google &amp; live web search grounding,
              instant Vision OCR image reading, real-time voice conversation inside your input bar, full-stack
              Code Studio, and Firebase-synced conversation history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onGetStarted()}
              className="min-h-[52px] px-7 py-3 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-sm sm:text-base font-bold liquid-glass-hover flex items-center gap-2.5 shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {currentUser
                  ? `Launch AI Workspace (${currentUser.name})`
                  : 'Get Started — Open GOT Agent'}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('features')}
              className="min-h-[52px] px-5 py-3 rounded-2xl liquid-glass-subtle text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold liquid-glass-hover"
            >
              Explore Capabilities
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('privacy')}
              className="min-h-[52px] px-5 py-3 rounded-2xl liquid-glass-subtle text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold liquid-glass-hover"
            >
              Privacy &amp; Security Policy
            </button>
          </div>

          {/* Live User Token & Verification Status Strip */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between">
              <div>
                <div className="text-stone-500 font-medium">
                  Starting User Quota
                </div>
                <div className="text-sm font-bold font-mono text-stone-900 dark:text-white mt-0.5">
                  ⚡ {(defaultUserTokens || 5000).toLocaleString()} Free AI Tokens
                </div>
              </div>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between">
              <div>
                <div className="text-stone-500 font-medium">
                  Account &amp; Email Security
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                  6-Digit Email OTP + IP Auto-Portal
                </div>
              </div>
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between">
              <div>
                <div className="text-stone-500 font-medium">
                  Cloud Database Sync
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                  Firebase Firestore + Local Memory
                </div>
              </div>
              <Globe className="w-5 h-5 text-stone-800 dark:text-stone-200" />
            </div>
          </div>
        </motion.section>

        {/* Core Capabilities Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
                Built-In Real-Time Capabilities
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Click any capability below to launch directly into the GOT Agent workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGetStarted()}
              className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1 underline"
            >
              <span>Open Full AI Chat</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Globe,
                title: 'Real-Time Google & Web Grounding',
                desc: 'Automatically searches and analyzes live Wikipedia, DuckDuckGo, HackerNews, and Google Search sources in the background with verified links.',
                prompt:
                  'Search live world and technology news today and summarize the top developments with sources.',
              },
              {
                icon: Code2,
                title: 'Full-Stack Code Studio & Large Answers',
                desc: 'Engineered to answer massive multi-part questions and write complete, runnable HTML, CSS, TypeScript, React, and Python applications.',
                prompt:
                  'Write a complete, responsive interactive Personal Finance Dashboard in HTML, CSS, and JavaScript.',
              },
              {
                icon: Camera,
                title: 'Vision OCR & Screenshot Inspector',
                desc: 'Upload any photo, receipt, notebook page, or screenshot to extract every visible line of text, number, and status.',
                prompt:
                  'Explain how GOT Agent Vision OCR reads text and numbers from uploaded screenshots and photos.',
              },
              {
                icon: Mic,
                title: 'Real-Time Voice in Input Bar',
                desc: 'Speak naturally into your microphone — your spoken words stream directly into the input box and GOT Agent speaks back.',
                prompt:
                  'Hello GOT Agent! Introduce yourself and tell me who created you.',
              },
              {
                icon: FileText,
                title: 'A4 Executive Brief Export',
                desc: 'Switch any conversation into a formatted 210mm × 297mm A4 portrait document and export clean Markdown briefs in one click.',
                prompt:
                  'Draft a comprehensive executive technical architecture report on modern AI agents.',
              },
              {
                icon: ShieldAlert,
                title: 'Firebase Cloud + 5-Strike IP Guard',
                desc: 'Syncs user profiles, OTP verification, and chat history to Firebase while automatically blocking abusive IPs after 5 violent chat strikes.',
                prompt:
                  'How does GOT Agent protect user accounts with Email OTP verification, Firebase sync, and IP security?',
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onGetStarted(item.prompt)}
                  className="liquid-glass rounded-[28px] p-5 space-y-3 cursor-pointer liquid-glass-hover flex flex-col justify-between border border-white/80 dark:border-stone-800"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold font-display text-stone-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-stone-200">
                    <span>Try in GOT Agent</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Official Website Footer */}
        <footer className="liquid-glass rounded-[28px] p-6 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600 dark:text-stone-400">
          <div className="space-y-1">
            <div className="font-bold text-stone-900 dark:text-white">
              GOT Agent · Official AI Website (Created by Abhinav)
            </div>
            <div>
              Powered by GOT LOCAL, Gemini 3 Flash, Firebase Firestore &amp; Google Search Grounding.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <button
              type="button"
              onClick={() => onGetStarted()}
              className="hover:text-stone-900 dark:hover:text-white"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('features')}
              className="hover:text-stone-900 dark:hover:text-white"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('privacy')}
              className="hover:text-stone-900 dark:hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('terms')}
              className="hover:text-stone-900 dark:hover:text-white"
            >
              Terms &amp; Safety Policy
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 dark:hover:text-white flex items-center gap-1"
            >
              <span>Sitemap</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </div>
    );
  }

  if (activeTab === 'features') {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="liquid-glass rounded-[32px] p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white">
                GOT Agent Architecture &amp; Features
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Engineered by Abhinav with Firebase Cloud Sync, Email OTP Verification, and Live Web Grounding.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGetStarted()}
              className="min-h-[44px] px-5 py-2 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Get Started Now</span>
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5">
              <h2 className="font-bold text-base text-stone-900 dark:text-white">
                1. Multi-Engine Intelligence (GOT LOCAL &amp; Gemini 3 Flash)
              </h2>
              <p>
                GOT Agent combines <strong>GOT LOCAL</strong> (OpenRouter multi-model fallback) with{' '}
                <strong>Gemini 3 Flash</strong> (`ThinkingLevel.MEDIUM`, 45-second deep-reasoning budget) so even
                the largest coding, mathematical, or analytical questions are answered completely without truncation.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5">
              <h2 className="font-bold text-base text-stone-900 dark:text-white">
                2. Real-Time Background Google &amp; Live Web Search
              </h2>
              <p>
                Every search query runs live background HTTP lookups across Wikipedia, DuckDuckGo Instant Answers,
                HackerNews Algolia, and Google Search Grounding—never simulated—displaying verified clickable citations.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5">
              <h2 className="font-bold text-base text-stone-900 dark:text-white">
                3. Firebase Firestore Database &amp; Email OTP Verification
              </h2>
              <p>
                User accounts, 6-digit Email OTP verification status, live token balances, and conversation histories
                are synchronized across your local browser, the GOT Agent backend, and{' '}
                <strong>Firebase Firestore</strong> (`users`, `users/private`, `users/chats`, and `site_config`).
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5">
              <h2 className="font-bold text-base text-stone-900 dark:text-white">
                4. Live AI Token Accounting &amp; Admin Quota Grants
              </h2>
              <p>
                Every user starts with <strong>{(defaultUserTokens || 5000).toLocaleString()} AI tokens</strong>.
                Tokens count down accurately on every message based on prompt and response length. When tokens reach{' '}
                <code>0</code>, chat pauses until Admin Abhinav grants additional tokens or enables Unlimited Tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'privacy') {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="liquid-glass rounded-[32px] p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white">
                Privacy Policy — GOT Agent
              </h1>
              <p className="text-xs text-stone-500">
                Effective Date: November 2026 · Creator &amp; Data Controller: Abhinav
              </p>
            </div>
            <button
              type="button"
              onClick={() => onGetStarted()}
              className="min-h-[42px] px-4 py-2 rounded-2xl bg-stone-900 text-white text-xs font-bold"
            >
              Back to AI Portal
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                1. Information We Collect
              </h2>
              <p>
                When you register or use GOT Agent, we collect your <strong>Name</strong>,{' '}
                <strong>Email Address</strong> (verified via 6-digit Email OTP or Google Sign-In),{' '}
                <strong>IP Address</strong> (used for automatic portal login and anti-abuse security),{' '}
                <strong>AI Token Usage</strong> (`tokenBalance` and `totalTokensUsed`), and your{' '}
                <strong>Saved Conversation History</strong> so GOT Agent remembers your context across sessions.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                2. Firebase Firestore &amp; Isolated PII Security
              </h2>
              <p>
                GOT Agent stores account profiles and chat histories in <strong>Google Firebase Firestore</strong> with
                Zero-Trust Firestore Security Rules. Personally Identifiable Information (such as your email address and
                IP address) is isolated inside protected subcollections (`/users/&#123;userId&#125;/private/info`) accessible
                strictly to you and verified system administrators.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                3. How We Use Your Data
              </h2>
              <p>
                Your data is used exclusively to: (a) provide personalized AI responses and cross-conversation memory,
                (b) verify your identity via Email OTP and automatic IP portal recognition, (c) manage your AI token
                balance, and (d) protect the platform against abuse, prompt injection, and violent content.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                4. Data Deletion &amp; User Control
              </h2>
              <p>
                You can delete individual chat sessions at any time from your History drawer or request complete account
                removal from Creator Abhinav.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6">
      <div className="liquid-glass rounded-[32px] p-6 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white">
              Terms of Service &amp; Safety Policy
            </h1>
            <p className="text-xs text-stone-500">
              Official GOT Agent Governance · Created by Abhinav
            </p>
          </div>
          <button
            type="button"
            onClick={() => onGetStarted()}
            className="min-h-[42px] px-4 py-2 rounded-2xl bg-stone-900 text-white text-xs font-bold"
          >
            Get Started
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              1. Email OTP Verification &amp; Account Integrity
            </h2>
            <p>
              Users must register with a valid Name, Email, and Password and verify their email using the 6-digit OTP
              code sent during registration (or via Google Sign-In). Your IP address is bound to your profile for
              seamless auto-login.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              2. AI Token Quota &amp; Depletion Rules
            </h2>
            <p>
              Each standard user account receives an initial allocation of{' '}
              <strong>{(defaultUserTokens || 5000).toLocaleString()} AI tokens</strong>. Every message sent to GOT Agent
              deducts tokens proportional to the prompt and response size. When your token balance reaches{' '}
              <strong>0 tokens</strong>, AI generation stops automatically until Admin Abhinav or an Official Co-Admin
              grants additional tokens to your account.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              3. Zero-Tolerance 5-Strike Anti-Violence Policy
            </h2>
            <p>
              GOT Agent strictly prohibits violent, harmful, illegal, or abusive prompts. Sending violent messages
              increments your account's violation counter. Exceeding <strong>5 violent chat messages</strong> triggers an
              immediate, automatic, permanent block of both your user account and your IP address.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
