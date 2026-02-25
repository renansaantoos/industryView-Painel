-- CreateTable: client_units (Matriz e Filiais do cliente)
CREATE TABLE "client_units" (
  "id"           BIGSERIAL PRIMARY KEY,
  "client_id"    BIGINT NOT NULL,
  "unit_type"    VARCHAR(10) NOT NULL,
  "label"        TEXT,
  "cnpj"         VARCHAR(18),
  "address"      TEXT,
  "number"       VARCHAR(20),
  "complement"   TEXT,
  "neighborhood" TEXT,
  "city"         TEXT,
  "state"        CHAR(2),
  "cep"          VARCHAR(9),
  "created_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

  CONSTRAINT "fk_client_units_client"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateIndex
CREATE INDEX "idx_client_units_client_id" ON "client_units"("client_id");
