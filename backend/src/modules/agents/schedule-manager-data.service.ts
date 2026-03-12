// =============================================================================
// INDUSTRYVIEW BACKEND - Schedule Manager Data Service
// Coleta de dados pura (queries SQL, sem IA) para o Schedule Manager Agent
// =============================================================================

import { db } from '../../config/database';
import { logger } from '../../utils/logger';
import { PlanningService } from '../planning/planning.service';
import { WeatherService } from '../../services/weather.service';
import { getProjectCoordinates } from '../weather/weather.utils';

// =============================================================================
// TYPES
// =============================================================================

export interface ProductivityData {
  backlogs: {
    id: number;
    description: string | null;
    wbs_code: string | null;
    planned_start_date: string | null;
    planned_end_date: string | null;
    actual_start_date: string | null;
    actual_end_date: string | null;
    percent_complete: number;
    planned_cost: number | null;
    actual_cost: number | null;
    weight: number;
    field_name: string | null;
    section_number: number | null;
  }[];
  sprint_tasks: {
    id: number;
    sprint_title: string | null;
    description: string | null;
    status: string | null;
    team_name: string | null;
    quantity_assigned: number | null;
    quantity_done: number | null;
    scheduled_for: string | null;
    executed_at: string | null;
  }[];
  daily_activities: {
    date: string;
    total_activities: number;
    total_quantity_done: number;
  }[];
}

export interface WorkforceData {
  daily_logs: {
    log_date: string;
    total_present: number;
    total_absent: number;
    total_hours_normal: number;
    total_hours_overtime: number;
  }[];
  scheduled_users: {
    schedule_date: string;
    team_name: string | null;
    total_scheduled: number;
  }[];
  teams_headcount: {
    team_id: number;
    team_name: string | null;
    total_members: number;
  }[];
  idle_workers: {
    user_id: number;
    user_name: string | null;
    team_name: string | null;
    reason: string;
  }[];
}

export interface WeatherData {
  daily_reports: {
    rdo_date: string;
    weather_morning: string | null;
    weather_afternoon: string | null;
    weather_night: string | null;
    temperature_min: number | null;
    temperature_max: number | null;
  }[];
  weather_productivity_correlation: {
    weather_condition: string;
    avg_activities: number;
    avg_quantity_done: number;
    days_count: number;
  }[];
  forecast: {
    daily_summary: {
      date: string;
      temp_min: number;
      temp_max: number;
      avg_humidity: number;
      max_wind: number;
      max_pop: number;
      dominant_condition: string;
      description: string;
      rain_total: number;
      work_risk: string;
      risk_factors: string[];
    }[];
    risk_analysis: {
      work_days_at_risk: number;
      total_work_days: number;
      overall_risk: string;
      recommendations: string[];
    } | null;
    location: { name: string; lat: number; lon: number } | null;
  } | null;
}

export interface FailedTasksData {
  failed_tasks: {
    id: number;
    description: string | null;
    team_name: string | null;
    scheduled_for: string | null;
    reason_name: string | null;
    reason_category: string | null;
  }[];
  by_category: Record<string, number>;
  total_failed: number;
  total_tasks_period: number;
}

export interface AreaProgressData {
  fields: {
    field_id: number;
    field_name: string;
    total_sections: number;
    total_rows: number;
    total_trackers: number;
    installed_trackers: number;
    percent_installed: number;
  }[];
  backlog_by_area: {
    field_name: string | null;
    total_backlogs: number;
    avg_percent_complete: number;
    total_delayed: number;
  }[];
}

export interface ProactiveInsights {
  unassigned_upcoming_tasks: {
    id: number;
    description: string | null;
    planned_start_date: string | null;
    days_until_start: number;
  }[];
  delayed_predecessors: {
    predecessor_id: number;
    predecessor_desc: string | null;
    successor_id: number;
    successor_desc: string | null;
    predecessor_delay_days: number;
  }[];
  at_risk_milestones: {
    id: number;
    description: string | null;
    planned_end_date: string | null;
    percent_complete: number;
    days_remaining: number;
  }[];
}

export interface RCCData {
  productivity: ProductivityData;
  workforce: WorkforceData;
  weather: WeatherData;
  failed_tasks: FailedTasksData;
  area_progress: AreaProgressData;
  proactive: ProactiveInsights;
  schedule_health: any;
  critical_path: any;
}

// =============================================================================
// SERVICE
// =============================================================================

