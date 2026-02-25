// =============================================================================
// INDUSTRYVIEW BACKEND - Clients Module Service
// Service do modulo de clientes (CRUD com multi-tenant e soft delete)
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListClientsInput,
  CreateClientInput,
  UpdateClientInput,
  CreateClientUnitInput,
  UpdateClientUnitInput,
} from './clients.schema';

/**
 * Normaliza uma string para busca: minusculas e sem acentos.
 */
function normalizeString(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Determina o nome de exibicao e o name_normalized a partir dos dados do cliente.
 * Prioriza trade_name (nome fantasia); se ausente, usa legal_name (razao social).
 */
function resolveDisplayName(legalName: string, tradeName?: string | null): {
  name: string;
  name_normalized: string;
} {
  const displayName = (tradeName && tradeName.trim()) ? tradeName.trim() : legalName.trim();
  return {
    name: displayName,
    name_normalized: normalizeString(displayName),
  };
}

/**
 * ClientsService - Service do modulo de clientes
 */
export class ClientsService {
  // ===========================================================================
  // List
  // ===========================================================================

  /**
   * Lista clientes com paginacao, filtro por company_id (multi-tenant) e busca por nome.
   */
  static async listClients(input: ListClientsInput) {
    const { search, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = { deleted_at: null };

    // Isolamento multi-tenant - company_id SEMPRE vem do usuario autenticado
    if (company_id) {
      whereClause.company_id = BigInt(company_id);
    }

    // Busca por nome normalizado (cobre trade_name e legal_name)
    if (search && search.trim()) {
      whereClause.name_normalized = {
        contains: normalizeString(search),
      };
    }

    const [items, total] = await Promise.all([
      db.clients.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
        include: {
          units: { orderBy: [{ unit_type: 'asc' }, { created_at: 'asc' }] },
        },
      }),
      db.clients.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  // ===========================================================================
  // Get One
  // ===========================================================================

  /**
   * Busca um cliente pelo id, validando que nao foi deletado.
   * Lanca NotFoundError se nao encontrado.
   */
  static async getClient(id: number, company_id?: number) {
    const whereClause: any = { id: BigInt(id), deleted_at: null };

    // Garante que o cliente pertence a empresa do usuario autenticado
    if (company_id) {
      whereClause.company_id = BigInt(company_id);
    }

    const client = await db.clients.findFirst({
      where: whereClause,
      include: { units: { orderBy: [{ unit_type: 'asc' }, { created_at: 'asc' }] } },
    });

    if (!client) {
      throw new NotFoundError('Cliente nao encontrado.');
    }

    return client;
  }

  // ===========================================================================
  // Create
  // ===========================================================================

  /**
   * Cria um novo cliente associado a empresa do usuario autenticado.
   * O campo name (exibicao) e populado automaticamente de trade_name ou legal_name.
   * O campo name_normalized e gerado para busca full-text simplificada.
   */
  static async createClient(data: CreateClientInput, company_id: number) {
    const { name, name_normalized } = resolveDisplayName(data.legal_name, data.trade_name);

    return db.clients.create({
      data: {
        company_id: BigInt(company_id),

        // Exibicao e busca
        name,
        name_normalized,

        // Dados Cadastrais e Fiscais
        legal_name: data.legal_name,
        trade_name: data.trade_name ?? null,
        cnpj: data.cnpj ?? null,
        state_registration: data.state_registration ?? null,
        state_registration_type: data.state_registration_type ?? null,
        main_cnae: data.main_cnae ?? null,

        // Endereco de Faturamento
        billing_address: data.billing_address ?? null,
        billing_number: data.billing_number ?? null,
        billing_complement: data.billing_complement ?? null,
        billing_neighborhood: data.billing_neighborhood ?? null,
        billing_city: data.billing_city ?? null,
        billing_state: data.billing_state ?? null,
        billing_cep: data.billing_cep ?? null,

        // Endereco de Entrega
        delivery_address: data.delivery_address ?? null,
        delivery_number: data.delivery_number ?? null,
        delivery_complement: data.delivery_complement ?? null,
        delivery_neighborhood: data.delivery_neighborhood ?? null,
        delivery_city: data.delivery_city ?? null,
        delivery_state: data.delivery_state ?? null,
        delivery_cep: data.delivery_cep ?? null,
        delivery_same_as_billing: data.delivery_same_as_billing ?? true,
        receiving_hours: data.receiving_hours ?? null,
        vehicle_restrictions: data.vehicle_restrictions ?? null,
        latitude: data.latitude != null ? data.latitude : null,
        longitude: data.longitude != null ? data.longitude : null,

        // Contatos Operacionais
        purchasing_contact_name: data.purchasing_contact_name ?? null,
        purchasing_contact_email: data.purchasing_contact_email || null,
        purchasing_contact_phone: data.purchasing_contact_phone ?? null,
        financial_contact_name: data.financial_contact_name ?? null,
        financial_contact_email: data.financial_contact_email || null,
        financial_contact_phone: data.financial_contact_phone ?? null,
        warehouse_contact_name: data.warehouse_contact_name ?? null,
        warehouse_contact_email: data.warehouse_contact_email || null,
        warehouse_contact_phone: data.warehouse_contact_phone ?? null,

        // Parametros de Negocio
        industry_segment: data.industry_segment ?? null,
        purchase_potential: data.purchase_potential ?? null,
        default_payment_terms: data.default_payment_terms ?? null,
        responsible_salesperson: data.responsible_salesperson ?? null,

        // Observacoes
        notes: data.notes ?? null,
      },
    });
  }

  // ===========================================================================
  // Update
  // ===========================================================================

  /**
   * Atualiza um cliente existente.
   * Se legal_name ou trade_name forem alterados, regenera name e name_normalized.
   */
  static async updateClient(id: number, data: UpdateClientInput, company_id?: number) {
    const whereClause: any = { id: BigInt(id), deleted_at: null };

    if (company_id) {
      whereClause.company_id = BigInt(company_id);
    }

    const existing = await db.clients.findFirst({ where: whereClause });

    if (!existing) {
      throw new NotFoundError('Cliente nao encontrado.');
    }

    // Recalcula name/name_normalized se algum dos campos de nome mudou
    const newLegalName = data.legal_name !== undefined ? data.legal_name : existing.legal_name;
    const newTradeName = data.trade_name !== undefined ? data.trade_name : existing.trade_name;
    const { name, name_normalized } = resolveDisplayName(newLegalName, newTradeName);

    return db.clients.update({
      where: { id: BigInt(id) },
      data: {
        // Exibicao e busca (sempre recalculados ao atualizar)
        name,
        name_normalized,

        // Dados Cadastrais e Fiscais
        ...(data.legal_name !== undefined && { legal_name: data.legal_name }),
        ...(data.trade_name !== undefined && { trade_name: data.trade_name ?? null }),
        ...(data.cnpj !== undefined && { cnpj: data.cnpj ?? null }),
        ...(data.state_registration !== undefined && { state_registration: data.state_registration ?? null }),
        ...(data.state_registration_type !== undefined && { state_registration_type: data.state_registration_type ?? null }),
        ...(data.main_cnae !== undefined && { main_cnae: data.main_cnae ?? null }),

        // Endereco de Faturamento
        ...(data.billing_address !== undefined && { billing_address: data.billing_address ?? null }),
        ...(data.billing_number !== undefined && { billing_number: data.billing_number ?? null }),
        ...(data.billing_complement !== undefined && { billing_complement: data.billing_complement ?? null }),
        ...(data.billing_neighborhood !== undefined && { billing_neighborhood: data.billing_neighborhood ?? null }),
        ...(data.billing_city !== undefined && { billing_city: data.billing_city ?? null }),
        ...(data.billing_state !== undefined && { billing_state: data.billing_state ?? null }),
        ...(data.billing_cep !== undefined && { billing_cep: data.billing_cep ?? null }),

        // Endereco de Entrega
        ...(data.delivery_address !== undefined && { delivery_address: data.delivery_address ?? null }),
        ...(data.delivery_number !== undefined && { delivery_number: data.delivery_number ?? null }),
        ...(data.delivery_complement !== undefined && { delivery_complement: data.delivery_complement ?? null }),
        ...(data.delivery_neighborhood !== undefined && { delivery_neighborhood: data.delivery_neighborhood ?? null }),
        ...(data.delivery_city !== undefined && { delivery_city: data.delivery_city ?? null }),
        ...(data.delivery_state !== undefined && { delivery_state: data.delivery_state ?? null }),
        ...(data.delivery_cep !== undefined && { delivery_cep: data.delivery_cep ?? null }),
        ...(data.delivery_same_as_billing !== undefined && { delivery_same_as_billing: data.delivery_same_as_billing }),
        ...(data.receiving_hours !== undefined && { receiving_hours: data.receiving_hours ?? null }),
        ...(data.vehicle_restrictions !== undefined && { vehicle_restrictions: data.vehicle_restrictions ?? null }),
        ...(data.latitude !== undefined && { latitude: data.latitude != null ? data.latitude : null }),
        ...(data.longitude !== undefined && { longitude: data.longitude != null ? data.longitude : null }),

        // Contatos Operacionais
        ...(data.purchasing_contact_name !== undefined && { purchasing_contact_name: data.purchasing_contact_name ?? null }),
        ...(data.purchasing_contact_email !== undefined && { purchasing_contact_email: data.purchasing_contact_email || null }),
        ...(data.purchasing_contact_phone !== undefined && { purchasing_contact_phone: data.purchasing_contact_phone ?? null }),
        ...(data.financial_contact_name !== undefined && { financial_contact_name: data.financial_contact_name ?? null }),
        ...(data.financial_contact_email !== undefined && { financial_contact_email: data.financial_contact_email || null }),
        ...(data.financial_contact_phone !== undefined && { financial_contact_phone: data.financial_contact_phone ?? null }),
        ...(data.warehouse_contact_name !== undefined && { warehouse_contact_name: data.warehouse_contact_name ?? null }),
        ...(data.warehouse_contact_email !== undefined && { warehouse_contact_email: data.warehouse_contact_email || null }),
        ...(data.warehouse_contact_phone !== undefined && { warehouse_contact_phone: data.warehouse_contact_phone ?? null }),

        // Parametros de Negocio
        ...(data.industry_segment !== undefined && { industry_segment: data.industry_segment ?? null }),
        ...(data.purchase_potential !== undefined && { purchase_potential: data.purchase_potential ?? null }),
        ...(data.default_payment_terms !== undefined && { default_payment_terms: data.default_payment_terms ?? null }),
        ...(data.responsible_salesperson !== undefined && { responsible_salesperson: data.responsible_salesperson ?? null }),

        // Observacoes
        ...(data.notes !== undefined && { notes: data.notes ?? null }),

        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Delete (soft)
  // ===========================================================================

  /**
   * Soft delete de um cliente: define deleted_at com a data atual.
   */
  static async deleteClient(id: number, company_id?: number) {
    const whereClause: any = { id: BigInt(id), deleted_at: null };

    if (company_id) {
      whereClause.company_id = BigInt(company_id);
    }

    const existing = await db.clients.findFirst({ where: whereClause });

    if (!existing) {
      throw new NotFoundError('Cliente nao encontrado.');
    }

    return db.clients.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  // ===========================================================================
  // Units — List
  // ===========================================================================

  static async listUnits(clientId: number, company_id?: number) {
    // Verifica que o cliente pertence a empresa
    await ClientsService.getClient(clientId, company_id);

    return db.client_units.findMany({
      where: { client_id: BigInt(clientId) },
      orderBy: [{ unit_type: 'asc' }, { created_at: 'asc' }],
    });
  }

  // ===========================================================================
  // Units — Create
  // ===========================================================================

  static async createUnit(clientId: number, data: CreateClientUnitInput, company_id?: number) {
    await ClientsService.getClient(clientId, company_id);

    return db.client_units.create({
      data: {
        client_id:    BigInt(clientId),
        unit_type:    data.unit_type,
        label:        data.label ?? null,
        cnpj:         data.cnpj ?? null,
        address:      data.address ?? null,
        number:       data.number ?? null,
        complement:   data.complement ?? null,
        neighborhood: data.neighborhood ?? null,
        city:         data.city ?? null,
        state:        data.state ?? null,
        cep:          data.cep ?? null,
      },
    });
  }

  // ===========================================================================
  // Units — Update
  // ===========================================================================

  static async updateUnit(clientId: number, unitId: number, data: UpdateClientUnitInput, company_id?: number) {
    await ClientsService.getClient(clientId, company_id);

    const unit = await db.client_units.findFirst({
      where: { id: BigInt(unitId), client_id: BigInt(clientId) },
    });

    if (!unit) throw new NotFoundError('Unidade nao encontrada.');

    return db.client_units.update({
      where: { id: BigInt(unitId) },
      data: {
        ...(data.unit_type    !== undefined && { unit_type: data.unit_type }),
        ...(data.label        !== undefined && { label: data.label ?? null }),
        ...(data.cnpj         !== undefined && { cnpj: data.cnpj ?? null }),
        ...(data.address      !== undefined && { address: data.address ?? null }),
        ...(data.number       !== undefined && { number: data.number ?? null }),
        ...(data.complement   !== undefined && { complement: data.complement ?? null }),
        ...(data.neighborhood !== undefined && { neighborhood: data.neighborhood ?? null }),
        ...(data.city         !== undefined && { city: data.city ?? null }),
        ...(data.state        !== undefined && { state: data.state ?? null }),
        ...(data.cep          !== undefined && { cep: data.cep ?? null }),
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Units — Delete
  // ===========================================================================

  static async deleteUnit(clientId: number, unitId: number, company_id?: number) {
    await ClientsService.getClient(clientId, company_id);

    const unit = await db.client_units.findFirst({
      where: { id: BigInt(unitId), client_id: BigInt(clientId) },
    });

    if (!unit) throw new NotFoundError('Unidade nao encontrada.');

    return db.client_units.delete({ where: { id: BigInt(unitId) } });
  }
}

export default ClientsService;
