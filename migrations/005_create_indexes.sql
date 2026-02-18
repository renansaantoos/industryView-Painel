-- =============================================================================
-- INDUSTRYVIEW DATABASE MIGRATION
-- File: 005_create_indexes.sql
-- Description: Indexes for performance optimization
-- Author: DBA Migration Agent
-- Date: 2026-02-05
-- =============================================================================

-- =============================================================================
-- INDEXES FOR: company
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_company_created_at ON company(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_cnpj ON company(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_company_status_payment_id ON company(status_payment_id);
CREATE INDEX IF NOT EXISTS idx_company_deleted_at ON company(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_company_created_at IS 'Index for ordering companies by creation date';
COMMENT ON INDEX idx_company_cnpj IS 'Index for CNPJ lookup (partial - only non-null)';
COMMENT ON INDEX idx_company_status_payment_id IS 'Index for FK to status_payment';
COMMENT ON INDEX idx_company_deleted_at IS 'Partial index for active (non-deleted) companies';

-- =============================================================================
-- INDEXES FOR: users
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name_normalized ON users(name_normalized);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_users_permissions_id ON users(users_permissions_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- GIN index for full-text search on user names (Portuguese)
CREATE INDEX IF NOT EXISTS idx_users_name_search ON users USING GIN (to_tsvector('portuguese', COALESCE(name_normalized, '')));

COMMENT ON INDEX idx_users_email IS 'Index for email lookup (login)';
COMMENT ON INDEX idx_users_name_normalized IS 'Index for name search';
COMMENT ON INDEX idx_users_company_id IS 'Index for FK to company (multi-tenant queries)';
COMMENT ON INDEX idx_users_users_permissions_id IS 'Index for FK to users_permissions';
COMMENT ON INDEX idx_users_created_at IS 'Index for ordering users by creation date';
COMMENT ON INDEX idx_users_deleted_at IS 'Partial index for active users';
COMMENT ON INDEX idx_users_name_search IS 'GIN index for full-text search on user names';

-- =============================================================================
-- INDEXES FOR: projects
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_name_normalized ON projects(name_normalized);
CREATE INDEX IF NOT EXISTS idx_projects_projects_statuses_id ON projects(projects_statuses_id);
CREATE INDEX IF NOT EXISTS idx_projects_projects_works_situations_id ON projects(projects_works_situations_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_registration_number ON projects(registration_number) WHERE registration_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_cnpj ON projects(cnpj) WHERE cnpj IS NOT NULL;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_projects_company_status ON projects(company_id, projects_statuses_id) WHERE deleted_at IS NULL;

-- GIN index for full-text search on project names (Portuguese)
CREATE INDEX IF NOT EXISTS idx_projects_name_search ON projects USING GIN (to_tsvector('portuguese', COALESCE(name_normalized, '')));

COMMENT ON INDEX idx_projects_company_id IS 'Index for FK to company (multi-tenant queries)';
COMMENT ON INDEX idx_projects_name_normalized IS 'Index for project name search';
COMMENT ON INDEX idx_projects_projects_statuses_id IS 'Index for FK to project status';
COMMENT ON INDEX idx_projects_projects_works_situations_id IS 'Index for FK to work situation';
COMMENT ON INDEX idx_projects_created_at IS 'Index for ordering projects by creation date';
COMMENT ON INDEX idx_projects_deleted_at IS 'Partial index for active projects';
COMMENT ON INDEX idx_projects_registration_number IS 'Index for registration number lookup';
COMMENT ON INDEX idx_projects_cnpj IS 'Index for CNPJ lookup';
COMMENT ON INDEX idx_projects_company_status IS 'Composite index for company + status filter';
COMMENT ON INDEX idx_projects_name_search IS 'GIN index for full-text search on project names';

-- =============================================================================
-- INDEXES FOR: projects_users (junction table)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_users_users_id ON projects_users(users_id);
CREATE INDEX IF NOT EXISTS idx_projects_users_projects_id ON projects_users(projects_id);
CREATE INDEX IF NOT EXISTS idx_projects_users_created_at ON projects_users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_users_deleted_at ON projects_users(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_projects_users_users_id IS 'Index for finding projects by user';
COMMENT ON INDEX idx_projects_users_projects_id IS 'Index for finding users by project';
COMMENT ON INDEX idx_projects_users_created_at IS 'Index for ordering by creation date';
COMMENT ON INDEX idx_projects_users_deleted_at IS 'Partial index for active assignments';

-- =============================================================================
-- INDEXES FOR: teams
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_teams_projects_id ON teams(projects_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_deleted_at ON teams(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_teams_projects_id IS 'Index for finding teams by project';
COMMENT ON INDEX idx_teams_created_at IS 'Index for ordering teams by creation date';
COMMENT ON INDEX idx_teams_deleted_at IS 'Partial index for active teams';

-- =============================================================================
-- INDEXES FOR: teams_members and teams_leaders
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_teams_members_teams_id ON teams_members(teams_id);
CREATE INDEX IF NOT EXISTS idx_teams_members_users_id ON teams_members(users_id);
CREATE INDEX IF NOT EXISTS idx_teams_leaders_teams_id ON teams_leaders(teams_id);
CREATE INDEX IF NOT EXISTS idx_teams_leaders_users_id ON teams_leaders(users_id);

COMMENT ON INDEX idx_teams_members_teams_id IS 'Index for finding members by team';
COMMENT ON INDEX idx_teams_members_users_id IS 'Index for finding teams by member';
COMMENT ON INDEX idx_teams_leaders_teams_id IS 'Index for finding leaders by team';
COMMENT ON INDEX idx_teams_leaders_users_id IS 'Index for finding teams by leader';

-- =============================================================================
-- INDEXES FOR: fields, sections, rows (map hierarchy)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_fields_projects_id ON fields(projects_id);
CREATE INDEX IF NOT EXISTS idx_fields_created_at ON fields(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sections_fields_id ON sections(fields_id);
CREATE INDEX IF NOT EXISTS idx_sections_created_at ON sections(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rows_sections_id ON rows(sections_id);
CREATE INDEX IF NOT EXISTS idx_rows_created_at ON rows(created_at DESC);

COMMENT ON INDEX idx_fields_projects_id IS 'Index for finding fields by project';
COMMENT ON INDEX idx_sections_fields_id IS 'Index for finding sections by field';
COMMENT ON INDEX idx_rows_sections_id IS 'Index for finding rows by section';

-- =============================================================================
-- INDEXES FOR: trackers, rows_trackers, rows_stakes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_trackers_trackers_types_id ON trackers(trackers_types_id);
CREATE INDEX IF NOT EXISTS idx_trackers_manufacturers_id ON trackers(manufacturers_id);
CREATE INDEX IF NOT EXISTS idx_trackers_company_id ON trackers(company_id);
CREATE INDEX IF NOT EXISTS idx_trackers_created_at ON trackers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rows_trackers_rows_id ON rows_trackers(rows_id);
CREATE INDEX IF NOT EXISTS idx_rows_trackers_trackers_id ON rows_trackers(trackers_id);
CREATE INDEX IF NOT EXISTS idx_rows_trackers_statuses_id ON rows_trackers(rows_trackers_statuses_id);
CREATE INDEX IF NOT EXISTS idx_rows_trackers_created_at ON rows_trackers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rows_trackers_deleted_at ON rows_trackers(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rows_stakes_rows_trackers_id ON rows_stakes(rows_trackers_id);
CREATE INDEX IF NOT EXISTS idx_rows_stakes_stakes_id ON rows_stakes(stakes_id);
CREATE INDEX IF NOT EXISTS idx_rows_stakes_statuses_id ON rows_stakes(stakes_statuses_id);

COMMENT ON INDEX idx_trackers_trackers_types_id IS 'Index for filtering trackers by type';
COMMENT ON INDEX idx_trackers_manufacturers_id IS 'Index for filtering trackers by manufacturer';
COMMENT ON INDEX idx_trackers_company_id IS 'Index for multi-tenant queries';
COMMENT ON INDEX idx_rows_trackers_rows_id IS 'Index for finding trackers by row';
COMMENT ON INDEX idx_rows_trackers_trackers_id IS 'Index for finding rows by tracker config';
COMMENT ON INDEX idx_rows_stakes_rows_trackers_id IS 'Index for finding stakes by tracker row';

-- =============================================================================
-- INDEXES FOR: sprints, sprints_tasks
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_sprints_projects_id ON sprints(projects_id);
CREATE INDEX IF NOT EXISTS idx_sprints_statuses_id ON sprints(sprints_statuses_id);
CREATE INDEX IF NOT EXISTS idx_sprints_start_date ON sprints(start_date);
CREATE INDEX IF NOT EXISTS idx_sprints_end_date ON sprints(end_date);
CREATE INDEX IF NOT EXISTS idx_sprints_created_at ON sprints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sprints_deleted_at ON sprints(deleted_at) WHERE deleted_at IS NULL;

-- Composite index for active sprints in a project
CREATE INDEX IF NOT EXISTS idx_sprints_project_active ON sprints(projects_id, sprints_statuses_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sprints_tasks_sprints_id ON sprints_tasks(sprints_id);
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_projects_backlogs_id ON sprints_tasks(projects_backlogs_id);
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_subtasks_id ON sprints_tasks(subtasks_id);
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_teams_id ON sprints_tasks(teams_id);
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_statuses_id ON sprints_tasks(sprints_tasks_statuses_id);
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_scheduled_for ON sprints_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_created_at ON sprints_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_deleted_at ON sprints_tasks(deleted_at) WHERE deleted_at IS NULL;

-- Composite index for sprint tasks by sprint and status
CREATE INDEX IF NOT EXISTS idx_sprints_tasks_sprint_status ON sprints_tasks(sprints_id, sprints_tasks_statuses_id) WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_sprints_projects_id IS 'Index for finding sprints by project';
COMMENT ON INDEX idx_sprints_statuses_id IS 'Index for filtering sprints by status';
COMMENT ON INDEX idx_sprints_start_date IS 'Index for date range queries';
COMMENT ON INDEX idx_sprints_end_date IS 'Index for date range queries';
COMMENT ON INDEX idx_sprints_project_active IS 'Composite index for active sprints in project';
COMMENT ON INDEX idx_sprints_tasks_sprints_id IS 'Index for finding tasks by sprint';
COMMENT ON INDEX idx_sprints_tasks_scheduled_for IS 'Index for scheduling queries';
COMMENT ON INDEX idx_sprints_tasks_sprint_status IS 'Composite index for sprint task filtering';

-- =============================================================================
-- INDEXES FOR: projects_backlogs
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_projects_id ON projects_backlogs(projects_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_statuses_id ON projects_backlogs(projects_backlogs_statuses_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_tasks_template_id ON projects_backlogs(tasks_template_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_fields_id ON projects_backlogs(fields_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_sections_id ON projects_backlogs(sections_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_rows_id ON projects_backlogs(rows_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_trackers_id ON projects_backlogs(trackers_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_rows_trackers_id ON projects_backlogs(rows_trackers_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_rows_stakes_id ON projects_backlogs(rows_stakes_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_discipline_id ON projects_backlogs(discipline_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_quality_status_id ON projects_backlogs(quality_status_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_parent_id ON projects_backlogs(projects_backlogs_id);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_created_at ON projects_backlogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_deleted_at ON projects_backlogs(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_sprint_added ON projects_backlogs(sprint_added) WHERE sprint_added = FALSE;

-- Composite index for project backlog filtering
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_project_status ON projects_backlogs(projects_id, projects_backlogs_statuses_id) WHERE deleted_at IS NULL;

-- GIN index for full-text search on backlog descriptions (Portuguese)
CREATE INDEX IF NOT EXISTS idx_projects_backlogs_desc_search ON projects_backlogs USING GIN (to_tsvector('portuguese', COALESCE(description_normalized, '')));

COMMENT ON INDEX idx_projects_backlogs_projects_id IS 'Index for finding backlogs by project';
COMMENT ON INDEX idx_projects_backlogs_statuses_id IS 'Index for filtering by status';
COMMENT ON INDEX idx_projects_backlogs_sprint_added IS 'Partial index for items not yet in sprint';
COMMENT ON INDEX idx_projects_backlogs_project_status IS 'Composite index for project + status filter';
COMMENT ON INDEX idx_projects_backlogs_desc_search IS 'GIN index for full-text search on descriptions';

-- =============================================================================
-- INDEXES FOR: subtasks
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_subtasks_projects_backlogs_id ON subtasks(projects_backlogs_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_statuses_id ON subtasks(subtasks_statuses_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_quality_status_id ON subtasks(quality_status_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_at ON subtasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subtasks_deleted_at ON subtasks(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subtasks_sprint_added ON subtasks(sprint_added) WHERE sprint_added = FALSE;

-- GIN index for full-text search on subtask descriptions (Portuguese)
CREATE INDEX IF NOT EXISTS idx_subtasks_desc_search ON subtasks USING GIN (to_tsvector('portuguese', COALESCE(description_normalized, '')));

COMMENT ON INDEX idx_subtasks_projects_backlogs_id IS 'Index for finding subtasks by backlog item';
COMMENT ON INDEX idx_subtasks_statuses_id IS 'Index for filtering by status';
COMMENT ON INDEX idx_subtasks_sprint_added IS 'Partial index for items not yet in sprint';
COMMENT ON INDEX idx_subtasks_desc_search IS 'GIN index for full-text search on descriptions';

-- =============================================================================
-- INDEXES FOR: schedule, schedule_user
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_schedule_projects_id ON schedule(projects_id);
CREATE INDEX IF NOT EXISTS idx_schedule_teams_id ON schedule(teams_id);
CREATE INDEX IF NOT EXISTS idx_schedule_sprints_id ON schedule(sprints_id);
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedule_daily_report_id ON schedule(daily_report_id);
CREATE INDEX IF NOT EXISTS idx_schedule_created_at ON schedule(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_deleted_at ON schedule(deleted_at) WHERE deleted_at IS NULL;

-- Composite index for schedule queries
CREATE INDEX IF NOT EXISTS idx_schedule_project_date ON schedule(projects_id, schedule_date) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_schedule_user_schedule_id ON schedule_user(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_user_users_id ON schedule_user(users_id);

CREATE INDEX IF NOT EXISTS idx_schedule_sprints_tasks_schedule_id ON schedule_sprints_tasks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_sprints_tasks_sprints_tasks_id ON schedule_sprints_tasks(sprints_tasks_id);

COMMENT ON INDEX idx_schedule_projects_id IS 'Index for finding schedules by project';
COMMENT ON INDEX idx_schedule_date IS 'Index for date-based queries';
COMMENT ON INDEX idx_schedule_project_date IS 'Composite index for project + date queries';
COMMENT ON INDEX idx_schedule_user_schedule_id IS 'Index for finding users by schedule';
COMMENT ON INDEX idx_schedule_user_users_id IS 'Index for finding schedules by user';

-- =============================================================================
-- INDEXES FOR: product_inventory, inventory_logs
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_product_inventory_projects_id ON product_inventory(projects_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_code ON product_inventory(code);
CREATE INDEX IF NOT EXISTS idx_product_inventory_product_normalized ON product_inventory(product_normalized);
CREATE INDEX IF NOT EXISTS idx_product_inventory_equipaments_types_id ON product_inventory(equipaments_types_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_status_inventory_id ON product_inventory(status_inventory_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_manufacturers_id ON product_inventory(manufacturers_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_created_at ON product_inventory(created_at DESC);

-- GIN index for product search
CREATE INDEX IF NOT EXISTS idx_product_inventory_search ON product_inventory USING GIN (to_tsvector('portuguese', COALESCE(product_normalized, '')));

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_inventory_id ON inventory_logs(product_inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_projects_id ON inventory_logs(projects_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_responsible_users_id ON inventory_logs(responsible_users_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at DESC);

COMMENT ON INDEX idx_product_inventory_code IS 'Index for product code lookup';
COMMENT ON INDEX idx_product_inventory_product_normalized IS 'Index for product name search';
COMMENT ON INDEX idx_product_inventory_search IS 'GIN index for full-text product search';
COMMENT ON INDEX idx_inventory_logs_product_inventory_id IS 'Index for finding logs by product';
COMMENT ON INDEX idx_inventory_logs_projects_id IS 'Index for finding logs by project';

-- =============================================================================
-- INDEXES FOR: tasks_template
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_template_company_id ON tasks_template(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_template_equipaments_types_id ON tasks_template(equipaments_types_id);
CREATE INDEX IF NOT EXISTS idx_tasks_template_discipline_id ON tasks_template(discipline_id);
CREATE INDEX IF NOT EXISTS idx_tasks_template_created_at ON tasks_template(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_template_deleted_at ON tasks_template(deleted_at) WHERE deleted_at IS NULL;

-- GIN index for task template search
CREATE INDEX IF NOT EXISTS idx_tasks_template_desc_search ON tasks_template USING GIN (to_tsvector('portuguese', COALESCE(description_normalized, '')));

COMMENT ON INDEX idx_tasks_template_company_id IS 'Index for multi-tenant queries';
COMMENT ON INDEX idx_tasks_template_equipaments_types_id IS 'Index for filtering by equipment type';
COMMENT ON INDEX idx_tasks_template_desc_search IS 'GIN index for full-text search on descriptions';

-- =============================================================================
-- INDEXES FOR: manufacturers, modules, stakes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_manufacturers_equipaments_types_id ON manufacturers(equipaments_types_id);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name_normalized ON manufacturers(name_normalized);
CREATE INDEX IF NOT EXISTS idx_manufacturers_created_at ON manufacturers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_modules_modules_types_id ON modules(modules_types_id);
CREATE INDEX IF NOT EXISTS idx_modules_manufacturers_id ON modules(manufacturers_id);
CREATE INDEX IF NOT EXISTS idx_modules_created_at ON modules(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stakes_trackers_id ON stakes(trackers_id);
CREATE INDEX IF NOT EXISTS idx_stakes_stakes_types_id ON stakes(stakes_types_id);
CREATE INDEX IF NOT EXISTS idx_stakes_created_at ON stakes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stakes_deleted_at ON stakes(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_modules_trackers_modules_id ON modules_trackers(modules_id);
CREATE INDEX IF NOT EXISTS idx_modules_trackers_rows_trackers_id ON modules_trackers(rows_trackers_id);

COMMENT ON INDEX idx_manufacturers_equipaments_types_id IS 'Index for filtering by equipment type';
COMMENT ON INDEX idx_manufacturers_name_normalized IS 'Index for manufacturer name search';
COMMENT ON INDEX idx_modules_modules_types_id IS 'Index for filtering by module type';
COMMENT ON INDEX idx_modules_manufacturers_id IS 'Index for filtering by manufacturer';
COMMENT ON INDEX idx_stakes_trackers_id IS 'Index for finding stakes by tracker';

-- =============================================================================
-- INDEXES FOR: daily_report, sprint_task_change_log, task_comments
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_daily_report_projects_id ON daily_report(projects_id);
CREATE INDEX IF NOT EXISTS idx_daily_report_rdo_date ON daily_report(rdo_date);
CREATE INDEX IF NOT EXISTS idx_daily_report_created_at ON daily_report(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sprint_task_change_log_sprints_tasks_id ON sprint_task_change_log(sprints_tasks_id);
CREATE INDEX IF NOT EXISTS idx_sprint_task_change_log_users_id ON sprint_task_change_log(users_id);
CREATE INDEX IF NOT EXISTS idx_sprint_task_change_log_created_at ON sprint_task_change_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_comments_projects_backlogs_id ON task_comments(projects_backlogs_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_subtasks_id ON task_comments(subtasks_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_user_id ON task_comments(created_user_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON task_comments(created_at DESC);

COMMENT ON INDEX idx_daily_report_projects_id IS 'Index for finding reports by project';
COMMENT ON INDEX idx_daily_report_rdo_date IS 'Index for date-based queries';
COMMENT ON INDEX idx_sprint_task_change_log_sprints_tasks_id IS 'Index for finding changes by task';
COMMENT ON INDEX idx_task_comments_projects_backlogs_id IS 'Index for finding comments by backlog';
COMMENT ON INDEX idx_task_comments_subtasks_id IS 'Index for finding comments by subtask';

-- =============================================================================
-- INDEXES FOR: subscriptions, session
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_company_id ON session(company_id);
CREATE INDEX IF NOT EXISTS idx_session_session_id ON session(session_id);
CREATE INDEX IF NOT EXISTS idx_session_subscriptions_id ON session(subscriptions_id);
CREATE INDEX IF NOT EXISTS idx_session_created_at ON session(created_at DESC);

COMMENT ON INDEX idx_subscriptions_company_id IS 'Index for finding subscriptions by company';
COMMENT ON INDEX idx_subscriptions_stripe_customer_id IS 'Index for Stripe customer lookup';
COMMENT ON INDEX idx_subscriptions_stripe_subscription_id IS 'Index for Stripe subscription lookup';
COMMENT ON INDEX idx_subscriptions_status IS 'Index for filtering by subscription status';
COMMENT ON INDEX idx_session_company_id IS 'Index for finding sessions by company';
COMMENT ON INDEX idx_session_session_id IS 'Index for Stripe session lookup';

-- =============================================================================
-- INDEXES FOR: agent_log_dashboard
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_agent_log_dashboard_user_id ON agent_log_dashboard(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_log_dashboard_created_at ON agent_log_dashboard(created_at DESC);

-- GIN index for JSONB queries on object_answer
CREATE INDEX IF NOT EXISTS idx_agent_log_dashboard_object_answer ON agent_log_dashboard USING GIN (object_answer jsonb_path_ops);

COMMENT ON INDEX idx_agent_log_dashboard_user_id IS 'Index for finding logs by user';
COMMENT ON INDEX idx_agent_log_dashboard_created_at IS 'Index for ordering logs by date';
COMMENT ON INDEX idx_agent_log_dashboard_object_answer IS 'GIN index for JSONB queries';

-- =============================================================================
-- INDEXES FOR: users_permissions
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_permissions_user_id ON users_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_permissions_users_system_access_id ON users_permissions(users_system_access_id);
CREATE INDEX IF NOT EXISTS idx_users_permissions_users_roles_id ON users_permissions(users_roles_id);
CREATE INDEX IF NOT EXISTS idx_users_permissions_users_control_system_id ON users_permissions(users_control_system_id);
CREATE INDEX IF NOT EXISTS idx_users_permissions_created_at ON users_permissions(created_at DESC);

COMMENT ON INDEX idx_users_permissions_user_id IS 'Index for finding permissions by user';
COMMENT ON INDEX idx_users_permissions_users_system_access_id IS 'Index for filtering by system access';
COMMENT ON INDEX idx_users_permissions_users_roles_id IS 'Index for filtering by role';
COMMENT ON INDEX idx_users_permissions_users_control_system_id IS 'Index for filtering by control system';

-- =============================================================================
-- INDEXES FOR: discipline, unity
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_discipline_company_id ON discipline(company_id);
CREATE INDEX IF NOT EXISTS idx_discipline_created_at ON discipline(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_unity_company_id ON unity(company_id);
CREATE INDEX IF NOT EXISTS idx_unity_created_at ON unity(created_at DESC);

COMMENT ON INDEX idx_discipline_company_id IS 'Index for multi-tenant queries';
COMMENT ON INDEX idx_unity_company_id IS 'Index for multi-tenant queries';
