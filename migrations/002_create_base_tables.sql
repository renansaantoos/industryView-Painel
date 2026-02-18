-- =============================================================================
-- INDUSTRYVIEW DATABASE MIGRATION
-- File: 002_create_base_tables.sql
-- Description: Base tables without foreign key dependencies (lookup/status tables)
-- Author: DBA Migration Agent
-- Date: 2026-02-05
-- =============================================================================

-- =============================================================================
-- TABLE: status_payment
-- Description: Payment status lookup table for companies
-- =============================================================================
CREATE TABLE IF NOT EXISTS status_payment (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE status_payment IS 'Lookup table for payment statuses';
COMMENT ON COLUMN status_payment.id IS 'Primary key';
COMMENT ON COLUMN status_payment.name IS 'Payment status name (e.g., pending, paid, overdue)';
COMMENT ON COLUMN status_payment.created_at IS 'Record creation timestamp';

-- =============================================================================
-- TABLE: company
-- Description: Companies/organizations using the system (multi-tenant)
-- =============================================================================
CREATE TABLE IF NOT EXISTS company (
    id                  BIGSERIAL PRIMARY KEY,
    brand_name          TEXT,
    legal_name          TEXT,
    cnpj                VARCHAR(18),
    phone               VARCHAR(20),
    email               TEXT,
    cep                 VARCHAR(9),
    numero              VARCHAR(20),
    address_line        TEXT,
    address_line2       TEXT,
    city                VARCHAR(100),
    state               CHAR(2),
    status_payment_id   BIGINT REFERENCES status_payment(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE company IS 'Companies/organizations registered in the system for multi-tenancy';
COMMENT ON COLUMN company.id IS 'Primary key';
COMMENT ON COLUMN company.brand_name IS 'Trade/brand name of the company';
COMMENT ON COLUMN company.legal_name IS 'Legal/registered name of the company';
COMMENT ON COLUMN company.cnpj IS 'Brazilian company registration number (CNPJ)';
COMMENT ON COLUMN company.phone IS 'Contact phone number';
COMMENT ON COLUMN company.email IS 'Contact email address';
COMMENT ON COLUMN company.cep IS 'Brazilian postal code (CEP)';
COMMENT ON COLUMN company.numero IS 'Street number';
COMMENT ON COLUMN company.address_line IS 'Primary address line';
COMMENT ON COLUMN company.address_line2 IS 'Secondary address line (complement)';
COMMENT ON COLUMN company.city IS 'City name';
COMMENT ON COLUMN company.state IS 'State abbreviation (2 chars, e.g., SP, RJ)';
COMMENT ON COLUMN company.status_payment_id IS 'FK to payment status';
COMMENT ON COLUMN company.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN company.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN company.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_company_updated_at
    BEFORE UPDATE ON company
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: equipaments_types
-- Description: Types of equipment in solar installations
-- =============================================================================
CREATE TABLE IF NOT EXISTS equipaments_types (
    id              BIGSERIAL PRIMARY KEY,
    type            TEXT,
    code            VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE equipaments_types IS 'Equipment type categories (trackers, modules, etc.)';
COMMENT ON COLUMN equipaments_types.id IS 'Primary key';
COMMENT ON COLUMN equipaments_types.type IS 'Equipment type name';
COMMENT ON COLUMN equipaments_types.code IS 'Equipment type code for classification';
COMMENT ON COLUMN equipaments_types.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN equipaments_types.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN equipaments_types.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_equipaments_types_updated_at
    BEFORE UPDATE ON equipaments_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: modules_types
-- Description: Types of solar modules
-- =============================================================================
CREATE TABLE IF NOT EXISTS modules_types (
    id                  BIGSERIAL PRIMARY KEY,
    type                TEXT NOT NULL,
    type_normalized     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE modules_types IS 'Solar module type classifications';
COMMENT ON COLUMN modules_types.id IS 'Primary key';
COMMENT ON COLUMN modules_types.type IS 'Module type name';
COMMENT ON COLUMN modules_types.type_normalized IS 'Normalized type name for search';
COMMENT ON COLUMN modules_types.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN modules_types.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN modules_types.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_modules_types_updated_at
    BEFORE UPDATE ON modules_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: trackers_types
-- Description: Types of solar trackers
-- =============================================================================
CREATE TABLE IF NOT EXISTS trackers_types (
    id                  BIGSERIAL PRIMARY KEY,
    type                TEXT NOT NULL,
    type_normalized     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE trackers_types IS 'Solar tracker type classifications';
COMMENT ON COLUMN trackers_types.id IS 'Primary key';
COMMENT ON COLUMN trackers_types.type IS 'Tracker type name';
COMMENT ON COLUMN trackers_types.type_normalized IS 'Normalized type name for search';
COMMENT ON COLUMN trackers_types.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN trackers_types.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN trackers_types.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_trackers_types_updated_at
    BEFORE UPDATE ON trackers_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: stakes_types
-- Description: Types of stakes/posts for trackers
-- =============================================================================
CREATE TABLE IF NOT EXISTS stakes_types (
    id              BIGSERIAL PRIMARY KEY,
    type            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE stakes_types IS 'Stake/post type classifications for tracker mounting';
COMMENT ON COLUMN stakes_types.id IS 'Primary key';
COMMENT ON COLUMN stakes_types.type IS 'Stake type name';
COMMENT ON COLUMN stakes_types.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN stakes_types.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN stakes_types.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_stakes_types_updated_at
    BEFORE UPDATE ON stakes_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: stakes_statuses
-- Description: Status options for stakes
-- =============================================================================
CREATE TABLE IF NOT EXISTS stakes_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE stakes_statuses IS 'Status lookup for stakes (installed, pending, etc.)';
COMMENT ON COLUMN stakes_statuses.id IS 'Primary key';
COMMENT ON COLUMN stakes_statuses.status IS 'Status name';
COMMENT ON COLUMN stakes_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN stakes_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN stakes_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_stakes_statuses_updated_at
    BEFORE UPDATE ON stakes_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: rows_trackers_statuses
-- Description: Status options for tracker rows
-- =============================================================================
CREATE TABLE IF NOT EXISTS rows_trackers_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE rows_trackers_statuses IS 'Status lookup for tracker rows';
COMMENT ON COLUMN rows_trackers_statuses.id IS 'Primary key';
COMMENT ON COLUMN rows_trackers_statuses.status IS 'Status name';
COMMENT ON COLUMN rows_trackers_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN rows_trackers_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN rows_trackers_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_rows_trackers_statuses_updated_at
    BEFORE UPDATE ON rows_trackers_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: projects_statuses
-- Description: Status options for projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE projects_statuses IS 'Project status lookup (active, completed, etc.)';
COMMENT ON COLUMN projects_statuses.id IS 'Primary key';
COMMENT ON COLUMN projects_statuses.status IS 'Status name';
COMMENT ON COLUMN projects_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_statuses_updated_at
    BEFORE UPDATE ON projects_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: projects_works_situations
-- Description: Work situation status for projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects_works_situations (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE projects_works_situations IS 'Work situation status lookup for construction projects';
COMMENT ON COLUMN projects_works_situations.id IS 'Primary key';
COMMENT ON COLUMN projects_works_situations.status IS 'Situation status name';
COMMENT ON COLUMN projects_works_situations.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects_works_situations.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects_works_situations.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_works_situations_updated_at
    BEFORE UPDATE ON projects_works_situations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: projects_steps_statuses
-- Description: Status options for project steps/phases
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects_steps_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE projects_steps_statuses IS 'Status lookup for project configuration steps';
COMMENT ON COLUMN projects_steps_statuses.id IS 'Primary key';
COMMENT ON COLUMN projects_steps_statuses.status IS 'Step status name';
COMMENT ON COLUMN projects_steps_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects_steps_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects_steps_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_steps_statuses_updated_at
    BEFORE UPDATE ON projects_steps_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: projects_backlogs_statuses
-- Description: Status options for backlog items
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects_backlogs_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE projects_backlogs_statuses IS 'Status lookup for project backlog items';
COMMENT ON COLUMN projects_backlogs_statuses.id IS 'Primary key';
COMMENT ON COLUMN projects_backlogs_statuses.status IS 'Backlog status name';
COMMENT ON COLUMN projects_backlogs_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN projects_backlogs_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN projects_backlogs_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_projects_backlogs_statuses_updated_at
    BEFORE UPDATE ON projects_backlogs_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: sprints_statuses
-- Description: Status options for sprints
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprints_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE sprints_statuses IS 'Status lookup for sprint lifecycle';
COMMENT ON COLUMN sprints_statuses.id IS 'Primary key';
COMMENT ON COLUMN sprints_statuses.status IS 'Sprint status name';
COMMENT ON COLUMN sprints_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN sprints_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN sprints_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_sprints_statuses_updated_at
    BEFORE UPDATE ON sprints_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: sprints_tasks_statuses
-- Description: Status options for sprint tasks
-- =============================================================================
CREATE TABLE IF NOT EXISTS sprints_tasks_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE sprints_tasks_statuses IS 'Status lookup for tasks within sprints';
COMMENT ON COLUMN sprints_tasks_statuses.id IS 'Primary key';
COMMENT ON COLUMN sprints_tasks_statuses.status IS 'Task status name';
COMMENT ON COLUMN sprints_tasks_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN sprints_tasks_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN sprints_tasks_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_sprints_tasks_statuses_updated_at
    BEFORE UPDATE ON sprints_tasks_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: subtasks_statuses
-- Description: Status options for subtasks
-- =============================================================================
CREATE TABLE IF NOT EXISTS subtasks_statuses (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE subtasks_statuses IS 'Status lookup for subtasks';
COMMENT ON COLUMN subtasks_statuses.id IS 'Primary key';
COMMENT ON COLUMN subtasks_statuses.status IS 'Subtask status name';
COMMENT ON COLUMN subtasks_statuses.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN subtasks_statuses.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN subtasks_statuses.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_subtasks_statuses_updated_at
    BEFORE UPDATE ON subtasks_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: quality_status
-- Description: Quality assessment status options
-- =============================================================================
CREATE TABLE IF NOT EXISTS quality_status (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quality_status IS 'Quality assessment status lookup';
COMMENT ON COLUMN quality_status.id IS 'Primary key';
COMMENT ON COLUMN quality_status.status IS 'Quality status name';
COMMENT ON COLUMN quality_status.created_at IS 'Record creation timestamp';

-- =============================================================================
-- TABLE: status_inventory
-- Description: Inventory status options
-- =============================================================================
CREATE TABLE IF NOT EXISTS status_inventory (
    id              BIGSERIAL PRIMARY KEY,
    status          TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE status_inventory IS 'Inventory status lookup (available, reserved, etc.)';
COMMENT ON COLUMN status_inventory.id IS 'Primary key';
COMMENT ON COLUMN status_inventory.status IS 'Inventory status name';
COMMENT ON COLUMN status_inventory.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN status_inventory.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN status_inventory.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_status_inventory_updated_at
    BEFORE UPDATE ON status_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: tasks_priorities
-- Description: Task priority levels
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks_priorities (
    id              BIGSERIAL PRIMARY KEY,
    priority        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE tasks_priorities IS 'Task priority levels lookup (low, medium, high, critical)';
COMMENT ON COLUMN tasks_priorities.id IS 'Primary key';
COMMENT ON COLUMN tasks_priorities.priority IS 'Priority level name';
COMMENT ON COLUMN tasks_priorities.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN tasks_priorities.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN tasks_priorities.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_tasks_priorities_updated_at
    BEFORE UPDATE ON tasks_priorities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: users_system_access
-- Description: System environment access levels
-- =============================================================================
CREATE TABLE IF NOT EXISTS users_system_access (
    id              BIGSERIAL PRIMARY KEY,
    env             TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE users_system_access IS 'System environment access levels (production, staging, etc.)';
COMMENT ON COLUMN users_system_access.id IS 'Primary key';
COMMENT ON COLUMN users_system_access.env IS 'Environment name';
COMMENT ON COLUMN users_system_access.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users_system_access.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN users_system_access.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_users_system_access_updated_at
    BEFORE UPDATE ON users_system_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: users_roles
-- Description: User role definitions
-- =============================================================================
CREATE TABLE IF NOT EXISTS users_roles (
    id                  BIGSERIAL PRIMARY KEY,
    role                TEXT NOT NULL,
    role_normalized     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE users_roles IS 'User role definitions (admin, manager, worker, etc.)';
COMMENT ON COLUMN users_roles.id IS 'Primary key';
COMMENT ON COLUMN users_roles.role IS 'Role name';
COMMENT ON COLUMN users_roles.role_normalized IS 'Normalized role name for search';
COMMENT ON COLUMN users_roles.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users_roles.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN users_roles.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_users_roles_updated_at
    BEFORE UPDATE ON users_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: users_control_system
-- Description: System control/access levels
-- =============================================================================
CREATE TABLE IF NOT EXISTS users_control_system (
    id              BIGSERIAL PRIMARY KEY,
    access_level    TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE users_control_system IS 'System control access levels';
COMMENT ON COLUMN users_control_system.id IS 'Primary key';
COMMENT ON COLUMN users_control_system.access_level IS 'Access level name';
COMMENT ON COLUMN users_control_system.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users_control_system.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN users_control_system.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_users_control_system_updated_at
    BEFORE UPDATE ON users_control_system
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: discipline
-- Description: Work disciplines/specializations
-- =============================================================================
CREATE TABLE IF NOT EXISTS discipline (
    id              BIGSERIAL PRIMARY KEY,
    discipline      TEXT,
    company_id      BIGINT REFERENCES company(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE discipline IS 'Work disciplines/specializations (electrical, mechanical, etc.)';
COMMENT ON COLUMN discipline.id IS 'Primary key';
COMMENT ON COLUMN discipline.discipline IS 'Discipline name';
COMMENT ON COLUMN discipline.company_id IS 'FK to company (multi-tenant)';
COMMENT ON COLUMN discipline.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN discipline.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN discipline.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_discipline_updated_at
    BEFORE UPDATE ON discipline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: unity
-- Description: Units of measurement
-- =============================================================================
CREATE TABLE IF NOT EXISTS unity (
    id              BIGSERIAL PRIMARY KEY,
    unity           TEXT,
    company_id      BIGINT REFERENCES company(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE unity IS 'Units of measurement (m, m2, kg, units, etc.)';
COMMENT ON COLUMN unity.id IS 'Primary key';
COMMENT ON COLUMN unity.unity IS 'Unit name/symbol';
COMMENT ON COLUMN unity.company_id IS 'FK to company (multi-tenant)';
COMMENT ON COLUMN unity.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN unity.updated_at IS 'Record last update timestamp';
COMMENT ON COLUMN unity.deleted_at IS 'Soft delete timestamp';

CREATE TRIGGER update_unity_updated_at
    BEFORE UPDATE ON unity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
