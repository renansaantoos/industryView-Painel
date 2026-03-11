-- Migration: add quality_status_id to sprints_tasks
-- Adds per-task inspection status (isolates quality_status from backlog level)
ALTER TABLE "sprints_tasks" ADD COLUMN IF NOT EXISTS "quality_status_id" BIGINT REFERENCES "quality_status"("id");
