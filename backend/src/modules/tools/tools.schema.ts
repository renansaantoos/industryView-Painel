// =============================================================================
// INDUSTRYVIEW BACKEND - Tools Module Schema
// Schemas de validacao do modulo de Ferramentas
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Departments Schemas
// =============================================================================

export const listDepartmentsSchema = z.object({
  company_id: z.coerce.number().int().optional(),
});

export const getDepartmentByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createDepartmentSchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  name: z.string().trim().min(1, 'name e obrigatorio'),
  description: z.string().trim().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
});

// =============================================================================
// Tool Categories Schemas
// =============================================================================

export const listCategoriesSchema = z.object({
  company_id: z.coerce.number().int().optional(),
});

export const getCategoryByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createCategorySchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  name: z.string().trim().min(1, 'name e obrigatorio'),
  description: z.string().trim().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
});

// =============================================================================
// Tools Schemas
// =============================================================================

export const listToolsSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  category_id: z.coerce.number().int().optional(),
  branch_id: z.coerce.number().int().optional(),
  department_id: z.coerce.number().int().optional(),
  project_id: z.coerce.number().int().optional(),
  assigned_user_id: z.coerce.number().int().optional(),
  assigned_team_id: z.coerce.number().int().optional(),
  control_type: z.enum(['patrimonio', 'quantidade']).optional(),
  condition: z.enum(['novo', 'bom', 'regular', 'danificado', 'descartado']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getToolByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createToolSchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  category_id: z.coerce.number().int().optional(),
  name: z.string().trim().min(1, 'name e obrigatorio'),
  description: z.string().trim().optional(),
  control_type: z.enum(['patrimonio', 'quantidade']),
  patrimonio_code: z.string().trim().optional(),
  quantity_total: z.coerce.number().int().min(1).optional().default(1),
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  serial_number: z.string().trim().optional(),
  condition: z.enum(['novo', 'bom', 'regular', 'danificado', 'descartado']).optional().default('novo'),
  branch_id: z.coerce.number().int().optional(),
  department_id: z.coerce.number().int().optional(),
  project_id: z.coerce.number().int().optional(),
  notes: z.string().trim().optional(),
});

export const updateToolSchema = z.object({
  category_id: z.coerce.number().int().optional(),
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  patrimonio_code: z.string().trim().optional(),
  quantity_total: z.coerce.number().int().min(1).optional(),
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  serial_number: z.string().trim().optional(),
  condition: z.enum(['novo', 'bom', 'regular', 'danificado', 'descartado']).optional(),
  branch_id: z.coerce.number().int().nullable().optional(),
  department_id: z.coerce.number().int().nullable().optional(),
  project_id: z.coerce.number().int().nullable().optional(),
  notes: z.string().trim().optional(),
});

// =============================================================================
// Movements Schemas
// =============================================================================

export const listMovementsSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  tool_id: z.coerce.number().int().optional(),
  movement_type: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const transferSchema = z.object({
  tool_id: z.coerce.number().int().min(1, 'tool_id e obrigatorio'),
  to_branch_id: z.coerce.number().int().optional(),
  to_department_id: z.coerce.number().int().optional(),
  quantity: z.coerce.number().int().min(1).optional().default(1),
  condition: z.enum(['novo', 'bom', 'regular', 'danificado', 'descartado']).optional(),
  notes: z.string().trim().optional(),
});

export const assignEmployeeSchema = z.object({
  tool_id: z.coerce.number().int().min(1, 'tool_id e obrigatorio'),
  user_id: z.coerce.number().int().min(1, 'user_id e obrigatorio'),
  quantity: z.coerce.number().int().min(1).optional().default(1),
  notes: z.string().trim().optional(),
});

export const assignTeamSchema = z.object({
  tool_id: z.coerce.number().int().min(1, 'tool_id e obrigatorio'),
  team_id: z.coerce.number().int().min(1, 'team_id e obrigatorio'),
  quantity: z.coerce.number().int().min(1).optional().default(1),
  notes: z.string().trim().optional(),
});

