// @ts-nocheck
/**
 * Seed script para popular o Cronograma do projeto 14 ("Teste Apos Regenerar")
 * Cenário: Usina Solar Fotovoltaica - WBS hierárquico com ~30% de progresso
 * Usa $queryRaw para contornar bug do Prisma Client com triggers
 */

import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const PROJECT_ID = 14;
const TEAM_ID = 4;
const USER_ID = 3;

async function insertBacklog(data: any): Promise<number> {
  const result = await db.$queryRaw`
    INSERT INTO projects_backlogs (
      projects_id, projects_backlogs_id, description, wbs_code, level, sort_order,
      weight, quantity, quantity_done, planned_start_date, planned_end_date,
      planned_duration_days, planned_cost, actual_cost, percent_complete,
      actual_start_date, actual_end_date, projects_backlogs_statuses_id,
      discipline_id, unity_id, is_milestone, is_inspection, sprint_added
    ) VALUES (
      ${data.projects_id}, ${data.parent_id || null}, ${data.description}, ${data.wbs_code},
      ${data.level}, ${data.sort_order}, ${data.weight}, ${data.quantity || 1},
      ${data.quantity_done || null},
      ${data.planned_start}::date, ${data.planned_end}::date,
      ${data.duration}, ${data.planned_cost || null}, ${data.actual_cost || null},
      ${data.percent || 0},
      ${data.actual_start || null}::date, ${data.actual_end || null}::date,
      ${data.status_id || 1}, ${data.discipline_id || null}, ${data.unity_id || null},
      ${data.is_milestone || false}, ${data.is_inspection || false}, ${data.sprint_added || false}
    ) RETURNING id
  `;
  return Number(result[0].id);
}

async function insertSubtask(data: any): Promise<number> {
  const result = await db.$queryRaw`
    INSERT INTO subtasks (
      projects_backlogs_id, description, weight, quantity, quantity_done,
      subtasks_statuses_id, sprint_added, unity_id
    ) VALUES (
      ${data.backlog_id}, ${data.description}, ${data.weight}, ${data.quantity},
      ${data.quantity_done || null}, ${data.status_id || 1}, ${data.sprint_added || false},
      ${data.unity_id || null}
    ) RETURNING id
  `;
  return Number(result[0].id);
}

async function insertSprint(data: any): Promise<number> {
  const result = await db.$queryRaw`
    INSERT INTO sprints (
      title, objective, start_date, end_date, progress_percentage,
      projects_id, sprints_statuses_id
    ) VALUES (
      ${data.title}, ${data.objective},
      ${data.start_date}::timestamptz, ${data.end_date}::timestamptz,
      ${data.progress}, ${data.projects_id}, ${data.status_id}
    ) RETURNING id
  `;
  return Number(result[0].id);
}

async function insertSprintTask(data: any): Promise<number> {
  const result = await db.$queryRaw`
    INSERT INTO sprints_tasks (
      projects_backlogs_id, subtasks_id, sprints_id, teams_id,
      sprints_tasks_statuses_id, scheduled_for, executed_at,
      assigned_user_id, actual_start_time, actual_end_time
    ) VALUES (
      ${data.backlog_id}, ${data.subtask_id || null}, ${data.sprint_id}, ${data.team_id},
      ${data.status_id}, ${data.scheduled_for}::date, ${data.executed_at || null}::date,
      ${data.user_id}, ${data.actual_start || null}::timestamptz, ${data.actual_end || null}::timestamptz
    ) RETURNING id
  `;
  return Number(result[0].id);
}

async function insertDependency(data: any): Promise<void> {
  await db.$executeRaw`
    INSERT INTO task_dependencies (
      projects_id, predecessor_backlog_id, successor_backlog_id, dependency_type, lag_days
    ) VALUES (
      ${data.project_id}, ${data.pred_id}, ${data.succ_id}, ${data.type}, ${data.lag}
    )
  `;
}

