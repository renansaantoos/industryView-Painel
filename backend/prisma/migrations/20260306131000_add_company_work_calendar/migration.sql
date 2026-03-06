-- CreateTable
CREATE TABLE "company_work_calendar" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "seg_ativo" BOOLEAN NOT NULL DEFAULT true,
    "ter_ativo" BOOLEAN NOT NULL DEFAULT true,
    "qua_ativo" BOOLEAN NOT NULL DEFAULT true,
    "qui_ativo" BOOLEAN NOT NULL DEFAULT true,
    "sex_ativo" BOOLEAN NOT NULL DEFAULT true,
    "sab_ativo" BOOLEAN NOT NULL DEFAULT false,
    "dom_ativo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_work_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_work_calendar_company_id_key" ON "company_work_calendar"("company_id");

-- AddForeignKey
ALTER TABLE "company_work_calendar" ADD CONSTRAINT "company_work_calendar_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
