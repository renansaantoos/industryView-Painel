-- =============================================================================
-- INDUSTRYVIEW DATABASE MIGRATION
-- File: 007_seed_data.sql
-- Description: Initial seed data for lookup/status tables
-- Author: DBA Migration Agent
-- Date: 2026-02-05
-- =============================================================================

-- =============================================================================
-- SEED: status_payment
-- =============================================================================
INSERT INTO status_payment (id, name) VALUES
    (1, 'Pendente'),
    (2, 'Pago'),
    (3, 'Atrasado'),
    (4, 'Cancelado'),
    (5, 'Em Analise')
ON CONFLICT (id) DO NOTHING;

SELECT setval('status_payment_id_seq', (SELECT MAX(id) FROM status_payment));

-- =============================================================================
-- SEED: projects_statuses
-- =============================================================================
INSERT INTO projects_statuses (id, status) VALUES
    (1, 'Ativo'),
    (2, 'Em Andamento'),
    (3, 'Pausado'),
    (4, 'Concluido'),
    (5, 'Cancelado')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_statuses_id_seq', (SELECT MAX(id) FROM projects_statuses));

-- =============================================================================
-- SEED: projects_works_situations
-- =============================================================================
INSERT INTO projects_works_situations (id, status) VALUES
    (1, 'Nao Iniciado'),
    (2, 'Em Execucao'),
    (3, 'Paralisado'),
    (4, 'Concluido')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_works_situations_id_seq', (SELECT MAX(id) FROM projects_works_situations));

-- =============================================================================
-- SEED: projects_steps_statuses
-- =============================================================================
INSERT INTO projects_steps_statuses (id, status) VALUES
    (1, 'Concluido'),
    (2, 'Em Andamento'),
    (3, 'Bloqueado'),
    (4, 'Pendente'),
    (5, 'Nao Iniciado')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_steps_statuses_id_seq', (SELECT MAX(id) FROM projects_steps_statuses));

-- =============================================================================
-- SEED: projects_backlogs_statuses
-- =============================================================================
INSERT INTO projects_backlogs_statuses (id, status) VALUES
    (1, 'Pendente'),
    (2, 'Em Andamento'),
    (3, 'Concluido'),
    (4, 'Cancelado'),
    (5, 'Bloqueado')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_backlogs_statuses_id_seq', (SELECT MAX(id) FROM projects_backlogs_statuses));

-- =============================================================================
-- SEED: sprints_statuses
-- =============================================================================
INSERT INTO sprints_statuses (id, status) VALUES
    (1, 'Planejamento'),
    (2, 'Em Andamento'),
    (3, 'Concluida'),
    (4, 'Cancelada')
ON CONFLICT (id) DO NOTHING;

SELECT setval('sprints_statuses_id_seq', (SELECT MAX(id) FROM sprints_statuses));

-- =============================================================================
-- SEED: sprints_tasks_statuses
-- =============================================================================
INSERT INTO sprints_tasks_statuses (id, status) VALUES
    (1, 'A Fazer'),
    (2, 'Em Andamento'),
    (3, 'Em Revisao'),
    (4, 'Concluida'),
    (5, 'Bloqueada')
ON CONFLICT (id) DO NOTHING;

SELECT setval('sprints_tasks_statuses_id_seq', (SELECT MAX(id) FROM sprints_tasks_statuses));

-- =============================================================================
-- SEED: subtasks_statuses
-- =============================================================================
INSERT INTO subtasks_statuses (id, status) VALUES
    (1, 'Pendente'),
    (2, 'Em Andamento'),
    (3, 'Concluida'),
    (4, 'Cancelada')
ON CONFLICT (id) DO NOTHING;

SELECT setval('subtasks_statuses_id_seq', (SELECT MAX(id) FROM subtasks_statuses));

-- =============================================================================
-- SEED: quality_status
-- =============================================================================
INSERT INTO quality_status (id, status) VALUES
    (1, 'Pendente'),
    (2, 'Aprovado'),
    (3, 'Reprovado'),
    (4, 'Em Revisao')
ON CONFLICT (id) DO NOTHING;

SELECT setval('quality_status_id_seq', (SELECT MAX(id) FROM quality_status));

-- =============================================================================
-- SEED: stakes_statuses
-- =============================================================================
INSERT INTO stakes_statuses (id, status) VALUES
    (1, 'Pendente'),
    (2, 'Instalada'),
    (3, 'Com Defeito'),
    (4, 'Removida')
ON CONFLICT (id) DO NOTHING;

SELECT setval('stakes_statuses_id_seq', (SELECT MAX(id) FROM stakes_statuses));

-- =============================================================================
-- SEED: rows_trackers_statuses
-- =============================================================================
INSERT INTO rows_trackers_statuses (id, status) VALUES
    (1, 'Pendente'),
    (2, 'Instalado'),
    (3, 'Em Manutencao'),
    (4, 'Inativo')
ON CONFLICT (id) DO NOTHING;

SELECT setval('rows_trackers_statuses_id_seq', (SELECT MAX(id) FROM rows_trackers_statuses));

-- =============================================================================
-- SEED: status_inventory
-- =============================================================================
INSERT INTO status_inventory (id, status) VALUES
    (1, 'Disponivel'),
    (2, 'Reservado'),
    (3, 'Em Uso'),
    (4, 'Indisponivel'),
    (5, 'Baixa')
ON CONFLICT (id) DO NOTHING;

