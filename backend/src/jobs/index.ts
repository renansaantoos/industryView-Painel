// =============================================================================
// INDUSTRYVIEW BACKEND - Jobs (Scheduled Tasks)
// Tarefas agendadas equivalentes aos tasks do Xano
// =============================================================================

import cron from 'node-cron';
import { db } from '../config/database';
import { jobLogger } from '../utils/logger';
import { today } from '../utils/helpers';

/**
 * EndSprintJob - Encerra sprints que passaram da data de fim
 * Equivalente a: task end_sprint do Xano
 * Schedule: Daily at 23:59 (freq: 86400)
 */
export async function endSprintJob(): Promise<void> {
  jobLogger.info('Running end_sprint job');

  try {
    const now = new Date();

    // Busca sprints ativas (status = 1 "Em Andamento") que ja passaram da data fim
    const expiredSprints = await db.sprints.findMany({
      where: {
        deleted_at: null,
        sprints_statuses_id: 1, // Em Andamento
        end_date: {
          lt: now,
        },
      },
    });

    jobLogger.info({ count: expiredSprints.length }, 'Found expired sprints');

    // Atualiza status para 3 (Concluida)
    for (const sprint of expiredSprints) {
      await db.sprints.update({
        where: { id: sprint.id },
        data: {
          sprints_statuses_id: 3, // Concluida
          updated_at: new Date(),
        },
      });

      jobLogger.info({ sprintId: sprint.id }, 'Sprint ended');
    }

    jobLogger.info('end_sprint job completed');
  } catch (error) {
    jobLogger.error({ error }, 'end_sprint job failed');
  }
}

/**
 * StartSprintJob - Inicia sprints que atingiram a data de inicio
 * Equivalente a: task start_sprint do Xano
 * Schedule: Daily at 00:00 (freq: 86400)
 */
export async function startSprintJob(): Promise<void> {
  jobLogger.info('Running start_sprint job');

  try {
    const now = new Date();

    // Busca sprints em planejamento (status = 4 "Planejamento") que ja passaram da data inicio
    const pendingSprints = await db.sprints.findMany({
      where: {
        deleted_at: null,
        sprints_statuses_id: 4, // Planejamento
        start_date: {
          lte: now,
        },
      },
    });

    jobLogger.info({ count: pendingSprints.length }, 'Found pending sprints to start');

    // Atualiza status para 1 (Em Andamento)
    for (const sprint of pendingSprints) {
      await db.sprints.update({
        where: { id: sprint.id },
        data: {
          sprints_statuses_id: 1, // Em Andamento
          updated_at: new Date(),
        },
      });

      jobLogger.info({ sprintId: sprint.id }, 'Sprint started');
    }

    jobLogger.info('start_sprint job completed');
  } catch (error) {
    jobLogger.error({ error }, 'start_sprint job failed');
  }
}

/**
 * AttFirstLoginJob - Reseta flag de primeiro login para usuarios de projetos ativos
 * Equivalente a: task att_first_login do Xano
 * Schedule: Daily at 07:00 (freq: 86400)
 */
export async function attFirstLoginJob(): Promise<void> {
  jobLogger.info('Running att_first_login job');

  try {
    // Busca projetos ativos
    const activeProjects = await db.projects.findMany({
      where: {
        deleted_at: null,
        projects_statuses_id: 1, // Ativo
      },
      select: { id: true },
    });

    const projectIds = activeProjects.map(p => p.id);

    // Busca usuarios vinculados a projetos ativos
    const projectsUsers = await db.projects_users.findMany({
      where: {
        projects_id: { in: projectIds },
        deleted_at: null,
      },
      select: { users_id: true },
    });

    const userIds = [...new Set(projectsUsers.map(pu => pu.users_id))];

    jobLogger.info({ userCount: userIds.length }, 'Found users to update first_login');

    // Atualiza first_login para true
    for (const userId of userIds) {
      if (userId) {
        await db.users.update({
          where: { id: userId },
          data: { first_login: true },
        });
      }
    }

    jobLogger.info('att_first_login job completed');
  } catch (error) {
    jobLogger.error({ error }, 'att_first_login job failed');
  }
}