export class ScheduleManagerDataService {
  // ===========================================================================
  // 1. PRODUCTIVITY DATA
  // ===========================================================================

  static async collectProductivityData(projectId: number): Promise<ProductivityData> {
    try {
      const [backlogs, sprintTasks, dailyActivities] = await Promise.all([
        db.$queryRaw<any[]>`
          SELECT
            pb.id, pb.description, pb.wbs_code,
            pb.planned_start_date, pb.planned_end_date,
            pb.actual_start_date, pb.actual_end_date,
            pb.percent_complete, pb.planned_cost, pb.actual_cost, pb.weight,
            f.name AS field_name, s.section_number
          FROM projects_backlogs pb
          LEFT JOIN fields f ON f.id = pb.fields_id
          LEFT JOIN sections s ON s.id = pb.sections_id
          WHERE pb.projects_id = ${BigInt(projectId)}
            AND pb.deleted_at IS NULL
            AND pb.wbs_code IS NOT NULL
          ORDER BY pb.sort_order ASC NULLS LAST
          LIMIT 500
        `,

        db.sprints_tasks.findMany({
          where: {
            deleted_at: null,
            sprints: {
              deleted_at: null,
              projects_id: BigInt(projectId),
            },
          },
          include: {
            sprints_tasks_statuses: { select: { status: true } },
            projects_backlogs: { select: { description: true } },
            sprints: { select: { title: true } },
            teams: { select: { name: true } },
          },
          orderBy: { scheduled_for: 'desc' },
          take: 200,
        }),

        db.$queryRaw<any[]>`
          SELECT
            dr.rdo_date::text AS date,
            COUNT(dra.id) AS total_activities,
            COALESCE(SUM(dra.quantity_done), 0) AS total_quantity_done
          FROM daily_report dr
          JOIN daily_report_activities dra ON dra.daily_report_id = dr.id AND dra.deleted_at IS NULL
          WHERE dr.projects_id = ${BigInt(projectId)}
            AND dr.deleted_at IS NULL
            AND dr.rdo_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY dr.rdo_date
          ORDER BY dr.rdo_date DESC
        `,
      ]);

      return {
        backlogs: backlogs.map((b: any) => ({
          id: Number(b.id),
          description: b.description,
          wbs_code: b.wbs_code,
          planned_start_date: b.planned_start_date?.toISOString()?.split('T')[0] ?? null,
          planned_end_date: b.planned_end_date?.toISOString()?.split('T')[0] ?? null,
          actual_start_date: b.actual_start_date?.toISOString()?.split('T')[0] ?? null,
          actual_end_date: b.actual_end_date?.toISOString()?.split('T')[0] ?? null,
          percent_complete: b.percent_complete ? Number(b.percent_complete) : 0,
          planned_cost: b.planned_cost ? Number(b.planned_cost) : null,
          actual_cost: b.actual_cost ? Number(b.actual_cost) : null,
          weight: b.weight ? Number(b.weight) : 1,
          field_name: b.field_name,
          section_number: b.section_number,
        })),
        sprint_tasks: sprintTasks.map((t) => ({
          id: Number(t.id),
          sprint_title: t.sprints?.title ?? null,
          description: t.projects_backlogs?.description ?? null,
          status: t.sprints_tasks_statuses?.status ?? null,
          team_name: t.teams?.name ?? null,
          quantity_assigned: t.quantity_assigned ? Number(t.quantity_assigned) : null,
          quantity_done: t.quantity_done ? Number(t.quantity_done) : null,
          scheduled_for: t.scheduled_for?.toISOString()?.split('T')[0] ?? null,
          executed_at: t.executed_at?.toISOString()?.split('T')[0] ?? null,
        })),
        daily_activities: dailyActivities.map((a: any) => ({
          date: a.date,
          total_activities: Number(a.total_activities),
          total_quantity_done: Number(a.total_quantity_done),
        })),
      };
    } catch (error) {
      logger.error({ error, projectId }, 'Erro ao coletar dados de produtividade');
      return { backlogs: [], sprint_tasks: [], daily_activities: [] };
    }
  }

  // ===========================================================================
  // 2. WORKFORCE DATA
  // ===========================================================================

