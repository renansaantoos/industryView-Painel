-- CreateEnum
CREATE TYPE "inventory_log_type_enum" AS ENUM ('entry', 'exit');

-- CreateEnum
CREATE TYPE "payment_status_enum" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'canceled');

-- CreateTable
CREATE TABLE "status_payment" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_works_situations" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_works_situations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_steps_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_steps_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_backlogs_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_backlogs_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sprints_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints_tasks_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sprints_tasks_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtasks_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "subtasks_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_status" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakes_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "stakes_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rows_trackers_statuses" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rows_trackers_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_inventory" (
    "id" BIGSERIAL NOT NULL,
    "status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "status_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks_priorities" (
    "id" BIGSERIAL NOT NULL,
    "priority" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tasks_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_system_access" (
    "id" BIGSERIAL NOT NULL,
    "env" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_system_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_roles" (
    "id" BIGSERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "role_normalized" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_control_system" (
    "id" BIGSERIAL NOT NULL,
    "access_level" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_control_system_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_permissions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "users_system_access_id" BIGINT DEFAULT 3,
    "users_roles_id" BIGINT DEFAULT 5,
    "users_control_system_id" BIGINT DEFAULT 2,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT,
    "name_normalized" TEXT,
    "email" TEXT,
    "phone" VARCHAR(20),
    "password_hash" TEXT,
    "profile_picture" TEXT,
    "forget_password_code" INTEGER,
    "users_permissions_id" BIGINT,
    "company_id" BIGINT,
    "first_login" BOOLEAN DEFAULT true,
    "qrcode" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" BIGSERIAL NOT NULL,
    "brand_name" TEXT,
    "legal_name" TEXT,
    "cnpj" VARCHAR(18),
    "phone" VARCHAR(20),
    "email" TEXT,
    "cep" VARCHAR(9),
    "numero" VARCHAR(20),
    "address_line" TEXT,
    "address_line2" TEXT,
    "city" VARCHAR(100),
    "state" CHAR(2),
    "status_payment_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipaments_types" (
    "id" BIGSERIAL NOT NULL,
    "type" TEXT,
    "code" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "equipaments_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trackers_types" (
    "id" BIGSERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "type_normalized" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "trackers_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules_types" (
    "id" BIGSERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "type_normalized" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "modules_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakes_types" (
    "id" BIGSERIAL NOT NULL,
    "type" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "stakes_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT,
    "name_normalized" TEXT,
    "equipaments_types_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trackers" (
    "id" BIGSERIAL NOT NULL,
    "stake_quantity" INTEGER NOT NULL DEFAULT 0,
    "max_modules" INTEGER NOT NULL DEFAULT 0,
    "trackers_types_id" BIGINT,
    "manufacturers_id" BIGINT,
    "company_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakes" (
    "id" BIGSERIAL NOT NULL,
    "position" TEXT,
    "is_motor" BOOLEAN DEFAULT false,
    "trackers_id" BIGINT,
    "stakes_types_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "stakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" BIGSERIAL NOT NULL,
    "voltage" DECIMAL(10,4),
    "current" DECIMAL(10,4),
    "short_circuit_current" DECIMAL(10,4),
    "power" DECIMAL(10,4),
    "vco" DECIMAL(10,4),
    "im" DECIMAL(10,4),
    "vm" DECIMAL(10,4),
    "modules_types_id" BIGINT,
    "manufacturers_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" BIGSERIAL NOT NULL,
    "registration_number" VARCHAR(50),
    "name" TEXT,
    "name_normalized" TEXT,
    "project_creation_date" TIMESTAMPTZ(6),
    "origin_registration" TEXT,
    "art" VARCHAR(50),
    "rrt" VARCHAR(50),
    "cib" VARCHAR(50),
    "real_state_registration" TEXT,
    "start_date" TIMESTAMPTZ(6),
    "permit_number" VARCHAR(50),
    "cnae" VARCHAR(20),
    "situation_date" TIMESTAMPTZ(6),
    "responsible" TEXT,
    "cep" VARCHAR(9),
    "city" VARCHAR(100),
    "number" VARCHAR(20),
    "state" CHAR(2),
    "country" VARCHAR(50) DEFAULT 'Brasil',
    "street" TEXT,
    "neighbourhood" VARCHAR(100),
    "complement" TEXT,
    "cnpj" VARCHAR(18),
    "completion_percentage" DECIMAL(5,2) DEFAULT 0,
    "category" TEXT,
    "destination" TEXT,
    "project_work_type" TEXT,
    "resulting_work_area" TEXT,
    "cno_file" TEXT,
    "projects_statuses_id" BIGINT,
    "projects_works_situations_id" BIGINT,
    "company_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_users" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_steps" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "projects_config_status" BIGINT DEFAULT 2,
    "projects_map_config_status" BIGINT DEFAULT 2,
    "projects_teams_config_status" BIGINT DEFAULT 3,
    "projects_backlog_config_status" BIGINT DEFAULT 3,
    "projects_sprint_config_status" BIGINT DEFAULT 4,
    "projects_report_config_status" BIGINT DEFAULT 5,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "section_quantity" INTEGER,
    "rows_per_section" INTEGER,
    "map_texts" JSONB,
    "projects_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" BIGSERIAL NOT NULL,
    "section_number" INTEGER,
    "fields_id" BIGINT,
    "x" INTEGER,
    "y" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rows" (
    "id" BIGSERIAL NOT NULL,
    "row_number" INTEGER,
    "sections_id" BIGINT,
    "x" INTEGER,
    "y" INTEGER,
    "group_offset_x" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rows_trackers" (
    "id" BIGSERIAL NOT NULL,
    "position" TEXT,
    "row_y" INTEGER,
    "rows_id" BIGINT,
    "trackers_id" BIGINT,
    "rows_trackers_statuses_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rows_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rows_stakes" (
    "id" BIGSERIAL NOT NULL,
    "position" TEXT,
    "rows_trackers_id" BIGINT,
    "stakes_id" BIGINT NOT NULL,
    "stakes_statuses_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rows_stakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules_trackers" (
    "id" BIGSERIAL NOT NULL,
    "modules_id" BIGINT NOT NULL,
    "rows_trackers_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "modules_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT,
    "projects_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_leaders" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT,
    "teams_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "teams_leaders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_members" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT,
    "teams_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "teams_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline" (
    "id" BIGSERIAL NOT NULL,
    "discipline" TEXT,
    "company_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unity" (
    "id" BIGSERIAL NOT NULL,
    "unity" TEXT,
    "company_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "unity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks_template" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT,
    "description_normalized" TEXT,
    "equipaments_types_id" BIGINT,
    "weight" DECIMAL(10,2) DEFAULT 1,
    "fixed" BOOLEAN DEFAULT false,
    "is_inspection" BOOLEAN DEFAULT false,
    "unity_id" BIGINT,
    "company_id" BIGINT,
    "discipline_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tasks_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_backlogs" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "tasks_template_id" BIGINT,
    "projects_backlogs_statuses_id" BIGINT DEFAULT 1,
    "fields_id" BIGINT,
    "sections_id" BIGINT,
    "rows_id" BIGINT,
    "trackers_id" BIGINT,
    "rows_trackers_id" BIGINT,
    "rows_stakes_id" BIGINT,
    "discipline_id" BIGINT,
    "equipaments_types_id" BIGINT,
    "unity_id" BIGINT,
    "quality_status_id" BIGINT DEFAULT 1,
    "projects_backlogs_id" BIGINT,
    "subtasks_id" BIGINT,
    "description" TEXT,
    "description_normalized" TEXT,
    "weight" DECIMAL(10,2),
    "quantity" DECIMAL(10,2) DEFAULT 1,
    "quantity_done" DECIMAL(10,2),
    "sprint_added" BOOLEAN DEFAULT false,
    "is_inspection" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "projects_backlogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtasks" (
    "id" BIGSERIAL NOT NULL,
    "projects_backlogs_id" BIGINT,
    "description" TEXT,
    "description_normalized" TEXT,
    "weight" DECIMAL(10,2) DEFAULT 1,
    "fixed" BOOLEAN DEFAULT false,
    "is_inspection" BOOLEAN DEFAULT false,
    "unity_id" BIGINT,
    "quantity" DECIMAL(10,2),
    "quantity_done" DECIMAL(10,2),
    "subtasks_statuses_id" BIGINT DEFAULT 1,
    "quality_status_id" BIGINT DEFAULT 1,
    "sprint_added" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "subtasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" BIGSERIAL NOT NULL,
    "comment" TEXT,
    "projects_backlogs_id" BIGINT,
    "subtasks_id" BIGINT,
    "created_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "progress_percentage" DECIMAL(5,2) DEFAULT 0,
    "projects_id" BIGINT,
    "sprints_statuses_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprints_tasks" (
    "id" BIGSERIAL NOT NULL,
    "projects_backlogs_id" BIGINT,
    "subtasks_id" BIGINT,
    "sprints_id" BIGINT,
    "teams_id" BIGINT,
    "sprints_tasks_statuses_id" BIGINT,
    "scheduled_for" DATE,
    "executed_at" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sprints_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprint_task_change_log" (
    "id" BIGSERIAL NOT NULL,
    "sprints_tasks_id" BIGINT,
    "users_id" BIGINT,
    "changed_field" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sprint_task_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" BIGSERIAL NOT NULL,
    "teams_id" BIGINT,
    "projects_id" BIGINT,
    "sprints_id" BIGINT,
    "daily_report_id" BIGINT,
    "schedule_date" DATE,
    "images" TEXT[],
    "end_service" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_sprints_tasks" (
    "id" BIGSERIAL NOT NULL,
    "schedule_id" BIGINT NOT NULL,
    "sprints_tasks_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_sprints_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_user" (
    "id" BIGSERIAL NOT NULL,
    "schedule_id" BIGINT,
    "users_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "schedule_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT,
    "rdo_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "daily_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_inventory" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50),
    "product" TEXT,
    "product_normalized" TEXT,
    "specifications" TEXT,
    "inventory_quantity" INTEGER DEFAULT 0,
    "min_quantity" INTEGER DEFAULT 0,
    "sequential_per_category" INTEGER,
    "unity_id" BIGINT,
    "status_inventory_id" BIGINT,
    "equipaments_types_id" BIGINT,
    "manufacturers_id" BIGINT,
    "projects_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "product_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50),
    "quantity" INTEGER,
    "type" BOOLEAN,
    "observations" TEXT,
    "responsible_users_id" BIGINT,
    "received_user" BIGINT,
    "product_inventory_id" BIGINT,
    "projects_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "status" TEXT,
    "trial_end" TIMESTAMPTZ(6),
    "current_period_end" TIMESTAMPTZ(6),
    "cancel_at_period_end" BOOLEAN DEFAULT false,
    "last_invoice_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" BIGSERIAL NOT NULL,
    "session_id" TEXT,
    "customer_id" TEXT,
    "amount_subtotal" INTEGER,
    "amount_total" INTEGER,
    "payment_intent_id" TEXT,
    "payment_status" TEXT,
    "company_id" BIGINT,
    "subscriptions_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_log_dashboard" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" BIGINT NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "intent_data" TEXT,
    "object_answer" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_log_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_users_permissions_created_at" ON "users_permissions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_users_permissions_user_id" ON "users_permissions"("user_id");

-- CreateIndex
CREATE INDEX "idx_users_permissions_users_control_system_id" ON "users_permissions"("users_control_system_id");

-- CreateIndex
CREATE INDEX "idx_users_permissions_users_roles_id" ON "users_permissions"("users_roles_id");

-- CreateIndex
CREATE INDEX "idx_users_permissions_users_system_access_id" ON "users_permissions"("users_system_access_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_company_id" ON "users"("company_id");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "users"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_name_normalized" ON "users"("name_normalized");

-- CreateIndex
CREATE INDEX "idx_users_users_permissions_id" ON "users"("users_permissions_id");

-- CreateIndex
CREATE INDEX "idx_company_created_at" ON "company"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_company_status_payment_id" ON "company"("status_payment_id");

-- CreateIndex
CREATE INDEX "idx_manufacturers_created_at" ON "manufacturers"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_manufacturers_equipaments_types_id" ON "manufacturers"("equipaments_types_id");

-- CreateIndex
CREATE INDEX "idx_manufacturers_name_normalized" ON "manufacturers"("name_normalized");

-- CreateIndex
CREATE INDEX "idx_trackers_company_id" ON "trackers"("company_id");

-- CreateIndex
CREATE INDEX "idx_trackers_created_at" ON "trackers"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_trackers_manufacturers_id" ON "trackers"("manufacturers_id");

-- CreateIndex
CREATE INDEX "idx_trackers_trackers_types_id" ON "trackers"("trackers_types_id");

-- CreateIndex
CREATE INDEX "idx_stakes_created_at" ON "stakes"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_stakes_stakes_types_id" ON "stakes"("stakes_types_id");

-- CreateIndex
CREATE INDEX "idx_stakes_trackers_id" ON "stakes"("trackers_id");

-- CreateIndex
CREATE INDEX "idx_modules_created_at" ON "modules"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_modules_manufacturers_id" ON "modules"("manufacturers_id");

-- CreateIndex
CREATE INDEX "idx_modules_modules_types_id" ON "modules"("modules_types_id");

-- CreateIndex
CREATE INDEX "idx_projects_company_id" ON "projects"("company_id");

-- CreateIndex
CREATE INDEX "idx_projects_created_at" ON "projects"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_projects_name_normalized" ON "projects"("name_normalized");

-- CreateIndex
CREATE INDEX "idx_projects_projects_statuses_id" ON "projects"("projects_statuses_id");

-- CreateIndex
CREATE INDEX "idx_projects_projects_works_situations_id" ON "projects"("projects_works_situations_id");

-- CreateIndex
CREATE INDEX "idx_projects_users_created_at" ON "projects_users"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_projects_users_projects_id" ON "projects_users"("projects_id");

-- CreateIndex
CREATE INDEX "idx_projects_users_users_id" ON "projects_users"("users_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_users_users_id_projects_id_key" ON "projects_users"("users_id", "projects_id");

-- CreateIndex
CREATE INDEX "idx_fields_created_at" ON "fields"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_fields_projects_id" ON "fields"("projects_id");

-- CreateIndex
CREATE INDEX "idx_sections_created_at" ON "sections"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_sections_fields_id" ON "sections"("fields_id");

-- CreateIndex
CREATE INDEX "idx_rows_created_at" ON "rows"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_rows_sections_id" ON "rows"("sections_id");

-- CreateIndex
CREATE INDEX "idx_rows_trackers_created_at" ON "rows_trackers"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_rows_trackers_rows_id" ON "rows_trackers"("rows_id");

-- CreateIndex
CREATE INDEX "idx_rows_trackers_statuses_id" ON "rows_trackers"("rows_trackers_statuses_id");

-- CreateIndex
CREATE INDEX "idx_rows_trackers_trackers_id" ON "rows_trackers"("trackers_id");

-- CreateIndex
CREATE INDEX "idx_rows_stakes_rows_trackers_id" ON "rows_stakes"("rows_trackers_id");

-- CreateIndex
CREATE INDEX "idx_rows_stakes_stakes_id" ON "rows_stakes"("stakes_id");

-- CreateIndex
CREATE INDEX "idx_rows_stakes_statuses_id" ON "rows_stakes"("stakes_statuses_id");

-- CreateIndex
CREATE INDEX "idx_modules_trackers_modules_id" ON "modules_trackers"("modules_id");

-- CreateIndex
CREATE INDEX "idx_modules_trackers_rows_trackers_id" ON "modules_trackers"("rows_trackers_id");

-- CreateIndex
CREATE INDEX "idx_teams_created_at" ON "teams"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_teams_projects_id" ON "teams"("projects_id");

-- CreateIndex
CREATE INDEX "idx_teams_leaders_teams_id" ON "teams_leaders"("teams_id");

-- CreateIndex
CREATE INDEX "idx_teams_leaders_users_id" ON "teams_leaders"("users_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_leaders_users_id_teams_id_key" ON "teams_leaders"("users_id", "teams_id");

-- CreateIndex
CREATE INDEX "idx_teams_members_teams_id" ON "teams_members"("teams_id");

-- CreateIndex
CREATE INDEX "idx_teams_members_users_id" ON "teams_members"("users_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_members_users_id_teams_id_key" ON "teams_members"("users_id", "teams_id");

-- CreateIndex
CREATE INDEX "idx_discipline_company_id" ON "discipline"("company_id");

-- CreateIndex
CREATE INDEX "idx_discipline_created_at" ON "discipline"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_unity_company_id" ON "unity"("company_id");

-- CreateIndex
CREATE INDEX "idx_unity_created_at" ON "unity"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_tasks_template_company_id" ON "tasks_template"("company_id");

-- CreateIndex
CREATE INDEX "idx_tasks_template_created_at" ON "tasks_template"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_tasks_template_discipline_id" ON "tasks_template"("discipline_id");

-- CreateIndex
CREATE INDEX "idx_tasks_template_equipaments_types_id" ON "tasks_template"("equipaments_types_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_created_at" ON "projects_backlogs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_discipline_id" ON "projects_backlogs"("discipline_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_fields_id" ON "projects_backlogs"("fields_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_parent_id" ON "projects_backlogs"("projects_backlogs_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_projects_id" ON "projects_backlogs"("projects_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_quality_status_id" ON "projects_backlogs"("quality_status_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_rows_id" ON "projects_backlogs"("rows_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_rows_stakes_id" ON "projects_backlogs"("rows_stakes_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_rows_trackers_id" ON "projects_backlogs"("rows_trackers_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_sections_id" ON "projects_backlogs"("sections_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_statuses_id" ON "projects_backlogs"("projects_backlogs_statuses_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_tasks_template_id" ON "projects_backlogs"("tasks_template_id");

-- CreateIndex
CREATE INDEX "idx_projects_backlogs_trackers_id" ON "projects_backlogs"("trackers_id");

-- CreateIndex
CREATE INDEX "idx_subtasks_created_at" ON "subtasks"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_subtasks_projects_backlogs_id" ON "subtasks"("projects_backlogs_id");

-- CreateIndex
CREATE INDEX "idx_subtasks_quality_status_id" ON "subtasks"("quality_status_id");

-- CreateIndex
CREATE INDEX "idx_subtasks_statuses_id" ON "subtasks"("subtasks_statuses_id");

-- CreateIndex
CREATE INDEX "idx_task_comments_created_at" ON "task_comments"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_task_comments_created_user_id" ON "task_comments"("created_user_id");

-- CreateIndex
CREATE INDEX "idx_task_comments_projects_backlogs_id" ON "task_comments"("projects_backlogs_id");

-- CreateIndex
CREATE INDEX "idx_task_comments_subtasks_id" ON "task_comments"("subtasks_id");

-- CreateIndex
CREATE INDEX "idx_sprints_created_at" ON "sprints"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_sprints_end_date" ON "sprints"("end_date");

-- CreateIndex
CREATE INDEX "idx_sprints_projects_id" ON "sprints"("projects_id");

-- CreateIndex
CREATE INDEX "idx_sprints_start_date" ON "sprints"("start_date");

-- CreateIndex
CREATE INDEX "idx_sprints_statuses_id" ON "sprints"("sprints_statuses_id");

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_created_at" ON "sprints_tasks"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_projects_backlogs_id" ON "sprints_tasks"("projects_backlogs_id");

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_scheduled_for" ON "sprints_tasks"("scheduled_for");

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_sprints_id" ON "sprints_tasks"("sprints_id");

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_statuses_id" ON "sprints_tasks"("sprints_tasks_statuses_id");

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_subtasks_id" ON "sprints_tasks"("subtasks_id");

-- CreateIndex
CREATE INDEX "idx_sprints_tasks_teams_id" ON "sprints_tasks"("teams_id");

-- CreateIndex
CREATE INDEX "idx_sprint_task_change_log_created_at" ON "sprint_task_change_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_sprint_task_change_log_sprints_tasks_id" ON "sprint_task_change_log"("sprints_tasks_id");

-- CreateIndex
CREATE INDEX "idx_sprint_task_change_log_users_id" ON "sprint_task_change_log"("users_id");

-- CreateIndex
CREATE INDEX "idx_schedule_created_at" ON "schedule"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_schedule_daily_report_id" ON "schedule"("daily_report_id");

-- CreateIndex
CREATE INDEX "idx_schedule_date" ON "schedule"("schedule_date");

-- CreateIndex
CREATE INDEX "idx_schedule_projects_id" ON "schedule"("projects_id");

-- CreateIndex
CREATE INDEX "idx_schedule_sprints_id" ON "schedule"("sprints_id");

-- CreateIndex
CREATE INDEX "idx_schedule_teams_id" ON "schedule"("teams_id");

-- CreateIndex
CREATE INDEX "idx_schedule_sprints_tasks_schedule_id" ON "schedule_sprints_tasks"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_schedule_sprints_tasks_sprints_tasks_id" ON "schedule_sprints_tasks"("sprints_tasks_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_sprints_tasks_schedule_id_sprints_tasks_id_key" ON "schedule_sprints_tasks"("schedule_id", "sprints_tasks_id");

-- CreateIndex
CREATE INDEX "idx_schedule_user_schedule_id" ON "schedule_user"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_schedule_user_users_id" ON "schedule_user"("users_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_user_schedule_id_users_id_key" ON "schedule_user"("schedule_id", "users_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_created_at" ON "daily_report"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_daily_report_projects_id" ON "daily_report"("projects_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_rdo_date" ON "daily_report"("rdo_date");

-- CreateIndex
CREATE INDEX "idx_product_inventory_code" ON "product_inventory"("code");

-- CreateIndex
CREATE INDEX "idx_product_inventory_created_at" ON "product_inventory"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_product_inventory_equipaments_types_id" ON "product_inventory"("equipaments_types_id");

-- CreateIndex
CREATE INDEX "idx_product_inventory_manufacturers_id" ON "product_inventory"("manufacturers_id");

-- CreateIndex
CREATE INDEX "idx_product_inventory_product_normalized" ON "product_inventory"("product_normalized");

-- CreateIndex
CREATE INDEX "idx_product_inventory_projects_id" ON "product_inventory"("projects_id");

-- CreateIndex
CREATE INDEX "idx_product_inventory_status_inventory_id" ON "product_inventory"("status_inventory_id");

-- CreateIndex
CREATE INDEX "idx_inventory_logs_created_at" ON "inventory_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_inventory_logs_product_inventory_id" ON "inventory_logs"("product_inventory_id");

-- CreateIndex
CREATE INDEX "idx_inventory_logs_projects_id" ON "inventory_logs"("projects_id");

-- CreateIndex
CREATE INDEX "idx_inventory_logs_responsible_users_id" ON "inventory_logs"("responsible_users_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_company_id" ON "subscriptions"("company_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_created_at" ON "subscriptions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_stripe_subscription_id" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "idx_session_company_id" ON "session"("company_id");

-- CreateIndex
CREATE INDEX "idx_session_created_at" ON "session"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_session_session_id" ON "session"("session_id");

-- CreateIndex
CREATE INDEX "idx_session_subscriptions_id" ON "session"("subscriptions_id");

-- CreateIndex
CREATE INDEX "idx_agent_log_dashboard_created_at" ON "agent_log_dashboard"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_agent_log_dashboard_object_answer" ON "agent_log_dashboard" USING GIN ("object_answer" jsonb_path_ops);

-- CreateIndex
CREATE INDEX "idx_agent_log_dashboard_user_id" ON "agent_log_dashboard"("user_id");

-- AddForeignKey
ALTER TABLE "users_permissions" ADD CONSTRAINT "fk_users_permissions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_permissions" ADD CONSTRAINT "users_permissions_users_control_system_id_fkey" FOREIGN KEY ("users_control_system_id") REFERENCES "users_control_system"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_permissions" ADD CONSTRAINT "users_permissions_users_roles_id_fkey" FOREIGN KEY ("users_roles_id") REFERENCES "users_roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_permissions" ADD CONSTRAINT "users_permissions_users_system_access_id_fkey" FOREIGN KEY ("users_system_access_id") REFERENCES "users_system_access"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_users_permissions_id_fkey" FOREIGN KEY ("users_permissions_id") REFERENCES "users_permissions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_status_payment_id_fkey" FOREIGN KEY ("status_payment_id") REFERENCES "status_payment"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "manufacturers" ADD CONSTRAINT "manufacturers_equipaments_types_id_fkey" FOREIGN KEY ("equipaments_types_id") REFERENCES "equipaments_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trackers" ADD CONSTRAINT "trackers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trackers" ADD CONSTRAINT "trackers_manufacturers_id_fkey" FOREIGN KEY ("manufacturers_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trackers" ADD CONSTRAINT "trackers_trackers_types_id_fkey" FOREIGN KEY ("trackers_types_id") REFERENCES "trackers_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stakes" ADD CONSTRAINT "stakes_stakes_types_id_fkey" FOREIGN KEY ("stakes_types_id") REFERENCES "stakes_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stakes" ADD CONSTRAINT "stakes_trackers_id_fkey" FOREIGN KEY ("trackers_id") REFERENCES "trackers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_manufacturers_id_fkey" FOREIGN KEY ("manufacturers_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_modules_types_id_fkey" FOREIGN KEY ("modules_types_id") REFERENCES "modules_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_projects_statuses_id_fkey" FOREIGN KEY ("projects_statuses_id") REFERENCES "projects_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_projects_works_situations_id_fkey" FOREIGN KEY ("projects_works_situations_id") REFERENCES "projects_works_situations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_users" ADD CONSTRAINT "projects_users_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_users" ADD CONSTRAINT "projects_users_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_steps" ADD CONSTRAINT "projects_steps_projects_backlog_config_status_fkey" FOREIGN KEY ("projects_backlog_config_status") REFERENCES "projects_steps_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_steps" ADD CONSTRAINT "projects_steps_projects_config_status_fkey" FOREIGN KEY ("projects_config_status") REFERENCES "projects_steps_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_steps" ADD CONSTRAINT "projects_steps_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_steps" ADD CONSTRAINT "projects_steps_projects_map_config_status_fkey" FOREIGN KEY ("projects_map_config_status") REFERENCES "projects_steps_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_steps" ADD CONSTRAINT "projects_steps_projects_report_config_status_fkey" FOREIGN KEY ("projects_report_config_status") REFERENCES "projects_steps_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_steps" ADD CONSTRAINT "projects_steps_projects_sprint_config_status_fkey" FOREIGN KEY ("projects_sprint_config_status") REFERENCES "projects_steps_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_steps" ADD CONSTRAINT "projects_steps_projects_teams_config_status_fkey" FOREIGN KEY ("projects_teams_config_status") REFERENCES "projects_steps_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_fields_id_fkey" FOREIGN KEY ("fields_id") REFERENCES "fields"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rows" ADD CONSTRAINT "rows_sections_id_fkey" FOREIGN KEY ("sections_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rows_trackers" ADD CONSTRAINT "rows_trackers_rows_id_fkey" FOREIGN KEY ("rows_id") REFERENCES "rows"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rows_trackers" ADD CONSTRAINT "rows_trackers_rows_trackers_statuses_id_fkey" FOREIGN KEY ("rows_trackers_statuses_id") REFERENCES "rows_trackers_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rows_trackers" ADD CONSTRAINT "rows_trackers_trackers_id_fkey" FOREIGN KEY ("trackers_id") REFERENCES "trackers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rows_stakes" ADD CONSTRAINT "rows_stakes_rows_trackers_id_fkey" FOREIGN KEY ("rows_trackers_id") REFERENCES "rows_trackers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rows_stakes" ADD CONSTRAINT "rows_stakes_stakes_id_fkey" FOREIGN KEY ("stakes_id") REFERENCES "stakes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rows_stakes" ADD CONSTRAINT "rows_stakes_stakes_statuses_id_fkey" FOREIGN KEY ("stakes_statuses_id") REFERENCES "stakes_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modules_trackers" ADD CONSTRAINT "modules_trackers_modules_id_fkey" FOREIGN KEY ("modules_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modules_trackers" ADD CONSTRAINT "modules_trackers_rows_trackers_id_fkey" FOREIGN KEY ("rows_trackers_id") REFERENCES "rows_trackers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams_leaders" ADD CONSTRAINT "teams_leaders_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams_leaders" ADD CONSTRAINT "teams_leaders_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams_members" ADD CONSTRAINT "teams_members_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teams_members" ADD CONSTRAINT "teams_members_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unity" ADD CONSTRAINT "unity_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks_template" ADD CONSTRAINT "tasks_template_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks_template" ADD CONSTRAINT "tasks_template_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks_template" ADD CONSTRAINT "tasks_template_equipaments_types_id_fkey" FOREIGN KEY ("equipaments_types_id") REFERENCES "equipaments_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks_template" ADD CONSTRAINT "tasks_template_unity_id_fkey" FOREIGN KEY ("unity_id") REFERENCES "unity"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "fk_projects_backlogs_subtasks" FOREIGN KEY ("subtasks_id") REFERENCES "subtasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_equipaments_types_id_fkey" FOREIGN KEY ("equipaments_types_id") REFERENCES "equipaments_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_fields_id_fkey" FOREIGN KEY ("fields_id") REFERENCES "fields"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_projects_backlogs_statuses_id_fkey" FOREIGN KEY ("projects_backlogs_statuses_id") REFERENCES "projects_backlogs_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_quality_status_id_fkey" FOREIGN KEY ("quality_status_id") REFERENCES "quality_status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_rows_id_fkey" FOREIGN KEY ("rows_id") REFERENCES "rows"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_rows_stakes_id_fkey" FOREIGN KEY ("rows_stakes_id") REFERENCES "rows_stakes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_rows_trackers_id_fkey" FOREIGN KEY ("rows_trackers_id") REFERENCES "rows_trackers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_sections_id_fkey" FOREIGN KEY ("sections_id") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_tasks_template_id_fkey" FOREIGN KEY ("tasks_template_id") REFERENCES "tasks_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_trackers_id_fkey" FOREIGN KEY ("trackers_id") REFERENCES "trackers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects_backlogs" ADD CONSTRAINT "projects_backlogs_unity_id_fkey" FOREIGN KEY ("unity_id") REFERENCES "unity"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_quality_status_id_fkey" FOREIGN KEY ("quality_status_id") REFERENCES "quality_status"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_subtasks_statuses_id_fkey" FOREIGN KEY ("subtasks_statuses_id") REFERENCES "subtasks_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_unity_id_fkey" FOREIGN KEY ("unity_id") REFERENCES "unity"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_created_user_id_fkey" FOREIGN KEY ("created_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_subtasks_id_fkey" FOREIGN KEY ("subtasks_id") REFERENCES "subtasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_sprints_statuses_id_fkey" FOREIGN KEY ("sprints_statuses_id") REFERENCES "sprints_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_sprints_id_fkey" FOREIGN KEY ("sprints_id") REFERENCES "sprints"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_sprints_tasks_statuses_id_fkey" FOREIGN KEY ("sprints_tasks_statuses_id") REFERENCES "sprints_tasks_statuses"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_subtasks_id_fkey" FOREIGN KEY ("subtasks_id") REFERENCES "subtasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprint_task_change_log" ADD CONSTRAINT "sprint_task_change_log_sprints_tasks_id_fkey" FOREIGN KEY ("sprints_tasks_id") REFERENCES "sprints_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprint_task_change_log" ADD CONSTRAINT "sprint_task_change_log_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_sprints_id_fkey" FOREIGN KEY ("sprints_id") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_sprints_tasks" ADD CONSTRAINT "schedule_sprints_tasks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_sprints_tasks" ADD CONSTRAINT "schedule_sprints_tasks_sprints_tasks_id_fkey" FOREIGN KEY ("sprints_tasks_id") REFERENCES "sprints_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_user" ADD CONSTRAINT "schedule_user_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_user" ADD CONSTRAINT "schedule_user_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_equipaments_types_id_fkey" FOREIGN KEY ("equipaments_types_id") REFERENCES "equipaments_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_manufacturers_id_fkey" FOREIGN KEY ("manufacturers_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_status_inventory_id_fkey" FOREIGN KEY ("status_inventory_id") REFERENCES "status_inventory"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_inventory" ADD CONSTRAINT "product_inventory_unity_id_fkey" FOREIGN KEY ("unity_id") REFERENCES "unity"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_product_inventory_id_fkey" FOREIGN KEY ("product_inventory_id") REFERENCES "product_inventory"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_received_user_fkey" FOREIGN KEY ("received_user") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_responsible_users_id_fkey" FOREIGN KEY ("responsible_users_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_subscriptions_id_fkey" FOREIGN KEY ("subscriptions_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
