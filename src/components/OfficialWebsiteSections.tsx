import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Globe,
  Code2,
  Camera,
  Mic,
  ShieldAlert,
  ArrowUpRight,
  Zap,
  FileText,
  ExternalLink,
  Mail,
  Copy,
  Check,
  Send,
  UserCheck,
  Award,
  Cpu,
  MessageSquare,
  Play,
  Download,
  Eye,
  X,
  Layers,
} from 'lucide-react';
import {
  MASONRY_GALLERY_ITEMS,
  MasonryGalleryItem,
} from '../utils/htmlVideoGenerator';

export type PublicWebsiteTab =
  | 'home'
  | 'chat'
  | 'founder'
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
    email?: string;
    tokenBalance?: number;
    totalTokensUsed?: number;
    unlimitedTokens?: boolean;
    role?: 'user' | 'co-admin';
  } | null;
  defaultUserTokens: number;
}

export const OfficialWebsiteSections: React.FC<OfficialWebsiteSectionsProps> = ({
  activeTab,
  onSelectTab,
  onGetStarted,
  currentUser,
  defaultUserTokens,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);
  const [contactSenderName, setContactSenderName] = useState(
    currentUser?.name || ''
  );
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSentBanner, setContactSentBanner] = useState('');

  // Masonry Gallery Filter & Lightbox State for the Features Section
  const [galleryFilter, setGalleryFilter] = useState<
    'all' | 'artwork' | 'html-video' | 'vision-arch'
  >('all');
  const [selectedGalleryItem, setSelectedGalleryItem] =
    useState<MasonryGalleryItem | null>(null);

  const founderEmail = 'abhinavmail908@gmail.com';
  const founderInstaHandle = 'abhinav_official_l';
  const founderInstaUrl = 'https://www.instagram.com/abhinav_official_l/';

  const handleCopyEmail = () => {
    try {
      navigator.clipboard.writeText(founderEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {}
  };

  const handleCopyInsta = () => {
    try {
      navigator.clipboard.writeText(`@${founderInstaHandle}`);
      setCopiedInsta(true);
      setTimeout(() => setCopiedInsta(false), 2500);
    } catch {}
  };

  const handleFastContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sender = (
      contactSenderName ||
      currentUser?.name ||
      'GOT Agent Visitor'
    ).trim();
    const subj = (
      contactSubject || `Fast Contact from ${sender} via GOT Agent`
    ).trim();
    const body = `${contactMessage.trim()}\n\n---\nSent by: ${sender}\nVia: GOT Agent Official Website`;
    const mailtoLink = `mailto:${founderEmail}?subject=${encodeURIComponent(
      subj
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setContactSentBanner(
      `Opening your email client to send directly to Founder Abhinav (${founderEmail})!`
    );
    setTimeout(() => setContactSentBanner(''), 6000);
  };

  const filteredGalleryItems = MASONRY_GALLERY_ITEMS.filter((item) =>
    galleryFilter === 'all' ? true : item.category === galleryFilter
  );

  if (activeTab === 'home') {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-10">
        {/* Hero Section with Instant Name Entry & Free Credits CTA */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-[36px] p-6 sm:p-12 border border-white/90 dark:border-stone-800 shadow-2xl space-y-6 relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-300 font-medium">
            <span className="font-bold text-stone-900 dark:text-white">
              Official GOT Agent Platform
            </span>
            <span aria-hidden="true">·</span>
            <span>Founded &amp; Engineered by Abhinav</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              No Login Needed · Part-Wise Claude Execution &amp; HTML5 Video Studio
            </span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-stone-900 dark:text-stone-50 leading-[1.12]">
              Real-Time World-Connected AI for Search, Vision, HTML Videos &amp; Code.
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
              Welcome to the official <strong>GOT Agent</strong> platform, created and founded by{' '}
              <strong>Abhinav</strong>. Experience real-time background Google &amp; live web search grounding,
              permanent Vision OCR image chat memory, interactive <strong>HTML5 Canvas Video generation</strong>,
              full-stack <strong>Project Studio</strong>, and <strong>Claude-style Part-Wise execution</strong> for massive prompts — with{' '}
              <strong>instant access by just entering your name</strong>.
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
                  ? `Open AI Chat (${currentUser.name})`
                  : 'Get Started — Enter Name & Launch AI'}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('features')}
              className="min-h-[52px] px-5 py-3 rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-bold liquid-glass-hover flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>AI Art &amp; HTML Video Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('founder')}
              className="min-h-[52px] px-5 py-3 rounded-2xl liquid-glass-subtle text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold liquid-glass-hover flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Meet Founder Abhinav</span>
            </button>
          </div>

          {/* Instant Access & Gotra AI Router Highlights */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between border border-emerald-500/30">
              <div>
                <div className="text-stone-500 font-medium">
                  Gotra AI Router Engine
                </div>
                <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                  ⚡ GotraRouter v1 · Connected
                </div>
              </div>
              <Cpu className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between">
              <div>
                <div className="text-stone-500 font-medium">
                  Instant Name Access
                </div>
                <div className="text-sm font-bold font-mono text-stone-900 dark:text-white mt-0.5">
                  ⚡ Zero-Password Instant Portal
                </div>
              </div>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between">
              <div>
                <div className="text-stone-500 font-medium">
                  HTML5 Video &amp; Part-Wise AI
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                  9:16 Canvas Videos + Massive Prompts
                </div>
              </div>
              <Play className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3.5 rounded-2xl liquid-glass-subtle flex items-center justify-between">
              <div>
                <div className="text-stone-500 font-medium">
                  Founder &amp; Creator
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">
                  Abhinav · @{founderInstaHandle}
                </div>
              </div>
              <Globe className="w-5 h-5 text-stone-800 dark:text-stone-200" />
            </div>
          </div>
        </motion.section>

        {/* Spotlight Section: About Founder Abhinav & Fast Direct Contact */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-[34px] p-6 sm:p-10 border border-white/90 dark:border-stone-800 shadow-xl space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div
                aria-label="Blank Founder Profile Frame"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2 border-stone-300/80 dark:border-stone-700 shadow-inner shrink-0 bg-stone-100/90 dark:bg-stone-800/90"
              />
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                  Founder · Creator · Lead AI Systems Architect
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white">
                  Abhinav
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
                  Abhinav founded and engineered <strong>GOT Agent</strong> to bring ultra-fast, real-time
                  world-connected intelligence, live Google Search analysis, persistent Vision OCR image chats,
                  interactive HTML5 Canvas Video generation, and Claude-style part-wise deep execution to everyone.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('founder')}
              className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 liquid-glass-hover"
            >
              <span>Full Founder Profile &amp; Fast Contact</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Fast Contact Cards (Email + Instagram + Ask AI) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl liquid-glass-subtle border border-white/80 dark:border-stone-800 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-600" />
                    Direct Email to Abhinav
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                    Fast Response
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-stone-900 dark:text-white break-all">
                  {founderEmail}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Reach out directly to Founder Abhinav for collaborations, feedback, custom AI solutions, or credit top-ups.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`mailto:${founderEmail}?subject=${encodeURIComponent(
                    'Hello Abhinav — Inquiry from GOT Agent Website'
                  )}`}
                  className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Email Abhinav</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl liquid-glass text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1"
                  title="Copy Email Address"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle border border-white/80 dark:border-stone-800 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    Official Instagram
                  </span>
                  <span className="text-[10px] font-mono text-pink-600 dark:text-pink-400">
                    Verified Social
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-stone-900 dark:text-white">
                  @{founderInstaHandle}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Follow Founder Abhinav on Instagram for official GOT Agent updates, AI drops, behind-the-scenes builds, and direct DMs.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={founderInstaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Follow @{founderInstaHandle}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyInsta}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl liquid-glass text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1"
                  title="Copy Instagram Handle"
                >
                  {copiedInsta ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle border border-white/80 dark:border-stone-800 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-emerald-600" />
                    HTML5 Video Generator
                  </span>
                  <span className="text-[10px] font-mono">100% Working</span>
                </div>
                <div className="text-sm font-bold text-stone-900 dark:text-white">
                  Create 9:16 Canvas Videos
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Ask GOT Agent to create an interactive HTML5 Canvas video on any topic or from your past prompt!
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onGetStarted(
                    'Create an interactive 9:16 HTML5 Canvas animated video like Nuclear Survival in 92 Seconds with chapters, voiceover, and timeline controls.'
                  )
                }
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Generate HTML Video Now</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
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
              onClick={() => onSelectTab('features')}
              className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1 underline"
            >
              <span>View Masonry Artwork &amp; Video Gallery</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Play,
                title: 'Custom 2D HTML5 Canvas Video Studio',
                desc: 'Analyzes any topic or past prompt and generates a 100% playable 9:16 2D HTML5 Canvas video with custom 2D vector scenes, chapters, voiceover, and data graphs.',
                prompt:
                  'Create a 2D HTML5 Canvas animated video about How Solar Panels & Clean Energy Work with 6 chapters and live 2D diagrams.',
              },
              {
                icon: Layers,
                title: 'Interactive 2D Graph & Graphic Studio',
                desc: 'Creates live interactive Bar Graphs, Smooth Line & Area Curves, Donut/Pie Charts, and 2D Vector Diagrams with 1-click PNG export.',
                prompt:
                  'Create an interactive 2D graph and chart comparing AI Model Performance: Baseline 64, v1.5 76, v2.0 85, GOT Local 96, GOT Ultra 99.',
              },
              {
                icon: Code2,
                title: 'Large Project Builder (+ Add Project)',
                desc: 'Build and save multi-file software projects (HTML, TypeScript, CSS, README) directly in your AI Project Workspace with live preview.',
                prompt:
                  'Add project: Real-Time E-Commerce Analytics & Inventory Dashboard with 2D telemetry.',
              },
              {
                icon: Camera,
                title: 'Permanent Vision OCR & Image Memory',
                desc: 'Upload any photo or screenshot — GOT Agent extracts all text via OCR and permanently saves your uploaded image inside your chat history.',
                prompt:
                  'Explain how GOT Agent Vision OCR reads text from uploaded screenshots and permanently saves images in chat history.',
              },
              {
                icon: Globe,
                title: 'Real-Time Google & Web Grounding',
                desc: 'Automatically searches and analyzes live Wikipedia, DuckDuckGo, HackerNews, and Google Search sources in the background with verified links.',
                prompt:
                  'Search live world and technology news today and summarize the top developments with sources.',
              },
              {
                icon: Mic,
                title: 'Real-Time Voice & A4 Brief Export',
                desc: 'Speak naturally into your microphone in the input box and export any conversation as a formatted 210mm × 297mm A4 document.',
                prompt:
                  'Draft a comprehensive executive technical architecture report on modern AI agents.',
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

        {/* Comprehensive About GOT Agent Website & SEO Knowledge Hub */}
        <section className="liquid-glass rounded-[34px] p-6 sm:p-10 space-y-6 border border-white/90 dark:border-stone-800 shadow-xl">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
              About GOT Agent Official Website · Complete AI Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white">
              Everything Built Into the GOT Agent Platform
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-3xl">
              <strong>GOT Agent</strong> (founded and engineered by <strong>Abhinav</strong>) is a full-spectrum,
              real-time world-connected AI web platform designed for creators, students, developers, researchers, and
              teams. Unlike single-purpose chatbots, GOT Agent unifies live web search, 2D HTML5 Canvas video creation,
              interactive data graphing, multi-file software project management, and Vision OCR inside a refractive
              Liquid Glass workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5 border border-white/70 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-white">
                1. AI-Analyzed 2D HTML5 Canvas Video Engine
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Describe any concept—or ask GOT Agent to turn your previous chat prompt into a 2D HTML video—and the AI
                analyzes the subject to build a custom <code>1080×1920</code> 60fps 2D <code>&lt;canvas&gt;</code>{' '}
                video with orbital diagrams, animated signal pipelines, wave chambers, 2D bar/line graphs, karaoke
                subtitles, and Web Speech API voiceover.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5 border border-white/70 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-white">
                2. Interactive 2D Graph, Chart &amp; Vector Graphic Studio
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Ask GOT Agent to plot any dataset or create a 2D graphic and receive an interactive HTML5 canvas chart
                supporting live switching between <strong>Bar Graphs</strong>, <strong>Line &amp; Area Curves</strong>,{' '}
                <strong>Donut / Pie Charts</strong>, and <strong>Animated 2D Vector Diagrams</strong> with instant PNG
                download.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5 border border-white/70 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-white">
                3. Large Project Studio &amp; &ldquo;+ Add Project&rdquo; Workspace
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Building a large application? Click <strong>+ Add Project</strong> in the AI workspace or ask GOT Agent
                to create a project. GOT Agent generates multi-file codebases (<code>index.html</code>,{' '}
                <code>src/app.ts</code>, <code>README.md</code>), saves them to your persistent Project Workspace, and
                renders a live interactive preview.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5 border border-white/70 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-white">
                4. Claude-Style Part-Wise Execution &amp; Cross-Browser IP Auto-Access
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                GOT Agent processes massive prompts (24,000+ characters) without crashing by structuring answers into{' '}
                <strong>Part 1 (Blueprint)</strong>, <strong>Part 2 (Analysis)</strong>,{' '}
                <strong>Part 3 (Deliverable Code)</strong>, and <strong>Part 4 (Verification)</strong>. Enter your name
                once to receive free AI credits and automatic IP-based portal recognition.
              </p>
            </div>
          </div>
        </section>

        {/* Official Website Footer */}
        <footer className="liquid-glass rounded-[28px] p-6 space-y-4 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-stone-900 dark:text-white text-sm">
                GOT Agent · Official AI Website (Founded &amp; Created by Abhinav)
              </div>
              <div>
                Direct Contact:{' '}
                <a
                  href={`mailto:${founderEmail}`}
                  className="font-mono font-semibold text-stone-900 dark:text-stone-200 underline"
                >
                  {founderEmail}
                </a>{' '}
                · Instagram:{' '}
                <a
                  href={founderInstaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-pink-600 dark:text-pink-400 underline"
                >
                  @{founderInstaHandle}
                </a>
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
                onClick={() => onSelectTab('founder')}
                className="hover:text-stone-900 dark:hover:text-white"
              >
                Founder &amp; Contact
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('features')}
                className="hover:text-stone-900 dark:hover:text-white"
              >
                Features &amp; Gallery
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
          </div>
        </footer>
      </div>
    );
  }

  if (activeTab === 'founder') {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-[36px] p-6 sm:p-10 space-y-8 border border-white/90 dark:border-stone-800 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-stone-200/80 dark:border-stone-800 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div
                aria-label="Blank Founder Profile Frame"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] border-2 border-stone-300/80 dark:border-stone-700 shadow-inner shrink-0 bg-stone-100/90 dark:bg-stone-800/90"
              />
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                  Founder · Creator · Chief Architect of GOT Agent
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-display text-stone-900 dark:text-white">
                  Abhinav
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
                  <strong>Abhinav</strong> is the visionary founder, creator, and lead developer behind{' '}
                  <strong>GOT Agent</strong>. Driven by a passion for real-time artificial intelligence,
                  full-stack systems engineering, interactive HTML5 Canvas Video synthesis, and human-centered
                  Liquid Glass design, Abhinav built GOT Agent so anyone can access world-connected AI, live
                  Google Search synthesis, Vision OCR, and production code generation instantly — simply by
                  entering their name.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onGetStarted()}
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Launch GOT Agent</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-3xl liquid-glass-subtle border border-white/80 dark:border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">
                      Official Direct Email
                    </div>
                    <div className="text-base font-bold font-mono text-stone-900 dark:text-white break-all">
                      {founderEmail}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Have a question, project idea, partnership inquiry, or need extra AI credits? Email Founder
                Abhinav directly at <strong>{founderEmail}</strong> for a fast personal response.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`mailto:${founderEmail}?subject=${encodeURIComponent(
                    'Direct Message for Founder Abhinav — GOT Agent'
                  )}`}
                  className="min-h-[42px] px-4 py-2 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-bold flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email to {founderEmail}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="min-h-[42px] px-4 py-2 rounded-2xl liquid-glass text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Email Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl liquid-glass-subtle border border-white/80 dark:border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-600 via-rose-600 to-amber-500 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 font-medium">
                      Official Instagram Profile
                    </div>
                    <div className="text-base font-bold font-mono text-stone-900 dark:text-white">
                      @{founderInstaHandle}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Connect with Abhinav on Instagram (<strong>@{founderInstaHandle}</strong>) to follow new GOT Agent
                feature releases, AI engineering reels, announcements, and send direct messages.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={founderInstaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[42px] px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <span>Open Instagram @{founderInstaHandle}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyInsta}
                  className="min-h-[42px] px-4 py-2 rounded-2xl liquid-glass text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5"
                >
                  {copiedInsta ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Handle Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy @{founderInstaHandle}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>Part-Wise Claude Execution</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Abhinav architected GOT Agent with a part-wise execution engine combining <strong>GOT LOCAL</strong> and{' '}
                <strong>Gemini 3 Flash</strong> so massive prompts and full HTML5 video scripts never crash or truncate.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Live World &amp; Search Grounding</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Built to go beyond static training cutoffs, Abhinav integrated real-time background Google Search,
                Wikipedia, DuckDuckGo, and HackerNews synthesis into every answer.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                <Zap className="w-4 h-4 text-pink-600" />
                <span>Instant Name &amp; Credit Philosophy</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Abhinav believes powerful AI should be accessible immediately — enter only your name to receive{' '}
                <strong>{(defaultUserTokens || 5000).toLocaleString()} free AI credits</strong> with automatic IP
                memory.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl liquid-glass-subtle border border-white/80 dark:border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold font-display text-stone-900 dark:text-white">
                  Send a Fast Message to Founder Abhinav
                </h2>
                <p className="text-xs text-stone-500">
                  Dispatches directly to <strong>{founderEmail}</strong> · Official Instagram:{' '}
                  <strong>@{founderInstaHandle}</strong>
                </p>
              </div>
            </div>

            {contactSentBanner && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                {contactSentBanner}
              </div>
            )}

            <form onSubmit={handleFastContactSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSenderName}
                    onChange={(e) => setContactSenderName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-stone-900/80 text-xs sm:text-sm text-stone-900 dark:text-white border border-stone-300/80 dark:border-stone-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="Collaboration, Feedback, or Credit Request"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-stone-900/80 text-xs sm:text-sm text-stone-900 dark:text-white border border-stone-300/80 dark:border-stone-700 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Your Message to Abhinav
                </label>
                <textarea
                  rows={3}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Write your message for Founder Abhinav..."
                  className="w-full p-3.5 rounded-2xl bg-white/85 dark:bg-stone-900/80 text-xs sm:text-sm text-stone-900 dark:text-white border border-stone-300/80 dark:border-stone-700 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-2 liquid-glass-hover"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Send Fast Message to {founderEmail}</span>
                </button>
                <a
                  href={founderInstaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl liquid-glass text-xs sm:text-sm font-bold text-pink-700 dark:text-pink-400 flex items-center gap-2"
                >
                  <span>DM on Instagram @{founderInstaHandle}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (activeTab === 'features') {
    return (
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Masonry-Style AI Artwork & Interactive HTML5 Video Gallery Component */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass rounded-[34px] p-5 sm:p-8 space-y-6 border border-white/90 dark:border-stone-800 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-amber-700 dark:text-amber-400 font-semibold">
                GOT Agent Creative Showcase · Founded by Abhinav
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white">
                AI Artwork &amp; Interactive HTML5 Video Masonry Gallery
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
                Explore example AI-generated artworks, system architectures, and playable 9:16 HTML5 Canvas videos.
                Tap any card to preview in full screen or generate your own version inside GOT Agent.
              </p>
            </div>

            {/* Interactive Filter Controls (Segmented Bar) */}
            <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass-subtle self-start md:self-auto overflow-x-auto max-w-full">
              {(
                [
                  { id: 'all', label: 'All Creations' },
                  { id: 'artwork', label: 'AI Artworks' },
                  { id: 'html-video', label: 'HTML5 Videos' },
                  { id: 'vision-arch', label: 'Blueprints' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryFilter(tab.id)}
                  className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    galleryFilter === tab.id
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 shadow-sm'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile-First CSS Masonry Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredGalleryItems.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="break-inside-avoid liquid-glass-subtle rounded-[26px] p-3 border border-white/85 dark:border-stone-800 shadow-md flex flex-col justify-between space-y-3 liquid-glass-hover"
              >
                <div
                  onClick={() => setSelectedGalleryItem(item)}
                  className={`relative w-full ${item.aspectClass} rounded-[20px] overflow-hidden bg-stone-900 cursor-pointer group`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-90 flex flex-col justify-end p-3.5">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-stone-200">
                      <span>{item.modelTag}</span>
                      <span>·</span>
                      <span>{item.resolution}</span>
                    </div>
                  </div>
                  {item.htmlVideoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xl border-2 border-stone-950 transition-transform group-hover:scale-110">
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-1 space-y-1.5">
                  <h2 className="text-sm sm:text-base font-bold font-display text-stone-900 dark:text-white leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    Prompt: &ldquo;{item.prompt}&rdquo;
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onGetStarted(item.prompt)}
                    className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {item.htmlVideoUrl ? 'Create HTML Video' : 'Generate Similar'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGalleryItem(item)}
                    className="min-h-[40px] px-3 py-2 rounded-xl liquid-glass text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1"
                    title="Preview Artwork or Play HTML Video"
                  >
                    {item.htmlVideoUrl ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-amber-600" />
                        <span>Play</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </>
                    )}
                  </button>

                  <a
                    href={item.htmlVideoUrl || item.imageUrl}
                    download={
                      item.htmlVideoUrl
                        ? 'got-agent-nuclear-survival-video.html'
                        : `${item.id}.svg`
                    }
                    className="min-h-[40px] min-w-[40px] rounded-xl liquid-glass flex items-center justify-center text-stone-700 dark:text-stone-200"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* Lightbox / Interactive HTML5 Video Player Modal */}
        <AnimatePresence>
          {selectedGalleryItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
              onClick={() => setSelectedGalleryItem(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl liquid-glass rounded-[32px] p-4 sm:p-6 space-y-4 border border-white/90 dark:border-stone-800 shadow-2xl max-h-[92dvh] overflow-y-auto"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-white">
                      {selectedGalleryItem.title}
                    </h3>
                    <div className="text-xs font-mono text-stone-500">
                      {selectedGalleryItem.modelTag} · {selectedGalleryItem.resolution}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedGalleryItem(null)}
                    className="min-h-[40px] min-w-[40px] rounded-xl liquid-glass-subtle flex items-center justify-center text-stone-700 dark:text-stone-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedGalleryItem.htmlVideoUrl ? (
                  <div className="w-full rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 flex justify-center">
                    <iframe
                      title={selectedGalleryItem.title}
                      src={selectedGalleryItem.htmlVideoUrl}
                      sandbox="allow-scripts allow-same-origin"
                      className="w-full h-[68dvh] max-h-[680px] border-0"
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-2xl overflow-hidden border border-white/80 dark:border-stone-800 bg-stone-950/10 flex justify-center">
                    <img
                      src={selectedGalleryItem.imageUrl}
                      alt={selectedGalleryItem.title}
                      className="max-h-[62dvh] w-auto object-contain rounded-xl"
                    />
                  </div>
                )}

                <div className="p-3.5 rounded-2xl liquid-glass-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    <strong>Prompt:</strong> &ldquo;{selectedGalleryItem.prompt}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const promptToRun = selectedGalleryItem.prompt;
                      setSelectedGalleryItem(null);
                      onGetStarted(promptToRun);
                    }}
                    className="min-h-[42px] px-5 py-2 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open &amp; Run in GOT Agent</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Architecture & Deep Capabilities Breakdown */}
        <div className="liquid-glass rounded-[32px] p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-white">
                GOT Agent Core Architecture
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                Founded &amp; Engineered by Abhinav ({founderEmail} · @{founderInstaHandle})
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
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                1. Interactive 9:16 HTML5 Canvas Video Synthesis
              </h3>
              <p>
                Ask GOT Agent to create an HTML video on any subject—or tell it to turn your <strong>past prompt</strong>{' '}
                into a video—and it generates a 100% self-contained, playable <code>&lt;!DOCTYPE html&gt;</code>{' '}
                1080×1920 vertical canvas video with multi-chapter animations, camera zoom/shake, karaoke subtitles,
                and Web Speech API voiceover narration.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                2. Claude-Style Part-Wise Execution &amp; Massive Prompt Support
              </h3>
              <p>
                GOT Agent supports large and ultra-large prompts without crashing. Complex tasks are automatically
                executed <strong>Part-Wise</strong> (Part 1 Blueprint, Part 2 Core Logic, Part 3 Complete Runnable
                Code &amp; Live Preview, Part 4 Verification) with 1-click continuation buttons.
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-1.5">
              <h3 className="font-bold text-base text-stone-900 dark:text-white">
                3. Permanent Uploaded Image &amp; Chat History Vault (IndexedDB + Local Memory)
              </h3>
              <p>
                When you upload an image and chat about it, GOT Agent saves both the conversation and the uploaded
                image inside a permanent dual-layer vault (LocalStorage + IndexedDB + Server Sync) so your image and
                chat remain intact whenever you reopen or switch conversations.
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
                Effective Date: November 2026 · Founder &amp; Data Controller: Abhinav ({founderEmail})
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
                1. Minimal Information We Collect (Name Only)
              </h2>
              <p>
                GOT Agent does not require an email address or password to use the public AI portal. When you start
                using GOT Agent, we only ask for your <strong>Name</strong>, and we record your{' '}
                <strong>IP Address</strong> (used for automatic portal recognition and anti-abuse security), your{' '}
                <strong>AI Credit Balance</strong> (`tokenBalance` and `totalTokensUsed`), and your{' '}
                <strong>Saved Conversation &amp; Uploaded Image History</strong> so GOT Agent remembers your context
                across sessions.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                2. How We Use Your Data
              </h2>
              <p>
                Your data is used exclusively to: (a) provide personalized AI responses and cross-conversation memory,
                (b) automatically recognize your profile by IP address, (c) manage your free AI credit balance, and
                (d) protect the platform against abuse and violent content.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                3. Data Deletion &amp; Contacting Founder Abhinav
              </h2>
              <p>
                You can delete individual chat sessions at any time from your History drawer or contact Founder
                Abhinav directly at <strong>{founderEmail}</strong> or on Instagram at{' '}
                <strong>@{founderInstaHandle}</strong>.
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
              Official GOT Agent Governance · Founded by Abhinav ({founderEmail} · @{founderInstaHandle})
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
              1. Instant Name Access &amp; IP Auto-Portal
            </h2>
            <p>
              Users can access GOT Agent immediately by entering their Name — no sign-up or login password is
              required. Your IP address is linked to your Name profile for seamless automatic access on return visits.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              2. Fair Usage &amp; Resource Allocation
            </h2>
            <p>
              Every user receives instant access upon entering their name. Usage is managed automatically in the
              background to ensure high-speed responses, 2D HTML5 video rendering, and multi-file project synthesis for
              all users.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              3. Zero-Tolerance 5-Strike Anti-Violence Policy
            </h2>
            <p>
              GOT Agent strictly prohibits violent, harmful, illegal, or abusive prompts. Sending violent messages
              increments your profile&apos;s violation counter. Exceeding <strong>5 violent chat messages</strong>{' '}
              triggers an immediate, automatic block of both your profile and your IP address.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
