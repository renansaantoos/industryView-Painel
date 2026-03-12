// =============================================================================
// INDUSTRYVIEW BACKEND - Schedule Manager Agent Service
// Orquestrador do agente gerente de cronograma
// Classificacao de intent, chamadas IA em paralelo, resposta final
// =============================================================================

import { claudeJsonCompletion, claudeTextCompletion } from '../../services/claude-client';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import { ScheduleManagerDataService, type RCCData } from './schedule-manager-data.service';

// =============================================================================
// TYPES
// =============================================================================

export type ScheduleManagerIntent =
  | 'productivity_analysis'
  | 'workforce_analysis'
  | 'weather_impact'
  | 'failed_tasks_analysis'
  | 'area_progress'
  | 'rcc_generation'
  | 'proactive_insights'
  | 'schedule_overview';

interface IntentClassification {
  intent: ScheduleManagerIntent;
  confidence: number;
  reasoning: string;
}

export interface RCCResult {
  report_markdown: string;
  metadata: {
    spi: number | null;
    status: 'verde' | 'amarelo' | 'vermelho';
    risk_level: 'baixo' | 'medio' | 'alto' | 'critico';
    total_tasks: number;
    completed_tasks: number;
    delayed_tasks: number;
    failed_tasks: number;
    idle_workers: number;
    generated_at: string;
  };
  charts?: ChartConfig[];
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

export interface AnalysisResult {
  data: any;
  insights: string;
  charts?: ChartConfig[];
}

// =============================================================================
// PROMPTS
// =============================================================================

const INTENT_PROMPT = `
Voce e um classificador de intencoes para um agente gerente de cronograma em projetos industriais.
Analise a mensagem do usuario e classifique na intencao mais adequada.

## Intencoes

1. **productivity_analysis** - Analise de produtividade, SPI, CPI, planejado vs real
   Exemplos: "como esta a produtividade?", "SPI do projeto", "planejado vs realizado"

2. **workforce_analysis** - Alocacao de pessoal, ociosos, absenteismo, escalas
   Exemplos: "quem esta ocioso?", "efetivo alocado", "falta de pessoal"

3. **weather_impact** - Correlacao clima e produtividade
   Exemplos: "impacto da chuva", "clima afetou a producao?", "tempo e produtividade"

4. **failed_tasks_analysis** - Tarefas sem sucesso, motivos de nao execucao
   Exemplos: "tarefas sem sucesso", "por que nao executaram?", "motivos de falha"

5. **area_progress** - Progresso por campo, secao ou area fisica
   Exemplos: "como esta o campo 2?", "area mais atrasada", "progresso por campo"

6. **rcc_generation** - Relatorio critico completo (RCC)
   Exemplos: "gere um RCC", "relatorio critico", "relatorio de cronograma completo"

7. **proactive_insights** - Sugestoes, gargalos, riscos, o que priorizar
   Exemplos: "quais os riscos?", "sugestoes de melhoria", "o que priorizar?"

8. **schedule_overview** - Visao geral do cronograma (fallback)
   Exemplos: "como esta o cronograma?", "resumo do projeto", "status geral"

## Resposta
Retorne JSON com:
- intent: string (uma das intencoes acima)
- confidence: number (0 a 1)
- reasoning: string (1 frase em portugues)
`;

const ANALYSIS_PROMPT = `
Voce e um especialista em gestao de projetos industriais, analise de cronograma e produtividade.
Analise os dados fornecidos e gere insights claros, objetivos e acionaveis em Markdown.

Regras:
- Use tabelas Markdown quando houver dados tabulares
- Formate datas no padrao brasileiro (DD/MM/YYYY)
- Destaque problemas em **negrito**
- Sugira acoes concretas quando identificar problemas
- Seja conciso mas completo
- Use emojis com moderacao para indicar status
- NUNCA gere graficos ASCII, histogramas de texto, barras de caracteres ou qualquer representacao visual em texto. O frontend renderiza graficos reais automaticamente a partir dos dados estruturados.
- Foque em analise textual, tabelas e recomendacoes. Os graficos sao gerados separadamente.
`;

const RCC_SUB_ANALYSIS_PROMPT = `
Voce e um analista de projetos industriais. Analise os dados e retorne um resumo estruturado
com os insights mais importantes. Seja objetivo e focado em dados quantitativos.
NUNCA gere graficos ASCII, histogramas de texto ou barras de caracteres. Use apenas texto e tabelas Markdown.
`;

const RCC_SYNTHESIS_PROMPT = `
Voce e o gerente de projeto virtual do IndustryView. Gere um Relatorio de Cronograma Critico (RCC)
completo e profissional em Markdown.

O relatorio deve seguir esta estrutura:

## 1. Resumo Executivo
Status geral (Verde / Amarelo / Vermelho), SPI, principais riscos.

## 2. Analise do Caminho Critico
Tarefas criticas, folgas zero, impacto de atrasos.

## 3. Analise de Produtividade
Por area e equipe, planejado vs real, tendencias.

## 4. Impacto Climatico
Correlacao clima-produtividade, dias perdidos por clima, previsao para proximos dias e risco de impacto no cronograma.

## 5. Tarefas Sem Sucesso
Quantidade, categorias, padroes recorrentes.

## 6. Forca de Trabalho
Alocacao vs necessidade, ociosidade, absenteismo.

## 7. Plano de Recuperacao
Acoes concretas, prioridades, realocacao de recursos.

## 8. Projecoes
Cenarios otimista/realista/pessimista, nova data estimada.

Regras:
- Use tabelas Markdown para dados comparativos
- Formate datas como DD/MM/YYYY
- Seja objetivo e baseado em dados
- Cada secao deve ter insights acionaveis
- NUNCA gere graficos ASCII, histogramas de texto, barras de caracteres ou representacoes visuais em texto
- Os graficos sao renderizados automaticamente pelo frontend a partir dos dados estruturados
`;

// =============================================================================
// SERVICE
// =============================================================================

export class ScheduleManagerAgentService {
  // ===========================================================================
  // MAIN PROCESS (for chat integration)
  // ===========================================================================

