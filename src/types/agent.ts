export type ChannelId = 'telegram' | 'whatsapp' | 'instagram' | 'youtube';

export interface ChannelConnection {
  id: ChannelId;
  name: string;
  handleOrEndpoint: string;
  connected: boolean;
  autoReplyEnabled: boolean;
  autoVisionSync: boolean;
  botTokenOrKey?: string;
  chatIdOrPhone?: string;
  personaTone: 'Executive Concise' | 'Warm Conversational' | 'Creator High-Retention';
  messagesHandled: number;
  lastSync: string;
}

export interface ChannelDraftMap {
  telegram: string;
  whatsapp: string;
  instagram: string;
  youtube: string;
}

export interface MultimodalChatMessage {
  id: string;
  role: 'user' | 'agent';
  timestamp: string;
  text: string;
  agentMode?: string;
  attachedImageUrl?: string;
  attachedImageName?: string;
  highlights?: string[];
  channelDrafts?: ChannelDraftMap;
  suggestedActions?: Array<{
    title: string;
    channel: ChannelId;
    payloadPreview: string;
  }>;
}

export interface VisionDetectedElement {
  label: string;
  detail: string;
  confidence: number;
}

export interface VisionAnalysisResult {
  headline: string;
  summary: string;
  extractedText: string;
  detectedElements: VisionDetectedElement[];
  strategicRecommendations: string[];
  channelCaptions: ChannelDraftMap;
}

export interface YouTubeIntelligenceResult {
  videoOrTopicTitle: string;
  hookScore: number;
  audienceRetentionSummary: string;
  keyTakeaways: string[];
  timestamps: Array<{ time: string; label: string }>;
  repurposedAssets: ChannelDraftMap;
}

export interface IncomingOmnichannelMessage {
  id: string;
  channel: ChannelId;
  senderName: string;
  senderHandle: string;
  receivedAt: string;
  messageText: string;
  aiSuggestedReply: string;
  status: 'Needs Review' | 'Auto-Replied' | 'Sent';
}

export interface DispatchLogEntry {
  id: string;
  channel: ChannelId;
  recipient: string;
  preview: string;
  timestamp: string;
  deliveryMode: string;
}

export type DataRow = Record<string, string | number | boolean>;

export interface ColumnProfile {
  name: string;
  type: 'numeric' | 'categorical';
  count: number;
  missingCount: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  outlierCount?: number;
  unit?: string;
  topCategories?: Array<{ value: string; count: number; percentage: number }>;
}

export interface CorrelationPair {
  colA: string;
  colB: string;
  coefficient: number;
  strength: 'Strong Positive' | 'Moderate Positive' | 'Weak' | 'Moderate Negative' | 'Strong Negative';
}

export interface DetectedOutlier {
  rowIndex: number;
  entityId: string;
  entityName: string;
  column: string;
  value: number;
  zScore: number;
  medianBaseline: number;
  direction: 'High' | 'Low';
}

export interface DatasetStatisticalProfile {
  rowCount: number;
  columnCount: number;
  numericColumnCount: number;
  categoricalColumnCount: number;
  totalOutliers: number;
  columns: ColumnProfile[];
  correlations: CorrelationPair[];
  outliers: DetectedOutlier[];
}

export interface AutomationRule {
  id: string;
  name: string;
  metric: string;
  operator: '>' | '>=' | '<' | '<=' | '==';
  threshold: number | string;
  secondaryMetric?: string;
  secondaryOperator?: '>' | '<';
  secondaryThreshold?: number;
  actionType: string;
  targetSystem: string;
  autoExecuteAboveConfidence: number;
  enabled: boolean;
}

export interface DecisionProposal {
  id: string;
  title: string;
  targetEntity: string;
  actionType: string;
  targetSystem: string;
  severity: 'Critical' | 'Elevated' | 'Routine';
  confidence: number;
  autoExecutable: boolean;
  status: 'Pending Review' | 'Auto-Executed' | 'Approved' | 'Dismissed';
  rationale: string;
  triggerMetricSummary: string;
  quantifiedImpact: string;
  estimatedSavingsOrGainUsd: number;
  executionPayload: Record<string, string | number>;
  ruleId?: string;
  executedAt?: string;
}

export interface AgentInsight {
  id: string;
  category: 'Root Cause' | 'Correlation' | 'Anomaly' | 'Forecast';
  headline: string;
  detail: string;
  supportingMetrics: string;
  severity: 'Critical' | 'Attention' | 'Nominal';
}

export interface AgentReasoningStep {
  stepNumber: string;
  phase: string;
  summary: string;
  finding: string;
}

export interface AgentAnalysisResult {
  datasetId: string;
  analyzedAt: string;
  executiveSummary: string;
  healthScore: number;
  totalProjectedImpactUsd: number;
  reasoningTrace: AgentReasoningStep[];
  insights: AgentInsight[];
  decisions: DecisionProposal[];
  statisticalProfile: DatasetStatisticalProfile;
}

export interface ScenarioSimulationResult {
  scenarioTitle: string;
  summary: string;
  projectedCostDeltaUsd: number;
  projectedRiskReductionPct: number;
  projectedEfficiencyGainPct: number;
  affectedEntitiesCount: number;
  tradeoffs: string[];
  recommendedParameterChange: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'agent';
  timestamp: string;
  content: string;
  keyMetrics?: string[];
  suggestedAction?: {
    title: string;
    targetEntity: string;
    quantifiedImpact: string;
  };
}

export interface DatasetPreset {
  id: string;
  name: string;
  domain: string;
  description: string;
  primaryKeyColumn: string;
  labelColumn: string;
  primaryMetricColumn: string;
  secondaryMetricColumn: string;
  costOrValueColumn: string;
  riskColumn: string;
  rows: DataRow[];
  defaultRules: AutomationRule[];
}
