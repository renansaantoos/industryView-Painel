-- =============================================================================
-- INDUSTRYVIEW DATABASE MIGRATION
-- File: 004_create_junction_tables.sql
-- Description: Junction tables and tables with complex dependencies
-- Author: DBA Migration Agent
-- Date: 2026-02-05
-- =============================================================================

-- =============================================================================
-- TABLE: projects_users
-- Description: Junction table for users assigned to projects (N:N)
-- Dependencies: users, projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects_users (
    id              BIGSERIAL PRIMARY KEY,
    users_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    projects_id     BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(users_id, projects_id)
);

COMMENT ON TABLE projects_users IS 'Junction table linking users to projects (many-to-many)';
COMMENT ON COLUMN projects_users.id IS 'Primary key';
COMMENT ON COLUMN projects_users.users_id IS 'FK to user';
COMMENT ON COLUMN projects_users.projects_id IS 'FK to project';
COMMENT ON COLUMN projects_users.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects_users.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects_users.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_users_updated_at
    BEFORE UPDATE ON projects_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: teams_leaders
-- Description: Junction table for team leaders (N:N between users and teams)
-- Dependencies: users, teams
-- =============================================================================
CREATE TABLE IF NOT EXISTS teams_leaders (
    id              BIGSERIAL PRIMARY KEY,
    users_id        BIGINT REFERENCES users(id) ON DELETE CASCADE,
    teams_id        BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(users_id, teams_id)
);

COMMENT ON TABLE teams_leaders IS 'Junction table linking team leaders to teams';
COMMENT ON COLUMN teams_leaders.id IS 'Primary key';
COMMENT ON COLUMN teams_leaders.users_id IS 'FK to user (leader)';
COMMENT ON COLUMN teams_leaders.teams_id IS 'FK to team';
COMMENT ON COLUMN teams_leaders.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN teams_leaders.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN teams_leaders.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_teams_leaders_updated_at
    BEFORE UPDATE ON teams_leaders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: teams_members
