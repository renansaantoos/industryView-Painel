-- CreateTable
CREATE TABLE "employees_hr_data" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "cpf" VARCHAR(14),
    "rg" VARCHAR(20),
    "rg_orgao_emissor" VARCHAR(20),
    "rg_data_emissao" DATE,
    "data_nascimento" DATE,
    "genero" VARCHAR(20),
    "estado_civil" VARCHAR(20),
    "nacionalidade" VARCHAR(60),
    "naturalidade" VARCHAR(100),
    "nome_mae" TEXT,
    "nome_pai" TEXT,
    "cep" VARCHAR(9),
    "logradouro" TEXT,
    "numero" VARCHAR(20),
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "estado" CHAR(2),
    "matricula" VARCHAR(30),
    "data_admissao" DATE,
    "data_demissao" DATE,
    "tipo_contrato" VARCHAR(30),
    "cargo" VARCHAR(100),
    "departamento" VARCHAR(100),
    "salario" DECIMAL(12,2),
    "jornada_trabalho" VARCHAR(30),
    "pis_pasep" VARCHAR(14),
    "ctps_numero" VARCHAR(20),
    "ctps_serie" VARCHAR(10),
    "ctps_uf" CHAR(2),
    "cnh_numero" VARCHAR(20),
    "cnh_categoria" VARCHAR(5),
    "cnh_validade" DATE,
    "banco_nome" VARCHAR(60),
    "banco_agencia" VARCHAR(10),
    "banco_conta" VARCHAR(20),
    "banco_tipo_conta" VARCHAR(20),
    "banco_pix" TEXT,
    "emergencia_nome" TEXT,
    "emergencia_parentesco" VARCHAR(30),
    "emergencia_telefone" VARCHAR(20),
    "escolaridade" VARCHAR(30),
    "curso" TEXT,
    "instituicao" TEXT,
    "observacoes" TEXT,
    "foto_documento_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_hr_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees_vacations" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE NOT NULL,
    "dias_total" INTEGER NOT NULL,
    "dias_abono" INTEGER DEFAULT 0,
    "periodo_aquisitivo_inicio" DATE,
    "periodo_aquisitivo_fim" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "aprovado_por_id" BIGINT,
    "aprovado_em" TIMESTAMPTZ(6),
    "observacoes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "employees_vacations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees_documents" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "numero_documento" VARCHAR(50),
    "data_emissao" DATE,
    "data_validade" DATE,
    "file_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "employees_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_hr_data_users_id_key" ON "employees_hr_data"("users_id");
CREATE INDEX "idx_employees_hr_data_users_id" ON "employees_hr_data"("users_id");
CREATE INDEX "idx_employees_hr_data_cpf" ON "employees_hr_data"("cpf");
CREATE INDEX "idx_employees_hr_data_matricula" ON "employees_hr_data"("matricula");

CREATE INDEX "idx_employees_vacations_users_id" ON "employees_vacations"("users_id");
CREATE INDEX "idx_employees_vacations_status" ON "employees_vacations"("status");
CREATE INDEX "idx_employees_vacations_data_inicio" ON "employees_vacations"("data_inicio");

CREATE INDEX "idx_employees_documents_users_id" ON "employees_documents"("users_id");
CREATE INDEX "idx_employees_documents_data_validade" ON "employees_documents"("data_validade");

-- AddForeignKey
ALTER TABLE "employees_hr_data" ADD CONSTRAINT "employees_hr_data_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employees_vacations" ADD CONSTRAINT "employees_vacations_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employees_documents" ADD CONSTRAINT "employees_documents_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
