-- Migration: Populate teams_projects and teams_projects_history from existing teams.projects_id
-- For each active team with a projects_id, create a junction record and a VINCULADO history entry

-- Step 1: Insert into teams_projects (active junction)
INSERT INTO teams_projects (teams_id, projects_id, start_at, created_at, updated_at)
SELECT
  t.id AS teams_id,
  t.projects_id,
  t.created_at AS start_at,
  NOW() AS created_at,
  NOW() AS updated_at
FROM teams t
WHERE t.projects_id IS NOT NULL
  AND t.deleted_at IS NULL
ON CONFLICT (teams_id, projects_id) DO NOTHING;

-- Step 2: Insert into teams_projects_history (audit trail for existing links)
INSERT INTO teams_projects_history (
  teams_id, projects_id, action, team_name, project_name,
  performed_by_name, members_snapshot, start_at, created_at
)
SELECT
  t.id AS teams_id,
  t.projects_id,
  'VINCULADO' AS action,
  t.name AS team_name,
  p.name AS project_name,
  'MIGRAÇÃO AUTOMÁTICA' AS performed_by_name,
  COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'user_id', u.id,
        'name', u.name,
        'email', u.email,
        'role', 'leader'
      ))
      FROM teams_leaders tl
      JOIN users u ON u.id = tl.users_id
      WHERE tl.teams_id = t.id AND tl.deleted_at IS NULL
    ), '[]'::jsonb
  ) || COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object(
        'user_id', u.id,
        'name', u.name,
        'email', u.email,
        'role', 'member'
      ))
      FROM teams_members tm
      JOIN users u ON u.id = tm.users_id
      WHERE tm.teams_id = t.id AND tm.deleted_at IS NULL
    ), '[]'::jsonb
  ) AS members_snapshot,
  t.created_at AS start_at,
  NOW() AS created_at
FROM teams t
JOIN projects p ON p.id = t.projects_id
WHERE t.projects_id IS NOT NULL
  AND t.deleted_at IS NULL;
