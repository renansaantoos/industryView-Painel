// =============================================================================
// INDUSTRYVIEW BACKEND - Schedule Import Service
// Servico de importacao de cronograma
// Suporta: .xlsx, .xls, .csv, .xml (MS Project)
//
// DEPENDENCIAS EXTERNAS (precisam ser instaladas):
//   npm install xlsx fast-xml-parser
//
// NOTA: As tabelas schedule_imports, import_source_id e is_milestone no
// projects_backlogs nao estao no Prisma Client gerado. Usamos $queryRaw /
// $executeRaw para essas tabelas e campos. O modelo projects_backlogs e
// acessado via ORM para criar registros (os campos extras sao passados via
// data object sem type checking rigoroso do Prisma Client gerado).
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError } from '../../utils/errors';

// =============================================================================
// TIPOS INTERNOS
// =============================================================================

interface ParsedTask {
  import_source_id: string | null;
  description: string;
  wbs_code: string | null;
  level: number;
  planned_start_date: string | null;
  planned_end_date: string | null;
  planned_duration_days: number | null;
  planned_cost: number | null;
  is_milestone: boolean;
  weight: number;
  predecessors: { source_id: string; type: string; lag: number }[];
}

// =============================================================================
// SERVICE
// =============================================================================

export class ScheduleImportService {

  // ===========================================================================
  // PROCESSAMENTO PRINCIPAL
  // ===========================================================================

