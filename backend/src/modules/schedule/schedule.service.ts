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

    // Verificar se já existe schedule para este time/projeto/data
    const existing = await db.schedule.findFirst({
      where: {
        teams_id: BigInt(data.teams_id),
        projects_id: BigInt(data.projects_id),
        schedule_date: scheduleDate,
        deleted_at: null,
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

    const schedule = await db.schedule.findFirst({
      where: {
        projects_id: BigInt(projectsId),
        teams_id: BigInt(teamsId),
        schedule_date: today,
        deleted_at: null,
      },
      include: {
        schedule_user: {
          where: { deleted_at: null },
        },
      },
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
