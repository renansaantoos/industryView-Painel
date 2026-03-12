-- AlterTable
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "is_inspection" BOOLEAN NOT NULL DEFAULT true;