  /**
   * Upload + processamento em etapa unica
   * Faz parse do arquivo, cria backlogs e dependencias, salva historico
   */
  static async processImport(
    projectsId: number,
    file: { buffer: Buffer; originalname: string },
    importMode: string,
    columnMapping?: Record<string, string>,
    createdBy?: number
  ) {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    let parsedTasks: ParsedTask[];

    if (ext === 'xml') {
      parsedTasks = await ScheduleImportService.parseXml(file.buffer);
    } else if (ext === 'xlsx' || ext === 'xls') {
      parsedTasks = await ScheduleImportService.parseXlsx(file.buffer, columnMapping);
    } else if (ext === 'csv') {
      parsedTasks = await ScheduleImportService.parseCsv(file.buffer, columnMapping);
    } else {
      throw new BadRequestError('Formato nao suportado. Use .xlsx, .xls, .xml ou .csv');
    }

    if (parsedTasks.length === 0) {
      throw new BadRequestError('Nenhuma tarefa encontrada no arquivo.');
    }

    // Ordena por WBS para manter hierarquia correta
    parsedTasks.sort((a, b) => (a.wbs_code || '').localeCompare(b.wbs_code || '', undefined, { numeric: true }));

    let importedCount = 0;
    let failedCount = 0;
    const errors: { row: number; error: string }[] = [];

    // Modo 'replace': soft-delete em backlogs e dependencias existentes
    if (importMode === 'replace') {
      await db.$executeRaw`
        UPDATE projects_backlogs
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE projects_id = ${BigInt(projectsId)} AND deleted_at IS NULL
      `;
      await db.$executeRaw`
        UPDATE task_dependencies
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE projects_id = ${BigInt(projectsId)} AND deleted_at IS NULL
      `;
    }

    // Mapas para rastrear IDs criados (para dependencias e hierarquia)
    const sourceIdToBacklogId = new Map<string, number>();
    const wbsToBacklogId = new Map<string, number>();

    // Criacao dos backlogs
    for (let i = 0; i < parsedTasks.length; i++) {
      const task = parsedTasks[i];
      try {
        // Determina pai pelo codigo WBS
        let parentId: number | null = null;
        if (task.wbs_code) {
          const parts = task.wbs_code.split('.');
          if (parts.length > 1) {
            const parentWbs = parts.slice(0, -1).join('.');
            parentId = wbsToBacklogId.get(parentWbs) ?? null;
          }
        }

        // Modo 'update': tenta encontrar backlog existente por import_source_id
        if (importMode === 'update' && task.import_source_id) {
          const existing = await db.$queryRaw<{ id: bigint }[]>`
            SELECT id FROM projects_backlogs
            WHERE projects_id = ${BigInt(projectsId)}
              AND import_source_id = ${task.import_source_id}
              AND deleted_at IS NULL
            LIMIT 1
          `;

          if (existing.length > 0) {
            const existingId = Number(existing[0].id);

            // Atualiza os campos de planejamento do backlog existente
            await db.$executeRawUnsafe(
              `UPDATE projects_backlogs SET
                description = $1,
                wbs_code = $2,
                level = $3,
                sort_order = $4,
                planned_start_date = $5,
                planned_end_date = $6,
                planned_duration_days = $7,
                planned_cost = $8,
                is_milestone = $9,
                weight = $10,
                projects_backlogs_id = $11,
                updated_at = NOW()
              WHERE id = $12`,
              task.description,
              task.wbs_code,
              task.level,
              i,
              task.planned_start_date ? new Date(task.planned_start_date) : null,
              task.planned_end_date ? new Date(task.planned_end_date) : null,
              task.planned_duration_days,
              task.planned_cost,
              task.is_milestone ?? false,
              task.weight ?? 1,
              parentId ? BigInt(parentId) : null,
              BigInt(existingId)
            );

            sourceIdToBacklogId.set(task.import_source_id, existingId);
            if (task.wbs_code) wbsToBacklogId.set(task.wbs_code, existingId);
            importedCount++;
            continue;
          }
        }

        // Cria novo backlog via raw SQL para incluir campos nao presentes no client gerado
        const startDate = task.planned_start_date ? new Date(task.planned_start_date) : null;
        const endDate = task.planned_end_date ? new Date(task.planned_end_date) : null;

        const insertResult = await db.$queryRawUnsafe<{ id: bigint }[]>(
          `INSERT INTO projects_backlogs
            (projects_id, description, wbs_code, level, sort_order,
             planned_start_date, planned_end_date, planned_duration_days,
             planned_cost, weight, import_source_id, is_milestone,
             projects_backlogs_id, projects_backlogs_statuses_id,
             created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 1, NOW(), NOW())
          RETURNING id`,
          BigInt(projectsId),
          task.description || 'Sem descricao',
          task.wbs_code || null,
          task.level,
          i,
          startDate,
          endDate,
          task.planned_duration_days ?? null,
          task.planned_cost ?? null,
          task.weight ?? 1,
          task.import_source_id || null,
          task.is_milestone ?? false,
          parentId ? BigInt(parentId) : null
        );

        const createdId = Number(insertResult[0].id);
        if (task.import_source_id) sourceIdToBacklogId.set(task.import_source_id, createdId);
        if (task.wbs_code) wbsToBacklogId.set(task.wbs_code, createdId);
        importedCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({ row: i + 1, error: err.message || 'Erro desconhecido' });
      }
    }

    // Criacao de dependencias
    let depsCreated = 0;
    for (const task of parsedTasks) {
      if (!task.predecessors || task.predecessors.length === 0) continue;

      const successorId = task.import_source_id
        ? sourceIdToBacklogId.get(task.import_source_id)
        : task.wbs_code
        ? wbsToBacklogId.get(task.wbs_code)
        : null;

      if (!successorId) continue;

      for (const pred of task.predecessors) {
        const predecessorId =
          sourceIdToBacklogId.get(pred.source_id) ?? wbsToBacklogId.get(pred.source_id);

        if (!predecessorId) continue;
        if (predecessorId === successorId) continue;

        try {
          // Verifica ciclos antes de criar dependencia
          const hasCycle = await ScheduleImportService.hasCircularDependency(
            projectsId,
            predecessorId,
            successorId
          );
          if (hasCycle) continue;

          await db.$executeRaw`
            INSERT INTO task_dependencies
              (projects_id, predecessor_backlog_id, successor_backlog_id, dependency_type, lag_days, created_at, updated_at)
            VALUES
              (${BigInt(projectsId)}, ${BigInt(predecessorId)}, ${BigInt(successorId)}, ${pred.type || 'FS'}, ${pred.lag || 0}, NOW(), NOW())
            ON CONFLICT (predecessor_backlog_id, successor_backlog_id) DO NOTHING
          `;
          depsCreated++;
        } catch {
          // Ignora dependencias com erro
        }
      }
    }

    // Salva registro de historico da importacao
    const now = new Date();
    await db.$executeRaw`
      INSERT INTO schedule_imports
        (projects_id, file_name, file_type, total_tasks, imported_tasks, failed_tasks,
         import_mode, status, error_log, column_mapping, created_by, created_at, updated_at)
      VALUES
        (${BigInt(projectsId)}, ${file.originalname}, ${ext},
         ${parsedTasks.length}, ${importedCount}, ${failedCount},
         ${importMode}, 'concluido',
         ${JSON.stringify(errors)}::jsonb,
         ${JSON.stringify(columnMapping || {})}::jsonb,
         ${createdBy ? BigInt(createdBy) : null},
         ${now}, ${now})
    `;

    return {
      total_tasks: parsedTasks.length,
      imported_tasks: importedCount,
      failed_tasks: failedCount,
      dependencies_created: depsCreated,
      errors: errors.slice(0, 20),
    };
  }

