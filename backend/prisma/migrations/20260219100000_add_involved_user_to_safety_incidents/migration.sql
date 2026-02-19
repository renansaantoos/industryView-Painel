-- AlterTable
ALTER TABLE "safety_incidents" ADD COLUMN "involved_user_id" BIGINT;

-- AddForeignKey
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_involved_user_id_fkey"
  FOREIGN KEY ("involved_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- CreateIndex
CREATE INDEX "idx_safety_incidents_involved_user_id" ON "safety_incidents"("involved_user_id");
