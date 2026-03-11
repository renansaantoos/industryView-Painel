import { db } from '../../config/database';

export class ScheduleService {
  /**
   * Cria uma escala diária com os colaboradores informados.
   * Equivalente ao POST /schedule do Xano.
   */
  static async create(data: {
    teams_id: number;
    projects_id: number;
    schedule_date: string;
    users_id: number[];
    sprints_id?: number | null;
  }) {
    const scheduleDate = new Date(data.schedule_date + 'T00:00:00Z');

    // Verificar se já existe schedule ATIVO (sem RDO) para este time/projeto/data
    // Schedules com daily_report_id já foram finalizados — permitir criar novo
    const existing = await db.schedule.findFirst({
      where: {
        teams_id: BigInt(data.teams_id),
        projects_id: BigInt(data.projects_id),
        schedule_date: scheduleDate,
        deleted_at: null,
        daily_report_id: null,
      },
      include: { schedule_user: true },
    });

    if (existing) {
      // Atualizar schedule existente: adicionar novos users ou reativar soft-deleted
      const activeUserIds = existing.schedule_user
        .filter(su => su.deleted_at === null)
        .map(su => Number(su.users_id));

      const softDeletedUserIds = existing.schedule_user
        .filter(su => su.deleted_at !== null)
        .map(su => Number(su.users_id));

      for (const userId of data.users_id) {
        if (activeUserIds.includes(userId)) {
          // Já ativo, nada a fazer
          continue;
        }
        if (softDeletedUserIds.includes(userId)) {
          // Reativar registro soft-deleted
          await db.schedule_user.updateMany({
            where: {
              schedule_id: existing.id,
              users_id: BigInt(userId),
            },
            data: { deleted_at: null },
          });
        } else {
          // Criar novo registro
          await db.schedule_user.create({
            data: {
              schedule_id: existing.id,
              users_id: BigInt(userId),
            },
          });
        }
      }

      // Recarregar com dados atualizados
      const updated = await db.schedule.findUnique({
        where: { id: existing.id },
        include: { schedule_user: true },
      });
      return this.serialize(updated!);
    }

    // Criar novo schedule
    const schedule = await db.schedule.create({
      data: {
        teams_id: BigInt(data.teams_id),
        projects_id: BigInt(data.projects_id),
        schedule_date: scheduleDate,
        sprints_id: data.sprints_id ? BigInt(data.sprints_id) : null,
        schedule_user: {
          create: data.users_id.map(userId => ({
            users_id: BigInt(userId),
          })),
        },
      },
      include: { schedule_user: true },
    });

    return this.serialize(schedule);
  }

