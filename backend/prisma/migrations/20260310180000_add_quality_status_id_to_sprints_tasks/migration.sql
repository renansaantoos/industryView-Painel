-- AlterTable
ALTER TABLE "sprints_tasks" ADD COLUMN "quality_status_id" BIGINT;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_quality_status_id_fkey" FOREIGN KEY ("quality_status_id") REFERENCES "quality_status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_quality_status_id" ON "sprints_tasks"("quality_status_id");
