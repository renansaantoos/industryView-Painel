// =============================================================================
// INDUSTRYVIEW BACKEND - Clients Module Schema
// Schemas de validacao do modulo de clientes
// =============================================================================

import { z } from 'zod';

// =============================================================================
// List
// =============================================================================

export const listClientsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  company_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Create
// =============================================================================

export const createClientSchema = z.object({
  // --------------------------------------------------------------------------
  // Dados Cadastrais e Fiscais
  // --------------------------------------------------------------------------
  legal_name: z.string().trim().min(1, 'Razao social e obrigatoria'),
  trade_name: z.string().trim().optional(),
  cnpj: z.string().trim().max(18).optional(),
  state_registration: z.string().trim().optional(),
  state_registration_type: z.string().trim().max(20).optional(),
  main_cnae: z.string().trim().max(10).optional(),

  // --------------------------------------------------------------------------
  // Endereco de Faturamento
  // --------------------------------------------------------------------------
  billing_address: z.string().trim().optional(),
  billing_number: z.string().trim().max(20).optional(),
  billing_complement: z.string().trim().optional(),
  billing_neighborhood: z.string().trim().optional(),
  billing_city: z.string().trim().optional(),
  billing_state: z.string().trim().max(2).optional(),
  billing_cep: z.string().trim().max(9).optional(),

  // --------------------------------------------------------------------------
  // Endereco de Entrega
  // --------------------------------------------------------------------------
  delivery_address: z.string().trim().optional(),
  delivery_number: z.string().trim().max(20).optional(),
  delivery_complement: z.string().trim().optional(),
  delivery_neighborhood: z.string().trim().optional(),
  delivery_city: z.string().trim().optional(),
  delivery_state: z.string().trim().max(2).optional(),
  delivery_cep: z.string().trim().max(9).optional(),
  delivery_same_as_billing: z.boolean().optional().default(true),
  receiving_hours: z.string().trim().optional(),
  vehicle_restrictions: z.string().trim().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // --------------------------------------------------------------------------
  // Contatos Operacionais
  // --------------------------------------------------------------------------
  purchasing_contact_name: z.string().trim().optional(),
  purchasing_contact_email: z.string().trim().email('Email de compras invalido').optional().or(z.literal('')),
  purchasing_contact_phone: z.string().trim().max(20).optional(),
  financial_contact_name: z.string().trim().optional(),
  financial_contact_email: z.string().trim().email('Email financeiro invalido').optional().or(z.literal('')),
  financial_contact_phone: z.string().trim().max(20).optional(),
  warehouse_contact_name: z.string().trim().optional(),
  warehouse_contact_email: z.string().trim().email('Email do almoxarifado invalido').optional().or(z.literal('')),
  warehouse_contact_phone: z.string().trim().max(20).optional(),

  // --------------------------------------------------------------------------
  // Parametros de Negocio
  // --------------------------------------------------------------------------
  industry_segment: z.string().trim().optional(),
  purchase_potential: z.string().trim().optional(),
  default_payment_terms: z.string().trim().optional(),
  responsible_salesperson: z.string().trim().optional(),

  // --------------------------------------------------------------------------
  // Observacoes
  // --------------------------------------------------------------------------
  notes: z.string().trim().optional(),
});

// =============================================================================
// Update
// =============================================================================

export const updateClientSchema = createClientSchema.partial();

// =============================================================================
// Params
// =============================================================================

export const clientIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Tipos exportados
// =============================================================================

export type ListClientsInput = z.infer<typeof listClientsSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientIdParamInput = z.infer<typeof clientIdParamSchema>;
