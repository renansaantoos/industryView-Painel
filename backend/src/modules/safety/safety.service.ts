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
  projects_id: bigint;
  incident_number: string;
  incident_date: Date;
  incident_time: Date | null;
  severity: string;
  classification: string;
  category: string;
  description: string;
  immediate_cause: string | null;
  root_cause: string | null;
  corrective_actions: string | null;
  location_description: string | null;
  body_part_affected: string | null;
  days_lost: number;
  cat_number: string | null;
  cat_issued_at: Date | null;
  status: string;
  reported_by_user_id: bigint;
  investigated_by_user_id: bigint | null;
  closed_by_user_id: bigint | null;
  involved_user_id: bigint | null;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface TrainingTypeRow {
  id: bigint;
  company_id: bigint | null;
  name: string;
  description: string | null;
  nr_reference: string | null;
  validity_months: number | null;
  is_mandatory_for_admission: boolean;
  workload_hours: number | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface WorkerTrainingRow {
  id: bigint;
  users_id: bigint;
  training_types_id: bigint;
  training_date: Date;
  expiry_date: Date;
  instructor_name: string | null;
  institution: string | null;
  certificate_number: string | null;
  certificate_file: string | null;
  workload_hours: number;
  status: string;
  projects_id: bigint | null;
  registered_by_user_id: bigint;
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
  conducted_by_user_id: bigint;
  dds_date: Date;
  topic: string;
  description: string | null;
  teams_id: bigint | null;
  participant_count: number;
  duration_minutes: number | null;
  evidence_image: string | null;
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
    const { projects_id, severity, status, initial_date, final_date, page, per_page } = input;
    const involved_user_id = (input as any).involved_user_id as number | undefined;
    const witness_user_id = (input as any).witness_user_id as number | undefined;
    const skip = (page - 1) * per_page;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (projects_id) {
      conditions.push(`projects_id = $${paramIndex++}`);
      values.push(BigInt(projects_id));
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
    if (involved_user_id) {
      conditions.push(`involved_user_id = $${paramIndex++}`);
      values.push(BigInt(involved_user_id));
    }
    if (witness_user_id) {
      conditions.push(`id IN (SELECT safety_incidents_id FROM safety_incident_witnesses WHERE users_id = $${paramIndex++})`);
      values.push(BigInt(witness_user_id));
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
        reported_by_user_id,
        incident_date,
        description,
        severity,
        classification,
        category,
        location_description,
        body_part_affected,
        days_lost,
        immediate_cause,
        involved_user_id,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${incidentNumber},
        ${BigInt(input.projects_id)},
        ${BigInt(input.reported_by)},
        ${new Date(input.incident_date)},
        ${input.description},
        ${input.severity}::incident_severity,
        ${input.classification}::incident_classification,
        ${input.category},
        ${input.location_description ?? null},
        ${input.body_part_affected ?? null},
        ${input.days_lost ?? 0},
        ${input.immediate_cause ?? null},
        ${input.involved_user_id ? BigInt(input.involved_user_id) : null},
        'registrado'::incident_status,
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
    if (input.location_description !== undefined) {
      setClauses.push(`location_description = $${paramIndex++}`);
      values.push(input.location_description);
    }
    if (input.severity !== undefined) {
      setClauses.push(`severity = $${paramIndex++}::incident_severity`);
      values.push(input.severity);
    }
    if (input.classification !== undefined) {
      setClauses.push(`classification = $${paramIndex++}::incident_classification`);
      values.push(input.classification);
    }
    if (input.category !== undefined) {
      setClauses.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.body_part_affected !== undefined) {
      setClauses.push(`body_part_affected = $${paramIndex++}`);
      values.push(input.body_part_affected);
    }
    if (input.days_lost !== undefined) {
      setClauses.push(`days_lost = $${paramIndex++}`);
      values.push(input.days_lost);
    }
    if (input.immediate_cause !== undefined) {
      setClauses.push(`immediate_cause = $${paramIndex++}`);
      values.push(input.immediate_cause);
    }
    if (input.involved_user_id !== undefined) {
      setClauses.push(`involved_user_id = $${paramIndex++}`);
      values.push(input.involved_user_id ? BigInt(input.involved_user_id) : null);
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
        status = 'em_investigacao'::incident_status,
        investigated_by_user_id = ${BigInt(input.investigated_by)},
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
        status = 'encerrado'::incident_status,
        root_cause = ${input.root_cause},
        corrective_actions = ${input.corrective_actions},
        closed_by_user_id = ${BigInt(input.closed_by)},
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
        `SELECT COALESCE(SUM(days_lost), 0)::bigint as total FROM safety_incidents ${whereClause}`,
        ...values
      ),
    ]);

    // Organiza contagens por severidade (DB enum values)
    const severityCounts = {
      quase_acidente: 0,
      primeiros_socorros: 0,
      sem_afastamento: 0,
      com_afastamento: 0,
      fatal: 0,
    };

    for (const row of bySeverity) {
      const key = row.severity as keyof typeof severityCounts;
      if (key in severityCounts) {
        severityCounts[key] = Number(row.count);
      }
    }

    // Organiza contagens por status (DB enum values)
    const statusCounts = {
      registrado: 0,
      em_investigacao: 0,
      investigado: 0,
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
      bird_pyramid: {
        fatal: severityCounts.fatal,
        com_afastamento: severityCounts.com_afastamento,
        sem_afastamento: severityCounts.sem_afastamento,
        primeiros_socorros: severityCounts.primeiros_socorros,
        quase_acidente: severityCounts.quase_acidente,
        ratio_description: 'Para cada acidente fatal, esperam-se ~10 com afastamento, ~30 sem afastamento e ~600 primeiros socorros (Heinrich/Bird)',
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
        users_id,
        witness_name,
        witness_statement,
        witness_role,
        created_at
      ) VALUES (
        ${BigInt(incident_id)},
        ${input.users_id ? BigInt(input.users_id) : null},
        ${input.witness_name},
        ${input.witness_statement ?? null},
        ${input.witness_role ?? null},
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
        file_type,
        description,
        uploaded_by_user_id,
        created_at
      ) VALUES (
        ${BigInt(incident_id)},
        ${input.file_url},
        ${input.file_type ?? null},
        ${input.description ?? null},
        ${BigInt(input.uploaded_by_user_id)},
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
    const where: Record<string, unknown> = {};

    if (input.company_id) {
      where.company_id = BigInt(input.company_id);
    }
    if (input.active_only) {
      where.deleted_at = null;
    }

    return db.training_types.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Busca tipo de treinamento por ID
   */
  static async getTrainingTypeById(id: number) {
    const result = await db.training_types.findUnique({
      where: { id: BigInt(id) },
    });

    if (!result) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    return result;
  }

  /**
   * Cria tipo de treinamento
   */
  static async createTrainingType(input: CreateTrainingTypeInput) {
    if (!input.company_id) {
      throw new BadRequestError('company_id e obrigatorio.');
    }

    const companyId = BigInt(input.company_id);

    // Verifica duplicidade de nome dentro da mesma empresa
    const existing = await db.training_types.findFirst({
      where: {
        company_id: companyId,
        name: { equals: input.name, mode: 'insensitive' },
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestError(`Ja existe um tipo de treinamento com o nome "${input.name}" para esta empresa.`);
    }

    const result = await db.training_types.create({
      data: {
        company_id: companyId,
        name: input.name,
        description: input.description ?? null,
        nr_reference: input.nr_reference ?? null,
        validity_months: input.validity_months ?? null,
        is_mandatory_for_admission: input.is_mandatory_for_admission ?? false,
        workload_hours: input.workload_hours != null ? Math.round(input.workload_hours) : null,
      },
    });

    return result;
  }

  /**
   * Atualiza tipo de treinamento
   */
  static async updateTrainingType(id: number, input: UpdateTrainingTypeInput) {
    const existing = await db.training_types.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.nr_reference !== undefined) data.nr_reference = input.nr_reference;
    if (input.validity_months !== undefined) data.validity_months = input.validity_months;
    if (input.is_mandatory_for_admission !== undefined) data.is_mandatory_for_admission = input.is_mandatory_for_admission;
    if (input.workload_hours !== undefined) data.workload_hours = input.workload_hours != null ? Math.round(input.workload_hours) : null;

    const result = await db.training_types.update({
      where: { id: BigInt(id) },
      data,
    });

    return result;
  }

  /**
   * Remove tipo de treinamento
   * Impede remocao se houver treinamentos ou associacoes de tarefas vinculadas
   */
  static async deleteTrainingType(id: number) {
    const bigId = BigInt(id);

    const existing = await db.training_types.findFirst({
      where: { id: bigId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    // Verifica se existe algum worker_training usando este tipo
    const inUseCount = await db.worker_trainings.count({
      where: { training_types_id: bigId },
    });

    if (inUseCount > 0) {
      throw new BadRequestError(
        'Nao e possivel excluir este tipo de treinamento pois ha registros de trabalhadores vinculados. Desative-o ao inves de excluir.'
      );
    }

    // Verifica se existe alguma task_required_training usando este tipo
    const requiredCount = await db.task_required_trainings.count({
      where: { training_types_id: bigId },
    });

    if (requiredCount > 0) {
      throw new BadRequestError(
        'Nao e possivel excluir este tipo de treinamento pois ha tarefas que o exigem. Desative-o ao inves de excluir.'
      );
    }

    // Soft delete
    await db.training_types.update({
      where: { id: bigId },
      data: { deleted_at: new Date() },
    });

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
    const { users_id, training_types_id, company_id, status, page, per_page } = input;
    const skip = (page - 1) * per_page;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (users_id) {
      conditions.push(`wt.users_id = $${paramIndex++}`);
      values.push(BigInt(users_id));
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const selectQuery = `
      SELECT wt.*, tt.name as training_name, tt.validity_months, tt.nr_reference,
             u.name as user_name,
             CASE
               WHEN wt.expiry_date < NOW() THEN 'expirado'
               WHEN wt.expiry_date <= NOW() + INTERVAL '30 days' THEN 'expirando'
               ELSE 'valido'
             END as computed_status
      FROM worker_trainings wt
      JOIN training_types tt ON wt.training_types_id = tt.id
      JOIN users u ON wt.users_id = u.id
      ${whereClause}
      ORDER BY wt.expiry_date ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const countQuery = `
      SELECT COUNT(*)::bigint as count
      FROM worker_trainings wt
      JOIN training_types tt ON wt.training_types_id = tt.id
      JOIN users u ON wt.users_id = u.id
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
  static async createWorkerTraining(input: CreateWorkerTrainingInput, registeredByUserId: number) {
    // Busca tipo de treinamento para calcular validade e carga horaria
    const trainingType = await db.training_types.findUnique({
      where: { id: BigInt(input.training_types_id) },
    });

    if (!trainingType) {
      throw new NotFoundError('Tipo de treinamento nao encontrado.');
    }

    const trainingDate = new Date(input.training_date);
    const validityMonths = trainingType.validity_months ?? 12;

    // Calcula data de expiracao: training_date + validity_months
    const expiryDate = new Date(trainingDate);
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

    // Carga horaria: usa a do input ou herda do tipo de treinamento
    const workloadHours = input.workload_hours ?? trainingType.workload_hours ?? 0;

    const result = await db.worker_trainings.create({
      data: {
        users_id: BigInt(input.users_id),
        training_types_id: BigInt(input.training_types_id),
        training_date: trainingDate,
        expiry_date: expiryDate,
        instructor_name: input.instructor || 'N/A',
        institution: input.institution ?? null,
        certificate_number: input.certificate_number ?? null,
        certificate_file: input.certificate_url ?? null,
        workload_hours: workloadHours,
        registered_by_user_id: BigInt(registeredByUserId),
      },
      include: {
        training_type: true,
      },
    });

    return result;
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
        JOIN users u ON wt.users_id = u.id
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
      JOIN users u ON wt.users_id = u.id
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
        JOIN users u ON wt.users_id = u.id
        WHERE wt.expiry_date < ${today}
          AND u.company_id = ${BigInt(company_id)}
        ORDER BY wt.expiry_date DESC
      `;
    }

    return db.$queryRaw<(WorkerTrainingRow & { training_name: string; user_name: string })[]>`
      SELECT wt.*, tt.name as training_name, u.name as user_name
      FROM worker_trainings wt
      JOIN training_types tt ON wt.training_types_id = tt.id
      JOIN users u ON wt.users_id = u.id
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
      WHERE wt.users_id = ${BigInt(user_id)}
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
      `SELECT trt.*, tt.name as training_name, tt.validity_months, tt.is_mandatory_for_admission, tt.nr_reference
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
    const participant_user_id = (input as any).participant_user_id as number | undefined;
    const skip = (page - 1) * per_page;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Quando company_id e informado, precisa de JOIN com projects pois dds_records nao tem company_id
    const needsProjectJoin = !!company_id;

    if (projects_id) {
      conditions.push(`dr.projects_id = $${paramIndex++}`);
      values.push(BigInt(projects_id));
    }
    if (company_id) {
      // Filtra via projeto vinculado ao DDS
      conditions.push(`p.company_id = $${paramIndex++}`);
      values.push(BigInt(company_id));
    }
    if (initial_date) {
      conditions.push(`dr.dds_date >= $${paramIndex++}`);
      values.push(new Date(initial_date));
    }
    if (final_date) {
      conditions.push(`dr.dds_date <= $${paramIndex++}`);
      values.push(new Date(final_date));
    }
    if (participant_user_id) {
      conditions.push(`dr.id IN (SELECT dds_records_id FROM dds_participants WHERE user_id = $${paramIndex++})`);
      values.push(BigInt(participant_user_id));
    }

    const joinClause = needsProjectJoin
      ? `LEFT JOIN projects p ON p.id = dr.projects_id`
      : '';
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [items, totalResult] = await Promise.all([
      db.$queryRawUnsafe<(DdsRecordRow & { participant_count: bigint })[]>(
        `SELECT dr.*,
                (SELECT COUNT(*)::bigint FROM dds_participants dp WHERE dp.dds_records_id = dr.id) as participant_count
         FROM dds_records dr
         ${joinClause}
         ${whereClause}
         ORDER BY dr.dds_date DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        ...values,
        per_page,
        skip
      ),
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_records dr ${joinClause} ${whereClause}`,
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
    // Suporta nomes legados do frontend: conducted_by -> conducted_by_user_id, content -> description
    const conductedByUserId = (input as any).conducted_by_user_id ?? (input as any).conducted_by;
    const descriptionValue = (input as any).description ?? (input as any).content ?? null;
    const teamsId = (input as any).teams_id ?? null;

    if (!conductedByUserId) {
      throw new BadRequestError('ID do responsavel pelo DDS e obrigatorio.');
    }

    const record = await db.$queryRaw<DdsRecordRow[]>`
      INSERT INTO dds_records (
        projects_id,
        conducted_by_user_id,
        dds_date,
        topic,
        duration_minutes,
        description,
        teams_id,
        created_at,
        updated_at
      ) VALUES (
        ${input.projects_id ? BigInt(input.projects_id) : null},
        ${BigInt(conductedByUserId)},
        ${new Date(input.dds_date)},
        ${input.topic},
        ${(input as any).duration_minutes ?? 15},
        ${descriptionValue},
        ${teamsId ? BigInt(teamsId) : null},
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

    // dds_records nao tem company_id; quando filtrar por empresa, usa JOIN com projects
    const needsProjectJoin = !!company_id;

    if (projects_id) {
      conditions.push(`dr.projects_id = $${paramIndex++}`);
      values.push(BigInt(projects_id));
    }
    if (company_id) {
      conditions.push(`p.company_id = $${paramIndex++}`);
      values.push(BigInt(company_id));
    }

    const joinClause = needsProjectJoin
      ? `LEFT JOIN projects p ON p.id = dr.projects_id`
      : '';
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [totalDds, totalParticipations, signedParticipations, avgParticipants] = await Promise.all([
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_records dr ${joinClause} ${whereClause}`,
        ...values
      ),
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_participants dp JOIN dds_records dr ON dp.dds_records_id = dr.id ${joinClause} ${whereClause}`,
        ...values
      ),
      db.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*)::bigint as count FROM dds_participants dp JOIN dds_records dr ON dp.dds_records_id = dr.id ${joinClause} ${whereClause} ${whereClause ? 'AND' : 'WHERE'} dp.signed_at IS NOT NULL`,
        ...values
      ),
      db.$queryRawUnsafe<{ avg: number | null }[]>(
        `SELECT AVG(participant_count)::float as avg
         FROM (
           SELECT COUNT(*) as participant_count
           FROM dds_participants dp
           JOIN dds_records dr ON dp.dds_records_id = dr.id
           ${joinClause}
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
