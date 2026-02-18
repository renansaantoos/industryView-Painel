// =============================================================================
// INDUSTRYVIEW BACKEND - Inventory Module Service
// Service do modulo de inventario
// Equivalente a logica dos endpoints do Xano em apis/inventory/
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { normalizeText, buildPaginationResponse } from '../../utils/helpers';
import {
  ListProductInventoryInput,
  CreateProductInventoryInput,
  AddQuantityInventoryInput,
  RemoveQuantityInventoryInput,
  ListInventoryLogsInput,
  CreateInventoryLogInput,
  UpdateInventoryLogInput,
  ImportInventoryInput,
  ExportInventoryInput,
} from './inventory.schema';

/**
 * InventoryService - Service do modulo de inventario
 */
export class InventoryService {
  // ===========================================================================
  // Product Inventory CRUD
  // ===========================================================================

  /**
   * Lista produtos do inventario com paginacao e filtros
   * Equivalente a: query product_inventory verb=GET do Xano
   */
  static async listProductInventory(input: ListProductInventoryInput) {
    const { page, per_page, category_id, status_id, search, projects_id, company_id, sort_field, sort_direction } = input as any;
    const skip = (page - 1) * per_page;

    // Constroi clausula where
    const whereClause: any = {
      deleted_at: null,
    };

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    // Isolamento multi-tenant via projects.company_id
    if (company_id && !projects_id) {
      whereClause.projects = { company_id: BigInt(company_id) };
    }

    if (category_id) {
      whereClause.equipaments_types_id = BigInt(category_id);
    }

    if (status_id) {
      whereClause.status_inventory_id = BigInt(status_id);
    }

    if (search) {
      const searchNormalized = normalizeText(search);
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { product_normalized: { contains: searchNormalized, mode: 'insensitive' } },
      ];
    }

    // Busca produtos com paginacao
    const [items, total] = await Promise.all([
      db.product_inventory.findMany({
        where: whereClause,
        include: {
          unity: {
            select: { unity: true },
          },
          status_inventory: {
            select: { id: true, status: true },
          },
          equipaments_types: {
            select: { id: true, type: true },
          },
          manufacturers: {
            select: { id: true, name: true },
          },
        },
        orderBy: (() => {
          const ALLOWED_SORT_FIELDS = ['product', 'inventory_quantity', 'min_quantity', 'code', 'created_at'];
          if (sort_field && ALLOWED_SORT_FIELDS.includes(sort_field)) {
            return { [sort_field]: sort_direction || 'asc' };
          }
          return { created_at: 'desc' };
        })(),
        skip,
        take: per_page,
      }),
      db.product_inventory.count({ where: whereClause }),
    ]);

    // Calcula contadores
    // Equivalente ao bloco que calcula no_count, low_count, all_count do Xano
    const [noCount, lowCount, allCount] = await Promise.all([
      // Sem estoque (status_inventory_id = 3)
      db.product_inventory.count({
        where: {
          deleted_at: null,
          status_inventory_id: BigInt(3),
          projects_id: projects_id ? BigInt(projects_id) : undefined,
        },
      }),
      // Estoque baixo (status_inventory_id = 2)
      db.product_inventory.count({
        where: {
          deleted_at: null,
          status_inventory_id: BigInt(2),
          projects_id: projects_id ? BigInt(projects_id) : undefined,
        },
      }),
      // Total em estoque (status 1 ou 2)
      db.product_inventory.aggregate({
        where: {
          deleted_at: null,
          OR: [
            { status_inventory_id: BigInt(1) },
            { status_inventory_id: BigInt(2) },
          ],
          projects_id: projects_id ? BigInt(projects_id) : undefined,
        },
        _sum: {
          inventory_quantity: true,
        },
      }),
    ]);

