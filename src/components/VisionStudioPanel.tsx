import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Send,
  Play,
  Check,
  FileText,
  Eye,
} from 'lucide-react';
import {
  ChannelId,
  VisionAnalysisResult,
  YouTubeIntelligenceResult,
} from '../types/agent';

interface VisionStudioPanelProps {
  onDispatchToChannel: (channel: ChannelId, messageText: string) => void;
  onSendImageToChat: (imageUrl: string, imageName: string, summary: string) => void;
}

const SAMPLE_VISION_ASSETS = [
  {
    id: 'sample-notes',
    name: 'Q3/Q4 Revenue Strategy Notebook',
    category: 'Handwritten Chart & Tablet OCR',
    url: '/src/assets/images/sample_vision_notes_1794028209924.jpg',
    fallbackSummary:
      'Executive strategy notebook showing Q3/Q4 revenue growth trajectory from $1.8M to $2.9M (+35% YoY target) paired with live iPad telemetry.',
  },
  {
    id: 'sample-product',
    name: 'Ceramic Pour-Over Carafe Studio Shot',
    category: 'Product & Instagram Visual Audit',
    url: '/src/assets/images/sample_vision_product_1794028207804.jpg',
    fallbackSummary:
      'Minimalist stoneware pour-over coffee carafe on warm travertine stone with natural morning side-lighting, ideal for Instagram & WhatsApp product drops.',
  },
  {
    id: 'sample-topology',
    name: 'Autonomous Decision Matrix Topology',
    category: 'System Architecture Diagram',
    url: '/src/assets/images/hero_data_topology_1794028210000.jpg',
    actualUrl: '/src/assets/images/hero_data_topology_1793981938563.jpg',
    fallbackSummary:
      'Isometric quantitative routing topology mapping sensor validation nodes (A1-D4) to automated output decision pathways.',
  },
];

