-- AlterTable
ALTER TABLE "material_requisitions" ADD COLUMN "rejection_reason" TEXT;
ALTER TABLE "material_requisitions" ADD COLUMN "rejected_at" TIMESTAMPTZ(6);
