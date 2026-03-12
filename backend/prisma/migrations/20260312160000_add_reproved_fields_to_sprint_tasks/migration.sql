-- Adiciona flag e contador de reprovações na tarefa
ALTER TABLE "sprints_tasks"
  ADD COLUMN IF NOT EXISTS "is_reproved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "reproved_count" INTEGER NOT NULL DEFAULT 0;

-- Adiciona campo de observação no histórico de movimentos
ALTER TABLE "sprint_task_change_log"
  ADD COLUMN IF NOT EXISTS "observation" TEXT;
