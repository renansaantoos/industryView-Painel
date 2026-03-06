-- Migration: adiciona client_unit_id na tabela projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS client_unit_id BIGINT REFERENCES client_units(id) ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS idx_projects_client_unit_id ON projects(client_unit_id);
