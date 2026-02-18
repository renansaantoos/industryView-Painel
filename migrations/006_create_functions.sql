-- =============================================================================
-- INDUSTRYVIEW DATABASE MIGRATION
-- File: 006_create_functions.sql
-- Description: Database functions, triggers, and views
-- Author: DBA Migration Agent
-- Date: 2026-02-05
-- =============================================================================

-- =============================================================================
-- FUNCTION: auto_normalize_text
-- Description: Trigger function to auto-populate normalized text fields
-- =============================================================================
CREATE OR REPLACE FUNCTION auto_normalize_text()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-populate name_normalized from name
    IF TG_TABLE_NAME = 'users' AND NEW.name IS NOT NULL THEN
        NEW.name_normalized := normalize_text(NEW.name);
    END IF;

    IF TG_TABLE_NAME = 'manufacturers' AND NEW.name IS NOT NULL THEN
        NEW.name_normalized := normalize_text(NEW.name);
    END IF;

    IF TG_TABLE_NAME = 'projects' AND NEW.name IS NOT NULL THEN
        NEW.name_normalized := normalize_text(NEW.name);
    END IF;

    -- Auto-populate description_normalized from description
    IF TG_TABLE_NAME = 'tasks_template' AND NEW.description IS NOT NULL THEN
        NEW.description_normalized := normalize_text(NEW.description);
    END IF;

    IF TG_TABLE_NAME = 'projects_backlogs' AND NEW.description IS NOT NULL THEN
        NEW.description_normalized := normalize_text(NEW.description);
    END IF;

    IF TG_TABLE_NAME = 'subtasks' AND NEW.description IS NOT NULL THEN
        NEW.description_normalized := normalize_text(NEW.description);
    END IF;

    -- Auto-populate type_normalized from type
    IF TG_TABLE_NAME = 'trackers_types' AND NEW.type IS NOT NULL THEN
        NEW.type_normalized := normalize_text(NEW.type);
    END IF;

    IF TG_TABLE_NAME = 'modules_types' AND NEW.type IS NOT NULL THEN
        NEW.type_normalized := normalize_text(NEW.type);
    END IF;

    -- Auto-populate role_normalized from role
    IF TG_TABLE_NAME = 'users_roles' AND NEW.role IS NOT NULL THEN
        NEW.role_normalized := normalize_text(NEW.role);
    END IF;

    -- Auto-populate product_normalized from product
    IF TG_TABLE_NAME = 'product_inventory' AND NEW.product IS NOT NULL THEN
        NEW.product_normalized := normalize_text(NEW.product);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_normalize_text() IS 'Trigger function to auto-populate normalized text fields for search';

-- Create triggers for auto-normalization
CREATE TRIGGER trg_users_normalize BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_manufacturers_normalize BEFORE INSERT OR UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_projects_normalize BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_tasks_template_normalize BEFORE INSERT OR UPDATE ON tasks_template
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_projects_backlogs_normalize BEFORE INSERT OR UPDATE ON projects_backlogs
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_subtasks_normalize BEFORE INSERT OR UPDATE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_trackers_types_normalize BEFORE INSERT OR UPDATE ON trackers_types
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_modules_types_normalize BEFORE INSERT OR UPDATE ON modules_types
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_users_roles_normalize BEFORE INSERT OR UPDATE ON users_roles
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

CREATE TRIGGER trg_product_inventory_normalize BEFORE INSERT OR UPDATE ON product_inventory
    FOR EACH ROW EXECUTE FUNCTION auto_normalize_text();

-- =============================================================================
-- FUNCTION: update_project_completion_percentage
-- Description: Calculate and update project completion percentage
-- =============================================================================
CREATE OR REPLACE FUNCTION update_project_completion_percentage(p_project_id BIGINT)
RETURNS NUMERIC AS $$
DECLARE
    v_total_weight NUMERIC;
    v_completed_weight NUMERIC;
    v_percentage NUMERIC;
BEGIN
    -- Calculate total weight of all backlog items
    SELECT COALESCE(SUM(weight), 0) INTO v_total_weight
    FROM projects_backlogs
    WHERE projects_id = p_project_id
      AND deleted_at IS NULL;

    -- Calculate weight of completed items
    SELECT COALESCE(SUM(pb.weight), 0) INTO v_completed_weight
    FROM projects_backlogs pb
    JOIN projects_backlogs_statuses pbs ON pb.projects_backlogs_statuses_id = pbs.id
    WHERE pb.projects_id = p_project_id
      AND pb.deleted_at IS NULL
      AND pbs.status ILIKE '%conclu%';  -- Completed status in Portuguese

    -- Calculate percentage
    IF v_total_weight > 0 THEN
        v_percentage := ROUND((v_completed_weight / v_total_weight) * 100, 2);
    ELSE
        v_percentage := 0;
    END IF;

    -- Update project
    UPDATE projects
    SET completion_percentage = v_percentage,
        updated_at = NOW()
    WHERE id = p_project_id;

    RETURN v_percentage;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_project_completion_percentage(BIGINT) IS 'Calculate and update project completion percentage based on backlog items';

