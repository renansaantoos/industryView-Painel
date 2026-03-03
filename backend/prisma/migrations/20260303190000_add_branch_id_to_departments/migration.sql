-- =============================================================================
-- Migration: add_branch_id_to_departments
-- Adiciona branch_id na tabela departments (associacao com filial/matriz)
-- =============================================================================

ALTER TABLE "departments"
  ADD COLUMN "branch_id" BIGINT;

ALTER TABLE "departments"
  ADD CONSTRAINT "fk_departments_branch"
    FOREIGN KEY ("branch_id") REFERENCES "company_branches"("id")
    ON UPDATE NO ACTION;

CREATE INDEX "idx_departments_branch_id" ON "departments"("branch_id");
