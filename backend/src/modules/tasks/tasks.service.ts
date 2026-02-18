// =============================================================================
// INDUSTRYVIEW BACKEND - Tasks Module Service
// Service de tasks (tasks_template, priorities, unity, discipline, comments)
// Equivalente a logica dos endpoints do api_group Tasks do Xano
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { normalizeText } from '../../utils/helpers';
import { logger } from '../../utils/logger';
import {
  ListTasksInput,
  CreateTaskInput,
  UpdateTaskInput,
  CreateTaskPriorityInput,
  UpdateTaskPriorityInput,
  CreateUnityInput,
  UpdateUnityInput,
  CreateDisciplineInput,
  UpdateDisciplineInput,
  CreateTaskCommentInput,
  UpdateTaskCommentInput,
} from './tasks.schema';

/**
 * TasksService - Service do modulo de tasks
 */
export class TasksService {
  // =============================================================================
  // TASKS (tasks_template)
  // =============================================================================

  /**
   * Lista templates de tasks
   * Equivalente a: query all_tasks_template verb=GET do Xano
   */
  static async listTemplates() {
    return db.tasks_template.findMany({
      where: { deleted_at: null },
      orderBy: { description: 'asc' },
    });
  }

  /**
   * Lista tasks com paginacao e filtros
   * Equivalente a: query tasks_list verb=POST do Xano (endpoint 427)
   */
  static async list(input: ListTasksInput) {
    const { page, per_page, search, equipaments_types_id, company_id, sort_field, sort_direction } = input;

    // Base query conditions
    const whereConditions: any = {
      deleted_at: null,
    };

    // Filtro por tipo de equipamento
    if (equipaments_types_id && equipaments_types_id.length > 0) {
      whereConditions.equipaments_types_id = { in: equipaments_types_id };
    }

    // Filtro por company (tasks fixas ou da empresa)
    if (company_id) {
      whereConditions.OR = [
        { fixed: true },
        { company_id: company_id },
      ];
    }

    // Filtro de busca
    if (search && search.trim() !== '') {
      const searchNormalized = normalizeText(search);
      whereConditions.description_normalized = { contains: searchNormalized };
    }

    // Conta total de registros
    const total = await db.tasks_template.count({ where: whereConditions });

    // Busca tasks com paginacao
    const tasks = await db.tasks_template.findMany({
      where: whereConditions,
      orderBy: (() => {
        const ALLOWED_SORT_FIELDS = ['description', 'weight', 'fixed', 'created_at'];
        if (sort_field && ALLOWED_SORT_FIELDS.includes(sort_field)) {
          return { [sort_field]: sort_direction || 'asc' };
        }
        return { created_at: 'desc' };
      })(),
      skip: (page - 1) * per_page,
      take: per_page,
      include: {
        equipaments_types: {
          select: { id: true, type: true },
        },
        unity: true,
        discipline: {
          select: { id: true, discipline: true },
        },
      },
    });

    return {
      items: tasks,
      curPage: page,
      perPage: per_page,
      itemsReceived: tasks.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Busca task por ID
   * Equivalente a: query tasks/{tasks_id} verb=GET do Xano (endpoint 426)
   */
  static async getById(taskId: number) {
    const task = await db.tasks_template.findFirst({
      where: {
        id: taskId,
        deleted_at: null,
      },
      include: {
        equipaments_types: true,
        unity: true,
        discipline: true,
      },
    });

    if (!task) {
      throw new NotFoundError('Not Found.');
    }

    return task;
  }

  /**
   * Cria uma nova task
   * Equivalente a: query tasks verb=POST do Xano (endpoint 428)
   */
  static async create(input: CreateTaskInput) {
    const task = await db.tasks_template.create({
      data: {
        description: input.description,
        description_normalized: normalizeText(input.description),
        weight: input.weight || 1,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        fixed: input.fixed ?? false,
        is_inspection: input.is_inspection ?? false,
        installation_method: input.installation_method || null,
        checklist_templates_id: input.checklist_templates_id || null,
        equipaments_types_id: input.equipaments_types_id || null,
        unity_id: input.unity_id || null,
        company_id: input.company_id || null,
        discipline_id: input.discipline_id || null,
      },
    });

    logger.info({ taskId: task.id }, 'Task created');
    return task;
  }

  /**
   * Atualiza task
   * Equivalente a: query tasks/{tasks_id} verb=PATCH do Xano (endpoint 429)
   */
  static async update(taskId: number, input: UpdateTaskInput) {
    const existingTask = await db.tasks_template.findFirst({
      where: {
        id: taskId,
        deleted_at: null,
      },
    });

    if (!existingTask) {
      throw new NotFoundError('Task nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.description !== undefined) {
      updateData.description = input.description;
      updateData.description_normalized = normalizeText(input.description);
    }
    // Converte 0 para null em foreign keys (0 significa "nenhum" no frontend)
    if (input.equipaments_types_id !== undefined) {
      updateData.equipaments_types_id = input.equipaments_types_id === 0 ? null : input.equipaments_types_id;
    }
    if (input.weight !== undefined) updateData.weight = input.weight;
    if (input.fixed !== undefined) updateData.fixed = input.fixed;
    if (input.is_inspection !== undefined) updateData.is_inspection = input.is_inspection;
    if (input.installation_method !== undefined) updateData.installation_method = input.installation_method || null;
    if (input.checklist_templates_id !== undefined) {
      updateData.checklist_templates_id = input.checklist_templates_id === 0 ? null : input.checklist_templates_id;
    }
    if (input.unity_id !== undefined) {
      updateData.unity_id = input.unity_id === 0 ? null : input.unity_id;
    }
    if (input.company_id !== undefined) {
      updateData.company_id = input.company_id === 0 ? null : input.company_id;
    }
    if (input.discipline_id !== undefined) {
      updateData.discipline_id = input.discipline_id === 0 ? null : input.discipline_id;
    }

    const task = await db.tasks_template.update({
      where: { id: taskId },
      data: updateData,
    });

    logger.info({ taskId }, 'Task updated');
    return task;
  }

  /**
   * Remove task (soft delete)
   * Equivalente a: query tasks/{tasks_id} verb=DELETE do Xano (endpoint 425)
   */
  static async delete(taskId: number) {
    const existingTask = await db.tasks_template.findFirst({
      where: {
        id: taskId,
        deleted_at: null,
      },
    });

    if (!existingTask) {
      throw new NotFoundError('Task nao encontrada.');
    }

    const task = await db.tasks_template.update({
      where: { id: taskId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info({ taskId }, 'Task deleted');
    return task;
  }

  // =============================================================================
  // TASKS PRIORITIES
  // =============================================================================

  /**
   * Lista todas as prioridades
   * Equivalente a: query tasks_priorities verb=GET do Xano (endpoint 432)
   */
  static async listPriorities() {
    const priorities = await db.tasks_priorities.findMany({
      where: { deleted_at: null },
      orderBy: { id: 'asc' },
    });

    return priorities;
  }

  /**
   * Busca prioridade por ID
   * Equivalente a: query tasks_priorities/{tasks_priorities_id} verb=GET do Xano (endpoint 431)
   */
  static async getPriorityById(priorityId: number) {
    const priority = await db.tasks_priorities.findFirst({
      where: {
        id: priorityId,
        deleted_at: null,
      },
    });

    if (!priority) {
      throw new NotFoundError('Not Found.');
    }

    return priority;
  }

  /**
   * Cria uma nova prioridade
   * Equivalente a: query tasks_priorities verb=POST do Xano (endpoint 433)
   */
  static async createPriority(input: CreateTaskPriorityInput) {
    const priority = await db.tasks_priorities.create({
      data: {
        priority: input.priority || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    logger.info({ priorityId: priority.id }, 'Task priority created');
    return priority;
  }

  /**
   * Atualiza prioridade
   * Equivalente a: query tasks_priorities/{tasks_priorities_id} verb=PATCH do Xano (endpoint 434)
   */
  static async updatePriority(priorityId: number, input: UpdateTaskPriorityInput) {
    const existingPriority = await db.tasks_priorities.findFirst({
      where: {
        id: priorityId,
        deleted_at: null,
      },
    });

    if (!existingPriority) {
      throw new NotFoundError('Prioridade nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.priority !== undefined) updateData.priority = input.priority;

    const priority = await db.tasks_priorities.update({
      where: { id: priorityId },
      data: updateData,
    });

    logger.info({ priorityId }, 'Task priority updated');
    return priority;
  }

  /**
   * Remove prioridade (soft delete)
   * Equivalente a: query tasks_priorities/{tasks_priorities_id} verb=DELETE do Xano (endpoint 430)
   */
  static async deletePriority(priorityId: number) {
    const existingPriority = await db.tasks_priorities.findFirst({
      where: {
        id: priorityId,
        deleted_at: null,
      },
    });

    if (!existingPriority) {
      throw new NotFoundError('Prioridade nao encontrada.');
    }

    const priority = await db.tasks_priorities.update({
      where: { id: priorityId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      select: {
        id: true,
        priority: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    logger.info({ priorityId }, 'Task priority deleted');
    return priority;
  }

  // =============================================================================
  // UNITY
  // =============================================================================

  /**
   * Lista todas as unidades
   * Equivalente a: query unity verb=GET do Xano (endpoint 659)
   */
  static async listUnity(companyId?: number) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (companyId) {
      whereConditions.company_id = companyId;
    }

    const unity = await db.unity.findMany({
      where: whereConditions,
      orderBy: { id: 'asc' },
    });

    return unity;
  }

  /**
   * Busca unidade por ID
   */
  static async getUnityById(unityId: number) {
    const unity = await db.unity.findFirst({
      where: {
        id: unityId,
        deleted_at: null,
      },
    });

    if (!unity) {
      throw new NotFoundError('Unidade nao encontrada.');
    }

    return unity;
  }

  /**
   * Cria uma nova unidade
   * Equivalente a: query unity verb=POST do Xano (endpoint 660)
   */
  static async createUnity(input: CreateUnityInput) {
    const unity = await db.unity.create({
      data: {
        unity: input.unity || null,
        company_id: input.company_id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    logger.info({ unityId: unity.id }, 'Unity created');
    return unity;
  }

  /**
   * Atualiza unidade
   * Equivalente a: query unity/{unity_id} verb=PATCH do Xano (endpoint 661)
   */
  static async updateUnity(unityId: number, input: UpdateUnityInput) {
    const existingUnity = await db.unity.findFirst({
      where: {
        id: unityId,
        deleted_at: null,
      },
    });

    if (!existingUnity) {
      throw new NotFoundError('Unidade nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.unity !== undefined) updateData.unity = input.unity;
    if (input.company_id !== undefined) updateData.company_id = input.company_id;

    const unity = await db.unity.update({
      where: { id: unityId },
      data: updateData,
    });

    logger.info({ unityId }, 'Unity updated');
    return unity;
  }

  /**
   * Remove unidade (soft delete)
   * Equivalente a: query unity/{unity_id} verb=DELETE do Xano (endpoint 657)
   */
  static async deleteUnity(unityId: number) {
    const existingUnity = await db.unity.findFirst({
      where: {
        id: unityId,
        deleted_at: null,
      },
    });

    if (!existingUnity) {
      throw new NotFoundError('Unidade nao encontrada.');
    }

    const unity = await db.unity.update({
      where: { id: unityId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info({ unityId }, 'Unity deleted');
    return unity;
  }

  // =============================================================================
  // DISCIPLINE
  // =============================================================================

  /**
   * Lista todas as disciplinas
   * Equivalente a: query discipline verb=GET do Xano (endpoint 714)
   */
  static async listDiscipline(companyId?: number) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (companyId) {
      whereConditions.company_id = companyId;
    }

    const disciplines = await db.discipline.findMany({
      where: whereConditions,
      orderBy: { id: 'asc' },
    });

    return disciplines;
  }

  /**
   * Busca disciplina por ID
   */
  static async getDisciplineById(disciplineId: number) {
    const discipline = await db.discipline.findFirst({
      where: {
        id: disciplineId,
        deleted_at: null,
      },
    });

    if (!discipline) {
      throw new NotFoundError('Disciplina nao encontrada.');
    }

    return discipline;
  }

  /**
   * Cria uma nova disciplina
   * Equivalente a: query creat_discipline verb=POST do Xano (endpoint 729)
   */
  static async createDiscipline(input: CreateDisciplineInput) {
    const discipline = await db.discipline.create({
      data: {
        discipline: input.discipline || null,
        company_id: input.company_id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    logger.info({ disciplineId: discipline.id }, 'Discipline created');
    return discipline;
  }

  /**
   * Atualiza disciplina
   * Equivalente a: query edit_discipline verb=PUT do Xano (endpoint 730)
   */
  static async updateDiscipline(disciplineId: number, input: UpdateDisciplineInput) {
    const existingDiscipline = await db.discipline.findFirst({
      where: {
        id: disciplineId,
        deleted_at: null,
      },
    });

    if (!existingDiscipline) {
      throw new NotFoundError('Disciplina nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.discipline !== undefined) updateData.discipline = input.discipline;

    const discipline = await db.discipline.update({
      where: { id: disciplineId },
      data: updateData,
    });

    logger.info({ disciplineId }, 'Discipline updated');
    return discipline;
  }

  /**
   * Remove disciplina (soft delete)
   * Equivalente a: query deleted_discipline verb=DELETE do Xano (endpoint 731)
   */
  static async deleteDiscipline(disciplineId: number) {
    const existingDiscipline = await db.discipline.findFirst({
      where: {
        id: disciplineId,
        deleted_at: null,
      },
    });

    if (!existingDiscipline) {
      throw new NotFoundError('Disciplina nao encontrada.');
    }

    const discipline = await db.discipline.update({
      where: { id: disciplineId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info({ disciplineId }, 'Discipline deleted');
    return discipline;
  }

  // =============================================================================
  // TASK COMMENTS
  // =============================================================================

  /**
   * Lista comentarios de subtasks
   * Equivalente a: query comment_subtasks verb=GET do Xano (endpoint 702)
   */
  static async listCommentSubtasks(subtasksId?: number) {
    const whereConditions: any = {};

    if (subtasksId) {
      whereConditions.subtasks_id = subtasksId;
    }

    const comments = await db.task_comments.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' },
      include: {
        created_user: {
          select: { id: true, name: true },
        },
        subtasks: {
          select: { id: true, projects_backlogs_id: true, description: true },
        },
      },
    });

    // Transform to match Xano response format
    return comments.map((comment) => ({
      ...comment,
      user: comment.created_user,
      subtasks: comment.subtasks,
    }));
  }

  /**
   * Lista comentarios de backlogs
   * Equivalente a: query comment_backlogs verb=GET do Xano (endpoint 705)
   */
  static async listCommentBacklogs(projectsBacklogsId?: number) {
    const whereConditions: any = {};

    if (projectsBacklogsId) {
      whereConditions.projects_backlogs_id = projectsBacklogsId;
    }

    const comments = await db.task_comments.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' },
      include: {
        created_user: {
          select: { id: true, name: true },
        },
        projects_backlogs: {
          select: {
            id: true,
            tasks_template_id: true,
            sprint_added: true,
            description: true,
            equipaments_types_id: true,
            is_inspection: true,
            quality_status_id: true,
          },
        },
      },
    });

    // Transform to match Xano response format
    return comments.map((comment) => ({
      ...comment,
      user: comment.created_user,
      backlogs_tasks: comment.projects_backlogs,
    }));
  }

  /**
   * Busca comentario por ID
   * Equivalente a: query task_comments/{task_comments_id} verb=GET do Xano (endpoint 701)
   */
  static async getCommentById(commentId: number) {
    const comment = await db.task_comments.findFirst({
      where: {
        id: commentId,
        deleted_at: null,
      },
      include: {
        created_user: true,
        projects_backlogs: true,
        subtasks: true,
      },
    });

    if (!comment) {
      throw new NotFoundError('Comentario nao encontrado.');
    }

    return comment;
  }

  /**
   * Cria um novo comentario
   * Equivalente a: query task_comments verb=POST do Xano (endpoint 703)
   */
  static async createComment(input: CreateTaskCommentInput) {
    // Se comentario vazio, retorna vazio (comportamento do Xano)
    if (!input.comment || input.comment.trim() === '') {
      return '';
    }

    const comment = await db.task_comments.create({
      data: {
        comment: input.comment,
        projects_backlogs_id: input.projects_backlogs_id || null,
        subtasks_id: input.subtasks_id || null,
        created_user_id: input.created_user_id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    logger.info({ commentId: comment.id }, 'Task comment created');
    return comment;
  }

  /**
   * Atualiza comentario
   * Equivalente a: query task_comments/{task_comments_id} verb=PATCH do Xano (endpoint 704)
   */
  static async updateComment(commentId: number, input: UpdateTaskCommentInput) {
    const existingComment = await db.task_comments.findFirst({
      where: {
        id: commentId,
        deleted_at: null,
      },
    });

    if (!existingComment) {
      throw new NotFoundError('Comentario nao encontrado.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.comment !== undefined) updateData.comment = input.comment;

    const comment = await db.task_comments.update({
      where: { id: commentId },
      data: updateData,
    });

    logger.info({ commentId }, 'Task comment updated');
    return comment;
  }

  /**
   * Remove comentario (soft delete)
   * Equivalente a: query task_comments/{task_comments_id} verb=DELETE do Xano (endpoint 700)
   */
  static async deleteComment(commentId: number) {
    const existingComment = await db.task_comments.findFirst({
      where: {
        id: commentId,
        deleted_at: null,
      },
    });

    if (!existingComment) {
      throw new NotFoundError('Comentario nao encontrado.');
    }

    const comment = await db.task_comments.update({
      where: { id: commentId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info({ commentId }, 'Task comment deleted');
    return comment;
  }
}

export default TasksService;