  static async process(message: string, projectId?: number): Promise<string> {
    try {
      if (!projectId) {
        return 'Para utilizar o Gerente de Cronograma, e necessario selecionar um projeto. Por favor, selecione um projeto no contexto da conversa.';
      }

      const intent = await this.classifyIntent(message);
      logger.info({ intent, projectId }, 'ScheduleManager intent classified');

      switch (intent.intent) {
        case 'productivity_analysis': {
          const result = await this.analyzeProductivity(projectId, message);
          return result.insights;
        }
        case 'workforce_analysis': {
          const result = await this.analyzeWorkforce(projectId, message);
          return result.insights;
        }
        case 'weather_impact': {
          const result = await this.analyzeWeatherImpact(projectId, message);
          return result.insights;
        }
        case 'failed_tasks_analysis': {
          const result = await this.analyzeFailedTasks(projectId, message);
          return result.insights;
        }
        case 'area_progress': {
          const result = await this.analyzeAreaProgress(projectId, message);
          return result.insights;
        }
        case 'rcc_generation': {
          const rcc = await this.generateRCC(projectId);
          return rcc.report_markdown;
        }
        case 'proactive_insights': {
          const result = await this.analyzeProactiveInsights(projectId, message);
          return result.insights;
        }
        default: {
          const result = await this.analyzeScheduleOverview(projectId, message);
          return result.insights;
        }
      }
    } catch (error) {
      logger.error({ error }, 'Erro no ScheduleManagerAgent');
      return 'Desculpe, ocorreu um erro ao processar sua solicitacao sobre o cronograma. Tente novamente.';
    }
  }

  // ===========================================================================
  // INTENT CLASSIFICATION
  // ===========================================================================

  static async classifyIntent(message: string): Promise<IntentClassification> {
    try {
      const result = await claudeJsonCompletion<IntentClassification>({
        system: INTENT_PROMPT,
        userMessage: message,
        temperature: 0.1,
        maxTokens: 200,
        model: config.claude.routerModel,
      });

      return {
        intent: result.intent || 'schedule_overview',
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || '',
      };
    } catch (error) {
      logger.error({ error }, 'Erro na classificacao de intent do ScheduleManager');
      return { intent: 'schedule_overview', confidence: 0, reasoning: 'Fallback' };
    }
  }

  // ===========================================================================
  // INDIVIDUAL ANALYSIS HANDLERS
  // ===========================================================================

