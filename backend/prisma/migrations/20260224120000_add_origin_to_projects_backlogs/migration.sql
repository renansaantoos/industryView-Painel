-- Add origin field to projects_backlogs to distinguish schedule imports from manual tasks
ALTER TABLE "projects_backlogs"
ADD COLUMN IF NOT EXISTS "origin" VARCHAR(20) NOT NULL DEFAULT 'manual';

-- Index for filtering by origin
CREATE INDEX IF NOT EXISTS "idx_projects_backlogs_origin"
  ON "projects_backlogs" ("origin")
  WHERE "deleted_at" IS NULL;

-- Backfill: records with import_source_id are from schedule imports
UPDATE "projects_backlogs"
SET "origin" = 'schedule_import'
WHERE "import_source_id" IS NOT NULL
  AND "deleted_at" IS NULL;