  static async collectWorkforceData(projectId: number): Promise<WorkforceData> {
    try {
      const [dailyLogs, scheduledUsers, teamsHeadcount, idleWorkers] = await Promise.all([
        db.$queryRaw<any[]>`
          SELECT
            log_date::text,
            COUNT(*) FILTER (WHERE status = 'presente') AS total_present,
            COUNT(*) FILTER (WHERE status != 'presente') AS total_absent,
            COALESCE(SUM(hours_normal), 0) AS total_hours_normal,
            COALESCE(SUM(hours_overtime), 0) AS total_hours_overtime
          FROM workforce_daily_log
          WHERE projects_id = ${BigInt(projectId)}
            AND log_date >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY log_date
          ORDER BY log_date DESC
        `,

        db.$queryRaw<any[]>`
          SELECT
            sc.schedule_date::text,
            t.name AS team_name,
            COUNT(su.id) AS total_scheduled
          FROM schedule sc
          JOIN schedule_user su ON su.schedule_id = sc.id AND su.deleted_at IS NULL
          LEFT JOIN teams t ON t.id = sc.teams_id
          WHERE sc.projects_id = ${BigInt(projectId)}
            AND sc.deleted_at IS NULL
            AND sc.schedule_date >= CURRENT_DATE
            AND sc.schedule_date <= CURRENT_DATE + INTERVAL '7 days'
          GROUP BY sc.schedule_date, t.name
          ORDER BY sc.schedule_date ASC
        `,

        db.$queryRaw<any[]>`
          SELECT
            t.id AS team_id, t.name AS team_name,
            COUNT(tm.id) AS total_members
          FROM teams t
          LEFT JOIN teams_members tm ON tm.teams_id = t.id AND tm.deleted_at IS NULL
          WHERE t.projects_id = ${BigInt(projectId)} AND t.deleted_at IS NULL
          GROUP BY t.id, t.name
          ORDER BY t.name
        `,

        db.$queryRaw<any[]>`
          SELECT
            u.id AS user_id, u.name AS user_name, t.name AS team_name,
            'Sem escala nos proximos 7 dias' AS reason
          FROM teams_members tm
          JOIN teams t ON t.id = tm.teams_id AND t.deleted_at IS NULL
          JOIN users u ON u.id = tm.users_id
          WHERE t.projects_id = ${BigInt(projectId)}
            AND tm.deleted_at IS NULL
            AND u.id NOT IN (
              SELECT su.users_id FROM schedule_user su
              JOIN schedule sc ON sc.id = su.schedule_id
              WHERE sc.projects_id = ${BigInt(projectId)}
                AND sc.deleted_at IS NULL
                AND su.deleted_at IS NULL
                AND sc.schedule_date >= CURRENT_DATE
                AND sc.schedule_date <= CURRENT_DATE + INTERVAL '7 days'
            )
          LIMIT 100
        `,
      ]);

      return {
        daily_logs: dailyLogs.map((l: any) => ({
          log_date: l.log_date,
          total_present: Number(l.total_present),
          total_absent: Number(l.total_absent),
          total_hours_normal: Number(l.total_hours_normal),
          total_hours_overtime: Number(l.total_hours_overtime),
        })),
        scheduled_users: scheduledUsers.map((s: any) => ({
          schedule_date: s.schedule_date,
          team_name: s.team_name,
          total_scheduled: Number(s.total_scheduled),
        })),
        teams_headcount: teamsHeadcount.map((t: any) => ({
          team_id: Number(t.team_id),
          team_name: t.team_name,
          total_members: Number(t.total_members),
        })),
        idle_workers: idleWorkers.map((w: any) => ({
          user_id: Number(w.user_id),
          user_name: w.user_name,
          team_name: w.team_name,
          reason: w.reason,
        })),
      };
    } catch (error) {
      logger.error({ error, projectId }, 'Erro ao coletar dados de forca de trabalho');
      return { daily_logs: [], scheduled_users: [], teams_headcount: [], idle_workers: [] };
    }
  }

  // ===========================================================================
  // 3. WEATHER DATA
  // ===========================================================================