  static async analyzeProductivity(projectId: number, message: string): Promise<AnalysisResult> {
    const data = await ScheduleManagerDataService.collectProductivityData(projectId);
    const insights = await claudeTextCompletion({
      system: ANALYSIS_PROMPT,
      userMessage: `Pergunta do usuario: "${message}"\n\nDados de produtividade do projeto:\n${JSON.stringify(data, null, 2)}`,
      temperature: 0.6,
    });

    const charts = this.extractProductivityCharts(data);
    return { data, insights, charts };
  }

  static async analyzeWorkforce(projectId: number, message: string): Promise<AnalysisResult> {
    const data = await ScheduleManagerDataService.collectWorkforceData(projectId);
    const insights = await claudeTextCompletion({
      system: ANALYSIS_PROMPT,
      userMessage: `Pergunta do usuario: "${message}"\n\nDados de forca de trabalho:\n${JSON.stringify(data, null, 2)}`,
      temperature: 0.6,
    });

    const charts = this.extractWorkforceCharts(data);
    return { data, insights, charts };
  }

  static async analyzeWeatherImpact(projectId: number, message: string): Promise<AnalysisResult> {
    const data = await ScheduleManagerDataService.collectWeatherData(projectId);

    let forecastSection = '';
    if (data.forecast) {
      forecastSection = `\n\nPrevisao do tempo (proximos 5 dias):\n${JSON.stringify(data.forecast.daily_summary, null, 2)}`;
      if (data.forecast.risk_analysis) {
        forecastSection += `\n\nAnalise de risco meteorologico:\n${JSON.stringify(data.forecast.risk_analysis, null, 2)}`;
      }
    }

    const insights = await claudeTextCompletion({
      system: ANALYSIS_PROMPT + `\n\nIMPORTANTE: Se houver dados de previsao meteorologica, analise o impacto previsto nos proximos dias sobre o cronograma e tarefas criticas. Sugira replanejamento para dias de risco alto/critico.`,
      userMessage: `Pergunta do usuario: "${message}"\n\nDados historicos de clima e correlacao com produtividade:\n${JSON.stringify({ daily_reports: data.daily_reports, weather_productivity_correlation: data.weather_productivity_correlation }, null, 2)}${forecastSection}`,
      temperature: 0.6,
    });

    const charts = this.extractWeatherCharts(data);
    return { data, insights, charts };
  }

  static async analyzeFailedTasks(projectId: number, message: string): Promise<AnalysisResult> {
    const data = await ScheduleManagerDataService.collectFailedTasksData(projectId);
    const insights = await claudeTextCompletion({
      system: ANALYSIS_PROMPT,
      userMessage: `Pergunta do usuario: "${message}"\n\nDados de tarefas sem sucesso:\n${JSON.stringify(data, null, 2)}`,
      temperature: 0.6,
    });

    const charts = this.extractFailedTasksCharts(data);
    return { data, insights, charts };
  }

  static async analyzeAreaProgress(projectId: number, message: string): Promise<AnalysisResult> {
    const data = await ScheduleManagerDataService.collectAreaProgressData(projectId);
    const insights = await claudeTextCompletion({
      system: ANALYSIS_PROMPT,
      userMessage: `Pergunta do usuario: "${message}"\n\nDados de progresso por area:\n${JSON.stringify(data, null, 2)}`,
      temperature: 0.6,
    });

    const charts = this.extractAreaProgressCharts(data);
    return { data, insights, charts };
  }

  static async analyzeProactiveInsights(projectId: number, message: string): Promise<AnalysisResult> {
    const [proactive, health] = await Promise.all([
      ScheduleManagerDataService.collectProactiveInsights(projectId),
      (async () => {
        try {
          const { PlanningService } = await import('../planning/planning.service');
          return PlanningService.getScheduleHealth(projectId);
        } catch { return null; }
      })(),
    ]);

    const insights = await claudeTextCompletion({
      system: ANALYSIS_PROMPT,
      userMessage: `Pergunta do usuario: "${message}"\n\nInsights proativos:\n${JSON.stringify(proactive, null, 2)}\n\nSaude do cronograma:\n${JSON.stringify(health, null, 2)}`,
      temperature: 0.7,
    });
    return { data: { proactive, health }, insights };
  }