  /**
   * Lista schedule_users do dia atual para um projeto/time.
   * Equivalente ao GET /schedule do Xano.
   */
  static async listToday(projectsId: number, teamsId: number) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Busca apenas schedule ATIVO (sem RDO finalizada)
    const schedule = await db.schedule.findFirst({
      where: {
        projects_id: BigInt(projectsId),
        teams_id: BigInt(teamsId),
        schedule_date: today,
        deleted_at: null,
        daily_report_id: null,
      },
      include: {
        schedule_user: {
          where: { deleted_at: null },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!schedule) return [];

    return schedule.schedule_user.map(su => ({
      id: Number(su.id),
      schedule_id: Number(su.schedule_id),
      users_id: Number(su.users_id),
      created_at: su.created_at,
    }));
  }

  /**
   * Atualiza os colaboradores de uma escala existente.
   * Equivalente ao PUT /schedule/:id do Xano.
   */
  static async update(scheduleId: number, usersId: number[]) {
    // Proteção: não permitir update com lista vazia (destruiria a escala)
    if (!usersId || usersId.length === 0) {
      const existing = await db.schedule.findUnique({
        where: { id: BigInt(scheduleId) },
        include: { schedule_user: { where: { deleted_at: null } } },
      });
      return existing ? this.serialize(existing) : null;
    }

    // Usar transaction para garantir atomicidade
    return db.$transaction(async (tx) => {
      // Soft delete todos os existentes
      await tx.schedule_user.updateMany({
        where: {
          schedule_id: BigInt(scheduleId),
          deleted_at: null,
        },
        data: { deleted_at: new Date() },
      });

      // Reativar existentes soft-deleted ou criar novos
      const allExisting = await tx.schedule_user.findMany({
        where: { schedule_id: BigInt(scheduleId) },
        select: { id: true, users_id: true },
      });
      const existingByUserId = new Map(allExisting.map(su => [Number(su.users_id), su.id]));

      for (const userId of usersId) {
        const existingId = existingByUserId.get(userId);
        if (existingId) {
          // Reativar registro existente
          await tx.schedule_user.update({
            where: { id: existingId },
            data: { deleted_at: null },
          });
        } else {
          // Criar novo
          await tx.schedule_user.create({
            data: {
              schedule_id: BigInt(scheduleId),
              users_id: BigInt(userId),
            },
          });
        }
      }

      const schedule = await tx.schedule.findUnique({
        where: { id: BigInt(scheduleId) },
        include: {
          schedule_user: {
            where: { deleted_at: null },
          },
        },
      });

      return schedule ? this.serialize(schedule) : null;
    });
  }

  /**
   * Busca schedule por ID.
   */
  static async getById(scheduleId: number) {
    const schedule = await db.schedule.findUnique({
      where: { id: BigInt(scheduleId) },
      include: {
        schedule_user: {
          where: { deleted_at: null },
        },
      },
    });

    return schedule ? this.serialize(schedule) : null;
  }

  /**
   * Retorna schedules pendentes (sem RDO) de dias anteriores para um usuário.
   * Inclui funcionários e tarefas vinculadas ao schedule.
   */
  static async getPendingSchedules(userId: number) {
    const nowUtc = new Date();
    const SP_OFFSET_MS = 3 * 60 * 60 * 1000;
    const nowInSP = new Date(nowUtc.getTime() - SP_OFFSET_MS);
    const todayInSP = new Date(
      Date.UTC(nowInSP.getUTCFullYear(), nowInSP.getUTCMonth(), nowInSP.getUTCDate())
    );

    const scheduleUsers = await db.schedule_user.findMany({
      where: {
        users_id: BigInt(userId),
        deleted_at: null,
        schedule: {
          daily_report_id: null,
          deleted_at: null,
          schedule_date: { lt: todayInSP },
        },
      },
      include: {
        schedule: {
          include: {
            projects: { select: { id: true, name: true } },
            teams: { select: { id: true, name: true } },
            schedule_user: {
              where: { deleted_at: null },
              include: {
                users: {
                  select: {
                    id: true, name: true, profile_picture: true,
                    hr_data: { select: { cpf: true, cargo: true } },
                  },
                },
              },
            },
            schedule_sprints_tasks: {
              include: {
                sprints_tasks: {
                  include: {
                    projects_backlogs: {
                      select: { description: true },
                    },
                    sprints_tasks_statuses: {
                      select: { id: true, status: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const pendingSchedules = scheduleUsers
      .filter(su => su.schedule !== null)
      .map(su => {
        const s = su.schedule!;
        return {
          schedule_id: Number(s.id),
          schedule_date: s.schedule_date
            ? s.schedule_date.toISOString().split('T')[0]
            : null,
          projects_id: s.projects_id ? Number(s.projects_id) : null,
          project_name: s.projects?.name ?? null,
          teams_id: s.teams_id ? Number(s.teams_id) : null,
          team_name: s.teams?.name ?? null,
          workers: (s as any).schedule_user?.map((su2: any) => ({
            id: Number(su2.users?.id ?? su2.users_id),
            name: su2.users?.name ?? null,
            image: su2.users?.profile_picture ?? null,
            cpf: su2.users?.hr_data?.cpf ?? null,
            cargo: su2.users?.hr_data?.cargo ?? null,
          })) ?? [],
          tasks: (s as any).schedule_sprints_tasks?.map((sst: any) => ({
            id: sst.sprints_tasks ? Number(sst.sprints_tasks.id) : null,
            description: sst.sprints_tasks?.projects_backlogs?.description ?? null,
            status: sst.sprints_tasks?.sprints_tasks_statuses?.status ?? null,
            status_id: sst.sprints_tasks?.sprints_tasks_statuses?.id
              ? Number(sst.sprints_tasks.sprints_tasks_statuses.id)
              : null,
          })) ?? [],
        };
      });

    return {
      has_pending: pendingSchedules.length > 0,
      pending_schedules: pendingSchedules,
    };
  }

  /**
   * Vincula uma ou mais tarefas ao schedule (schedule_sprints_tasks).
   * Usa upsert para não duplicar se já existir.
   * POST /schedule/:id/tasks
   */
  static async linkTasks(scheduleId: number, sprintsTasksIds: number[]) {
    const results = [];
    for (const taskId of sprintsTasksIds) {
      const record = await db.schedule_sprints_tasks.upsert({
        where: {
          schedule_id_sprints_tasks_id: {
            schedule_id: BigInt(scheduleId),
            sprints_tasks_id: BigInt(taskId),
          },
        },
        create: {
          schedule_id: BigInt(scheduleId),
          sprints_tasks_id: BigInt(taskId),
        },
        update: {},
      });
      results.push({
        id: Number(record.id),
        schedule_id: Number(record.schedule_id),
        sprints_tasks_id: Number(record.sprints_tasks_id),
      });
    }
    return results;
  }

  private static serialize(schedule: any) {
    return {
      id: Number(schedule.id),
      teams_id: Number(schedule.teams_id),
      projects_id: Number(schedule.projects_id),
      sprints_id: schedule.sprints_id ? Number(schedule.sprints_id) : null,
      schedule_date: schedule.schedule_date,
      end_service: schedule.end_service,
      created_at: schedule.created_at,
      updated_at: schedule.updated_at,
      schedule_user: schedule.schedule_user?.map((su: any) => ({
        id: Number(su.id),
        schedule_id: Number(su.schedule_id),
        users_id: Number(su.users_id),
        created_at: su.created_at,
      })) ?? [],
    };
  }
}
