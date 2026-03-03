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
    domain?: 'executive' | 'safety' | 'planning' | 'workforce' | 'quality' | 'general';
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