-- =============================================================================
-- FUNCTION: update_sprint_progress_percentage
-- Description: Calculate and update sprint progress percentage
-- =============================================================================
CREATE OR REPLACE FUNCTION update_sprint_progress_percentage(p_sprint_id BIGINT)
RETURNS NUMERIC AS $$
DECLARE
    v_total_tasks INTEGER;
    v_completed_tasks INTEGER;
    v_percentage NUMERIC;
BEGIN
    -- Count total tasks in sprint
    SELECT COUNT(*) INTO v_total_tasks
    FROM sprints_tasks
    WHERE sprints_id = p_sprint_id
      AND deleted_at IS NULL;

    -- Count completed tasks
    SELECT COUNT(*) INTO v_completed_tasks
    FROM sprints_tasks st
    JOIN sprints_tasks_statuses sts ON st.sprints_tasks_statuses_id = sts.id
    WHERE st.sprints_id = p_sprint_id
      AND st.deleted_at IS NULL
      AND sts.status ILIKE '%conclu%';  -- Completed status in Portuguese

    -- Calculate percentage
    IF v_total_tasks > 0 THEN
        v_percentage := ROUND((v_completed_tasks::NUMERIC / v_total_tasks) * 100, 2);
    ELSE
        v_percentage := 0;
    END IF;

    -- Update sprint
    UPDATE sprints
    SET progress_percentage = v_percentage,
        updated_at = NOW()
    WHERE id = p_sprint_id;

    RETURN v_percentage;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_sprint_progress_percentage(BIGINT) IS 'Calculate and update sprint progress percentage based on completed tasks';

-- =============================================================================
-- FUNCTION: update_inventory_quantity
-- Description: Update product inventory quantity after log entry
-- =============================================================================
CREATE OR REPLACE FUNCTION update_inventory_on_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- type = true means entry (add), type = false means exit (subtract)
        IF NEW.type = TRUE THEN
            UPDATE product_inventory
            SET inventory_quantity = inventory_quantity + NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.product_inventory_id;
        ELSE
            UPDATE product_inventory
            SET inventory_quantity = inventory_quantity - NEW.quantity,
                updated_at = NOW()
            WHERE id = NEW.product_inventory_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_inventory_on_log() IS 'Trigger function to update inventory quantity when log is created';

CREATE TRIGGER trg_inventory_log_update
    AFTER INSERT ON inventory_logs
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_log();

-- =============================================================================
-- FUNCTION: soft_delete
-- Description: Generic soft delete function
-- =============================================================================
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION soft_delete() IS 'Generic trigger function for soft delete';

-- =============================================================================
-- VIEW: v_active_projects
-- Description: View of active (non-deleted) projects with status
-- =============================================================================
CREATE OR REPLACE VIEW v_active_projects AS
SELECT
    p.id,
    p.name,
    p.registration_number,
    p.city,
    p.state,
    p.completion_percentage,
    ps.status AS project_status,
    pws.status AS work_situation,
    c.brand_name AS company_name,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN projects_statuses ps ON p.projects_statuses_id = ps.id
LEFT JOIN projects_works_situations pws ON p.projects_works_situations_id = pws.id
LEFT JOIN company c ON p.company_id = c.id
WHERE p.deleted_at IS NULL;

COMMENT ON VIEW v_active_projects IS 'View of active projects with status information';

-- =============================================================================
-- VIEW: v_project_team_summary
-- Description: Summary of teams and members per project
-- =============================================================================
CREATE OR REPLACE VIEW v_project_team_summary AS
SELECT
    p.id AS project_id,
    p.name AS project_name,
    t.id AS team_id,
    t.name AS team_name,
    (SELECT COUNT(*) FROM teams_members tm WHERE tm.teams_id = t.id AND tm.deleted_at IS NULL) AS member_count,
    (SELECT COUNT(*) FROM teams_leaders tl WHERE tl.teams_id = t.id AND tl.deleted_at IS NULL) AS leader_count
FROM projects p
JOIN teams t ON t.projects_id = p.id AND t.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

COMMENT ON VIEW v_project_team_summary IS 'Summary view of teams and their member counts per project';

-- =============================================================================
-- VIEW: v_sprint_overview
-- Description: Sprint overview with task counts
-- =============================================================================
CREATE OR REPLACE VIEW v_sprint_overview AS
SELECT
    s.id,
    s.title,
    s.objective,
    s.start_date,
    s.end_date,
    s.progress_percentage,
    ss.status AS sprint_status,
    p.id AS project_id,
    p.name AS project_name,
    (SELECT COUNT(*) FROM sprints_tasks st WHERE st.sprints_id = s.id AND st.deleted_at IS NULL) AS total_tasks,
    (SELECT COUNT(*) FROM sprints_tasks st
     JOIN sprints_tasks_statuses sts ON st.sprints_tasks_statuses_id = sts.id
     WHERE st.sprints_id = s.id AND st.deleted_at IS NULL AND sts.status ILIKE '%conclu%') AS completed_tasks