SELECT setval('status_inventory_id_seq', (SELECT MAX(id) FROM status_inventory));

-- =============================================================================
-- SEED: tasks_priorities
-- =============================================================================
INSERT INTO tasks_priorities (id, priority) VALUES
    (1, 'Baixa'),
    (2, 'Media'),
    (3, 'Alta'),
    (4, 'Urgente'),
    (5, 'Critica')
ON CONFLICT (id) DO NOTHING;

SELECT setval('tasks_priorities_id_seq', (SELECT MAX(id) FROM tasks_priorities));

-- =============================================================================
-- SEED: users_system_access
-- =============================================================================
INSERT INTO users_system_access (id, env) VALUES
    (1, 'production'),
    (2, 'staging'),
    (3, 'development')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_system_access_id_seq', (SELECT MAX(id) FROM users_system_access));

-- =============================================================================
-- SEED: users_roles
-- =============================================================================
INSERT INTO users_roles (id, role, role_normalized) VALUES
    (1, 'Administrador', 'administrador'),
    (2, 'Gerente', 'gerente'),
    (3, 'Supervisor', 'supervisor'),
    (4, 'Tecnico', 'tecnico'),
    (5, 'Operador', 'operador'),
    (6, 'Visualizador', 'visualizador')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_roles_id_seq', (SELECT MAX(id) FROM users_roles));

-- =============================================================================
-- SEED: users_control_system
-- =============================================================================
INSERT INTO users_control_system (id, access_level) VALUES
    (1, 'Super Admin'),
    (2, 'Admin'),
    (3, 'Usuario'),
    (4, 'Convidado')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_control_system_id_seq', (SELECT MAX(id) FROM users_control_system));

-- =============================================================================
-- SEED: equipaments_types
-- =============================================================================
INSERT INTO equipaments_types (id, type, code) VALUES
    (1, 'Tracker', 'TRK'),
    (2, 'Modulo Solar', 'MOD'),
    (3, 'Inversor', 'INV'),
    (4, 'Estaca', 'EST'),
    (5, 'Estrutura', 'STR'),
    (6, 'Cabo', 'CBL'),
    (7, 'Conector', 'CON'),
    (8, 'Outro', 'OTR')
ON CONFLICT (id) DO NOTHING;

SELECT setval('equipaments_types_id_seq', (SELECT MAX(id) FROM equipaments_types));

-- =============================================================================
-- SEED: trackers_types
-- =============================================================================
INSERT INTO trackers_types (id, type, type_normalized) VALUES
    (1, 'Single Axis', 'single axis'),
    (2, 'Dual Axis', 'dual axis'),
    (3, 'Fixed', 'fixed')
ON CONFLICT (id) DO NOTHING;

SELECT setval('trackers_types_id_seq', (SELECT MAX(id) FROM trackers_types));

-- =============================================================================
-- SEED: modules_types
-- =============================================================================
INSERT INTO modules_types (id, type, type_normalized) VALUES
    (1, 'Monocristalino', 'monocristalino'),
    (2, 'Policristalino', 'policristalino'),
    (3, 'Filme Fino', 'filme fino'),
    (4, 'Bifacial', 'bifacial')
ON CONFLICT (id) DO NOTHING;

SELECT setval('modules_types_id_seq', (SELECT MAX(id) FROM modules_types));

-- =============================================================================
-- SEED: stakes_types
-- =============================================================================
INSERT INTO stakes_types (id, type) VALUES
    (1, 'Estaca Padrao'),
    (2, 'Estaca Motor'),
    (3, 'Estaca Reforco'),
    (4, 'Estaca Ancora')
ON CONFLICT (id) DO NOTHING;

SELECT setval('stakes_types_id_seq', (SELECT MAX(id) FROM stakes_types));

-- =============================================================================
-- Verification queries
-- =============================================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Verify all seed tables have data
    SELECT COUNT(*) INTO v_count FROM status_payment;
    RAISE NOTICE 'status_payment: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM projects_statuses;
    RAISE NOTICE 'projects_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM projects_works_situations;
    RAISE NOTICE 'projects_works_situations: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM projects_steps_statuses;
    RAISE NOTICE 'projects_steps_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM projects_backlogs_statuses;
    RAISE NOTICE 'projects_backlogs_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM sprints_statuses;
    RAISE NOTICE 'sprints_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM sprints_tasks_statuses;
    RAISE NOTICE 'sprints_tasks_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM subtasks_statuses;
    RAISE NOTICE 'subtasks_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM quality_status;
    RAISE NOTICE 'quality_status: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM stakes_statuses;
    RAISE NOTICE 'stakes_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM rows_trackers_statuses;
    RAISE NOTICE 'rows_trackers_statuses: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM status_inventory;
    RAISE NOTICE 'status_inventory: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM tasks_priorities;
    RAISE NOTICE 'tasks_priorities: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM users_system_access;
    RAISE NOTICE 'users_system_access: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM users_roles;
    RAISE NOTICE 'users_roles: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM users_control_system;
    RAISE NOTICE 'users_control_system: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM equipaments_types;
    RAISE NOTICE 'equipaments_types: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM trackers_types;
    RAISE NOTICE 'trackers_types: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM modules_types;
    RAISE NOTICE 'modules_types: % records', v_count;

    SELECT COUNT(*) INTO v_count FROM stakes_types;
    RAISE NOTICE 'stakes_types: % records', v_count;
END $$;