/**
 * UpdateTasksEndDayJob - Atualiza tarefas no fim do dia
 * Equivalente a: task update_tasks_end_day do Xano
 * Schedule: Daily at 01:00 (freq: 86400)
 *
 * Logica:
 * 1. Tarefas agendadas para hoje com status "Concluida" (4) - cria nova tarefa para o dia seguinte
 * 2. Tarefas agendadas para hoje com status != "Concluida" (3) - reseta para "A Fazer" (1)
 */
export async function updateTasksEndDayJob(): Promise<void> {
  jobLogger.info('Running update_tasks_end_day job');

  try {
    const todayDate = today();

    // 1. Busca tarefas concluidas hoje (status = 4 parece ser um erro no Xano, deveria ser 3)
    // Mantendo a logica original do Xano
    const completedTasks = await db.sprints_tasks.findMany({
      where: {
        scheduled_for: new Date(todayDate),
        sprints_tasks_statuses_id: 4, // Status 4 no Xano
        deleted_at: null,
      },
    });

    jobLogger.info({ count: completedTasks.length }, 'Found completed tasks to recreate');

    // Cria novas tarefas para o dia seguinte
    for (const task of completedTasks) {
      const newTask = await db.sprints_tasks.create({
        data: {
          created_at: new Date(),
          updated_at: new Date(),
          projects_backlogs_id: task.projects_backlogs_id,
          subtasks_id: task.subtasks_id,
          sprints_id: task.sprints_id,
          teams_id: task.teams_id,
          sprints_tasks_statuses_id: 1, // A Fazer
        },
      });

      // Log de mudanca
      await db.sprint_task_change_log.create({
        data: {
          created_at: new Date(),
          sprints_tasks_id: newTask.id,
          changed_field: 'created',
          old_value: '',
          new_value: 'created',
          date: new Date(todayDate),
        },
      });

      jobLogger.info({ oldTaskId: task.id, newTaskId: newTask.id }, 'Task recreated');
    }

    // 2. Busca tarefas nao concluidas de hoje (status != 3)
    const incompleteTasks = await db.sprints_tasks.findMany({
      where: {
        scheduled_for: new Date(todayDate),
        sprints_tasks_statuses_id: { not: 3 }, // Nao concluida
        deleted_at: null,
      },
    });

    jobLogger.info({ count: incompleteTasks.length }, 'Found incomplete tasks to reset');

    // Reseta para "A Fazer"
    for (const task of incompleteTasks) {
      const oldStatus = task.sprints_tasks_statuses_id;

      const updatedTask = await db.sprints_tasks.update({
        where: { id: task.id },
        data: {
          updated_at: new Date(),
          sprints_tasks_statuses_id: 1, // A Fazer
        },
      });

      // Log de mudanca
      await db.sprint_task_change_log.create({
        data: {
          created_at: new Date(),
          sprints_tasks_id: updatedTask.id,
          users_id: null, // Sistema
          changed_field: 'sprints_tasks_statuses_id',
          old_value: oldStatus?.toString() || '',
          new_value: '1',
          date: new Date(todayDate),
        },
      });

      jobLogger.info({ taskId: task.id }, 'Task status reset');
    }

    jobLogger.info('update_tasks_end_day job completed');
  } catch (error) {
    jobLogger.error({ error }, 'update_tasks_end_day job failed');
  }
}

/**
 * Registra todos os jobs no scheduler
 */
export function registerJobs(): void {
  jobLogger.info('Registering scheduled jobs');

  // End sprint - 23:59 diariamente
  cron.schedule('59 23 * * *', endSprintJob, {
    timezone: 'America/Sao_Paulo',
  });
  jobLogger.info('Registered: end_sprint (23:59 daily)');

  // Start sprint - 00:00 diariamente
  cron.schedule('0 0 * * *', startSprintJob, {
    timezone: 'America/Sao_Paulo',
  });
  jobLogger.info('Registered: start_sprint (00:00 daily)');

  // Att first login - 07:00 diariamente
  cron.schedule('0 7 * * *', attFirstLoginJob, {
    timezone: 'America/Sao_Paulo',
  });
  jobLogger.info('Registered: att_first_login (07:00 daily)');

  // Update tasks end day - 01:00 diariamente
  cron.schedule('0 1 * * *', updateTasksEndDayJob, {
    timezone: 'America/Sao_Paulo',
  });
  jobLogger.info('Registered: update_tasks_end_day (01:00 daily)');

  jobLogger.info('All scheduled jobs registered');
}

export default registerJobs;
