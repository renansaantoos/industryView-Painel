// =============================================================================
// INDUSTRYVIEW BACKEND - Planning Service
// Service do modulo de planning
// Cobre: company_modules, schedule_baselines, task_dependencies, gantt, backlog_planning
//
// NOTA: As tabelas company_modules, schedule_baselines e task_dependencies nao
// estavam no Prisma Client gerado originalmente. Por isso usamos $queryRaw /
// $executeRaw para essas tabelas. A tabela projects_backlogs ja esta no client
// e e acessada via ORM normalmente.
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import {
  UpsertCompanyModuleInput,
  CreateBaselineInput,
  CreateDependencyInput,
  UpdateBacklogPlanningInput,
  BulkBacklogPlanningItem,
} from './planning.schema';

// =============================================================================
// TIPOS INTERNOS
// =============================================================================

interface CompanyModuleRow {
  id: bigint;
  company_id: bigint;
  module_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface BaselineRow {
  id: bigint;
  projects_id: bigint;
  sprints_id: bigint | null;
  baseline_number: number;
  description: string | null;
  status: string;
  snapshot_data: any;
  created_by: bigint | null;
  created_by_name: string | null;
  created_by_email: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface DependencyRow {
  id: bigint;
  projects_id: bigint;
  predecessor_backlog_id: bigint;
  successor_backlog_id: bigint;
  dependency_type: string;
  lag_days: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  predecessor_description: string | null;
  predecessor_wbs_code: string | null;
  successor_description: string | null;
  successor_wbs_code: string | null;
}

interface GanttItem {
  id: number;
  description: string | null;
  wbs_code: string | null;
  level: number | null;
  sort_order: number | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  percent_complete: number | null;
  planned_duration_days: number | null;
  planned_cost: number | null;
  actual_cost: number | null;
  is_milestone: boolean;
  dependencies: DependencyRef[];
}

interface DependencyRef {
  id: number;
  predecessor_backlog_id: number;
  dependency_type: string;
  lag_days: number;
}

interface CurveSPoint {
  date: string;
  planned_cumulative: number;
  actual_cumulative: number;
  planned_percent: number;
  actual_percent: number;
}

interface BacklogSnapshot {
  id: number;
  description: string | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  planned_duration_days: number | null;
  planned_cost: number | null;
  actual_cost: number | null;
  percent_complete: number | null;
  quantity: number | null;
  quantity_done: number | null;
  wbs_code: string | null;
  sort_order: number | null;
  level: number | null;
}

/**
 * Serializa BigInt e Decimal para tipos primitivos JSON-safe
 */
function serializeRow(row: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(row)) {
    const val = row[key];
    if (typeof val === 'bigint') {
      result[key] = Number(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * PlanningService - Service do modulo de planning
 */
export class PlanningService {
  // =============================================================================
  // COMPANY MODULES
  // =============================================================================

  /**
   * Lista todos os modulos da empresa com seu status
   */
  static async listCompanyModules(companyId: number) {
    const rows = await db.$queryRaw<CompanyModuleRow[]>`
      SELECT
        id, company_id, module_name, is_active,
        created_at, updated_at, deleted_at
      FROM company_modules
      WHERE company_id = ${BigInt(companyId)}
        AND deleted_at IS NULL
      ORDER BY module_name ASC
    `;

    return rows.map(serializeRow);
  }

  /**
   * Ativa ou desativa um modulo da empresa (upsert)
   */
  static async updateCompanyModule(input: UpsertCompanyModuleInput) {
    const existing = await db.$queryRaw<Pick<CompanyModuleRow, 'id'>[]>`
      SELECT id FROM company_modules
      WHERE company_id = ${BigInt(input.company_id)}
        AND module_name = ${input.module_name}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const now = new Date();

    if (existing.length > 0) {
      await db.$executeRaw`
        UPDATE company_modules
        SET is_active = ${input.is_active}, updated_at = ${now}
        WHERE id = ${existing[0].id}
      `;
    } else {
      await db.$executeRaw`
        INSERT INTO company_modules (company_id, module_name, is_active, created_at, updated_at, deleted_at)
        VALUES (${BigInt(input.company_id)}, ${input.module_name}, ${input.is_active}, ${now}, ${now}, NULL)
      `;
    }

    const result = await db.$queryRaw<CompanyModuleRow[]>`
      SELECT id, company_id, module_name, is_active, created_at, updated_at, deleted_at
      FROM company_modules
      WHERE company_id = ${BigInt(input.company_id)}
        AND module_name = ${input.module_name}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    return result.length > 0 ? serializeRow(result[0]) : null;
  }

  /**
   * Verifica se um modulo esta ativo para uma empresa
   * Retorna true por padrao se o modulo nao foi configurado ainda
   */
  static async isModuleActive(companyId: number, moduleName: string): Promise<boolean> {
    const rows = await db.$queryRaw<Pick<CompanyModuleRow, 'is_active'>[]>`
      SELECT is_active FROM company_modules
      WHERE company_id = ${BigInt(companyId)}
        AND module_name = ${moduleName}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    // Se nao existe configuracao, considera ativo por padrao
    if (rows.length === 0) {
      return true;
    }

    return rows[0].is_active;
  }

  // =============================================================================
  // SCHEDULE BASELINES
  // =============================================================================

  /**
   * Lista todos os baselines de um projeto, ordenados pelo numero descrescente
   */
  static async listBaselines(projectsId: number) {
    const rows = await db.$queryRaw<BaselineRow[]>`
      SELECT
        sb.id, sb.projects_id, sb.sprints_id, sb.baseline_number,
        sb.description, sb.status, sb.snapshot_data, sb.created_by,
        sb.created_at, sb.updated_at, sb.deleted_at,
        u.name AS created_by_name, u.email AS created_by_email
      FROM schedule_baselines sb
      LEFT JOIN users u ON u.id = sb.created_by
      WHERE sb.projects_id = ${BigInt(projectsId)}
        AND sb.deleted_at IS NULL
      ORDER BY sb.baseline_number DESC
    `;

    return rows.map(serializeRow);
  }

  /**
   * Busca baseline por ID
   */
  static async getBaselineById(id: number) {
    const rows = await db.$queryRaw<BaselineRow[]>`
      SELECT
        sb.id, sb.projects_id, sb.sprints_id, sb.baseline_number,
        sb.description, sb.status, sb.snapshot_data, sb.created_by,
        sb.created_at, sb.updated_at, sb.deleted_at,
        u.name AS created_by_name, u.email AS created_by_email
      FROM schedule_baselines sb
      LEFT JOIN users u ON u.id = sb.created_by
      WHERE sb.id = ${BigInt(id)}
        AND sb.deleted_at IS NULL
      LIMIT 1
    `;

    if (rows.length === 0) {
      throw new NotFoundError('Baseline nao encontrado.');
    }

    return serializeRow(rows[0]);
  }

  /**
   * Cria um novo baseline do projeto
   * CRITICO: Faz snapshot completo de todos os projects_backlogs com seus campos de planejamento.
   * Define baseline_number = max(existentes) + 1.
   * Baselines anteriores tem status alterado para 'substituido'.
   */
  static async createBaseline(input: CreateBaselineInput, createdByUserId?: number) {
    // Verifica se o projeto existe
    const project = await db.projects.findFirst({
      where: { id: BigInt(input.projects_id), deleted_at: null },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundError('Projeto nao encontrado.');
    }

    // Busca o maior baseline_number atual para o projeto
    const maxRows = await db.$queryRaw<{ max_num: number | null }[]>`
      SELECT COALESCE(MAX(baseline_number), 0) AS max_num
      FROM schedule_baselines
      WHERE projects_id = ${BigInt(input.projects_id)}
        AND deleted_at IS NULL
    `;

    const newBaselineNumber = (maxRows[0]?.max_num || 0) + 1;

    // Faz snapshot de TODOS os backlogs do projeto com campos de planejamento
    // Usa raw SQL pois os campos planned_* ainda nao estao no Prisma Client gerado
    const backlogRows = await db.$queryRaw<{
      id: bigint;
      description: string | null;
      planned_start_date: Date | null;
      planned_end_date: Date | null;
      planned_duration_days: number | null;
      planned_cost: any;
      actual_cost: any;
      percent_complete: any;
      quantity: any;
      quantity_done: any;
      wbs_code: string | null;
      sort_order: number | null;
      level: number | null;
    }[]>`
      SELECT
        id, description,
        planned_start_date, planned_end_date, planned_duration_days,
        planned_cost, actual_cost, percent_complete,
        quantity, quantity_done,
        wbs_code, sort_order, level
      FROM projects_backlogs
      WHERE projects_id = ${BigInt(input.projects_id)}
        AND deleted_at IS NULL
    `;

    // Serializa o snapshot convertendo BigInt e Decimal para primitivos
    const snapshotData: BacklogSnapshot[] = backlogRows.map((b) => ({
      id: Number(b.id),
      description: b.description,
      planned_start_date: b.planned_start_date
        ? b.planned_start_date.toISOString().split('T')[0]
        : null,
      planned_end_date: b.planned_end_date
        ? b.planned_end_date.toISOString().split('T')[0]
        : null,
      planned_duration_days: b.planned_duration_days,
      planned_cost: b.planned_cost ? Number(b.planned_cost) : null,
      actual_cost: b.actual_cost ? Number(b.actual_cost) : null,
      percent_complete: b.percent_complete ? Number(b.percent_complete) : null,
      quantity: b.quantity ? Number(b.quantity) : null,
      quantity_done: b.quantity_done ? Number(b.quantity_done) : null,
      wbs_code: b.wbs_code,
      sort_order: b.sort_order,
      level: b.level,
    }));

    const snapshotJson = JSON.stringify(snapshotData);
    const now = new Date();

    // Executa em transacao: marca baselines existentes como substituidos e cria o novo
    await db.$transaction([
      db.$executeRaw`
        UPDATE schedule_baselines
        SET status = 'substituido', updated_at = ${now}
        WHERE projects_id = ${BigInt(input.projects_id)}
          AND status = 'ativo'
          AND deleted_at IS NULL
      `,
      db.$executeRaw`
        INSERT INTO schedule_baselines
          (projects_id, sprints_id, baseline_number, description, status, snapshot_data, created_by, created_at, updated_at, deleted_at)
        VALUES
          (
            ${BigInt(input.projects_id)},
            ${input.sprints_id ? BigInt(input.sprints_id) : null},
            ${newBaselineNumber},
            ${input.description || null},
            'ativo',
            ${snapshotJson}::jsonb,
            ${createdByUserId ? BigInt(createdByUserId) : null},
            ${now},
            ${now},
            NULL
          )
      `,
    ]);

    // Retorna o baseline criado
    const created = await db.$queryRaw<BaselineRow[]>`
      SELECT
        sb.id, sb.projects_id, sb.sprints_id, sb.baseline_number,
        sb.description, sb.status, sb.snapshot_data, sb.created_by,
        sb.created_at, sb.updated_at, sb.deleted_at,
        u.name AS created_by_name, u.email AS created_by_email
      FROM schedule_baselines sb
      LEFT JOIN users u ON u.id = sb.created_by
      WHERE sb.projects_id = ${BigInt(input.projects_id)}
        AND sb.baseline_number = ${newBaselineNumber}
        AND sb.deleted_at IS NULL
      LIMIT 1
    `;

    return created.length > 0 ? serializeRow(created[0]) : null;
  }

  /**
   * Calcula os dados da Curva S comparando baseline vs progresso real
   * Retorna array de pontos { date, planned_cumulative, actual_cumulative,
   *                            planned_percent, actual_percent }
   */
  static async getCurveSData(projectsId: number, baselineId: number): Promise<CurveSPoint[]> {
    const rows = await db.$queryRaw<{ snapshot_data: any }[]>`
      SELECT snapshot_data
      FROM schedule_baselines
      WHERE id = ${BigInt(baselineId)}
        AND projects_id = ${BigInt(projectsId)}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (rows.length === 0) {
      throw new NotFoundError('Baseline nao encontrado para este projeto.');
    }

    const snapshot = rows[0].snapshot_data as BacklogSnapshot[] | null;
    if (!snapshot || snapshot.length === 0) {
      return [];
    }

    // Filtra itens que possuem datas planejadas para construir a curva S
    const itemsComData = snapshot.filter(
      (item) => item.planned_start_date && item.planned_end_date
    );

    if (itemsComData.length === 0) {
      return [];
    }

    // Calcula o custo total planejado no baseline
    const totalPlannedCost = itemsComData.reduce(
      (sum, item) => sum + (item.planned_cost || 0),
      0
    );

    // Calcula a quantidade total planejada no baseline (fallback se nao ha custo)
    const totalPlannedQty = itemsComData.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );

    // Determina o intervalo de datas
    const startDates = itemsComData.map((i) => new Date(i.planned_start_date!));
    const endDates = itemsComData.map((i) => new Date(i.planned_end_date!));
    const minDate = new Date(Math.min(...startDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map((d) => d.getTime())));

    // Busca progresso real atual dos backlogs do projeto via raw SQL
    // (campos actual_end_date, percent_complete, actual_cost podem nao estar no Prisma Client)
    const currentBacklogs = await db.$queryRaw<{
      id: bigint;
      actual_end_date: Date | null;
      percent_complete: any;
      quantity_done: any;
      quantity: any;
      actual_cost: any;
    }[]>`
      SELECT id, actual_end_date, percent_complete, quantity_done, quantity, actual_cost
      FROM projects_backlogs
      WHERE projects_id = ${BigInt(projectsId)}
        AND deleted_at IS NULL
    `;

    const actualByBacklogId = new Map(
      currentBacklogs.map((b) => [
        Number(b.id),
        {
          actual_end_date: b.actual_end_date,
          percent_complete: b.percent_complete ? Number(b.percent_complete) : 0,
          quantity_done: b.quantity_done ? Number(b.quantity_done) : 0,
          quantity: b.quantity ? Number(b.quantity) : 1,
          actual_cost: b.actual_cost ? Number(b.actual_cost) : 0,
        },
      ])
    );

    // Gera pontos mensais entre minDate e maxDate
    const points: CurveSPoint[] = [];
    const current = new Date(minDate);
    current.setDate(1); // Primeiro dia do mes

    while (current <= maxDate) {
      const periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const totalBaseValue = totalPlannedCost > 0 ? totalPlannedCost : totalPlannedQty;

      let cumulativePlanned = 0;
      let cumulativeActual = 0;

      for (const item of itemsComData) {
        const itemEnd = new Date(item.planned_end_date!);
        const itemStart = new Date(item.planned_start_date!);
        const itemValue = totalPlannedCost > 0
          ? (item.planned_cost || 0)
          : (item.quantity || 1);

        // Distribui linearmente o valor planejado ao longo da duracao
        if (itemEnd <= periodEnd) {
          cumulativePlanned += itemValue;
        } else if (itemStart <= periodEnd) {
          const totalDuration = Math.max(
            (itemEnd.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24),
            1
          );
          const daysInPeriod = Math.max(
            (periodEnd.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24),
            0
          );
          const fraction = Math.min(daysInPeriod / totalDuration, 1);
          cumulativePlanned += itemValue * fraction;
        }

        // Calcula o valor real para este item
        const actual = actualByBacklogId.get(item.id);
        if (actual) {
          const actualEndDate = actual.actual_end_date;
          if (actualEndDate && new Date(actualEndDate) <= periodEnd) {
            // Item concluido ate o fim do periodo
            if (totalPlannedCost > 0) {
              cumulativeActual += actual.actual_cost;
            } else {
              cumulativeActual += actual.quantity_done;
            }
          } else if (actual.percent_complete > 0 && itemStart <= periodEnd) {
            // Item em progresso - usa percent_complete para estimar
            if (totalPlannedCost > 0) {
              cumulativeActual += (item.planned_cost || 0) * (actual.percent_complete / 100);
            } else {
              cumulativeActual += (item.quantity || 1) * (actual.percent_complete / 100);
            }
          }
        }
      }

      points.push({
        date: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        planned_cumulative: Math.round(cumulativePlanned * 100) / 100,
        actual_cumulative: Math.round(cumulativeActual * 100) / 100,
        planned_percent: totalBaseValue > 0
          ? Math.min(Math.round((cumulativePlanned / totalBaseValue) * 10000) / 100, 100)
          : 0,
        actual_percent: totalBaseValue > 0
          ? Math.min(Math.round((cumulativeActual / totalBaseValue) * 10000) / 100, 100)
          : 0,
      });

      // Avanca para o proximo mes
      current.setMonth(current.getMonth() + 1);
    }

    return points;
  }

  // =============================================================================
  // TASK DEPENDENCIES
  // =============================================================================

  /**
   * Lista todas as dependencias de um projeto
   */
  static async listDependencies(projectsId: number) {
    const rows = await db.$queryRaw<DependencyRow[]>`
      SELECT
        td.id, td.projects_id, td.predecessor_backlog_id, td.successor_backlog_id,
        td.dependency_type, td.lag_days, td.created_at, td.updated_at, td.deleted_at,
        pb_pred.description AS predecessor_description, pb_pred.wbs_code AS predecessor_wbs_code,
        pb_succ.description AS successor_description, pb_succ.wbs_code AS successor_wbs_code
      FROM task_dependencies td
      LEFT JOIN projects_backlogs pb_pred ON pb_pred.id = td.predecessor_backlog_id
      LEFT JOIN projects_backlogs pb_succ ON pb_succ.id = td.successor_backlog_id
      WHERE td.projects_id = ${BigInt(projectsId)}
        AND td.deleted_at IS NULL
      ORDER BY td.created_at ASC
    `;

    return rows.map(serializeRow);
  }

  /**
   * Cria uma dependencia entre dois backlogs.
   * Valida se nao cria ciclos no grafo de dependencias.
   */
  static async createDependency(input: CreateDependencyInput) {
    // Valida que predecessor e successor sao diferentes
    if (input.predecessor_backlog_id === input.successor_backlog_id) {
      throw new BadRequestError('Um backlog nao pode depender de si mesmo.');
    }

    // Valida que ambos os backlogs existem no projeto
    const backlogs = await db.projects_backlogs.findMany({
      where: {
        id: { in: [BigInt(input.predecessor_backlog_id), BigInt(input.successor_backlog_id)] },
        projects_id: BigInt(input.projects_id),
        deleted_at: null,
      },
      select: { id: true },
    });

    if (backlogs.length !== 2) {
      throw new NotFoundError('Um ou ambos os backlogs nao foram encontrados no projeto.');
    }

    // Verifica se a dependencia ja existe
    const existing = await db.$queryRaw<{ id: bigint }[]>`
      SELECT id FROM task_dependencies
      WHERE predecessor_backlog_id = ${BigInt(input.predecessor_backlog_id)}
        AND successor_backlog_id = ${BigInt(input.successor_backlog_id)}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (existing.length > 0) {
      throw new BadRequestError('Esta dependencia ja existe.');
    }

    // Valida que nao cria ciclos no grafo
    const hasCycle = await PlanningService.validateNoCycles(
      input.projects_id,
      input.predecessor_backlog_id,
      input.successor_backlog_id
    );

    if (hasCycle) {
      throw new BadRequestError(
        'Nao e possivel criar esta dependencia pois criaria um ciclo no grafo de dependencias.'
      );
    }

    const now = new Date();
    await db.$executeRaw`
      INSERT INTO task_dependencies
        (projects_id, predecessor_backlog_id, successor_backlog_id, dependency_type, lag_days, created_at, updated_at, deleted_at)
      VALUES
        (
          ${BigInt(input.projects_id)},
          ${BigInt(input.predecessor_backlog_id)},
          ${BigInt(input.successor_backlog_id)},
          ${input.dependency_type},
          ${input.lag_days},
          ${now},
          ${now},
          NULL
        )
    `;

    const created = await db.$queryRaw<DependencyRow[]>`
      SELECT
        td.id, td.projects_id, td.predecessor_backlog_id, td.successor_backlog_id,
        td.dependency_type, td.lag_days, td.created_at, td.updated_at, td.deleted_at,
        pb_pred.description AS predecessor_description, pb_pred.wbs_code AS predecessor_wbs_code,
        pb_succ.description AS successor_description, pb_succ.wbs_code AS successor_wbs_code
      FROM task_dependencies td
      LEFT JOIN projects_backlogs pb_pred ON pb_pred.id = td.predecessor_backlog_id
      LEFT JOIN projects_backlogs pb_succ ON pb_succ.id = td.successor_backlog_id
      WHERE td.predecessor_backlog_id = ${BigInt(input.predecessor_backlog_id)}
        AND td.successor_backlog_id = ${BigInt(input.successor_backlog_id)}
        AND td.deleted_at IS NULL
      LIMIT 1
    `;

    return created.length > 0 ? serializeRow(created[0]) : null;
  }

  /**
   * Remove uma dependencia (soft delete)
   */
  static async deleteDependency(id: number) {
    const existing = await db.$queryRaw<{ id: bigint }[]>`
      SELECT id FROM task_dependencies
      WHERE id = ${BigInt(id)}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (existing.length === 0) {
      throw new NotFoundError('Dependencia nao encontrada.');
    }

    const now = new Date();
    await db.$executeRaw`
      UPDATE task_dependencies
      SET deleted_at = ${now}, updated_at = ${now}
      WHERE id = ${BigInt(id)}
    `;

    return { message: 'Dependencia removida com sucesso.' };
  }

  /**
   * Retorna predecessores e sucessores de um backlog especifico
   */
  static async getDependenciesForBacklog(backlogId: number) {
    const [predecessors, successors] = await Promise.all([
      db.$queryRaw<DependencyRow[]>`
        SELECT
          td.id, td.projects_id, td.predecessor_backlog_id, td.successor_backlog_id,
          td.dependency_type, td.lag_days, td.created_at, td.updated_at, td.deleted_at,
          pb_pred.description AS predecessor_description, pb_pred.wbs_code AS predecessor_wbs_code,
          NULL AS successor_description, NULL AS successor_wbs_code
        FROM task_dependencies td
        LEFT JOIN projects_backlogs pb_pred ON pb_pred.id = td.predecessor_backlog_id
        WHERE td.successor_backlog_id = ${BigInt(backlogId)}
          AND td.deleted_at IS NULL
        ORDER BY td.created_at ASC
      `,
      db.$queryRaw<DependencyRow[]>`
        SELECT
          td.id, td.projects_id, td.predecessor_backlog_id, td.successor_backlog_id,
          td.dependency_type, td.lag_days, td.created_at, td.updated_at, td.deleted_at,
          NULL AS predecessor_description, NULL AS predecessor_wbs_code,
          pb_succ.description AS successor_description, pb_succ.wbs_code AS successor_wbs_code
        FROM task_dependencies td
        LEFT JOIN projects_backlogs pb_succ ON pb_succ.id = td.successor_backlog_id
        WHERE td.predecessor_backlog_id = ${BigInt(backlogId)}
          AND td.deleted_at IS NULL
        ORDER BY td.created_at ASC
      `,
    ]);

    return {
      predecessors: predecessors.map(serializeRow),
      successors: successors.map(serializeRow),
    };
  }

  /**
   * Detecta ciclos no grafo de dependencias usando BFS.
   * Verifica se adicionar a aresta predecessor -> successor criaria um ciclo.
   * Um ciclo existiria se successor for ancestral de predecessor no grafo atual.
   * Retorna true se haveria ciclo, false se e seguro criar a dependencia.
   */
  static async validateNoCycles(
    projectsId: number,
    predecessorId: number,
    successorId: number
  ): Promise<boolean> {
    // Busca todas as dependencias do projeto para montar o grafo em memoria
    const allDeps = await db.$queryRaw<{ predecessor_backlog_id: bigint; successor_backlog_id: bigint }[]>`
      SELECT predecessor_backlog_id, successor_backlog_id
      FROM task_dependencies
      WHERE projects_id = ${BigInt(projectsId)}
        AND deleted_at IS NULL
    `;

    // Monta o mapa de adjacencia: backlogId -> lista de successores
    const adjacency = new Map<number, number[]>();
    for (const dep of allDeps) {
      const predId = Number(dep.predecessor_backlog_id);
      const succId = Number(dep.successor_backlog_id);
      if (!adjacency.has(predId)) {
        adjacency.set(predId, []);
      }
      adjacency.get(predId)!.push(succId);
    }

    // Verifica se successorId pode alcancar predecessorId no grafo atual
    // Se sim, adicionar predecessor -> successor criaria um ciclo
    // BFS a partir do successorId
    const visited = new Set<number>();
    const queue: number[] = [successorId];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === predecessorId) {
        // Encontrou um caminho de successorId ate predecessorId - haveria ciclo
        return true;
      }

      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = adjacency.get(current) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }

    return false;
  }

  // =============================================================================
  // GANTT DATA
  // =============================================================================

  /**
   * Retorna dados estruturados para o Gantt do projeto
   * Inclui: id, description, wbs_code, level, datas planejadas/reais,
   *         percent_complete, dependencies, sort_order
   * Ordenado por sort_order e depois por wbs_code
   */
  static async getGanttData(projectsId: number, sprintsId?: number): Promise<GanttItem[]> {
    // Busca backlogs com campos de planning via raw SQL
    // (campos planned_* e wbs_code podem nao estar no Prisma Client gerado)
    type BacklogGanttRow = {
      id: bigint;
      description: string | null;
      wbs_code: string | null;
      level: number | null;
      sort_order: number | null;
      planned_start_date: Date | null;
      planned_end_date: Date | null;
      actual_start_date: Date | null;
      actual_end_date: Date | null;
      percent_complete: any;
      planned_duration_days: number | null;
      planned_cost: any;
      actual_cost: any;
      is_milestone: boolean | null;
    };

    let backlogs: BacklogGanttRow[];

    if (sprintsId) {
      // Filtra backlogs desta sprint via JOIN com sprints_tasks
      backlogs = await db.$queryRaw<BacklogGanttRow[]>`
        SELECT DISTINCT pb.id, pb.description, pb.wbs_code, pb.level, pb.sort_order,
          pb.planned_start_date, pb.planned_end_date,
          pb.actual_start_date, pb.actual_end_date,
          pb.percent_complete, pb.planned_duration_days,
          pb.planned_cost, pb.actual_cost, pb.is_milestone
        FROM projects_backlogs pb
        INNER JOIN sprints_tasks st ON st.projects_backlogs_id = pb.id
          AND st.sprints_id = ${BigInt(sprintsId)}
          AND st.deleted_at IS NULL
        WHERE pb.projects_id = ${BigInt(projectsId)}
          AND pb.deleted_at IS NULL
        ORDER BY pb.sort_order ASC NULLS LAST, pb.wbs_code ASC NULLS LAST
      `;
    } else {
      backlogs = await db.$queryRaw<BacklogGanttRow[]>`
        SELECT id, description, wbs_code, level, sort_order,
          planned_start_date, planned_end_date,
          actual_start_date, actual_end_date,
          percent_complete, planned_duration_days,
          planned_cost, actual_cost, is_milestone
        FROM projects_backlogs
        WHERE projects_id = ${BigInt(projectsId)}
          AND deleted_at IS NULL
        ORDER BY sort_order ASC NULLS LAST, wbs_code ASC NULLS LAST
      `;
    }

    if (backlogs.length === 0) {
      return [];
    }

    // Busca todas as dependencias dos backlogs via raw SQL
    const backlogIdList = backlogs.map((b) => Number(b.id));
    const deps = await db.$queryRaw<{
      id: bigint;
      successor_backlog_id: bigint;
      predecessor_backlog_id: bigint;
      dependency_type: string;
      lag_days: number;
    }[]>`
      SELECT id, successor_backlog_id, predecessor_backlog_id, dependency_type, lag_days
      FROM task_dependencies
      WHERE successor_backlog_id = ANY(${backlogIdList}::bigint[])
        AND deleted_at IS NULL
    `;

    // Agrupa dependencias por successor_backlog_id
    const depsBySuccessor = new Map<number, DependencyRef[]>();
    for (const dep of deps) {
      const succId = Number(dep.successor_backlog_id);
      if (!depsBySuccessor.has(succId)) {
        depsBySuccessor.set(succId, []);
      }
      depsBySuccessor.get(succId)!.push({
        id: Number(dep.id),
        predecessor_backlog_id: Number(dep.predecessor_backlog_id),
        dependency_type: dep.dependency_type,
        lag_days: dep.lag_days,
      });
    }

    const ganttItems: GanttItem[] = backlogs.map((b) => ({
      id: Number(b.id),
      description: b.description,
      wbs_code: b.wbs_code,
      level: b.level,
      sort_order: b.sort_order,
      planned_start_date: b.planned_start_date
        ? b.planned_start_date.toISOString().split('T')[0]
        : null,
      planned_end_date: b.planned_end_date
        ? b.planned_end_date.toISOString().split('T')[0]
        : null,
      actual_start_date: b.actual_start_date
        ? b.actual_start_date.toISOString().split('T')[0]
        : null,
      actual_end_date: b.actual_end_date
        ? b.actual_end_date.toISOString().split('T')[0]
        : null,
      percent_complete: b.percent_complete ? Number(b.percent_complete) : null,
      planned_duration_days: b.planned_duration_days,
      planned_cost: b.planned_cost ? Number(b.planned_cost) : null,
      actual_cost: b.actual_cost ? Number(b.actual_cost) : null,
      is_milestone: b.is_milestone ?? false,
      dependencies: depsBySuccessor.get(Number(b.id)) || [],
    }));

    return ganttItems;
  }

  // =============================================================================
  // BACKLOG PLANNING
  // =============================================================================

  /**
   * Atualiza os campos de planejamento de um backlog especifico
   */
  static async updateBacklogPlanning(backlogId: number, input: UpdateBacklogPlanningInput) {
    // Verifica se o backlog existe usando findFirst (funciona no client atual)
    const existing = await db.projects_backlogs.findFirst({
      where: {
        id: BigInt(backlogId),
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundError('Backlog nao encontrado.');
    }

    // Constroi os campos a atualizar dinamicamente
    // Usa raw SQL pois os campos planned_* podem nao estar no Prisma Client gerado
    const setParts: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let paramIndex = 1;

    const addField = (field: string, value: any) => {
      setParts.push(`${field} = $${paramIndex++}`);
      values.push(value);
    };

    if (input.planned_start_date !== undefined) {
      addField('planned_start_date', input.planned_start_date ? new Date(input.planned_start_date) : null);
    }
    if (input.planned_end_date !== undefined) {
      addField('planned_end_date', input.planned_end_date ? new Date(input.planned_end_date) : null);
    }
    if (input.actual_start_date !== undefined) {
      addField('actual_start_date', input.actual_start_date ? new Date(input.actual_start_date) : null);
    }
    if (input.actual_end_date !== undefined) {
      addField('actual_end_date', input.actual_end_date ? new Date(input.actual_end_date) : null);
    }
    if (input.planned_duration_days !== undefined) {
      addField('planned_duration_days', input.planned_duration_days);
    }
    if (input.planned_cost !== undefined) {
      addField('planned_cost', input.planned_cost);
    }
    if (input.actual_cost !== undefined) {
      addField('actual_cost', input.actual_cost);
    }
    if (input.percent_complete !== undefined) {
      addField('percent_complete', input.percent_complete);
    }
    if (input.wbs_code !== undefined) {
      addField('wbs_code', input.wbs_code);
    }
    if (input.sort_order !== undefined) {
      addField('sort_order', input.sort_order);
    }
    if (input.level !== undefined) {
      addField('level', input.level);
    }

    // Executa o UPDATE via $executeRawUnsafe para suportar parametros dinamicos
    const setClause = setParts.join(', ');
    values.push(backlogId);
    await db.$executeRawUnsafe(
      `UPDATE projects_backlogs SET ${setClause} WHERE id = $${paramIndex} AND deleted_at IS NULL`,
      ...values
    );

    // Retorna o backlog atualizado via raw SQL
    const updated = await db.$queryRaw<any[]>`
      SELECT
        id, description, projects_id, tasks_template_id, projects_backlogs_statuses_id,
        planned_start_date, planned_end_date, actual_start_date, actual_end_date,
        planned_duration_days, planned_cost, actual_cost, percent_complete,
        wbs_code, sort_order, level,
        quantity, quantity_done, weight,
        created_at, updated_at, deleted_at
      FROM projects_backlogs
      WHERE id = ${BigInt(backlogId)}
      LIMIT 1
    `;

    return updated.length > 0 ? serializeRow(updated[0]) : null;
  }

  /**
   * Atualiza os campos de planejamento de multiplos backlogs de uma vez
   */
  static async bulkUpdateBacklogPlanning(items: BulkBacklogPlanningItem[]) {
    const results = await Promise.all(
      items.map((item) => {
        const { id, ...fields } = item;
        return PlanningService.updateBacklogPlanning(id, fields);
      })
    );

    return results;
  }

  // =============================================================================
  // CAMINHO CRITICO (CPM - Critical Path Method)
  // =============================================================================

  /**
   * Calcula o caminho critico do projeto usando o metodo CPM (forward/backward pass).
   * Retorna os IDs dos backlogs que estao no caminho critico (float = 0)
   * e a duracao total do projeto em dias de trabalho.
   */
  static async getCriticalPath(
    projectsId: number
  ): Promise<{ critical_tasks: number[]; total_duration: number }> {
    // Busca backlogs com dados de planejamento
    const backlogs = await db.$queryRaw<{
      id: bigint;
      planned_start_date: Date | null;
      planned_end_date: Date | null;
      planned_duration_days: number | null;
      is_milestone: boolean | null;
    }[]>`
      SELECT id, planned_start_date, planned_end_date, planned_duration_days, is_milestone
      FROM projects_backlogs
      WHERE projects_id = ${BigInt(projectsId)}
        AND deleted_at IS NULL
        AND (planned_start_date IS NOT NULL OR planned_end_date IS NOT NULL OR planned_duration_days IS NOT NULL)
      ORDER BY COALESCE(sort_order, 0) ASC
    `;

    if (backlogs.length === 0) return { critical_tasks: [], total_duration: 0 };

    // Busca dependencias do projeto
    const deps = await db.$queryRaw<{
      predecessor_backlog_id: bigint;
      successor_backlog_id: bigint;
      lag_days: number;
    }[]>`
      SELECT predecessor_backlog_id, successor_backlog_id, lag_days
      FROM task_dependencies
      WHERE projects_id = ${BigInt(projectsId)} AND deleted_at IS NULL
    `;

    // Estrutura de dados CPM: es=Early Start, ef=Early Finish, ls=Late Start, lf=Late Finish
    interface CpmTask {
      duration: number;
      es: number;
      ef: number;
      ls: number;
      lf: number;
      float: number;
    }

    const taskMap = new Map<number, CpmTask>();
    const successorsMap = new Map<number, { id: number; lag: number }[]>();
    const predecessorsMap = new Map<number, { id: number; lag: number }[]>();

    for (const b of backlogs) {
      const id = Number(b.id);
      let duration = b.planned_duration_days ?? 0;
      // Se nao tem duracao explicita, calcula pela diferenca de datas
      if (!duration && b.planned_start_date && b.planned_end_date) {
        duration = Math.max(
          Math.ceil(
            (b.planned_end_date.getTime() - b.planned_start_date.getTime()) / (1000 * 60 * 60 * 24)
          ),
          0
        );
      }
      taskMap.set(id, { duration, es: 0, ef: 0, ls: Infinity, lf: Infinity, float: 0 });
    }

    for (const d of deps) {
      const predId = Number(d.predecessor_backlog_id);
      const succId = Number(d.successor_backlog_id);
      // Inclui apenas dependencias cujos dois nos estao no mapa
      if (!taskMap.has(predId) || !taskMap.has(succId)) continue;

      if (!successorsMap.has(predId)) successorsMap.set(predId, []);
      successorsMap.get(predId)!.push({ id: succId, lag: d.lag_days });

      if (!predecessorsMap.has(succId)) predecessorsMap.set(succId, []);
      predecessorsMap.get(succId)!.push({ id: predId, lag: d.lag_days });
    }

    const ids = Array.from(taskMap.keys());

    // Ordenacao topologica via DFS iterativa
    const visited = new Set<number>();
    const order: number[] = [];

    function dfs(startId: number) {
      const stack: { id: number; processed: boolean }[] = [{ id: startId, processed: false }];
      while (stack.length > 0) {
        const { id, processed } = stack[stack.length - 1];
        if (processed) {
          stack.pop();
          if (!order.includes(id)) order.unshift(id);
          continue;
        }
        stack[stack.length - 1].processed = true;
        if (visited.has(id)) {
          stack.pop();
          continue;
        }
        visited.add(id);
        for (const succ of successorsMap.get(id) ?? []) {
          if (!visited.has(succ.id)) {
            stack.push({ id: succ.id, processed: false });
          }
        }
      }
    }

    for (const id of ids) {
      if (!visited.has(id)) dfs(id);
    }

    // Forward pass: calcula ES e EF de cada tarefa
    for (const id of order) {
      const task = taskMap.get(id)!;
      const preds = predecessorsMap.get(id) ?? [];

      if (preds.length === 0) {
        task.es = 0;
      } else {
        task.es = Math.max(
          ...preds.map((p) => {
            const pred = taskMap.get(p.id);
            return pred ? pred.ef + p.lag : 0;
          })
        );
      }
      task.ef = task.es + task.duration;
    }

    // Duracao total do projeto = maior EF
    const projectDuration = Math.max(0, ...Array.from(taskMap.values()).map((t) => t.ef));

    // Backward pass: calcula LS e LF de cada tarefa
    for (const id of [...order].reverse()) {
      const task = taskMap.get(id)!;
      const succs = successorsMap.get(id) ?? [];

      if (succs.length === 0) {
        task.lf = projectDuration;
      } else {
        task.lf = Math.min(
          ...succs.map((s) => {
            const succ = taskMap.get(s.id);
            return succ ? succ.ls - s.lag : projectDuration;
          })
        );
      }
      task.ls = task.lf - task.duration;
      task.float = task.ls - task.es;
    }

    // Caminho critico: tarefas com float <= 0 (tolerancia de 0.01)
    const criticalTasks = ids.filter((id) => {
      const task = taskMap.get(id)!;
      return Math.abs(task.float) < 0.01;
    });

    return { critical_tasks: criticalTasks, total_duration: projectDuration };
  }

  // =============================================================================
  // SAUDE DO CRONOGRAMA
  // =============================================================================

  /**
   * Calcula indicadores de saude do cronograma de um projeto.
   * Retorna metricas como SPI, tarefas atrasadas, progresso planejado vs real,
   * e marcos proximos.
   */
  static async getScheduleHealth(projectsId: number) {
    const today = new Date();

    // Busca todos os backlogs com dados de planejamento e progresso
    const backlogs = await db.$queryRaw<{
      id: bigint;
      description: string | null;
      planned_start_date: Date | null;
      planned_end_date: Date | null;
      actual_start_date: Date | null;
      actual_end_date: Date | null;
      percent_complete: any;
      planned_cost: any;
      actual_cost: any;
      is_milestone: boolean | null;
      wbs_code: string | null;
      weight: any;
    }[]>`
      SELECT
        id, description, planned_start_date, planned_end_date,
        actual_start_date, actual_end_date, percent_complete,
        planned_cost, actual_cost, is_milestone, wbs_code, weight
      FROM projects_backlogs
      WHERE projects_id = ${BigInt(projectsId)} AND deleted_at IS NULL
    `;

    if (backlogs.length === 0) {
      return {
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        not_started_tasks: 0,
        on_time: 0,
        delayed: 0,
        ahead: 0,
        overall_planned_percent: 0,
        overall_actual_percent: 0,
        spi: null,
        upcoming_milestones: [],
      };
    }

    let totalTasks = backlogs.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let onTime = 0;
    let delayed = 0;
    let ahead = 0;

    let totalPlannedValue = 0;
    let totalEarnedValue = 0;
    let totalWeight = 0;
    let totalWeightedPlanned = 0;
    let totalWeightedActual = 0;

    for (const b of backlogs) {
      const pct = b.percent_complete ? Number(b.percent_complete) : 0;
      const weight = b.weight ? Number(b.weight) : 1;

      // Classifica por status de execucao
      if (pct >= 100) {
        completed++;
      } else if (pct > 0) {
        inProgress++;
      } else {
        notStarted++;
      }

      // Calcula percentual planejado para hoje (interpolacao linear)
      let plannedPctForToday = 0;
      if (b.planned_start_date && b.planned_end_date) {
        const start = b.planned_start_date.getTime();
        const end = b.planned_end_date.getTime();
        const now = today.getTime();

        if (now >= end) {
          plannedPctForToday = 100;
        } else if (now > start) {
          plannedPctForToday = ((now - start) / (end - start)) * 100;
        }
      }

      totalWeight += weight;
      totalWeightedPlanned += plannedPctForToday * weight;
      totalWeightedActual += pct * weight;

      // Calculo de Valor Planejado e Valor Agregado para SPI
      const plannedCost = b.planned_cost ? Number(b.planned_cost) : weight;
      totalPlannedValue += plannedCost * (plannedPctForToday / 100);
      totalEarnedValue += plannedCost * (pct / 100);

      // Classifica como adiantado, no prazo ou atrasado
      if (pct >= 100) {
        if (b.actual_end_date && b.planned_end_date) {
          if (b.actual_end_date <= b.planned_end_date) {
            onTime++;
          } else {
            delayed++;
          }
        } else {
          onTime++;
        }
      } else if (b.planned_end_date && today > b.planned_end_date && pct < 100) {
        delayed++;
      } else if (plannedPctForToday > 0 && pct > plannedPctForToday + 5) {
        ahead++;
      } else {
        onTime++;
      }
    }

    const overallPlanned =
      totalWeight > 0
        ? Math.round((totalWeightedPlanned / totalWeight) * 100) / 100
        : 0;
    const overallActual =
      totalWeight > 0
        ? Math.round((totalWeightedActual / totalWeight) * 100) / 100
        : 0;
    const spi =
      totalPlannedValue > 0
        ? Math.round((totalEarnedValue / totalPlannedValue) * 100) / 100
        : null;

    // Marcos proximos (nao concluidos)
    const upcomingMilestones = backlogs
      .filter(
        (b) =>
          b.is_milestone &&
          b.planned_end_date &&
          (b.percent_complete === null || Number(b.percent_complete) < 100)
      )
      .map((b) => ({
        id: Number(b.id),
        description: b.description,
        planned_date: b.planned_end_date!.toISOString().split('T')[0],
        wbs_code: b.wbs_code,
        is_overdue: b.planned_end_date! < today,
      }))
      .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
      .slice(0, 5);

    return {
      total_tasks: totalTasks,
      completed_tasks: completed,
      in_progress_tasks: inProgress,
      not_started_tasks: notStarted,
      on_time: onTime,
      delayed,
      ahead,
      overall_planned_percent: overallPlanned,
      overall_actual_percent: overallActual,
      spi,
      upcoming_milestones: upcomingMilestones,
    };
  }

  // =============================================================================
  // ROLLUP DE PROGRESSO (delegacao para ProgressRollupService)
  // =============================================================================

  /**
   * Dispara rollup de progresso para um backlog especifico e seus ancestrais
   */
  static async rollupBacklog(backlogId: number): Promise<{ message: string }> {
    const { ProgressRollupService } = await import('../../services/progressRollup');
    await ProgressRollupService.rollupBacklog(backlogId);
    return { message: `Progresso recalculado para backlog ${backlogId} e seus ancestrais.` };
  }

  /**
   * Dispara rollup de progresso para todos os backlogs de um projeto (bottom-up)
   */
  static async rollupProject(projectsId: number): Promise<{ message: string; projects_id: number }> {
    const { ProgressRollupService } = await import('../../services/progressRollup');
    await ProgressRollupService.rollupProject(projectsId);
    return {
      message: `Progresso recalculado para todos os backlogs do projeto ${projectsId}.`,
      projects_id: projectsId,
    };
  }
}

export default PlanningService;
