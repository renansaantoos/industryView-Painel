-- CreateEnum
CREATE TYPE "incident_severity" AS ENUM ('quase_acidente', 'primeiros_socorros', 'sem_afastamento', 'com_afastamento', 'fatal');

-- CreateEnum
CREATE TYPE "incident_classification" AS ENUM ('tipico', 'trajeto', 'doenca_ocupacional');

-- CreateEnum
CREATE TYPE "incident_status" AS ENUM ('registrado', 'em_investigacao', 'investigado', 'encerrado');

-- CreateEnum
CREATE TYPE "rdo_status" AS ENUM ('rascunho', 'finalizado', 'aprovado', 'rejeitado');

-- CreateEnum
CREATE TYPE "weather_type" AS ENUM ('sol', 'nublado', 'chuva', 'chuva_forte', 'vento_forte');

-- CreateEnum
CREATE TYPE "nc_severity" AS ENUM ('menor', 'maior', 'critica');

-- CreateEnum
CREATE TYPE "nc_status" AS ENUM ('aberta', 'em_analise', 'em_tratamento', 'verificacao', 'encerrada');

-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('procedimento', 'instrucao_trabalho', 'projeto', 'certificado', 'licenca', 'laudo', 'contrato', 'ata', 'relatorio');

-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('em_elaboracao', 'em_revisao', 'aprovado', 'obsoleto');

-- CreateEnum
CREATE TYPE "dependency_type" AS ENUM ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish');

-- CreateEnum
CREATE TYPE "permit_type" AS ENUM ('pt_geral', 'pt_quente', 'pt_altura', 'pt_confinado', 'pt_eletrica');

-- CreateEnum
CREATE TYPE "permit_status" AS ENUM ('solicitada', 'aprovada', 'ativa', 'encerrada', 'cancelada');

-- CreateEnum
CREATE TYPE "checklist_response_type" AS ENUM ('sim_nao', 'conforme_nao_conforme', 'nota_1_5', 'texto');

-- CreateEnum
CREATE TYPE "module_name" AS ENUM ('CORE', 'SSMA', 'QUALIDADE', 'PLANEJAMENTO', 'CONTRATOS');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('create', 'update', 'delete', 'status_change', 'approval');

-- CreateEnum
CREATE TYPE "measurement_status" AS ENUM ('rascunho', 'submetida', 'aprovada', 'rejeitada');

-- CreateEnum
CREATE TYPE "claim_status" AS ENUM ('aberta', 'em_analise', 'aceita', 'rejeitada', 'encerrada');

-- CreateEnum
CREATE TYPE "commissioning_status" AS ENUM ('pendente', 'em_andamento', 'concluido', 'reprovado');

-- CreateEnum
CREATE TYPE "punch_priority" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "license_status" AS ENUM ('vigente', 'vencida', 'em_renovacao', 'cancelada');

-- CreateEnum
CREATE TYPE "health_exam_type" AS ENUM ('admissional', 'periodico', 'retorno_trabalho', 'mudanca_funcao', 'demissional');

-- CreateEnum
CREATE TYPE "requisition_status" AS ENUM ('rascunho', 'submetida', 'aprovada', 'rejeitada', 'atendida_parcial', 'atendida', 'cancelada');

-- AlterTable
ALTER TABLE "company" ADD COLUMN     "bairro" VARCHAR(100),
ADD COLUMN     "cnae" VARCHAR(10),
ADD COLUMN     "company_type" VARCHAR(10) DEFAULT 'matriz',
ADD COLUMN     "complemento" VARCHAR(100),
ADD COLUMN     "inscricao_estadual" VARCHAR(20),
ADD COLUMN     "inscricao_municipal" VARCHAR(20),
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "pais" VARCHAR(60) DEFAULT 'Brasil',
ADD COLUMN     "regime_tributario" VARCHAR(30),
ADD COLUMN     "responsavel_cpf" VARCHAR(14),
ADD COLUMN     "responsavel_legal" VARCHAR(120),
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "daily_report" ADD COLUMN     "approved_at" TIMESTAMPTZ(6),
ADD COLUMN     "approved_by_user_id" BIGINT,
ADD COLUMN     "created_by_user_id" BIGINT,
ADD COLUMN     "general_observations" TEXT,
ADD COLUMN     "rdo_number" INTEGER,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "safety_topic" TEXT,
ADD COLUMN     "shift" VARCHAR(20),
ADD COLUMN     "status" VARCHAR(20) DEFAULT 'rascunho',
ADD COLUMN     "temperature_max" DECIMAL(5,1),
ADD COLUMN     "temperature_min" DECIMAL(5,1),
ADD COLUMN     "weather_afternoon" VARCHAR(30),
ADD COLUMN     "weather_morning" VARCHAR(30),
ADD COLUMN     "weather_night" VARCHAR(30);

-- AlterTable
ALTER TABLE "employees_hr_data" ADD COLUMN     "nome_completo" TEXT;

-- AlterTable
ALTER TABLE "product_inventory" ADD COLUMN     "barcode" VARCHAR(14),
ADD COLUMN     "batch_lot" VARCHAR(100),
ADD COLUMN     "cest_code" VARCHAR(7),
ADD COLUMN     "cost_price" DECIMAL(12,2),
ADD COLUMN     "custody_type" VARCHAR(20),
ADD COLUMN     "fiscal_classification" TEXT,
ADD COLUMN     "ncm_code" VARCHAR(8),
ADD COLUMN     "origin_indicator" SMALLINT;

