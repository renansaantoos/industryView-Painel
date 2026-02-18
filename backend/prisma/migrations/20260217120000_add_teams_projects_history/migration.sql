-- CreateTable
CREATE TABLE "teams_projects" (
    "id" BIGSERIAL NOT NULL,
    "teams_id" BIGINT NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "start_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "teams_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_projects_history" (
    "id" BIGSERIAL NOT NULL,
    "teams_id" BIGINT NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "team_name" TEXT,
    "project_name" TEXT,
    "performed_by_id" BIGINT,
    "performed_by_name" TEXT,
    "performed_by_email" TEXT,
    "members_snapshot" JSONB,
    "start_at" TIMESTAMPTZ(6),
    "end_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_projects_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_projects_teams_id_projects_id_key" ON "teams_projects"("teams_id", "projects_id");

-- CreateIndex
CREATE INDEX "idx_teams_projects_teams_id" ON "teams_projects"("teams_id");

-- CreateIndex
CREATE INDEX "idx_teams_projects_projects_id" ON "teams_projects"("projects_id");

-- CreateIndex
CREATE INDEX "idx_teams_projects_created_at" ON "teams_projects"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_tp_history_teams_id" ON "teams_projects_history"("teams_id");

-- CreateIndex
CREATE INDEX "idx_tp_history_projects_id" ON "teams_projects_history"("projects_id");

-- CreateIndex
CREATE INDEX "idx_tp_history_action" ON "teams_projects_history"("action");

-- CreateIndex
CREATE INDEX "idx_tp_history_created_at" ON "teams_projects_history"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "teams_projects" ADD CONSTRAINT "teams_projects_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams_projects" ADD CONSTRAINT "teams_projects_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