  static async analyzeScheduleOverview(projectId: number, message: string): Promise<AnalysisResult> {
    const { PlanningService } = await import('../planning/planning.service');
    const [health, criticalPath] = await Promise.all([
      PlanningService.getScheduleHealth(projectId),
      PlanningService.getCriticalPath(projectId),
    ]);

    const insights = await claudeTextCompletion({
      system: ANALYSIS_PROMPT,
      userMessage: `Pergunta do usuario: "${message}"\n\nSaude do cronograma:\n${JSON.stringify(health, null, 2)}\n\nCaminho critico:\n${JSON.stringify(criticalPath, null, 2)}`,
      temperature: 0.7,
    });
    return { data: { health, criticalPath }, insights };
  }

  // ===========================================================================
  // SPECIFIC ANALYSIS (for direct endpoint)
  // ===========================================================================

  static async runAnalysis(projectId: number, analysisType: string): Promise<AnalysisResult> {
    switch (analysisType) {
      case 'productivity':
        return this.analyzeProductivity(projectId, 'Analise completa de produtividade');
      case 'workforce':
        return this.analyzeWorkforce(projectId, 'Analise completa da forca de trabalho');
      case 'weather':
        return this.analyzeWeatherImpact(projectId, 'Analise completa do impacto climatico');
      case 'failed_tasks':
        return this.analyzeFailedTasks(projectId, 'Analise completa de tarefas sem sucesso');
      case 'area_progress':
        return this.analyzeAreaProgress(projectId, 'Analise completa de progresso por area');
      case 'proactive':
        return this.analyzeProactiveInsights(projectId, 'Quais os riscos e sugestoes?');
      default:
        return this.analyzeScheduleOverview(projectId, 'Visao geral do cronograma');
    }
  }

  // ===========================================================================
  // RCC GENERATION (2-phase approach)
  // ===========================================================================

  static async generateRCC(projectId: number): Promise<RCCResult> {
    const startTime = Date.now();

    const rccData = await ScheduleManagerDataService.collectRCCData(projectId);

    // Phase 1: Parallel sub-analyses
    const [
      productivityAnalysis,
      workforceAnalysis,
      weatherFailedAnalysis,
      criticalPathAnalysis,
    ] = await Promise.all([
      this.rccSubAnalysis('productivity_areas', rccData),
      this.rccSubAnalysis('workforce', rccData),
      this.rccSubAnalysis('weather_failed', rccData),
      this.rccSubAnalysis('critical_health', rccData),
    ]);

    // Phase 2: Synthesis
    const report = await claudeTextCompletion({
      system: RCC_SYNTHESIS_PROMPT,
      userMessage: `Gere o Relatorio de Cronograma Critico (RCC) completo baseado nas analises abaixo.

## Analise de Produtividade e Areas
${productivityAnalysis}

## Analise da Forca de Trabalho
${workforceAnalysis}

## Analise de Clima e Tarefas Sem Sucesso
${weatherFailedAnalysis}

## Analise do Caminho Critico e Saude
${criticalPathAnalysis}

## Dados Brutos de Referencia
- SPI: ${rccData.schedule_health?.spi ?? 'N/A'}
- Total de tarefas: ${rccData.schedule_health?.total_tasks ?? 0}
- Tarefas concluidas: ${rccData.schedule_health?.completed_tasks ?? 0}
- Tarefas atrasadas: ${rccData.schedule_health?.delayed ?? 0}
- Tarefas sem sucesso: ${rccData.failed_tasks.total_failed}
- Trabalhadores ociosos: ${rccData.workforce.idle_workers.length}
- Marcos em risco: ${rccData.proactive.at_risk_milestones.length}
`,
      temperature: 0.9,
      maxTokens: 4000,
    });

    const spi = rccData.schedule_health?.spi ?? null;
    const delayed = rccData.schedule_health?.delayed ?? 0;
    const totalTasks = rccData.schedule_health?.total_tasks ?? 0;
    const delayedRatio = totalTasks > 0 ? delayed / totalTasks : 0;

    let status: 'verde' | 'amarelo' | 'vermelho' = 'verde';
    if (spi !== null && spi < 0.8) status = 'vermelho';
    else if (spi !== null && spi < 0.95) status = 'amarelo';
    else if (delayedRatio > 0.3) status = 'vermelho';
    else if (delayedRatio > 0.15) status = 'amarelo';

    let riskLevel: 'baixo' | 'medio' | 'alto' | 'critico' = 'baixo';
    if (status === 'vermelho' && rccData.proactive.at_risk_milestones.length > 3) riskLevel = 'critico';
    else if (status === 'vermelho') riskLevel = 'alto';
    else if (status === 'amarelo') riskLevel = 'medio';

    const processingTime = Date.now() - startTime;
    logger.info({ projectId, processingTime, spi, status, riskLevel }, 'RCC generated');

    // Extract charts from all RCC data
    const charts: ChartConfig[] = [
      ...this.extractProductivityCharts(rccData.productivity),
      ...this.extractWorkforceCharts(rccData.workforce),
      ...this.extractWeatherCharts(rccData.weather),
      ...this.extractFailedTasksCharts(rccData.failed_tasks),
      ...this.extractAreaProgressCharts(rccData.area_progress),
    ];

    return {
      report_markdown: report,
      metadata: {
        spi,
        status,
        risk_level: riskLevel,
        total_tasks: totalTasks,
        completed_tasks: rccData.schedule_health?.completed_tasks ?? 0,
        delayed_tasks: delayed,
        failed_tasks: rccData.failed_tasks.total_failed,
        idle_workers: rccData.workforce.idle_workers.length,
        generated_at: new Date().toISOString(),
      },
      charts,
    };
  }

