// =============================================================================
// INDUSTRYVIEW BACKEND - Manufacturers Module Service
// Service de fabricantes
// Equivalente a logica dos endpoints do api_group Manufacturers do Xano
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { normalizeText } from '../../utils/helpers';
import { logger } from '../../utils/logger';
import {
  ListManufacturersInput,
  CreateManufacturerInput,
  UpdateManufacturerInput,
} from './manufacturers.schema';

/**
 * ManufacturersService - Service do modulo de fabricantes
 */
export class ManufacturersService {
  /**
   * Lista fabricantes com paginacao e filtros
   * Equivalente a: query manufacturers verb=GET do Xano (endpoint 422)
   */
  static async list(input: ListManufacturersInput) {
    const { page, per_page, search, equipaments_types_id } = input;

    // Base query conditions
    const whereConditions: any = {
      deleted_at: null,
    };

    // Filtro por tipo de equipamento
    if (equipaments_types_id) {
      whereConditions.equipaments_types_id = equipaments_types_id;
    }

    // Filtro de busca usando name_normalized
    if (search && search.trim() !== '') {
      const searchNormalized = normalizeText(search);
      whereConditions.name_normalized = { contains: searchNormalized };
    }

    // Conta total de registros
    const total = await db.manufacturers.count({ where: whereConditions });

    // Busca fabricantes com paginacao
    const manufacturers = await db.manufacturers.findMany({
      where: whereConditions,
      orderBy: { name: 'asc' },
      skip: (page - 1) * per_page,
      take: per_page,
      include: {
        equipaments_types: {
          select: { id: true, type: true },
        },
      },
    });

    return {
      items: manufacturers,
      curPage: page,
      perPage: per_page,
      itemsReceived: manufacturers.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Busca fabricante por ID
   * Equivalente a: query manufacturers/{manufacturers_id} verb=GET do Xano (endpoint 421)
   */
  static async getById(manufacturerId: number) {
    const manufacturer = await db.manufacturers.findFirst({
      where: {
        id: manufacturerId,
        deleted_at: null,
      },
      include: {
        equipaments_types: true,
      },
    });

    if (!manufacturer) {
      throw new NotFoundError('Not Found.');
    }

    return manufacturer;
  }

  /**
   * Cria um novo fabricante
   * Equivalente a: query manufacturers verb=POST do Xano (endpoint 423)
   */
  static async create(input: CreateManufacturerInput) {
    const manufacturer = await db.manufacturers.create({
      data: {
        name: input.name,
        name_normalized: normalizeText(input.name),
        equipaments_types_id: input.equipaments_types_id || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    logger.info({ manufacturerId: manufacturer.id, name: manufacturer.name }, 'Manufacturer created');
    return manufacturer;
  }

  /**
   * Atualiza fabricante
   * Equivalente a: query manufacturers/{manufacturers_id} verb=PATCH do Xano (endpoint 424)
   */
  static async update(manufacturerId: number, input: UpdateManufacturerInput) {
    const existingManufacturer = await db.manufacturers.findFirst({
      where: {
        id: manufacturerId,
        deleted_at: null,
      },
    });

    if (!existingManufacturer) {
      throw new NotFoundError('Fabricante nao encontrado.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
      updateData.name_normalized = normalizeText(input.name);
    }
    if (input.equipaments_types_id !== undefined) {
      updateData.equipaments_types_id = input.equipaments_types_id;
    }
    if (input.deleted_at !== undefined) {
      updateData.deleted_at = input.deleted_at ? new Date(input.deleted_at) : null;
    }

    const manufacturer = await db.manufacturers.update({
      where: { id: manufacturerId },
      data: updateData,
    });

    logger.info({ manufacturerId }, 'Manufacturer updated');
    return manufacturer;
  }

  /**
   * Remove fabricante (soft delete)
   * Equivalente a: query manufacturers/{manufacturers_id} verb=DELETE do Xano (endpoint 420)
   */
  static async delete(manufacturerId: number) {
    const existingManufacturer = await db.manufacturers.findFirst({
      where: {
        id: manufacturerId,
        deleted_at: null,
      },
    });

    if (!existingManufacturer) {
      throw new NotFoundError('Fabricante nao encontrado.');
    }

    const manufacturer = await db.manufacturers.update({
      where: { id: manufacturerId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
      select: {
        id: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    logger.info({ manufacturerId }, 'Manufacturer deleted');
    return manufacturer;
  }
}

export default ManufacturersService;