  // ===========================================================================
  // HISTORICO
  // ===========================================================================

  /**
   * Retorna historico de importacoes de um projeto
   */
  static async getHistory(projectsId: number) {
    const rows = await db.$queryRaw<any[]>`
      SELECT
        si.id,
        si.projects_id,
        si.file_name,
        si.file_type,
        si.total_tasks,
        si.imported_tasks,
        si.failed_tasks,
        si.import_mode,
        si.status,
        si.error_log,
        si.column_mapping,
        si.created_by,
        si.created_at,
        si.updated_at,
        u.name AS created_by_name
      FROM schedule_imports si
      LEFT JOIN users u ON u.id = si.created_by
      WHERE si.projects_id = ${BigInt(projectsId)}
      ORDER BY si.created_at DESC
      LIMIT 50
    `;

    return rows.map((r) => ({
      ...r,
      id: Number(r.id),
      projects_id: Number(r.projects_id),
      created_by: r.created_by ? Number(r.created_by) : null,
    }));
  }

  // ===========================================================================
  // TEMPLATE
  // ===========================================================================

  /**
   * Gera template de importacao (xlsx ou csv)
   */
  static async generateTemplate(format: 'xlsx' | 'csv'): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const XLSX = require('xlsx') as any;

    const headers = [
      'WBS',
      'Descricao',
      'Nivel',
      'Data Inicio',
      'Data Fim',
      'Duracao (dias)',
      'Predecessores',
      'Custo Planejado',
      'Peso',
      'Marco',
    ];