  // ===========================================================================
  // RCC SUB-ANALYSIS (Phase 1 helper)
  // ===========================================================================

  private static async rccSubAnalysis(
    type: 'productivity_areas' | 'workforce' | 'weather_failed' | 'critical_health',
    data: RCCData
  ): Promise<string> {
    let userMessage = '';

    switch (type) {
      case 'productivity_areas':
        userMessage = `Analise os dados de produtividade e progresso por area.
Retorne um resumo estruturado com:
- SPI e tendencia de produtividade
- Areas mais atrasadas e mais adiantadas
- Comparativo planejado vs real por area
- Gargalos identificados

Dados de produtividade (resumo):
${JSON.stringify({
  backlogs_summary: {
    total: data.productivity.backlogs.length,
    avg_completion: data.productivity.backlogs.length > 0
      ? Math.round(data.productivity.backlogs.reduce((s, b) => s + b.percent_complete, 0) / data.productivity.backlogs.length * 100) / 100
      : 0,
    delayed: data.productivity.backlogs.filter(b => b.planned_end_date && b.planned_end_date < new Date().toISOString().split('T')[0] && b.percent_complete < 100).length,
  },
  sprint_tasks_summary: {
    total: data.productivity.sprint_tasks.length,
    by_status: data.productivity.sprint_tasks.reduce((acc, t) => {
      const s = t.status || 'Sem status';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  },
  daily_activities: data.productivity.daily_activities.slice(0, 15),
}, null, 2)}

Dados de area:
${JSON.stringify(data.area_progress, null, 2)}`;
        break;

      case 'workforce':
        userMessage = `Analise os dados de forca de trabalho.
Retorne um resumo estruturado com:
- Efetivo total vs presente (media dos ultimos 30 dias)
- Equipes com sobrecarga ou ociosidade
- Trabalhadores ociosos e motivos
- Horas extras vs normais

Dados:
${JSON.stringify(data.workforce, null, 2)}`;
        break;

      case 'weather_failed':
        userMessage = `Analise os dados climaticos e tarefas sem sucesso.
Retorne um resumo estruturado com:
- Dias com chuva e impacto na produtividade
- Correlacao clima-produtividade
- Tarefas sem sucesso por categoria
- Padroes recorrentes de falha
${data.weather.forecast ? '- PREVISAO: Risco meteorologico para os proximos dias e impacto esperado no cronograma\n- PREVISAO: Dias criticos e recomendacoes de replanejamento' : ''}

Dados historicos de clima:
${JSON.stringify({ daily_reports: data.weather.daily_reports, weather_productivity_correlation: data.weather.weather_productivity_correlation }, null, 2)}
${data.weather.forecast ? `\nPrevisao do tempo (proximos 5 dias):\n${JSON.stringify(data.weather.forecast.daily_summary, null, 2)}\n\nAnalise de risco:\n${JSON.stringify(data.weather.forecast.risk_analysis, null, 2)}` : ''}

Dados de tarefas sem sucesso:
${JSON.stringify(data.failed_tasks, null, 2)}`;
        break;

      case 'critical_health':
        userMessage = `Analise os dados do caminho critico e saude do cronograma.
Retorne um resumo estruturado com:
- Status geral do cronograma
- Tarefas no caminho critico
- Predecessores atrasados e impacto
- Marcos em risco
- Projecao de conclusao

Saude do cronograma:
${JSON.stringify(data.schedule_health, null, 2)}

Caminho critico:
${JSON.stringify(data.critical_path, null, 2)}

Insights proativos:
${JSON.stringify(data.proactive, null, 2)}`;
        break;
    }

    try {
      return await claudeTextCompletion({
        system: RCC_SUB_ANALYSIS_PROMPT,
        userMessage,
        temperature: 0.6,
        maxTokens: 1500,
      });
    } catch (error) {
      logger.error({ error, type }, 'Erro na sub-analise RCC');
      return `Erro ao gerar analise de ${type}`;
    }
  }

