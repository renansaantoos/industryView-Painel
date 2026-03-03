// =============================================================================
// INDUSTRYVIEW BACKEND - Tools Module Service
// Service do modulo de Ferramentas (patrimonio + quantidade)
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListDepartmentsInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  ListCategoriesInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListToolsInput,
  CreateToolInput,
  UpdateToolInput,
  ListMovementsInput,
  TransferInput,
  AssignEmployeeInput,
  AssignTeamInput,
  AssignProjectInput,
  ReturnToolInput,
  AssignKitInput,
  ListAcceptanceTermsInput,
  CreateAcceptanceTermInput,
  ListKitsInput,
  CreateKitInput,
  UpdateKitInput,
  AddKitItemInput,
} from './tools.schema';

/**
 * ToolsService - Service do modulo de Ferramentas
 */
export class ToolsService {
  // ===========================================================================
  // Departments
  // ===========================================================================

  static async listDepartments(input: ListDepartmentsInput) {
    const whereClause: any = { deleted_at: null };
    if (input.company_id) {
      whereClause.company_id = BigInt(input.company_id);
    }
    return db.departments.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  static async createDepartment(input: CreateDepartmentInput) {
    return db.departments.create({
      data: {
        company_id: BigInt(input.company_id),
        name: input.name,
        description: input.description ?? null,
      },
    });
  }

  static async updateDepartment(id: number, input: UpdateDepartmentInput) {
    const dept = await db.departments.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!dept) throw new NotFoundError('Departamento nao encontrado.');

    return db.departments.update({
      where: { id: BigInt(id) },
      data: {
        name: input.name,
        description: input.description,
        updated_at: new Date(),
      },
    });
  }

  static async deleteDepartment(id: number) {
    const dept = await db.departments.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!dept) throw new NotFoundError('Departamento nao encontrado.');

