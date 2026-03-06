-- CreateTable
CREATE TABLE "company_holidays" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'national',
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "company_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_company_holidays_company_date" ON "company_holidays"("company_id", "date");

-- CreateIndex
CREATE INDEX "idx_company_holidays_company_id" ON "company_holidays"("company_id");

-- AddForeignKey
ALTER TABLE "company_holidays" ADD CONSTRAINT "company_holidays_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