-- AlterTable
ALTER TABLE "projects_backlogs" ADD COLUMN     "actual_cost" DECIMAL(14,2),
ADD COLUMN     "actual_end_date" DATE,
ADD COLUMN     "actual_start_date" DATE,
ADD COLUMN     "import_source_id" VARCHAR(100),
ADD COLUMN     "is_milestone" BOOLEAN DEFAULT false,
ADD COLUMN     "level" INTEGER DEFAULT 0,
ADD COLUMN     "percent_complete" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN     "planned_cost" DECIMAL(14,2),
ADD COLUMN     "planned_duration_days" INTEGER,
ADD COLUMN     "planned_end_date" DATE,
ADD COLUMN     "planned_start_date" DATE,
ADD COLUMN     "sort_order" INTEGER DEFAULT 0,
ADD COLUMN     "wbs_code" VARCHAR(50);

-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "shift" VARCHAR(20),
ADD COLUMN     "weather_condition" VARCHAR(30);

-- AlterTable
ALTER TABLE "sprints_tasks" ADD COLUMN     "actual_end_time" TIMESTAMPTZ(6),
ADD COLUMN     "actual_start_time" TIMESTAMPTZ(6),
ADD COLUMN     "assigned_user_id" BIGINT,
ADD COLUMN     "criticality" VARCHAR(20),
ADD COLUMN     "non_execution_observations" TEXT,
ADD COLUMN     "non_execution_reason_id" BIGINT;

-- AlterTable
ALTER TABLE "tasks_template" ADD COLUMN     "checklist_templates_id" BIGINT,
ADD COLUMN     "installation_method" TEXT;

