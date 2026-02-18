-- CreateTable
CREATE TABLE "teams_members_history" (
    "id" BIGSERIAL NOT NULL,
    "teams_id" BIGINT NOT NULL,
    "users_id" BIGINT NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "member_type" VARCHAR(20) NOT NULL,
    "team_name" TEXT,
    "user_name" TEXT,
    "user_email" TEXT,
    "performed_by_id" BIGINT,
    "performed_by_name" TEXT,
    "performed_by_email" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_members_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_tm_history_teams_id" ON "teams_members_history"("teams_id");
CREATE INDEX "idx_tm_history_users_id" ON "teams_members_history"("users_id");
CREATE INDEX "idx_tm_history_action" ON "teams_members_history"("action");
CREATE INDEX "idx_tm_history_created_at" ON "teams_members_history"("created_at" DESC);
