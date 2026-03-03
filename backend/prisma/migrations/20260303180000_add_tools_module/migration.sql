-- =============================================================================
-- Migration: add_tools_module
-- Cria tabelas do modulo de Ferramentas (patrimonio + quantidade)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- departments
-- -----------------------------------------------------------------------------
CREATE TABLE "departments" (
    "id"          BIGSERIAL PRIMARY KEY,
    "company_id"  BIGINT    NOT NULL,
    "name"        VARCHAR(120) NOT NULL,
    "description" TEXT,
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "deleted_at"  TIMESTAMPTZ(6),

    CONSTRAINT "fk_departments_company"
        FOREIGN KEY ("company_id") REFERENCES "company"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "idx_departments_company_id" ON "departments"("company_id");
CREATE INDEX "idx_departments_created_at" ON "departments"("created_at" DESC);

-- -----------------------------------------------------------------------------
-- tool_categories
-- -----------------------------------------------------------------------------
CREATE TABLE "tool_categories" (
    "id"          BIGSERIAL PRIMARY KEY,
    "company_id"  BIGINT    NOT NULL,
    "name"        VARCHAR(120) NOT NULL,
    "description" TEXT,
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "deleted_at"  TIMESTAMPTZ(6),

    CONSTRAINT "fk_tool_categories_company"
        FOREIGN KEY ("company_id") REFERENCES "company"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "idx_tool_categories_company_id" ON "tool_categories"("company_id");
CREATE INDEX "idx_tool_categories_created_at" ON "tool_categories"("created_at" DESC);

-- -----------------------------------------------------------------------------
-- tools
-- -----------------------------------------------------------------------------
CREATE TABLE "tools" (
    "id"                 BIGSERIAL PRIMARY KEY,
    "company_id"         BIGINT       NOT NULL,
    "category_id"        BIGINT,
    "name"               VARCHAR(200) NOT NULL,
    "description"        TEXT,
    "control_type"       VARCHAR(20)  NOT NULL,  -- 'patrimonio' | 'quantidade'
    "patrimonio_code"    VARCHAR(50),
    "quantity_total"     INTEGER      NOT NULL DEFAULT 1,
    "quantity_available" INTEGER      NOT NULL DEFAULT 1,
    "brand"              VARCHAR(100),
    "model"              VARCHAR(100),
    "serial_number"      VARCHAR(100),
    "condition"          VARCHAR(20)  NOT NULL DEFAULT 'novo',
    "branch_id"          BIGINT,
    "department_id"      BIGINT,
    "project_id"         BIGINT,
    "assigned_user_id"   BIGINT,
    "assigned_team_id"   BIGINT,
    "notes"              TEXT,
    "created_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "deleted_at"         TIMESTAMPTZ(6),

    CONSTRAINT "fk_tools_company"
        FOREIGN KEY ("company_id") REFERENCES "company"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "fk_tools_category"
        FOREIGN KEY ("category_id") REFERENCES "tool_categories"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "fk_tools_branch"
        FOREIGN KEY ("branch_id") REFERENCES "company_branches"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "fk_tools_department"
        FOREIGN KEY ("department_id") REFERENCES "departments"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "fk_tools_project"
        FOREIGN KEY ("project_id") REFERENCES "projects"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "fk_tools_assigned_user"
        FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "fk_tools_assigned_team"
        FOREIGN KEY ("assigned_team_id") REFERENCES "teams"("id")
        ON UPDATE NO ACTION
);

-- Codigo de patrimonio unico por empresa (ignora NULLs automaticamente no Postgres)
CREATE UNIQUE INDEX "uq_tools_patrimonio_code" ON "tools"("company_id", "patrimonio_code")
    WHERE "patrimonio_code" IS NOT NULL AND "deleted_at" IS NULL;

CREATE INDEX "idx_tools_company_id"      ON "tools"("company_id");
CREATE INDEX "idx_tools_category_id"     ON "tools"("category_id");
CREATE INDEX "idx_tools_branch_id"       ON "tools"("branch_id");
CREATE INDEX "idx_tools_department_id"   ON "tools"("department_id");
CREATE INDEX "idx_tools_project_id"      ON "tools"("project_id");
CREATE INDEX "idx_tools_assigned_user_id" ON "tools"("assigned_user_id");
CREATE INDEX "idx_tools_assigned_team_id" ON "tools"("assigned_team_id");
CREATE INDEX "idx_tools_control_type"    ON "tools"("control_type");
CREATE INDEX "idx_tools_created_at"      ON "tools"("created_at" DESC);

-- -----------------------------------------------------------------------------
-- tool_movements
-- -----------------------------------------------------------------------------
CREATE TABLE "tool_movements" (
    "id"                 BIGSERIAL PRIMARY KEY,
    "tool_id"            BIGINT      NOT NULL,
    "movement_type"      VARCHAR(30) NOT NULL,
    "quantity"           INTEGER     NOT NULL DEFAULT 1,
    "from_branch_id"     BIGINT,
    "from_department_id" BIGINT,
    "from_user_id"       BIGINT,
    "from_team_id"       BIGINT,
    "from_project_id"    BIGINT,
    "to_branch_id"       BIGINT,
    "to_department_id"   BIGINT,
    "to_user_id"         BIGINT,
    "to_team_id"         BIGINT,
    "to_project_id"      BIGINT,
    "condition"          VARCHAR(20),
    "notes"              TEXT,
    "performed_by_id"    BIGINT      NOT NULL,
    "created_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "fk_tool_movements_tool"
        FOREIGN KEY ("tool_id") REFERENCES "tools"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "fk_tool_movements_performer"
        FOREIGN KEY ("performed_by_id") REFERENCES "users"("id")
        ON UPDATE NO ACTION
);

CREATE INDEX "idx_tool_movements_tool_id"   ON "tool_movements"("tool_id");
CREATE INDEX "idx_tool_movements_type"      ON "tool_movements"("movement_type");
CREATE INDEX "idx_tool_movements_performer" ON "tool_movements"("performed_by_id");
CREATE INDEX "idx_tool_movements_created_at" ON "tool_movements"("created_at" DESC);

-- -----------------------------------------------------------------------------
-- tool_acceptance_terms
-- -----------------------------------------------------------------------------
CREATE TABLE "tool_acceptance_terms" (
    "id"              BIGSERIAL PRIMARY KEY,
    "tool_id"         BIGINT NOT NULL,
    "delivered_by_id" BIGINT NOT NULL,
    "received_by_id"  BIGINT NOT NULL,
    "delivery_date"   TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "notes"           TEXT,
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "fk_tool_terms_tool"
        FOREIGN KEY ("tool_id") REFERENCES "tools"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "fk_tool_terms_delivered_by"
        FOREIGN KEY ("delivered_by_id") REFERENCES "users"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "fk_tool_terms_received_by"
        FOREIGN KEY ("received_by_id") REFERENCES "users"("id")
        ON UPDATE NO ACTION
);

CREATE INDEX "idx_tool_acceptance_terms_tool_id"     ON "tool_acceptance_terms"("tool_id");
CREATE INDEX "idx_tool_acceptance_terms_delivered_by" ON "tool_acceptance_terms"("delivered_by_id");
CREATE INDEX "idx_tool_acceptance_terms_received_by"  ON "tool_acceptance_terms"("received_by_id");
CREATE INDEX "idx_tool_acceptance_terms_created_at"   ON "tool_acceptance_terms"("created_at" DESC);

-- -----------------------------------------------------------------------------
-- tool_kits
-- -----------------------------------------------------------------------------
CREATE TABLE "tool_kits" (
    "id"          BIGSERIAL PRIMARY KEY,
    "company_id"  BIGINT       NOT NULL,
    "name"        VARCHAR(120) NOT NULL,
    "cargo"       VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "deleted_at"  TIMESTAMPTZ(6),

    CONSTRAINT "fk_tool_kits_company"
        FOREIGN KEY ("company_id") REFERENCES "company"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "idx_tool_kits_company_id" ON "tool_kits"("company_id");
CREATE INDEX "idx_tool_kits_cargo"      ON "tool_kits"("cargo");
CREATE INDEX "idx_tool_kits_created_at" ON "tool_kits"("created_at" DESC);

-- -----------------------------------------------------------------------------
-- tool_kit_items
-- -----------------------------------------------------------------------------
CREATE TABLE "tool_kit_items" (
    "id"          BIGSERIAL PRIMARY KEY,
    "kit_id"      BIGINT   NOT NULL,
    "category_id" BIGINT   NOT NULL,
    "quantity"    INTEGER  NOT NULL DEFAULT 1,
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT "fk_tool_kit_items_kit"
        FOREIGN KEY ("kit_id") REFERENCES "tool_kits"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "fk_tool_kit_items_category"
        FOREIGN KEY ("category_id") REFERENCES "tool_categories"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "uq_tool_kit_items_kit_category"
        UNIQUE ("kit_id", "category_id")
);

CREATE INDEX "idx_tool_kit_items_kit_id"      ON "tool_kit_items"("kit_id");
CREATE INDEX "idx_tool_kit_items_category_id" ON "tool_kit_items"("category_id");