    return db.departments.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });
  }

  // ===========================================================================
  // Tool Categories
  // ===========================================================================

  static async listCategories(input: ListCategoriesInput) {
    const whereClause: any = { deleted_at: null };
    if (input.company_id) {
      whereClause.company_id = BigInt(input.company_id);
    }
    return db.tool_categories.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  static async createCategory(input: CreateCategoryInput) {
    return db.tool_categories.create({
      data: {
        company_id: BigInt(input.company_id),
        name: input.name,
        description: input.description ?? null,
      },
    });
  }

  static async updateCategory(id: number, input: UpdateCategoryInput) {
    const cat = await db.tool_categories.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!cat) throw new NotFoundError('Categoria nao encontrada.');

    return db.tool_categories.update({
      where: { id: BigInt(id) },
      data: {
        name: input.name,
        description: input.description,
        updated_at: new Date(),
      },
    });
  }

  static async deleteCategory(id: number) {
    const cat = await db.tool_categories.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!cat) throw new NotFoundError('Categoria nao encontrada.');

    return db.tool_categories.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });
  }

  // ===========================================================================
  // Tools
  // ===========================================================================

  static async listTools(input: ListToolsInput) {
    const { page, per_page, search, ...filters } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = { deleted_at: null };

    if (filters.company_id) whereClause.company_id = BigInt(filters.company_id);
    if (filters.category_id) whereClause.category_id = BigInt(filters.category_id);
    if (filters.branch_id) whereClause.branch_id = BigInt(filters.branch_id);
    if (filters.department_id) whereClause.department_id = BigInt(filters.department_id);
    if (filters.project_id) whereClause.project_id = BigInt(filters.project_id);
    if (filters.assigned_user_id) whereClause.assigned_user_id = BigInt(filters.assigned_user_id);
    if (filters.assigned_team_id) whereClause.assigned_team_id = BigInt(filters.assigned_team_id);
    if (filters.control_type) whereClause.control_type = filters.control_type;
    if (filters.condition) whereClause.condition = filters.condition;

    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { patrimonio_code: { contains: search.trim(), mode: 'insensitive' } },
        { serial_number: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      db.tools.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true } },
          branch: { select: { id: true, brand_name: true } },
          department: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          assigned_user: { select: { id: true, name: true } },
          assigned_team: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.tools.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  static async getToolById(id: number) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        category: { select: { id: true, name: true } },
        branch: { select: { id: true, brand_name: true } },
        department: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        assigned_user: { select: { id: true, name: true } },
        assigned_team: { select: { id: true, name: true } },
      },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');
    return tool;
  }

  static async createTool(input: CreateToolInput, performedById: number) {
    // Valida patrimonio_code se tipo patrimonio
    if (input.control_type === 'patrimonio' && !input.patrimonio_code) {
      throw new BadRequestError('patrimonio_code e obrigatorio para controle tipo patrimonio.');
    }

    const tool = await db.tools.create({
      data: {
        company_id: BigInt(input.company_id),
        category_id: input.category_id ? BigInt(input.category_id) : null,
        name: input.name,
        description: input.description ?? null,
        control_type: input.control_type,
        patrimonio_code: input.patrimonio_code ?? null,
        quantity_total: input.control_type === 'quantidade' ? input.quantity_total : 1,
        quantity_available: input.control_type === 'quantidade' ? input.quantity_total : 1,
        brand: input.brand ?? null,
        model: input.model ?? null,
        serial_number: input.serial_number ?? null,
        condition: input.condition,
        branch_id: input.branch_id ? BigInt(input.branch_id) : null,
        department_id: input.department_id ? BigInt(input.department_id) : null,
        project_id: input.project_id ? BigInt(input.project_id) : null,
        notes: input.notes ?? null,
      },
      include: {
        category: { select: { id: true, name: true } },
        branch: { select: { id: true, brand_name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    // Gera movement 'entrada' automaticamente
    await db.tool_movements.create({
      data: {
        tool_id: tool.id,
        movement_type: 'entrada',
        quantity: input.control_type === 'quantidade' ? input.quantity_total : 1,
        to_branch_id: input.branch_id ? BigInt(input.branch_id) : null,
        to_department_id: input.department_id ? BigInt(input.department_id) : null,
        condition: input.condition,
        notes: 'Entrada inicial - cadastro de ferramenta',
        performed_by_id: BigInt(performedById),
      },
    });

    return tool;
  }

  static async updateTool(id: number, input: UpdateToolInput) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');

    const data: any = { updated_at: new Date() };
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.category_id !== undefined) data.category_id = input.category_id ? BigInt(input.category_id) : null;
    if (input.patrimonio_code !== undefined) data.patrimonio_code = input.patrimonio_code;
    if (input.quantity_total !== undefined) {
      if (tool.control_type === 'quantidade') {
        const diff = input.quantity_total - tool.quantity_total;
        data.quantity_total = input.quantity_total;
        data.quantity_available = Math.max(0, tool.quantity_available + diff);
      }
    }
    if (input.brand !== undefined) data.brand = input.brand;
    if (input.model !== undefined) data.model = input.model;
    if (input.serial_number !== undefined) data.serial_number = input.serial_number;
    if (input.condition !== undefined) data.condition = input.condition;
    if (input.branch_id !== undefined) data.branch_id = input.branch_id ? BigInt(input.branch_id) : null;
    if (input.department_id !== undefined) data.department_id = input.department_id ? BigInt(input.department_id) : null;
    if (input.project_id !== undefined) data.project_id = input.project_id ? BigInt(input.project_id) : null;
    if (input.notes !== undefined) data.notes = input.notes;

    return db.tools.update({
      where: { id: BigInt(id) },
      data,
      include: {
        category: { select: { id: true, name: true } },
        branch: { select: { id: true, brand_name: true } },
        department: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        assigned_user: { select: { id: true, name: true } },
        assigned_team: { select: { id: true, name: true } },
      },
    });
  }

  static async deleteTool(id: number) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');

    return db.tools.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });
  }

  // ===========================================================================
  // Movements
  // ===========================================================================

  static async listMovements(input: ListMovementsInput) {
    const { page, per_page, ...filters } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (filters.tool_id) whereClause.tool_id = BigInt(filters.tool_id);
    if (filters.movement_type) whereClause.movement_type = filters.movement_type;

    // Filtra por empresa via relacao tool
    if (filters.company_id) {
      whereClause.tool = { company_id: BigInt(filters.company_id) };
    }

    const [items, total] = await Promise.all([
      db.tool_movements.findMany({
        where: whereClause,
        include: {
          tool: { select: { id: true, name: true, patrimonio_code: true } },
          performed_by: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.tool_movements.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  static async getToolMovements(toolId: number) {
    return db.tool_movements.findMany({
      where: { tool_id: BigInt(toolId) },
      include: {
        performed_by: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  static async transfer(input: TransferInput, performedById: number) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(input.tool_id), deleted_at: null },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');

    if (tool.control_type === 'quantidade' && input.quantity > tool.quantity_available) {
      throw new BadRequestError('Quantidade indisponivel para transferencia.');
    }

    // Registra movement
    await db.tool_movements.create({
      data: {
        tool_id: BigInt(input.tool_id),
        movement_type: 'transferencia',
        quantity: input.quantity,
        from_branch_id: tool.branch_id,
        from_department_id: tool.department_id,
        to_branch_id: input.to_branch_id ? BigInt(input.to_branch_id) : null,
        to_department_id: input.to_department_id ? BigInt(input.to_department_id) : null,
        condition: input.condition ?? tool.condition,
        notes: input.notes ?? null,
        performed_by_id: BigInt(performedById),
      },
    });

    // Atualiza localizacao da ferramenta
    return db.tools.update({
      where: { id: BigInt(input.tool_id) },
      data: {
        branch_id: input.to_branch_id ? BigInt(input.to_branch_id) : tool.branch_id,
        department_id: input.to_department_id ? BigInt(input.to_department_id) : tool.department_id,
        condition: input.condition ?? tool.condition,
        updated_at: new Date(),
      },
      include: {
        category: { select: { id: true, name: true } },
        branch: { select: { id: true, brand_name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  static async assignEmployee(input: AssignEmployeeInput, performedById: number) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(input.tool_id), deleted_at: null },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');

    if (tool.control_type === 'quantidade' && input.quantity > tool.quantity_available) {
      throw new BadRequestError('Quantidade indisponivel para atribuicao.');
    }

    // Registra movement
    await db.tool_movements.create({
      data: {
        tool_id: BigInt(input.tool_id),
        movement_type: 'atribuicao_funcionario',
        quantity: input.quantity,
        from_branch_id: tool.branch_id,
        from_department_id: tool.department_id,
        to_user_id: BigInt(input.user_id),
        notes: input.notes ?? null,
        performed_by_id: BigInt(performedById),
      },
    });

    // Cria termo de aceite
    await db.tool_acceptance_terms.create({
      data: {
        tool_id: BigInt(input.tool_id),
        delivered_by_id: BigInt(performedById),
        received_by_id: BigInt(input.user_id),
        notes: input.notes ?? null,
      },
    });

    // Atualiza ferramenta
    const updateData: any = { assigned_user_id: BigInt(input.user_id), updated_at: new Date() };
    if (tool.control_type === 'quantidade') {
      updateData.quantity_available = tool.quantity_available - input.quantity;
    }

    return db.tools.update({
      where: { id: BigInt(input.tool_id) },
      data: updateData,
      include: {
        assigned_user: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  static async assignTeam(input: AssignTeamInput, performedById: number) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(input.tool_id), deleted_at: null },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');

    if (tool.control_type === 'quantidade' && input.quantity > tool.quantity_available) {
      throw new BadRequestError('Quantidade indisponivel para atribuicao.');
    }

    await db.tool_movements.create({
      data: {
        tool_id: BigInt(input.tool_id),
        movement_type: 'atribuicao_equipe',
        quantity: input.quantity,
        from_branch_id: tool.branch_id,
        from_department_id: tool.department_id,
        to_team_id: BigInt(input.team_id),
        notes: input.notes ?? null,
        performed_by_id: BigInt(performedById),
      },
    });

    const updateData: any = { assigned_team_id: BigInt(input.team_id), updated_at: new Date() };
    if (tool.control_type === 'quantidade') {
      updateData.quantity_available = tool.quantity_available - input.quantity;
    }

    return db.tools.update({
      where: { id: BigInt(input.tool_id) },
      data: updateData,
      include: {
        assigned_team: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  static async assignProject(input: AssignProjectInput, performedById: number) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(input.tool_id), deleted_at: null },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');

    if (tool.control_type === 'quantidade' && input.quantity > tool.quantity_available) {
      throw new BadRequestError('Quantidade indisponivel para atribuicao.');
    }

    await db.tool_movements.create({
      data: {
        tool_id: BigInt(input.tool_id),
        movement_type: 'atribuicao_projeto',
        quantity: input.quantity,
        from_branch_id: tool.branch_id,
        from_department_id: tool.department_id,
        to_project_id: BigInt(input.project_id),
        notes: input.notes ?? null,
        performed_by_id: BigInt(performedById),
      },
    });

    const updateData: any = { project_id: BigInt(input.project_id), updated_at: new Date() };
    if (tool.control_type === 'quantidade') {
      updateData.quantity_available = tool.quantity_available - input.quantity;
    }

    return db.tools.update({
      where: { id: BigInt(input.tool_id) },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  static async returnTool(input: ReturnToolInput, performedById: number) {
    const tool = await db.tools.findFirst({
      where: { id: BigInt(input.tool_id), deleted_at: null },
    });
    if (!tool) throw new NotFoundError('Ferramenta nao encontrada.');

    await db.tool_movements.create({
      data: {
        tool_id: BigInt(input.tool_id),
        movement_type: 'devolucao',
        quantity: input.quantity,
        from_user_id: tool.assigned_user_id,
        from_team_id: tool.assigned_team_id,
        from_project_id: tool.project_id,
        to_branch_id: input.to_branch_id ? BigInt(input.to_branch_id) : tool.branch_id,
        to_department_id: input.to_department_id ? BigInt(input.to_department_id) : tool.department_id,
        condition: input.condition,
        notes: input.notes ?? null,
        performed_by_id: BigInt(performedById),
      },
    });

    const updateData: any = {
      assigned_user_id: null,
      assigned_team_id: null,
      condition: input.condition,
      updated_at: new Date(),
    };

    if (input.to_branch_id) updateData.branch_id = BigInt(input.to_branch_id);
    if (input.to_department_id) updateData.department_id = BigInt(input.to_department_id);

    if (tool.control_type === 'quantidade') {
      updateData.quantity_available = Math.min(
        tool.quantity_total,
        tool.quantity_available + input.quantity,
      );
    }

    return db.tools.update({
      where: { id: BigInt(input.tool_id) },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        branch: { select: { id: true, brand_name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  static async assignKit(input: AssignKitInput, performedById: number) {
    const kit = await db.tool_kits.findFirst({
      where: { id: BigInt(input.kit_id), deleted_at: null },
      include: {
        items: {
          include: { category: true },
        },
      },
    });
    if (!kit) throw new NotFoundError('Kit nao encontrado.');
    if (kit.items.length === 0) throw new BadRequestError('Kit nao possui itens.');

    // Busca ferramentas disponiveis por categoria do kit
    return db.$transaction(async (tx) => {
      const assignedTools: any[] = [];

      for (const kitItem of kit.items) {
        // Busca ferramentas disponiveis da categoria
        const availableTools = await tx.tools.findMany({
          where: {
            category_id: kitItem.category_id,
            deleted_at: null,
            assigned_user_id: null,
            OR: [
              { control_type: 'patrimonio' },
              { control_type: 'quantidade', quantity_available: { gte: 1 } },
            ],
          },
          take: kitItem.quantity,
        });

        for (const tool of availableTools) {
          // Movement
          await tx.tool_movements.create({
            data: {
              tool_id: tool.id,
              movement_type: 'atribuicao_kit',
              quantity: 1,
              to_user_id: BigInt(input.user_id),
              notes: `Kit: ${kit.name} - ${input.notes ?? ''}`.trim(),
              performed_by_id: BigInt(performedById),
            },
          });

          // Acceptance term
          await tx.tool_acceptance_terms.create({
            data: {
              tool_id: tool.id,
              delivered_by_id: BigInt(performedById),
              received_by_id: BigInt(input.user_id),
              notes: `Kit: ${kit.name}`,
            },
          });

          // Update tool
          const updateData: any = {
            assigned_user_id: BigInt(input.user_id),
            updated_at: new Date(),
          };
          if (tool.control_type === 'quantidade') {
            updateData.quantity_available = tool.quantity_available - 1;
          }

          await tx.tools.update({
            where: { id: tool.id },
            data: updateData,
          });

          assignedTools.push({ tool_id: Number(tool.id), name: tool.name, category: kitItem.category.name });
        }
      }

      return { kit_id: Number(kit.id), kit_name: kit.name, user_id: input.user_id, assigned_tools: assignedTools };
    });
  }

  // ===========================================================================
  // Acceptance Terms
  // ===========================================================================

  static async listAcceptanceTerms(input: ListAcceptanceTermsInput) {
    const { page, per_page, ...filters } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (filters.tool_id) whereClause.tool_id = BigInt(filters.tool_id);
    if (filters.received_by_id) whereClause.received_by_id = BigInt(filters.received_by_id);
    if (filters.company_id) {
      whereClause.tool = { company_id: BigInt(filters.company_id) };
    }

    const [items, total] = await Promise.all([
      db.tool_acceptance_terms.findMany({
        where: whereClause,
        include: {
          tool: { select: { id: true, name: true, patrimonio_code: true } },
          delivered_by: { select: { id: true, name: true } },
          received_by: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.tool_acceptance_terms.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  static async getAcceptanceTermById(id: number) {
    const term = await db.tool_acceptance_terms.findFirst({
      where: { id: BigInt(id) },
      include: {
        tool: { select: { id: true, name: true, patrimonio_code: true } },
        delivered_by: { select: { id: true, name: true } },
        received_by: { select: { id: true, name: true } },
      },
    });
    if (!term) throw new NotFoundError('Termo de aceite nao encontrado.');
    return term;
  }

  static async createAcceptanceTerm(input: CreateAcceptanceTermInput) {
    return db.tool_acceptance_terms.create({
      data: {
        tool_id: BigInt(input.tool_id),
        delivered_by_id: BigInt(input.delivered_by_id),
        received_by_id: BigInt(input.received_by_id),
        notes: input.notes ?? null,
      },
      include: {
        tool: { select: { id: true, name: true } },
        delivered_by: { select: { id: true, name: true } },
        received_by: { select: { id: true, name: true } },
      },
    });
  }

  // ===========================================================================
  // Kits
  // ===========================================================================

  static async listKits(input: ListKitsInput) {
    const whereClause: any = { deleted_at: null };
    if (input.company_id) whereClause.company_id = BigInt(input.company_id);
    if (input.cargo) whereClause.cargo = { contains: input.cargo, mode: 'insensitive' };

    return db.tool_kits.findMany({
      where: whereClause,
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getKitById(id: number) {
    const kit = await db.tool_kits.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });
    if (!kit) throw new NotFoundError('Kit nao encontrado.');
    return kit;
  }

  static async getKitByCargo(cargo: string, companyId: number) {
    return db.tool_kits.findMany({
      where: {
        cargo: { equals: cargo, mode: 'insensitive' },
        company_id: BigInt(companyId),
        deleted_at: null,
      },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });
  }

  static async createKit(input: CreateKitInput) {
    return db.tool_kits.create({
      data: {
        company_id: BigInt(input.company_id),
        name: input.name,
        cargo: input.cargo,
        description: input.description ?? null,
      },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });
  }

  static async updateKit(id: number, input: UpdateKitInput) {
    const kit = await db.tool_kits.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!kit) throw new NotFoundError('Kit nao encontrado.');

    return db.tool_kits.update({
      where: { id: BigInt(id) },
      data: {
        name: input.name,
        cargo: input.cargo,
        description: input.description,
        updated_at: new Date(),
      },
      include: {
        items: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });
  }

  static async deleteKit(id: number) {
    const kit = await db.tool_kits.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });
    if (!kit) throw new NotFoundError('Kit nao encontrado.');

    return db.tool_kits.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });
  }

  static async addKitItem(kitId: number, input: AddKitItemInput) {
    const kit = await db.tool_kits.findFirst({
      where: { id: BigInt(kitId), deleted_at: null },
    });
    if (!kit) throw new NotFoundError('Kit nao encontrado.');

    // Verifica duplicata
    const existing = await db.tool_kit_items.findFirst({
      where: { kit_id: BigInt(kitId), category_id: BigInt(input.category_id) },
    });
    if (existing) throw new BadRequestError('Esta categoria ja existe neste kit.');

    return db.tool_kit_items.create({
      data: {
        kit_id: BigInt(kitId),
        category_id: BigInt(input.category_id),
        quantity: input.quantity,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  static async deleteKitItem(kitId: number, itemId: number) {
    const item = await db.tool_kit_items.findFirst({
      where: { id: BigInt(itemId), kit_id: BigInt(kitId) },
    });
    if (!item) throw new NotFoundError('Item de kit nao encontrado.');

    return db.tool_kit_items.delete({
      where: { id: BigInt(itemId) },
    });
  }

  // ===========================================================================
  // User Tools & Summary
  // ===========================================================================

  static async getUserTools(userId: number) {
    return db.tools.findMany({
      where: {
        assigned_user_id: BigInt(userId),
        deleted_at: null,
      },
      include: {
        category: { select: { id: true, name: true } },
        branch: { select: { id: true, brand_name: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getSummary(companyId: number) {
    const where = { company_id: BigInt(companyId), deleted_at: null };

    const [total, byCondition, byControlType, assigned, available] = await Promise.all([
      db.tools.count({ where }),
      db.tools.groupBy({ by: ['condition'], where, _count: true }),
      db.tools.groupBy({ by: ['control_type'], where, _count: true }),
      db.tools.count({ where: { ...where, assigned_user_id: { not: null } } }),
      db.tools.count({ where: { ...where, assigned_user_id: null } }),
    ]);

    return {
      total,
      assigned,
      available,
      by_condition: byCondition.map(c => ({ condition: c.condition, count: c._count })),
      by_control_type: byControlType.map(c => ({ control_type: c.control_type, count: c._count })),
    };
  }
}

export default ToolsService;