-- CreateTable
CREATE TABLE "company_branches" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "brand_name" VARCHAR(120) NOT NULL,
    "legal_name" TEXT,
    "cnpj" VARCHAR(18),
    "inscricao_estadual" VARCHAR(20),
    "inscricao_municipal" VARCHAR(20),
    "cnae" VARCHAR(10),
    "phone" VARCHAR(20),
    "email" TEXT,
    "website" VARCHAR(255),
    "cep" VARCHAR(9),
    "address_line" TEXT,
    "complemento" VARCHAR(100),
    "numero" VARCHAR(20),
    "bairro" VARCHAR(100),
    "city" VARCHAR(100),
    "state" CHAR(2),
    "pais" VARCHAR(60) DEFAULT 'Brasil',
    "responsavel_legal" VARCHAR(120),
    "responsavel_cpf" VARCHAR(14),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "company_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report_workforce" (
    "id" BIGSERIAL NOT NULL,
    "daily_report_id" BIGINT NOT NULL,
    "role_category" VARCHAR(100) NOT NULL,
    "quantity_planned" INTEGER NOT NULL DEFAULT 0,
    "quantity_present" INTEGER NOT NULL DEFAULT 0,
    "quantity_absent" INTEGER DEFAULT 0,
    "absence_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "daily_report_workforce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report_activities" (
    "id" BIGSERIAL NOT NULL,
    "daily_report_id" BIGINT NOT NULL,
    "projects_backlogs_id" BIGINT,
    "description" TEXT NOT NULL,
    "quantity_done" DECIMAL(10,2),
    "unity_id" BIGINT,
    "teams_id" BIGINT,
    "location_description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "daily_report_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report_occurrences" (
    "id" BIGSERIAL NOT NULL,
    "daily_report_id" BIGINT NOT NULL,
    "occurrence_type" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMETZ(6),
    "end_time" TIMETZ(6),
    "duration_hours" DECIMAL(5,2),
    "impact_description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "daily_report_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report_equipment" (
    "id" BIGSERIAL NOT NULL,
    "daily_report_id" BIGINT NOT NULL,
    "equipaments_types_id" BIGINT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "operation_hours" DECIMAL(5,2),
    "idle_hours" DECIMAL(5,2),
    "idle_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "daily_report_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_modules" (
    "id" BIGSERIAL NOT NULL,
    "company_id" BIGINT NOT NULL,
    "module_name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "company_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_baselines" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "sprints_id" BIGINT,
    "baseline_number" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ativo',
    "snapshot_data" JSONB,
    "created_by" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "schedule_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_imports" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(20) NOT NULL,
    "total_tasks" INTEGER NOT NULL DEFAULT 0,
    "imported_tasks" INTEGER NOT NULL DEFAULT 0,
    "failed_tasks" INTEGER NOT NULL DEFAULT 0,
    "import_mode" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "error_log" JSONB,
    "column_mapping" JSONB,
    "created_by" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_dependencies" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "predecessor_backlog_id" BIGINT NOT NULL,
    "successor_backlog_id" BIGINT NOT NULL,
    "dependency_type" VARCHAR(10) NOT NULL DEFAULT 'FS',
    "lag_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_incidents" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "incident_number" VARCHAR(30) NOT NULL,
    "incident_date" DATE NOT NULL,
    "incident_time" TIME(6),
    "severity" "incident_severity" NOT NULL,
    "classification" "incident_classification" NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "immediate_cause" TEXT,
    "root_cause" TEXT,
    "corrective_actions" TEXT,
    "location_description" TEXT,
    "body_part_affected" TEXT,
    "days_lost" INTEGER NOT NULL DEFAULT 0,
    "cat_number" VARCHAR(30),
    "cat_issued_at" TIMESTAMPTZ(6),
    "status" "incident_status" NOT NULL DEFAULT 'registrado',
    "reported_by_user_id" BIGINT NOT NULL,
    "investigated_by_user_id" BIGINT,
    "closed_by_user_id" BIGINT,
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_incident_witnesses" (
    "id" BIGSERIAL NOT NULL,
    "safety_incidents_id" BIGINT NOT NULL,
    "witness_name" TEXT NOT NULL,
    "witness_role" TEXT,
    "witness_statement" TEXT,
    "users_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_incident_witnesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_incident_attachments" (
    "id" BIGSERIAL NOT NULL,
    "safety_incidents_id" BIGINT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "uploaded_by_user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_incident_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_types" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nr_reference" VARCHAR(20),
    "validity_months" INTEGER,
    "is_mandatory_for_admission" BOOLEAN NOT NULL DEFAULT false,
    "workload_hours" INTEGER,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "training_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_trainings" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "training_types_id" BIGINT NOT NULL,
    "training_date" DATE NOT NULL,
    "expiry_date" DATE,
    "instructor_name" TEXT NOT NULL,
    "institution" TEXT,
    "certificate_number" VARCHAR(50),
    "certificate_file" TEXT,
    "workload_hours" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'valido',
    "projects_id" BIGINT,
    "registered_by_user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_required_trainings" (
    "id" BIGSERIAL NOT NULL,
    "tasks_template_id" BIGINT NOT NULL,
    "training_types_id" BIGINT NOT NULL,
    "is_blocking" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "task_required_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dds_records" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "dds_date" DATE NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "conducted_by_user_id" BIGINT NOT NULL,
    "teams_id" BIGINT,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "duration_minutes" INTEGER,
    "evidence_image" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dds_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dds_participants" (
    "id" BIGSERIAL NOT NULL,
    "dds_records_id" BIGINT NOT NULL,
    "users_id" BIGINT NOT NULL,
    "signed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dds_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "non_conformances" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "nc_number" VARCHAR(30) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "origin" VARCHAR(30) NOT NULL,
    "severity" "nc_severity" NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "projects_backlogs_id" BIGINT,
    "location_description" TEXT,
    "evidence_description" TEXT,
    "immediate_action" TEXT,
    "root_cause_analysis" TEXT,
    "corrective_action_plan" TEXT,
    "preventive_action" TEXT,
    "deadline" DATE,
    "status" "nc_status" NOT NULL DEFAULT 'aberta',
    "opened_by_user_id" BIGINT NOT NULL,
    "responsible_user_id" BIGINT,
    "closed_by_user_id" BIGINT,
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "non_conformances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "non_conformance_attachments" (
    "id" BIGSERIAL NOT NULL,
    "non_conformances_id" BIGINT NOT NULL,
    "file_url" TEXT NOT NULL,
    "description" TEXT,
    "uploaded_by_user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "non_conformance_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT,
    "document_number" VARCHAR(50) NOT NULL,
    "title" TEXT NOT NULL,
    "document_type" "document_type" NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "revision" VARCHAR(20) NOT NULL DEFAULT 'Rev 00',
    "revision_date" DATE,
    "status" "document_status" NOT NULL DEFAULT 'em_elaboracao',
    "file_url" TEXT,
    "valid_until" DATE,
    "requires_acknowledgment" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_by_user_id" BIGINT NOT NULL,
    "approved_by_user_id" BIGINT,
    "approved_at" TIMESTAMPTZ(6),
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_acknowledgments" (
    "id" BIGSERIAL NOT NULL,
    "documents_id" BIGINT NOT NULL,
    "users_id" BIGINT NOT NULL,
    "acknowledged_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_acknowledgments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_documents" (
    "id" BIGSERIAL NOT NULL,
    "documents_id" BIGINT NOT NULL,
    "tasks_template_id" BIGINT,
    "projects_backlogs_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "task_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permits" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "permit_number" VARCHAR(30) NOT NULL,
    "permit_type" "permit_type" NOT NULL,
    "projects_backlogs_id" BIGINT,
    "location_description" TEXT,
    "risk_description" TEXT NOT NULL,
    "control_measures" TEXT NOT NULL,
    "emergency_procedures" TEXT,
    "valid_from" TIMESTAMPTZ(6) NOT NULL,
    "valid_until" TIMESTAMPTZ(6) NOT NULL,
    "status" "permit_status" NOT NULL DEFAULT 'solicitada',
    "requested_by_user_id" BIGINT NOT NULL,
    "approved_by_user_id" BIGINT,
    "closed_by_user_id" BIGINT,
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permit_signatures" (
    "id" BIGSERIAL NOT NULL,
    "work_permits_id" BIGINT NOT NULL,
    "users_id" BIGINT NOT NULL,
    "role" VARCHAR(30) NOT NULL,
    "signed_at" TIMESTAMPTZ(6),
    "signature_type" VARCHAR(20) NOT NULL DEFAULT 'digital',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_permit_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "checklist_type" VARCHAR(30) NOT NULL,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_template_checklists" (
    "id" BIGSERIAL NOT NULL,
    "tasks_template_id" BIGINT NOT NULL,
    "checklist_templates_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_template_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_template_items" (
    "id" BIGSERIAL NOT NULL,
    "checklist_templates_id" BIGINT NOT NULL,
    "item_order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "response_type" "checklist_response_type" NOT NULL DEFAULT 'sim_nao',
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "checklist_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_responses" (
    "id" BIGSERIAL NOT NULL,
    "checklist_templates_id" BIGINT NOT NULL,
    "projects_backlogs_id" BIGINT,
    "sprints_tasks_id" BIGINT,
    "responded_by_user_id" BIGINT NOT NULL,
    "response_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "overall_result" VARCHAR(30),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_response_items" (
    "id" BIGSERIAL NOT NULL,
    "checklist_responses_id" BIGINT NOT NULL,
    "checklist_template_items_id" BIGINT NOT NULL,
    "response_value" TEXT,
    "observations" TEXT,
    "evidence_image" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_response_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "golden_rules" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "severity" VARCHAR(20) DEFAULT 'media',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "golden_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_golden_rules" (
    "id" BIGSERIAL NOT NULL,
    "tasks_template_id" BIGINT NOT NULL,
    "golden_rules_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "task_golden_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppe_types" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ca_number" VARCHAR(30),
    "validity_months" INTEGER,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "ppe_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppe_deliveries" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "ppe_types_id" BIGINT NOT NULL,
    "delivery_date" DATE NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "delivered_by_user_id" BIGINT NOT NULL,
    "signature_file" TEXT,
    "return_date" DATE,
    "condition_on_return" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ppe_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_required_ppe" (
    "id" BIGSERIAL NOT NULL,
    "tasks_template_id" BIGINT NOT NULL,
    "ppe_types_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "task_required_ppe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workforce_daily_log" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "log_date" DATE NOT NULL,
    "teams_id" BIGINT,
    "users_id" BIGINT NOT NULL,
    "check_in" TIMESTAMPTZ(6),
    "check_out" TIMESTAMPTZ(6),
    "hours_normal" DECIMAL(5,2) DEFAULT 0,
    "hours_overtime" DECIMAL(5,2) DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'presente',
    "registered_by_user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workforce_daily_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "non_execution_reasons" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "non_execution_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" VARCHAR(50) NOT NULL,
    "reference_type" VARCHAR(50),
    "reference_id" BIGINT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" BIGINT NOT NULL,
    "action" "audit_action" NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "users_id" BIGINT NOT NULL,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_measurements" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "measurement_number" INTEGER NOT NULL,
    "measurement_period_start" DATE NOT NULL,
    "measurement_period_end" DATE NOT NULL,
    "total_value" DECIMAL(14,2),
    "status" "measurement_status" NOT NULL DEFAULT 'rascunho',
    "observations" TEXT,
    "created_by_user_id" BIGINT NOT NULL,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "contract_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_items" (
    "id" BIGSERIAL NOT NULL,
    "contract_measurements_id" BIGINT NOT NULL,
    "projects_backlogs_id" BIGINT,
    "description" TEXT NOT NULL,
    "unity" VARCHAR(20),
    "quantity_measured" DECIMAL(10,2),
    "unit_price" DECIMAL(14,2),
    "total_price" DECIMAL(14,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_claims" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "claim_number" VARCHAR(30) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "claim_type" VARCHAR(30) NOT NULL,
    "claimed_value" DECIMAL(14,2),
    "approved_value" DECIMAL(14,2),
    "status" "claim_status" NOT NULL DEFAULT 'aberta',
    "submitted_at" TIMESTAMPTZ(6),
    "created_by_user_id" BIGINT NOT NULL,
    "closed_by_user_id" BIGINT,
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "contract_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_evidences" (
    "id" BIGSERIAL NOT NULL,
    "contract_claims_id" BIGINT NOT NULL,
    "file_url" TEXT NOT NULL,
    "description" TEXT,
    "evidence_type" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissioning_systems" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "system_name" TEXT NOT NULL,
    "system_code" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "status" "commissioning_status" NOT NULL DEFAULT 'pendente',
    "planned_date" DATE,
    "actual_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "commissioning_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissioning_punch_list" (
    "id" BIGSERIAL NOT NULL,
    "commissioning_systems_id" BIGINT NOT NULL,
    "item_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "punch_priority" NOT NULL DEFAULT 'B',
    "responsible" TEXT,
    "status" "commissioning_status" NOT NULL DEFAULT 'pendente',
    "due_date" DATE,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissioning_punch_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissioning_certificates" (
    "id" BIGSERIAL NOT NULL,
    "commissioning_systems_id" BIGINT NOT NULL,
    "certificate_type" VARCHAR(50) NOT NULL,
    "certificate_number" VARCHAR(50),
    "issued_date" DATE,
    "file_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commissioning_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_licenses" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "license_type" VARCHAR(50) NOT NULL,
    "license_number" VARCHAR(50) NOT NULL,
    "issuing_agency" TEXT,
    "issued_date" DATE,
    "expiry_date" DATE,
    "status" "license_status" NOT NULL DEFAULT 'vigente',
    "file_url" TEXT,
    "observations" TEXT,
    "company_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "environmental_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_conditions" (
    "id" BIGSERIAL NOT NULL,
    "environmental_licenses_id" BIGINT NOT NULL,
    "condition_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "evidence_file" TEXT,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environmental_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_health_records" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "exam_type" "health_exam_type" NOT NULL,
    "exam_date" DATE NOT NULL,
    "expiry_date" DATE,
    "result" VARCHAR(20) NOT NULL DEFAULT 'apto',
    "restrictions" TEXT,
    "physician_name" TEXT,
    "physician_crm" VARCHAR(20),
    "file_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_requisitions" (
    "id" BIGSERIAL NOT NULL,
    "projects_id" BIGINT NOT NULL,
    "requisition_number" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "status" "requisition_status" NOT NULL DEFAULT 'rascunho',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'media',
    "needed_by_date" DATE,
    "created_by_user_id" BIGINT NOT NULL,
    "approved_by_user_id" BIGINT,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "material_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_requisition_items" (
    "id" BIGSERIAL NOT NULL,
    "material_requisitions_id" BIGINT NOT NULL,
    "product_description" TEXT NOT NULL,
    "quantity_requested" DECIMAL(10,2) NOT NULL,
    "quantity_approved" DECIMAL(10,2),
    "quantity_delivered" DECIMAL(10,2),
    "unity" VARCHAR(20),
    "observations" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_requisition_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees_day_offs" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "data" DATE NOT NULL,
    "motivo" TEXT,
    "horas_banco" DECIMAL(5,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pendente',
    "aprovado_por_id" BIGINT,
    "aprovado_em" TIMESTAMPTZ(6),
    "observacoes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "employees_day_offs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees_benefits" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(12,2),
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "employees_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees_career_history" (
    "id" BIGSERIAL NOT NULL,
    "users_id" BIGINT NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "cargo_anterior" TEXT,
    "cargo_novo" TEXT,
    "departamento_anterior" TEXT,
    "departamento_novo" TEXT,
    "salario_anterior" DECIMAL(12,2),
    "salario_novo" DECIMAL(12,2),
    "data_efetivacao" DATE NOT NULL,
    "motivo" TEXT,
    "observacoes" TEXT,
    "registrado_por_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_career_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_branches_company_id_idx" ON "company_branches"("company_id");

-- CreateIndex
CREATE INDEX "company_branches_created_at_idx" ON "company_branches"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_daily_report_workforce_report_id" ON "daily_report_workforce"("daily_report_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_workforce_created_at" ON "daily_report_workforce"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_daily_report_activities_report_id" ON "daily_report_activities"("daily_report_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_activities_backlog_id" ON "daily_report_activities"("projects_backlogs_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_activities_created_at" ON "daily_report_activities"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_daily_report_occurrences_report_id" ON "daily_report_occurrences"("daily_report_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_occurrences_type" ON "daily_report_occurrences"("occurrence_type");

-- CreateIndex
CREATE INDEX "idx_daily_report_occurrences_created_at" ON "daily_report_occurrences"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_daily_report_equipment_report_id" ON "daily_report_equipment"("daily_report_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_equipment_type_id" ON "daily_report_equipment"("equipaments_types_id");

-- CreateIndex
CREATE INDEX "idx_daily_report_equipment_created_at" ON "daily_report_equipment"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_company_modules_company_id" ON "company_modules"("company_id");

-- CreateIndex
CREATE INDEX "idx_company_modules_module_name" ON "company_modules"("module_name");

-- CreateIndex
CREATE UNIQUE INDEX "company_modules_company_id_module_name_key" ON "company_modules"("company_id", "module_name");

-- CreateIndex
CREATE INDEX "idx_schedule_baselines_projects_id" ON "schedule_baselines"("projects_id");

-- CreateIndex
CREATE INDEX "idx_schedule_baselines_sprints_id" ON "schedule_baselines"("sprints_id");

-- CreateIndex
CREATE INDEX "idx_schedule_baselines_number" ON "schedule_baselines"("baseline_number");

-- CreateIndex
CREATE INDEX "idx_schedule_baselines_status" ON "schedule_baselines"("status");

-- CreateIndex
CREATE INDEX "idx_schedule_baselines_created_at" ON "schedule_baselines"("created_at" DESC);

-- CreateIndex
CREATE INDEX "schedule_imports_projects_id_idx" ON "schedule_imports"("projects_id");

-- CreateIndex
CREATE INDEX "idx_task_dependencies_projects_id" ON "task_dependencies"("projects_id");

-- CreateIndex
CREATE INDEX "idx_task_dependencies_predecessor_id" ON "task_dependencies"("predecessor_backlog_id");

-- CreateIndex
CREATE INDEX "idx_task_dependencies_successor_id" ON "task_dependencies"("successor_backlog_id");

-- CreateIndex
CREATE INDEX "idx_task_dependencies_created_at" ON "task_dependencies"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "task_dependencies_predecessor_backlog_id_successor_backlog__key" ON "task_dependencies"("predecessor_backlog_id", "successor_backlog_id");

-- CreateIndex
CREATE INDEX "idx_safety_incidents_projects_id" ON "safety_incidents"("projects_id");

-- CreateIndex
CREATE INDEX "idx_safety_incidents_date" ON "safety_incidents"("incident_date");

-- CreateIndex
CREATE INDEX "idx_safety_incidents_severity" ON "safety_incidents"("severity");

-- CreateIndex
CREATE INDEX "idx_safety_incidents_status" ON "safety_incidents"("status");

-- CreateIndex
CREATE INDEX "idx_si_witnesses_incident_id" ON "safety_incident_witnesses"("safety_incidents_id");

-- CreateIndex
CREATE INDEX "idx_si_attachments_incident_id" ON "safety_incident_attachments"("safety_incidents_id");

-- CreateIndex
CREATE INDEX "idx_training_types_company_id" ON "training_types"("company_id");

-- CreateIndex
CREATE INDEX "idx_worker_trainings_users_id" ON "worker_trainings"("users_id");

-- CreateIndex
CREATE INDEX "idx_worker_trainings_type_id" ON "worker_trainings"("training_types_id");

-- CreateIndex
CREATE INDEX "idx_worker_trainings_expiry" ON "worker_trainings"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_task_req_trainings_template_id" ON "task_required_trainings"("tasks_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_required_trainings_tasks_template_id_training_types_id_key" ON "task_required_trainings"("tasks_template_id", "training_types_id");

-- CreateIndex
CREATE INDEX "idx_dds_records_projects_id" ON "dds_records"("projects_id");

-- CreateIndex
CREATE INDEX "idx_dds_records_date" ON "dds_records"("dds_date");

-- CreateIndex
CREATE INDEX "idx_dds_participants_record_id" ON "dds_participants"("dds_records_id");

-- CreateIndex
CREATE UNIQUE INDEX "dds_participants_dds_records_id_users_id_key" ON "dds_participants"("dds_records_id", "users_id");

-- CreateIndex
CREATE INDEX "idx_non_conformances_projects_id" ON "non_conformances"("projects_id");

-- CreateIndex
CREATE INDEX "idx_non_conformances_status" ON "non_conformances"("status");

-- CreateIndex
CREATE INDEX "idx_non_conformances_severity" ON "non_conformances"("severity");

-- CreateIndex
CREATE INDEX "idx_nc_attachments_nc_id" ON "non_conformance_attachments"("non_conformances_id");

-- CreateIndex
CREATE INDEX "idx_documents_company_id" ON "documents"("company_id");

-- CreateIndex
CREATE INDEX "idx_documents_type" ON "documents"("document_type");

-- CreateIndex
CREATE INDEX "idx_documents_status" ON "documents"("status");

-- CreateIndex
CREATE INDEX "idx_doc_ack_documents_id" ON "document_acknowledgments"("documents_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_acknowledgments_documents_id_users_id_key" ON "document_acknowledgments"("documents_id", "users_id");

-- CreateIndex
CREATE INDEX "idx_task_docs_documents_id" ON "task_documents"("documents_id");

-- CreateIndex
CREATE INDEX "idx_task_docs_template_id" ON "task_documents"("tasks_template_id");

-- CreateIndex
CREATE INDEX "idx_work_permits_projects_id" ON "work_permits"("projects_id");

-- CreateIndex
CREATE INDEX "idx_work_permits_status" ON "work_permits"("status");

-- CreateIndex
CREATE INDEX "idx_work_permits_valid_until" ON "work_permits"("valid_until");

-- CreateIndex
CREATE INDEX "idx_wp_signatures_permit_id" ON "work_permit_signatures"("work_permits_id");

-- CreateIndex
CREATE INDEX "idx_checklist_templates_company_id" ON "checklist_templates"("company_id");

-- CreateIndex
CREATE INDEX "task_template_checklists_tasks_template_id_idx" ON "task_template_checklists"("tasks_template_id");

-- CreateIndex
CREATE INDEX "task_template_checklists_checklist_templates_id_idx" ON "task_template_checklists"("checklist_templates_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_template_checklists_tasks_template_id_checklist_templa_key" ON "task_template_checklists"("tasks_template_id", "checklist_templates_id");

-- CreateIndex
CREATE INDEX "idx_cl_items_template_id" ON "checklist_template_items"("checklist_templates_id");

-- CreateIndex
CREATE INDEX "idx_cl_responses_template_id" ON "checklist_responses"("checklist_templates_id");

-- CreateIndex
CREATE INDEX "idx_cl_responses_backlog_id" ON "checklist_responses"("projects_backlogs_id");

-- CreateIndex
CREATE INDEX "idx_cl_resp_items_response_id" ON "checklist_response_items"("checklist_responses_id");

-- CreateIndex
CREATE INDEX "idx_golden_rules_company_id" ON "golden_rules"("company_id");

-- CreateIndex
CREATE INDEX "idx_task_golden_rules_template_id" ON "task_golden_rules"("tasks_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_golden_rules_tasks_template_id_golden_rules_id_key" ON "task_golden_rules"("tasks_template_id", "golden_rules_id");

-- CreateIndex
CREATE INDEX "idx_ppe_types_company_id" ON "ppe_types"("company_id");

-- CreateIndex
CREATE INDEX "idx_ppe_deliveries_users_id" ON "ppe_deliveries"("users_id");

-- CreateIndex
CREATE INDEX "idx_ppe_deliveries_type_id" ON "ppe_deliveries"("ppe_types_id");

-- CreateIndex
CREATE INDEX "idx_task_req_ppe_template_id" ON "task_required_ppe"("tasks_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_required_ppe_tasks_template_id_ppe_types_id_key" ON "task_required_ppe"("tasks_template_id", "ppe_types_id");

-- CreateIndex
CREATE INDEX "idx_wf_log_projects_id" ON "workforce_daily_log"("projects_id");

-- CreateIndex
CREATE INDEX "idx_wf_log_date" ON "workforce_daily_log"("log_date");

-- CreateIndex
CREATE INDEX "idx_wf_log_users_id" ON "workforce_daily_log"("users_id");

-- CreateIndex
CREATE INDEX "idx_non_exec_reasons_company_id" ON "non_execution_reasons"("company_id");

-- CreateIndex
CREATE INDEX "idx_notifications_users_id" ON "notifications"("users_id");

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_log_table_name" ON "audit_log"("table_name");

-- CreateIndex
CREATE INDEX "idx_audit_log_record_id" ON "audit_log"("record_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_users_id" ON "audit_log"("users_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_created_at" ON "audit_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_measurements_projects_id" ON "contract_measurements"("projects_id");

-- CreateIndex
CREATE INDEX "idx_meas_items_measurement_id" ON "measurement_items"("contract_measurements_id");

-- CreateIndex
CREATE INDEX "idx_claims_projects_id" ON "contract_claims"("projects_id");

-- CreateIndex
CREATE INDEX "idx_claims_status" ON "contract_claims"("status");

-- CreateIndex
CREATE INDEX "idx_claim_evidences_claim_id" ON "claim_evidences"("contract_claims_id");

-- CreateIndex
CREATE INDEX "idx_comm_systems_projects_id" ON "commissioning_systems"("projects_id");

-- CreateIndex
CREATE INDEX "idx_punch_list_system_id" ON "commissioning_punch_list"("commissioning_systems_id");

-- CreateIndex
CREATE INDEX "idx_comm_certs_system_id" ON "commissioning_certificates"("commissioning_systems_id");

-- CreateIndex
CREATE INDEX "idx_env_licenses_projects_id" ON "environmental_licenses"("projects_id");

-- CreateIndex
CREATE INDEX "idx_env_licenses_expiry" ON "environmental_licenses"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_env_conditions_license_id" ON "environmental_conditions"("environmental_licenses_id");

-- CreateIndex
CREATE INDEX "idx_health_records_users_id" ON "worker_health_records"("users_id");

-- CreateIndex
CREATE INDEX "idx_health_records_expiry" ON "worker_health_records"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_mat_reqs_projects_id" ON "material_requisitions"("projects_id");

-- CreateIndex
CREATE INDEX "idx_mat_reqs_status" ON "material_requisitions"("status");

-- CreateIndex
CREATE INDEX "idx_mat_req_items_req_id" ON "material_requisition_items"("material_requisitions_id");

-- CreateIndex
CREATE INDEX "idx_employees_day_offs_users_id" ON "employees_day_offs"("users_id");

-- CreateIndex
CREATE INDEX "idx_employees_day_offs_status" ON "employees_day_offs"("status");

-- CreateIndex
CREATE INDEX "idx_employees_day_offs_data" ON "employees_day_offs"("data");

-- CreateIndex
CREATE INDEX "idx_employees_benefits_users_id" ON "employees_benefits"("users_id");

-- CreateIndex
CREATE INDEX "idx_employees_benefits_status" ON "employees_benefits"("status");

-- CreateIndex
CREATE INDEX "idx_employees_career_history_users_id" ON "employees_career_history"("users_id");

-- CreateIndex
CREATE INDEX "idx_employees_career_history_data_efetivacao" ON "employees_career_history"("data_efetivacao");

-- CreateIndex
CREATE INDEX "idx_tasks_template_checklist_id" ON "tasks_template"("checklist_templates_id");

-- AddForeignKey
ALTER TABLE "company_branches" ADD CONSTRAINT "company_branches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks_template" ADD CONSTRAINT "tasks_template_checklist_templates_id_fkey" FOREIGN KEY ("checklist_templates_id") REFERENCES "checklist_templates"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sprints_tasks" ADD CONSTRAINT "sprints_tasks_non_execution_reason_id_fkey" FOREIGN KEY ("non_execution_reason_id") REFERENCES "non_execution_reasons"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_workforce" ADD CONSTRAINT "daily_report_workforce_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_activities" ADD CONSTRAINT "daily_report_activities_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_activities" ADD CONSTRAINT "daily_report_activities_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_activities" ADD CONSTRAINT "daily_report_activities_unity_id_fkey" FOREIGN KEY ("unity_id") REFERENCES "unity"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_activities" ADD CONSTRAINT "daily_report_activities_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_occurrences" ADD CONSTRAINT "daily_report_occurrences_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_equipment" ADD CONSTRAINT "daily_report_equipment_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "daily_report_equipment" ADD CONSTRAINT "daily_report_equipment_equipaments_types_id_fkey" FOREIGN KEY ("equipaments_types_id") REFERENCES "equipaments_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "company_modules" ADD CONSTRAINT "company_modules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_baselines" ADD CONSTRAINT "schedule_baselines_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_baselines" ADD CONSTRAINT "schedule_baselines_sprints_id_fkey" FOREIGN KEY ("sprints_id") REFERENCES "sprints"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_baselines" ADD CONSTRAINT "schedule_baselines_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_imports" ADD CONSTRAINT "schedule_imports_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_imports" ADD CONSTRAINT "schedule_imports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_predecessor_backlog_id_fkey" FOREIGN KEY ("predecessor_backlog_id") REFERENCES "projects_backlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_successor_backlog_id_fkey" FOREIGN KEY ("successor_backlog_id") REFERENCES "projects_backlogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_reported_by_user_id_fkey" FOREIGN KEY ("reported_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_investigated_by_user_id_fkey" FOREIGN KEY ("investigated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incidents" ADD CONSTRAINT "safety_incidents_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incident_witnesses" ADD CONSTRAINT "safety_incident_witnesses_safety_incidents_id_fkey" FOREIGN KEY ("safety_incidents_id") REFERENCES "safety_incidents"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incident_witnesses" ADD CONSTRAINT "safety_incident_witnesses_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incident_attachments" ADD CONSTRAINT "safety_incident_attachments_safety_incidents_id_fkey" FOREIGN KEY ("safety_incidents_id") REFERENCES "safety_incidents"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "safety_incident_attachments" ADD CONSTRAINT "safety_incident_attachments_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "training_types" ADD CONSTRAINT "training_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker_trainings" ADD CONSTRAINT "worker_trainings_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker_trainings" ADD CONSTRAINT "worker_trainings_training_types_id_fkey" FOREIGN KEY ("training_types_id") REFERENCES "training_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker_trainings" ADD CONSTRAINT "worker_trainings_registered_by_user_id_fkey" FOREIGN KEY ("registered_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_required_trainings" ADD CONSTRAINT "task_required_trainings_tasks_template_id_fkey" FOREIGN KEY ("tasks_template_id") REFERENCES "tasks_template"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_required_trainings" ADD CONSTRAINT "task_required_trainings_training_types_id_fkey" FOREIGN KEY ("training_types_id") REFERENCES "training_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dds_records" ADD CONSTRAINT "dds_records_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dds_records" ADD CONSTRAINT "dds_records_conducted_by_user_id_fkey" FOREIGN KEY ("conducted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dds_records" ADD CONSTRAINT "dds_records_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dds_participants" ADD CONSTRAINT "dds_participants_dds_records_id_fkey" FOREIGN KEY ("dds_records_id") REFERENCES "dds_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dds_participants" ADD CONSTRAINT "dds_participants_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_opened_by_user_id_fkey" FOREIGN KEY ("opened_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_conformances" ADD CONSTRAINT "non_conformances_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_conformance_attachments" ADD CONSTRAINT "non_conformance_attachments_non_conformances_id_fkey" FOREIGN KEY ("non_conformances_id") REFERENCES "non_conformances"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_conformance_attachments" ADD CONSTRAINT "non_conformance_attachments_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_acknowledgments" ADD CONSTRAINT "document_acknowledgments_documents_id_fkey" FOREIGN KEY ("documents_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_acknowledgments" ADD CONSTRAINT "document_acknowledgments_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_documents" ADD CONSTRAINT "task_documents_documents_id_fkey" FOREIGN KEY ("documents_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_documents" ADD CONSTRAINT "task_documents_tasks_template_id_fkey" FOREIGN KEY ("tasks_template_id") REFERENCES "tasks_template"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_documents" ADD CONSTRAINT "task_documents_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_permit_signatures" ADD CONSTRAINT "work_permit_signatures_work_permits_id_fkey" FOREIGN KEY ("work_permits_id") REFERENCES "work_permits"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_permit_signatures" ADD CONSTRAINT "work_permit_signatures_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_templates" ADD CONSTRAINT "checklist_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_template_checklists" ADD CONSTRAINT "task_template_checklists_tasks_template_id_fkey" FOREIGN KEY ("tasks_template_id") REFERENCES "tasks_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_template_checklists" ADD CONSTRAINT "task_template_checklists_checklist_templates_id_fkey" FOREIGN KEY ("checklist_templates_id") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_template_items" ADD CONSTRAINT "checklist_template_items_checklist_templates_id_fkey" FOREIGN KEY ("checklist_templates_id") REFERENCES "checklist_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_checklist_templates_id_fkey" FOREIGN KEY ("checklist_templates_id") REFERENCES "checklist_templates"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_responses" ADD CONSTRAINT "checklist_responses_responded_by_user_id_fkey" FOREIGN KEY ("responded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_response_items" ADD CONSTRAINT "checklist_response_items_checklist_responses_id_fkey" FOREIGN KEY ("checklist_responses_id") REFERENCES "checklist_responses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_response_items" ADD CONSTRAINT "checklist_response_items_checklist_template_items_id_fkey" FOREIGN KEY ("checklist_template_items_id") REFERENCES "checklist_template_items"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "golden_rules" ADD CONSTRAINT "golden_rules_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_golden_rules" ADD CONSTRAINT "task_golden_rules_tasks_template_id_fkey" FOREIGN KEY ("tasks_template_id") REFERENCES "tasks_template"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_golden_rules" ADD CONSTRAINT "task_golden_rules_golden_rules_id_fkey" FOREIGN KEY ("golden_rules_id") REFERENCES "golden_rules"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ppe_types" ADD CONSTRAINT "ppe_types_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ppe_deliveries" ADD CONSTRAINT "ppe_deliveries_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ppe_deliveries" ADD CONSTRAINT "ppe_deliveries_ppe_types_id_fkey" FOREIGN KEY ("ppe_types_id") REFERENCES "ppe_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ppe_deliveries" ADD CONSTRAINT "ppe_deliveries_delivered_by_user_id_fkey" FOREIGN KEY ("delivered_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_required_ppe" ADD CONSTRAINT "task_required_ppe_tasks_template_id_fkey" FOREIGN KEY ("tasks_template_id") REFERENCES "tasks_template"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_required_ppe" ADD CONSTRAINT "task_required_ppe_ppe_types_id_fkey" FOREIGN KEY ("ppe_types_id") REFERENCES "ppe_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workforce_daily_log" ADD CONSTRAINT "workforce_daily_log_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workforce_daily_log" ADD CONSTRAINT "workforce_daily_log_teams_id_fkey" FOREIGN KEY ("teams_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workforce_daily_log" ADD CONSTRAINT "workforce_daily_log_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workforce_daily_log" ADD CONSTRAINT "workforce_daily_log_registered_by_user_id_fkey" FOREIGN KEY ("registered_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "non_execution_reasons" ADD CONSTRAINT "non_execution_reasons_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_measurements" ADD CONSTRAINT "contract_measurements_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_measurements" ADD CONSTRAINT "contract_measurements_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "measurement_items" ADD CONSTRAINT "measurement_items_contract_measurements_id_fkey" FOREIGN KEY ("contract_measurements_id") REFERENCES "contract_measurements"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "measurement_items" ADD CONSTRAINT "measurement_items_projects_backlogs_id_fkey" FOREIGN KEY ("projects_backlogs_id") REFERENCES "projects_backlogs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_claims" ADD CONSTRAINT "contract_claims_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_claims" ADD CONSTRAINT "contract_claims_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_claims" ADD CONSTRAINT "contract_claims_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_evidences" ADD CONSTRAINT "claim_evidences_contract_claims_id_fkey" FOREIGN KEY ("contract_claims_id") REFERENCES "contract_claims"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissioning_systems" ADD CONSTRAINT "commissioning_systems_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissioning_punch_list" ADD CONSTRAINT "commissioning_punch_list_commissioning_systems_id_fkey" FOREIGN KEY ("commissioning_systems_id") REFERENCES "commissioning_systems"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commissioning_certificates" ADD CONSTRAINT "commissioning_certificates_commissioning_systems_id_fkey" FOREIGN KEY ("commissioning_systems_id") REFERENCES "commissioning_systems"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "environmental_licenses" ADD CONSTRAINT "environmental_licenses_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "environmental_licenses" ADD CONSTRAINT "environmental_licenses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "environmental_conditions" ADD CONSTRAINT "environmental_conditions_environmental_licenses_id_fkey" FOREIGN KEY ("environmental_licenses_id") REFERENCES "environmental_licenses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "worker_health_records" ADD CONSTRAINT "worker_health_records_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_requisitions" ADD CONSTRAINT "material_requisitions_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_requisitions" ADD CONSTRAINT "material_requisitions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_requisitions" ADD CONSTRAINT "material_requisitions_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "material_requisition_items" ADD CONSTRAINT "material_requisition_items_material_requisitions_id_fkey" FOREIGN KEY ("material_requisitions_id") REFERENCES "material_requisitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employees_day_offs" ADD CONSTRAINT "employees_day_offs_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_day_offs" ADD CONSTRAINT "employees_day_offs_aprovado_por_id_fkey" FOREIGN KEY ("aprovado_por_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_benefits" ADD CONSTRAINT "employees_benefits_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_career_history" ADD CONSTRAINT "employees_career_history_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_career_history" ADD CONSTRAINT "employees_career_history_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
