// =============================================================================
// INDUSTRYVIEW BACKEND - Safety Module Service
// Service do modulo de seguranca do trabalho
// Cobre: safety_incidents, safety_incident_witnesses, safety_incident_attachments,
//        dds_records, dds_participants, training_types, worker_trainings,
//        task_required_trainings
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListIncidentsInput,
  GetIncidentStatisticsInput,
  CreateSafetyIncidentInput,
  UpdateSafetyIncidentInput,
  InvestigateIncidentInput,
  CloseIncidentInput,
  CreateIncidentWitnessInput,
  CreateIncidentAttachmentInput,
  ListTrainingTypesInput,
  CreateTrainingTypeInput,
  UpdateTrainingTypeInput,
  ListWorkerTrainingsInput,
  GetExpiringTrainingsInput,
  CreateWorkerTrainingInput,
  CheckTrainingEligibilityInput,
  ListTaskRequiredTrainingsInput,
  CreateTaskRequiredTrainingInput,
  ListDdsRecordsInput,
  GetDdsStatisticsInput,
  CreateDdsRecordInput,
} from './safety.schema';

// =============================================================================
// Tipos internos para resultados de raw queries
// =============================================================================

interface SafetyIncidentRow {
  id: bigint;
  incident_number: string;
  projects_id: bigint | null;
  company_id: bigint | null;
  reported_by: bigint;
  incident_date: Date;
  description: string;
  location: string;
  severity: string;
  status: string;
  injured_user_id: bigint | null;
  injured_name: string | null;
  body_part_affected: string | null;
  lost_time_days: number;
  immediate_cause: string | null;
  property_damage: boolean;
  property_damage_description: string | null;
  investigated_by: bigint | null;
  investigation_notes: string | null;
  investigated_at: Date | null;
  root_cause: string | null;
  corrective_actions: string | null;
  preventive_actions: string | null;
  closed_by: bigint | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

interface TrainingTypeRow {
  id: bigint;
  company_id: bigint | null;
  name: string;
  description: string | null;
  validity_months: number;
  is_mandatory: boolean;
  regulatory_norm: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date | null;
}

interface WorkerTrainingRow {
  id: bigint;
  user_id: bigint;
  training_types_id: bigint;
  training_date: Date;
  expiry_date: Date;
  instructor_name: string | null;
  training_provider: string | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
}

interface TaskRequiredTrainingRow {
  id: bigint;
  tasks_template_id: bigint;
  training_types_id: bigint;
  created_at: Date;
}

interface DdsRecordRow {
  id: bigint;
  projects_id: bigint | null;
  company_id: bigint | null;
  conducted_by: bigint;
  dds_date: Date;
  topic: string;
  duration_minutes: number;
  content: string | null;
  location: string | null;
  created_at: Date;
  updated_at: Date | null;
}

interface DdsParticipantRow {
  id: bigint;
  dds_records_id: bigint;
  user_id: bigint;
  signed_at: Date | null;
  created_at: Date;
}

interface CountRow {
  count: bigint;
}

/**
 * SafetyService - Service do modulo de seguranca do trabalho
 */
export class SafetyService {
  // ===========================================================================
  // Safety Incidents
  // ===========================================================================

  /**
   * Gera numero sequencial de incidente no formato INC-YYYY-NNN
   * Ex: INC-2025-001, INC-2025-042
   */
  private static async generateIncidentNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const result = await db.$queryRaw<CountRow[]>`
      SELECT COUNT(*) as count
      FROM safety_incidents
      WHERE incident_number LIKE ${'INC-' + year + '-%'}
    `;

    const sequence = Number(result[0]?.count ?? 0) + 1;
    const paddedSequence = String(sequence).padStart(3, '0');

    return `INC-${year}-${paddedSequence}`;
  }

