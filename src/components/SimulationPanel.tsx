import React, { useState } from 'react';
import { Sliders, Play, CheckCircle2 } from 'lucide-react';
import {
  DataRow,
  DatasetStatisticalProfile,
  ScenarioSimulationResult,
} from '../types/agent';

interface SimulationPanelProps {
  datasetName: string;
  domain: string;
  primaryMetric: string;
  statisticalProfile: DatasetStatisticalProfile;
  rows: DataRow[];
  onApplyRecommendation: (recommendationText: string, savingsUsd: number) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  datasetName,
  domain,
  primaryMetric,
  statisticalProfile,
  rows,
  onApplyRecommendation,
}) => {
  const [scenarioPrompt, setScenarioPrompt] = useState(
    `Tighten ${primaryMetric} threshold by 20% and automatically reroute top-quartile risk entities`
  );
  const [adjustmentPct, setAdjustmentPct] = useState<number>(-20);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [result, setResult] = useState<ScenarioSimulationResult>({
    scenarioTitle: `20% Threshold Compression on ${primaryMetric}`,
    summary: `Simulating a 20% tighter operational bound on ${primaryMetric} across ${rows.length} active entities isolates high-variance tail records prior to SLA breach.`,
    projectedCostDeltaUsd: 164500,
    projectedRiskReductionPct: 48.5,
    projectedEfficiencyGainPct: 23.0,
    affectedEntitiesCount: Math.max(2, Math.round(rows.length * 0.25)),
    tradeoffs: [
      'Increases automated webhook interventions by 2 dispatches per cycle',
      'Requires 12% reserve capacity buffer on secondary carrier or compute tier',
    ],
    recommendedParameterChange: `Update ${primaryMetric} automation trigger threshold by -20% with 90% confidence gate`,
  });

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setError(null);
    setApplied(false);

    try {
      const response = await fetch('/api/agent/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName,
          domain,
          scenarioPrompt,
          parameterAdjustmentPct: adjustmentPct,
          statisticalProfile,
          sampleRows: rows.slice(0, 15),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Simulation request failed');
      }
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to reach AI simulation engine.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="liquid-glass rounded-[32px] p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/70 dark:border-stone-800 pb-4">
        <div>
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Counterfactual Stress Test · Monte Carlo & Gemini Reasoning
          </div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5 font-display">
            What-If Decision Simulator
          </h3>
        </div>
        <div className="text-xs font-mono tabular-nums text-stone-500 dark:text-stone-400">
          Target Variable: {primaryMetric}
        </div>
      </div>

      <form onSubmit={handleRunSimulation} className="space-y-4">
        <div>
          <label
            htmlFor="scenario-input"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Scenario Hypothesis or Policy Change
          </label>
          <input
            id="scenario-input"
            type="text"
            value={scenarioPrompt}
            onChange={(e) => setScenarioPrompt(e.target.value)}
            className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            placeholder="Describe policy change or shock scenario..."
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Parameter Shift Magnitude
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                {adjustmentPct > 0 ? `+${adjustmentPct}%` : `${adjustmentPct}%`}
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={adjustmentPct}
              onChange={(e) => setAdjustmentPct(Number(e.target.value))}
              aria-label="Parameter shift percentage"
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSimulating}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-medium hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {isSimulating ? 'Simulating Impact...' : 'Simulate Impact'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-xs text-red-600 dark:text-red-400 py-2">
          Simulation note: {error}
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Projected Value
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              +${Math.abs(result.projectedCostDeltaUsd).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Risk Reduction
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              -{result.projectedRiskReductionPct}%
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Affected Records
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
              {result.affectedEntitiesCount} rows
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {result.scenarioTitle}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {result.summary}
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            Operational Tradeoffs: {result.tradeoffs.join(' · ')}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Directive: {result.recommendedParameterChange}
          </div>
          <button
            type="button"
            onClick={() => {
              onApplyRecommendation(
                result.recommendedParameterChange,
                Math.abs(result.projectedCostDeltaUsd)
              );
              setApplied(true);
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {applied ? 'Queued in Decisions' : 'Stage as Automated Decision'}
          </button>
        </div>
      </div>
    </div>
  );
};
