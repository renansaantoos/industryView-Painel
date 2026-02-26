-- Adiciona campos de Folga de Campo em employees_hr_data
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "distancia_moradia_obra" DECIMAL(8, 2);
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "folga_campo_dias_trabalho" INTEGER;
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "folga_campo_dias_folga" INTEGER;
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "folga_campo_dias_uteis" INTEGER;
