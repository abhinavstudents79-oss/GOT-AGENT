import React, { useState } from 'react';
import { Send, ArrowUpRight, Check } from 'lucide-react';
import {
  AgentChatMessage,
  DataRow,
  DatasetStatisticalProfile,
  DecisionProposal,
} from '../types/agent';

interface AgentQueryPanelProps {
  datasetName: string;
  domain: string;
  statisticalProfile: DatasetStatisticalProfile;
  rows: DataRow[];
  decisions: DecisionProposal[];
  onStageAction: (action: {
    title: string;
    targetEntity: string;
    quantifiedImpact: string;
  }) => void;
}

export const AgentQueryPanel: React.FC<AgentQueryPanelProps> = ({
  datasetName,
  domain,
  statisticalProfile,
  rows,
  decisions,
  onStageAction,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stagedIds, setStagedIds] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'msg-init',
      role: 'agent',
      timestamp: 'Ready',
      content: `Connected to ${datasetName} (${rows.length} records, ${statisticalProfile.numericColumnCount} numeric metrics). Ask me to isolate root-cause correlations, rank tail-risk entities, or synthesize an automated remediation rule.`,
      keyMetrics: [
        `Evaluated Cells: ${rows.length * statisticalProfile.columnCount}`,
        `Outliers Detected: ${statisticalProfile.totalOutliers}`,
      ],
    },
  ]);

  const quickPrompts = [
    'Which 3 entities carry the highest compounded financial risk right now?',
    'Explain the strongest cross-column correlation and how to automate around it.',
    'Where can we capture immediate cost savings without hurting SLA?',
  ];

  const sendQuestion = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          datasetName,
          domain,
          statisticalProfile,
          rows,
          decisions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Agent query failed');
      }

      const agentMsg: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        content: data.content,
        keyMetrics: data.keyMetrics,
        suggestedAction: data.suggestedAction,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'agent',
          timestamp: 'System',
          content:
            err?.message ||
            'Unable to reach Gemini decision endpoint. Please verify your API key in Settings > Secrets.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Direct Telemetry Interrogation · Grounded on Active Rows
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
          Ask Decision Agent
        </h3>
      </div>

      {/* Quick Prompt Chips as Functional Buttons */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => sendQuestion(q)}
            disabled={isLoading}
            className="min-h-[40px] px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3.5 rounded-xl border ${
              msg.role === 'user'
                ? 'bg-slate-900 text-white border-slate-800 dark:bg-slate-800 dark:border-slate-700 ml-6'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 mr-2'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] opacity-70 mb-1 font-mono tabular-nums">
              <span>{msg.role === 'user' ? 'Operator' : 'Strata Agent'}</span>
              <span>{msg.timestamp}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>

            {msg.keyMetrics && msg.keyMetrics.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                {msg.keyMetrics.join(' · ')}
              </div>
            )}

            {msg.suggestedAction && (
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Proposed Action: {msg.suggestedAction.title}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {' '}
                    · {msg.suggestedAction.targetEntity} ·{' '}
                    {msg.suggestedAction.quantifiedImpact}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!msg.suggestedAction) return;
                    onStageAction(msg.suggestedAction);
                    setStagedIds((prev) => ({ ...prev, [msg.id]: true }));
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition-colors"
                >
                  {stagedIds[msg.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Staged
                    </>
                  ) : (
                    <>
                      Stage Action
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
            Evaluating multi-variate telemetry and policy constraints...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuestion(question);
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about outliers, correlations, or decision impacts..."
          className="flex-1 min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          aria-label="Send question to AI agent"
          className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-medium hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
