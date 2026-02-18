// =============================================================================
// INDUSTRYVIEW BACKEND - Employees Module Schema
// Schemas de validacao do modulo de funcionarios (RH, ferias, documentos)
// =============================================================================

import { z } from 'zod';

// =============================================================================
// HR Data
// =============================================================================

export const getHrDataParamsSchema = z.object({
  users_id: z.coerce.number().int().min(1),
});

export const upsertHrDataSchema = z.object({
  // Dados pessoais
  nome_completo: z.string().trim().optional(),
  cpf: z.string().trim().optional(),
  rg: z.string().trim().optional(),
  rg_orgao_emissor: z.string().trim().optional(),
  rg_data_emissao: z.string().optional(),
  data_nascimento: z.string().optional(),
  genero: z.string().trim().optional(),
  estado_civil: z.string().trim().optional(),
  nacionalidade: z.string().trim().optional(),
  naturalidade: z.string().trim().optional(),
  nome_mae: z.string().trim().optional(),
  nome_pai: z.string().trim().optional(),
  // Endereco
  cep: z.string().trim().optional(),
  logradouro: z.string().trim().optional(),
  numero: z.string().trim().optional(),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.string().trim().optional(),
  // Dados profissionais
  matricula: z.string().trim().optional(),
  data_admissao: z.string().optional(),
  data_demissao: z.string().optional(),
  tipo_contrato: z.string().trim().optional(),
  cargo: z.string().trim().optional(),
  departamento: z.string().trim().optional(),
  salario: z.coerce.number().optional(),
  jornada_trabalho: z.string().trim().optional(),
  pis_pasep: z.string().trim().optional(),
  ctps_numero: z.string().trim().optional(),
  ctps_serie: z.string().trim().optional(),
  ctps_uf: z.string().trim().optional(),
  // CNH
  cnh_numero: z.string().trim().optional(),
  cnh_categoria: z.string().trim().optional(),
  cnh_validade: z.string().optional(),
  // Dados bancarios
  banco_nome: z.string().trim().optional(),
  banco_agencia: z.string().trim().optional(),
  banco_conta: z.string().trim().optional(),
  banco_tipo_conta: z.string().trim().optional(),
  banco_pix: z.string().trim().optional(),
  // Contato de emergencia
  emergencia_nome: z.string().trim().optional(),
  emergencia_parentesco: z.string().trim().optional(),
  emergencia_telefone: z.string().trim().optional(),
  // Formacao academica
  escolaridade: z.string().trim().optional(),
  curso: z.string().trim().optional(),
  instituicao: z.string().trim().optional(),
  // Outros
  observacoes: z.string().trim().optional(),
  foto_documento_url: z.string().trim().optional(),
});

// =============================================================================
// Vacations
// =============================================================================

const VACATION_TYPES = [
  'ferias',
  'licenca_medica',
  'licenca_maternidade',
  'licenca_paternidade',
  'abono',
] as const;

const VACATION_STATUSES = [
  'pendente',
  'aprovado',
  'em_andamento',
  'concluido',
  'cancelado',
] as const;