async function imageUrlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      resolve({
        base64: result,
        mimeType: blob.type || 'image/jpeg',
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const VisionStudioPanel: React.FC<VisionStudioPanelProps> = ({
  onDispatchToChannel,
  onSendImageToChat,
}) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
    SAMPLE_VISION_ASSETS[0].url
  );
  const [selectedImageName, setSelectedImageName] = useState<string>(
    SAMPLE_VISION_ASSETS[0].name
  );
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/jpeg');
  const [analysisTask, setAnalysisTask] = useState<string>(
    'Comprehensive Visual & Data Audit'
  );
  const [customFocus, setCustomFocus] = useState<string>('');
  const [isAnalyzingVision, setIsAnalyzingVision] = useState<boolean>(false);
  const [visionError, setVisionError] = useState<string | null>(null);
  const [dispatchedChannel, setDispatchedChannel] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const [visionResult, setVisionResult] = useState<VisionAnalysisResult>({
    headline: 'Q3/Q4 Revenue Growth Trajectory (+35% YoY Target Verified)',
    summary:
      'High-contrast overhead capture of an executive strategy ledger and tablet dashboard. Handwritten curve projects revenue scaling from $1.8M (Q1) and $2.1M (Q2/Q3) to a $2.9M Q4 goal, matching the tablet actuals of $2.3M vs $2.1M goal (+12.9% beat).',
    extractedText:
      'Q3/Q4 REVENUE GROWTH STRATEGY · Current Trend: +14% QoQ · Action: Market Expansion · $1.8M -> $2.1M -> $2.9M · Actual $2.3M vs Goal $2.1M (+12.9%) · Notes: 1. Diversify Product Portfolio, 2. Scale sales in US/EMEA, 3. Optimize Pricing.',
    detectedElements: [
      {
        label: 'Handwritten Revenue Curve & Forecast',
        detail: 'Q1 $1.8M to Q4 $2.9M trajectory with +35% YoY target calculation',
        confidence: 98,
      },
      {
        label: 'Tablet Live Revenue Overview',
        detail: 'Displays $2.3M actual vs $2.1M goal (+12.9% variance)',
        confidence: 96,
      },
      {
        label: 'Editorial Warm Linen Staging',
        detail: 'High daylight legibility suitable for executive share cards',
        confidence: 94,
      },
    ],
    strategicRecommendations: [
      'Lock Q4 pricing tier optimization immediately while actuals pace +12.9% ahead of the $2.1M milestone.',
      'Broadcast the US/EMEA expansion KPI digest to leadership on Telegram and WhatsApp.',
      'Publish the behind-the-scenes strategy flatlay on Instagram and YouTube Community to build founder transparency.',
    ],
    channelCaptions: {
      telegram:
        '📊 Q3/Q4 Revenue Pulse: Pacing at $2.3M actual vs $2.1M goal (+12.9%). Next milestone: $2.9M Q4 target via US/EMEA expansion & pricing optimization.',
      whatsapp:
        'Hey team — Q3 actuals just crossed $2.3M (beating our $2.1M target by 12.9%). Sharing the Q4 $2.9M roadmap priorities: 1) Portfolio diversification 2) US/EMEA scale 3) Pricing.',
      instagram:
        'From notebook sketches to $2.3M on the board. Mapping out our Q4 sprint toward $2.9M with cleaner systems and focused execution. ✨📈',
      youtube:
        'New breakdown dropping soon: How we mapped our $1.8M to $2.9M revenue curve and beat Q3 targets by 12.9%. What metric are you focusing on this quarter?',
    },
  });

  // YouTube Content Intelligence State
  const [ytInput, setYtInput] = useState<string>(
    'https://youtube.com/watch?v=ai-agent-automation-workflows-2026'
  );
  const [isAnalyzingYt, setIsAnalyzingYt] = useState<boolean>(false);
  const [ytResult, setYtResult] = useState<YouTubeIntelligenceResult>({
    videoOrTopicTitle: 'Autonomous AI Agents: From Raw Telemetry to Omnichannel Execution',
    hookScore: 94,
    audienceRetentionSummary:
      'Strong visual contrast in the first 15 seconds keeps 78% viewer retention past the intro. Pacing peaks during the live Telegram + WhatsApp + Instagram automation demo.',
    keyTakeaways: [
      'Lead with the concrete outcome in the first 8 seconds before explaining architecture.',
      'Pair visual chart/image analysis with instant 1-tap messaging dispatch.',
      'Use chapter markers every 90 seconds to boost search indexing and replay value.',
      'Cross-syndicate 45-second vertical cuts to Instagram Reels and YouTube Shorts.',
    ],
    timestamps: [
      { time: '00:00', label: 'The 8-Second Omnichannel AI Hook' },
      { time: '01:24', label: 'Live Gemini Vision Image & Chart Extraction' },
      { time: '03:10', label: 'Connecting Telegram, WhatsApp & Instagram Auto-Replies' },
      { time: '05:45', label: 'Automated Decision Rules & ROI Breakdown' },
    ],
    repurposedAssets: {
      telegram:
        '🎬 New Video Deep-Dive: How we connected Gemini Vision + Omnichannel Auto-Dispatch across Telegram, WhatsApp & Instagram. Watch the full workflow breakdown!',
      whatsapp:
        'Just published our new walkthrough on automating image analysis & client replies across WhatsApp, Telegram & IG. Key timestamps inside!',
      instagram:
        'Stop copying data between apps manually. Here is the exact AI agent workflow we use to analyze visuals and automate replies in 1 tap.',
      youtube:
        'In this breakdown, we build a complete multimodal AI agent that analyzes complex visuals, extracts metrics, and dispatches across Telegram, WhatsApp, and Instagram.',
    },
  });

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target?.result || '');
      setSelectedImageUrl(dataUrl);
      setUploadedBase64(dataUrl);
      setUploadedMimeType(file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleRunVisionAnalysis = async () => {
    setIsAnalyzingVision(true);
    setVisionError(null);
    try {
      let base64ToSend = uploadedBase64;
      let mimeToSend = uploadedMimeType;

      if (!base64ToSend) {
        const converted = await imageUrlToBase64(selectedImageUrl);
        base64ToSend = converted.base64;
        mimeToSend = converted.mimeType;
      }

      const response = await fetch('/api/agent/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64ToSend,
          imageMimeType: mimeToSend,
          analysisTask,
          customInstruction: customFocus,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Vision analysis failed');
      }
      setVisionResult(data);
    } catch (err: any) {
      setVisionError(
        err?.message || 'Unable to complete live vision call; showing cached analysis.'
      );
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const handleRunYtAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytInput.trim()) return;
    setIsAnalyzingYt(true);
    try {
      const response = await fetch('/api/agent/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOrTopic: ytInput,
          goal: 'Maximize Retention & Omnichannel Conversion',
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setYtResult(data);
      }
    } finally {
      setIsAnalyzingYt(false);
    }
  };

  const triggerDispatch = (channel: ChannelId, text: string, key: string) => {
    onDispatchToChannel(channel, text);
    setDispatchedChannel(key);
    setTimeout(() => setDispatchedChannel(null), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Multimodal Vision & Image Analysis Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Image Canvas, Upload & Preset Picker */}
        <div className="lg:col-span-5 liquid-glass rounded-[32px] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Gemini Vision Studio · OCR & Scene Intelligence
              </div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5 font-display">
                01. Visual Input & Image Analysis
              </h2>
            </div>
            <label className="min-h-[44px] px-4 py-2 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer liquid-glass-hover whitespace-nowrap shrink-0">
              <Upload className="w-3.5 h-3.5" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Main Image Preview Frame */}
          <div className="relative rounded-[24px] overflow-hidden border border-white/80 dark:border-stone-800 bg-stone-200/60 dark:bg-stone-900 aspect-4/3 flex items-center justify-center">
            {!brokenImages[selectedImageUrl] ? (
              <img
                src={selectedImageUrl}
                alt={selectedImageName}
                referrerPolicy="no-referrer"
                onError={() =>
                  setBrokenImages((prev) => ({ ...prev, [selectedImageUrl]: true }))
                }
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-6 text-center space-y-2">
                <Camera className="w-8 h-8 text-stone-500 mx-auto" />
                <div className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                  {selectedImageName}
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 flex items-end justify-between gap-2">
              <div className="text-white min-w-0">
                <div className="text-xs opacity-80">Active Visual Target</div>
                <div className="text-sm font-semibold truncate">
                  {selectedImageName}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onSendImageToChat(
                    selectedImageUrl,
                    selectedImageName,
                    visionResult.summary
                  )
                }
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white/90 text-stone-900 text-xs font-semibold hover:bg-white transition-colors whitespace-nowrap shrink-0"
              >
                Discuss in Chat
              </button>
            </div>
          </div>

          {/* Curated Sample Visuals for Instant 1-Tap Testing */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-stone-600 dark:text-stone-400">
              Or tap a sample image to test Gemini Vision:
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {SAMPLE_VISION_ASSETS.map((sample) => {
                const targetUrl = sample.actualUrl || sample.url;
                const isSelected = selectedImageUrl === targetUrl;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setSelectedImageUrl(targetUrl);
                      setSelectedImageName(sample.name);
                      setUploadedBase64(null);
                    }}
                    className={`p-2 rounded-2xl text-left transition-all liquid-glass-hover border ${
                      isSelected
                        ? 'bg-white dark:bg-stone-800 border-stone-900 dark:border-stone-200 shadow-sm'
                        : 'liquid-glass-subtle border-white/80 dark:border-stone-800'
                    }`}
                  >
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {sample.name}
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                      {sample.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Mode & Analyze Trigger */}
          <div className="space-y-3 pt-2 border-t border-stone-200/60 dark:border-stone-800">
            <div>
              <label
                htmlFor="vision-task-select"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
              >
                Vision Analysis Mode
              </label>
              <select
                id="vision-task-select"
                value={analysisTask}
                onChange={(e) => setAnalysisTask(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                <option value="Comprehensive Visual & Data Audit">
                  Comprehensive Visual & Data Audit
                </option>
                <option value="OCR Text, Numbers & Chart Extraction">
                  OCR Text, Numbers & Chart Extraction
                </option>
                <option value="Instagram, YouTube & WhatsApp Product Copy">
                  Instagram, YouTube & WhatsApp Product Copy
                </option>
                <option value="UI/UX & Aesthetic Quality Critique">
                  UI/UX & Aesthetic Quality Critique
                </option>
              </select>
            </div>

            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="Optional custom focus (e.g. 'Extract all revenue numbers' or 'Write viral IG hook')..."
              className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleRunVisionAnalysis}
              disabled={isAnalyzingVision}
              className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 liquid-glass-hover disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzingVision
                ? 'Analyzing Image with Gemini Vision...'
                : 'Analyze Image with AI Agent'}
            </button>

            {visionError && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {visionError}
              </p>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Structured Vision Output, OCR & 1-Tap Omnichannel Captions */}
        <div className="lg:col-span-7 liquid-glass rounded-[32px] p-5 sm:p-6 space-y-5">
          <div className="border-b border-stone-200/70 dark:border-stone-800 pb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span>Multimodal Extraction</span>
              <span aria-hidden="true">·</span>
              <span>{visionResult.detectedElements.length} Visual Entities</span>
              <span aria-hidden="true">·</span>
              <span>4 Channel Formats Ready</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mt-1 font-display">
              {visionResult.headline}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-1.5">
              {visionResult.summary}
            </p>
          </div>

          {/* OCR & Extracted Data */}
          <div className="p-4 rounded-[22px] liquid-glass-subtle space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
              <FileText className="w-3.5 h-3.5" />
              Extracted OCR Text & Quantitative Callouts
            </div>
            <p className="text-xs font-mono tabular-nums text-stone-600 dark:text-stone-300 leading-relaxed">
              {visionResult.extractedText}
            </p>
          </div>

          {/* Detected Visual Elements */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Detected Scene & Data Elements
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {visionResult.detectedElements.map((el, i) => (
                <div
                  key={`${el.label}-${i}`}
                  className="p-3.5 rounded-2xl liquid-glass-subtle liquid-glass-hover space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {el.label}
                    </span>
                    <span className="font-mono tabular-nums text-stone-500 dark:text-stone-400 shrink-0 ml-1">
                      {el.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-snug">
                    {el.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ready-to-Send Omnichannel Captions (Telegram, WhatsApp, Instagram, YouTube) */}
          <div className="space-y-3 pt-2 border-t border-stone-200/70 dark:border-stone-800">
            <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              1-Tap Omnichannel Syndication (Telegram · WhatsApp · Instagram · YouTube)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { id: 'telegram', label: 'Telegram Channel / Bot' },
                  { id: 'whatsapp', label: 'WhatsApp Broadcast' },
                  { id: 'instagram', label: 'Instagram Caption & DM' },
                  { id: 'youtube', label: 'YouTube Community / Hook' },
                ] as const
              ).map((ch) => {
                const text = visionResult.channelCaptions[ch.id];
                const key = `vision-${ch.id}`;
                const isSent = dispatchedChannel === key;
                return (
                  <div
                    key={ch.id}
                    className="p-3.5 rounded-2xl liquid-glass-subtle flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        {ch.label}
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        {text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerDispatch(ch.id, text, key)}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-1.5 liquid-glass-hover"
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Dispatched to {ch.id}
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Send to {ch.label.split(' ')[0]}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: YouTube Video & Cross-Platform Content Intelligence */}
      <div className="liquid-glass rounded-[32px] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-200/70 dark:border-stone-800 pb-4">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              YouTube Studio Intelligence · Hook Scoring, Chapters & Cross-Platform Repurposing
            </div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5 font-display">
              02. YouTube Video & Topic Analyzer
            </h2>
          </div>

          <form
            onSubmit={handleRunYtAnalysis}
            className="flex items-center gap-2 w-full md:w-auto md:min-w-[420px]"
          >
            <input
              type="text"
              value={ytInput}
              onChange={(e) => setYtInput(e.target.value)}
              placeholder="Paste YouTube URL or video topic..."
              className="flex-1 min-h-[44px] px-4 py-2 text-xs sm:text-sm rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isAnalyzingYt}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 liquid-glass-hover whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {isAnalyzingYt ? 'Analyzing...' : 'Analyze YouTube'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                <span>Retention Hook Score: {ytResult.hookScore}/100</span>
                <span>4 Chapter Markers</span>
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {ytResult.videoOrTopicTitle}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {ytResult.audienceRetentionSummary}
              </p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
              <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                Generated YouTube Chapter Timestamps
              </div>
              <div className="space-y-1.5">
                {ytResult.timestamps.map((ts, idx) => (
                  <div
                    key={`${ts.time}-${idx}`}
                    className="flex items-center gap-3 text-xs"
                  >
                    <span className="font-mono tabular-nums font-semibold text-stone-900 dark:text-stone-100">
                      {ts.time}
                    </span>
                    <span className="text-stone-600 dark:text-stone-300">
                      {ts.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                { id: 'youtube', label: 'YouTube Description & Hook' },
                { id: 'instagram', label: 'Instagram Reels Cut Script' },
                { id: 'telegram', label: 'Telegram Subscriber Alert' },
                { id: 'whatsapp', label: 'WhatsApp VIP Community Note' },
              ] as const
            ).map((item) => {
              const content = ytResult.repurposedAssets[item.id];
              const key = `yt-${item.id}`;
              const isSent = dispatchedChannel === key;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl liquid-glass-subtle flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {item.label}
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerDispatch(item.id, content, key)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-1.5 liquid-glass-hover"
                  >
                    {isSent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Sent to {item.id}
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Publish to {item.label.split(' ')[0]}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
