-- CreateTable: clients (Clientes)
CREATE TABLE "clients" (
  "id"                      BIGSERIAL PRIMARY KEY,
  "company_id"              BIGINT NOT NULL,

  "name"                    TEXT NOT NULL,
  "name_normalized"         TEXT,

  "legal_name"              TEXT NOT NULL,
  "trade_name"              TEXT,
  "cnpj"                    VARCHAR(18),
  "state_registration"      TEXT,
  "state_registration_type" VARCHAR(20),
  "main_cnae"               VARCHAR(10),

  "billing_address"         TEXT,
  "billing_number"          VARCHAR(20),
  "billing_complement"      TEXT,
  "billing_neighborhood"    TEXT,
  "billing_city"            TEXT,
  "billing_state"           CHAR(2),
  "billing_cep"             VARCHAR(9),

  "delivery_address"        TEXT,
  "delivery_number"         VARCHAR(20),
  "delivery_complement"     TEXT,
  "delivery_neighborhood"   TEXT,
  "delivery_city"           TEXT,
  "delivery_state"          CHAR(2),
  "delivery_cep"            VARCHAR(9),
  "delivery_same_as_billing" BOOLEAN NOT NULL DEFAULT true,
  "receiving_hours"         TEXT,
  "vehicle_restrictions"    TEXT,
  "latitude"                DECIMAL(10,8),
  "longitude"               DECIMAL(11,8),

  "purchasing_contact_name"  TEXT,
  "purchasing_contact_email" TEXT,
  "purchasing_contact_phone" VARCHAR(20),
  "financial_contact_name"   TEXT,
  "financial_contact_email"  TEXT,
  "financial_contact_phone"  VARCHAR(20),
  "warehouse_contact_name"   TEXT,
  "warehouse_contact_email"  TEXT,
  "warehouse_contact_phone"  VARCHAR(20),

  "industry_segment"        TEXT,
  "purchase_potential"      TEXT,
  "default_payment_terms"   TEXT,
  "responsible_salesperson" TEXT,

  "notes"                   TEXT,
  "created_at"              TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at"              TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "deleted_at"              TIMESTAMPTZ(6),

  CONSTRAINT "fk_clients_company"
    FOREIGN KEY ("company_id") REFERENCES "company"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "idx_clients_company_id"      ON "clients"("company_id");
CREATE INDEX "idx_clients_created_at"      ON "clients"("created_at" DESC);
CREATE INDEX "idx_clients_name_normalized" ON "clients"("name_normalized");

-- AlterTable: Add client_id to projects
ALTER TABLE "projects" ADD COLUMN "client_id" BIGINT;

ALTER TABLE "projects" ADD CONSTRAINT "fk_projects_client"
  FOREIGN KEY ("client_id") REFERENCES "clients"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX "idx_projects_client_id" ON "projects"("client_id");