  // ===========================================================================
  // CHART DATA EXTRACTION HELPERS
  // ===========================================================================

  private static extractProductivityCharts(data: any): ChartConfig[] {
    const charts: ChartConfig[] = [];

    // Status distribution from sprint tasks
    if (data.sprint_tasks?.length > 0) {
      const statusCount: Record<string, number> = {};
      for (const t of data.sprint_tasks) {
        const s = t.status || 'Sem status';
        statusCount[s] = (statusCount[s] || 0) + 1;
      }
      const statusColors: Record<string, string> = {
        'Concluída': '#10B981', 'Concluida': '#10B981', 'Sucesso': '#10B981',
        'Em Andamento': '#3B82F6', 'Em andamento': '#3B82F6',
        'Não Iniciada': '#94A3B8', 'Nao Iniciada': '#94A3B8', 'Pendente': '#94A3B8',
        'Sem Sucesso': '#EF4444', 'Atrasada': '#EF4444',
      };
      charts.push({
        type: 'bar',
        title: 'Distribuicao de Status das Tarefas',
        data: Object.entries(statusCount).map(([name, value]) => ({
          name,
          value,
          color: statusColors[name] || '#6366F1',
        })),
      });
    }

    // Daily activities trend
    if (data.daily_activities?.length > 0) {
      charts.push({
        type: 'line',
        title: 'Atividades Diarias (Ultimos 30 dias)',
        data: [...data.daily_activities].reverse().map((a: any) => ({
          name: a.date?.split('-').reverse().slice(0, 2).join('/') || a.date,
          value: a.total_activities,
          quantidade: a.total_quantity_done,
        })),
        xKey: 'name',
        yKey: 'value',
        bars: [
          { key: 'value', color: '#3B82F6', name: 'Atividades' },
          { key: 'quantidade', color: '#10B981', name: 'Quantidade' },
        ],
      });
    }

    // Backlog completion
    if (data.backlogs?.length > 0) {
      const completed = data.backlogs.filter((b: any) => b.percent_complete >= 100).length;
      const inProgress = data.backlogs.filter((b: any) => b.percent_complete > 0 && b.percent_complete < 100).length;
      const notStarted = data.backlogs.filter((b: any) => b.percent_complete === 0).length;
      charts.push({
        type: 'pie',
        title: 'Status do Backlog',
        data: [
          { name: 'Concluidas', value: completed, color: '#10B981' },
          { name: 'Em Andamento', value: inProgress, color: '#3B82F6' },
          { name: 'Nao Iniciadas', value: notStarted, color: '#94A3B8' },
        ].filter(d => d.value > 0),
      });
    }

    return charts;
  }

  private static extractWorkforceCharts(data: any): ChartConfig[] {
    const charts: ChartConfig[] = [];

    // Teams headcount
    if (data.teams_headcount?.length > 0) {
      charts.push({
        type: 'bar',
        title: 'Efetivo por Equipe',
        data: data.teams_headcount.map((t: any) => ({
          name: t.team_name || `Equipe ${t.team_id}`,
          value: t.total_members,
          color: '#3B82F6',
        })),
      });
    }

    // Daily presence/absence trend
    if (data.daily_logs?.length > 0) {
      charts.push({
        type: 'stacked_bar',
        title: 'Presenca vs Ausencia (Ultimos 30 dias)',
        data: [...data.daily_logs].reverse().slice(0, 15).map((l: any) => ({
          name: l.log_date?.split('-').reverse().slice(0, 2).join('/') || l.log_date,
          presentes: l.total_present,
          ausentes: l.total_absent,
        })),
        bars: [
          { key: 'presentes', color: '#10B981', name: 'Presentes' },
          { key: 'ausentes', color: '#EF4444', name: 'Ausentes' },
        ],
      });
    }

    return charts;
  }