  /**
   * Lista incidentes de seguranca com paginacao e filtros
   */
  static async listIncidents(input: ListIncidentsInput) {
    const { projects_id, company_id, severity, status, initial_date, final_date, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (projects_id) {
      conditions.push(`projects_id = $${paramIndex++}`);
      values.push(BigInt(projects_id));
    }
    if (company_id) {
      conditions.push(`company_id = $${paramIndex++}`);
      values.push(BigInt(company_id));
    }
    if (severity) {
      conditions.push(`severity = $${paramIndex++}`);
      values.push(severity);
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (initial_date) {
      conditions.push(`incident_date >= $${paramIndex++}`);
      values.push(new Date(initial_date));
    }
    if (final_date) {
      conditions.push(`incident_date <= $${paramIndex++}`);
      values.push(new Date(final_date));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [items, totalResult] = await Promise.all([
      db.$queryRawUnsafe<SafetyIncidentRow[]>(
        `SELECT * FROM safety_incidents ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        ...values,
        per_page,
        skip
      ),
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM safety_incidents ${whereClause}`,
        ...values
      ),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);
    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca incidente de seguranca por ID com witnesses e attachments
   */
  static async getIncidentById(id: number) {
    const incidents = await db.$queryRaw<SafetyIncidentRow[]>`
      SELECT * FROM safety_incidents WHERE id = ${BigInt(id)}
    `;

    if (!incidents || incidents.length === 0) {
      throw new NotFoundError('Incidente nao encontrado.');
    }

    const incident = incidents[0];

    const [witnesses, attachments] = await Promise.all([
      db.$queryRaw<unknown[]>`
        SELECT * FROM safety_incident_witnesses WHERE safety_incidents_id = ${BigInt(id)} ORDER BY created_at ASC
      `,
      db.$queryRaw<unknown[]>`
        SELECT * FROM safety_incident_attachments WHERE safety_incidents_id = ${BigInt(id)} ORDER BY created_at ASC
      `,
    ]);

    return {
      ...incident,
      witnesses,
      attachments,
    };
  }

  /**
   * Cria incidente de seguranca
   * Auto-gera incident_number no formato INC-YYYY-NNN
   */
  static async createIncident(input: CreateSafetyIncidentInput) {
    const incidentNumber = await SafetyService.generateIncidentNumber();

    const result = await db.$queryRaw<SafetyIncidentRow[]>`
      INSERT INTO safety_incidents (
        incident_number,
        projects_id,
        company_id,
        reported_by,
        incident_date,
        description,
        location,
        severity,
        status,
        injured_user_id,
        injured_name,
        body_part_affected,
        lost_time_days,
        immediate_cause,
        property_damage,
        property_damage_description,
        created_at,
        updated_at
      ) VALUES (
        ${incidentNumber},
        ${input.projects_id ? BigInt(input.projects_id) : null},
        ${input.company_id ? BigInt(input.company_id) : null},
        ${BigInt(input.reported_by)},
        ${new Date(input.incident_date)},
        ${input.description},
        ${input.location},
        ${input.severity},
        'aberto',
        ${input.injured_user_id ? BigInt(input.injured_user_id) : null},
        ${input.injured_name ?? null},
        ${input.body_part_affected ?? null},
        ${input.lost_time_days ?? 0},
        ${input.immediate_cause ?? null},
        ${input.property_damage ?? false},
        ${input.property_damage_description ?? null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Atualiza incidente de seguranca
   * Nao permite atualizacao de incidentes com status 'encerrado'
   */
  static async updateIncident(id: number, input: UpdateSafetyIncidentInput) {
    const existing = await db.$queryRaw<SafetyIncidentRow[]>`
      SELECT id, status FROM safety_incidents WHERE id = ${BigInt(id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Incidente nao encontrado.');
    }

    if (existing[0].status === 'encerrado') {
      throw new BadRequestError('Incidentes encerrados nao podem ser modificados.');
    }

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.location !== undefined) {
      setClauses.push(`location = $${paramIndex++}`);
      values.push(input.location);
    }
    if (input.severity !== undefined) {
      setClauses.push(`severity = $${paramIndex++}`);
      values.push(input.severity);
    }
    if (input.injured_user_id !== undefined) {
      setClauses.push(`injured_user_id = $${paramIndex++}`);
      values.push(input.injured_user_id ? BigInt(input.injured_user_id) : null);
    }
    if (input.injured_name !== undefined) {
      setClauses.push(`injured_name = $${paramIndex++}`);
      values.push(input.injured_name);
    }
    if (input.body_part_affected !== undefined) {
      setClauses.push(`body_part_affected = $${paramIndex++}`);
      values.push(input.body_part_affected);
    }
    if (input.lost_time_days !== undefined) {
      setClauses.push(`lost_time_days = $${paramIndex++}`);
      values.push(input.lost_time_days);
    }
    if (input.immediate_cause !== undefined) {
      setClauses.push(`immediate_cause = $${paramIndex++}`);
      values.push(input.immediate_cause);
    }
    if (input.property_damage !== undefined) {
      setClauses.push(`property_damage = $${paramIndex++}`);
      values.push(input.property_damage);
    }
    if (input.property_damage_description !== undefined) {
      setClauses.push(`property_damage_description = $${paramIndex++}`);
      values.push(input.property_damage_description);
    }

    values.push(BigInt(id));

    const result = await db.$queryRawUnsafe<SafetyIncidentRow[]>(
      `UPDATE safety_incidents SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      ...values
    );

    return result[0];
  }

  /**
   * Inicia investigacao de incidente
   * Muda status para 'em_investigacao' e registra investigador e data
   */
  static async investigateIncident(id: number, input: InvestigateIncidentInput) {
    const existing = await db.$queryRaw<SafetyIncidentRow[]>`
      SELECT id, status FROM safety_incidents WHERE id = ${BigInt(id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Incidente nao encontrado.');
    }

    if (existing[0].status === 'encerrado') {
      throw new BadRequestError('Incidentes encerrados nao podem ser modificados.');
    }

    if (existing[0].status === 'em_investigacao') {
      throw new BadRequestError('Este incidente ja esta em investigacao.');
    }

    const result = await db.$queryRaw<SafetyIncidentRow[]>`
      UPDATE safety_incidents
      SET
        status = 'em_investigacao',
        investigated_by = ${BigInt(input.investigated_by)},
        investigation_notes = ${input.investigation_notes ?? null},
        investigated_at = NOW(),
        updated_at = NOW()
      WHERE id = ${BigInt(id)}
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Encerra incidente
   * Exige causa raiz e acoes corretivas para encerramento
   */
  static async closeIncident(id: number, input: CloseIncidentInput) {
    const existing = await db.$queryRaw<SafetyIncidentRow[]>`
      SELECT id, status FROM safety_incidents WHERE id = ${BigInt(id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Incidente nao encontrado.');
    }

    if (existing[0].status === 'encerrado') {
      throw new BadRequestError('Este incidente ja foi encerrado.');
    }

    const result = await db.$queryRaw<SafetyIncidentRow[]>`
      UPDATE safety_incidents
      SET
        status = 'encerrado',
        root_cause = ${input.root_cause},
        corrective_actions = ${input.corrective_actions},
        preventive_actions = ${input.preventive_actions ?? null},
        closed_by = ${BigInt(input.closed_by)},
        closed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${BigInt(id)}
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Retorna estatisticas de incidentes baseadas na Piramide de Bird
   * Piramide de Bird: 1 fatal -> 10 graves -> 30 moderados -> 600 leves
   */
  static async getIncidentStatistics(input: GetIncidentStatisticsInput) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.projects_id) {
      conditions.push(`projects_id = $${paramIndex++}`);
      values.push(BigInt(input.projects_id));
    }
    if (input.company_id) {
      conditions.push(`company_id = $${paramIndex++}`);
      values.push(BigInt(input.company_id));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [bySeverity, byStatus, totalLostDays] = await Promise.all([
      db.$queryRawUnsafe<{ severity: string; count: bigint }[]>(
        `SELECT severity, COUNT(*)::bigint as count FROM safety_incidents ${whereClause} GROUP BY severity`,
        ...values
      ),
      db.$queryRawUnsafe<{ status: string; count: bigint }[]>(
        `SELECT status, COUNT(*)::bigint as count FROM safety_incidents ${whereClause} GROUP BY status`,
        ...values
      ),
      db.$queryRawUnsafe<{ total: bigint }[]>(
        `SELECT COALESCE(SUM(lost_time_days), 0)::bigint as total FROM safety_incidents ${whereClause}`,
        ...values
      ),
    ]);

    // Organiza contagens por severidade
    const severityCounts = {
      fatal: 0,
      grave: 0,
      moderado: 0,
      leve: 0,
    };

    for (const row of bySeverity) {
      const key = row.severity as keyof typeof severityCounts;
      if (key in severityCounts) {
        severityCounts[key] = Number(row.count);
      }
    }

    // Organiza contagens por status
    const statusCounts = {
      aberto: 0,
      em_investigacao: 0,
      encerrado: 0,
    };

    for (const row of byStatus) {
      const key = row.status as keyof typeof statusCounts;
      if (key in statusCounts) {
        statusCounts[key] = Number(row.count);
      }
    }

    const totalIncidents = Object.values(severityCounts).reduce((acc, v) => acc + v, 0);

    return {
      total_incidents: totalIncidents,
      total_lost_days: Number(totalLostDays[0]?.total ?? 0),
      by_severity: severityCounts,
      by_status: statusCounts,
      // Piramide de Bird - proporcao relativa ao ponto base
      bird_pyramid: {
        fatal: severityCounts.fatal,
        grave: severityCounts.grave,
        moderado: severityCounts.moderado,
        leve: severityCounts.leve,
        ratio_description: 'Para cada acidente fatal, esperam-se ~10 graves, ~30 moderados e ~600 leves (Heinrich/Bird)',
      },
    };
  }

  // ===========================================================================
  // Incident Witnesses
  // ===========================================================================

  /**
   * Adiciona testemunha a um incidente
   */
  static async addWitness(incident_id: number, input: CreateIncidentWitnessInput) {
    const existing = await db.$queryRaw<SafetyIncidentRow[]>`
      SELECT id, status FROM safety_incidents WHERE id = ${BigInt(incident_id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Incidente nao encontrado.');
    }

    if (existing[0].status === 'encerrado') {
      throw new BadRequestError('Nao e possivel adicionar testemunhas a incidentes encerrados.');
    }

    const result = await db.$queryRaw<unknown[]>`
      INSERT INTO safety_incident_witnesses (
        safety_incidents_id,
        user_id,
        witness_name,
        witness_statement,
        witness_contact,
        created_at
      ) VALUES (
        ${BigInt(incident_id)},
        ${input.user_id ? BigInt(input.user_id) : null},
        ${input.witness_name},
        ${input.witness_statement ?? null},
        ${input.witness_contact ?? null},
        NOW()
      )
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Adiciona anexo a um incidente
   */
  static async addAttachment(incident_id: number, input: CreateIncidentAttachmentInput) {
    const existing = await db.$queryRaw<SafetyIncidentRow[]>`
      SELECT id, status FROM safety_incidents WHERE id = ${BigInt(incident_id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Incidente nao encontrado.');
    }

    if (existing[0].status === 'encerrado') {
      throw new BadRequestError('Nao e possivel adicionar anexos a incidentes encerrados.');
    }

    const result = await db.$queryRaw<unknown[]>`
      INSERT INTO safety_incident_attachments (
        safety_incidents_id,
        file_url,
        file_name,
        file_type,
        uploaded_by,
        created_at
      ) VALUES (
        ${BigInt(incident_id)},
        ${input.file_url},
        ${input.file_name},
        ${input.file_type ?? null},
        ${BigInt(input.uploaded_by)},
        NOW()
      )
      RETURNING *
    `;

    return result[0];
  }

  // ===========================================================================
  // Training Types
  // ===========================================================================

  /**
   * Lista tipos de treinamento
   */
  static async listTrainingTypes(input: ListTrainingTypesInput) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.company_id) {
      conditions.push(`(company_id = $${paramIndex++} OR company_id IS NULL)`);
      values.push(BigInt(input.company_id));
    }
    if (input.active_only) {
      conditions.push(`is_active = true`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return db.$queryRawUnsafe<TrainingTypeRow[]>(
      `SELECT * FROM training_types ${whereClause} ORDER BY name ASC`,
      ...values
    );
  }

  /**
   * Busca tipo de treinamento por ID
   */
  static async getTrainingTypeById(id: number) {
    const result = await db.$queryRaw<TrainingTypeRow[]>`
      SELECT * FROM training_types WHERE id = ${BigInt(id)}
    `;

    if (!result || result.length === 0) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    return result[0];
  }

  /**
   * Cria tipo de treinamento
   */
  static async createTrainingType(input: CreateTrainingTypeInput) {
    // Verifica duplicidade de nome dentro da mesma empresa
    const existing = await db.$queryRaw<TrainingTypeRow[]>`
      SELECT id FROM training_types
      WHERE LOWER(name) = LOWER(${input.name})
        AND (
          company_id = ${input.company_id ? BigInt(input.company_id) : null}
          OR (company_id IS NULL AND ${input.company_id ? BigInt(input.company_id) : null} IS NULL)
        )
    `;

    if (existing && existing.length > 0) {
      throw new BadRequestError(`Ja existe um tipo de treinamento com o nome "${input.name}" para esta empresa.`);
    }

    const result = await db.$queryRaw<TrainingTypeRow[]>`
      INSERT INTO training_types (
        company_id,
        name,
        description,
        validity_months,
        is_mandatory,
        regulatory_norm,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        ${input.company_id ? BigInt(input.company_id) : null},
        ${input.name},
        ${input.description ?? null},
        ${input.validity_months},
        ${input.is_mandatory ?? false},
        ${input.regulatory_norm ?? null},
        ${input.is_active ?? true},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Atualiza tipo de treinamento
   */
  static async updateTrainingType(id: number, input: UpdateTrainingTypeInput) {
    const existing = await db.$queryRaw<TrainingTypeRow[]>`
      SELECT id FROM training_types WHERE id = ${BigInt(id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.validity_months !== undefined) {
      setClauses.push(`validity_months = $${paramIndex++}`);
      values.push(input.validity_months);
    }
    if (input.is_mandatory !== undefined) {
      setClauses.push(`is_mandatory = $${paramIndex++}`);
      values.push(input.is_mandatory);
    }
    if (input.regulatory_norm !== undefined) {
      setClauses.push(`regulatory_norm = $${paramIndex++}`);
      values.push(input.regulatory_norm);
    }
    if (input.is_active !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    values.push(BigInt(id));

    const result = await db.$queryRawUnsafe<TrainingTypeRow[]>(
      `UPDATE training_types SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      ...values
    );

    return result[0];
  }

  /**
   * Remove tipo de treinamento
   * Impede remocao se houver treinamentos ou associacoes de tarefas vinculadas
   */
  static async deleteTrainingType(id: number) {
    const existing = await db.$queryRaw<TrainingTypeRow[]>`
      SELECT id FROM training_types WHERE id = ${BigInt(id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    // Verifica se existe algum worker_training usando este tipo
    const inUse = await db.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::bigint as count FROM worker_trainings WHERE training_types_id = ${BigInt(id)}
    `;

    if (Number(inUse[0]?.count ?? 0) > 0) {
      throw new BadRequestError(
        'Nao e possivel excluir este tipo de treinamento pois ha registros de trabalhadores vinculados. Desative-o ao inves de excluir.'
      );
    }

    // Verifica se existe alguma task_required_training usando este tipo
    const requiredByTask = await db.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::bigint as count FROM task_required_trainings WHERE training_types_id = ${BigInt(id)}
    `;

    if (Number(requiredByTask[0]?.count ?? 0) > 0) {
      throw new BadRequestError(
        'Nao e possivel excluir este tipo de treinamento pois ha tarefas que o exigem. Desative-o ao inves de excluir.'
      );
    }

    await db.$executeRaw`
      DELETE FROM training_types WHERE id = ${BigInt(id)}
    `;

    return { success: true, id };
  }

  // ===========================================================================
  // Worker Trainings
  // ===========================================================================

  /**
   * Lista treinamentos de trabalhadores com paginacao e filtros
   * Status calculado dinamicamente com base em expiry_date
   */
  static async listWorkerTrainings(input: ListWorkerTrainingsInput) {
    const { user_id, training_types_id, company_id, status, page, per_page } = input;
    const skip = (page - 1) * per_page;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (user_id) {
      conditions.push(`wt.user_id = $${paramIndex++}`);
      values.push(BigInt(user_id));
    }
    if (training_types_id) {
      conditions.push(`wt.training_types_id = $${paramIndex++}`);
      values.push(BigInt(training_types_id));
    }

    // Filtra por empresa via join com users se company_id informado
    if (company_id) {
      conditions.push(`u.company_id = $${paramIndex++}`);
      values.push(BigInt(company_id));
    }

    // Filtro de status calculado via expiry_date
    if (status === 'expirado') {
      conditions.push(`wt.expiry_date < $${paramIndex++}`);
      values.push(today);
    } else if (status === 'expirando') {
      conditions.push(`wt.expiry_date >= $${paramIndex++} AND wt.expiry_date <= $${paramIndex++}`);
      values.push(today);
      values.push(thirtyDaysFromNow);
    } else if (status === 'valido') {
      conditions.push(`wt.expiry_date > $${paramIndex++}`);
      values.push(thirtyDaysFromNow);
    }

    const joinClause = company_id ? 'JOIN users u ON wt.user_id = u.id' : '';
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const selectQuery = `
      SELECT wt.*, tt.name as training_name, tt.validity_months, tt.regulatory_norm,
             CASE
               WHEN wt.expiry_date < NOW() THEN 'expirado'
               WHEN wt.expiry_date <= NOW() + INTERVAL '30 days' THEN 'expirando'
               ELSE 'valido'
             END as computed_status
      FROM worker_trainings wt
      JOIN training_types tt ON wt.training_types_id = tt.id
      ${joinClause}
      ${whereClause}
      ORDER BY wt.expiry_date ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const countQuery = `
      SELECT COUNT(*)::bigint as count
      FROM worker_trainings wt
      JOIN training_types tt ON wt.training_types_id = tt.id
      ${joinClause}
      ${whereClause}
    `;

    const [items, totalResult] = await Promise.all([
      db.$queryRawUnsafe<(WorkerTrainingRow & { training_name: string; computed_status: string })[]>(
        selectQuery,
        ...values,
        per_page,
        skip
      ),
      db.$queryRawUnsafe<CountRow[]>(countQuery, ...values),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);
    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria registro de treinamento para um trabalhador
   * Calcula automaticamente expiry_date com base em training_date + validity_months
   */
  static async createWorkerTraining(input: CreateWorkerTrainingInput) {
    // Busca validity_months do tipo de treinamento
    const trainingType = await db.$queryRaw<TrainingTypeRow[]>`
      SELECT id, validity_months FROM training_types WHERE id = ${BigInt(input.training_types_id)}
    `;

    if (!trainingType || trainingType.length === 0) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    const trainingDate = new Date(input.training_date);
    const validityMonths = trainingType[0].validity_months;

    // Calcula data de expiracao: training_date + validity_months
    const expiryDate = new Date(trainingDate);
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

    const result = await db.$queryRaw<WorkerTrainingRow[]>`
      INSERT INTO worker_trainings (
        user_id,
        training_types_id,
        training_date,
        expiry_date,
        instructor_name,
        training_provider,
        certificate_url,
        notes,
        created_at,
        updated_at
      ) VALUES (
        ${BigInt(input.user_id)},
        ${BigInt(input.training_types_id)},
        ${trainingDate},
        ${expiryDate},
        ${input.instructor_name ?? null},
        ${input.training_provider ?? null},
        ${input.certificate_url ?? null},
        ${input.notes ?? null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return {
      ...result[0],
      training_type: trainingType[0],
    };
  }

  /**
   * Lista treinamentos proximos do vencimento (dentro de N dias)
   */
  static async getExpiringTrainings(input: GetExpiringTrainingsInput) {
    const { days, company_id } = input;
    const today = new Date();
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + days);

    if (company_id) {
      return db.$queryRaw<(WorkerTrainingRow & { training_name: string; user_name: string })[]>`
        SELECT wt.*, tt.name as training_name, u.name as user_name
        FROM worker_trainings wt
        JOIN training_types tt ON wt.training_types_id = tt.id
        JOIN users u ON wt.user_id = u.id
        WHERE wt.expiry_date >= ${today}
          AND wt.expiry_date <= ${limitDate}
          AND u.company_id = ${BigInt(company_id)}
        ORDER BY wt.expiry_date ASC
      `;
    }

    return db.$queryRaw<(WorkerTrainingRow & { training_name: string; user_name: string })[]>`
      SELECT wt.*, tt.name as training_name, u.name as user_name
      FROM worker_trainings wt
      JOIN training_types tt ON wt.training_types_id = tt.id
      JOIN users u ON wt.user_id = u.id
      WHERE wt.expiry_date >= ${today}
        AND wt.expiry_date <= ${limitDate}
      ORDER BY wt.expiry_date ASC
    `;
  }

  /**
   * Lista treinamentos ja vencidos
   */
  static async getExpiredTrainings(company_id?: number) {
    const today = new Date();

    if (company_id) {
      return db.$queryRaw<(WorkerTrainingRow & { training_name: string; user_name: string })[]>`
        SELECT wt.*, tt.name as training_name, u.name as user_name
        FROM worker_trainings wt
        JOIN training_types tt ON wt.training_types_id = tt.id
        JOIN users u ON wt.user_id = u.id
        WHERE wt.expiry_date < ${today}
          AND u.company_id = ${BigInt(company_id)}
        ORDER BY wt.expiry_date DESC
      `;
    }

    return db.$queryRaw<(WorkerTrainingRow & { training_name: string; user_name: string })[]>`
      SELECT wt.*, tt.name as training_name, u.name as user_name
      FROM worker_trainings wt
      JOIN training_types tt ON wt.training_types_id = tt.id
      JOIN users u ON wt.user_id = u.id
      WHERE wt.expiry_date < ${today}
      ORDER BY wt.expiry_date DESC
    `;
  }

  /**
   * Verifica elegibilidade de treinamento de um trabalhador para uma tarefa
   * Retorna { eligible: bool, missing: TrainingType[] }
   * Verifica se o trabalhador possui todos os treinamentos requeridos para o template
   * e se eles nao estao vencidos (expiry_date > hoje)
   */
  static async checkTrainingEligibility(input: CheckTrainingEligibilityInput) {
    const { user_id, tasks_template_id } = input;
    const today = new Date();

    // Busca treinamentos obrigatorios para o template de tarefa
    const requiredTrainings = await db.$queryRaw<(TaskRequiredTrainingRow & { training_name: string; validity_months: number })[]>`
      SELECT trt.*, tt.name as training_name, tt.validity_months
      FROM task_required_trainings trt
      JOIN training_types tt ON trt.training_types_id = tt.id
      WHERE trt.tasks_template_id = ${BigInt(tasks_template_id)}
    `;

    if (!requiredTrainings || requiredTrainings.length === 0) {
      // Nenhum treinamento requerido para esta tarefa
      return {
        eligible: true,
        missing: [],
        message: 'Nenhum treinamento especifico e exigido para esta tarefa.',
      };
    }

    // Busca treinamentos validos do trabalhador (nao vencidos)
    const workerValidTrainings = await db.$queryRaw<WorkerTrainingRow[]>`
      SELECT wt.*
      FROM worker_trainings wt
      WHERE wt.user_id = ${BigInt(user_id)}
        AND wt.expiry_date > ${today}
    `;

    const workerTrainingTypeIds = new Set(
      workerValidTrainings.map(wt => wt.training_types_id.toString())
    );

    // Identifica quais treinamentos obrigatorios estao faltando ou vencidos
    const missing = requiredTrainings.filter(
      req => !workerTrainingTypeIds.has(req.training_types_id.toString())
    );

    return {
      eligible: missing.length === 0,
      missing: missing.map(m => ({
        id: m.training_types_id,
        name: m.training_name,
        validity_months: m.validity_months,
      })),
      message: missing.length === 0
        ? 'Trabalhador possui todos os treinamentos necessarios e validos.'
        : `Trabalhador esta faltando ${missing.length} treinamento(s) obrigatorio(s).`,
    };
  }

  // ===========================================================================
  // Task Required Trainings
  // ===========================================================================

  /**
   * Lista treinamentos requeridos para templates de tarefas
   */
  static async listTaskRequiredTrainings(input: ListTaskRequiredTrainingsInput) {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.tasks_template_id) {
      conditions.push(`trt.tasks_template_id = $${paramIndex++}`);
      values.push(BigInt(input.tasks_template_id));
    }
    if (input.training_types_id) {
      conditions.push(`trt.training_types_id = $${paramIndex++}`);
      values.push(BigInt(input.training_types_id));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return db.$queryRawUnsafe<(TaskRequiredTrainingRow & { training_name: string })[]>(
      `SELECT trt.*, tt.name as training_name, tt.validity_months, tt.is_mandatory, tt.regulatory_norm
       FROM task_required_trainings trt
       JOIN training_types tt ON trt.training_types_id = tt.id
       ${whereClause}
       ORDER BY tt.name ASC`,
      ...values
    );
  }

  /**
   * Associa um treinamento obrigatorio a um template de tarefa
   */
  static async createTaskRequiredTraining(input: CreateTaskRequiredTrainingInput) {
    // Verifica se ja existe a associacao
    const existing = await db.$queryRaw<TaskRequiredTrainingRow[]>`
      SELECT id FROM task_required_trainings
      WHERE tasks_template_id = ${BigInt(input.tasks_template_id)}
        AND training_types_id = ${BigInt(input.training_types_id)}
    `;

    if (existing && existing.length > 0) {
      throw new BadRequestError('Este treinamento ja e obrigatorio para este template de tarefa.');
    }

    // Verifica se o tipo de treinamento existe
    const trainingType = await db.$queryRaw<TrainingTypeRow[]>`
      SELECT id FROM training_types WHERE id = ${BigInt(input.training_types_id)}
    `;

    if (!trainingType || trainingType.length === 0) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    const result = await db.$queryRaw<TaskRequiredTrainingRow[]>`
      INSERT INTO task_required_trainings (
        tasks_template_id,
        training_types_id,
        created_at
      ) VALUES (
        ${BigInt(input.tasks_template_id)},
        ${BigInt(input.training_types_id)},
        NOW()
      )
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Remove associacao de treinamento obrigatorio de um template de tarefa
   */
  static async deleteTaskRequiredTraining(id: number) {
    const existing = await db.$queryRaw<TaskRequiredTrainingRow[]>`
      SELECT id FROM task_required_trainings WHERE id = ${BigInt(id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Associacao de treinamento nao encontrada.');
    }

    await db.$executeRaw`
      DELETE FROM task_required_trainings WHERE id = ${BigInt(id)}
    `;

    return { success: true, id };
  }

  // ===========================================================================
  // DDS Records (Dialogo Diario de Seguranca)
  // ===========================================================================

  /**
   * Lista registros de DDS com paginacao e filtros
   */
  static async listDdsRecords(input: ListDdsRecordsInput) {
    const { projects_id, company_id, initial_date, final_date, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (projects_id) {
      conditions.push(`projects_id = $${paramIndex++}`);
      values.push(BigInt(projects_id));
    }
    if (company_id) {
      conditions.push(`company_id = $${paramIndex++}`);
      values.push(BigInt(company_id));
    }
    if (initial_date) {
      conditions.push(`dds_date >= $${paramIndex++}`);
      values.push(new Date(initial_date));
    }
    if (final_date) {
      conditions.push(`dds_date <= $${paramIndex++}`);
      values.push(new Date(final_date));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [items, totalResult] = await Promise.all([
      db.$queryRawUnsafe<(DdsRecordRow & { participant_count: bigint })[]>(
        `SELECT dr.*,
                (SELECT COUNT(*)::bigint FROM dds_participants dp WHERE dp.dds_records_id = dr.id) as participant_count
         FROM dds_records dr
         ${whereClause}
         ORDER BY dr.dds_date DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        ...values,
        per_page,
        skip
      ),
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_records ${whereClause}`,
        ...values
      ),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);
    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca DDS por ID com lista de participantes
   */
  static async getDdsById(id: number) {
    const records = await db.$queryRaw<DdsRecordRow[]>`
      SELECT * FROM dds_records WHERE id = ${BigInt(id)}
    `;

    if (!records || records.length === 0) {
      throw new NotFoundError('Registro de DDS nao encontrado.');
    }

    const participants = await db.$queryRaw<(DdsParticipantRow & { user_name: string })[]>`
      SELECT dp.*, u.name as user_name
      FROM dds_participants dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.dds_records_id = ${BigInt(id)}
      ORDER BY dp.created_at ASC
    `;

    return {
      ...records[0],
      participants,
    };
  }

  /**
   * Cria registro de DDS com participantes iniciais
   */
  static async createDdsRecord(input: CreateDdsRecordInput) {
    const record = await db.$queryRaw<DdsRecordRow[]>`
      INSERT INTO dds_records (
        projects_id,
        company_id,
        conducted_by,
        dds_date,
        topic,
        duration_minutes,
        content,
        location,
        created_at,
        updated_at
      ) VALUES (
        ${input.projects_id ? BigInt(input.projects_id) : null},
        ${input.company_id ? BigInt(input.company_id) : null},
        ${BigInt(input.conducted_by)},
        ${new Date(input.dds_date)},
        ${input.topic},
        ${input.duration_minutes ?? 15},
        ${input.content ?? null},
        ${input.location ?? null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const ddsRecord = record[0];

    // Adiciona participantes iniciais se informados
    const participants: DdsParticipantRow[] = [];
    for (const userId of input.participants ?? []) {
      const participant = await db.$queryRaw<DdsParticipantRow[]>`
        INSERT INTO dds_participants (dds_records_id, user_id, created_at)
        VALUES (${ddsRecord.id}, ${BigInt(userId)}, NOW())
        ON CONFLICT (dds_records_id, user_id) DO NOTHING
        RETURNING *
      `;
      if (participant && participant.length > 0) {
        participants.push(participant[0]);
      }
    }

    return {
      ...ddsRecord,
      participants,
    };
  }

  /**
   * Adiciona participante a um DDS existente
   */
  static async addDdsParticipant(dds_id: number, user_id: number) {
    const existing = await db.$queryRaw<DdsRecordRow[]>`
      SELECT id FROM dds_records WHERE id = ${BigInt(dds_id)}
    `;

    if (!existing || existing.length === 0) {
      throw new NotFoundError('Registro de DDS nao encontrado.');
    }

    // Verifica se o participante ja esta registrado
    const alreadyAdded = await db.$queryRaw<DdsParticipantRow[]>`
      SELECT id FROM dds_participants
      WHERE dds_records_id = ${BigInt(dds_id)} AND user_id = ${BigInt(user_id)}
    `;

    if (alreadyAdded && alreadyAdded.length > 0) {
      throw new BadRequestError('Este usuario ja esta registrado como participante deste DDS.');
    }

    const result = await db.$queryRaw<DdsParticipantRow[]>`
      INSERT INTO dds_participants (dds_records_id, user_id, created_at)
      VALUES (${BigInt(dds_id)}, ${BigInt(user_id)}, NOW())
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Registra assinatura de participacao em DDS
   * Define signed_at para o timestamp atual
   */
  static async signDdsParticipation(dds_id: number, user_id: number) {
    const participant = await db.$queryRaw<DdsParticipantRow[]>`
      SELECT * FROM dds_participants
      WHERE dds_records_id = ${BigInt(dds_id)} AND user_id = ${BigInt(user_id)}
    `;

    if (!participant || participant.length === 0) {
      throw new NotFoundError('Participante nao encontrado neste DDS. Adicione-o primeiro.');
    }

    if (participant[0].signed_at !== null) {
      throw new BadRequestError('Este participante ja assinou sua presenca neste DDS.');
    }

    const result = await db.$queryRaw<DdsParticipantRow[]>`
      UPDATE dds_participants
      SET signed_at = NOW()
      WHERE dds_records_id = ${BigInt(dds_id)} AND user_id = ${BigInt(user_id)}
      RETURNING *
    `;

    return result[0];
  }

  /**
   * Retorna estatisticas de DDS de um projeto ou empresa
   */
  static async getDdsStatistics(input: GetDdsStatisticsInput) {
    const { projects_id, company_id } = input;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (projects_id) {
      conditions.push(`dr.projects_id = $${paramIndex++}`);
      values.push(BigInt(projects_id));
    }
    if (company_id) {
      conditions.push(`dr.company_id = $${paramIndex++}`);
      values.push(BigInt(company_id));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [totalDds, totalParticipations, signedParticipations, avgParticipants] = await Promise.all([
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_records dr ${whereClause}`,
        ...values
      ),
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_participants dp JOIN dds_records dr ON dp.dds_records_id = dr.id ${whereClause}`,
        ...values
      ),
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_participants dp JOIN dds_records dr ON dp.dds_records_id = dr.id ${whereClause} ${whereClause ? 'AND' : 'WHERE'} dp.signed_at IS NOT NULL`,
        ...values
      ),
      db.$queryRawUnsafe<{ avg: number | null }[]>(
        `SELECT AVG(participant_count)::float as avg
         FROM (
           SELECT COUNT(*) as participant_count
           FROM dds_participants dp
           JOIN dds_records dr ON dp.dds_records_id = dr.id
           ${whereClause}
           GROUP BY dp.dds_records_id
         ) subquery`,
        ...values
      ),
    ]);

    const total = Number(totalDds[0]?.count ?? 0);
    const participations = Number(totalParticipations[0]?.count ?? 0);
    const signed = Number(signedParticipations[0]?.count ?? 0);

    return {
      total_dds: total,
      total_participations: participations,
      signed_participations: signed,
      unsigned_participations: participations - signed,
      signature_rate: participations > 0
        ? Math.round((signed / participations) * 10000) / 100
        : 0,
      avg_participants_per_dds: Math.round((avgParticipants[0]?.avg ?? 0) * 100) / 100,
    };
  }
}

export default SafetyService;
