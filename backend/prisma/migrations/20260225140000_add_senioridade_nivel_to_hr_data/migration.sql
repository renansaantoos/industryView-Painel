-- AddColumn senioridade and nivel to employees_hr_data
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "senioridade" VARCHAR(5);
ALTER TABLE "employees_hr_data" ADD COLUMN IF NOT EXISTS "nivel" VARCHAR(5);
