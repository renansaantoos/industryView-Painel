// =============================================================================
// INDUSTRYVIEW BACKEND - Weight Calculator Agent Service
// Agente de IA para calculo de pesos de subtasks
// Usa Anthropic Claude para analisar tarefas e atribuir pesos relativos
// =============================================================================

import { claudeJsonCompletion } from '../../services/claude-client';
import { logger } from '../../utils/logger';

const WEIGHT_CALCULATOR_SYSTEM_PROMPT = `
Voce e um especialista em planejamento de obras e construcao civil/industrial.
Analise as tarefas abaixo de um item do cronograma e atribua pesos relativos
que reflitam o ESFORCO e IMPACTO de cada tarefa no progresso total do item.

Criterios para definir pesos:
- Quantidade de trabalho (quantity x complexidade)
- Tipo de disciplina (instalacao eletrica vs pintura, por exemplo)
- Unidade de medida (metros lineares vs unidades)
- Complexidade tecnica (baseada na descricao)
- Impacto no cronograma geral

Regras:
- Pesos devem ser numeros decimais entre 0 e 1
- A SOMA de todos os pesos deve ser EXATAMENTE 1 (100%)
- Tarefas mais impactantes recebem pesos maiores
- Retorne EXCLUSIVAMENTE um JSON com a chave "weights" contendo um array de objetos
- Cada objeto deve ter: subtask_id (number), weight (number), justification (string em portugues)
- A justificativa deve ser breve (1-2 frases)

Exemplo de resposta (3 tarefas, soma = 1):
{
  "weights": [
    { "subtask_id": 1, "weight": 0.50, "justification": "Instalacao de tubing envolve alta complexidade tecnica e grande volume." },
    { "subtask_id": 2, "weight": 0.30, "justification": "Pintura e tarefa de menor complexidade, porem com area significativa." },
    { "subtask_id": 3, "weight": 0.20, "justification": "Teste funcional e simples mas necessario para entrega." }
  ]
}
`;

export interface SubtaskInput {
  id: number;
  description: string;
  quantity: number | null;
  unity: string | null;
  discipline: string | null;
}

export interface WeightResult {
  subtask_id: number;
  weight: number;
  justification: string;
}

/**
 * WeightCalculatorAgentService - Agente de IA para calculo de pesos
 */
export class WeightCalculatorAgentService {
  /**
   * Calcula pesos para uma lista de subtasks usando IA
   */
  static async calculateWeights(subtasks: SubtaskInput[]): Promise<WeightResult[]> {
    try {
      const userMessage = subtasks
        .map(
          (s) =>
            `- ID: ${s.id} | Descricao: ${s.description || 'Sem descricao'} | Quantidade: ${s.quantity ?? 'N/A'} | Unidade: ${s.unity || 'N/A'} | Disciplina: ${s.discipline || 'N/A'}`
        )
        .join('\n');

      const parsed = await claudeJsonCompletion<{ weights: WeightResult[] }>({
        system: WEIGHT_CALCULATOR_SYSTEM_PROMPT,
        userMessage: `Analise as seguintes tarefas e atribua pesos:\n\n${userMessage}`,
        temperature: 0.4,
      });

      const weights: WeightResult[] = parsed.weights || [];

      // Valida que todos os IDs retornados existem nas subtasks originais
      const validIds = new Set(subtasks.map((s) => s.id));
      return weights.filter((w) => validIds.has(w.subtask_id) && w.weight >= 0 && w.weight <= 1);
    } catch (error) {
      logger.error({ error }, 'Erro no WeightCalculatorAgent');
      throw error;
    }
  }
}

export default WeightCalculatorAgentService;
