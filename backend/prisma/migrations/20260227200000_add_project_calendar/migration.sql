-- CreateTable
CREATE TABLE "project_holidays" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'national',
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "project_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_work_calendar" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "seg_ativo" BOOLEAN NOT NULL DEFAULT true,
    "seg_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "seg_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "seg_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "seg_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "ter_ativo" BOOLEAN NOT NULL DEFAULT true,
    "ter_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "ter_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "ter_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "ter_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "qua_ativo" BOOLEAN NOT NULL DEFAULT true,
    "qua_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "qua_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "qua_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "qua_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "qui_ativo" BOOLEAN NOT NULL DEFAULT true,
    "qui_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "qui_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "qui_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "qui_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "sex_ativo" BOOLEAN NOT NULL DEFAULT true,
    "sex_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "sex_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "sex_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "sex_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "sab_ativo" BOOLEAN NOT NULL DEFAULT false,
    "sab_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "sab_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "sab_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "sab_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "dom_ativo" BOOLEAN NOT NULL DEFAULT false,
    "dom_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "dom_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "dom_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "dom_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_work_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_work_calendar_override" (
    "id" BIGSERIAL NOT NULL,
    "project_work_calendar_id" BIGINT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER,
    "seg_ativo" BOOLEAN NOT NULL DEFAULT true,
    "seg_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "seg_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "seg_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "seg_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "ter_ativo" BOOLEAN NOT NULL DEFAULT true,
    "ter_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "ter_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "ter_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "ter_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "qua_ativo" BOOLEAN NOT NULL DEFAULT true,
    "qua_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "qua_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "qua_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "qua_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "qui_ativo" BOOLEAN NOT NULL DEFAULT true,
    "qui_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "qui_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "qui_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "qui_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "sex_ativo" BOOLEAN NOT NULL DEFAULT true,
    "sex_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "sex_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "sex_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "sex_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "sab_ativo" BOOLEAN NOT NULL DEFAULT false,
    "sab_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "sab_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "sab_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "sab_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "dom_ativo" BOOLEAN NOT NULL DEFAULT false,
    "dom_entrada" VARCHAR(5) NOT NULL DEFAULT '08:00',
    "dom_intervalo_ini" VARCHAR(5) NOT NULL DEFAULT '12:00',
    "dom_intervalo_fim" VARCHAR(5) NOT NULL DEFAULT '13:00',
    "dom_saida" VARCHAR(5) NOT NULL DEFAULT '17:00',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_work_calendar_override_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_project_holidays_project_date" ON "project_holidays"("projects_id", "date");

-- CreateIndex
CREATE INDEX "idx_project_holidays_projects_id" ON "project_holidays"("projects_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_work_calendar_projects_id_key" ON "project_work_calendar"("projects_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_project_work_calendar_override" ON "project_work_calendar_override"("project_work_calendar_id", "month", "year");

-- AddForeignKey
ALTER TABLE "project_holidays" ADD CONSTRAINT "project_holidays_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_work_calendar" ADD CONSTRAINT "project_work_calendar_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_work_calendar_override" ADD CONSTRAINT "project_work_calendar_override_project_work_calendar_id_fkey" FOREIGN KEY ("project_work_calendar_id") REFERENCES "project_work_calendar"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
