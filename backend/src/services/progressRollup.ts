// =============================================================================
// INDUSTRYVIEW BACKEND - Progress Rollup Service
// Servico de calculo e propagacao de progresso
//
// Fluxo de rollup:
//   sprints_tasks.status muda -> rollupFromSprintTask()
//   -> atualiza subtask.quantity_done (se aplicavel)
//   -> rollupBacklog() calcula percent_complete do backlog
//   -> propaga para o backlog pai (recursivo)
//   -> atualiza progresso do sprint
//
// Regra de calculo de percent_complete de um backlog:
//   1. Se tem subtasks: media ponderada de (quantity_done / quantity) * weight
//   2. Se nao tem subtasks mas tem filhos: media ponderada de percent_complete dos filhos
//   3. Se nao tem nem subtasks nem filhos: % de sprint_tasks com status=3 (Concluido)
// =============================================================================

import { db } from '../config/database';

export class ProgressRollupService {

  // ===========================================================================
  // PONTO DE ENTRADA PRINCIPAL
  // ===========================================================================

  /**
   * Ponto de entrada: chamado quando uma sprint task muda de status
   * Propaga o progresso para o backlog e seus ancestrais
   */
  static async rollupFromSprintTask(sprintTaskId: number): Promise<void> {
    const task = await db.sprints_tasks.findFirst({
      where: { id: BigInt(sprintTaskId), deleted_at: null },
      select: {
        id: true,
        projects_backlogs_id: true,
        subtasks_id: true,
        sprints_tasks_statuses_id: true,
        sprints_id: true,
      },
    });

    if (!task || !task.projects_backlogs_id) return;

    const backlogId = Number(task.projects_backlogs_id);

    // Se tem subtask e status e Concluido (3), marca quantity_done = quantity
    if (task.subtasks_id && Number(task.sprints_tasks_statuses_id) === 3) {
      await db.$executeRaw`
        UPDATE subtasks
        SET quantity_done = quantity, updated_at = NOW()
        WHERE id = ${task.subtasks_id}
      `;
    }

    // Calcula percent_complete do backlog e propaga para cima
    await ProgressRollupService.rollupBacklog(backlogId);

    // Atualiza progresso do sprint
    if (task.sprints_id) {
      await ProgressRollupService.updateSprintProgress(Number(task.sprints_id));
    }
  }

  // ===========================================================================
  // ROLLUP DE BACKLOG
  // ===========================================================================

