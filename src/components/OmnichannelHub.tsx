import React, { useState } from 'react';
import {
  Send,
  MessageCircle,
  Camera,
  Play,
  Settings2,
  Check,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ChannelConnection,
  ChannelId,
  DispatchLogEntry,
  IncomingOmnichannelMessage,
} from '../types/agent';
import { BottomSheetModal } from './BottomSheetModal';

interface OmnichannelHubProps {
  channels: ChannelConnection[];
  onUpdateChannel: (updated: ChannelConnection) => void;
  incomingMessages: IncomingOmnichannelMessage[];
  onSendSuggestedReply: (msgId: string) => void;
  dispatchLogs: DispatchLogEntry[];
  onQuickBroadcast: (channel: ChannelId, text: string) => void;
}

export const OmnichannelHub: React.FC<OmnichannelHubProps> = ({
  channels,
  onUpdateChannel,
  incomingMessages,
  onSendSuggestedReply,
  dispatchLogs,
  onQuickBroadcast,
}) => {
  const [editingChannel, setEditingChannel] =
    useState<ChannelConnection | null>(null);
  const [broadcastText, setBroadcastText] = useState(
    'Automated AI Digest: Q3 revenue actuals reached $2.3M (+12.9% above goal) with all critical cold-chain & compute thresholds active.'
  );
  const [selectedTargets, setSelectedTargets] = useState<
    Record<ChannelId, boolean>
  >({
    telegram: true,
    whatsapp: true,
    instagram: true,
    youtube: true,
  });
  const [broadcastSent, setBroadcastSent] = useState(false);

  const getChannelIcon = (id: ChannelId) => {
    if (id === 'telegram') return <Send className="w-4 h-4" />;
    if (id === 'whatsapp') return <MessageCircle className="w-4 h-4" />;
    if (id === 'instagram') return <Camera className="w-4 h-4" />;
    return <Play className="w-4 h-4" />;
  };

  const handleBroadcastAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    (Object.keys(selectedTargets) as ChannelId[]).forEach((chId) => {
      if (selectedTargets[chId]) {
        onQuickBroadcast(chId, broadcastText.trim());
      }
    });
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* 4 Channel Connector Cards: Telegram, WhatsApp, Instagram, YouTube */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {channels.map((ch) => (
          <div
            key={ch.id}
            className="liquid-glass liquid-glass-hover rounded-[28px] p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 flex items-center justify-center">
                  {getChannelIcon(ch.id)}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingChannel(ch)}
                  aria-label={`Configure ${ch.name}`}
                  className="min-h-[40px] min-w-[40px] rounded-xl liquid-glass-subtle flex items-center justify-center text-stone-600 hover:text-stone-900 dark:text-stone-300"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                  {ch.name}
                </h3>
                {/* Unboxed Zero-Pill Metadata */}
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-mono truncate">
                  {ch.handleOrEndpoint} ·{' '}
                  {ch.connected ? 'Connected' : 'Paused'}
                </div>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1 pt-1">
                <div>Tone: {ch.personaTone}</div>
                <div className="font-mono tabular-nums text-stone-500 dark:text-stone-400">
                  Handled: {ch.messagesHandled} msgs · Sync {ch.lastSync}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateChannel({
                    ...ch,
                    autoReplyEnabled: !ch.autoReplyEnabled,
                  })
                }
                className={`min-h-[40px] flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  ch.autoReplyEnabled
                    ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                    : 'liquid-glass-subtle text-stone-600 dark:text-stone-400'
                }`}
              >
                {ch.autoReplyEnabled ? 'AI Auto-Reply On' : 'Auto-Reply Off'}
              </button>
              <button
                type="button"
                onClick={() => setEditingChannel(ch)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl liquid-glass-subtle text-xs font-medium text-stone-700 dark:text-stone-300"
              >
                Setup
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Channel Instant Broadcast Composer */}
      <div className="liquid-glass rounded-[32px] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/70 dark:border-stone-800 pb-3.5">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Simultaneous Multi-Platform Dispatch
            </div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5 font-display">
              01. Omnichannel AI Broadcast Studio
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {channels.map((ch) => {
              const active = selectedTargets[ch.id];
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() =>
                    setSelectedTargets((prev) => ({
                      ...prev,
                      [ch.id]: !prev[ch.id],
                    }))
                  }
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950'
                      : 'liquid-glass-subtle text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {getChannelIcon(ch.id)}
                  {ch.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleBroadcastAll}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <input
            type="text"
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Write a message or AI decision summary to broadcast across selected channels..."
            className="flex-1 min-h-[48px] px-4 py-2.5 text-xs sm:text-sm rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100 focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 liquid-glass-hover whitespace-nowrap shrink-0"
          >
            {broadcastSent ? (
              <>
                <Check className="w-4 h-4" />
                Broadcast Sent
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Dispatch to Selected Channels
              </>
            )}
          </button>
        </form>
      </div>

      {/* Unified Omnichannel Inbox + Live Dispatch Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Incoming Telegram, WhatsApp, Instagram & YouTube Inbox */}
        <div className="lg:col-span-7 liquid-glass rounded-[32px] p-5 sm:p-6 space-y-4">
          <div className="border-b border-stone-200/70 dark:border-stone-800 pb-3.5">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Inbound Stream · AI Auto-Drafted Responses
            </div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5 font-display">
              02. Unified Telegram, WhatsApp, IG & YouTube Inbox
            </h2>
          </div>

          <div className="space-y-3.5">
            {incomingMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-[24px] liquid-glass-subtle liquid-glass-hover space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex items-center gap-2 font-medium text-stone-800 dark:text-stone-200">
                    {getChannelIcon(msg.channel)}
                    <span className="capitalize">{msg.channel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{msg.senderName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-stone-500">
                      {msg.senderHandle}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums">
                    {msg.receivedAt} · {msg.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                  "{msg.messageText}"
                </p>

                <div className="p-3 rounded-2xl bg-white/75 dark:bg-stone-900/80 border border-white/90 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Suggested Reply
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300">
                      {msg.aiSuggestedReply}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSendSuggestedReply(msg.id)}
                    disabled={msg.status === 'Sent'}
                    className="min-h-[40px] px-4 py-1.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    {msg.status === 'Sent' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Replied
                      </>
                    ) : (
                      <>
                        Approve & Send
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Outbound Omnichannel Delivery Log */}
        <div className="lg:col-span-5 liquid-glass rounded-[32px] p-5 sm:p-6 space-y-4">
          <div className="border-b border-stone-200/70 dark:border-stone-800 pb-3.5">
            <div className="text-xs text-stone-500 dark:text-stone-400">
              Verified Outbound Dispatches
            </div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5 font-display">
              03. Channel Automation Activity Log
            </h2>
          </div>

          <div className="space-y-3">
            {dispatchLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl liquid-glass-subtle space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                  <span className="capitalize font-sans font-semibold text-stone-900 dark:text-stone-100">
                    {log.channel} · {log.recipient}
                  </span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                  {log.preview}
                </p>
                <div className="text-[11px] font-mono text-stone-400">
                  {log.id} · {log.deliveryMode}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Configuration Bottom Sheet Modal */}
      <BottomSheetModal
        isOpen={Boolean(editingChannel)}
        onClose={() => setEditingChannel(null)}
        title={
          editingChannel ? `Configure ${editingChannel.name}` : 'Channel Setup'
        }
        subtitle="Connect your bot token, webhook endpoint, or creator handle for automated AI agent dispatch."
      >
        {editingChannel && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onUpdateChannel(editingChannel);
              setEditingChannel(null);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Channel Handle / Webhook Destination
              </label>
              <input
                type="text"
                value={editingChannel.handleOrEndpoint}
                onChange={(e) =>
                  setEditingChannel({
                    ...editingChannel,
                    handleOrEndpoint: e.target.value,
                  })
                }
                className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100"
              />
            </div>

            {editingChannel.id === 'telegram' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Telegram Bot Token (Optional for Live Bot API)
                  </label>
                  <input
                    type="password"
                    value={editingChannel.botTokenOrKey || ''}
                    onChange={(e) =>
                      setEditingChannel({
                        ...editingChannel,
                        botTokenOrKey: e.target.value,
                      })
                    }
                    placeholder="123456:ABC-DEF1234ghIkl..."
                    className="w-full min-h-[44px] px-3.5 py-2 text-xs font-mono rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Telegram Chat ID / @Channel
                  </label>
                  <input
                    type="text"
                    value={editingChannel.chatIdOrPhone || ''}
                    onChange={(e) =>
                      setEditingChannel({
                        ...editingChannel,
                        chatIdOrPhone: e.target.value,
                      })
                    }
                    placeholder="@my_channel or 987654321"
                    className="w-full min-h-[44px] px-3.5 py-2 text-xs font-mono rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                AI Agent Response Persona Tone
              </label>
              <select
                value={editingChannel.personaTone}
                onChange={(e) =>
                  setEditingChannel({
                    ...editingChannel,
                    personaTone: e.target
                      .value as ChannelConnection['personaTone'],
                  })
                }
                className="w-full min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-2xl liquid-glass-subtle text-stone-900 dark:text-stone-100"
              >
                <option value="Executive Concise">Executive Concise</option>
                <option value="Warm Conversational">Warm Conversational</option>
                <option value="Creator High-Retention">
                  Creator High-Retention
                </option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setEditingChannel({
                    ...editingChannel,
                    connected: !editingChannel.connected,
                  })
                }
                className="min-h-[44px] px-4 py-2 rounded-2xl liquid-glass-subtle text-xs font-semibold text-stone-800 dark:text-stone-200"
              >
                Status: {editingChannel.connected ? 'Connected' : 'Paused'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="min-h-[44px] px-4 py-2 rounded-2xl liquid-glass-subtle text-xs font-medium text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-2xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 text-xs font-semibold"
                >
                  Save Connection
                </button>
              </div>
            </div>
          </form>
        )}
      </BottomSheetModal>
    </div>
  );
};
