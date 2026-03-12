ALTER TABLE "sprints_tasks"
  ADD COLUMN IF NOT EXISTS "failure_responsible" TEXT;