  static async collectWeatherData(projectId: number): Promise<WeatherData> {
    try {
      const [dailyReports, correlation] = await Promise.all([
        db.$queryRaw<any[]>`
          SELECT
            rdo_date::text, weather_morning, weather_afternoon, weather_night,
            temperature_min, temperature_max
          FROM daily_report
          WHERE projects_id = ${BigInt(projectId)}
            AND deleted_at IS NULL
            AND rdo_date >= CURRENT_DATE - INTERVAL '30 days'
          ORDER BY rdo_date DESC
        `,

        db.$queryRaw<any[]>`
          SELECT
            dr.weather_morning AS weather_condition,
            AVG(sub.activity_count) AS avg_activities,
            AVG(sub.qty_done) AS avg_quantity_done,
            COUNT(DISTINCT dr.rdo_date) AS days_count
          FROM daily_report dr
          JOIN (
            SELECT daily_report_id,
              COUNT(*) AS activity_count,
              COALESCE(SUM(quantity_done), 0) AS qty_done
            FROM daily_report_activities
            WHERE deleted_at IS NULL
            GROUP BY daily_report_id
          ) sub ON sub.daily_report_id = dr.id
          WHERE dr.projects_id = ${BigInt(projectId)}
            AND dr.deleted_at IS NULL
            AND dr.rdo_date >= CURRENT_DATE - INTERVAL '30 days'
            AND dr.weather_morning IS NOT NULL
          GROUP BY dr.weather_morning
          ORDER BY avg_activities DESC
        `,
      ]);

      // Fetch forecast from OpenWeatherMap if configured
      let forecast: WeatherData['forecast'] = null;
      try {
        const project = await db.projects.findFirst({
          where: { id: BigInt(projectId), deleted_at: null },
          select: {
            city: true, state: true,
            client: { select: { latitude: true, longitude: true } },
          },
        });

        const coords = project ? await getProjectCoordinates(project) : null;

        if (coords && WeatherService.isConfigured()) {
          const lat = coords.lat;
          const lon = coords.lon;
          const [forecastData, riskData] = await Promise.all([
            WeatherService.getForecast(lat, lon),
            WeatherService.getWeatherRiskAnalysis(lat, lon),
          ]);

          if (forecastData) {
            forecast = {
              daily_summary: forecastData.daily_summary,
              risk_analysis: riskData ? {
                work_days_at_risk: riskData.work_days_at_risk,
                total_work_days: riskData.total_work_days,
                overall_risk: riskData.overall_risk,
                recommendations: riskData.recommendations,
              } : null,
              location: forecastData.location ? {
                name: forecastData.location.name,
                lat: forecastData.location.lat,
                lon: forecastData.location.lon,
              } : null,
            };
          }
        }
      } catch (forecastError) {
        logger.warn({ error: forecastError, projectId }, 'Falha ao buscar previsao - continuando com dados historicos');
      }

      return {
        daily_reports: dailyReports.map((r: any) => ({
          rdo_date: r.rdo_date,
          weather_morning: r.weather_morning,
          weather_afternoon: r.weather_afternoon,
          weather_night: r.weather_night,
          temperature_min: r.temperature_min ? Number(r.temperature_min) : null,
          temperature_max: r.temperature_max ? Number(r.temperature_max) : null,
        })),
        weather_productivity_correlation: correlation.map((c: any) => ({
          weather_condition: c.weather_condition || 'Desconhecido',
          avg_activities: Number(c.avg_activities),
          avg_quantity_done: Number(c.avg_quantity_done),
          days_count: Number(c.days_count),
        })),
        forecast,
      };
    } catch (error) {
      logger.error({ error, projectId }, 'Erro ao coletar dados de clima');
      return { daily_reports: [], weather_productivity_correlation: [], forecast: null };
    }
  }

  // ===========================================================================
  // 4. FAILED TASKS DATA
  // ===========================================================================

  static async collectFailedTasksData(projectId: number): Promise<FailedTasksData> {
    try {
      const [failedTasks, totalTasks] = await Promise.all([
        db.sprints_tasks.findMany({
          where: {
            deleted_at: null,
            sprints_tasks_statuses: { status: 'Sem Sucesso' },
            sprints: {
              deleted_at: null,
              projects_id: BigInt(projectId),
            },
          },
          include: {
            projects_backlogs: { select: { description: true } },
            teams: { select: { name: true } },
            non_execution_reason: { select: { name: true, category: true } },
          },
          orderBy: { scheduled_for: 'desc' },
          take: 200,
        }),

        db.sprints_tasks.count({
          where: {
            deleted_at: null,
            sprints: {
              deleted_at: null,
              projects_id: BigInt(projectId),
            },
          },
        }),
      ]);

      const byCategory: Record<string, number> = {};
      for (const task of failedTasks) {
        const cat = task.non_execution_reason?.category || 'Nao categorizado';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      }

      return {
        failed_tasks: failedTasks.map((t) => ({
          id: Number(t.id),
          description: t.projects_backlogs?.description ?? null,
          team_name: t.teams?.name ?? null,
          scheduled_for: t.scheduled_for?.toISOString()?.split('T')[0] ?? null,
          reason_name: t.non_execution_reason?.name ?? null,
          reason_category: t.non_execution_reason?.category ?? null,
        })),
        by_category: byCategory,
        total_failed: failedTasks.length,
        total_tasks_period: totalTasks,
      };
    } catch (error) {
      logger.error({ error, projectId }, 'Erro ao coletar dados de tarefas sem sucesso');
      return { failed_tasks: [], by_category: {}, total_failed: 0, total_tasks_period: 0 };
    }
  }