async function main() {
  console.log('=== Seeding Cronograma para Projeto 14 ===\n');

  // Desabilitar triggers se existirem (podem não existir em banco novo)
  console.log('0. Desabilitando triggers temporariamente...');
  try { await db.$executeRaw`ALTER TABLE projects_backlogs DISABLE TRIGGER trg_projects_backlogs_normalize`; } catch { console.log('   trigger trg_projects_backlogs_normalize não existe, pulando...'); }
  try { await db.$executeRaw`ALTER TABLE subtasks DISABLE TRIGGER ALL`; } catch { console.log('   triggers de subtasks não existem, pulando...'); }

  // =========================================================================
  // 0.5. DISCIPLINAS E UNIDADES necessárias para os backlogs
  // =========================================================================
  console.log('\n0.5. Criando disciplinas e unidades...');
  const disciplines = [
    { id: 2, discipline: 'Elétrica' },
    { id: 5, discipline: 'Civil' },
    { id: 6, discipline: 'Mecânica' },
    { id: 7, discipline: 'Hidráulica' },
  ];
  for (const d of disciplines) {
    await db.$executeRaw`INSERT INTO discipline (id, discipline, company_id) VALUES (${d.id}, ${d.discipline}, 1) ON CONFLICT (id) DO NOTHING`;
  }
  const unities = [
    { id: 7, unity: 'm (metro)' },
    { id: 9, unity: 'm² (metro quadrado)' },
    { id: 10, unity: 'un (unidade)' },
  ];
  for (const u of unities) {
    await db.$executeRaw`INSERT INTO unity (id, unity, company_id) VALUES (${u.id}, ${u.unity}, 1) ON CONFLICT (id) DO NOTHING`;
  }
  console.log('   Disciplinas e unidades criadas');

  // =========================================================================
  // 1. BACKLOGS (WBS Hierárquico)
  // =========================================================================
  console.log('\n1. Criando backlogs (WBS)...');

  // --- Nível 0: Fases Principais ---
  const f1 = await insertBacklog({
    projects_id: PROJECT_ID, description: 'Engenharia e Projeto', wbs_code: '1',
    level: 0, sort_order: 1, weight: 10, quantity: 1,
    planned_start: '2026-01-05', planned_end: '2026-02-07', duration: 25,
    planned_cost: 150000, actual_cost: 150000, percent: 100,
    actual_start: '2026-01-05', actual_end: '2026-02-05',
    status_id: 3, discipline_id: 2,
  });

  const f2 = await insertBacklog({
    projects_id: PROJECT_ID, description: 'Infraestrutura Civil', wbs_code: '2',
    level: 0, sort_order: 2, weight: 20, quantity: 1,
    planned_start: '2026-02-10', planned_end: '2026-03-21', duration: 30,
    planned_cost: 500000, actual_cost: 505000, percent: 100,
    actual_start: '2026-02-10', actual_end: '2026-03-19',
    status_id: 3, discipline_id: 5,
  });

  const f3 = await insertBacklog({
    projects_id: PROJECT_ID, description: 'Montagem Mecânica', wbs_code: '3',
    level: 0, sort_order: 3, weight: 35, quantity: 1,
    planned_start: '2026-03-24', planned_end: '2026-05-30', duration: 50,
    planned_cost: 1200000, actual_cost: 495000, percent: 40,
    actual_start: '2026-03-22',
    status_id: 2, discipline_id: 6,
  });

  const f4 = await insertBacklog({
    projects_id: PROJECT_ID, description: 'Instalação Elétrica', wbs_code: '4',
    level: 0, sort_order: 4, weight: 25, quantity: 1,
    planned_start: '2026-05-04', planned_end: '2026-07-03', duration: 45,
    planned_cost: 800000, percent: 0,
    status_id: 1, discipline_id: 2,
  });

  const f5 = await insertBacklog({
    projects_id: PROJECT_ID, description: 'Comissionamento', wbs_code: '5',
    level: 0, sort_order: 5, weight: 10, quantity: 1,
    planned_start: '2026-07-06', planned_end: '2026-08-07', duration: 25,
    planned_cost: 200000, percent: 0,
    status_id: 1, discipline_id: 2,
  });

  console.log('   5 fases principais criadas');

  // --- Nível 1: Fase 1 - Engenharia (100%) ---
  const b1_1 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f1, description: 'Projeto Executivo', wbs_code: '1.1',
    level: 1, sort_order: 1, weight: 40, quantity: 1,
    planned_start: '2026-01-05', planned_end: '2026-01-24', duration: 15,
    planned_cost: 80000, actual_cost: 78000, percent: 100,
    actual_start: '2026-01-05', actual_end: '2026-01-22',
    status_id: 3, discipline_id: 5, unity_id: 10, sprint_added: true,
  });

  const b1_2 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f1, description: 'Projeto Elétrico', wbs_code: '1.2',
    level: 1, sort_order: 2, weight: 40, quantity: 1,
    planned_start: '2026-01-13', planned_end: '2026-02-01', duration: 15,
    planned_cost: 60000, actual_cost: 62000, percent: 100,
    actual_start: '2026-01-14', actual_end: '2026-02-01',
    status_id: 3, discipline_id: 2, unity_id: 10, sprint_added: true,
  });

  const b1_3 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f1, description: 'Aprovação dos Projetos', wbs_code: '1.3',
    level: 1, sort_order: 3, weight: 20, quantity: 1,
    planned_start: '2026-02-03', planned_end: '2026-02-07', duration: 5,
    planned_cost: 10000, actual_cost: 10000, percent: 100,
    actual_start: '2026-02-03', actual_end: '2026-02-05',
    status_id: 3, discipline_id: 2, is_milestone: true, sprint_added: true,
  });

  // --- Nível 1: Fase 2 - Infraestrutura Civil (100%) ---
  const b2_1 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f2, description: 'Terraplanagem', wbs_code: '2.1',
    level: 1, sort_order: 1, weight: 30, quantity: 5000, quantity_done: 5000,
    planned_start: '2026-02-10', planned_end: '2026-02-28', duration: 15,
    planned_cost: 180000, actual_cost: 175000, percent: 100,
    actual_start: '2026-02-10', actual_end: '2026-02-26',
    status_id: 3, discipline_id: 5, unity_id: 9, sprint_added: true,
  });

  const b2_2 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f2, description: 'Fundações', wbs_code: '2.2',
    level: 1, sort_order: 2, weight: 35, quantity: 200, quantity_done: 200,
    planned_start: '2026-02-24', planned_end: '2026-03-14', duration: 15,
    planned_cost: 200000, actual_cost: 210000, percent: 100,
    actual_start: '2026-02-25', actual_end: '2026-03-12',
    status_id: 3, discipline_id: 5, unity_id: 10, sprint_added: true,
  });

  const b2_3 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f2, description: 'Vias de Acesso', wbs_code: '2.3',
    level: 1, sort_order: 3, weight: 20, quantity: 1500, quantity_done: 1500,
    planned_start: '2026-02-17', planned_end: '2026-03-07', duration: 15,
    planned_cost: 80000, actual_cost: 82000, percent: 100,
    actual_start: '2026-02-17', actual_end: '2026-03-05',
    status_id: 3, discipline_id: 5, unity_id: 7, sprint_added: true,
  });

  const b2_4 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f2, description: 'Drenagem', wbs_code: '2.4',
    level: 1, sort_order: 4, weight: 15, quantity: 800, quantity_done: 800,
    planned_start: '2026-03-03', planned_end: '2026-03-21', duration: 15,
    planned_cost: 40000, actual_cost: 38000, percent: 100,
    actual_start: '2026-03-03', actual_end: '2026-03-19',
    status_id: 3, discipline_id: 7, unity_id: 7, sprint_added: true,
  });

  // --- Nível 1: Fase 3 - Montagem Mecânica (~40%) ---
  const b3_1 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f3, description: 'Cravação de Estacas', wbs_code: '3.1',
    level: 1, sort_order: 1, weight: 25, quantity: 3000, quantity_done: 3000,
    planned_start: '2026-03-24', planned_end: '2026-04-11', duration: 15,
    planned_cost: 300000, actual_cost: 295000, percent: 100,
    actual_start: '2026-03-22', actual_end: '2026-04-09',
    status_id: 3, discipline_id: 6, unity_id: 10, sprint_added: true,
  });

  const b3_2 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f3, description: 'Montagem de Estruturas', wbs_code: '3.2',
    level: 1, sort_order: 2, weight: 30, quantity: 1500, quantity_done: 750,
    planned_start: '2026-04-07', planned_end: '2026-05-02', duration: 20,
    planned_cost: 400000, actual_cost: 200000, percent: 50,
    actual_start: '2026-04-08',
    status_id: 2, discipline_id: 6, unity_id: 10, sprint_added: true,
  });

  const b3_3 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f3, description: 'Instalação de Módulos', wbs_code: '3.3',
    level: 1, sort_order: 3, weight: 35, quantity: 10000,
    planned_start: '2026-04-20', planned_end: '2026-05-23', duration: 25,
    planned_cost: 450000, percent: 0,
    status_id: 1, discipline_id: 6, unity_id: 10,
  });

  const b3_4 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f3, description: 'Inspeção Mecânica', wbs_code: '3.4',
    level: 1, sort_order: 4, weight: 10, quantity: 1,
    planned_start: '2026-05-25', planned_end: '2026-05-30', duration: 5,
    planned_cost: 50000, percent: 0,
    status_id: 1, discipline_id: 6, is_milestone: true, is_inspection: true,
  });

  // --- Nível 1: Fase 4 - Instalação Elétrica (0%) ---
  const b4_1 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f4, description: 'Cabeamento DC', wbs_code: '4.1',
    level: 1, sort_order: 1, weight: 20, quantity: 25000,
    planned_start: '2026-05-04', planned_end: '2026-05-23', duration: 15,
    planned_cost: 180000, percent: 0,
    status_id: 1, discipline_id: 2, unity_id: 7,
  });

  const b4_2 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f4, description: 'String Boxes', wbs_code: '4.2',
    level: 1, sort_order: 2, weight: 15, quantity: 50,
    planned_start: '2026-05-18', planned_end: '2026-06-01', duration: 10,
    planned_cost: 100000, percent: 0,
    status_id: 1, discipline_id: 2, unity_id: 10,
  });

  const b4_3 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f4, description: 'Cabeamento AC', wbs_code: '4.3',
    level: 1, sort_order: 3, weight: 20, quantity: 5000,
    planned_start: '2026-05-25', planned_end: '2026-06-13', duration: 15,
    planned_cost: 150000, percent: 0,
    status_id: 1, discipline_id: 2, unity_id: 7,
  });

  const b4_4 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f4, description: 'Instalação de Inversores', wbs_code: '4.4',
    level: 1, sort_order: 4, weight: 25, quantity: 10,
    planned_start: '2026-06-08', planned_end: '2026-06-22', duration: 10,
    planned_cost: 250000, percent: 0,
    status_id: 1, discipline_id: 2, unity_id: 10,
  });

  const b4_5 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f4, description: 'Subestação', wbs_code: '4.5',
    level: 1, sort_order: 5, weight: 20, quantity: 1,
    planned_start: '2026-06-15', planned_end: '2026-07-03', duration: 15,
    planned_cost: 120000, percent: 0,
    status_id: 1, discipline_id: 2, unity_id: 10,
  });

  // --- Nível 1: Fase 5 - Comissionamento (0%) ---
  const b5_1 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f5, description: 'Testes Elétricos', wbs_code: '5.1',
    level: 1, sort_order: 1, weight: 40, quantity: 1,
    planned_start: '2026-07-06', planned_end: '2026-07-18', duration: 10,
    planned_cost: 80000, percent: 0,
    status_id: 1, discipline_id: 2, unity_id: 10,
  });

  const b5_2 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f5, description: 'Energização', wbs_code: '5.2',
    level: 1, sort_order: 2, weight: 40, quantity: 1,
    planned_start: '2026-07-20', planned_end: '2026-08-01', duration: 10,
    planned_cost: 100000, percent: 0,
    status_id: 1, discipline_id: 2, unity_id: 10,
  });

  const b5_3 = await insertBacklog({
    projects_id: PROJECT_ID, parent_id: f5, description: 'Operação Comercial', wbs_code: '5.3',
    level: 1, sort_order: 3, weight: 20, quantity: 1,
    planned_start: '2026-08-03', planned_end: '2026-08-07', duration: 5,
    planned_cost: 20000, percent: 0,
    status_id: 1, discipline_id: 2, is_milestone: true,
  });

  console.log('   24 backlogs criados (5 fases + 19 sub-atividades)');

  // =========================================================================
  // 2. DEPENDÊNCIAS
  // =========================================================================
  console.log('\n2. Criando dependências...');

  const deps = [
    // Fase 1 interna
    { pred_id: b1_1, succ_id: b1_2, type: 'SS', lag: 5 },
    { pred_id: b1_2, succ_id: b1_3, type: 'FS', lag: 2 },
    // Fase 1 → 2
    { pred_id: b1_3, succ_id: b2_1, type: 'FS', lag: 2 },
    // Fase 2 interna
    { pred_id: b2_1, succ_id: b2_2, type: 'FS', lag: -3 },
    { pred_id: b2_1, succ_id: b2_3, type: 'SS', lag: 5 },
    { pred_id: b2_2, succ_id: b2_4, type: 'FS', lag: 0 },
    // Fase 2 → 3
    { pred_id: b2_2, succ_id: b3_1, type: 'FS', lag: 2 },
    // Fase 3 interna
    { pred_id: b3_1, succ_id: b3_2, type: 'FS', lag: -5 },
    { pred_id: b3_2, succ_id: b3_3, type: 'FS', lag: -5 },
    { pred_id: b3_3, succ_id: b3_4, type: 'FS', lag: 2 },
    // Fase 3 → 4
    { pred_id: b3_2, succ_id: b4_1, type: 'SS', lag: 10 },
    // Fase 4 interna
    { pred_id: b4_1, succ_id: b4_2, type: 'FS', lag: -5 },
    { pred_id: b4_2, succ_id: b4_3, type: 'FS', lag: 0 },
    { pred_id: b4_3, succ_id: b4_4, type: 'FS', lag: -5 },
    { pred_id: b4_4, succ_id: b4_5, type: 'FS', lag: 0 },
    // Fase 4 → 5
    { pred_id: b4_5, succ_id: b5_1, type: 'FS', lag: 2 },
    // Fase 5 interna
    { pred_id: b5_1, succ_id: b5_2, type: 'FS', lag: 1 },
    { pred_id: b5_2, succ_id: b5_3, type: 'FS', lag: 1 },
  ];

  for (const dep of deps) {
    await insertDependency({ project_id: PROJECT_ID, ...dep });
  }
  console.log(`   ${deps.length} dependências criadas`);

  // =========================================================================
  // 3. SUBTASKS (para atividade 3.2 - Montagem de Estruturas)
  // =========================================================================
  console.log('\n3. Criando subtasks...');

  const sub_a = await insertSubtask({
    backlog_id: b3_2, description: 'Montagem Setor A',
    weight: 1, quantity: 500, quantity_done: 500,
    status_id: 3, sprint_added: true, unity_id: 10,
  });

  const sub_b = await insertSubtask({
    backlog_id: b3_2, description: 'Montagem Setor B',
    weight: 1, quantity: 500, quantity_done: 250,
    status_id: 2, sprint_added: true, unity_id: 10,
  });

  const sub_c = await insertSubtask({
    backlog_id: b3_2, description: 'Montagem Setor C',
    weight: 1, quantity: 500, quantity_done: 0,
    status_id: 1, unity_id: 10,
  });

  console.log('   3 subtasks criadas para 3.2 Montagem de Estruturas');

  // =========================================================================
  // 4. SPRINTS
  // =========================================================================
  console.log('\n4. Criando sprints...');

  const sp1 = await insertSprint({
    title: 'Sprint 1 - Engenharia', objective: 'Concluir projetos executivos e aprovações',
    start_date: '2026-01-05T00:00:00Z', end_date: '2026-02-07T23:59:59Z',
    progress: 100, projects_id: PROJECT_ID, status_id: 3,
  });

  const sp2 = await insertSprint({
    title: 'Sprint 2 - Infraestrutura Civil', objective: 'Concluir toda infraestrutura civil',
    start_date: '2026-02-10T00:00:00Z', end_date: '2026-03-21T23:59:59Z',
    progress: 100, projects_id: PROJECT_ID, status_id: 3,
  });

  const sp3 = await insertSprint({
    title: 'Sprint 3 - Montagem Mecânica', objective: 'Cravação de estacas e montagem de estruturas',
    start_date: '2026-03-22T00:00:00Z', end_date: '2026-05-02T23:59:59Z',
    progress: 67, projects_id: PROJECT_ID, status_id: 2,
  });

  console.log('   3 sprints criados');

  // =========================================================================
  // 5. SPRINT TASKS
  // =========================================================================
  console.log('\n5. Criando sprint tasks...');

  // Sprint 1 - Fase 1 (todas concluídas)
  for (const bl of [b1_1, b1_2, b1_3]) {
    await insertSprintTask({
      backlog_id: bl, sprint_id: sp1, team_id: TEAM_ID,
      status_id: 4, scheduled_for: '2026-01-05', executed_at: '2026-02-05',
      user_id: USER_ID,
      actual_start: '2026-01-05T08:00:00Z', actual_end: '2026-02-05T17:00:00Z',
    });
  }

  // Sprint 2 - Fase 2 (todas concluídas)
  for (const bl of [b2_1, b2_2, b2_3, b2_4]) {
    await insertSprintTask({
      backlog_id: bl, sprint_id: sp2, team_id: TEAM_ID,
      status_id: 4, scheduled_for: '2026-02-10', executed_at: '2026-03-19',
      user_id: USER_ID,
      actual_start: '2026-02-10T08:00:00Z', actual_end: '2026-03-19T17:00:00Z',
    });
  }

  // Sprint 3 - Fase 3 (parcial)
  // 3.1 Cravação - concluída
  await insertSprintTask({
    backlog_id: b3_1, sprint_id: sp3, team_id: TEAM_ID,
    status_id: 4, scheduled_for: '2026-03-24', executed_at: '2026-04-09',
    user_id: USER_ID,
    actual_start: '2026-03-22T08:00:00Z', actual_end: '2026-04-09T17:00:00Z',
  });

  // 3.2 Setor A (subtask) - concluída
  await insertSprintTask({
    backlog_id: b3_2, subtask_id: sub_a, sprint_id: sp3, team_id: TEAM_ID,
    status_id: 4, scheduled_for: '2026-04-07', executed_at: '2026-04-20',
    user_id: USER_ID,
    actual_start: '2026-04-08T08:00:00Z', actual_end: '2026-04-20T17:00:00Z',
  });

  // 3.2 Setor B (subtask) - em andamento
  await insertSprintTask({
    backlog_id: b3_2, subtask_id: sub_b, sprint_id: sp3, team_id: 5,
    status_id: 2, scheduled_for: '2026-04-21',
    user_id: 4,
    actual_start: '2026-04-21T08:00:00Z',
  });

  console.log('   10 sprint tasks criadas');

  // =========================================================================
  // 6. SCHEDULE BASELINE (snapshot para Curva S)
  // =========================================================================
  console.log('\n6. Criando baseline do cronograma...');

  const allBacklogs = await db.$queryRaw`
    SELECT id, description, wbs_code, level, projects_backlogs_id, weight,
           quantity, quantity_done, percent_complete,
           planned_start_date, planned_end_date, planned_duration_days,
           planned_cost, actual_cost, actual_start_date, actual_end_date,
           is_milestone, sort_order
    FROM projects_backlogs
    WHERE projects_id = ${PROJECT_ID} AND deleted_at IS NULL
    ORDER BY sort_order, wbs_code
  `;

  const snapshot = (allBacklogs as any[]).map((b: any) => ({
    id: Number(b.id),
    description: b.description,
    wbs_code: b.wbs_code,
    level: b.level,
    parent_id: b.projects_backlogs_id ? Number(b.projects_backlogs_id) : null,
    weight: b.weight ? Number(b.weight) : null,
    quantity: b.quantity ? Number(b.quantity) : null,
    quantity_done: b.quantity_done ? Number(b.quantity_done) : null,
    percent_complete: b.percent_complete ? Number(b.percent_complete) : 0,
    planned_start_date: b.planned_start_date?.toISOString?.().split('T')[0] || String(b.planned_start_date),
    planned_end_date: b.planned_end_date?.toISOString?.().split('T')[0] || String(b.planned_end_date),
    planned_duration_days: b.planned_duration_days,
    planned_cost: b.planned_cost ? Number(b.planned_cost) : null,
    actual_cost: b.actual_cost ? Number(b.actual_cost) : null,
    actual_start_date: b.actual_start_date?.toISOString?.().split('T')[0] || (b.actual_start_date ? String(b.actual_start_date) : null),
    actual_end_date: b.actual_end_date?.toISOString?.().split('T')[0] || (b.actual_end_date ? String(b.actual_end_date) : null),
    is_milestone: b.is_milestone || false,
    sort_order: b.sort_order,
  }));

  await db.$executeRaw`
    INSERT INTO schedule_baselines (
      projects_id, baseline_number, description, status, snapshot_data, created_by
    ) VALUES (
      ${PROJECT_ID}, 1, 'Baseline Inicial - Usina Solar Fotovoltaica', 'ativo',
      ${JSON.stringify(snapshot)}::jsonb, ${USER_ID}
    )
  `;
  console.log('   Baseline criada com snapshot de ' + snapshot.length + ' backlogs');

  // =========================================================================
  // 7. ATUALIZAR PROGRESSO DO PROJETO
  // =========================================================================
  console.log('\n7. Atualizando progresso do projeto...');

  await db.$executeRaw`
    UPDATE projects SET completion_percentage = 44 WHERE id = ${PROJECT_ID}
  `;

  // =========================================================================
  // RESUMO
  // =========================================================================
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           SEED CONCLUÍDO COM SUCESSO!                   ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║ Projeto: 14 (Teste Apos Regenerar)                     ║');
  console.log('║ Backlogs: 24 (5 fases + 19 sub-atividades)             ║');
  console.log('║ Dependências: 18 (FS, SS com lags)                     ║');
  console.log('║ Subtasks: 3 (para 3.2 Montagem de Estruturas)          ║');
  console.log('║ Sprints: 3 (2 concluídas + 1 em andamento)             ║');
  console.log('║ Sprint Tasks: 10                                        ║');
  console.log('║ Baseline: 1 (snapshot completo)                         ║');
  console.log('║ Milestones: 3 (1.3, 3.4, 5.3)                          ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║ PROGRESSO POR FASE:                                     ║');
  console.log('║   1. Engenharia e Projeto    → 100% (peso 10)          ║');
  console.log('║   2. Infraestrutura Civil    → 100% (peso 20)          ║');
  console.log('║   3. Montagem Mecânica       →  40% (peso 35)          ║');
  console.log('║   4. Instalação Elétrica     →   0% (peso 25)          ║');
  console.log('║   5. Comissionamento         →   0% (peso 10)          ║');
  console.log('║   GERAL PONDERADO            →  44%                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Reabilitar triggers se existirem
  console.log('\nReabilitando triggers...');
  try { await db.$executeRaw`ALTER TABLE projects_backlogs ENABLE TRIGGER trg_projects_backlogs_normalize`; } catch { /* trigger não existe */ }
  try { await db.$executeRaw`ALTER TABLE subtasks ENABLE TRIGGER ALL`; } catch { /* triggers não existem */ }
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