    const sampleData = [
      ['1', 'Fase 1 - Fundacoes', '0', '2025-03-01', '2025-06-30', '120', '', '100000', '30', 'Nao'],
      ['1.1', 'Escavacao', '1', '2025-03-01', '2025-04-15', '45', '', '30000', '10', 'Nao'],
      ['1.2', 'Concretagem', '1', '2025-04-16', '2025-06-30', '75', '2FS', '70000', '20', 'Nao'],
      ['2', 'Fase 2 - Estrutura', '0', '2025-07-01', '2025-12-31', '180', '3FS', '200000', '40', 'Nao'],
      ['M1', 'Marco: Fundacoes Concluidas', '0', '2025-06-30', '2025-06-30', '0', '3FS', '0', '0', 'Sim'],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');

    if (format === 'csv') {
      return Buffer.from(XLSX.utils.sheet_to_csv(ws), 'utf-8');
    }
    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  // ===========================================================================
  // PARSERS
  // ===========================================================================

  /**
   * Parse de arquivo XLSX/XLS
   */
  static async parseXlsx(
    buffer: Buffer,
    columnMapping?: Record<string, string>
  ): Promise<ParsedTask[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const XLSX = require('xlsx') as any;
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (rows.length === 0) return [];

    const mapping = columnMapping || ScheduleImportService.autoMapHeaders(Object.keys(rows[0]));
    return rows.map((row, idx) => ScheduleImportService.mapRowToTask(row, mapping, idx));
  }

  /**
   * Parse de arquivo CSV (usa XLSX internamente)
   */
  static async parseCsv(
    buffer: Buffer,
    columnMapping?: Record<string, string>
  ): Promise<ParsedTask[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const XLSX = require('xlsx') as any;
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (rows.length === 0) return [];

    const mapping = columnMapping || ScheduleImportService.autoMapHeaders(Object.keys(rows[0]));
    return rows.map((row, idx) => ScheduleImportService.mapRowToTask(row, mapping, idx));
  }

  /**
   * Parse de arquivo XML do MS Project
   */
  static async parseXml(buffer: Buffer): Promise<ParsedTask[]> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const { XMLParser } = require('fast-xml-parser') as any;

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const xml = parser.parse(buffer.toString('utf-8'));

    const project = xml.Project || xml.project;
    if (!project) {
      throw new BadRequestError('Arquivo XML nao e um MS Project valido. A tag <Project> nao foi encontrada.');
    }

    const tasksObj = project.Tasks || project.tasks;
    if (!tasksObj) return [];

    const rawTasks = tasksObj.Task || tasksObj.task;
    if (!rawTasks) return [];
    const tasks = Array.isArray(rawTasks) ? rawTasks : [rawTasks];

    const parsedTasks: ParsedTask[] = [];

    for (const t of tasks) {
      if (!t) continue;

      const uid = String(t.UID ?? t.uid ?? '');
      const name = String(t.Name ?? t.name ?? '');
      const wbs = String(t.WBS ?? t.wbs ?? '');
      const outlineLevel = parseInt(String(t.OutlineLevel ?? t.outlineLevel ?? '0'), 10);
      const isMilestone =
        String(t.Milestone ?? t.milestone ?? '0') === '1' ||
        t.Milestone === true ||
        t.milestone === true;

      // Parse de duracao: formato ISO 8601 PT8H0M0S -> dias
      let durationDays: number | null = null;
      const durationStr = String(t.Duration ?? t.duration ?? '');
      if (durationStr) {
        const hoursMatch = durationStr.match(/PT(\d+)H/);
        if (hoursMatch) {
          durationDays = Math.ceil(parseInt(hoursMatch[1], 10) / 8);
        }
      }

      const startDate = t.Start ?? t.start ?? null;
      const finishDate = t.Finish ?? t.finish ?? null;

      // Parse de predecessores
      const predecessors: { source_id: string; type: string; lag: number }[] = [];
      const predLinks = t.PredecessorLink ?? t.predecessorLink;
      if (predLinks) {
        const links = Array.isArray(predLinks) ? predLinks : [predLinks];
        for (const link of links) {
          const predUid = String(link.PredecessorUID ?? link.predecessorUID ?? '');
          const typeCode = parseInt(String(link.Type ?? link.type ?? '1'), 10);
          // MS Project type codes: 0=FF, 1=FS, 2=SF, 3=SS
          const typeMap: Record<number, string> = { 0: 'FF', 1: 'FS', 2: 'SF', 3: 'SS' };
          // LagLag e em decimos de minuto; 1 dia = 480 minutos = 4800 decimos
          const lagRaw = parseInt(String(link.LinkLag ?? link.linkLag ?? '0'), 10);
          const lagDays = Math.round(lagRaw / 4800);

          if (predUid && predUid !== '0') {
            predecessors.push({
              source_id: predUid,
              type: typeMap[typeCode] ?? 'FS',
              lag: lagDays,
            });
          }
        }
      }

      // Ignora tarefa resumo do projeto (UID=0, outlineLevel=0)
      if (uid === '0' && outlineLevel === 0) continue;

      parsedTasks.push({
        import_source_id: uid || null,
        description: name || 'Sem descricao',
        wbs_code: wbs || null,
        level: outlineLevel,
        planned_start_date: startDate ? ScheduleImportService.parseDate(startDate) : null,
        planned_end_date: finishDate ? ScheduleImportService.parseDate(finishDate) : null,
        planned_duration_days: durationDays,
        planned_cost: null,
        is_milestone: isMilestone,
        weight: 1,
        predecessors,
      });
    }

    return parsedTasks;
  }

