// =============================================================================
// INDUSTRYVIEW BACKEND - Company Schemas
// Schemas de validacao para endpoints de empresa (matriz/filiais)
// =============================================================================

import { z } from 'zod';

// Helper: CNPJ com mascara opcional (00.000.000/0000-00 ou 00000000000000)
const cnpjSchema = z
  .string()
  .trim()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, 'CNPJ invalido')
  .optional()
  .nullable();

// Helper: CPF com mascara opcional (000.000.000-00 ou 00000000000)
const cpfSchema = z
  .string()
  .trim()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF invalido')
  .optional()
  .nullable();

// Helper: CEP com mascara opcional (00000-000 ou 00000000)
const cepSchema = z
  .string()
  .trim()
  .regex(/^\d{5}-\d{3}$|^\d{8}$/, 'CEP invalido')
  .optional()
  .nullable();

/**
 * Params schema para rotas com company_id
 */
export const companyParamsSchema = z.object({
  company_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type CompanyParams = z.infer<typeof companyParamsSchema>;

/**
 * Params schema para rotas com company_id e branch_id
 */
export const branchParamsSchema = z.object({
  company_id: z.string().transform(Number).pipe(z.number().int().positive()),
  branch_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type BranchParams = z.infer<typeof branchParamsSchema>;

/**
 * Schema para atualizacao de empresa (matriz)
 * Todos os campos sao opcionais - PATCH parcial
 */
export const updateCompanySchema = z.object({
  brand_name: z.string().trim().min(1, 'Nome fantasia nao pode ser vazio').optional().nullable(),
  legal_name: z.string().trim().optional().nullable(),
  cnpj: cnpjSchema,
  phone: z.string().trim().max(20).optional().nullable(),
  email: z.string().email('Email invalido').trim().toLowerCase().optional().nullable(),
  cep: cepSchema,
  numero: z.string().trim().max(20).optional().nullable(),
  address_line: z.string().trim().optional().nullable(),
  address_line2: z.string().trim().optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().length(2, 'Estado deve ter 2 caracteres').toUpperCase().optional().nullable(),
  company_type: z.enum(['matriz', 'filial']).optional().nullable(),
  bairro: z.string().trim().max(100).optional().nullable(),
  complemento: z.string().trim().max(100).optional().nullable(),
  pais: z.string().trim().max(60).optional().nullable(),
  inscricao_estadual: z.string().trim().max(20).optional().nullable(),
  inscricao_municipal: z.string().trim().max(20).optional().nullable(),
  cnae: z.string().trim().max(10).optional().nullable(),
  regime_tributario: z
    .string()
    .trim()
    .optional()
    .nullable(),
  responsavel_legal: z.string().trim().max(120).optional().nullable(),
  responsavel_cpf: cpfSchema,
  website: z.string().trim().url('URL do website invalida').max(255).optional().nullable(),
  logo_url: z.string().trim().url('URL do logo invalida').optional().nullable(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

/**
 * Schema para criacao de filial
 * brand_name e obrigatorio, restante opcional
 */
export const createBranchSchema = z.object({
  brand_name: z.string().trim().min(1, 'Nome fantasia da filial e obrigatorio').max(120),
  legal_name: z.string().trim().optional().nullable(),
  cnpj: cnpjSchema,
  inscricao_estadual: z.string().trim().max(20).optional().nullable(),
  inscricao_municipal: z.string().trim().max(20).optional().nullable(),
  cnae: z.string().trim().max(10).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  email: z.string().email('Email invalido').trim().toLowerCase().optional().nullable(),
  website: z.string().trim().url('URL do website invalida').max(255).optional().nullable(),
  cep: cepSchema,
  address_line: z.string().trim().optional().nullable(),
  complemento: z.string().trim().max(100).optional().nullable(),
  numero: z.string().trim().max(20).optional().nullable(),
  bairro: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().length(2, 'Estado deve ter 2 caracteres').toUpperCase().optional().nullable(),
  pais: z.string().trim().max(60).optional().nullable(),
  responsavel_legal: z.string().trim().max(120).optional().nullable(),
  responsavel_cpf: cpfSchema,
  ativo: z.boolean().optional().default(true),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

/**
 * Schema para atualizacao de filial
 * Todos os campos opcionais + campo ativo para ativar/inativar
 */
export const updateBranchSchema = z.object({
  brand_name: z.string().trim().min(1, 'Nome fantasia nao pode ser vazio').max(120).optional(),
  legal_name: z.string().trim().optional().nullable(),
  cnpj: cnpjSchema,
  inscricao_estadual: z.string().trim().max(20).optional().nullable(),
  inscricao_municipal: z.string().trim().max(20).optional().nullable(),
  cnae: z.string().trim().max(10).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  email: z.string().email('Email invalido').trim().toLowerCase().optional().nullable(),
  website: z.string().trim().url('URL do website invalida').max(255).optional().nullable(),
  cep: cepSchema,
  address_line: z.string().trim().optional().nullable(),
  complemento: z.string().trim().max(100).optional().nullable(),
  numero: z.string().trim().max(20).optional().nullable(),
  bairro: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().length(2, 'Estado deve ter 2 caracteres').toUpperCase().optional().nullable(),
  pais: z.string().trim().max(60).optional().nullable(),
  responsavel_legal: z.string().trim().max(120).optional().nullable(),
  responsavel_cpf: cpfSchema,
  ativo: z.boolean().optional(),
});

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
