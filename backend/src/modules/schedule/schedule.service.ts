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
      // Atualizar schedule existente: adicionar novos users
      const existingUserIds = existing.schedule_user
        .filter(su => su.deleted_at === null)
        .map(su => Number(su.users_id));

      const newUserIds = data.users_id.filter(id => !existingUserIds.includes(id));

      if (newUserIds.length > 0) {
        await db.schedule_user.createMany({
          data: newUserIds.map(userId => ({
            schedule_id: existing.id,
            users_id: BigInt(userId),
          })),
          skipDuplicates: true,
        });
      }

      return this.serialize(existing);
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
    // Soft delete todos os existentes
    await db.schedule_user.updateMany({
      where: {
        schedule_id: BigInt(scheduleId),
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    });

    // Criar novos
    await db.schedule_user.createMany({
      data: usersId.map(userId => ({
        schedule_id: BigInt(scheduleId),
        users_id: BigInt(userId),
      })),
    });

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