  // ===========================================================================
  // 5. AREA PROGRESS DATA
  // ===========================================================================

  static async collectAreaProgressData(projectId: number): Promise<AreaProgressData> {
    try {
      const [fields, backlogByArea] = await Promise.all([
        db.$queryRaw<any[]>`
          SELECT
            f.id AS field_id, f.name AS field_name,
            COUNT(DISTINCT s.id) AS total_sections,
            COUNT(DISTINCT r.id) AS total_rows,
            COUNT(rt.id) AS total_trackers,
            COUNT(rt.id) FILTER (WHERE rts.status = 'Instalado') AS installed_trackers,
            CASE
              WHEN COUNT(rt.id) > 0
              THEN ROUND(COUNT(rt.id) FILTER (WHERE rts.status = 'Instalado') * 100.0 / COUNT(rt.id), 1)
              ELSE 0
            END AS percent_installed
          FROM fields f
          LEFT JOIN sections s ON s.fields_id = f.id AND s.deleted_at IS NULL
          LEFT JOIN rows r ON r.sections_id = s.id AND r.deleted_at IS NULL
          LEFT JOIN rows_trackers rt ON rt.rows_id = r.id AND rt.deleted_at IS NULL
          LEFT JOIN rows_trackers_statuses rts ON rts.id = rt.rows_trackers_statuses_id
          WHERE f.projects_id = ${BigInt(projectId)} AND f.deleted_at IS NULL
          GROUP BY f.id, f.name
          ORDER BY f.name
        `,

        db.$queryRaw<any[]>`
          SELECT
            f.name AS field_name,
            COUNT(pb.id) AS total_backlogs,
            AVG(COALESCE(pb.percent_complete, 0)) AS avg_percent_complete,
            COUNT(pb.id) FILTER (
              WHERE pb.planned_end_date < CURRENT_DATE
              AND COALESCE(pb.percent_complete, 0) < 100
            ) AS total_delayed
          FROM projects_backlogs pb
          LEFT JOIN fields f ON f.id = pb.fields_id
          WHERE pb.projects_id = ${BigInt(projectId)}
            AND pb.deleted_at IS NULL
            AND pb.wbs_code IS NOT NULL
          GROUP BY f.name
          ORDER BY avg_percent_complete ASC
        `,
      ]);

      return {
        fields: fields.map((f: any) => ({
          field_id: Number(f.field_id),
          field_name: f.field_name,
          total_sections: Number(f.total_sections),
          total_rows: Number(f.total_rows),
          total_trackers: Number(f.total_trackers),
          installed_trackers: Number(f.installed_trackers),
          percent_installed: Number(f.percent_installed),
        })),
        backlog_by_area: backlogByArea.map((b: any) => ({
          field_name: b.field_name || 'Sem area definida',
          total_backlogs: Number(b.total_backlogs),
          avg_percent_complete: Math.round(Number(b.avg_percent_complete) * 100) / 100,
          total_delayed: Number(b.total_delayed),
        })),
      };
    } catch (error) {
      logger.error({ error, projectId }, 'Erro ao coletar progresso por area');
      return { fields: [], backlog_by_area: [] };
    }
  }

  // ===========================================================================
  // 6. PROACTIVE INSIGHTS
  // ===========================================================================

