-- Adiciona campos de PCD, atividade insalubre e país de nascimento em employees_hr_data
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "pais_nascimento" VARCHAR(100);
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "trabalho_insalubre" BOOLEAN;
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "pcd" BOOLEAN;
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "tipo_deficiencia" VARCHAR(30);
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "cid" VARCHAR(20);
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "grau_deficiencia" VARCHAR(20);
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "reabilitado_inss" BOOLEAN;
