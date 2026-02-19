// =============================================================================
// INDUSTRYVIEW BACKEND - Projects Module Service
// Service de projetos
// Equivalente a logica dos endpoints do api_group Projects do Xano
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { normalizeText } from '../../utils/helpers';
import {
  ListProjectsInput,
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectBacklogsInput,
  CreateProjectBacklogInput,
  UpdateProjectBacklogInput,
  CreateBulkBacklogsInput,
  CreateManualBacklogInput,
  CreateSubtaskInput,
  UpdateSubtaskInput,
  CreateProjectUserInput,
  CreateProjectStatusInput,
  CreateWorksSituationInput,
  FiltersProjectBacklogInput,
} from './projects.schema';

/**
 * ProjectsService - Service do modulo de projetos
 */
export class ProjectsService {
  /**
   * Lista projetos com paginacao e filtros
   * Equivalente a: query projects verb=GET do Xano (endpoint 492)
   */
  static async list(input: ListProjectsInput) {
    const { page, per_page, search, company_id, sort_field, sort_direction } = input;

    // Base query conditions
    const whereConditions: any = {
      deleted_at: null,
      projects_statuses_id: { not: 4 }, // Exclui status 4 (arquivado/excluido)
    };

    // Filtro por empresa
    if (company_id) {
      whereConditions.company_id = company_id;
    }

    // Filtro de busca
    if (search && search.trim() !== '') {
      const searchNormalized = normalizeText(search);
      whereConditions.name_normalized = { contains: searchNormalized };
    }

    // Conta total de registros
    const total = await db.projects.count({ where: whereConditions });

    // Busca projetos com paginacao incluindo status e situacao
    const projects = await db.projects.findMany({
      where: whereConditions,
      include: {
        projects_statuses: { select: { id: true, status: true } },
        projects_works_situations: { select: { id: true, status: true } },
      },
      orderBy: (() => {
        const ALLOWED_SORT_FIELDS = ['name', 'registration_number', 'responsible', 'projects_statuses_id', 'completion_percentage', 'created_at'];
        if (sort_field === 'status_name') {
          return { projects_statuses: { status: sort_direction || 'asc' } };
        }
        if (sort_field && ALLOWED_SORT_FIELDS.includes(sort_field)) {
          return { [sort_field]: sort_direction || 'asc' };
        }
        return { id: 'desc' };
      })(),
      skip: (page - 1) * per_page,
      take: per_page,
    });

    // Busca dados agregados de cronograma para todos os projetos de uma vez
    const projectIds = projects.map((p) => p.id);

    // Query agregada: progresso real, total de tarefas, concluidas, em andamento
    const scheduleStats = projectIds.length > 0
      ? await db.$queryRaw<{
          projects_id: bigint;
          total_tasks: bigint;
          completed_tasks: bigint;
          in_progress_tasks: bigint;
          weighted_progress: number | null;
          total_weight: number | null;
        }[]>`
        SELECT
          projects_id,
          COUNT(*) AS total_tasks,
          COUNT(*) FILTER (WHERE COALESCE(percent_complete, 0) >= 100) AS completed_tasks,
          COUNT(*) FILTER (WHERE COALESCE(percent_complete, 0) > 0 AND COALESCE(percent_complete, 0) < 100) AS in_progress_tasks,
          SUM(COALESCE(percent_complete, 0) * COALESCE(weight, 1)) AS weighted_progress,
          SUM(COALESCE(weight, 1)) AS total_weight
        FROM projects_backlogs
        WHERE projects_id = ANY(${projectIds}::bigint[])
          AND deleted_at IS NULL
        GROUP BY projects_id
      `
      : [];

    const statsMap = new Map(
      scheduleStats.map((s) => [
        Number(s.projects_id),
        {
          total_tasks: Number(s.total_tasks),
          completed_tasks: Number(s.completed_tasks),
          in_progress_tasks: Number(s.in_progress_tasks),
          actual_progress: s.total_weight && Number(s.total_weight) > 0
            ? Math.round((Number(s.weighted_progress) / Number(s.total_weight)) * 100) / 100
            : 0,
        },
      ])
    );

    // Busca ultimo time criado para cada projeto
    const projectsEnriched = await Promise.all(
      projects.map(async (project) => {
        const lastTeam = await db.teams.findFirst({
          where: {
            projects_id: project.id,
            deleted_at: null,
          },
          orderBy: { created_at: 'desc' },
          select: { id: true, name: true },
        });

        const stats = statsMap.get(Number(project.id));
        const statusName = project.projects_statuses?.status ?? null;
        const workSituationName = project.projects_works_situations?.status ?? null;

        return {
          ...project,
          status_name: statusName,
          work_situation_name: workSituationName,
          last_team_created: lastTeam || null,
          schedule_total_tasks: stats?.total_tasks ?? 0,
          schedule_completed_tasks: stats?.completed_tasks ?? 0,
          schedule_in_progress_tasks: stats?.in_progress_tasks ?? 0,
          schedule_actual_progress: stats?.actual_progress ?? 0,
        };
      })
    );

    return {
      items: projectsEnriched,
      curPage: page,
      perPage: per_page,
      itemsReceived: projectsEnriched.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Cria um novo projeto
   * Equivalente a: query projects verb=POST do Xano (endpoint 493)
   */
  static async create(input: CreateProjectInput, fileUrl?: string | null) {
    const result = await db.$transaction(async (tx) => {
      // Cria projeto
      const project = await tx.projects.create({
        data: {
          registration_number: input.registration_number || null,
          name: input.name,
          name_normalized: normalizeText(input.name),
          project_creation_date: input.project_creation_date ? new Date(input.project_creation_date) : null,
          origin_registration: input.origin_registration || null,
          art: input.art || null,
          rrt: input.rrt || null,
          cib: input.cib || null,
          real_state_registration: input.real_state_registration || null,
          start_date: input.start_date ? new Date(input.start_date) : null,
          permit_number: input.permit_number || null,
          cnae: input.cnae || null,
          situation_date: input.situation_date ? new Date(input.situation_date) : null,
          responsible: input.responsible || null,
          cep: input.cep || null,
          city: input.city || null,
          number: input.number || null,
          state: input.state || null,
          country: input.country || null,
          street: input.street || null,
          neighbourhood: input.neighbourhood || null,
          complement: input.complement || null,
          cnpj: input.cnpj || null,
          completion_percentage: 0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          projects_statuses_id: input.projects_statuses_id || 1,
          projects_works_situations_id: input.projects_works_situations_id || null,
          category: input.category || null,
          destination: input.destination || null,
          project_work_type: input.project_work_type || null,
          resulting_work_area: input.resulting_work_area?.toString() || null,
          company_id: input.company_id ? BigInt(input.company_id) : null,
          cno_file: fileUrl || null,
        },
      });

      if (!project) {
        throw new BadRequestError('Falha ao cadastrar projeto.');
      }

      // Cria steps do projeto
      await tx.projects_steps.create({
        data: {
          projects_id: project.id,
          created_at: new Date(),
          updated_at: new Date(),
          projects_config_status: 1,
          projects_map_config_status: 2,
          projects_teams_config_status: 3,
          projects_backlog_config_status: 3,
          projects_sprint_config_status: 4,
          projects_report_config_status: 5,
        },
      });

      return project;
    });

    return result;
  }

  /**
   * Busca projeto por ID
   * Equivalente a: query projects/{projects_id} verb=GET do Xano (endpoint 491)
   * @param companyId - quando fornecido, garante isolamento multi-tenant
   */
  static async getById(projectId: number, companyId?: number) {
    const where: any = {
      id: projectId,
      deleted_at: null,
    };

    // Isolamento multi-tenant: so retorna o projeto se pertencer a empresa do usuario
    if (companyId) {
      where.company_id = BigInt(companyId);
    }

    const project = await db.projects.findFirst({
      where,
      include: {
        projects_statuses: true,
        projects_works_situations: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Not Found.');
    }

    return project;
  }

  /**
   * Atualiza projeto
   * Equivalente a: query projects/{projects_id} verb=PATCH do Xano (endpoint 494)
   */
  static async update(projectId: number, input: UpdateProjectInput, fileUrl?: string | null) {
    const existingProject = await db.projects.findFirst({
      where: {
        id: projectId,
        deleted_at: null,
      },
    });

    if (!existingProject) {
      throw new NotFoundError('Projeto nao encontrado.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    // Atualiza campos se fornecidos
    if (input.registration_number !== undefined) updateData.registration_number = input.registration_number;
    if (input.name !== undefined) {
      updateData.name = input.name;
      updateData.name_normalized = normalizeText(input.name);
    }
    if (input.project_creation_date !== undefined) {
      updateData.project_creation_date = input.project_creation_date ? new Date(input.project_creation_date) : null;
    }
    if (input.origin_registration !== undefined) updateData.origin_registration = input.origin_registration;
    if (input.art !== undefined) updateData.art = input.art;
    if (input.rrt !== undefined) updateData.rrt = input.rrt;
    if (input.cib !== undefined) updateData.cib = input.cib;
    if (input.real_state_registration !== undefined) updateData.real_state_registration = input.real_state_registration;
    if (input.start_date !== undefined) {
      updateData.start_date = input.start_date ? new Date(input.start_date) : null;
    }
    if (input.permit_number !== undefined) updateData.permit_number = input.permit_number;
    if (input.cnae !== undefined) updateData.cnae = input.cnae;
    if (input.situation_date !== undefined) {
      updateData.situation_date = input.situation_date ? new Date(input.situation_date) : null;
    }
    if (input.responsible !== undefined) updateData.responsible = input.responsible;
    if (input.cep !== undefined) updateData.cep = input.cep;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.number !== undefined) updateData.number = input.number;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.street !== undefined) updateData.street = input.street;
    if (input.neighbourhood !== undefined) updateData.neighbourhood = input.neighbourhood;
    if (input.complement !== undefined) updateData.complement = input.complement;
    if (input.cnpj !== undefined) updateData.cnpj = input.cnpj;
    if (input.completion_percentage !== undefined) updateData.completion_percentage = input.completion_percentage;
    if (input.projects_statuses_id !== undefined) updateData.projects_statuses_id = input.projects_statuses_id;
    if (input.projects_works_situations_id !== undefined) updateData.projects_works_situations_id = input.projects_works_situations_id;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.destination !== undefined) updateData.destination = input.destination;
    if (input.project_work_type !== undefined) updateData.project_work_type = input.project_work_type;
    if (input.resulting_work_area !== undefined) updateData.resulting_work_area = input.resulting_work_area != null ? String(input.resulting_work_area) : null;
    if (fileUrl !== undefined) updateData.cno_file = fileUrl;

    const project = await db.projects.update({
      where: { id: projectId },
      data: updateData,
    });

    if (!project) {
      throw new BadRequestError('Falha ao atualizar dados do projeto.');
    }

    return project;
  }

  /**
   * Remove projeto (soft delete)
   * Equivalente a: query projects/{projects_id} verb=DELETE do Xano (endpoint 490)
   */
  static async delete(projectId: number) {
    const existingProject = await db.projects.findFirst({
      where: {
        id: projectId,
        deleted_at: null,
      },
    });

    if (!existingProject) {
      throw new NotFoundError('Projeto nao encontrado.');
    }

    await db.projects.update({
      where: { id: projectId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Projeto removido com sucesso' };
  }

  // =============================================================================
  // PROJECT STATUSES
  // =============================================================================

  /**
   * Lista status de projetos
   * Equivalente a: query projects_statuses verb=GET do Xano (endpoint 487)
   */
  static async listStatuses(page: number = 1, perPage: number = 20) {
    const total = await db.projects_statuses.count({
      where: { deleted_at: null },
    });

    const statuses = await db.projects_statuses.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const itemsRequest = statuses.map((s) => ({
      ...s,
      id: Number(s.id),
      name: s.status,
    }));

    // Se paginação não foi solicitada explicitamente (padrão 1 e 20),
    // ou se o frontend espera lista direta, retornamos itemsRequest diretamente
    // FIXME: Isso é um hack para compatibilidade com o frontend FlutterFlow que espera lista na raiz
    // Idealmente o frontend deveria tratar a resposta paginada ou ter um endpoint específico 'all'
    if (!perPage || perPage === 20) {
      // Retornar objeto paginado como antes pode quebrar, mas
      // vamos testar retornar a lista direta dentro de 'items' E 'json' misto? Não.
      // O FlutterFlow espera `$[:].id`. Isso implica lista na raiz.
      // Vamos arriscar retornar lista direta.
      // Mas o controller pega .json(result).
      // Se retornarmos itemsRequest, será `[{}, {}]`.
      return itemsRequest;
    }

    return {
      items: itemsRequest,
      curPage: page,
      perPage,
      itemsReceived: statuses.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca status por ID
   * Equivalente a: query projects_statuses/{projects_statuses_id} verb=GET do Xano (endpoint 486)
   */
  static async getStatusById(statusId: number) {
    const status = await db.projects_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!status) {
      throw new NotFoundError('Status nao encontrado.');
    }

    return {
      ...status,
      id: Number(status.id),
    };
  }

  /**
   * Cria status de projeto
   * Equivalente a: query projects_statuses verb=POST do Xano (endpoint 488)
   */
  static async createStatus(input: CreateProjectStatusInput) {
    return db.projects_statuses.create({
      data: {
        status: input.status,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });
  }

  /**
   * Atualiza status de projeto
   * Equivalente a: query projects_statuses/{projects_statuses_id} verb=PATCH do Xano (endpoint 489)
   */
  static async updateStatus(statusId: number, input: CreateProjectStatusInput) {
    const existingStatus = await db.projects_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!existingStatus) {
      throw new NotFoundError('Status nao encontrado.');
    }

    return db.projects_statuses.update({
      where: { id: statusId },
      data: {
        status: input.status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove status de projeto
   * Equivalente a: query projects_statuses/{projects_statuses_id} verb=DELETE do Xano (endpoint 485)
   */
  static async deleteStatus(statusId: number) {
    const existingStatus = await db.projects_statuses.findFirst({
      where: {
        id: statusId,
        deleted_at: null,
      },
    });

    if (!existingStatus) {
      throw new NotFoundError('Status nao encontrado.');
    }

    await db.projects_statuses.update({
      where: { id: statusId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Status removido com sucesso' };
  }

  // =============================================================================
  // WORKS SITUATIONS
  // =============================================================================

  /**
   * Lista situacoes de obra
   * Equivalente a: query projects_works_situations verb=GET do Xano (endpoint 567)
   */
  static async listWorksSituations(page: number = 1, perPage: number = 20) {
    const total = await db.projects_works_situations.count({
      where: { deleted_at: null },
    });

    const situations = await db.projects_works_situations.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const itemsRequest = situations.map((s) => ({
      ...s,
      id: Number(s.id),
      name: s.status,
    }));

    // Hack para compatibilidade FlutterFlow (lista na raiz)
    if (!perPage || perPage === 20) {
      return itemsRequest;
    }

    return {
      items: itemsRequest,
      curPage: page,
      perPage,
      itemsReceived: situations.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca situacao de obra por ID
   * Equivalente a: query projects_works_situations/{id} verb=GET do Xano (endpoint 566)
   */
  static async getWorksSituationById(situationId: number) {
    const situation = await db.projects_works_situations.findFirst({
      where: {
        id: situationId,
        deleted_at: null,
      },
    });

    if (!situation) {
      throw new NotFoundError('Situacao nao encontrada.');
    }

    return {
      ...situation,
      id: Number(situation.id),
    };
  }

  /**
   * Cria situacao de obra
   * Equivalente a: query projects_works_situations verb=POST do Xano (endpoint 568)
   */
  static async createWorksSituation(input: CreateWorksSituationInput) {
    return db.projects_works_situations.create({
      data: {
        status: input.situation,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });
  }

  /**
   * Atualiza situacao de obra
   * Equivalente a: query projects_works_situations/{id} verb=PATCH do Xano (endpoint 569)
   */
  static async updateWorksSituation(situationId: number, input: CreateWorksSituationInput) {
    const existingSituation = await db.projects_works_situations.findFirst({
      where: {
        id: situationId,
        deleted_at: null,
      },
    });

    if (!existingSituation) {
      throw new NotFoundError('Situacao nao encontrada.');
    }

    return db.projects_works_situations.update({
      where: { id: situationId },
      data: {
        status: input.situation,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove situacao de obra
   * Equivalente a: query projects_works_situations/{id} verb=DELETE do Xano (endpoint 565)
   */
  static async deleteWorksSituation(situationId: number) {
    const existingSituation = await db.projects_works_situations.findFirst({
      where: {
        id: situationId,
        deleted_at: null,
      },
    });

    if (!existingSituation) {
      throw new NotFoundError('Situacao nao encontrada.');
    }

    await db.projects_works_situations.update({
      where: { id: situationId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Situacao removida com sucesso' };
  }

  // =============================================================================
  // PROJECT USERS
  // =============================================================================

  /**
   * Lista usuarios do projeto
   * Equivalente a: query projects_users verb=GET do Xano (endpoint 437)
   */
  static async listProjectUsers(projectId?: number, page: number = 1, perPage: number = 20) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (projectId) {
      whereConditions.projects_id = projectId;
    }

    const total = await db.projects_users.count({ where: whereConditions });

    const projectUsers = await db.projects_users.findMany({
      where: whereConditions,
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
        projects: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: projectUsers,
      curPage: page,
      perPage,
      itemsReceived: projectUsers.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca associacao usuario-projeto por ID
   * Equivalente a: query projects_users/{projects_users_id} verb=GET do Xano (endpoint 436)
   */
  static async getProjectUserById(projectUserId: number) {
    const projectUser = await db.projects_users.findFirst({
      where: {
        id: projectUserId,
        deleted_at: null,
      },
      include: {
        users: true,
        projects: true,
      },
    });

    if (!projectUser) {
      throw new NotFoundError('Associacao nao encontrada.');
    }

    return projectUser;
  }

  /**
   * Associa usuario ao projeto
   * Equivalente a: query projects_users verb=POST do Xano (endpoint 438)
   */
  static async createProjectUser(input: CreateProjectUserInput) {
    // Verifica se ja existe associacao
    const existing = await db.projects_users.findFirst({
      where: {
        users_id: input.users_id,
        projects_id: input.projects_id,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestError('Usuario ja esta associado a este projeto.');
    }

    return db.projects_users.create({
      data: {
        users_id: input.users_id,
        projects_id: input.projects_id,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });
  }

  /**
   * Remove associacao usuario-projeto
   * Equivalente a: query projects_users/{projects_users_id} verb=DELETE do Xano (endpoint 435)
   */
  static async deleteProjectUser(projectUserId: number) {
    const existing = await db.projects_users.findFirst({
      where: {
        id: projectUserId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Associacao nao encontrada.');
    }

    await db.projects_users.update({
      where: { id: projectUserId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Associacao removida com sucesso' };
  }

  // =============================================================================
  // PROJECT BACKLOGS
  // =============================================================================

  /**
   * Lista backlogs do projeto
   * Equivalente a: query projects_backlogs_list/{projects_id} verb=POST do Xano (endpoint 572)
   */
  static async listBacklogs(projectId: number, input: ListProjectBacklogsInput) {
    const { page, per_page, search, sprint_added, projects_backlogs_statuses_id, tasks_types_id, discipline_id, sort_field, sort_direction } = input;

    const whereConditions: any = {
      deleted_at: null,
      projects_id: projectId,
    };

    // Filtro por sprint_added
    if (sprint_added !== undefined && sprint_added !== null) {
      whereConditions.sprint_added = sprint_added;
    }

    // Filtro por status
    if (projects_backlogs_statuses_id && projects_backlogs_statuses_id.length > 0) {
      whereConditions.projects_backlogs_statuses_id = { in: projects_backlogs_statuses_id };
    }

    // Filtro por tipo de tarefa
    if (tasks_types_id && tasks_types_id.length > 0) {
      whereConditions.tasks_types_id = { in: tasks_types_id };
    }

    // Filtro por disciplina
    if (discipline_id && discipline_id.length > 0) {
      whereConditions.discipline_id = { in: discipline_id };
    }

    // Filtro de busca
    if (search && search.trim() !== '') {
      const searchNormalized = normalizeText(search);
      whereConditions.description_normalized = { contains: searchNormalized };
    }

    const total = await db.projects_backlogs.count({ where: whereConditions });

    const backlogs = await db.projects_backlogs.findMany({
      where: whereConditions,
      select: {
        id: true,
        projects_id: true,
        tasks_template_id: true,
        projects_backlogs_statuses_id: true,
        discipline_id: true,
        unity_id: true,
        quality_status_id: true,
        projects_backlogs_id: true,
        subtasks_id: true,
        description: true,
        description_normalized: true,
        weight: true,
        quantity: true,
        quantity_done: true,
        sprint_added: true,
        is_inspection: true,
        planned_start_date: true,
        planned_end_date: true,
        actual_start_date: true,
        actual_end_date: true,
        planned_duration_days: true,
        planned_cost: true,
        actual_cost: true,
        percent_complete: true,
        wbs_code: true,
        sort_order: true,
        level: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        projects_backlogs_statuses: true,
        tasks_template: {
          include: {
            unity: true,
            discipline: true,
          },
        },
        discipline: true,
        unity: true,
      },
      orderBy: (() => {
        const ALLOWED_SORT_FIELDS = ['description', 'quantity', 'weight', 'created_at'];
        if (sort_field && ALLOWED_SORT_FIELDS.includes(sort_field)) {
          return { [sort_field]: sort_direction || 'asc' };
        }
        return { created_at: 'desc' };
      })(),
      skip: (page - 1) * per_page,
      take: per_page,
    });

    // Busca subtasks de cada backlog
    const backlogsWithSubtasks = await Promise.all(
      backlogs.map(async (backlog) => {
        const subtasks = await db.subtasks.findMany({
          where: {
            projects_backlogs_id: backlog.id,
            deleted_at: null,
          },
          include: {
            unity: true,
          },
          orderBy: { created_at: 'asc' },
        });

        return {
          ...backlog,
          subtasks: subtasks,
        };
      })
    );

    return {
      items: backlogsWithSubtasks,
      curPage: page,
      perPage: per_page,
      itemsReceived: backlogsWithSubtasks.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Lista todos os backlogs (sem paginacao)
   * Equivalente a: query projects_backlogs verb=GET do Xano (endpoint 573)
   */
  static async listAllBacklogs(projectId?: number) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (projectId) {
      whereConditions.projects_id = projectId;
    }

    return db.projects_backlogs.findMany({
      where: whereConditions,
      select: {
        id: true,
        projects_id: true,
        tasks_template_id: true,
        projects_backlogs_statuses_id: true,
        discipline_id: true,
        unity_id: true,
        quality_status_id: true,
        projects_backlogs_id: true,
        subtasks_id: true,
        description: true,
        description_normalized: true,
        weight: true,
        quantity: true,
        quantity_done: true,
        sprint_added: true,
        is_inspection: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        projects_backlogs_statuses: true,
        tasks_template: {
          include: {
            unity: true,
            discipline: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Busca backlog por ID
   */
  static async getBacklogById(backlogId: number) {
    const backlog = await db.projects_backlogs.findFirst({
      where: {
        id: backlogId,
        deleted_at: null,
      },
      select: {
        id: true,
        projects_id: true,
        tasks_template_id: true,
        projects_backlogs_statuses_id: true,
        discipline_id: true,
        unity_id: true,
        quality_status_id: true,
        projects_backlogs_id: true,
        subtasks_id: true,
        description: true,
        description_normalized: true,
        weight: true,
        quantity: true,
        quantity_done: true,
        sprint_added: true,
        is_inspection: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        projects_backlogs_statuses: true,
        tasks_template: {
          include: {
            unity: true,
            discipline: true,
          },
        },
        discipline: true,
        unity: true,
      },
    });

    if (!backlog) {
      throw new NotFoundError('Backlog nao encontrado.');
    }

    // Busca subtasks
    const subtasks = await db.subtasks.findMany({
      where: {
        projects_backlogs_id: backlogId,
        deleted_at: null,
      },
      include: {
        unity: true,
      },
      orderBy: { created_at: 'asc' },
    });

    return {
      ...backlog,
      subtasks: subtasks,
    };
  }

  /**
   * Cria backlog
   * Equivalente a: query projects_backlogs verb=POST do Xano (endpoint 574)
   */
  static async createBacklog(input: CreateProjectBacklogInput) {
    return db.projects_backlogs.create({
      data: {
        description: input.name,
        description_normalized: normalizeText(input.name),
        trackers_id: input.trackers_id || null,
        tasks_template_id: input.tasks_types_id || null,
        projects_backlogs_statuses_id: input.projects_backlogs_statuses_id || null,
        projects_id: input.projects_id,
        discipline_id: input.discipline_id || null,
        quantity: input.quantity || null,
        unity_id: input.unity_id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });
  }

  /**
   * Atualiza backlog
   * Equivalente a: query projects_backlogs/{projects_backlogs_id} verb=PUT do Xano (endpoint 571)
   */
  static async updateBacklog(backlogId: number, input: UpdateProjectBacklogInput) {
    const existing = await db.projects_backlogs.findFirst({
      where: {
        id: backlogId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Backlog nao encontrado.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.name !== undefined) {
      updateData.description = input.name;
      updateData.description_normalized = normalizeText(input.name);
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
      updateData.description_normalized = normalizeText(input.description);
    }
    if (input.trackers_id !== undefined) updateData.trackers_id = input.trackers_id;
    if (input.tasks_types_id !== undefined) updateData.tasks_template_id = input.tasks_types_id;
    if (input.projects_backlogs_statuses_id !== undefined) updateData.projects_backlogs_statuses_id = input.projects_backlogs_statuses_id;
    if (input.discipline_id !== undefined) updateData.discipline_id = input.discipline_id;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.unity_id !== undefined) updateData.unity_id = input.unity_id;

    // checked: converte boolean para projects_backlogs_statuses_id
    // true → 3 (Concluído), false → 1 (Pendente)
    if (input.checked !== undefined) {
      updateData.projects_backlogs_statuses_id = input.checked ? 3 : 1;
    }

    // Planning fields
    if (input.weight !== undefined) updateData.weight = input.weight;
    if (input.planned_start_date !== undefined) updateData.planned_start_date = input.planned_start_date ? new Date(input.planned_start_date) : null;
    if (input.planned_end_date !== undefined) updateData.planned_end_date = input.planned_end_date ? new Date(input.planned_end_date) : null;
    if (input.actual_start_date !== undefined) updateData.actual_start_date = input.actual_start_date ? new Date(input.actual_start_date) : null;
    if (input.actual_end_date !== undefined) updateData.actual_end_date = input.actual_end_date ? new Date(input.actual_end_date) : null;
    if (input.planned_duration_days !== undefined) updateData.planned_duration_days = input.planned_duration_days;
    if (input.planned_cost !== undefined) updateData.planned_cost = input.planned_cost;
    if (input.actual_cost !== undefined) updateData.actual_cost = input.actual_cost;
    if (input.percent_complete !== undefined) updateData.percent_complete = input.percent_complete;
    if (input.wbs_code !== undefined) updateData.wbs_code = input.wbs_code;
    if (input.sort_order !== undefined) updateData.sort_order = input.sort_order;
    if (input.level !== undefined) updateData.level = input.level;

    return db.projects_backlogs.update({
      where: { id: backlogId },
      data: updateData,
    });
  }

  /**
   * Remove backlog (soft delete)
   * Equivalente a: query projects_backlogs/{projects_backlogs_id} verb=PATCH (delete) do Xano (endpoint 575)
   */
  static async deleteBacklog(backlogId: number) {
    const existing = await db.projects_backlogs.findFirst({
      where: {
        id: backlogId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Backlog nao encontrado.');
    }

    await db.projects_backlogs.update({
      where: { id: backlogId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Backlog removido com sucesso' };
  }

  /**
   * Cria backlogs em massa
   * Equivalente a: query projects_backlogs_bulk verb=POST do Xano (endpoint 581)
   */
  static async createBulkBacklogs(input: CreateBulkBacklogsInput) {
    const { projects_id, backlogs } = input;

    const createdBacklogs = await db.$transaction(
      backlogs.map((backlog) =>
        db.projects_backlogs.create({
          data: {
            description: backlog.name,
            description_normalized: normalizeText(backlog.name),
            tasks_template_id: backlog.tasks_types_id || null,
            projects_backlogs_statuses_id: null,
            projects_id,
            discipline_id: backlog.discipline_id || null,
            quantity: backlog.quantity || null,
            unity_id: backlog.unity_id || null,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        })
      )
    );

    return createdBacklogs;
  }

  /**
   * Cria backlogs manualmente (repete task_quantity vezes)
   * Equivalente a: query projects_backlogs_manual verb=POST do Xano (endpoint 641)
   */
  static async createManualBacklog(input: CreateManualBacklogInput) {
    const { projects_id, description, weight, unity_id, quantity, task_quantity, discipline_id } = input;

    const descriptionNormalized = description
      ? description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : '';

    let lastCreated: any = null;

    for (let i = 0; i < task_quantity; i++) {
      lastCreated = await db.projects_backlogs.create({
        data: {
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          projects_id: BigInt(projects_id),
          projects_backlogs_statuses_id: 1,
          sprint_added: false,
          description: description || null,
          description_normalized: descriptionNormalized,
          weight: weight || null,
          is_inspection: false,
          unity_id: unity_id ? BigInt(unity_id) : null,
          quantity: quantity || null,
          discipline_id: discipline_id ? BigInt(discipline_id) : null,
        },
      });
    }

    return lastCreated;
  }

  /**
   * Retorna filtros disponiveis para backlogs do projeto
   * Equivalente a: query filters_project_backlog verb=POST do Xano (endpoint 599)
   */
  static async getBacklogFilters(input: FiltersProjectBacklogInput) {
    const { projects_id, fields_id, sections_id, rows_id } = input;

    // 1. Query fields for the project, optionally filtered by fields_id
    const fieldsWhere: any = { deleted_at: null };
    if (projects_id) fieldsWhere.projects_id = projects_id;
    if (fields_id && fields_id.length > 0) fieldsWhere.id = { in: fields_id };

    const fields = await db.fields.findMany({
      where: fieldsWhere,
      orderBy: { created_at: 'asc' },
    });

    // 2. If fields is empty or no fields_id filter, sections = []
    let sections: any[] = [];
    if (fields.length > 0 && fields_id && fields_id.length > 0) {
      sections = await db.sections.findMany({
        where: {
          fields_id: { in: fields_id },
          deleted_at: null,
        },
        orderBy: { created_at: 'asc' },
      });
    }

    // 3. If sections is empty or no sections_id filter, rows = []
    let rows: any[] = [];
    if (sections.length > 0 && sections_id && sections_id.length > 0) {
      rows = await db.rows.findMany({
        where: {
          sections_id: { in: sections_id },
          deleted_at: null,
        },
        orderBy: { created_at: 'asc' },
      });
    }

    // 4. If rows is empty or no rows_id filter, trackers = []
    let trackers: any[] = [];
    if (rows.length > 0 && rows_id && rows_id.length > 0) {
      trackers = await db.rows_trackers.findMany({
        where: {
          rows_id: { in: rows_id },
          deleted_at: null,
        },
        include: {
          trackers: true,
        },
        orderBy: { created_at: 'asc' },
      });
    }

    return {
      fields,
      sections,
      rows,
      trackers,
    };
  }

  // =============================================================================
  // SUBTASKS
  // =============================================================================

  /**
   * Lista subtasks
   * Equivalente a: query subtasks verb=GET do Xano (endpoint 667)
   */
  static async listSubtasks(backlogId?: number, page: number = 1, perPage: number = 20) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (backlogId) {
      whereConditions.projects_backlogs_id = backlogId;
    }

    const total = await db.subtasks.count({ where: whereConditions });

    const subtasks = await db.subtasks.findMany({
      where: whereConditions,
      include: {
        unity: true,
        projects_backlogs: {
          select: { id: true, description: true },
        },
      },
      orderBy: { created_at: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: subtasks,
      curPage: page,
      perPage,
      itemsReceived: subtasks.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca subtask por ID
   * Equivalente a: query subtasks/{subtasks_id} verb=GET do Xano (endpoint 664)
   */
  static async getSubtaskById(subtaskId: number) {
    const subtask = await db.subtasks.findFirst({
      where: {
        id: subtaskId,
        deleted_at: null,
      },
      include: {
        unity: true,
        projects_backlogs: true,
      },
    });

    if (!subtask) {
      throw new NotFoundError('Subtask nao encontrada.');
    }

    return subtask;
  }

  /**
   * Cria subtask
   * Equivalente a: query subtasks verb=POST do Xano (endpoint 663)
   */
  static async createSubtask(input: CreateSubtaskInput) {
    const { projects_backlogs_id, description, weight, quantity, task_quantity, quality_status_id } = input;

    // Busca o backlog pai para pegar unity_id e verificar se esta na sprint
    const parentBacklog = await db.projects_backlogs.findFirst({
      where: { id: projects_backlogs_id },
    });

    const descNormalized = description ? normalizeText(description) : '';

    let lastCreated: any = null;

    for (let i = 0; i < task_quantity; i++) {
      // Cria a subtask
      const subtask = await db.subtasks.create({
        data: {
          created_at: new Date(),
          updated_at: new Date(),
          projects_backlogs_id: projects_backlogs_id,
          description: description || null,
          description_normalized: descNormalized,
          weight: weight || null,
          is_inspection: false,
          unity_id: parentBacklog?.unity_id || null,
          quantity: quantity || null,
          quantity_done: 0,
          subtasks_statuses_id: 1,
          quality_status_id: quality_status_id || null,
        },
      });

      // Se o backlog pai ja esta na sprint, adiciona a subtask na sprint tambem
      if (parentBacklog?.sprint_added) {
        const sprintTask = await db.sprints_tasks.findFirst({
          where: {
            deleted_at: null,
            projects_backlogs_id: projects_backlogs_id,
          },
        });

        if (sprintTask) {
          await db.sprints_tasks.create({
            data: {
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              projects_backlogs_id: projects_backlogs_id,
              subtasks_id: subtask.id,
              sprints_id: sprintTask.sprints_id,
              teams_id: sprintTask.teams_id,
              sprints_tasks_statuses_id: parentBacklog.projects_backlogs_statuses_id,
            },
          });
        }
      }

      lastCreated = subtask;
    }

    return lastCreated;
  }

  /**
   * Atualiza subtask
   * Equivalente a: query subtasks/{subtasks_id} verb=PUT do Xano (endpoint 666)
   */
  static async updateSubtask(subtaskId: number, input: UpdateSubtaskInput) {
    const existing = await db.subtasks.findFirst({
      where: {
        id: subtaskId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Subtask nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.description !== undefined) {
      updateData.description = input.description;
      updateData.description_normalized = input.description ? normalizeText(input.description) : '';
    }
    if (input.weight !== undefined) updateData.weight = input.weight;
    if (input.fixed !== undefined) updateData.fixed = input.fixed;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.unity_id !== undefined) updateData.unity_id = input.unity_id;

    return db.subtasks.update({
      where: { id: subtaskId },
      data: updateData,
    });
  }

  /**
   * Remove subtask
   * Equivalente a: query subtasks/{subtasks_id} verb=DELETE do Xano (endpoint 665)
   */
  static async deleteSubtask(subtaskId: number) {
    const existing = await db.subtasks.findFirst({
      where: {
        id: subtaskId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Subtask nao encontrada.');
    }

    await db.subtasks.update({
      where: { id: subtaskId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Subtask removida com sucesso' };
  }

  // =============================================================================
  // BACKLOG STATUSES
  // =============================================================================

  /**
   * Lista status de backlogs
   * Equivalente a: query projects_backlogs_statuses verb=GET do Xano (endpoint 578)
   */
  static async listBacklogStatuses(page: number = 1, perPage: number = 20) {
    const total = await db.projects_backlogs_statuses.count({
      where: { deleted_at: null },
    });

    const statuses = await db.projects_backlogs_statuses.findMany({
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
}

export default ProjectsService;
