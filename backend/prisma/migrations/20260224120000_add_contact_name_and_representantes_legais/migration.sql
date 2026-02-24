-- AlterTable: Add contact_name and representantes_legais to company
ALTER TABLE "company" ADD COLUMN "contact_name" VARCHAR(120);
ALTER TABLE "company" ADD COLUMN "representantes_legais" JSONB;

-- AlterTable: Add contact_name and representantes_legais to company_branches
ALTER TABLE "company_branches" ADD COLUMN "contact_name" VARCHAR(120);
ALTER TABLE "company_branches" ADD COLUMN "representantes_legais" JSONB;

-- Migrate existing single responsavel_legal/cpf data into new JSON array field
UPDATE "company"
SET "representantes_legais" = jsonb_build_array(
  jsonb_build_object('nome', "responsavel_legal", 'cpf', COALESCE("responsavel_cpf", ''))
)
WHERE "responsavel_legal" IS NOT NULL
  AND "responsavel_legal" != ''
  AND "representantes_legais" IS NULL;

UPDATE "company_branches"
SET "representantes_legais" = jsonb_build_array(
  jsonb_build_object('nome', "responsavel_legal", 'cpf', COALESCE("responsavel_cpf", ''))
)
WHERE "responsavel_legal" IS NOT NULL
  AND "responsavel_legal" != ''
  AND "representantes_legais" IS NULL;