    return {
      result1: buildPaginationResponse(items, total, page, per_page),
      low: lowCount,
      no: noCount,
      all: allCount._sum.inventory_quantity || 0,
    };
  }

  /**
   * Busca produto por ID
   * Equivalente a: query "product_inventory/{product_inventory_id}" verb=GET do Xano
   */
  static async getProductInventoryById(product_inventory_id: number) {
    const product = await db.product_inventory.findFirst({
      where: { id: BigInt(product_inventory_id) },
      include: {
        unity: true,
        status_inventory: true,
        equipaments_types: true,
        manufacturers: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Not Found.');
    }

    return product;
  }

  /**
   * Cria produto no inventario
   * Equivalente a: query product_inventory verb=POST do Xano
   */
  static async createProductInventory(input: CreateProductInventoryInput, userId?: number) {
    const {
      code: inputCode,
      product,
      specifications,
      inventory_quantity,
      min_quantity,
      unity_id,
      status_inventory_id,
      equipaments_types_id,
      manufacturers_id,
      projects_id,
      ncm_code,
      cest_code,
      origin_indicator,
      custody_type,
      cost_price,
      batch_lot,
      fiscal_classification,
      barcode,
    } = input;

    // Usa codigo fornecido ou gera automaticamente
    let code = inputCode || '';
    if (!code && equipaments_types_id) {
      const equipamentType = await db.equipaments_types.findFirst({
        where: { id: BigInt(equipaments_types_id) },
      });

      if (equipamentType) {
        // Busca ultimo produto da categoria para gerar sequencial
        const lastProduct = await db.product_inventory.findFirst({
          where: { equipaments_types_id: BigInt(equipaments_types_id) },
          orderBy: { sequential_per_category: 'desc' },
        });

        const sequential = (lastProduct?.sequential_per_category || 0) + 1;

        // Formata numero com zeros a esquerda
        // Equivalente ao conditional do Xano para formatacao
        let numberStr = sequential.toString();
        if (numberStr.length === 1) {
          numberStr = '000' + numberStr;
        } else if (numberStr.length === 2) {
          numberStr = '00' + numberStr;
        } else if (numberStr.length === 3) {
          numberStr = '0' + numberStr;
        }

        code = `${equipamentType.code || ''}-${numberStr}`;
      }
    }

    // Cria o produto
    const productRecord = await db.product_inventory.create({
      data: {
        code,
        product,
        product_normalized: normalizeText(product),
        specifications: specifications || null,
        inventory_quantity: inventory_quantity || 0,
        min_quantity: min_quantity || 0,
        unity_id: unity_id ? BigInt(unity_id) : null,
        status_inventory_id: status_inventory_id ? BigInt(status_inventory_id) : BigInt(1),
        equipaments_types_id: equipaments_types_id ? BigInt(equipaments_types_id) : null,
        manufacturers_id: manufacturers_id ? BigInt(manufacturers_id) : null,
        projects_id: projects_id ? BigInt(projects_id) : null,
        ncm_code: ncm_code || null,
        cest_code: cest_code || null,
        origin_indicator: origin_indicator ?? null,
        custody_type: custody_type || null,
        cost_price: cost_price ?? null,
        batch_lot: batch_lot || null,
        fiscal_classification: fiscal_classification || null,
        barcode: barcode || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Cria log de criacao
    await db.inventory_logs.create({
      data: {
        code: productRecord.code,
        quantity: productRecord.inventory_quantity,
        type: true, // Entrada
        observations: 'Produto criado no estoque',
        responsible_users_id: userId ? BigInt(userId) : null,
        product_inventory_id: productRecord.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { result1: productRecord };
  }

  /**
   * Atualiza produto do inventario
   * Equivalente a: query "product_inventory/{product_inventory_id}" verb=PATCH do Xano
   */
  static async updateProductInventory(
    product_inventory_id: number,
    input: Partial<CreateProductInventoryInput>
  ) {
    const data: any = { updated_at: new Date() };

    if (input.product !== undefined) {
      data.product = input.product;
      data.product_normalized = normalizeText(input.product);
    }
    if (input.specifications !== undefined) data.specifications = input.specifications;
    if (input.inventory_quantity !== undefined) data.inventory_quantity = input.inventory_quantity;
    if (input.min_quantity !== undefined) data.min_quantity = input.min_quantity;
    if (input.unity_id !== undefined) data.unity_id = input.unity_id ? BigInt(input.unity_id) : null;
    if (input.status_inventory_id !== undefined) {
      data.status_inventory_id = input.status_inventory_id ? BigInt(input.status_inventory_id) : null;
    }
    if (input.equipaments_types_id !== undefined) {
      data.equipaments_types_id = input.equipaments_types_id ? BigInt(input.equipaments_types_id) : null;
    }
    if (input.manufacturers_id !== undefined) {
      data.manufacturers_id = input.manufacturers_id ? BigInt(input.manufacturers_id) : null;
    }
    if (input.ncm_code !== undefined) data.ncm_code = input.ncm_code || null;
    if (input.cest_code !== undefined) data.cest_code = input.cest_code || null;
    if (input.origin_indicator !== undefined) data.origin_indicator = input.origin_indicator ?? null;
    if (input.custody_type !== undefined) data.custody_type = input.custody_type || null;
    if (input.cost_price !== undefined) data.cost_price = input.cost_price ?? null;
    if (input.batch_lot !== undefined) data.batch_lot = input.batch_lot || null;
    if (input.fiscal_classification !== undefined) data.fiscal_classification = input.fiscal_classification || null;
    if (input.barcode !== undefined) data.barcode = input.barcode || null;

    return db.product_inventory.update({
      where: { id: BigInt(product_inventory_id) },
      data,
    });
  }

  /**
   * Deleta produto do inventario (soft delete)
   * Equivalente a: query "product_inventory/{product_inventory_id}" verb=DELETE do Xano
   */
  static async deleteProductInventory(product_inventory_id: number) {
    return db.product_inventory.update({
      where: { id: BigInt(product_inventory_id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Inventory Quantity Operations
  // ===========================================================================

  /**
   * Adiciona quantidade ao inventario
   * Equivalente a: query Add_quantity_inventory verb=POST do Xano
   */
  static async addQuantityInventory(input: AddQuantityInventoryInput, userId?: number) {
    const { product_inventory_id, quantity } = input;

    // Busca produto atual
    const produto = await db.product_inventory.findFirst({
      where: { id: BigInt(product_inventory_id) },
    });

    if (!produto) {
      throw new NotFoundError('Produto nao encontrado.');
    }

    const currentQuantity = produto.inventory_quantity || 0;
    const newQuantity = currentQuantity + quantity;
    const minQuantity = produto.min_quantity || 0;

    // Determina novo status baseado na quantidade
    // Equivalente ao conditional do Xano
    let newStatusId: bigint;
    if (newQuantity <= minQuantity) {
      newStatusId = BigInt(2); // Estoque baixo
    } else {
      newStatusId = BigInt(1); // Em estoque
    }

    // Atualiza produto
    const updatedProduct = await db.product_inventory.update({
      where: { id: BigInt(product_inventory_id) },
      data: {
        inventory_quantity: newQuantity,
        status_inventory_id: newStatusId,
        updated_at: new Date(),
      },
    });

    // Cria log de entrada
    await db.inventory_logs.create({
      data: {
        code: updatedProduct.code,
        quantity,
        type: true, // Entrada
        observations: `Entrada de ${quantity} unidades no estoque`,
        responsible_users_id: userId ? BigInt(userId) : null,
        product_inventory_id: updatedProduct.id,
        projects_id: updatedProduct.projects_id,
        created_at: new Date(),
      },
    });

    return null;
  }

  /**
   * Remove quantidade do inventario
   * Equivalente a: query Remove_quantity_inventory verb=POST do Xano
   */
  static async removeQuantityInventory(input: RemoveQuantityInventoryInput, userId?: number) {
    const { product_inventory_id, quantity, received_user } = input;

    // Busca produto atual
    const produto = await db.product_inventory.findFirst({
      where: { id: BigInt(product_inventory_id) },
    });

    if (!produto) {
      throw new NotFoundError('Produto nao encontrado.');
    }

    const currentQuantity = produto.inventory_quantity || 0;
    let newQuantity = currentQuantity - quantity;
    const minQuantity = produto.min_quantity || 0;

    // Determina novo status baseado na quantidade
    // Equivalente ao conditional do Xano
    let newStatusId: bigint;

    if (newQuantity < 0) {
      newQuantity = 0;
      newStatusId = BigInt(3); // Sem estoque
    } else if (newQuantity === 0) {
      newStatusId = BigInt(3); // Sem estoque
    } else if (newQuantity < minQuantity) {
      newStatusId = BigInt(2); // Estoque baixo
    } else {
      newStatusId = BigInt(1); // Em estoque
    }

    // Atualiza produto
    const updatedProduct = await db.product_inventory.update({
      where: { id: BigInt(product_inventory_id) },
      data: {
        inventory_quantity: newQuantity,
        status_inventory_id: newStatusId,
        updated_at: new Date(),
      },
    });

    // Cria log de saida
    await db.inventory_logs.create({
      data: {
        code: updatedProduct.code,
        quantity,
        type: false, // Saida
        observations: `Saida de ${quantity} unidades do estoque`,
        responsible_users_id: userId ? BigInt(userId) : null,
        received_user: received_user ? BigInt(received_user) : null,
        product_inventory_id: updatedProduct.id,
        projects_id: updatedProduct.projects_id,
        created_at: new Date(),
      },
    });

    return null;
  }

  // ===========================================================================
  // Status Inventory CRUD
  // ===========================================================================

  /**
   * Lista status do inventario
   * Equivalente a: query status_inventory verb=GET do Xano
   */
  static async listStatusInventory() {
    return db.status_inventory.findMany();
  }

  /**
   * Busca status por ID
   */
  static async getStatusInventoryById(status_inventory_id: number) {
    const status = await db.status_inventory.findFirst({
      where: { id: BigInt(status_inventory_id) },
    });

    if (!status) {
      throw new NotFoundError('Not Found.');
    }

    return status;
  }

  /**
   * Cria status de inventario
   */
  static async createStatusInventory(status: string) {
    return db.status_inventory.create({
      data: {
        status,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Atualiza status
   */
  static async updateStatusInventory(status_inventory_id: number, status?: string) {
    return db.status_inventory.update({
      where: { id: BigInt(status_inventory_id) },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Deleta status (soft delete)
   */
  static async deleteStatusInventory(status_inventory_id: number) {
    return db.status_inventory.update({
      where: { id: BigInt(status_inventory_id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Inventory Logs CRUD
  // ===========================================================================

  /**
   * Lista logs de inventario
   * Equivalente a: query inventory_logs verb=GET do Xano
   */
  static async listInventoryLogs(input: ListInventoryLogsInput) {
    const { page, per_page, projects_id } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
    };

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    const [items, total] = await Promise.all([
      db.inventory_logs.findMany({
        where: whereClause,
        include: {
          responsible_user: {
            select: { id: true, name: true },
          },
          product_inventory: {
            select: { id: true, code: true, product: true },
          },
          received_user_rel: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: per_page,
        orderBy: { created_at: 'desc' },
      }),
      db.inventory_logs.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca log por ID
   */
  static async getInventoryLogById(inventory_logs_id: number) {
    const log = await db.inventory_logs.findFirst({
      where: { id: BigInt(inventory_logs_id) },
      include: {
        responsible_user: true,
        product_inventory: true,
        received_user_rel: true,
      },
    });

    if (!log) {
      throw new NotFoundError('Not Found.');
    }

    return log;
  }

  /**
   * Cria log de inventario
   */
  static async createInventoryLog(input: CreateInventoryLogInput) {
    return db.inventory_logs.create({
      data: {
        code: input.code,
        quantity: input.quantity,
        type: input.type,
        observations: input.observations,
        responsible_users_id: input.responsible_users_id ? BigInt(input.responsible_users_id) : null,
        received_user: input.received_user ? BigInt(input.received_user) : null,
        product_inventory_id: BigInt(input.product_inventory_id),
        projects_id: input.projects_id ? BigInt(input.projects_id) : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Atualiza log
   */
  static async updateInventoryLog(inventory_logs_id: number, input: Partial<UpdateInventoryLogInput>) {
    return db.inventory_logs.update({
      where: { id: BigInt(inventory_logs_id) },
      data: {
        code: input.code,
        quantity: input.quantity,
        type: input.type,
        observations: input.observations,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Deleta log (soft delete)
   */
  static async deleteInventoryLog(inventory_logs_id: number) {
    return db.inventory_logs.update({
      where: { id: BigInt(inventory_logs_id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Lista logs filtrados por produto
   * Equivalente a: query inventory_logs_0 verb=GET do Xano
   */
  static async listInventoryLogsFiltered(product_inventory_id?: number, projects_id?: number) {
    const whereClause: any = {
      deleted_at: null,
    };

    if (product_inventory_id) {
      whereClause.product_inventory_id = BigInt(product_inventory_id);
    }

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    return db.inventory_logs.findMany({
      where: whereClause,
      include: {
        responsible_user: {
          select: { id: true, name: true },
        },
        product_inventory: {
          select: { id: true, code: true, product: true },
        },
        received_user_rel: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ===========================================================================
  // Import/Export Operations
  // ===========================================================================

  /**
   * Importa produtos para o inventario
   * Equivalente a: query import_inventory verb=POST do Xano
   */
  static async importInventory(input: ImportInventoryInput, userId?: number) {
    const { products, projects_id } = input;
    const createdProducts = [];

    for (const productData of products) {
      const created = await this.createProductInventory(
        {
          product: productData.product,
          specifications: productData.specifications,
          inventory_quantity: productData.inventory_quantity || 0,
          min_quantity: productData.min_quantity || 0,
          unity_id: productData.unity_id,
          equipaments_types_id: productData.equipaments_types_id,
          manufacturers_id: productData.manufacturers_id,
          projects_id,
        },
        userId
      );
      createdProducts.push(created.result1);
    }

    return { imported: createdProducts.length, products: createdProducts };
  }

  /**
   * Exporta inventario
   * Equivalente a: query export_inventory verb=GET do Xano
   */
  static async exportInventory(input: ExportInventoryInput) {
    const { projects_id } = input;

    const whereClause: any = {
      deleted_at: null,
    };

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    const products = await db.product_inventory.findMany({
      where: whereClause,
      include: {
        unity: {
          select: { unity: true },
        },
        status_inventory: {
          select: { status: true },
        },
        equipaments_types: {
          select: { type: true },
        },
        manufacturers: {
          select: { name: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    // Formata para exportacao (CSV-like structure)
    return products.map(p => ({
      code: p.code,
      product: p.product,
      specifications: p.specifications,
      quantity: p.inventory_quantity,
      min_quantity: p.min_quantity,
      unity: p.unity?.unity,
      status: p.status_inventory?.status,
      category: p.equipaments_types?.type,
      manufacturer: p.manufacturers?.name,
      ncm_code: p.ncm_code,
      cest_code: p.cest_code,
      origin_indicator: p.origin_indicator,
      custody_type: p.custody_type,
      cost_price: p.cost_price ? Number(p.cost_price) : null,
      batch_lot: p.batch_lot,
      fiscal_classification: p.fiscal_classification,
      barcode: p.barcode,
    }));
  }
}

export default InventoryService;
