// =============================================================================
// INDUSTRYVIEW BACKEND - Reports Module Service
// Service do modulo de relatorios
// Equivalente a logica dos endpoints do Xano em apis/reports/
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  GetDashboardInput,
  ListDailyReportsInput,
  CreateDailyReportInput,
  UpdateDailyReportInput,
  GetSchedulePerDayInput,
  GetBurndownInput,
  CreateSprintTaskStatusLogInput,
  UpdateSprintTaskStatusLogInput,
  ListInformeDiarioInput,
  GetInformeDiarioFilteredInput,
} from './reports.schema';

/**
 * ReportsService - Service do modulo de relatorios
 */
export class ReportsService {
  // ===========================================================================
  // Dashboard
  // ===========================================================================

  /**
   * Busca dados do dashboard
   * Equivalente a: query dashboard verb=GET do Xano
   */
  static async getDashboard(input: GetDashboardInput, company_id?: number | null) {
    const { projects_id } = input;

    // -------------------------------------------------------------------------
    // Stats globais da empresa (independem do projeto selecionado)
    // -------------------------------------------------------------------------

    // Total de projetos da empresa
    const totalProjects = company_id
      ? await db.projects.count({
          where: {
            deleted_at: null,
            company_id: BigInt(company_id),
          },
        })
      : 0;

    // Projetos ativos: status <= 2 ou sem status definido
    // Status 3 e acima sao considerados concluidos/cancelados
    const activeProjects = company_id
      ? await db.projects.count({
          where: {
            deleted_at: null,
            company_id: BigInt(company_id),
            OR: [
              { projects_statuses_id: null },
              { projects_statuses_id: { lte: BigInt(2) } },
            ],
          },
        })
      : 0;

    if (!projects_id) {
      return {
        trackers_total: 0,
        trackers_installed: [],
        modules_total: [],
        modules_installed: [],
        totalProjects,
        activeProjects,
        completedTasks: 0,
        pendingTasks: 0,
        teamMembers: 0,
        sprintProgress: 0,
        burndown: [],
      };
    }

    // -------------------------------------------------------------------------
    // Stats de trackers/modulos do projeto (logica existente - mantida intacta)
    // -------------------------------------------------------------------------

    // Total de trackers no projeto
    // Equivalente ao primeiro db.query do Xano
    const trackersTotal = await db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count
      FROM rows_trackers rt
      JOIN rows r ON rt.rows_id = r.id
      JOIN sections s ON r.sections_id = s.id
      JOIN fields f ON s.fields_id = f.id
      WHERE f.projects_id = ${BigInt(projects_id)}
        AND r.deleted_at IS NULL
        AND rt.deleted_at IS NULL
        AND s.deleted_at IS NULL
        AND f.deleted_at IS NULL
    `;

    // Trackers instalados (status 2, 3, 5)
    // Equivalente ao segundo db.query do Xano
    const trackersInstalled = await db.rows_trackers.findMany({
      where: {
        deleted_at: null,
        rows_trackers_statuses_id: {
          in: [BigInt(2), BigInt(3), BigInt(5)],
        },
        rows: {
          deleted_at: null,
          sections: {
            deleted_at: null,
            fields: {
              deleted_at: null,
              projects_id: BigInt(projects_id),
            },
          },
        },
      },
    });

    // Modulos total (status 5, 4)
    const modulesTotal = await db.rows_trackers.findMany({
      where: {
        deleted_at: null,
        rows_trackers_statuses_id: {
          in: [BigInt(4), BigInt(5)],
        },
        rows: {
          deleted_at: null,
          sections: {
            deleted_at: null,
            fields: {
              deleted_at: null,
              projects_id: BigInt(projects_id),
            },
          },
        },
      },
    });

    // Modulos instalados (status 5)
    const modulesInstalled = await db.rows_trackers.findMany({
      where: {
        deleted_at: null,
        rows_trackers_statuses_id: BigInt(5),
        rows: {
          deleted_at: null,
          sections: {
            deleted_at: null,
            fields: {
              deleted_at: null,
              projects_id: BigInt(projects_id),
            },
          },
        },
      },
    });

    // -------------------------------------------------------------------------
    // Stats de tarefas de sprint do projeto
    // -------------------------------------------------------------------------

    // Busca todas as sprints do projeto para filtrar tarefas
    const projectSprintIds = await db.sprints.findMany({
      where: {
        deleted_at: null,
        projects_id: BigInt(projects_id),
      },
      select: { id: true },
    });

    const sprintIdsBigInt = projectSprintIds.map(s => s.id);

    // Tarefas concluidas (status 3 = Concluida)
    const completedTasks = sprintIdsBigInt.length > 0
      ? await db.sprints_tasks.count({
          where: {
            deleted_at: null,
            sprints_id: { in: sprintIdsBigInt },
            sprints_tasks_statuses_id: BigInt(3),
          },
        })
      : 0;

    // Tarefas pendentes (status 1 = Pendente)
    const pendingTasks = sprintIdsBigInt.length > 0
      ? await db.sprints_tasks.count({
          where: {
            deleted_at: null,
            sprints_id: { in: sprintIdsBigInt },
            sprints_tasks_statuses_id: BigInt(1),
          },
        })
      : 0;

    // -------------------------------------------------------------------------
    // Membros de equipe unicos vinculados ao projeto via teams_projects
    // -------------------------------------------------------------------------

    // Busca teams do projeto
    const projectTeams = await db.teams_projects.findMany({
      where: {
        deleted_at: null,
        projects_id: BigInt(projects_id),
      },
      select: { teams_id: true },
    });

    const teamIdsBigInt = projectTeams.map(tp => tp.teams_id);

    // Conta membros unicos entre todas as equipes do projeto
    let teamMembers = 0;
    if (teamIdsBigInt.length > 0) {
      const uniqueMembers = await db.teams_members.findMany({
        where: {
          deleted_at: null,
          teams_id: { in: teamIdsBigInt },
        },
        select: { users_id: true },
        distinct: ['users_id'],
      });
      teamMembers = uniqueMembers.length;
    }

    // -------------------------------------------------------------------------
    // Progresso da sprint: (trackersInstalled / trackersTotal) * 100
    // -------------------------------------------------------------------------

    const trackersTotalCount = Number(trackersTotal[0]?.count || 0);
    const trackersInstalledCount = trackersInstalled.length;
    const sprintProgress =
      trackersTotalCount > 0
        ? Math.round((trackersInstalledCount / trackersTotalCount) * 100)
        : 0;

    // -------------------------------------------------------------------------
    // Dados de burndown do sprint ativo do projeto
    // -------------------------------------------------------------------------

    // Busca o sprint ativo mais recente do projeto para o burndown
    const activeSprint = await db.sprints.findFirst({
      where: {
        deleted_at: null,
        projects_id: BigInt(projects_id),
      },
      orderBy: { created_at: 'desc' },
      select: { id: true },
    });

    let burndown: Array<{ date: string; ideal: number; actual: number }> = [];
    if (activeSprint) {
      const rawBurndown = await ReportsService.getBurndown({
        sprints_id: Number(activeSprint.id),
        projects_id,
      });

      // Transforma para o formato que o frontend espera:
      // ideal = valor_referencia (linha ideal decrescente)
      // actual = restantes (tarefas ainda abertas)
      burndown = rawBurndown.map(item => ({
        date: item.date,
        ideal: item.valor_referencia,
        actual: item.restantes,
      }));
    }

    return {
      // Campos existentes (logica de trackers mantida intacta)
      trackers_total: trackersTotalCount,
      trackers_installed: trackersInstalled,
      modules_total: modulesTotal,
      modules_installed: modulesInstalled,
      // Novos campos computados
      totalProjects,
      activeProjects,
      completedTasks,
      pendingTasks,
      teamMembers,
      sprintProgress,
      burndown,
    };
  }

  // ===========================================================================
  // Daily Reports
  // ===========================================================================

  /**
   * Lista relatorios diarios
   * Equivalente a: query daily_report verb=GET do Xano
   */
  static async listDailyReports(input: ListDailyReportsInput) {
    const { projects_id, page, per_page, initial_date, final_date, sort_field, sort_direction } = input;
    const skip = (page - 1) * per_page;

    // Constroi clausula where
    const whereClause: any = {
      deleted_at: null,
    };

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    if (initial_date) {
      whereClause.rdo_date = {
        ...whereClause.rdo_date,
        gte: new Date(initial_date),
      };
    }

    if (final_date) {
      whereClause.rdo_date = {
        ...whereClause.rdo_date,
        lte: new Date(final_date),
      };
    }

    // Busca relatorios
    const [items, total] = await Promise.all([
      db.daily_report.findMany({
        where: whereClause,
        include: {
          schedule: {
            include: {
              sprints: true,
            },
          },
        },
        orderBy: (() => {
          const ALLOWED_SORT_FIELDS = ['rdo_date', 'created_at'];
          if (sort_field && ALLOWED_SORT_FIELDS.includes(sort_field)) {
            return { [sort_field]: sort_direction || 'asc' };
          }
          return { created_at: 'desc' };
        })(),
        skip,
        take: per_page,
      }),
      db.daily_report.count({ where: whereClause }),
    ]);

    // Calcula RDOs pendentes
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingSchedules = await db.schedule.findMany({
      where: {
        deleted_at: null,
        daily_report_id: null,
        schedule_date: { lt: today },
        projects_id: projects_id ? BigInt(projects_id) : undefined,
      },
      select: { schedule_date: true },
    });

    // Conta datas unicas
    const uniqueDates = new Set(
      pendingSchedules.map(s => s.schedule_date?.toISOString().split('T')[0])
    );
    const rdosPending = uniqueDates.size;

    return {
      result1: buildPaginationResponse(items, page, per_page, total),
      daily_report_pending: rdosPending,
    };
  }

  /**
   * Busca relatorio diario por ID
   */
  static async getDailyReportById(daily_report_id: number) {
    const report = await db.daily_report.findFirst({
      where: { id: BigInt(daily_report_id) },
      include: {
        projects: true,
        schedule: {
          include: {
            teams: true,
            sprints: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundError('Not Found.');
    }

    return report;
  }

  /**
   * Cria relatorio diario
   * Equivalente a: query daily_report verb=POST do Xano
   */
  static async createDailyReport(input: CreateDailyReportInput) {
    const { projects_id, schedule_id, date } = input;

    // Valida que ha pelo menos um lider
    if (!schedule_id || schedule_id.length === 0) {
      throw new BadRequestError('Voce nao pode criar um RDO sem nenhum lider.');
    }

    // Verifica se todos os schedules tem end_service = true
    // Equivalente ao bloco comentado do Xano (desabilitado)
    // const schedules = await db.schedule.findMany({
    //   where: { id: { in: schedule_id.map(id => BigInt(id)) } },
    // });
    // const hasFalse = schedules.some(s => !s.end_service);
    // if (hasFalse) {
    //   throw new BadRequestError('Todos os lideres devem encerrar o dia para voce criar a RDO.');
    // }

    // Cria o relatorio
    const dailyReport = await db.daily_report.create({
      data: {
        projects_id: projects_id ? BigInt(projects_id) : null,
        rdo_date: date ? new Date(date) : new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Vincula schedules ao relatorio
    for (const schedId of schedule_id) {
      await db.schedule.update({
        where: { id: BigInt(schedId) },
        data: {
          daily_report_id: dailyReport.id,
          updated_at: new Date(),
        },
      });
    }

    return dailyReport;
  }

  /**
   * Atualiza relatorio diario
   */
  static async updateDailyReport(daily_report_id: number, input: Partial<UpdateDailyReportInput>) {
    return db.daily_report.update({
      where: { id: BigInt(daily_report_id) },
      data: {
        rdo_date: input.rdo_date ? new Date(input.rdo_date) : undefined,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Deleta relatorio diario (soft delete)
   */
  static async deleteDailyReport(daily_report_id: number) {
    return db.daily_report.update({
      where: { id: BigInt(daily_report_id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Busca datas dos relatorios
   */
  static async getDailyReportDates(projects_id?: number) {
    const reports = await db.daily_report.findMany({
      where: {
        deleted_at: null,
        projects_id: projects_id ? BigInt(projects_id) : undefined,
      },
      select: { rdo_date: true },
      orderBy: { rdo_date: 'desc' },
    });

    return reports.map(r => r.rdo_date);
  }

  // ===========================================================================
  // Schedule
  // ===========================================================================

  /**
   * Busca programacao por dia
   * Equivalente a: query schedule_per_day verb=GET do Xano
   */
  static async getSchedulePerDay(input: GetSchedulePerDayInput) {
    const { projects_id, date } = input;

    // Se nao tiver data, usa hoje
    const targetDate = date
      ? new Date(/^\d+$/.test(date) ? Number(date) : date)
      : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const schedules = await db.schedule.findMany({
      where: {
        deleted_at: null,
        daily_report_id: null,
        projects_id: projects_id ? BigInt(projects_id) : undefined,
        schedule_date: targetDate,
      },
      include: {
        teams: {
          include: {
            teams_leaders: {
              include: {
                users: {
                  include: {
                    users_permissions: {
                      include: {
                        users_roles: {
                          select: { id: true, role: true },
                        },
                        users_control_system: {
                          select: { id: true, access_level: true },
                        },
                        users_system_access: {
                          select: { id: true, env: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return schedules;
  }

  // ===========================================================================
  // Burndown
  // ===========================================================================

  /**
   * Busca dados para grafico de burndown
   * Equivalente a: query burndown verb=GET do Xano
   */
  static async getBurndown(input: GetBurndownInput) {
    const { sprints_id, projects_id } = input;

    if (!projects_id || projects_id === 0) {
      throw new BadRequestError('Voce deve selecionar o projeto');
    }

    if (!sprints_id || sprints_id === 0) {
      return [];
    }

    // Busca logs de conclusao de tarefas (new_value = 3 significa concluida)
    const changeLogs = await db.sprint_task_change_log.findMany({
      where: {
        new_value: '3',
        sprints_tasks: {
          sprints_id: BigInt(sprints_id),
        },
      },
      select: {
        date: true,
        sprints_tasks_id: true,
      },
      orderBy: { date: 'asc' },
    });

    // Total de tarefas na sprint
    const totalTasks = await db.sprints_tasks.count({
      where: {
        sprints_id: BigInt(sprints_id),
        deleted_at: null,
      },
    });

    if (changeLogs.length === 0 || totalTasks === 0) {
      return [];
    }

    // Agrupa conclusoes por data
    const conclusionsByDate = new Map<string, Set<bigint>>();
    for (const log of changeLogs) {
      if (!log.date) continue;
      const dateStr = log.date.toISOString().split('T')[0];
      if (!conclusionsByDate.has(dateStr)) {
        conclusionsByDate.set(dateStr, new Set());
      }
      if (log.sprints_tasks_id) {
        conclusionsByDate.get(dateStr)!.add(log.sprints_tasks_id);
      }
    }

    // Gera array de dias da sprint
    const dates = Array.from(conclusionsByDate.keys()).sort();
    if (dates.length === 0) return [];

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    const arrayDiasSprint: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      arrayDiasSprint.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calcula razao de tarefas por dia
    const razaoDeTarefasConcluidas = Math.ceil(totalTasks / arrayDiasSprint.length);

    // Monta dados do grafico
    // Equivalente ao foreach do Xano
    const grafico = [];
    let acumuladas = 0;
    let valorReferencia = totalTasks;

    for (const dia of arrayDiasSprint) {
      const conclusoesDoDia = conclusionsByDate.get(dia)?.size || 0;
      acumuladas += conclusoesDoDia;

      const restante = totalTasks - acumuladas;

      grafico.push({
        date: dia,
        restantes: restante,
        acumuladas,
        valor_referencia: valorReferencia,
        concluidas: conclusoesDoDia,
      });

      valorReferencia = Math.max(0, valorReferencia - razaoDeTarefasConcluidas);
    }

    return grafico;
  }

  // ===========================================================================
  // Sprint Task Status Log
  // ===========================================================================

  /**
   * Lista logs de status de tarefas
   */
  static async listSprintTaskStatusLog(sprints_tasks_id?: number) {
    return db.sprint_task_change_log.findMany({
      where: {
        sprints_tasks_id: sprints_tasks_id ? BigInt(sprints_tasks_id) : undefined,
      },
      include: {
        sprints_tasks: true,
        users: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Busca log por ID
   */
  static async getSprintTaskStatusLogById(id: number) {
    const log = await db.sprint_task_change_log.findFirst({
      where: { id: BigInt(id) },
      include: {
        sprints_tasks: true,
        users: true,
      },
    });

    if (!log) {
      throw new NotFoundError('Not Found.');
    }

    return log;
  }

  /**
   * Cria log de status
   */
  static async createSprintTaskStatusLog(input: CreateSprintTaskStatusLogInput) {
    return db.sprint_task_change_log.create({
      data: {
        sprints_tasks_id: BigInt(input.sprints_tasks_id),
        users_id: input.users_id ? BigInt(input.users_id) : null,
        changed_field: input.changed_field,
        old_value: input.old_value,
        new_value: input.new_value,
        date: input.date ? new Date(input.date) : new Date(),
        created_at: new Date(),
      },
    });
  }

  /**
   * Atualiza log
   */
  static async updateSprintTaskStatusLog(id: number, input: Partial<UpdateSprintTaskStatusLogInput>) {
    return db.sprint_task_change_log.update({
      where: { id: BigInt(id) },
      data: {
        changed_field: input.changed_field,
        old_value: input.old_value,
        new_value: input.new_value,
      },
    });
  }

  /**
   * Deleta log
   */
  static async deleteSprintTaskStatusLog(id: number) {
    return db.sprint_task_change_log.delete({
      where: { id: BigInt(id) },
    });
  }

  // ===========================================================================
  // Informe Diario
  // ===========================================================================

  /**
   * Lista informes diarios
   * Equivalente a: query informe_diario verb=GET do Xano
   */
  static async listInformeDiario(input: ListInformeDiarioInput) {
    const { projects_id, date } = input;

    const targetDate = date
      ? new Date(/^\d+$/.test(date) ? Number(date) : date)
      : new Date();
    targetDate.setHours(0, 0, 0, 0);

    return db.schedule.findMany({
      where: {
        deleted_at: null,
        projects_id: projects_id ? BigInt(projects_id) : undefined,
        schedule_date: targetDate,
      },
      include: {
        teams: {
          include: {
            teams_leaders: {
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            teams_members: {
              include: {
                users: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        sprints: {
          select: {
            id: true,
            title: true,
            objective: true,
          },
        },
        schedule_sprints_tasks: {
          include: {
            sprints_tasks: {
              include: {
                projects_backlogs: {
                  select: {
                    id: true,
                    description: true,
                  },
                },
                sprints_tasks_statuses: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Busca informe diario filtrado
   * Equivalente a: query informe_diario_0 verb=GET do Xano
   */
  static async getInformeDiarioFiltered(input: GetInformeDiarioFilteredInput) {
    const { projects_id, teams_id, date } = input;

    const targetDate = date
      ? new Date(/^\d+$/.test(date) ? Number(date) : date)
      : new Date();
    targetDate.setHours(0, 0, 0, 0);

    return db.schedule.findMany({
      where: {
        deleted_at: null,
        projects_id: projects_id ? BigInt(projects_id) : undefined,
        teams_id: teams_id ? BigInt(teams_id) : undefined,
        schedule_date: targetDate,
      },
      include: {
        teams: true,
        sprints: true,
        schedule_sprints_tasks: {
          include: {
            sprints_tasks: {
              include: {
                projects_backlogs: true,
                sprints_tasks_statuses: true,
              },
            },
          },
        },
      },
    });
  }

  // ===========================================================================
  // QR Code Reader
  // ===========================================================================

  /**
   * Le QR code e retorna informacoes do usuario
   * Equivalente a: query qrcode_reader verb=GET do Xano
   */
  static async qrcodeReader(qrcode?: string) {
    if (!qrcode) {
      return null;
    }

    // Busca usuario pelo QR code
    const user = await db.users.findFirst({
      where: { qrcode },
      include: {
        users_permissions: {
          include: {
            users_roles: true,
            users_control_system: true,
          },
        },
        company: true,
      },
    });

    return user;
  }
}

export default ReportsService;