  private static extractWeatherCharts(data: any): ChartConfig[] {
    const charts: ChartConfig[] = [];

    // Weather productivity correlation
    if (data.weather_productivity_correlation?.length > 0) {
      charts.push({
        type: 'bar',
        title: 'Produtividade por Condicao Climatica',
        data: data.weather_productivity_correlation.map((c: any) => ({
          name: c.weather_condition,
          value: Math.round(c.avg_activities * 100) / 100,
          dias: c.days_count,
          color: c.weather_condition?.toLowerCase().includes('chuva') ? '#6366F1' :
                 c.weather_condition?.toLowerCase().includes('nublado') ? '#94A3B8' : '#F59E0B',
        })),
      });
    }

    // Forecast risk (next 5 days)
    if (data.forecast?.daily_summary?.length > 0) {
      const riskValue: Record<string, number> = { baixo: 1, medio: 2, alto: 3, critico: 4 };
      charts.push({
        type: 'bar',
        title: 'Risco Meteorologico (Proximos Dias)',
        data: data.forecast.daily_summary.map((d: any) => ({
          name: d.date?.split('-').reverse().slice(0, 2).join('/') || d.date,
          value: riskValue[d.work_risk] || 0,
          risco: d.work_risk,
          chuva: d.rain_total,
          temp_max: d.temp_max,
          color: d.work_risk === 'critico' ? '#EF4444' :
                 d.work_risk === 'alto' ? '#F59E0B' :
                 d.work_risk === 'medio' ? '#FBBF24' : '#10B981',
        })),
      });
    }

    return charts;
  }

  private static extractFailedTasksCharts(data: any): ChartConfig[] {
    const charts: ChartConfig[] = [];

    // By category
    if (data.by_category && Object.keys(data.by_category).length > 0) {
      const colors = ['#EF4444', '#F59E0B', '#6366F1', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];
      charts.push({
        type: 'pie',
        title: 'Tarefas Sem Sucesso por Categoria',
        data: Object.entries(data.by_category).map(([name, value], i) => ({
          name,
          value: value as number,
          color: colors[i % colors.length],
        })),
      });
    }

    // Success rate
    if (data.total_tasks_period > 0) {
      const successCount = data.total_tasks_period - data.total_failed;
      charts.push({
        type: 'pie',
        title: 'Taxa de Sucesso das Tarefas',
        data: [
          { name: 'Sucesso', value: successCount, color: '#10B981' },
          { name: 'Sem Sucesso', value: data.total_failed, color: '#EF4444' },
        ],
      });
    }

    return charts;
  }

  private static extractAreaProgressCharts(data: any): ChartConfig[] {
    const charts: ChartConfig[] = [];

    if (data.backlog_by_area?.length > 0) {
      charts.push({
        type: 'bar',
        title: 'Progresso Medio por Area',
        data: data.backlog_by_area.map((b: any) => ({
          name: b.field_name || 'Sem area',
          value: Math.round(b.avg_percent_complete * 100) / 100,
          atrasadas: b.total_delayed,
          total: b.total_backlogs,
          color: b.avg_percent_complete >= 80 ? '#10B981' :
                 b.avg_percent_complete >= 50 ? '#F59E0B' : '#EF4444',
        })),
      });
    }

    if (data.fields?.length > 0) {
      charts.push({
        type: 'stacked_bar',
        title: 'Instalacao por Campo',
        data: data.fields.map((f: any) => ({
          name: f.field_name || `Campo ${f.field_id}`,
          instalados: f.installed_trackers,
          pendentes: f.total_trackers - f.installed_trackers,
        })),
        bars: [
          { key: 'instalados', color: '#10B981', name: 'Instalados' },
          { key: 'pendentes', color: '#94A3B8', name: 'Pendentes' },
        ],
      });
    }

    return charts;
  }
}

export default ScheduleManagerAgentService;