  // ===========================================================================
  // AUXILIARES
  // ===========================================================================

  /**
   * Auto-mapeamento de cabecalhos para campos do sistema
   */
  static autoMapHeaders(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    for (const h of headers) {
      const lower = h.toLowerCase().trim();

      if (lower === 'wbs' || lower === 'eap') {
        mapping[h] = 'wbs_code';
      } else if (
        lower.includes('descri') ||
        lower.includes('name') ||
        lower.includes('nome') ||
        lower === 'atividade' ||
        lower === 'tarefa' ||
        lower === 'task'
      ) {
        mapping[h] = 'description';
      } else if (
        lower.includes('inicio') ||
        lower.includes('start') ||
        lower === 'data_inicio' ||
        lower === 'data inicio'
      ) {
        mapping[h] = 'planned_start_date';
      } else if (
        lower.includes('fim') ||
        lower.includes('termino') ||
        lower.includes('finish') ||
        lower.includes('end') ||
        lower === 'data_fim' ||
        lower === 'data fim'
      ) {
        mapping[h] = 'planned_end_date';
      } else if (lower.includes('dura') || lower === 'duration') {
        mapping[h] = 'planned_duration_days';
      } else if (lower.includes('predec') || lower.includes('predecessor')) {
        mapping[h] = 'predecessors';
      } else if (lower.includes('custo') || lower.includes('cost') || lower.includes('valor')) {
        mapping[h] = 'planned_cost';
      } else if (lower.includes('peso') || lower.includes('weight')) {
        mapping[h] = 'weight';
      } else if (lower.includes('marco') || lower.includes('milestone')) {
        mapping[h] = 'is_milestone';
      } else if (lower.includes('nivel') || lower.includes('level')) {
        mapping[h] = 'level';
      } else if (
        lower.includes('id') &&
        (lower.includes('ext') || lower.includes('uid') || lower.includes('source'))
      ) {
        mapping[h] = 'import_source_id';
      }
    }

    return mapping;
  }

  /**
   * Mapeia linha da planilha para ParsedTask usando o mapeamento de colunas
   */
  static mapRowToTask(
    row: Record<string, any>,
    mapping: Record<string, string>,
    index: number
  ): ParsedTask {
    const get = (field: string): any => {
      for (const [header, mappedField] of Object.entries(mapping)) {
        if (mappedField === field) return row[header];
      }
      return null;
    };

    // Parse de predecessores: "3FS+2;5SS" ou "3;5" ou "3FS-1,5SS"
    const predsRaw = get('predecessors');
    const predecessors: { source_id: string; type: string; lag: number }[] = [];
    if (predsRaw) {
      const parts = String(predsRaw).split(/[;,]/);
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const match = trimmed.match(/^(\d+)\s*(FS|FF|SS|SF)?\s*([+-]\d+)?$/i);
        if (match) {
          predecessors.push({
            source_id: match[1],
            type: (match[2] ?? 'FS').toUpperCase(),
            lag: match[3] ? parseInt(match[3], 10) : 0,
          });
        } else {
          const numMatch = trimmed.match(/^(\d+)/);
          if (numMatch) {
            predecessors.push({ source_id: numMatch[1], type: 'FS', lag: 0 });
          }
        }
      }
    }