FROM sprints s
LEFT JOIN sprints_statuses ss ON s.sprints_statuses_id = ss.id
LEFT JOIN projects p ON s.projects_id = p.id
WHERE s.deleted_at IS NULL;

COMMENT ON VIEW v_sprint_overview IS 'Sprint overview with task counts';

-- =============================================================================
-- VIEW: v_user_project_access
-- Description: User access to projects
-- =============================================================================
CREATE OR REPLACE VIEW v_user_project_access AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    p.id AS project_id,
    p.name AS project_name,
    ur.role,
    uca.access_level,
    usa.env AS system_environment
FROM users u
JOIN projects_users pu ON u.id = pu.users_id AND pu.deleted_at IS NULL
JOIN projects p ON pu.projects_id = p.id AND p.deleted_at IS NULL
LEFT JOIN users_permissions up ON u.users_permissions_id = up.id
LEFT JOIN users_roles ur ON up.users_roles_id = ur.id
LEFT JOIN users_control_system uca ON up.users_control_system_id = uca.id
LEFT JOIN users_system_access usa ON up.users_system_access_id = usa.id
WHERE u.deleted_at IS NULL;

COMMENT ON VIEW v_user_project_access IS 'User access rights per project with role information';

-- =============================================================================
-- VIEW: v_inventory_summary
-- Description: Inventory summary with low stock alerts
-- =============================================================================
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT
    pi.id,
    pi.code,
    pi.product,
    pi.specifications,
    pi.inventory_quantity,
    pi.min_quantity,
    u.unity AS unit,
    si.status AS inventory_status,
    et.type AS equipment_type,
    m.name AS manufacturer,
    p.name AS project_name,
    CASE WHEN pi.inventory_quantity <= pi.min_quantity THEN TRUE ELSE FALSE END AS low_stock_alert
FROM product_inventory pi
LEFT JOIN unity u ON pi.unity_id = u.id
LEFT JOIN status_inventory si ON pi.status_inventory_id = si.id
LEFT JOIN equipaments_types et ON pi.equipaments_types_id = et.id
LEFT JOIN manufacturers m ON pi.manufacturers_id = m.id
LEFT JOIN projects p ON pi.projects_id = p.id
WHERE pi.deleted_at IS NULL;

COMMENT ON VIEW v_inventory_summary IS 'Inventory summary with low stock alerts';

-- =============================================================================
-- VIEW: v_backlog_details
-- Description: Detailed backlog items with location and status
-- =============================================================================
CREATE OR REPLACE VIEW v_backlog_details AS
SELECT
    pb.id,
    pb.description,
    pb.weight,
    pb.quantity,
    pb.quantity_done,
    pb.sprint_added,
    pb.is_inspection,
    pbs.status AS backlog_status,
    qs.status AS quality_status,
    d.discipline,
    et.type AS equipment_type,
    u.unity AS unit,
    p.id AS project_id,
    p.name AS project_name,
    f.name AS field_name,
    s.section_number,
    r.row_number,
    pb.created_at,
    pb.updated_at
FROM projects_backlogs pb
LEFT JOIN projects_backlogs_statuses pbs ON pb.projects_backlogs_statuses_id = pbs.id
LEFT JOIN quality_status qs ON pb.quality_status_id = qs.id
LEFT JOIN discipline d ON pb.discipline_id = d.id
LEFT JOIN equipaments_types et ON pb.equipaments_types_id = et.id
LEFT JOIN unity u ON pb.unity_id = u.id
LEFT JOIN projects p ON pb.projects_id = p.id
LEFT JOIN fields f ON pb.fields_id = f.id
LEFT JOIN sections s ON pb.sections_id = s.id
LEFT JOIN rows r ON pb.rows_id = r.id
WHERE pb.deleted_at IS NULL;

COMMENT ON VIEW v_backlog_details IS 'Detailed view of backlog items with location and status';

-- =============================================================================
-- ROLES AND PERMISSIONS
-- =============================================================================

-- Create application roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly') THEN
        CREATE ROLE app_readonly;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readwrite') THEN
        CREATE ROLE app_readwrite;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin;
    END IF;
END
$$;

-- Grant permissions to readonly role
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;

-- Grant permissions to readwrite role
GRANT USAGE ON SCHEMA public TO app_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_readwrite;

-- Grant permissions to admin role
GRANT ALL PRIVILEGES ON SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO app_admin;

COMMENT ON ROLE app_readonly IS 'Application role with read-only access';
COMMENT ON ROLE app_readwrite IS 'Application role with read and write access';
COMMENT ON ROLE app_admin IS 'Application role with full administrative access';
