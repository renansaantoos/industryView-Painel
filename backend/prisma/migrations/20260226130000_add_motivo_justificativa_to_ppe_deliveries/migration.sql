-- Adiciona campos de motivo e justificativa de devolucao em ppe_deliveries
ALTER TABLE "ppe_deliveries" ADD COLUMN IF NOT EXISTS "motivo_devolucao" VARCHAR(50);
ALTER TABLE "ppe_deliveries" ADD COLUMN IF NOT EXISTS "justificativa_devolucao" TEXT;
