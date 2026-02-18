-- =============================================================================
-- INDUSTRYVIEW DATABASE MIGRATION
-- File: 003_create_dependent_tables.sql
-- Description: Tables with foreign key dependencies (level 1 - direct dependencies)
-- Author: DBA Migration Agent
-- Date: 2026-02-05
-- =============================================================================

-- =============================================================================
-- TABLE: manufacturers
-- Description: Equipment manufacturers
-- Dependencies: equipaments_types
-- =============================================================================
CREATE TABLE IF NOT EXISTS manufacturers (
    id                      BIGSERIAL PRIMARY KEY,
    name                    TEXT,
    name_normalized         TEXT,
    equipaments_types_id    BIGINT REFERENCES equipaments_types(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

COMMENT ON TABLE manufacturers IS 'Equipment manufacturers (e.g., tracker brands, module brands)';
COMMENT ON COLUMN manufacturers.id IS 'Primary key';
COMMENT ON COLUMN manufacturers.name IS 'Manufacturer name';
COMMENT ON COLUMN manufacturers.name_normalized IS 'Normalized name for search';
COMMENT ON COLUMN manufacturers.equipaments_types_id IS 'FK to equipment type this manufacturer produces';
COMMENT ON COLUMN manufacturers.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN manufacturers.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN manufacturers.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_manufacturers_updated_at
    BEFORE UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: users_permissions
-- Description: User permission assignments
-- Dependencies: users_system_access, users_roles, users_control_system
-- Note: Has circular dependency with users - user_id will be added later
-- =============================================================================
CREATE TABLE IF NOT EXISTS users_permissions (
    id                          BIGSERIAL PRIMARY KEY,
    user_id                     BIGINT,  -- FK added after users table creation
    users_system_access_id      BIGINT DEFAULT 3 REFERENCES users_system_access(id) ON DELETE SET NULL,
    users_roles_id              BIGINT DEFAULT 5 REFERENCES users_roles(id) ON DELETE SET NULL,
    users_control_system_id     BIGINT DEFAULT 2 REFERENCES users_control_system(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ,
    deleted_at                  TIMESTAMPTZ
);

COMMENT ON TABLE users_permissions IS 'User permission assignments linking users to roles and access levels';
COMMENT ON COLUMN users_permissions.id IS 'Primary key';
COMMENT ON COLUMN users_permissions.user_id IS 'FK to users table';
COMMENT ON COLUMN users_permissions.users_system_access_id IS 'FK to system access level';
COMMENT ON COLUMN users_permissions.users_roles_id IS 'FK to user role';
COMMENT ON COLUMN users_permissions.users_control_system_id IS 'FK to control system access level';
COMMENT ON COLUMN users_permissions.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users_permissions.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN users_permissions.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_users_permissions_updated_at
    BEFORE UPDATE ON users_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: users
-- Description: System users
-- Dependencies: users_permissions, company
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                      BIGSERIAL PRIMARY KEY,
    name                    TEXT,
    name_normalized         TEXT,
    email                   TEXT UNIQUE,
    phone                   VARCHAR(20),
    password_hash           TEXT,
    profile_picture         TEXT,  -- URL to image
    forget_password_code    INTEGER,
    users_permissions_id    BIGINT REFERENCES users_permissions(id) ON DELETE SET NULL,
    company_id              BIGINT REFERENCES company(id) ON DELETE CASCADE,
    first_login             BOOLEAN DEFAULT TRUE,
    qrcode                  TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

COMMENT ON TABLE users IS 'System users with authentication data';
COMMENT ON COLUMN users.id IS 'Primary key';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.name_normalized IS 'Normalized name for search';
COMMENT ON COLUMN users.email IS 'User email (unique, used for login)';
COMMENT ON COLUMN users.phone IS 'Contact phone number';
COMMENT ON COLUMN users.password_hash IS 'Hashed password (bcrypt/argon2)';
COMMENT ON COLUMN users.profile_picture IS 'URL to profile picture';
COMMENT ON COLUMN users.forget_password_code IS 'Password reset verification code';
COMMENT ON COLUMN users.users_permissions_id IS 'FK to user permissions';
COMMENT ON COLUMN users.company_id IS 'FK to company (multi-tenant)';
COMMENT ON COLUMN users.first_login IS 'Flag indicating first login for onboarding';
COMMENT ON COLUMN users.qrcode IS 'QR code for user identification';
COMMENT ON COLUMN users.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK from users_permissions to users (resolving circular dependency)
ALTER TABLE users_permissions
    ADD CONSTRAINT fk_users_permissions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- =============================================================================
-- TABLE: trackers
-- Description: Solar trackers
-- Dependencies: trackers_types, manufacturers, company
-- =============================================================================
CREATE TABLE IF NOT EXISTS trackers (
    id                  BIGSERIAL PRIMARY KEY,
    stake_quantity      INTEGER NOT NULL DEFAULT 0,
    max_modules         INTEGER NOT NULL DEFAULT 0,
    trackers_types_id   BIGINT REFERENCES trackers_types(id) ON DELETE SET NULL,
    manufacturers_id    BIGINT REFERENCES manufacturers(id) ON DELETE SET NULL,
    company_id          BIGINT REFERENCES company(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE trackers IS 'Solar tracker configurations';
COMMENT ON COLUMN trackers.id IS 'Primary key';
COMMENT ON COLUMN trackers.stake_quantity IS 'Number of stakes per tracker';
COMMENT ON COLUMN trackers.max_modules IS 'Maximum modules per tracker';
COMMENT ON COLUMN trackers.trackers_types_id IS 'FK to tracker type';
COMMENT ON COLUMN trackers.manufacturers_id IS 'FK to manufacturer';
COMMENT ON COLUMN trackers.company_id IS 'FK to company (multi-tenant)';
COMMENT ON COLUMN trackers.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN trackers.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN trackers.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_trackers_updated_at
    BEFORE UPDATE ON trackers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: stakes
-- Description: Stakes/posts for trackers
-- Dependencies: trackers, stakes_types
-- =============================================================================
CREATE TABLE IF NOT EXISTS stakes (
    id                  BIGSERIAL PRIMARY KEY,
    position            TEXT,
    is_motor            BOOLEAN DEFAULT FALSE,
    trackers_id         BIGINT REFERENCES trackers(id) ON DELETE CASCADE,
    stakes_types_id     BIGINT REFERENCES stakes_types(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE stakes IS 'Stakes/posts that support trackers';
COMMENT ON COLUMN stakes.id IS 'Primary key';
COMMENT ON COLUMN stakes.position IS 'Position identifier within tracker';
COMMENT ON COLUMN stakes.is_motor IS 'Flag indicating if stake has motor';
COMMENT ON COLUMN stakes.trackers_id IS 'FK to parent tracker';
COMMENT ON COLUMN stakes.stakes_types_id IS 'FK to stake type';
COMMENT ON COLUMN stakes.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN stakes.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN stakes.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_stakes_updated_at
    BEFORE UPDATE ON stakes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: modules
-- Description: Solar modules/panels
-- Dependencies: modules_types, manufacturers
-- =============================================================================
CREATE TABLE IF NOT EXISTS modules (
    id                      BIGSERIAL PRIMARY KEY,
    voltage                 NUMERIC(10,4),
    current                 NUMERIC(10,4),
    short_circuit_current   NUMERIC(10,4),
    power                   NUMERIC(10,4),
    vco                     NUMERIC(10,4),  -- Open circuit voltage
    im                      NUMERIC(10,4),  -- Maximum current
    vm                      NUMERIC(10,4),  -- Maximum voltage
    modules_types_id        BIGINT REFERENCES modules_types(id) ON DELETE SET NULL,
    manufacturers_id        BIGINT REFERENCES manufacturers(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

COMMENT ON TABLE modules IS 'Solar module/panel specifications';
COMMENT ON COLUMN modules.id IS 'Primary key';
COMMENT ON COLUMN modules.voltage IS 'Nominal voltage (V)';
COMMENT ON COLUMN modules.current IS 'Nominal current (A)';
COMMENT ON COLUMN modules.short_circuit_current IS 'Short circuit current Isc (A)';
COMMENT ON COLUMN modules.power IS 'Power rating (W)';
COMMENT ON COLUMN modules.vco IS 'Open circuit voltage Voc (V)';
COMMENT ON COLUMN modules.im IS 'Maximum power point current Imp (A)';
COMMENT ON COLUMN modules.vm IS 'Maximum power point voltage Vmp (V)';
COMMENT ON COLUMN modules.modules_types_id IS 'FK to module type';
COMMENT ON COLUMN modules.manufacturers_id IS 'FK to manufacturer';
COMMENT ON COLUMN modules.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN modules.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN modules.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: projects
-- Description: Solar installation projects
-- Dependencies: projects_statuses, projects_works_situations, company
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id                              BIGSERIAL PRIMARY KEY,
    registration_number             VARCHAR(50),
    name                            TEXT,
    name_normalized                 TEXT,
    project_creation_date           TIMESTAMPTZ,
    origin_registration             TEXT,
    art                             VARCHAR(50),  -- Technical responsibility annotation
    rrt                             VARCHAR(50),  -- Technical responsibility record
    cib                             VARCHAR(50),  -- Building permit
    real_state_registration         TEXT,
    start_date                      TIMESTAMPTZ,
    permit_number                   VARCHAR(50),
    cnae                            VARCHAR(20),  -- Economic activity code
    situation_date                  TIMESTAMPTZ,
    responsible                     TEXT,
    cep                             VARCHAR(9),
    city                            VARCHAR(100),
    number                          VARCHAR(20),
    state                           CHAR(2),
    country                         VARCHAR(50) DEFAULT 'Brasil',
    street                          TEXT,
    neighbourhood                   VARCHAR(100),
    complement                      TEXT,
    cnpj                            VARCHAR(18),
    completion_percentage           NUMERIC(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    category                        TEXT,
    destination                     TEXT,
    project_work_type               TEXT,
    resulting_work_area             TEXT,
    cno_file                        TEXT,  -- URL to CNO file attachment
    projects_statuses_id            BIGINT REFERENCES projects_statuses(id) ON DELETE SET NULL,
    projects_works_situations_id    BIGINT REFERENCES projects_works_situations(id) ON DELETE SET NULL,
    company_id                      BIGINT REFERENCES company(id) ON DELETE CASCADE,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                      TIMESTAMPTZ
);

COMMENT ON TABLE projects IS 'Solar installation projects';
COMMENT ON COLUMN projects.id IS 'Primary key';
COMMENT ON COLUMN projects.registration_number IS 'Project registration number';
COMMENT ON COLUMN projects.name IS 'Project name';
COMMENT ON COLUMN projects.name_normalized IS 'Normalized name for search';
COMMENT ON COLUMN projects.project_creation_date IS 'Date project was created';
COMMENT ON COLUMN projects.origin_registration IS 'Origin of registration';
COMMENT ON COLUMN projects.art IS 'Technical responsibility annotation (ART)';
COMMENT ON COLUMN projects.rrt IS 'Technical responsibility record (RRT)';
COMMENT ON COLUMN projects.cib IS 'Building permit number (CIB)';
COMMENT ON COLUMN projects.real_state_registration IS 'Real estate registration';
COMMENT ON COLUMN projects.start_date IS 'Project start date';
COMMENT ON COLUMN projects.permit_number IS 'Construction permit number';
COMMENT ON COLUMN projects.cnae IS 'Economic activity code (CNAE)';
COMMENT ON COLUMN projects.situation_date IS 'Date of current situation';
COMMENT ON COLUMN projects.responsible IS 'Responsible person name';
COMMENT ON COLUMN projects.cep IS 'Postal code (CEP)';
COMMENT ON COLUMN projects.city IS 'City name';
COMMENT ON COLUMN projects.number IS 'Street number';
COMMENT ON COLUMN projects.state IS 'State abbreviation';
COMMENT ON COLUMN projects.country IS 'Country name';
COMMENT ON COLUMN projects.street IS 'Street name';
COMMENT ON COLUMN projects.neighbourhood IS 'Neighbourhood name';
COMMENT ON COLUMN projects.complement IS 'Address complement';
COMMENT ON COLUMN projects.cnpj IS 'Company CNPJ for project';
COMMENT ON COLUMN projects.completion_percentage IS 'Project completion percentage (0-100)';
COMMENT ON COLUMN projects.category IS 'Project category';
COMMENT ON COLUMN projects.destination IS 'Project destination/purpose';
COMMENT ON COLUMN projects.project_work_type IS 'Type of construction work';
COMMENT ON COLUMN projects.resulting_work_area IS 'Resulting work area';
COMMENT ON COLUMN projects.cno_file IS 'URL to CNO file attachment';
COMMENT ON COLUMN projects.projects_statuses_id IS 'FK to project status';
COMMENT ON COLUMN projects.projects_works_situations_id IS 'FK to work situation';
COMMENT ON COLUMN projects.company_id IS 'FK to company (multi-tenant)';
COMMENT ON COLUMN projects.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: tasks_template
-- Description: Task templates for backlog creation
-- Dependencies: equipaments_types, unity, company, discipline
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks_template (
    id                          BIGSERIAL PRIMARY KEY,
    description                 TEXT,
    description_normalized      TEXT,
    equipaments_types_id        BIGINT REFERENCES equipaments_types(id) ON DELETE SET NULL,
    weight                      NUMERIC(10,2) DEFAULT 1,
    fixed                       BOOLEAN DEFAULT FALSE,
    is_inspection               BOOLEAN DEFAULT FALSE,
    unity_id                    BIGINT REFERENCES unity(id) ON DELETE SET NULL,
    company_id                  BIGINT REFERENCES company(id) ON DELETE CASCADE,
    discipline_id               BIGINT REFERENCES discipline(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

COMMENT ON TABLE tasks_template IS 'Task templates for creating backlog items';
COMMENT ON COLUMN tasks_template.id IS 'Primary key';
COMMENT ON COLUMN tasks_template.description IS 'Task description';
COMMENT ON COLUMN tasks_template.description_normalized IS 'Normalized description for search';
COMMENT ON COLUMN tasks_template.equipaments_types_id IS 'FK to equipment type this task applies to';
COMMENT ON COLUMN tasks_template.weight IS 'Task weight/effort estimation';
COMMENT ON COLUMN tasks_template.fixed IS 'Flag if task is fixed/mandatory';
COMMENT ON COLUMN tasks_template.is_inspection IS 'Flag if task is an inspection';
COMMENT ON COLUMN tasks_template.unity_id IS 'FK to unit of measurement';
COMMENT ON COLUMN tasks_template.company_id IS 'FK to company (multi-tenant)';
COMMENT ON COLUMN tasks_template.discipline_id IS 'FK to work discipline';
COMMENT ON COLUMN tasks_template.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN tasks_template.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN tasks_template.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_tasks_template_updated_at
    BEFORE UPDATE ON tasks_template
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: subscriptions
-- Description: Company subscriptions (Stripe integration)
-- Dependencies: company
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id                          BIGSERIAL PRIMARY KEY,
    company_id                  BIGINT REFERENCES company(id) ON DELETE CASCADE,
    stripe_customer_id          TEXT,
    stripe_subscription_id      TEXT,
    status                      TEXT,  -- active, canceled, past_due, etc.
    trial_end                   TIMESTAMPTZ,
    current_period_end          TIMESTAMPTZ,
    cancel_at_period_end        BOOLEAN DEFAULT FALSE,
    last_invoice_id             TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ,
    deleted_at                  TIMESTAMPTZ
);

COMMENT ON TABLE subscriptions IS 'Company subscription records (Stripe integration)';
COMMENT ON COLUMN subscriptions.id IS 'Primary key';
COMMENT ON COLUMN subscriptions.company_id IS 'FK to company';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status (active, canceled, etc.)';
COMMENT ON COLUMN subscriptions.trial_end IS 'Trial period end date';
COMMENT ON COLUMN subscriptions.current_period_end IS 'Current billing period end';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Will cancel at period end';
COMMENT ON COLUMN subscriptions.last_invoice_id IS 'Last Stripe invoice ID';
COMMENT ON COLUMN subscriptions.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN subscriptions.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN subscriptions.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: session
-- Description: Payment sessions (Stripe checkout)
-- Dependencies: company, subscriptions
-- =============================================================================
CREATE TABLE IF NOT EXISTS session (
    id                  BIGSERIAL PRIMARY KEY,
    session_id          TEXT,  -- Stripe session ID
    customer_id         TEXT,  -- Stripe customer ID
    amount_subtotal     INTEGER,  -- Amount in cents
    amount_total        INTEGER,  -- Amount in cents
    payment_intent_id   TEXT,
    payment_status      TEXT,
    company_id          BIGINT REFERENCES company(id) ON DELETE CASCADE,
    subscriptions_id    BIGINT REFERENCES subscriptions(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE session IS 'Stripe checkout session records';
COMMENT ON COLUMN session.id IS 'Primary key';
COMMENT ON COLUMN session.session_id IS 'Stripe session ID';
COMMENT ON COLUMN session.customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN session.amount_subtotal IS 'Subtotal amount in cents';
COMMENT ON COLUMN session.amount_total IS 'Total amount in cents';
COMMENT ON COLUMN session.payment_intent_id IS 'Stripe payment intent ID';
COMMENT ON COLUMN session.payment_status IS 'Payment status';
COMMENT ON COLUMN session.company_id IS 'FK to company';
COMMENT ON COLUMN session.subscriptions_id IS 'FK to subscription';
COMMENT ON COLUMN session.created_at IS 'Record creation timestamp';

-- =============================================================================
-- TABLE: fields
-- Description: Fields/areas in tracker map
-- Dependencies: projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS fields (
    id                  BIGSERIAL PRIMARY KEY,
    name                TEXT NOT NULL,
    section_quantity    INTEGER,
    rows_per_section    INTEGER,
    map_texts           JSONB,  -- Map configuration texts
    projects_id         BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE fields IS 'Fields/areas in solar park tracker map';
COMMENT ON COLUMN fields.id IS 'Primary key';
COMMENT ON COLUMN fields.name IS 'Field name';
COMMENT ON COLUMN fields.section_quantity IS 'Number of sections in field';
COMMENT ON COLUMN fields.rows_per_section IS 'Rows per section';
COMMENT ON COLUMN fields.map_texts IS 'JSON configuration for map labels';
COMMENT ON COLUMN fields.projects_id IS 'FK to project';
COMMENT ON COLUMN fields.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN fields.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN fields.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_fields_updated_at
    BEFORE UPDATE ON fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: sections
-- Description: Sections within fields
-- Dependencies: fields
-- =============================================================================
CREATE TABLE IF NOT EXISTS sections (
    id                  BIGSERIAL PRIMARY KEY,
    section_number      INTEGER,
    fields_id           BIGINT REFERENCES fields(id) ON DELETE CASCADE,
    x                   INTEGER,  -- X position on map
    y                   INTEGER,  -- Y position on map
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE sections IS 'Sections within fields in tracker map';
COMMENT ON COLUMN sections.id IS 'Primary key';
COMMENT ON COLUMN sections.section_number IS 'Section number within field';
COMMENT ON COLUMN sections.fields_id IS 'FK to parent field';
COMMENT ON COLUMN sections.x IS 'X coordinate on map';
COMMENT ON COLUMN sections.y IS 'Y coordinate on map';
COMMENT ON COLUMN sections.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN sections.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN sections.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: rows
-- Description: Rows within sections
-- Dependencies: sections
-- =============================================================================
CREATE TABLE IF NOT EXISTS rows (
    id                  BIGSERIAL PRIMARY KEY,
    row_number          INTEGER,
    sections_id         BIGINT REFERENCES sections(id) ON DELETE CASCADE,
    x                   INTEGER,
    y                   INTEGER,
    group_offset_x      INTEGER,  -- Note: renamed from groupOffsetX for snake_case
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE rows IS 'Rows within sections for tracker placement';
COMMENT ON COLUMN rows.id IS 'Primary key';
COMMENT ON COLUMN rows.row_number IS 'Row number within section';
COMMENT ON COLUMN rows.sections_id IS 'FK to parent section';
COMMENT ON COLUMN rows.x IS 'X coordinate';
COMMENT ON COLUMN rows.y IS 'Y coordinate';
COMMENT ON COLUMN rows.group_offset_x IS 'Group offset X for rendering';
COMMENT ON COLUMN rows.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN rows.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN rows.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_rows_updated_at
    BEFORE UPDATE ON rows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: rows_trackers
-- Description: Tracker instances placed in rows
-- Dependencies: rows, trackers, rows_trackers_statuses
-- =============================================================================
CREATE TABLE IF NOT EXISTS rows_trackers (
    id                          BIGSERIAL PRIMARY KEY,
    position                    TEXT,
    row_y                       INTEGER,  -- Note: renamed from rowY
    rows_id                     BIGINT REFERENCES rows(id) ON DELETE CASCADE,
    trackers_id                 BIGINT REFERENCES trackers(id) ON DELETE SET NULL,
    rows_trackers_statuses_id   BIGINT REFERENCES rows_trackers_statuses(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

COMMENT ON TABLE rows_trackers IS 'Tracker instances placed in specific rows';
COMMENT ON COLUMN rows_trackers.id IS 'Primary key';
COMMENT ON COLUMN rows_trackers.position IS 'Position identifier';
COMMENT ON COLUMN rows_trackers.row_y IS 'Y position within row';
COMMENT ON COLUMN rows_trackers.rows_id IS 'FK to parent row';
COMMENT ON COLUMN rows_trackers.trackers_id IS 'FK to tracker configuration';
COMMENT ON COLUMN rows_trackers.rows_trackers_statuses_id IS 'FK to tracker status';
COMMENT ON COLUMN rows_trackers.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN rows_trackers.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN rows_trackers.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_rows_trackers_updated_at
    BEFORE UPDATE ON rows_trackers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: rows_stakes
-- Description: Stake instances in tracker rows
-- Dependencies: rows_trackers, stakes, stakes_statuses
-- =============================================================================
CREATE TABLE IF NOT EXISTS rows_stakes (
    id                      BIGSERIAL PRIMARY KEY,
    position                TEXT,
    rows_trackers_id        BIGINT REFERENCES rows_trackers(id) ON DELETE CASCADE,
    stakes_id               BIGINT NOT NULL REFERENCES stakes(id) ON DELETE RESTRICT,
    stakes_statuses_id      BIGINT REFERENCES stakes_statuses(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ
);

COMMENT ON TABLE rows_stakes IS 'Stake instances placed in tracker rows';
COMMENT ON COLUMN rows_stakes.id IS 'Primary key';
COMMENT ON COLUMN rows_stakes.position IS 'Position identifier';
COMMENT ON COLUMN rows_stakes.rows_trackers_id IS 'FK to parent rows_trackers';
COMMENT ON COLUMN rows_stakes.stakes_id IS 'FK to stake configuration';
COMMENT ON COLUMN rows_stakes.stakes_statuses_id IS 'FK to stake status';
COMMENT ON COLUMN rows_stakes.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN rows_stakes.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN rows_stakes.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_rows_stakes_updated_at
    BEFORE UPDATE ON rows_stakes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: teams
-- Description: Work teams for projects
-- Dependencies: projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS teams (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT,
    projects_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE teams IS 'Work teams assigned to projects';
COMMENT ON COLUMN teams.id IS 'Primary key';
COMMENT ON COLUMN teams.name IS 'Team name';
COMMENT ON COLUMN teams.projects_id IS 'FK to project';
COMMENT ON COLUMN teams.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN teams.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN teams.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: projects_steps
-- Description: Project configuration steps/phases status
-- Dependencies: projects, projects_steps_statuses
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects_steps (
    id                                  BIGSERIAL PRIMARY KEY,
    projects_id                         BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    projects_config_status              BIGINT DEFAULT 2 REFERENCES projects_steps_statuses(id) ON DELETE SET NULL,
    projects_map_config_status          BIGINT DEFAULT 2 REFERENCES projects_steps_statuses(id) ON DELETE SET NULL,
    projects_teams_config_status        BIGINT DEFAULT 3 REFERENCES projects_steps_statuses(id) ON DELETE SET NULL,
    projects_backlog_config_status      BIGINT DEFAULT 3 REFERENCES projects_steps_statuses(id) ON DELETE SET NULL,
    projects_sprint_config_status       BIGINT DEFAULT 4 REFERENCES projects_steps_statuses(id) ON DELETE SET NULL,
    projects_report_config_status       BIGINT DEFAULT 5 REFERENCES projects_steps_statuses(id) ON DELETE SET NULL,
    created_at                          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                          TIMESTAMPTZ
);

COMMENT ON TABLE projects_steps IS 'Project configuration steps and their completion status';
COMMENT ON COLUMN projects_steps.id IS 'Primary key';
COMMENT ON COLUMN projects_steps.projects_id IS 'FK to project';
COMMENT ON COLUMN projects_steps.projects_config_status IS 'FK to status of project config step';
COMMENT ON COLUMN projects_steps.projects_map_config_status IS 'FK to status of map config step';
COMMENT ON COLUMN projects_steps.projects_teams_config_status IS 'FK to status of teams config step';
COMMENT ON COLUMN projects_steps.projects_backlog_config_status IS 'FK to status of backlog config step';
COMMENT ON COLUMN projects_steps.projects_sprint_config_status IS 'FK to status of sprint config step';
COMMENT ON COLUMN projects_steps.projects_report_config_status IS 'FK to status of report config step';
COMMENT ON COLUMN projects_steps.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects_steps.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects_steps.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_steps_updated_at
    BEFORE UPDATE ON projects_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: sprints
-- Description: Sprint planning for projects
-- Dependencies: projects, sprints_statuses
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprints (
    id                      BIGSERIAL PRIMARY KEY,
    title                   TEXT NOT NULL,
    objective               TEXT NOT NULL,
    start_date              TIMESTAMPTZ,
    end_date                TIMESTAMPTZ,
    progress_percentage     NUMERIC(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    projects_id             BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    sprints_statuses_id     BIGINT REFERENCES sprints_statuses(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at              TIMESTAMPTZ
);

COMMENT ON TABLE sprints IS 'Sprint planning records';
COMMENT ON COLUMN sprints.id IS 'Primary key';
COMMENT ON COLUMN sprints.title IS 'Sprint title';
COMMENT ON COLUMN sprints.objective IS 'Sprint objective/goal';
COMMENT ON COLUMN sprints.start_date IS 'Sprint start date';
COMMENT ON COLUMN sprints.end_date IS 'Sprint end date';
COMMENT ON COLUMN sprints.progress_percentage IS 'Sprint progress (0-100)';
COMMENT ON COLUMN sprints.projects_id IS 'FK to project';
COMMENT ON COLUMN sprints.sprints_statuses_id IS 'FK to sprint status';
COMMENT ON COLUMN sprints.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN sprints.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN sprints.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_sprints_updated_at
    BEFORE UPDATE ON sprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: daily_report
-- Description: Daily work reports (RDO - Relatorio Diario de Obra)
-- Dependencies: projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_report (
    id              BIGSERIAL PRIMARY KEY,
    projects_id     BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    rdo_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE daily_report IS 'Daily work reports (RDO - Relatorio Diario de Obra)';
COMMENT ON COLUMN daily_report.id IS 'Primary key';
COMMENT ON COLUMN daily_report.projects_id IS 'FK to project';
COMMENT ON COLUMN daily_report.rdo_date IS 'Report date';
COMMENT ON COLUMN daily_report.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN daily_report.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN daily_report.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_daily_report_updated_at
    BEFORE UPDATE ON daily_report
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: product_inventory
-- Description: Product inventory for projects
-- Dependencies: unity, status_inventory, equipaments_types, manufacturers, projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_inventory (
    id                          BIGSERIAL PRIMARY KEY,
    code                        VARCHAR(50),
    product                     TEXT,
    product_normalized          TEXT,
    specifications              TEXT,
    inventory_quantity          INTEGER DEFAULT 0,
    min_quantity                INTEGER DEFAULT 0,
    sequential_per_category     INTEGER,
    unity_id                    BIGINT REFERENCES unity(id) ON DELETE SET NULL,
    status_inventory_id         BIGINT REFERENCES status_inventory(id) ON DELETE SET NULL,
    equipaments_types_id        BIGINT REFERENCES equipaments_types(id) ON DELETE SET NULL,
    manufacturers_id            BIGINT REFERENCES manufacturers(id) ON DELETE SET NULL,
    projects_id                 BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ,
    deleted_at                  TIMESTAMPTZ
);

COMMENT ON TABLE product_inventory IS 'Product inventory management';
COMMENT ON COLUMN product_inventory.id IS 'Primary key';
COMMENT ON COLUMN product_inventory.code IS 'Product code';
COMMENT ON COLUMN product_inventory.product IS 'Product name';
COMMENT ON COLUMN product_inventory.product_normalized IS 'Normalized name for search';
COMMENT ON COLUMN product_inventory.specifications IS 'Product specifications';
COMMENT ON COLUMN product_inventory.inventory_quantity IS 'Current inventory quantity';
COMMENT ON COLUMN product_inventory.min_quantity IS 'Minimum quantity alert threshold';
COMMENT ON COLUMN product_inventory.sequential_per_category IS 'Sequential number per category';
COMMENT ON COLUMN product_inventory.unity_id IS 'FK to unit of measurement';
COMMENT ON COLUMN product_inventory.status_inventory_id IS 'FK to inventory status';
COMMENT ON COLUMN product_inventory.equipaments_types_id IS 'FK to equipment type';
COMMENT ON COLUMN product_inventory.manufacturers_id IS 'FK to manufacturer';
COMMENT ON COLUMN product_inventory.projects_id IS 'FK to project';
COMMENT ON COLUMN product_inventory.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN product_inventory.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN product_inventory.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_product_inventory_updated_at
    BEFORE UPDATE ON product_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: agent_log_dashboard
-- Description: AI agent interaction logs
-- Dependencies: None (user_id is not FK to avoid coupling)
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_log_dashboard (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         BIGINT NOT NULL,
    question        TEXT NOT NULL,
    response        TEXT NOT NULL,
    intent_data     TEXT,
    object_answer   JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE agent_log_dashboard IS 'AI agent interaction logs for dashboard queries';
COMMENT ON COLUMN agent_log_dashboard.id IS 'Primary key (UUID)';
COMMENT ON COLUMN agent_log_dashboard.user_id IS 'User who made the query';
COMMENT ON COLUMN agent_log_dashboard.question IS 'User question/prompt';
COMMENT ON COLUMN agent_log_dashboard.response IS 'Agent response text';
COMMENT ON COLUMN agent_log_dashboard.intent_data IS 'Detected intent data';
COMMENT ON COLUMN agent_log_dashboard.object_answer IS 'Structured response object';
COMMENT ON COLUMN agent_log_dashboard.created_at IS 'Record creation timestamp';