  /**
   * Recalcula percent_complete de um backlog e propaga para o pai
   * Chamado recursivamente ate chegar na raiz da hierarquia
   */
  static async rollupBacklog(backlogId: number): Promise<void> {
    // 1. Verifica se o backlog tem subtasks
    const subtasks = await db.subtasks.findMany({
      where: { projects_backlogs_id: BigInt(backlogId), deleted_at: null },
      select: { quantity: true, quantity_done: true, weight: true },
    });

    let percentComplete: number;

    if (subtasks.length > 0) {
      // Calcula a partir das subtasks: media ponderada de (done/qty) * weight
      let totalWeightedDone = 0;
      let totalWeightedQty = 0;

      for (const sub of subtasks) {
        const qty = sub.quantity ? Number(sub.quantity) : 0;
        const done = sub.quantity_done ? Number(sub.quantity_done) : 0;
        const w = sub.weight ? Number(sub.weight) : 1;
        totalWeightedDone += done * w;
        totalWeightedQty += qty * w;
      }

      percentComplete = totalWeightedQty > 0 ? (totalWeightedDone / totalWeightedQty) * 100 : 0;
    } else {
      // Verifica se o backlog tem filhos na hierarquia
      const children = await db.projects_backlogs.findMany({
        where: { projects_backlogs_id: BigInt(backlogId), deleted_at: null },
        select: { percent_complete: true, weight: true },
      });

      if (children.length > 0) {
        // Calcula a partir dos filhos: media ponderada de percent_complete
        let totalWeighted = 0;
        let totalWeight = 0;

        for (const child of children) {
          const pct = child.percent_complete ? Number(child.percent_complete) : 0;
          const w = child.weight ? Number(child.weight) : 1;
          totalWeighted += pct * w;
          totalWeight += w;
        }

        percentComplete = totalWeight > 0 ? totalWeighted / totalWeight : 0;
      } else {
        // Folha: calcula a partir das sprint_tasks associadas
        const [taskCounts] = await db.$queryRaw<{ total: bigint; done: bigint }[]>`
          SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE sprints_tasks_statuses_id = 3) AS done
          FROM sprints_tasks
          WHERE projects_backlogs_id = ${BigInt(backlogId)}
            AND deleted_at IS NULL
        `;

        const total = Number(taskCounts?.total ?? 0);
        const done = Number(taskCounts?.done ?? 0);
        percentComplete = total > 0 ? (done / total) * 100 : 0;
      }
    }

    // Arredonda para 2 casas decimais
    percentComplete = Math.round(percentComplete * 100) / 100;

    // Atualiza o backlog com o novo percentual e datas reais
    const today = new Date().toISOString().split('T')[0];

    if (percentComplete > 0) {
      await db.$executeRaw`
        UPDATE projects_backlogs SET
          percent_complete = ${percentComplete},
          actual_start_date = COALESCE(actual_start_date, ${today}::date),
          actual_end_date = CASE
            WHEN ${percentComplete} >= 100
            THEN COALESCE(actual_end_date, ${today}::date)
            ELSE actual_end_date
          END,
          updated_at = NOW()
        WHERE id = ${BigInt(backlogId)} AND deleted_at IS NULL
      `;
    } else {
      await db.$executeRaw`
        UPDATE projects_backlogs SET
          percent_complete = ${percentComplete},
          updated_at = NOW()
        WHERE id = ${BigInt(backlogId)} AND deleted_at IS NULL
      `;
    }

    // Propaga para o backlog pai (recursividade controlada pela hierarquia)
    const backlog = await db.projects_backlogs.findFirst({
      where: { id: BigInt(backlogId), deleted_at: null },
      select: { projects_backlogs_id: true },
    });

    if (backlog?.projects_backlogs_id) {
      await ProgressRollupService.rollupBacklog(Number(backlog.projects_backlogs_id));
    }
  }

  // ===========================================================================
  // ROLLUP DE PROJETO COMPLETO
  // ===========================================================================

  /**
   * Recalcula percent_complete de todos os backlogs de um projeto (bottom-up)
   * Util apos importacao de cronograma ou reset de progresso
   */
  static async rollupProject(projectsId: number): Promise<void> {
    // Processa backlogs do nivel mais profundo para o mais raso (folhas -> raiz)
    const backlogs = await db.$queryRaw<{ id: bigint; level: number }[]>`
      SELECT id, COALESCE(level, 0) AS level
      FROM projects_backlogs
      WHERE projects_id = ${BigInt(projectsId)} AND deleted_at IS NULL
      ORDER BY COALESCE(level, 0) DESC, COALESCE(sort_order, 0) ASC
    `;

    for (const b of backlogs) {
      await ProgressRollupService.rollupBacklog(Number(b.id));
    }
  }

  // ===========================================================================
  // PROGRESSO DO SPRINT
  // ===========================================================================

  /**
   * Atualiza o percentual de progresso de um sprint
   * Baseado na proporcao de sprint_tasks com status Concluido (3)
   */
  static async updateSprintProgress(sprintId: number): Promise<void> {
    const [counts] = await db.$queryRaw<{ total: bigint; done: bigint }[]>`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE sprints_tasks_statuses_id = 3) AS done
      FROM sprints_tasks
      WHERE sprints_id = ${BigInt(sprintId)} AND deleted_at IS NULL
    `;

    const total = Number(counts?.total ?? 0);
    const done = Number(counts?.done ?? 0);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    await db.sprints.update({
      where: { id: BigInt(sprintId) },
      data: { progress_percentage: progress, updated_at: new Date() },
    });
  }
}