export const assignProjectSchema = z.object({
  tool_id: z.coerce.number().int().min(1, 'tool_id e obrigatorio'),
  project_id: z.coerce.number().int().min(1, 'project_id e obrigatorio'),
  quantity: z.coerce.number().int().min(1).optional().default(1),
  notes: z.string().trim().optional(),
});

export const returnToolSchema = z.object({
  tool_id: z.coerce.number().int().min(1, 'tool_id e obrigatorio'),
  condition: z.enum(['novo', 'bom', 'regular', 'danificado', 'descartado']).optional().default('bom'),
  to_branch_id: z.coerce.number().int().optional(),
  to_department_id: z.coerce.number().int().optional(),
  quantity: z.coerce.number().int().min(1).optional().default(1),
  notes: z.string().trim().optional(),
});

export const assignKitSchema = z.object({
  user_id: z.coerce.number().int().min(1, 'user_id e obrigatorio'),
  kit_id: z.coerce.number().int().min(1, 'kit_id e obrigatorio'),
  notes: z.string().trim().optional(),
});

// =============================================================================
// Acceptance Terms Schemas
// =============================================================================

export const listAcceptanceTermsSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  tool_id: z.coerce.number().int().optional(),
  received_by_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getAcceptanceTermByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createAcceptanceTermSchema = z.object({
  tool_id: z.coerce.number().int().min(1, 'tool_id e obrigatorio'),
  delivered_by_id: z.coerce.number().int().min(1, 'delivered_by_id e obrigatorio'),
  received_by_id: z.coerce.number().int().min(1, 'received_by_id e obrigatorio'),
  notes: z.string().trim().optional(),
});

// =============================================================================
// Kits Schemas
// =============================================================================

export const listKitsSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  cargo: z.string().trim().optional(),
});

export const getKitByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createKitSchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  name: z.string().trim().min(1, 'name e obrigatorio'),
  cargo: z.string().trim().min(1, 'cargo e obrigatorio'),
  description: z.string().trim().optional(),
});

export const updateKitSchema = z.object({
  name: z.string().trim().min(1).optional(),
  cargo: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
});

export const addKitItemSchema = z.object({
  category_id: z.coerce.number().int().min(1, 'category_id e obrigatorio'),
  quantity: z.coerce.number().int().min(1).optional().default(1),
});

export const deleteKitItemSchema = z.object({
  id: z.coerce.number().int().min(1),
  itemId: z.coerce.number().int().min(1),
});

// =============================================================================
// Status Schemas
// =============================================================================

export const getUserToolsSchema = z.object({
  user_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListDepartmentsInput = z.infer<typeof listDepartmentsSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListToolsInput = z.infer<typeof listToolsSchema>;
export type CreateToolInput = z.infer<typeof createToolSchema>;
export type UpdateToolInput = z.infer<typeof updateToolSchema>;
export type ListMovementsInput = z.infer<typeof listMovementsSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type AssignEmployeeInput = z.infer<typeof assignEmployeeSchema>;
export type AssignTeamInput = z.infer<typeof assignTeamSchema>;
export type AssignProjectInput = z.infer<typeof assignProjectSchema>;
export type ReturnToolInput = z.infer<typeof returnToolSchema>;
export type AssignKitInput = z.infer<typeof assignKitSchema>;
export type ListAcceptanceTermsInput = z.infer<typeof listAcceptanceTermsSchema>;
export type CreateAcceptanceTermInput = z.infer<typeof createAcceptanceTermSchema>;
export type ListKitsInput = z.infer<typeof listKitsSchema>;
export type CreateKitInput = z.infer<typeof createKitSchema>;
export type UpdateKitInput = z.infer<typeof updateKitSchema>;
export type AddKitItemInput = z.infer<typeof addKitItemSchema>;
