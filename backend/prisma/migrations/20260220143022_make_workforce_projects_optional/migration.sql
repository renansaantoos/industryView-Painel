-- DropForeignKey
ALTER TABLE "workforce_daily_log" DROP CONSTRAINT "workforce_daily_log_projects_id_fkey";

-- DropIndex
DROP INDEX "idx_safety_incidents_involved_user_id";

-- AlterTable
ALTER TABLE "workforce_daily_log" ALTER COLUMN "projects_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "workforce_daily_log" ADD CONSTRAINT "workforce_daily_log_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