    // Duracao em dias
    const durationRaw = get('planned_duration_days');
    let durationDays: number | null = null;
    if (durationRaw !== null && durationRaw !== undefined && durationRaw !== '') {
      const parsed = parseInt(String(durationRaw), 10);
      if (!isNaN(parsed)) durationDays = parsed;
    }

    // Custo planejado
    const costRaw = get('planned_cost');
    let cost: number | null = null;
    if (costRaw !== null && costRaw !== undefined && costRaw !== '') {
      const parsed = parseFloat(String(costRaw).replace(/[^\d.-]/g, ''));
      if (!isNaN(parsed)) cost = parsed;
    }

    // Peso
    const weightRaw = get('weight');
    let weight = 1;
    if (weightRaw !== null && weightRaw !== undefined && weightRaw !== '') {
      const parsed = parseFloat(String(weightRaw));
      if (!isNaN(parsed)) weight = parsed;
    }

    // Nivel hierarquico
    const levelRaw = get('level');
    let level = 0;
    if (levelRaw !== null && levelRaw !== undefined && levelRaw !== '') {
      const parsed = parseInt(String(levelRaw), 10);
      if (!isNaN(parsed)) level = parsed;
    } else {
      // Infere nivel pelo codigo WBS
      const wbs = get('wbs_code');
      if (wbs) {
        level = String(wbs).split('.').length - 1;
      }
    }

    // Indicador de marco
    const milestoneRaw = get('is_milestone');
    const isMilestone =
      milestoneRaw === true ||
      milestoneRaw === 'true' ||
      String(milestoneRaw).toLowerCase() === 'sim' ||
      milestoneRaw === '1' ||
      String(milestoneRaw).toLowerCase() === 'yes';

    return {
      import_source_id: get('import_source_id')
        ? String(get('import_source_id'))
        : String(index + 1),
      description: get('description') || `Tarefa ${index + 1}`,
      wbs_code: get('wbs_code') ? String(get('wbs_code')) : null,
      level,
      planned_start_date: ScheduleImportService.parseDate(get('planned_start_date')),
      planned_end_date: ScheduleImportService.parseDate(get('planned_end_date')),
      planned_duration_days: durationDays,
      planned_cost: cost,
      is_milestone: isMilestone,
      weight,
      predecessors,
    };
  }

  /**
   * Parse de data - suporta varios formatos (ISO, DD/MM/YYYY, etc.)
   */
  static parseDate(value: any): string | null {
    if (!value) return null;

    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return value.toISOString().split('T')[0];
    }

    const str = String(value).trim();
    if (!str) return null;

    // Formato ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.split('T')[0];
    }

    // Formato BR: DD/MM/YYYY
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      return `${brMatch[3]}-${brMatch[2].padStart(2, '0')}-${brMatch[1].padStart(2, '0')}`;
    }

    // Tenta parse generico
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

    return null;
  }

  /**
   * Verifica se a criacao de dependencia geraria um ciclo (BFS)
   * Retorna true se existir ciclo, false caso contrario
   */
  static async hasCircularDependency(
    projectsId: number,
    predecessorId: number,
    successorId: number
  ): Promise<boolean> {
    // Se predecessor == successor, e um ciclo direto
    if (predecessorId === successorId) return true;

    // BFS: verifica se successorId e alcancavel a partir de predecessorId via sucessores
    const visited = new Set<number>();
    const queue = [successorId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === predecessorId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const successors = await db.$queryRaw<{ successor_backlog_id: bigint }[]>`
        SELECT successor_backlog_id
        FROM task_dependencies
        WHERE projects_id = ${BigInt(projectsId)}
          AND predecessor_backlog_id = ${BigInt(current)}
          AND deleted_at IS NULL
      `;

      for (const s of successors) {
        const sid = Number(s.successor_backlog_id);
        if (!visited.has(sid)) queue.push(sid);
      }
    }

    return false;
  }
}