  static async collectProactiveInsights(projectId: number): Promise<ProactiveInsights> {
    try {
      const [unassigned, delayedPredecessors, atRiskMilestones] = await Promise.all([
        db.$queryRaw<any[]>`
          SELECT
            pb.id, pb.description, pb.planned_start_date,
            (pb.planned_start_date::date - CURRENT_DATE) AS days_until_start
          FROM projects_backlogs pb
          WHERE pb.projects_id = ${BigInt(projectId)}
            AND pb.deleted_at IS NULL
            AND pb.planned_start_date IS NOT NULL
            AND pb.planned_start_date >= CURRENT_DATE
            AND pb.planned_start_date <= CURRENT_DATE + INTERVAL '14 days'
            AND COALESCE(pb.percent_complete, 0) = 0
            AND NOT EXISTS (
              SELECT 1 FROM sprints_tasks st
              WHERE st.projects_backlogs_id = pb.id AND st.deleted_at IS NULL
            )
          ORDER BY pb.planned_start_date ASC
          LIMIT 50
        `,

        db.$queryRaw<any[]>`
          SELECT
            pred.id AS predecessor_id, pred.description AS predecessor_desc,
            succ.id AS successor_id, succ.description AS successor_desc,
            GREATEST(0, CURRENT_DATE - pred.planned_end_date::date) AS predecessor_delay_days
          FROM task_dependencies td
          JOIN projects_backlogs pred ON pred.id = td.predecessor_backlog_id AND pred.deleted_at IS NULL
          JOIN projects_backlogs succ ON succ.id = td.successor_backlog_id AND succ.deleted_at IS NULL
          WHERE td.projects_id = ${BigInt(projectId)}
            AND td.deleted_at IS NULL
            AND pred.planned_end_date < CURRENT_DATE
            AND COALESCE(pred.percent_complete, 0) < 100
          ORDER BY predecessor_delay_days DESC
          LIMIT 30
        `,

        db.$queryRaw<any[]>`
          SELECT
            pb.id, pb.description, pb.planned_end_date,
            COALESCE(pb.percent_complete, 0) AS percent_complete,
            (pb.planned_end_date::date - CURRENT_DATE) AS days_remaining
          FROM projects_backlogs pb
          WHERE pb.projects_id = ${BigInt(projectId)}
            AND pb.deleted_at IS NULL
            AND pb.is_milestone = true
            AND pb.planned_end_date IS NOT NULL
            AND pb.planned_end_date <= CURRENT_DATE + INTERVAL '14 days'
            AND COALESCE(pb.percent_complete, 0) < 100
          ORDER BY pb.planned_end_date ASC
          LIMIT 20
        `,
      ]);

      return {
        unassigned_upcoming_tasks: unassigned.map((t: any) => ({
          id: Number(t.id),
          description: t.description,
          planned_start_date: t.planned_start_date?.toISOString()?.split('T')[0] ?? null,
          days_until_start: Number(t.days_until_start),
        })),
        delayed_predecessors: delayedPredecessors.map((d: any) => ({
          predecessor_id: Number(d.predecessor_id),
          predecessor_desc: d.predecessor_desc,
          successor_id: Number(d.successor_id),
          successor_desc: d.successor_desc,
          predecessor_delay_days: Number(d.predecessor_delay_days),
        })),
        at_risk_milestones: atRiskMilestones.map((m: any) => ({
          id: Number(m.id),
          description: m.description,
          planned_end_date: m.planned_end_date?.toISOString()?.split('T')[0] ?? null,
          percent_complete: Number(m.percent_complete),
          days_remaining: Number(m.days_remaining),
        })),
      };
    } catch (error) {
      logger.error({ error, projectId }, 'Erro ao coletar insights proativos');
      return { unassigned_upcoming_tasks: [], delayed_predecessors: [], at_risk_milestones: [] };
    }
  }

  // ===========================================================================
  // 7. COLLECT ALL RCC DATA
  // ===========================================================================

  static async collectRCCData(projectId: number): Promise<RCCData> {
    const [
      productivity,
      workforce,
      weather,
      failed_tasks,
      area_progress,
      proactive,
      schedule_health,
      critical_path,
    ] = await Promise.all([
      this.collectProductivityData(projectId),
      this.collectWorkforceData(projectId),
      this.collectWeatherData(projectId),
      this.collectFailedTasksData(projectId),
      this.collectAreaProgressData(projectId),
      this.collectProactiveInsights(projectId),
      PlanningService.getScheduleHealth(projectId),
      PlanningService.getCriticalPath(projectId),
    ]);

    return {
      productivity,
      workforce,
      weather,
      failed_tasks,
      area_progress,
      proactive,
      schedule_health,
      critical_path,
    };
  }
}

export default ScheduleManagerDataService;