export const listVacationsSchema = z.object({
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createVacationSchema = z.object({
  users_id: z.coerce.number().int().min(1),
  tipo: z.enum(VACATION_TYPES),
  data_inicio: z.string().min(1),
  data_fim: z.string().min(1),
  dias_total: z.coerce.number().int().min(1),
  dias_abono: z.coerce.number().int().optional(),
  periodo_aquisitivo_inicio: z.string().optional(),
  periodo_aquisitivo_fim: z.string().optional(),
  observacoes: z.string().trim().optional(),
});

export const updateVacationSchema = z.object({
  tipo: z.enum(VACATION_TYPES).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  dias_total: z.coerce.number().int().optional(),
  dias_abono: z.coerce.number().int().optional(),
  periodo_aquisitivo_inicio: z.string().optional(),
  periodo_aquisitivo_fim: z.string().optional(),
  status: z.enum(VACATION_STATUSES).optional(),
  observacoes: z.string().trim().optional(),
});

export const approveVacationSchema = z.object({
  status: z.enum(['aprovado', 'cancelado']),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Documents
// =============================================================================

const DOCUMENT_TYPES = [
  'certificado',
  'diploma',
  'contrato',
  'atestado',
  'outro',
] as const;

export const listDocumentsSchema = z.object({
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  tipo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createDocumentSchema = z.object({
  users_id: z.coerce.number().int().min(1),
  tipo: z.enum(DOCUMENT_TYPES),
  nome: z.string().trim().min(1),
  descricao: z.string().trim().optional(),
  numero_documento: z.string().trim().optional(),
  data_emissao: z.string().optional(),
  data_validade: z.string().optional(),
  file_url: z.string().trim().optional(),
});

export const updateDocumentSchema = z.object({
  tipo: z.enum(DOCUMENT_TYPES).optional(),
  nome: z.string().trim().optional(),
  descricao: z.string().trim().optional(),
  numero_documento: z.string().trim().optional(),
  data_emissao: z.string().optional(),
  data_validade: z.string().optional(),
  file_url: z.string().trim().optional(),
  status: z.enum(['ativo', 'vencido', 'cancelado']).optional(),
});

// =============================================================================
// Day Offs (Folgas / Banco de Horas)
// =============================================================================

const DAY_OFF_TYPES = [
  'folga_compensatoria',
  'banco_horas',
  'folga_escala',
  'troca_turno',
] as const;

const DAY_OFF_STATUSES = [
  'pendente',
  'aprovado',
  'rejeitado',
  'cancelado',
] as const;

export const listDayOffsSchema = z.object({
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  tipo: z.string().optional(),
  status: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createDayOffSchema = z.object({
  users_id: z.coerce.number().int().min(1),
  tipo: z.enum(DAY_OFF_TYPES),
  data: z.string().min(1),
  motivo: z.string().trim().optional(),
  horas_banco: z.coerce.number().optional(),
  observacoes: z.string().trim().optional(),
});

export const updateDayOffSchema = z.object({
  tipo: z.enum(DAY_OFF_TYPES).optional(),
  data: z.string().optional(),
  motivo: z.string().trim().optional(),
  horas_banco: z.coerce.number().optional(),
  status: z.enum(DAY_OFF_STATUSES).optional(),
  observacoes: z.string().trim().optional(),
});

export const approveDayOffSchema = z.object({
  status: z.enum(['aprovado', 'rejeitado']),
});

// =============================================================================
// Benefits (Beneficios)
// =============================================================================

const BENEFIT_TYPES = [
  'vt',
  'vr',
  'va',
  'plano_saude',
  'plano_odonto',
  'seguro_vida',
  'outro',
] as const;

const BENEFIT_STATUSES = [
  'ativo',
  'suspenso',
  'cancelado',
] as const;

export const listBenefitsSchema = z.object({
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  tipo: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createBenefitSchema = z.object({
  users_id: z.coerce.number().int().min(1),
  tipo: z.enum(BENEFIT_TYPES),
  descricao: z.string().trim().optional(),
  valor: z.coerce.number().optional(),
  data_inicio: z.string().min(1),
  data_fim: z.string().optional(),
  observacoes: z.string().trim().optional(),
});

export const updateBenefitSchema = z.object({
  tipo: z.enum(BENEFIT_TYPES).optional(),
  descricao: z.string().trim().optional(),
  valor: z.coerce.number().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  status: z.enum(BENEFIT_STATUSES).optional(),
  observacoes: z.string().trim().optional(),
});

// =============================================================================
// Career History (Historico de Cargos)
// =============================================================================

const CAREER_TYPES = [
  'admissao',
  'promocao',
  'transferencia',
  'mudanca_salario',
  'demissao',
] as const;

export const listCareerHistorySchema = z.object({
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  tipo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createCareerHistorySchema = z.object({
  users_id: z.coerce.number().int().min(1),
  tipo: z.enum(CAREER_TYPES),
  cargo_anterior: z.string().trim().optional(),
  cargo_novo: z.string().trim().optional(),
  departamento_anterior: z.string().trim().optional(),
  departamento_novo: z.string().trim().optional(),
  salario_anterior: z.coerce.number().optional(),
  salario_novo: z.coerce.number().optional(),
  data_efetivacao: z.string().min(1),
  motivo: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

export const updateCareerHistorySchema = z.object({
  tipo: z.enum(CAREER_TYPES).optional(),
  cargo_anterior: z.string().trim().optional(),
  cargo_novo: z.string().trim().optional(),
  departamento_anterior: z.string().trim().optional(),
  departamento_novo: z.string().trim().optional(),
  salario_anterior: z.coerce.number().optional(),
  salario_novo: z.coerce.number().optional(),
  data_efetivacao: z.string().optional(),
  motivo: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

// =============================================================================
// Tipos exportados
// =============================================================================

export type GetHrDataParamsInput = z.infer<typeof getHrDataParamsSchema>;
export type UpsertHrDataInput = z.infer<typeof upsertHrDataSchema>;
export type ListVacationsInput = z.infer<typeof listVacationsSchema>;
export type CreateVacationInput = z.infer<typeof createVacationSchema>;
export type UpdateVacationInput = z.infer<typeof updateVacationSchema>;
export type ApproveVacationInput = z.infer<typeof approveVacationSchema>;
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ListDayOffsInput = z.infer<typeof listDayOffsSchema>;
export type CreateDayOffInput = z.infer<typeof createDayOffSchema>;
export type UpdateDayOffInput = z.infer<typeof updateDayOffSchema>;
export type ApproveDayOffInput = z.infer<typeof approveDayOffSchema>;
export type ListBenefitsInput = z.infer<typeof listBenefitsSchema>;
export type CreateBenefitInput = z.infer<typeof createBenefitSchema>;
export type UpdateBenefitInput = z.infer<typeof updateBenefitSchema>;
export type ListCareerHistoryInput = z.infer<typeof listCareerHistorySchema>;
export type CreateCareerHistoryInput = z.infer<typeof createCareerHistorySchema>;
export type UpdateCareerHistoryInput = z.infer<typeof updateCareerHistorySchema>;
