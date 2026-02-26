ALTER TABLE "workforce_daily_log" ADD COLUMN IF NOT EXISTS "saida_intervalo" TIMESTAMPTZ(6);
ALTER TABLE "workforce_daily_log" ADD COLUMN IF NOT EXISTS "entrada_intervalo" TIMESTAMPTZ(6);
ALTER TABLE "workforce_daily_log" ADD COLUMN IF NOT EXISTS "hours_he_100" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "workforce_daily_log" ADD COLUMN IF NOT EXISTS "observation" TEXT;