-- Description: Junction table for team members (N:N between users and teams)
-- Dependencies: users, teams
-- =============================================================================
CREATE TABLE IF NOT EXISTS teams_members (
    id              BIGSERIAL PRIMARY KEY,
    users_id        BIGINT REFERENCES users(id) ON DELETE CASCADE,
    teams_id        BIGINT REFERENCES teams(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(users_id, teams_id)
);

COMMENT ON TABLE teams_members IS 'Junction table linking team members to teams';
COMMENT ON COLUMN teams_members.id IS 'Primary key';
COMMENT ON COLUMN teams_members.users_id IS 'FK to user (member)';
COMMENT ON COLUMN teams_members.teams_id IS 'FK to team';
COMMENT ON COLUMN teams_members.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN teams_members.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN teams_members.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_teams_members_updated_at
    BEFORE UPDATE ON teams_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: modules_trackers
-- Description: Junction table for modules on tracker rows
-- Dependencies: modules, rows_trackers
-- =============================================================================
CREATE TABLE IF NOT EXISTS modules_trackers (
    id                  BIGSERIAL PRIMARY KEY,
    modules_id          BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    rows_trackers_id    BIGINT REFERENCES rows_trackers(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE modules_trackers IS 'Junction table linking modules to tracker rows';
COMMENT ON COLUMN modules_trackers.id IS 'Primary key';
COMMENT ON COLUMN modules_trackers.modules_id IS 'FK to module';
COMMENT ON COLUMN modules_trackers.rows_trackers_id IS 'FK to rows_trackers';
COMMENT ON COLUMN modules_trackers.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN modules_trackers.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN modules_trackers.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_modules_trackers_updated_at
    BEFORE UPDATE ON modules_trackers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: projects_backlogs
-- Description: Project backlog items (tasks to be done)
-- Dependencies: projects, tasks_template, projects_backlogs_statuses, fields,
--               sections, rows, trackers, rows_trackers, rows_stakes,
--               discipline, equipaments_types, unity, quality_status, subtasks
-- Note: Has self-reference (projects_backlogs_id) and forward reference to subtasks
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects_backlogs (
    id                              BIGSERIAL PRIMARY KEY,
    projects_id                     BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tasks_template_id               BIGINT REFERENCES tasks_template(id) ON DELETE SET NULL,
    projects_backlogs_statuses_id   BIGINT DEFAULT 1 REFERENCES projects_backlogs_statuses(id) ON DELETE SET NULL,
    fields_id                       BIGINT REFERENCES fields(id) ON DELETE SET NULL,
    sections_id                     BIGINT REFERENCES sections(id) ON DELETE SET NULL,
    rows_id                         BIGINT REFERENCES rows(id) ON DELETE SET NULL,
    trackers_id                     BIGINT REFERENCES trackers(id) ON DELETE SET NULL,
    rows_trackers_id                BIGINT REFERENCES rows_trackers(id) ON DELETE SET NULL,
    rows_stakes_id                  BIGINT REFERENCES rows_stakes(id) ON DELETE SET NULL,
    discipline_id                   BIGINT REFERENCES discipline(id) ON DELETE SET NULL,
    equipaments_types_id            BIGINT REFERENCES equipaments_types(id) ON DELETE SET NULL,
    unity_id                        BIGINT REFERENCES unity(id) ON DELETE SET NULL,
    quality_status_id               BIGINT DEFAULT 1 REFERENCES quality_status(id) ON DELETE SET NULL,
    projects_backlogs_id            BIGINT REFERENCES projects_backlogs(id) ON DELETE SET NULL,  -- Self-reference for parent backlog
    subtasks_id                     BIGINT,  -- FK added after subtasks table
    description                     TEXT,
    description_normalized          TEXT,
    weight                          NUMERIC(10,2),
    quantity                        NUMERIC(10,2) DEFAULT 1,
    quantity_done                   NUMERIC(10,2),
    sprint_added                    BOOLEAN DEFAULT FALSE,
    is_inspection                   BOOLEAN DEFAULT FALSE,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                      TIMESTAMPTZ
);

COMMENT ON TABLE projects_backlogs IS 'Project backlog items (work items/tasks)';
COMMENT ON COLUMN projects_backlogs.id IS 'Primary key';
COMMENT ON COLUMN projects_backlogs.projects_id IS 'FK to project';
COMMENT ON COLUMN projects_backlogs.tasks_template_id IS 'FK to task template';
COMMENT ON COLUMN projects_backlogs.projects_backlogs_statuses_id IS 'FK to backlog status';
COMMENT ON COLUMN projects_backlogs.fields_id IS 'FK to field (location)';
COMMENT ON COLUMN projects_backlogs.sections_id IS 'FK to section (location)';
COMMENT ON COLUMN projects_backlogs.rows_id IS 'FK to row (location)';
COMMENT ON COLUMN projects_backlogs.trackers_id IS 'FK to tracker';
COMMENT ON COLUMN projects_backlogs.rows_trackers_id IS 'FK to rows_trackers';
COMMENT ON COLUMN projects_backlogs.rows_stakes_id IS 'FK to rows_stakes';
COMMENT ON COLUMN projects_backlogs.discipline_id IS 'FK to work discipline';
COMMENT ON COLUMN projects_backlogs.equipaments_types_id IS 'FK to equipment type';
COMMENT ON COLUMN projects_backlogs.unity_id IS 'FK to unit of measurement';
COMMENT ON COLUMN projects_backlogs.quality_status_id IS 'FK to quality status';
COMMENT ON COLUMN projects_backlogs.projects_backlogs_id IS 'FK to parent backlog item (self-reference)';
COMMENT ON COLUMN projects_backlogs.subtasks_id IS 'FK to subtask';
COMMENT ON COLUMN projects_backlogs.description IS 'Task description';
COMMENT ON COLUMN projects_backlogs.description_normalized IS 'Normalized description for search';
COMMENT ON COLUMN projects_backlogs.weight IS 'Task weight/effort';
COMMENT ON COLUMN projects_backlogs.quantity IS 'Quantity to complete';
COMMENT ON COLUMN projects_backlogs.quantity_done IS 'Quantity completed';
COMMENT ON COLUMN projects_backlogs.sprint_added IS 'Flag if added to sprint';
COMMENT ON COLUMN projects_backlogs.is_inspection IS 'Flag if task is inspection';
COMMENT ON COLUMN projects_backlogs.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects_backlogs.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects_backlogs.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_backlogs_updated_at
    BEFORE UPDATE ON projects_backlogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: subtasks
-- Description: Subtasks for backlog items
-- Dependencies: projects_backlogs, unity, subtasks_statuses, quality_status
-- =============================================================================
CREATE TABLE IF NOT EXISTS subtasks (
    id                          BIGSERIAL PRIMARY KEY,
    projects_backlogs_id        BIGINT REFERENCES projects_backlogs(id) ON DELETE CASCADE,
    description                 TEXT,
    description_normalized      TEXT,
    weight                      NUMERIC(10,2) DEFAULT 1,
    fixed                       BOOLEAN DEFAULT FALSE,
    is_inspection               BOOLEAN DEFAULT FALSE,
    unity_id                    BIGINT REFERENCES unity(id) ON DELETE SET NULL,
    quantity                    NUMERIC(10,2),
    quantity_done               NUMERIC(10,2),
    subtasks_statuses_id        BIGINT DEFAULT 1 REFERENCES subtasks_statuses(id) ON DELETE SET NULL,
    quality_status_id           BIGINT DEFAULT 1 REFERENCES quality_status(id) ON DELETE SET NULL,
    sprint_added                BOOLEAN DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

COMMENT ON TABLE subtasks IS 'Subtasks within backlog items';
COMMENT ON COLUMN subtasks.id IS 'Primary key';
COMMENT ON COLUMN subtasks.projects_backlogs_id IS 'FK to parent backlog item';
COMMENT ON COLUMN subtasks.description IS 'Subtask description';
COMMENT ON COLUMN subtasks.description_normalized IS 'Normalized description for search';
COMMENT ON COLUMN subtasks.weight IS 'Subtask weight/effort';
COMMENT ON COLUMN subtasks.fixed IS 'Flag if subtask is fixed/mandatory';
COMMENT ON COLUMN subtasks.is_inspection IS 'Flag if subtask is inspection';
COMMENT ON COLUMN subtasks.unity_id IS 'FK to unit of measurement';
COMMENT ON COLUMN subtasks.quantity IS 'Quantity to complete';
COMMENT ON COLUMN subtasks.quantity_done IS 'Quantity completed';
COMMENT ON COLUMN subtasks.subtasks_statuses_id IS 'FK to subtask status';
COMMENT ON COLUMN subtasks.quality_status_id IS 'FK to quality status';
COMMENT ON COLUMN subtasks.sprint_added IS 'Flag if added to sprint';
COMMENT ON COLUMN subtasks.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN subtasks.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN subtasks.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_subtasks_updated_at
    BEFORE UPDATE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK from projects_backlogs to subtasks (resolving circular dependency)
ALTER TABLE projects_backlogs
    ADD CONSTRAINT fk_projects_backlogs_subtasks
    FOREIGN KEY (subtasks_id) REFERENCES subtasks(id) ON DELETE SET NULL;

-- =============================================================================
-- TABLE: sprints_tasks
-- Description: Tasks assigned to sprints
-- Dependencies: projects_backlogs, subtasks, sprints, teams, sprints_tasks_statuses
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprints_tasks (
    id                          BIGSERIAL PRIMARY KEY,
    projects_backlogs_id        BIGINT REFERENCES projects_backlogs(id) ON DELETE CASCADE,
    subtasks_id                 BIGINT REFERENCES subtasks(id) ON DELETE CASCADE,
    sprints_id                  BIGINT REFERENCES sprints(id) ON DELETE CASCADE,
    teams_id                    BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    sprints_tasks_statuses_id   BIGINT REFERENCES sprints_tasks_statuses(id) ON DELETE SET NULL,
    scheduled_for               DATE,
    executed_at                 DATE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

COMMENT ON TABLE sprints_tasks IS 'Tasks assigned to sprints';
COMMENT ON COLUMN sprints_tasks.id IS 'Primary key';
COMMENT ON COLUMN sprints_tasks.projects_backlogs_id IS 'FK to backlog item';
COMMENT ON COLUMN sprints_tasks.subtasks_id IS 'FK to subtask';
COMMENT ON COLUMN sprints_tasks.sprints_id IS 'FK to sprint';
COMMENT ON COLUMN sprints_tasks.teams_id IS 'FK to team assigned';
COMMENT ON COLUMN sprints_tasks.sprints_tasks_statuses_id IS 'FK to task status';
COMMENT ON COLUMN sprints_tasks.scheduled_for IS 'Scheduled execution date';
COMMENT ON COLUMN sprints_tasks.executed_at IS 'Actual execution date';
COMMENT ON COLUMN sprints_tasks.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN sprints_tasks.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN sprints_tasks.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_sprints_tasks_updated_at
    BEFORE UPDATE ON sprints_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: schedule
-- Description: Work schedules
-- Dependencies: teams, projects, sprints, daily_report
-- Note: sprints_tasks_id is stored as array in Xano - creating junction table instead
-- =============================================================================
CREATE TABLE IF NOT EXISTS schedule (
    id                  BIGSERIAL PRIMARY KEY,
    teams_id            BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    projects_id         BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    sprints_id          BIGINT REFERENCES sprints(id) ON DELETE SET NULL,
    daily_report_id     BIGINT REFERENCES daily_report(id) ON DELETE SET NULL,
    schedule_date       DATE,
    images              TEXT[],  -- Array of image URLs
    end_service         BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE schedule IS 'Work schedules for teams';
COMMENT ON COLUMN schedule.id IS 'Primary key';
COMMENT ON COLUMN schedule.teams_id IS 'FK to team';
COMMENT ON COLUMN schedule.projects_id IS 'FK to project';
COMMENT ON COLUMN schedule.sprints_id IS 'FK to sprint';
COMMENT ON COLUMN schedule.daily_report_id IS 'FK to daily report';
COMMENT ON COLUMN schedule.schedule_date IS 'Scheduled date';
COMMENT ON COLUMN schedule.images IS 'Array of image URLs';
COMMENT ON COLUMN schedule.end_service IS 'Flag if service ended';
COMMENT ON COLUMN schedule.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN schedule.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN schedule.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_schedule_updated_at
    BEFORE UPDATE ON schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: schedule_sprints_tasks
-- Description: Junction table for schedule and sprint tasks (replacing array)
-- Dependencies: schedule, sprints_tasks
-- =============================================================================
CREATE TABLE IF NOT EXISTS schedule_sprints_tasks (
    id                  BIGSERIAL PRIMARY KEY,
    schedule_id         BIGINT NOT NULL REFERENCES schedule(id) ON DELETE CASCADE,
    sprints_tasks_id    BIGINT NOT NULL REFERENCES sprints_tasks(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(schedule_id, sprints_tasks_id)
);

COMMENT ON TABLE schedule_sprints_tasks IS 'Junction table linking schedules to sprint tasks';
COMMENT ON COLUMN schedule_sprints_tasks.id IS 'Primary key';
COMMENT ON COLUMN schedule_sprints_tasks.schedule_id IS 'FK to schedule';
COMMENT ON COLUMN schedule_sprints_tasks.sprints_tasks_id IS 'FK to sprint task';
COMMENT ON COLUMN schedule_sprints_tasks.created_at IS 'Record creation timestamp';

-- =============================================================================
-- TABLE: schedule_user
-- Description: Junction table for users assigned to schedules
-- Dependencies: schedule, users
-- =============================================================================
CREATE TABLE IF NOT EXISTS schedule_user (
    id              BIGSERIAL PRIMARY KEY,
    schedule_id     BIGINT REFERENCES schedule(id) ON DELETE CASCADE,
    users_id        BIGINT REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    UNIQUE(schedule_id, users_id)
);

COMMENT ON TABLE schedule_user IS 'Junction table linking users to schedules';
COMMENT ON COLUMN schedule_user.id IS 'Primary key';
COMMENT ON COLUMN schedule_user.schedule_id IS 'FK to schedule';
COMMENT ON COLUMN schedule_user.users_id IS 'FK to user';
COMMENT ON COLUMN schedule_user.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN schedule_user.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN schedule_user.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_schedule_user_updated_at
    BEFORE UPDATE ON schedule_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: sprint_task_change_log
-- Description: Audit log for sprint task changes
-- Dependencies: sprints_tasks, users
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprint_task_change_log (
    id                  BIGSERIAL PRIMARY KEY,
    sprints_tasks_id    BIGINT REFERENCES sprints_tasks(id) ON DELETE CASCADE,
    users_id            BIGINT REFERENCES users(id) ON DELETE SET NULL,
    changed_field       TEXT,
    old_value           TEXT,
    new_value           TEXT,
    date                DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sprint_task_change_log IS 'Audit log for sprint task changes';
COMMENT ON COLUMN sprint_task_change_log.id IS 'Primary key';
COMMENT ON COLUMN sprint_task_change_log.sprints_tasks_id IS 'FK to sprint task';
COMMENT ON COLUMN sprint_task_change_log.users_id IS 'FK to user who made change';
COMMENT ON COLUMN sprint_task_change_log.changed_field IS 'Name of changed field';
COMMENT ON COLUMN sprint_task_change_log.old_value IS 'Previous value';
COMMENT ON COLUMN sprint_task_change_log.new_value IS 'New value';
COMMENT ON COLUMN sprint_task_change_log.date IS 'Date of change';
COMMENT ON COLUMN sprint_task_change_log.created_at IS 'Record creation timestamp';

-- =============================================================================
-- TABLE: task_comments
-- Description: Comments on tasks
-- Dependencies: projects_backlogs, subtasks, users
-- =============================================================================
CREATE TABLE IF NOT EXISTS task_comments (
    id                      BIGSERIAL PRIMARY KEY,
    comment                 TEXT,
    projects_backlogs_id    BIGINT REFERENCES projects_backlogs(id) ON DELETE CASCADE,
    subtasks_id             BIGINT REFERENCES subtasks(id) ON DELETE CASCADE,
    created_user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ
);

COMMENT ON TABLE task_comments IS 'Comments on backlog items and subtasks';
COMMENT ON COLUMN task_comments.id IS 'Primary key';
COMMENT ON COLUMN task_comments.comment IS 'Comment text';
COMMENT ON COLUMN task_comments.projects_backlogs_id IS 'FK to backlog item';
COMMENT ON COLUMN task_comments.subtasks_id IS 'FK to subtask';
COMMENT ON COLUMN task_comments.created_user_id IS 'FK to user who created comment';
COMMENT ON COLUMN task_comments.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN task_comments.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN task_comments.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: inventory_logs
-- Description: Inventory movement logs
-- Dependencies: users, product_inventory, projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS inventory_logs (
    id                      BIGSERIAL PRIMARY KEY,
    code                    VARCHAR(50),
    quantity                INTEGER,
    type                    BOOLEAN,  -- true = entry, false = exit (original Xano design)
    observations            TEXT,
    responsible_users_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    received_user           BIGINT REFERENCES users(id) ON DELETE SET NULL,
    product_inventory_id    BIGINT REFERENCES product_inventory(id) ON DELETE CASCADE,
    projects_id             BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ
);

COMMENT ON TABLE inventory_logs IS 'Inventory movement logs (entries and exits)';
COMMENT ON COLUMN inventory_logs.id IS 'Primary key';
COMMENT ON COLUMN inventory_logs.code IS 'Movement code';
COMMENT ON COLUMN inventory_logs.quantity IS 'Quantity moved';
COMMENT ON COLUMN inventory_logs.type IS 'Movement type: true = entry, false = exit';
COMMENT ON COLUMN inventory_logs.observations IS 'Movement observations';
COMMENT ON COLUMN inventory_logs.responsible_users_id IS 'FK to responsible user';
COMMENT ON COLUMN inventory_logs.received_user IS 'FK to user who received';
COMMENT ON COLUMN inventory_logs.product_inventory_id IS 'FK to product';
COMMENT ON COLUMN inventory_logs.projects_id IS 'FK to project';
COMMENT ON COLUMN inventory_logs.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN inventory_logs.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN inventory_logs.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_inventory_logs_updated_at
    BEFORE UPDATE ON inventory_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
