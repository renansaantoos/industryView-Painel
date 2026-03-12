// =============================================================================
// INDUSTRYVIEW BACKEND - Sprints Module Service
// Service de sprints
// Equivalente a logica dos endpoints do api_group Sprints do Xano
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { SPRINT_TASK_STATUS } from '../../constants/statuses';
import {
  CreateSprintInput,
  UpdateSprintInput,
  SprintTasksPanelInput,
  CreateSprintTaskInput,
  UpdateSprintTaskInput,
  UpdateSprintTaskStatusInput,
  UpdateSprintStatusInput,
  CreateSprintStatusInput,
  CreateSprintTaskStatusInput,
  CreateQualityStatusInput,
  UpdateInspectionInput,
  EndSubtaskInput,
  UpdateListSprintTaskStatusInput,
} from './sprints.schema';

/**
 * SprintsService - Service do modulo de sprints
 */
export class SprintsService {
  // =============================================================================
  // SPRINTS
  // =============================================================================

  /**
   * Lista sprints do projeto agrupadas por status
   * Equivalente a: query sprints verb=GET do Xano (endpoint 512)
   */
  static async list(
    projectsId: number,
    page: number = 1,
    perPage: number = 20,
    dtStart?: string | null,
    dtEnd?: string | null,
    companyId?: number | null
  ) {
    const baseWhere: any = {
      deleted_at: null,
      projects_id: projectsId,
    };

    // Isolamento multi-tenant: garante que o projeto pertence a empresa do usuario
    if (companyId) {
      baseWhere.projects = { company_id: BigInt(companyId) };
    }

    // Adiciona filtro de data se fornecido
    const dateFilter = (dtStart && dtEnd) ? {
      end_date: {
        gte: new Date(dtStart),
        lte: new Date(dtEnd),
      },
    } : {};

    // Status IDs conforme seed: 1=Futura, 2=Ativa, 3=Concluída, 4=Cancelada

    // Status 2 = Ativa
    const sprintsAtiva = await db.sprints.findMany({
      where: { ...baseWhere, sprints_statuses_id: 2, ...dateFilter },
      orderBy: { start_date: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalAtiva = await db.sprints.count({
      where: { ...baseWhere, sprints_statuses_id: 2, ...dateFilter },
    });

    // Status 1 = Futura
    const sprintsFutura = await db.sprints.findMany({
      where: { ...baseWhere, sprints_statuses_id: 1, ...dateFilter },
      orderBy: { start_date: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalFutura = await db.sprints.count({
      where: { ...baseWhere, sprints_statuses_id: 1, ...dateFilter },
    });

    // Status 3 = Concluída
    const sprintsConcluida = await db.sprints.findMany({
      where: { ...baseWhere, sprints_statuses_id: 3, ...dateFilter },
      orderBy: { end_date: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalConcluida = await db.sprints.count({
      where: { ...baseWhere, sprints_statuses_id: 3, ...dateFilter },
    });

    // Conta tarefas pendentes de inspecao por sprint (quality_status_id = 1)
    const allSprintIds = [
      ...sprintsAtiva.map(s => s.id),
      ...sprintsFutura.map(s => s.id),
      ...sprintsConcluida.map(s => s.id),
    ];

    const inspectionGroups: any[] = allSprintIds.length > 0
      ? await db.$queryRawUnsafe(
          `SELECT sprints_id, COUNT(*)::int AS _count
           FROM sprints_tasks
           WHERE sprints_id = ANY($1::bigint[])
             AND quality_status_id = 1
             AND deleted_at IS NULL
           GROUP BY sprints_id`,
          allSprintIds.map(Number)
        )
      : [];

    const inspectionCountMap = new Map(
      inspectionGroups.map((g: any) => [g.sprints_id?.toString(), Number(g._count ?? 0)])
    );

    const withInspection = (items: typeof sprintsAtiva) =>
      items.map(s => ({
        ...s,
        pending_inspection_count: inspectionCountMap.get(s.id.toString()) ?? 0,
      }));

    return {
      sprints_ativa: {
        items: withInspection(sprintsAtiva),
        curPage: page,
        perPage,
        itemsReceived: sprintsAtiva.length,
        itemsTotal: totalAtiva,
        pageTotal: Math.ceil(totalAtiva / perPage),
      },
      sprints_futura: {
        items: withInspection(sprintsFutura),
        curPage: page,
        perPage,
        itemsReceived: sprintsFutura.length,
        itemsTotal: totalFutura,
        pageTotal: Math.ceil(totalFutura / perPage),
      },
      sprints_concluida: {
        items: withInspection(sprintsConcluida),
        curPage: page,
        perPage,
        itemsReceived: sprintsConcluida.length,
        itemsTotal: totalConcluida,
        pageTotal: Math.ceil(totalConcluida / perPage),
      },
    };
  }

  /**
   * Busca sprint por ID
   * Equivalente a: query sprints/{sprints_id} verb=GET do Xano (endpoint 511)
   */
  static async getById(sprintId: number) {
    const sprint = await db.sprints.findFirst({
      where: {
        id: sprintId,
        deleted_at: null,
      },
      include: {
        sprints_statuses: true,
        projects: {
          select: { id: true, name: true },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundError('Sprint nao encontrada.');
    }

    return sprint;
  }

  /**
   * Cria sprint
   * Equivalente a: query sprints verb=POST do Xano (endpoint 513)
   */
  static async create(input: CreateSprintInput) {
    return db.sprints.create({
      data: {
        title: input.title,
        objective: input.objective || '',
        start_date: new Date(input.start_date),
        end_date: new Date(input.end_date),
        progress_percentage: input.progress_percentage || 0,
        projects_id: input.projects_id,
        sprints_statuses_id: input.sprints_statuses_id || 1, // 1 = Futura
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });
  }

  /**
   * Atualiza sprint
   * Equivalente a: query sprints/{sprints_id} verb=PATCH do Xano (endpoint 514)
   */
  static async update(sprintId: number, input: UpdateSprintInput) {
    const existing = await db.sprints.findFirst({
      where: {
        id: sprintId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Sprint nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.objective !== undefined) updateData.objective = input.objective;
    if (input.start_date !== undefined && input.start_date !== null) {
      updateData.start_date = typeof input.start_date === 'number'
        ? new Date(input.start_date)
        : new Date(input.start_date);
    }
    if (input.end_date !== undefined && input.end_date !== null) {
      updateData.end_date = typeof input.end_date === 'number'
        ? new Date(input.end_date)
        : new Date(input.end_date);
    }
    if (input.progress_percentage !== undefined && input.progress_percentage !== null) {
      updateData.progress_percentage = input.progress_percentage;
    }
    if (input.sprints_statuses_id !== undefined) updateData.sprints_statuses_id = input.sprints_statuses_id;

    return db.sprints.update({
      where: { id: sprintId },
      data: updateData,
    });
  }

  /**
   * Remove sprint (hard delete irreversivel)
   * Nullifica sprints_id em schedule e schedule_baselines antes de deletar,
   * pois essas relacoes sao nullable sem cascade. As sprints_tasks e seus
   * dependentes (sprint_task_change_log, schedule_sprints_tasks) sao removidos
   * automaticamente via onDelete: Cascade no schema Prisma.
   */
  static async delete(sprintId: number) {
    const existing = await db.sprints.findFirst({
      where: { id: sprintId, deleted_at: null },
      include: { _count: { select: { sprints_tasks: true } } },
    });

    if (!existing) {
      throw new NotFoundError('Sprint nao encontrada.');
    }

    const tasksRemoved = (existing as any)._count?.sprints_tasks ?? 0;

    await db.$transaction([
      db.schedule.updateMany({
        where: { sprints_id: BigInt(sprintId) },
        data: { sprints_id: null },
      }),
      db.schedule_baselines.updateMany({
        where: { sprints_id: BigInt(sprintId) },
        data: { sprints_id: null },
      }),
      db.sprints.delete({
        where: { id: sprintId },
      }),
    ]);

    return { message: 'Sprint removida com sucesso', tasks_removed: tasksRemoved };
  }

  /**
   * Conta tarefas ativas de uma sprint
   * Usado pelo frontend para exibir o total no modal de confirmacao de exclusao
   */
  static async getTaskCount(sprintId: number): Promise<number> {
    return db.sprints_tasks.count({
      where: { sprints_id: sprintId, deleted_at: null },
    });
  }

  /**
   * Atualiza status da sprint
   * Equivalente a: query update_sprint_status verb=PUT do Xano (endpoint 590)
   */
  static async updateStatus(input: UpdateSprintStatusInput) {
    const existing = await db.sprints.findFirst({
      where: {
        id: input.sprints_id,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Sprint nao encontrada.');
    }

    return db.sprints.update({
      where: { id: input.sprints_id },
      data: {
        sprints_statuses_id: input.sprints_statuses_id,
        updated_at: new Date(),
      },
    });
  }

  // =============================================================================
  // SPRINT STATUSES
  // =============================================================================

  /**
   * Lista status de sprints
   * Equivalente a: query sprints_statuses verb=GET do Xano (endpoint 517)
   */
  static async listStatuses(page: number = 1, perPage: number = 20) {
    const total = await db.sprints_statuses.count({
      where: { deleted_at: null },
    });

    const statuses = await db.sprints_statuses.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: statuses,
      curPage: page,
      perPage,
      itemsReceived: statuses.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca status por ID
   * Equivalente a: query sprints_statuses/{id} verb=GET do Xano (endpoint 516)
   */
  static async getStatusById(statusId: number) {
    const status = await db.sprints_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!status) {
      throw new NotFoundError('Status nao encontrado.');
    }

    return status;
  }

  /**
   * Cria status de sprint
   * Equivalente a: query sprints_statuses verb=POST do Xano (endpoint 518)
   */
  static async createStatus(input: CreateSprintStatusInput) {
    return db.sprints_statuses.create({
      data: {
        status: input.status,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });
  }

  /**
   * Atualiza status de sprint
   * Equivalente a: query sprints_statuses/{id} verb=PATCH do Xano (endpoint 519)
   */
  static async updateStatusRecord(statusId: number, input: CreateSprintStatusInput) {
    const existing = await db.sprints_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Status nao encontrado.');
    }

    return db.sprints_statuses.update({
      where: { id: statusId },
      data: {
        status: input.status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove status de sprint
   * Equivalente a: query sprints_statuses/{id} verb=DELETE do Xano (endpoint 515)
   */
  static async deleteStatus(statusId: number) {
    const existing = await db.sprints_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Status nao encontrado.');
    }

    await db.sprints_statuses.update({
      where: { id: statusId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Status removido com sucesso' };
  }

  // =============================================================================
  // SPRINT TASKS
  // =============================================================================

  /**
   * Painel de tarefas da sprint (Kanban)
   * Equivalente a: query sprints_tasks_painel verb=POST do Xano (endpoint 522)
   */
  static async getTasksPanel(input: SprintTasksPanelInput) {
    const {
      projects_id,
      sprints_id,
      equipaments_types_id,
      teams_id,
      fields_id,
      rows_id,
      search,
      sections_id,
      scheduled_for,
    } = input;

    // Constroi filtros base
    const baseWhere: any = {
      deleted_at: null,
      sprints_id,
      projects_backlogs: {
        deleted_at: null,
        projects_id,
      },
    };

    // Filtros opcionais
    if (equipaments_types_id && equipaments_types_id.length > 0) {
      baseWhere.projects_backlogs.equipaments_types_id = { in: equipaments_types_id };
    }
    if (teams_id && teams_id.length > 0) {
      baseWhere.teams_id = { in: teams_id };
    }
    if (fields_id) {
      baseWhere.projects_backlogs.fields_id = fields_id;
    }
    if (rows_id) {
      baseWhere.projects_backlogs.rows_id = rows_id;
    }
    if (search) {
      baseWhere.id = search;
    }
    if (sections_id) {
      baseWhere.projects_backlogs.sections_id = sections_id;
    }

    const includeRelations = {
      sprints: {
        select: {
          id: true,
          title: true,
          objective: true,
          start_date: true,
          end_date: true,
          progress_percentage: true,
          projects_id: true,
        },
      },
      teams: {
        select: { id: true, name: true, projects_id: true },
      },
      projects_backlogs: {
        include: {
          projects_backlogs_statuses: true,
          tasks_template: {
            include: {
              checklist_template: { select: { id: true, name: true, checklist_type: true } },
              task_golden_rules: {
                where: { deleted_at: null },
                include: {
                  golden_rule: { select: { id: true, title: true, description: true, severity: true, is_active: true } },
                },
              },
              discipline: true,
              unity: true,
              equipaments_types: true,
            },
          },
          discipline: true,
          unity: true,
          equipaments_types: true,
          sections: true,
          rows: true,
          fields: true,
          trackers: {
            include: {
              trackers_types: true,
              manufacturers: true,
            },
          },
        },
      },
      subtasks: {
        include: {
          unity: true,
        },
      },
      sprints_tasks_statuses: { select: { id: true, status: true } },
      non_execution_reason: { select: { id: true, name: true, category: true } },
    };

    // Status 1 = Pendente
    const pendentes = await db.sprints_tasks.findMany({
      where: {
        ...baseWhere,
        sprints_tasks_statuses_id: 1,
      },
      include: includeRelations,
      orderBy: { created_at: 'desc' },
      skip: (input.pagePen - 1) * input.per_pagePen,
      take: input.per_pagePen,
    });

    const totalPendentes = await db.sprints_tasks.count({
      where: { ...baseWhere, sprints_tasks_statuses_id: 1 },
    });

    // Status 2 = Em Andamento (com filtro de scheduled_for)
    const whereAndamento = {
      ...baseWhere,
      sprints_tasks_statuses_id: 2,
      ...(scheduled_for ? { scheduled_for: new Date(scheduled_for) } : {}),
    };

    const emAndamento = await db.sprints_tasks.findMany({
      where: whereAndamento,
      include: includeRelations,
      orderBy: { created_at: 'desc' },
      skip: (input.pageAnd - 1) * input.per_pageAnd,
      take: input.per_pageAnd,
    });

    const totalEmAndamento = await db.sprints_tasks.count({
      where: whereAndamento,
    });

    // Status 3 = Concluida (quality_status_id da propria tarefa = 2 ou nulo - Aprovado)
    const whereConcluidas = {
      ...baseWhere,
      sprints_tasks_statuses_id: 3,
      OR: [
        { quality_status_id: 2 },
        { quality_status_id: null },
      ],
      ...(scheduled_for ? { scheduled_for: new Date(scheduled_for) } : {}),
    };

    const concluidas = await db.sprints_tasks.findMany({
      where: whereConcluidas,
      include: includeRelations,
      orderBy: { created_at: 'desc' },
      skip: (input.pageConc - 1) * input.per_pageConc,
      take: input.per_pageConc,
    });

    const totalConcluidas = await db.sprints_tasks.count({
      where: whereConcluidas,
    });

    // Status 4 = Sem Sucesso
    const whereSemSucesso = {
      ...baseWhere,
      sprints_tasks_statuses_id: 4,
      ...(scheduled_for ? { scheduled_for: new Date(scheduled_for) } : {}),
    };

    const semSucesso = await db.sprints_tasks.findMany({
      where: whereSemSucesso,
      include: includeRelations,
      orderBy: { created_at: 'desc' },
      skip: (input.pageSem - 1) * input.per_pageSem,
      take: input.per_pageSem,
    });

    const totalSemSucesso = await db.sprints_tasks.count({
      where: whereSemSucesso,
    });

    // Inspecao: status = 3 e quality_status_id da propria tarefa = 1 (pendente de revisao)
    const whereInspecao = {
      ...baseWhere,
      sprints_tasks_statuses_id: 3,
      quality_status_id: 1,
      ...(scheduled_for ? { scheduled_for: new Date(scheduled_for) } : {}),
    };

    const inspecao = await db.sprints_tasks.findMany({
      where: whereInspecao,
      include: includeRelations,
      orderBy: { created_at: 'desc' },
      skip: (input.pageIns - 1) * input.per_pageIns,
      take: input.per_pageIns,
    });

    const totalInspecao = await db.sprints_tasks.count({
      where: whereInspecao,
    });

    // Verifica se tem equipe criada
    const hasTeamCreated = await db.teams.findFirst({
      where: {
        projects_id,
        deleted_at: null,
      },
    });

    return {
      sprints_tasks_pendentes: {
        items: pendentes,
        curPage: input.pagePen,
        perPage: input.per_pagePen,
        itemsReceived: pendentes.length,
        itemsTotal: totalPendentes,
        pageTotal: Math.ceil(totalPendentes / input.per_pagePen),
      },
      sprints_tasks_em_andamento: {
        items: emAndamento,
        curPage: input.pageAnd,
        perPage: input.per_pageAnd,
        itemsReceived: emAndamento.length,
        itemsTotal: totalEmAndamento,
        pageTotal: Math.ceil(totalEmAndamento / input.per_pageAnd),
      },
      sprints_tasks_concluidas: {
        items: concluidas,
        curPage: input.pageConc,
        perPage: input.per_pageConc,
        itemsReceived: concluidas.length,
        itemsTotal: totalConcluidas,
        pageTotal: Math.ceil(totalConcluidas / input.per_pageConc),
      },
      sprints_tasks_sem_sucesso: {
        items: semSucesso,
        curPage: input.pageSem,
        perPage: input.per_pageSem,
        itemsReceived: semSucesso.length,
        itemsTotal: totalSemSucesso,
        pageTotal: Math.ceil(totalSemSucesso / input.per_pageSem),
      },
      sprints_tasks_inspecao: {
        items: inspecao,
        curPage: input.pageIns,
        perPage: input.per_pageIns,
        itemsReceived: inspecao.length,
        itemsTotal: totalInspecao,
        pageTotal: Math.ceil(totalInspecao / input.per_pageIns),
      },
      has_team_created: !!hasTeamCreated,
    };
  }

  /**
   * Busca tarefa de sprint por ID
   * Equivalente a: query sprints_tasks/{sprints_tasks_id} verb=GET do Xano (endpoint 521)
   */
  static async getTaskById(taskId: number) {
    const task = await db.sprints_tasks.findFirst({
      where: {
        id: taskId,
        deleted_at: null,
      },
      include: {
        sprints: true,
        teams: true,
        projects_backlogs: {
          include: {
            projects_backlogs_statuses: true,
            tasks_template: true,
          },
        },
        subtasks: true,
        sprints_tasks_statuses: true,
      },
    });

    if (!task) {
      throw new NotFoundError('Tarefa nao encontrada.');
    }

    return task;
  }

  /**
   * Cria tarefa de sprint
   * Equivalente a: query sprints_tasks verb=POST do Xano (endpoint 523)
   */
  static async createTask(input: CreateSprintTaskInput) {
    const created = await db.sprints_tasks.create({
      data: {
        sprints_id: input.sprints_id,
        projects_backlogs_id: input.projects_backlogs_id,
        teams_id: input.teams_id || null,
        subtasks_id: input.subtasks_id || null,
        sprints_tasks_statuses_id: input.sprints_tasks_statuses_id || 1,
        scheduled_for: input.scheduled_for ? new Date(input.scheduled_for) : null,
        quantity_assigned: input.quantity_assigned ?? null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    // Marca backlog como adicionado ao sprint
    if (input.projects_backlogs_id) {
      await db.projects_backlogs.update({
        where: { id: BigInt(input.projects_backlogs_id) },
        data: { sprint_added: true, updated_at: new Date() },
      });
    }

    // Se tem subtask, tambem marca como adicionada ao sprint
    if (input.subtasks_id) {
      await db.subtasks.update({
        where: { id: BigInt(input.subtasks_id) },
        data: { sprint_added: true, updated_at: new Date() },
      });
    }

    // Recalcula progresso do sprint ao adicionar nova tarefa
    const { ProgressRollupService } = await import('../../services/progressRollup');
    await ProgressRollupService.updateSprintProgress(input.sprints_id);

    return created;
  }

  /**
   * Atualiza tarefa de sprint
   * Equivalente a: query sprints_tasks/{sprints_tasks_id} verb=PATCH do Xano (endpoint 524)
   */
  static async updateTask(taskId: number, input: UpdateSprintTaskInput) {
    const existing = await db.sprints_tasks.findFirst({
      where: {
        id: taskId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Tarefa nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.teams_id !== undefined) updateData.teams_id = input.teams_id;
    if (input.sprints_tasks_statuses_id !== undefined) updateData.sprints_tasks_statuses_id = input.sprints_tasks_statuses_id;
    if (input.scheduled_for !== undefined) {
      updateData.scheduled_for = input.scheduled_for ? new Date(input.scheduled_for) : null;
    }
    if (input.end_date !== undefined) {
      updateData.executed_at = input.end_date ? new Date(input.end_date) : null;
    }
    if (input.quantity_assigned !== undefined) updateData.quantity_assigned = input.quantity_assigned;
    if (input.quantity_done !== undefined) updateData.quantity_done = input.quantity_done;
    if (input.non_execution_reason_id !== undefined) updateData.non_execution_reason_id = input.non_execution_reason_id;
    if (input.non_execution_observations !== undefined) updateData.non_execution_observations = input.non_execution_observations;
    if (input.failure_responsible !== undefined) updateData.failure_responsible = input.failure_responsible;

    return db.sprints_tasks.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  /**
   * Remove tarefa de sprint (soft delete)
   * Equivalente a: query sprints_tasks/{sprints_tasks_id} verb=DELETE do Xano (endpoint 520)
   */
  static async deleteTask(taskId: number) {
    const existing = await db.sprints_tasks.findFirst({
      where: {
        id: taskId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Tarefa nao encontrada.');
    }

    await db.sprints_tasks.update({
      where: { id: taskId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Tarefa removida com sucesso' };
  }

  /**
   * Atualiza status da tarefa
   * Equivalente a: query update_sprint_task_status verb=PUT do Xano (endpoint 591)
   */
  static async updateTaskStatus(input: UpdateSprintTaskStatusInput, userId?: number) {
    const existing = await db.sprints_tasks.findFirst({
      where: {
        id: input.sprints_tasks_id,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Tarefa nao encontrada.');
    }

    const oldStatusId = existing.sprints_tasks_statuses_id;
    const newStatusId = input.sprints_tasks_statuses_id;

    const updateData: any = {
      sprints_tasks_statuses_id: newStatusId,
      updated_at: new Date(),
    };

    if (input.quantity_done !== undefined) {
      updateData.quantity_done = input.quantity_done;
    }

    // Se status for concluida, define executed_at e quantity_done default
    if (newStatusId === SPRINT_TASK_STATUS.CONCLUIDA) {
      updateData.executed_at = new Date();
      // Se quantity_done nao foi informado, usa quantity_assigned como default
      if (input.quantity_done === undefined && existing.quantity_assigned) {
        updateData.quantity_done = existing.quantity_assigned;
      }
    }

    const updated = await db.sprints_tasks.update({
      where: { id: input.sprints_tasks_id },
      data: updateData,
    });

    // Registra change log para burndown e historico
    if (oldStatusId !== BigInt(newStatusId)) {
      await db.sprint_task_change_log.create({
        data: {
          sprints_tasks_id: input.sprints_tasks_id,
          users_id: userId ? BigInt(userId) : null,
          changed_field: 'sprints_tasks_statuses_id',
          old_value: String(oldStatusId),
          new_value: String(newStatusId),
          date: new Date(),
        },
      });
    }

    // Se concluida, marca a propria tarefa como pendente de inspecao (quality_status_id = 1)
    if (newStatusId === SPRINT_TASK_STATUS.CONCLUIDA) {
      await db.sprints_tasks.update({
        where: { id: input.sprints_tasks_id },
        data: { quality_status_id: 1 } as any,
      });
    }

    // Se Em Andamento (2), define actual_start_date no backlog (se ainda nao definida)
    if (newStatusId === 2 && existing.projects_backlogs_id) {
      await db.$executeRaw`
        UPDATE projects_backlogs SET
          actual_start_date = COALESCE(actual_start_date, CURRENT_DATE),
          updated_at = NOW()
        WHERE id = ${existing.projects_backlogs_id} AND deleted_at IS NULL
      `;
    }

    // Dispara rollup de progresso
    const { ProgressRollupService } = await import('../../services/progressRollup');
    await ProgressRollupService.rollupFromSprintTask(Number(input.sprints_tasks_id));

    return updated;
  }

  /**
   * Atualiza status de multiplas tarefas
   * Equivalente a: query update_lista_sprint_task_status verb=PUT do Xano (endpoint 631)
   */
  static async updateListTaskStatus(input: UpdateListSprintTaskStatusInput, userId?: number) {
    const results = await Promise.all(
      input.tasks.map(async (task) => {
        // Busca status anterior para o change log
        const existing = await db.sprints_tasks.findFirst({
          where: { id: task.sprints_tasks_id },
          select: { sprints_tasks_statuses_id: true },
        });

        const updated = await db.sprints_tasks.update({
          where: { id: task.sprints_tasks_id },
          data: {
            sprints_tasks_statuses_id: task.sprints_tasks_statuses_id,
            updated_at: new Date(),
            ...(task.sprints_tasks_statuses_id === SPRINT_TASK_STATUS.CONCLUIDA
              ? { executed_at: new Date(), quality_status_id: 1 }
              : {}),
          },
        });

        // Registra change log para burndown e historico
        if (existing && existing.sprints_tasks_statuses_id !== BigInt(task.sprints_tasks_statuses_id)) {
          await db.sprint_task_change_log.create({
            data: {
              sprints_tasks_id: task.sprints_tasks_id,
              users_id: userId ? BigInt(userId) : null,
              changed_field: 'sprints_tasks_statuses_id',
              old_value: String(existing.sprints_tasks_statuses_id),
              new_value: String(task.sprints_tasks_statuses_id),
              date: new Date(),
            },
          });
        }

        return updated;
      })
    );

    // Dispara rollup para cada tarefa atualizada
    const { ProgressRollupService } = await import('../../services/progressRollup');
    for (const task of input.tasks) {
      await ProgressRollupService.rollupFromSprintTask(Number(task.sprints_tasks_id));
    }

    return results;
  }

  // =============================================================================
  // SPRINT TASK STATUSES
  // =============================================================================

  /**
   * Lista status de tarefas de sprint
   * Equivalente a: query sprints_tasks_statuses verb=GET do Xano (endpoint 532)
   */
  static async listTaskStatuses(page: number = 1, perPage: number = 20) {
    const total = await db.sprints_tasks_statuses.count({
      where: { deleted_at: null },
    });

    const statuses = await db.sprints_tasks_statuses.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: statuses,
      curPage: page,
      perPage,
      itemsReceived: statuses.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca status de tarefa por ID
   * Equivalente a: query sprints_tasks_statuses/{id} verb=GET do Xano (endpoint 531)
   */
  static async getTaskStatusById(statusId: number) {
    const status = await db.sprints_tasks_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!status) {
      throw new NotFoundError('Status nao encontrado.');
    }

    return status;
  }

  /**
   * Cria status de tarefa de sprint
   * Equivalente a: query sprints_tasks_statuses verb=POST do Xano (endpoint 533)
   */
  static async createTaskStatus(input: CreateSprintTaskStatusInput) {
    return db.sprints_tasks_statuses.create({
      data: {
        status: input.status,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });
  }

  /**
   * Atualiza status de tarefa de sprint
   * Equivalente a: query sprints_tasks_statuses/{id} verb=PATCH do Xano (endpoint 534)
   */
  static async updateTaskStatusRecord(statusId: number, input: CreateSprintTaskStatusInput) {
    const existing = await db.sprints_tasks_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Status nao encontrado.');
    }

    return db.sprints_tasks_statuses.update({
      where: { id: statusId },
      data: {
        status: input.status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove status de tarefa de sprint
   * Equivalente a: query sprints_tasks_statuses/{id} verb=DELETE do Xano (endpoint 530)
   */
  static async deleteTaskStatus(statusId: number) {
    const existing = await db.sprints_tasks_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Status nao encontrado.');
    }

    await db.sprints_tasks_statuses.update({
      where: { id: statusId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Status removido com sucesso' };
  }

  // =============================================================================
  // QUALITY STATUS
  // =============================================================================

  /**
   * Lista quality status
   * Equivalente a: query quality_status verb=GET do Xano (endpoint 654)
   */
  static async listQualityStatus(page: number = 1, perPage: number = 20) {
    const total = await db.quality_status.count();

    const statuses = await db.quality_status.findMany({
      orderBy: { id: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: statuses,
      curPage: page,
      perPage,
      itemsReceived: statuses.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca quality status por ID
   * Equivalente a: query quality_status/{id} verb=GET do Xano (endpoint 653)
   */
  static async getQualityStatusById(statusId: number) {
    const status = await db.quality_status.findFirst({
      where: {
        id: statusId,
      },
    });

    if (!status) {
      throw new NotFoundError('Quality status nao encontrado.');
    }

    return status;
  }

  /**
   * Cria quality status
   * Equivalente a: query quality_status verb=POST do Xano (endpoint 655)
   */
  static async createQualityStatus(input: CreateQualityStatusInput) {
    return db.quality_status.create({
      data: {
        status: input.status,
        created_at: new Date(),
      },
    });
  }

  /**
   * Atualiza quality status
   * Equivalente a: query quality_status/{id} verb=PATCH do Xano (endpoint 656)
   */
  static async updateQualityStatus(statusId: number, input: CreateQualityStatusInput) {
    const existing = await db.quality_status.findFirst({
      where: {
        id: statusId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Quality status nao encontrado.');
    }

    return db.quality_status.update({
      where: { id: statusId },
      data: {
        status: input.status,
      },
    });
  }

  /**
   * Remove quality status
   * Equivalente a: query quality_status/{id} verb=DELETE do Xano (endpoint 652)
   */
  static async deleteQualityStatus(statusId: number) {
    const existing = await db.quality_status.findFirst({
      where: {
        id: statusId,
      },
    });

    if (!existing) {
      throw new NotFoundError('Quality status nao encontrado.');
    }

    // quality_status nao tem soft delete - faz hard delete
    await db.quality_status.delete({
      where: { id: statusId },
    });

    return { message: 'Quality status removido com sucesso' };
  }

  /**
   * Atualiza inspecao
   * Equivalente a: query update_inspection verb=POST do Xano (endpoint 669)
   */
  static async updateInspection(input: UpdateInspectionInput, userId?: number) {
    const task = await db.sprints_tasks.findFirst({
      where: { id: input.sprints_tasks_id, deleted_at: null },
      include: { projects_backlogs: true },
    });

    if (!task) throw new NotFoundError('Tarefa nao encontrada.');

    const isRejected = input.quality_status_id !== 2;
    const oldQualityStatusId = task.quality_status_id ? Number(task.quality_status_id) : null;

    const qualityUpdateData: any = {
      quality_status_id: input.quality_status_id,
      updated_at: new Date(),
    };

    if (isRejected) {
      qualityUpdateData.sprints_tasks_statuses_id = 1;
      qualityUpdateData.is_reproved = true;
      qualityUpdateData.reproved_count = { increment: 1 };
    } else {
      qualityUpdateData.is_reproved = false;
    }

    await db.sprints_tasks.update({
      where: { id: input.sprints_tasks_id },
      data: qualityUpdateData,
    });

    // Registra no historico de movimentos
    await (db.sprint_task_change_log as any).create({
      data: {
        sprints_tasks_id: input.sprints_tasks_id,
        users_id: userId ? BigInt(userId) : null,
        changed_field: 'quality_status_id',
        old_value: oldQualityStatusId != null ? String(oldQualityStatusId) : null,
        new_value: String(input.quality_status_id),
        observation: input.observation ?? null,
        date: new Date(),
      },
    });

    if (!isRejected) {
      const { ProgressRollupService } = await import('../../services/progressRollup');
      await ProgressRollupService.rollupFromSprintTask(Number(input.sprints_tasks_id));
    }

    return {
      message: isRejected ? 'Inspecao reprovada' : 'Inspecao aprovada',
      is_rejected: isRejected,
    };
  }

  /**
   * Busca historico de movimentos de uma tarefa
   */
  static async getTaskChangeLog(taskId: number) {
    const logs = await (db.sprint_task_change_log as any).findMany({
      where: { sprints_tasks_id: taskId },
      include: { users: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
    });
    return logs;
  }

  /**
   * Finaliza subtask
   * Equivalente a: query end_subtask verb=PUT do Xano (endpoint 668)
   */
  static async endSubtask(input: EndSubtaskInput) {
    const task = await db.sprints_tasks.findFirst({
      where: {
        id: input.sprints_tasks_id,
        deleted_at: null,
      },
    });

    if (!task) {
      throw new NotFoundError('Tarefa nao encontrada.');
    }

    // quantity_done informado pelo usuario, ou usa quantity_assigned como default
    const qtyDone = input.quantity_done ?? (task.quantity_assigned ? Number(task.quantity_assigned) : 0);

    const updated = await db.sprints_tasks.update({
      where: { id: input.sprints_tasks_id },
      data: {
        sprints_tasks_statuses_id: SPRINT_TASK_STATUS.CONCLUIDA,
        quantity_done: qtyDone,
        executed_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Recalcula quantity_done da subtask como soma de todas sprint tasks concluidas
    if (task.subtasks_id) {
      await db.$executeRaw`
        UPDATE subtasks SET
          quantity_done = (
            SELECT COALESCE(SUM(st.quantity_done), 0)
            FROM sprints_tasks st
            WHERE st.subtasks_id = ${task.subtasks_id}
              AND st.deleted_at IS NULL
              AND st.sprints_tasks_statuses_id = ${SPRINT_TASK_STATUS.CONCLUIDA}
          ),
          updated_at = NOW()
        WHERE id = ${task.subtasks_id}
      `;
    }

    // Dispara rollup de progresso
    const { ProgressRollupService } = await import('../../services/progressRollup');
    await ProgressRollupService.rollupFromSprintTask(Number(input.sprints_tasks_id));

    return updated;
  }

  /**
   * Contagem de subtasks
   * Equivalente a: query counts_subtasks verb=GET do Xano (endpoint 712)
   */
  static async countSubtasks(backlogId: number) {
    // Busca o backlog para pegar quantity (total_pai)
    const backlog = await db.projects_backlogs.findFirst({
      where: { id: backlogId },
      select: { quantity: true },
    });

    const totalPai = backlog?.quantity ? Number(backlog.quantity) : 0;

    // Busca todas as subtasks do backlog
    const subtasks = await db.subtasks.findMany({
      where: {
        projects_backlogs_id: backlogId,
        deleted_at: null,
      },
      select: { quantity: true, quantity_done: true },
    });

    let totalSomaFilhos = 0;
    let totalDoneFilhos = 0;

    if (subtasks.length > 0) {
      totalSomaFilhos = subtasks.reduce((sum, s) => sum + (s.quantity ? Number(s.quantity) : 0), 0);
      totalDoneFilhos = subtasks.reduce((sum, s) => sum + (s.quantity_done ? Number(s.quantity_done) : 0), 0);
    }

    const totalDisponivelCriacao = totalPai - totalSomaFilhos;

    return {
      total_pai: totalPai,
      total_soma_filhos: totalSomaFilhos,
      total_done_filhos: totalDoneFilhos,
      total_disponivel_criacao: totalDisponivelCriacao,
    };
  }

  /**
   * Grafico de sprint
   * Equivalente a: query sprints_grafico_filter verb=GET do Xano (endpoint 629)
   */
  static async getChartData(sprintId: number, teamsId?: number | null) {
    const whereBase: any = {
      sprints_id: sprintId,
      deleted_at: null,
    };

    if (teamsId) {
      whereBase.teams_id = teamsId;
    }

    // Conta por status
    const pendentes = await db.sprints_tasks.count({
      where: { ...whereBase, sprints_tasks_statuses_id: 1 },
    });

    const emAndamento = await db.sprints_tasks.count({
      where: { ...whereBase, sprints_tasks_statuses_id: 2 },
    });

    const concluidas = await db.sprints_tasks.count({
      where: { ...whereBase, sprints_tasks_statuses_id: 3 },
    });

    const semSucesso = await db.sprints_tasks.count({
      where: { ...whereBase, sprints_tasks_statuses_id: 4 },
    });

    const total = pendentes + emAndamento + concluidas + semSucesso;

    return {
      total,
      pendentes,
      em_andamento: emAndamento,
      concluidas,
      sem_sucesso: semSucesso,
      percentual_concluido: total > 0 ? Math.round((concluidas / total) * 100) : 0,
    };
  }
}

export default SprintsService;
