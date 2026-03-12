import apiClient from './apiClient';

const AGENTS_BASE = '/agents';

// =============================================================================
// Weight Calculator (existing)
// =============================================================================

export interface WeightSuggestion {
  subtask_id: number;
  weight: number;
  justification: string;
}

export interface CalculateWeightsResponse {
  weights: WeightSuggestion[];
}

export interface ApplyWeightsPayload {
  weights: { subtask_id: number; weight: number }[];
}

/** Ask AI to calculate weights for subtasks of a backlog item */
export async function calculateWeights(projectsBacklogsId: number): Promise<CalculateWeightsResponse> {
  const response = await apiClient.post(`${AGENTS_BASE}/calculate-weights`, {
    projects_backlogs_id: projectsBacklogsId,
  });
  return response.data;
}

/** Apply reviewed weights to subtasks */
export async function applyWeights(payload: ApplyWeightsPayload): Promise<{ success: boolean; updated: number }> {
  const response = await apiClient.post(`${AGENTS_BASE}/apply-weights`, payload);
  return response.data;
}

// =============================================================================
// Chat Unificado (new)
// =============================================================================

export interface ChatRequest {
  message: string;
  context?: {
    project_id?: number;
    domain?: 'executive' | 'safety' | 'planning' | 'workforce' | 'quality' | 'schedule_manager' | 'general';
  };
}

export interface ChatResponse {
  response: string;
  domain: string;
  confidence: number;
  metadata: {
    agent: string;
    processing_time_ms: number;
  };
}

/** Send a chat message to the AI agent router */
export async function sendChatMessage(input: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post(`${AGENTS_BASE}/chat`, input);
  return response.data;
}

// =============================================================================
// Schedule Manager Agent
// =============================================================================

export interface RCCMetadata {
  spi: number | null;
  status: 'verde' | 'amarelo' | 'vermelho';
  risk_level: 'baixo' | 'medio' | 'alto' | 'critico';
  total_tasks: number;
  completed_tasks: number;
  delayed_tasks: number;
  failed_tasks: number;
  idle_workers: number;
  generated_at: string;
}

export interface ChartDataItem {
  name: string;
  value?: number;
  color?: string;
  [key: string]: any;
}

export interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'stacked_bar';
  title: string;
  data: ChartDataItem[];
  xKey?: string;
  yKey?: string;
  bars?: { key: string; color: string; name: string }[];
}

export interface RCCResponse {
  report_markdown: string;
  metadata: RCCMetadata;
  charts?: ChartConfig[];
}

export interface AnalysisResponse {
  data: any;
  insights: string;
  charts?: ChartConfig[];
}

export type AnalysisType =
  | 'productivity'
  | 'workforce'
  | 'weather'
  | 'failed_tasks'
  | 'area_progress'
  | 'proactive'
  | 'overview';

/** Generate RCC (Critical Schedule Report) */
export async function generateRCC(projectId: number): Promise<RCCResponse> {
  const response = await apiClient.post(`${AGENTS_BASE}/schedule-manager/rcc`, {
    project_id: projectId,
  });
  return response.data;
}

/** Run a specific schedule analysis */
export async function getScheduleAnalysis(
  projectId: number,
  analysisType: AnalysisType
): Promise<AnalysisResponse> {
  const response = await apiClient.post(`${AGENTS_BASE}/schedule-manager/analysis`, {
    project_id: projectId,
    analysis_type: analysisType,
  });
  return response.data;
}
