-- AlterTable: adiciona client_unit_id em projects
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "client_unit_id" BIGINT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_projects_client_unit_id" ON "projects"("client_unit_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_unit_id_fkey"
  FOREIGN KEY ("client_unit_id") REFERENCES "client_units"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;
