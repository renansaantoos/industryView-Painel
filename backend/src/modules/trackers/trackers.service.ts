// =============================================================================
// INDUSTRYVIEW BACKEND - Trackers Module Service
// Service do modulo de trackers (rastreadores solares)
// Equivalente a logica dos endpoints do Xano em apis/trackers/ e apis/trackers_map/
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { normalizeText, buildPaginationResponse } from '../../utils/helpers';
import {
  ListTrackersInput,
  ListAllTrackersInput,
  GetTrackerByIdInput,
  CreateTrackerInput,
  UpdateTrackerInput,
  ListTrackerTypesInput,
  CreateTrackerTypeInput,
  ListFieldsInput,
  CreateFieldInput,
  ListSectionsInput,
  CreateSectionInput,
  UpdateSectionInput,
  DuplicateSectionInput,
  ListRowsInput,
  GetTrackersMapInput,
  CreateTrackersMapInput,
  UpdateTrackersMapInput,
} from './trackers.schema';
import { Prisma } from '@prisma/client';

/**
 * TrackersService - Service do modulo de trackers
 */
export class TrackersService {
  // ===========================================================================
  // Trackers CRUD
  // ===========================================================================

  /**
   * Lista trackers com paginacao e busca
   * Equivalente a: query trackers verb=GET do Xano
   */
  static async listTrackers(input: ListTrackersInput) {
    const { page, per_page, search, company_id } = input;
    const skip = (page - 1) * per_page;

    // Se nao tiver busca, usa query simples do Prisma
    if (!search) {
      const [items, total] = await Promise.all([
        db.trackers.findMany({
          where: {
            deleted_at: null,
            company_id: company_id ? BigInt(company_id) : undefined,
          },
          include: {
            trackers_types: {
              select: { id: true, type: true },
            },
            manufacturers: {
              select: { id: true, name: true },
            },
          },
          orderBy: { created_at: 'asc' },
          skip,
          take: per_page,
        }),
        db.trackers.count({
          where: {
            deleted_at: null,
            company_id: company_id ? BigInt(company_id) : undefined,
          },
        }),
      ]);

      return buildPaginationResponse(items, page, per_page, total);
    }

    // Com busca, usa query raw para buscar em tabelas relacionadas
    // Equivalente ao db.direct_query do Xano
    const searchNormalized = `%${normalizeText(search)}%`;

    const result = await db.$queryRaw<any[]>`
      WITH filtered AS (
        SELECT
          t.*,
          TO_JSONB(manu) AS "_manufacturers",
          TO_JSONB(tt) AS "_trackers_types"
        FROM trackers AS t
        LEFT JOIN manufacturers AS manu
          ON t.manufacturers_id = manu.id
        LEFT JOIN trackers_types AS tt
          ON t.trackers_types_id = tt.id
        WHERE
          (manu.name_normalized ILIKE ${searchNormalized} OR tt.type_normalized ILIKE ${searchNormalized})
          AND manu.deleted_at IS NULL
          AND tt.deleted_at IS NULL
          AND t.deleted_at IS NULL
          ${company_id ? Prisma.sql`AND t.company_id = ${BigInt(company_id)}` : Prisma.empty}
      ),
      paginated AS (
        SELECT *
        FROM filtered
        ORDER BY id DESC
        LIMIT ${per_page} OFFSET ${skip}
      ),
      total AS (
        SELECT COUNT(*) AS total_count FROM filtered
      )
      SELECT
        (SELECT COUNT(*) FROM paginated) as "itemsReceived",
        ${page} as "curPage",
        ${per_page} as "perPage",
        total.total_count as "itemsTotal",
        CEIL(total.total_count::numeric / ${per_page}) as "pageTotal",
        COALESCE((SELECT json_agg(row_to_json(p)) FROM paginated p), '[]'::json) as items
      FROM total
    `;

    if (result.length > 0) {
      const data = result[0];
      return {
        items: data.items || [],
        curPage: Number(data.curPage),
        perPage: Number(data.perPage),
        itemsReceived: Number(data.itemsReceived),
        itemsTotal: Number(data.itemsTotal),
        pageTotal: Number(data.pageTotal),
      };
    }

    return buildPaginationResponse([], page, per_page, 0);
  }

  /**
   * Lista todos os trackers sem paginacao (para dropdowns)
   * Equivalente a: query trackers_0 verb=GET do Xano
   */
  static async listAllTrackers(input: ListAllTrackersInput) {
    const { company_id } = input;

    return db.trackers.findMany({
      where: {
        deleted_at: null,
        company_id: company_id ? BigInt(company_id) : undefined,
      },
      include: {
        trackers_types: {
          select: { id: true, type: true },
        },
        manufacturers: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Busca tracker por ID
   * Equivalente a: query "trackers/{trackers_id}" verb=GET do Xano
   */
  static async getTrackerById(input: GetTrackerByIdInput) {
    const tracker = await db.trackers.findFirst({
      where: {
        id: BigInt(input.trackers_id),
      },
      include: {
        trackers_types: true,
        manufacturers: true,
        stakes: {
          where: { deleted_at: null },
          include: {
            stakes_types: true,
          },
        },
      },
    });

    if (!tracker) {
      throw new NotFoundError('Not Found.');
    }

    return tracker;
  }

  /**
   * Cria um novo tracker
   * Equivalente a: query trackers verb=POST do Xano
   */
  static async createTracker(input: CreateTrackerInput) {
    const {
      trackers_types_id,
      manufacturers_id,
      stake_quantity,
      max_modules,
      stakes_on_traker,
      company_id,
    } = input;

    // Valida quantidade de estacas
    // Equivalente a: precondition ($input.stake_quantity === $stakes_length) do Xano
    const stakesLength = stakes_on_traker?.length || 0;
    if (stake_quantity !== stakesLength) {
      throw new BadRequestError('Todas as estacas devem ser preenchidas.');
    }

    // Usa transacao para garantir atomicidade
    // Equivalente a: db.transaction do Xano
    return db.$transaction(async (tx) => {
      // Cria o tracker
      const tracker = await tx.trackers.create({
        data: {
          stake_quantity: stake_quantity || 0,
          max_modules: max_modules || 0,
          trackers_types_id: trackers_types_id ? BigInt(trackers_types_id) : null,
          manufacturers_id: manufacturers_id ? BigInt(manufacturers_id) : null,
          company_id: company_id ? BigInt(company_id) : null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (!tracker) {
        throw new BadRequestError('Falha ao criar tracker.');
      }

      // Cria as estacas
      // Equivalente a: foreach ($input.stakes_on_traker) do Xano
      if (stakes_on_traker && stakes_on_traker.length > 0) {
        for (const stake of stakes_on_traker) {
          await tx.stakes.create({
            data: {
              position: stake.stakes_position || '',
              is_motor: stake.stakes_is_motor || false,
              trackers_id: tracker.id,
              stakes_types_id: stake.stakes_types_id ? BigInt(stake.stakes_types_id) : null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        }
      }

      return tracker;
    });
  }

  /**
   * Atualiza um tracker
   * Equivalente a: query "trackers/{trackers_id}" verb=PATCH do Xano
   */
  static async updateTracker(input: UpdateTrackerInput) {
    const {
      trackers_id,
      trackers_types_id,
      manufacturers_id,
      stake_quantity,
      max_modules,
      stakes_on_traker,
    } = input;

    // Valida quantidade de estacas
    const stakesLength = stakes_on_traker?.length || 0;
    if (stake_quantity !== stakesLength) {
      throw new BadRequestError('Todas as estacas devem ser preenchidas.');
    }

    return db.$transaction(async (tx) => {
      // Soft delete das estacas existentes
      // Equivalente ao foreach que faz soft delete no Xano
      const existingStakes = await tx.stakes.findMany({
        where: {
          trackers_id: BigInt(trackers_id),
        },
      });

      for (const stake of existingStakes) {
        await tx.stakes.update({
          where: { id: stake.id },
          data: { deleted_at: new Date() },
        });
      }

      // Atualiza o tracker
      const tracker = await tx.trackers.update({
        where: { id: BigInt(trackers_id) },
        data: {
          stake_quantity,
          max_modules,
          trackers_types_id: trackers_types_id ? BigInt(trackers_types_id) : undefined,
          manufacturers_id: manufacturers_id ? BigInt(manufacturers_id) : undefined,
          updated_at: new Date(),
        },
      });

      if (!tracker) {
        throw new BadRequestError('Falha ao criar tracker.');
      }

      // Cria ou atualiza as estacas
      // Equivalente ao foreach com conditional no Xano
      if (stakes_on_traker && stakes_on_traker.length > 0) {
        for (const stake of stakes_on_traker) {
          if (stake.stakes_id && stake.stakes_id > 0) {
            // Atualiza estaca existente (reativa do soft delete)
            await tx.stakes.update({
              where: { id: BigInt(stake.stakes_id) },
              data: {
                position: stake.stakes_position || '',
                is_motor: stake.stakes_is_motor || false,
                trackers_id: BigInt(trackers_id),
                stakes_types_id: stake.stakes_types_id ? BigInt(stake.stakes_types_id) : null,
                updated_at: new Date(),
                deleted_at: null,
              },
            });
          } else {
            // Cria nova estaca
            await tx.stakes.create({
              data: {
                position: stake.stakes_position || '',
                is_motor: stake.stakes_is_motor || false,
                trackers_id: tracker.id,
                stakes_types_id: stake.stakes_types_id ? BigInt(stake.stakes_types_id) : null,
                created_at: new Date(),
                updated_at: new Date(),
              },
            });
          }
        }
      }

      return tracker;
    });
  }

  /**
   * Deleta um tracker (soft delete)
   * Equivalente a: query "trackers/{trackers_id}" verb=DELETE do Xano
   */
  static async deleteTracker(trackers_id: number) {
    return db.$transaction(async (tx) => {
      // Soft delete do tracker
      const tracker = await tx.trackers.update({
        where: { id: BigInt(trackers_id) },
        data: {
          updated_at: new Date(),
          deleted_at: new Date(),
        },
      });

      // Soft delete das estacas relacionadas
      const stakesToDelete = await tx.stakes.findMany({
        where: { trackers_id: BigInt(trackers_id) },
      });

      for (const stake of stakesToDelete) {
        await tx.stakes.update({
          where: { id: stake.id },
          data: {
            updated_at: new Date(),
            deleted_at: new Date(),
          },
        });
      }

      return tracker;
    });
  }

  // ===========================================================================
  // Trackers Types CRUD
  // ===========================================================================

  /**
   * Lista tipos de trackers
   * Equivalente a: query trackers_types verb=GET do Xano
   */
  static async listTrackerTypes(input: ListTrackerTypesInput) {
    const { search } = input;

    const whereClause: any = {};
    if (search) {
      whereClause.type_normalized = {
        contains: normalizeText(search),
        mode: 'insensitive',
      };
    }

    return db.trackers_types.findMany({
      where: whereClause,
    });
  }

  /**
   * Cria tipo de tracker
   * Equivalente a: query trackers_types verb=POST do Xano
   */
  static async createTrackerType(input: CreateTrackerTypeInput) {
    return db.trackers_types.create({
      data: {
        type: input.type,
        type_normalized: normalizeText(input.type),
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Busca tipo de tracker por ID
   */
  static async getTrackerTypeById(trackers_types_id: number) {
    const trackerType = await db.trackers_types.findFirst({
      where: { id: BigInt(trackers_types_id) },
    });

    if (!trackerType) {
      throw new NotFoundError('Not Found.');
    }

    return trackerType;
  }

  /**
   * Atualiza tipo de tracker
   */
  static async updateTrackerType(trackers_types_id: number, input: Partial<CreateTrackerTypeInput>) {
    const data: any = { updated_at: new Date() };
    if (input.type) {
      data.type = input.type;
      data.type_normalized = normalizeText(input.type);
    }

    return db.trackers_types.update({
      where: { id: BigInt(trackers_types_id) },
      data,
    });
  }

  /**
   * Deleta tipo de tracker (soft delete)
   */
  static async deleteTrackerType(trackers_types_id: number) {
    return db.trackers_types.update({
      where: { id: BigInt(trackers_types_id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Fields CRUD (Campos solares)
  // ===========================================================================

  /**
   * Lista campos
   * Equivalente a: query fields verb=GET do Xano
   */
  static async listFields(input: ListFieldsInput, userId?: number) {
    const { projects_id, company_id } = input;

    // Se company_id for 0, busca pelo usuario autenticado
    // Equivalente ao conditional do Xano
    let effectiveCompanyId = company_id;
    if (company_id === 0 && userId) {
      const user = await db.users.findFirst({
        where: { id: BigInt(userId) },
        select: { company_id: true },
      });
      effectiveCompanyId = user?.company_id ? Number(user.company_id) : undefined;
    }

    return db.fields.findMany({
      where: {
        projects_id: projects_id ? BigInt(projects_id) : undefined,
        deleted_at: null,
        projects: effectiveCompanyId ? {
          company_id: BigInt(effectiveCompanyId),
        } : undefined,
      },
    });
  }

  /**
   * Cria campo
   * Equivalente a: query fields verb=POST do Xano
   */
  static async createField(input: CreateFieldInput) {
    return db.fields.create({
      data: {
        name: input.name,
        projects_id: input.projects_id ? BigInt(input.projects_id) : null,
        created_at: new Date(),
      },
    });
  }

  /**
   * Busca campo por ID
   */
  static async getFieldById(fields_id: number) {
    const field = await db.fields.findFirst({
      where: { id: BigInt(fields_id) },
    });

    if (!field) {
      throw new NotFoundError('Not Found.');
    }

    return field;
  }

  /**
   * Atualiza campo
   */
  static async updateField(fields_id: number, input: Partial<CreateFieldInput>) {
    return db.fields.update({
      where: { id: BigInt(fields_id) },
      data: {
        name: input.name,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Deleta campo (soft delete)
   */
  static async deleteField(fields_id: number) {
    return db.fields.update({
      where: { id: BigInt(fields_id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Sections CRUD
  // ===========================================================================

  /**
   * Lista secoes
   * Equivalente a: query sections verb=GET do Xano
   */
  static async listSections(input: ListSectionsInput) {
    const { fields_id } = input;

    return db.sections.findMany({
      where: {
        deleted_at: null,
        fields_id: fields_id ? BigInt(fields_id) : undefined,
      },
      orderBy: { section_number: 'asc' },
    });
  }

  /**
   * Cria secao
   * Equivalente a: query sections verb=POST do Xano
   */
  static async createSection(input: CreateSectionInput) {
    const { fields_id, rows_quantity } = input;

    // Busca maior numero de secao existente
    const existingSections = await db.sections.findMany({
      where: {
        fields_id: BigInt(fields_id),
        deleted_at: null,
      },
      orderBy: { section_number: 'desc' },
      take: 1,
    });

    const nextSectionNumber = existingSections.length === 0
      ? 1
      : (existingSections[0].section_number || 0) + 1;

    // Cria a secao
    const section = await db.sections.create({
      data: {
        section_number: nextSectionNumber,
        fields_id: BigInt(fields_id),
        created_at: new Date(),
      },
    });

    // Cria as rows se especificado
    // Equivalente ao for ($input.rows_quantity) do Xano
    if (rows_quantity && rows_quantity > 0) {
      for (let i = 0; i < rows_quantity; i++) {
        await db.rows.create({
          data: {
            row_number: i + 1,
            sections_id: section.id,
            created_at: new Date(),
          },
        });
      }
    }

    return section;
  }

  /**
   * Busca secao por ID
   */
  static async getSectionById(sections_id: number) {
    const section = await db.sections.findFirst({
      where: { id: BigInt(sections_id) },
    });

    if (!section) {
      throw new NotFoundError('Not Found.');
    }

    return section;
  }

  /**
   * Atualiza secao
   */
  static async updateSection(sections_id: number, input: Partial<UpdateSectionInput>) {
    return db.sections.update({
      where: { id: BigInt(sections_id) },
      data: {
        section_number: input.section_number,
        x: input.x,
        y: input.y,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Deleta secao (soft delete)
   */
  static async deleteSection(sections_id: number) {
    return db.sections.update({
      where: { id: BigInt(sections_id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Duplica uma secao
   * Equivalente a: query section_duplicate verb=POST do Xano
   */
  static async duplicateSection(input: DuplicateSectionInput) {
    const { sections_id } = input;

    // Busca secao original
    const originalSection = await db.sections.findFirst({
      where: { id: BigInt(sections_id) },
      include: {
        rows: {
          where: { deleted_at: null },
          include: {
            rows_trackers: {
              where: { deleted_at: null },
            },
          },
        },
      },
    });

    if (!originalSection) {
      throw new NotFoundError('Secao nao encontrada.');
    }

    // Busca maior numero de secao
    const existingSections = await db.sections.findMany({
      where: {
        fields_id: originalSection.fields_id,
        deleted_at: null,
      },
      orderBy: { section_number: 'desc' },
      take: 1,
    });

    const nextSectionNumber = existingSections.length === 0
      ? 1
      : (existingSections[0].section_number || 0) + 1;

    return db.$transaction(async (tx) => {
      // Cria nova secao
      const newSection = await tx.sections.create({
        data: {
          section_number: nextSectionNumber,
          fields_id: originalSection.fields_id,
          x: originalSection.x,
          y: originalSection.y,
          created_at: new Date(),
        },
      });

      // Duplica rows
      for (const row of originalSection.rows) {
        const newRow = await tx.rows.create({
          data: {
            row_number: row.row_number,
            sections_id: newSection.id,
            x: row.x,
            y: row.y,
            group_offset_x: row.group_offset_x,
            created_at: new Date(),
          },
        });

        // Duplica rows_trackers
        for (const rowTracker of row.rows_trackers) {
          await tx.rows_trackers.create({
            data: {
              position: rowTracker.position,
              row_y: rowTracker.row_y,
              rows_id: newRow.id,
              trackers_id: rowTracker.trackers_id,
              rows_trackers_statuses_id: rowTracker.rows_trackers_statuses_id,
              created_at: new Date(),
            },
          });
        }
      }

      return newSection;
    });
  }

  // ===========================================================================
  // Rows Operations
  // ===========================================================================

  /**
   * Lista rows com filtros complexos
   * Equivalente a: query rows_list verb=POST do Xano
   */
  static async listRows(input: ListRowsInput) {
    const { sections_id, stakes_statuses_id, rows_trackers_statuses_id, trackers_types_id } = input;

    const rows = await db.rows.findMany({
      where: {
        sections_id: sections_id ? BigInt(sections_id) : undefined,
        deleted_at: null,
      },
      select: {
        id: true,
        row_number: true,
        sections_id: true,
        x: true,
        y: true,
        group_offset_x: true,
      },
    });

    // Monta resposta com dados relacionados
    // Equivalente ao foreach complexo do Xano
    const rowsFinal = [];

    for (const row of rows) {
      // Busca rows_trackers
      const rowsTrackersQuery: any = {
        rows_id: row.id,
        deleted_at: null,
      };

      if (rows_trackers_statuses_id && rows_trackers_statuses_id.length > 0) {
        rowsTrackersQuery.rows_trackers_statuses_id = {
          in: rows_trackers_statuses_id.map(id => BigInt(id)),
        };
      }

      if (trackers_types_id && trackers_types_id.length > 0) {
        rowsTrackersQuery.trackers = {
          trackers_types_id: {
            in: trackers_types_id.map(id => BigInt(id)),
          },
        };
      }

      const rowsTrackers = await db.rows_trackers.findMany({
        where: rowsTrackersQuery,
        include: {
          trackers: {
            include: {
              trackers_types: true,
              manufacturers: true,
            },
          },
        },
        orderBy: { position: 'asc' },
      });

      const listRowsTrackers = [];

      for (const rowTracker of rowsTrackers) {
        // Busca stakes para cada tracker
        const stakesQuery: any = {
          rows_trackers_id: rowTracker.id,
          deleted_at: null,
        };

        if (stakes_statuses_id && stakes_statuses_id.length > 0) {
          stakesQuery.stakes_statuses_id = {
            in: stakes_statuses_id.map(id => BigInt(id)),
          };
        }

        const rowsStakes = await db.rows_stakes.findMany({
          where: stakesQuery,
          include: {
            stakes: {
              include: {
                stakes_types: {
                  select: { id: true, type: true },
                },
              },
            },
            stakes_statuses: {
              select: { status: true },
            },
          },
          orderBy: { position: 'asc' },
        });

        listRowsTrackers.push({
          ...rowTracker,
          list_trackers_stakes: rowsStakes,
        });
      }

      rowsFinal.push({
        ...row,
        list_rows_trackers: listRowsTrackers,
      });
    }

    return rowsFinal;
  }

  // ===========================================================================
  // Trackers Map Operations
  // ===========================================================================

  /**
   * Busca mapa de trackers
   * Equivalente a: query "trackers-map" verb=GET do Xano
   */
  static async getTrackersMap(input: GetTrackersMapInput) {
    const { fields_id } = input;

    // Busca o campo
    const field = await db.fields.findFirst({
      where: { id: fields_id ? BigInt(fields_id) : undefined },
    });

    // Busca secoes
    const sections = await db.sections.findMany({
      where: {
        fields_id: fields_id ? BigInt(fields_id) : undefined,
        deleted_at: null,
      },
    });

    // Monta estrutura de mapa para cada secao
    const sectionsWithRows = [];

    for (const section of sections) {
      const rows = await db.rows.findMany({
        where: {
          sections_id: section.id,
          deleted_at: null,
        },
        select: {
          id: true,
          row_number: true,
          sections_id: true,
          x: true,
          y: true,
          group_offset_x: true,
        },
      });

      const rowsFinal = [];

      for (const row of rows) {
        const rowsTrackers = await db.rows_trackers.findMany({
          where: {
            rows_id: row.id,
            deleted_at: null,
          },
          include: {
            trackers: {
              include: {
                trackers_types: true,
                manufacturers: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        });

        const listRowsTrackers = [];

        for (const rowTracker of rowsTrackers) {
          const rowsStakes = await db.rows_stakes.findMany({
            where: {
              rows_trackers_id: rowTracker.id,
              deleted_at: null,
            },
            include: {
              stakes: {
                include: {
                  stakes_types: {
                    select: { id: true, type: true },
                  },
                },
              },
              stakes_statuses: {
                select: { status: true },
              },
            },
            orderBy: { position: 'asc' },
          });

          listRowsTrackers.push({
            ...rowTracker,
            list_trackers_stakes: rowsStakes,
          });
        }

        rowsFinal.push({
          ...row,
          list_rows_trackers: listRowsTrackers,
        });
      }

      sectionsWithRows.push({
        ...section,
        rows: rowsFinal,
      });
    }

    return {
      mapa: sectionsWithRows,
      campo: field,
    };
  }

  /**
   * Cria mapa de trackers
   * Equivalente a: query "trackers-map" verb=POST do Xano
   *
   * Este e um endpoint complexo que cria toda a estrutura do mapa:
   * - Field
   * - Sections
   * - Rows
   * - Rows_trackers
   * - Rows_stakes
   * - Projects_backlogs (tarefas fixas baseadas em templates)
   */
  static async createTrackersMap(input: CreateTrackersMapInput) {
    const { json_map, projects_id, map_texts, name } = input;
    const groups = json_map.groups || [];

    return db.$transaction(async (tx) => {
      const sectionQuantity = groups.length;

      // Cria o campo
      const field = await tx.fields.create({
        data: {
          name: name || '',
          section_quantity: sectionQuantity,
          projects_id: projects_id ? BigInt(projects_id) : null,
          map_texts: map_texts,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      let lastSection: any = null;

      // Itera sobre os grupos (secoes)
      for (const sectionData of groups) {
        const section = await tx.sections.create({
          data: {
            section_number: sectionData.section_number || 1,
            fields_id: field.id,
            x: sectionData.x,
            y: sectionData.y,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        lastSection = section;

        // Itera sobre as rows da secao
        const rowsData = sectionData.rows || [];
        for (const rowData of rowsData) {
          const row = await tx.rows.create({
            data: {
              row_number: rowData.row_number,
              sections_id: section.id,
              x: rowData.x,
              y: rowData.y,
              group_offset_x: rowData.groupOffsetX,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });

          // Itera sobre os trackers da row
          const trackersData = rowData.trackers || [];
          for (const trackerData of trackersData) {
            if (!trackerData.ext?.id) continue;

            const rowTracker = await tx.rows_trackers.create({
              data: {
                position: trackerData.position?.toString(),
                rows_id: row.id,
                trackers_id: BigInt(trackerData.ext.id),
                rows_trackers_statuses_id: BigInt(1),
                row_y: trackerData.rowY,
                created_at: new Date(),
                updated_at: new Date(),
              },
            });

            // Busca stakes do tracker para criar rows_stakes
            const stakes = await tx.stakes.findMany({
              where: {
                trackers_id: BigInt(trackerData.ext.id),
                deleted_at: null,
              },
            });

            for (const stake of stakes) {
              await tx.rows_stakes.create({
                data: {
                  rows_trackers_id: rowTracker.id,
                  stakes_id: stake.id,
                  stakes_statuses_id: BigInt(1),
                  position: stake.position,
                  created_at: new Date(),
                },
              });
            }

            // Cria tarefas baseadas em templates (se projects_id especificado)
            // Equivalente ao grupo "criacao das tarefas" do Xano
            if (projects_id) {
              await this.createBacklogTasksForTracker(
                tx,
                projects_id,
                field.id,
                section.id,
                row.id,
                rowTracker.id,
                trackerData.ext.id
              );
            }
          }
        }
      }

      return lastSection;
    }, {
      timeout: 120000, // 2 minutos para operacoes grandes
    });
  }

  /**
   * Atualiza mapa de trackers
   * Equivalente a: query "trackers-map" verb=PUT do Xano
   *
   * Este endpoint e muito complexo - atualiza toda a estrutura do mapa
   * incluindo:
   * - Soft delete de elementos removidos
   * - Criacao de novos elementos
   * - Atualizacao de elementos existentes
   * - Manutencao de backlogs associados
   */
  static async updateTrackersMap(input: UpdateTrackersMapInput) {
    const { json_map, projects_id, map_texts, fields_id } = input;
    const groups = json_map.groups || [];

    if (!fields_id) {
      throw new BadRequestError('fields_id e obrigatorio para atualizar o mapa.');
    }

    return db.$transaction(async (tx) => {
      const sectionQuantity = groups.length;

      // Atualiza o campo
      const field = await tx.fields.update({
        where: { id: BigInt(fields_id) },
        data: {
          section_quantity: sectionQuantity,
          map_texts: map_texts,
          updated_at: new Date(),
        },
      });

      // Busca secoes existentes
      const oldSections = await tx.sections.findMany({
        where: {
          fields_id: BigInt(fields_id),
          deleted_at: null,
        },
      });

      const oldSectionIds = oldSections.map(s => s.id);
      const newSectionIds = groups
        .filter(g => typeof g.id === 'number')
        .map(g => BigInt(g.id!));

      // Soft delete de secoes removidas
      for (const sectionId of oldSectionIds) {
        if (!newSectionIds.includes(sectionId)) {
          await this.softDeleteSectionCascade(tx, sectionId);
        }
      }

      // Processa cada secao
      let sectionOrder = 0;
      for (const sectionData of groups) {
        sectionOrder++;
        const sectionNumber = sectionData.section_number || sectionOrder;

        let section: any;

        // Verifica se secao existe
        if (typeof sectionData.id === 'number') {
          // Atualiza secao existente
          section = await tx.sections.update({
            where: { id: BigInt(sectionData.id) },
            data: {
              section_number: sectionNumber,
              x: sectionData.x,
              y: sectionData.y,
              updated_at: new Date(),
              deleted_at: null,
            },
          });
        } else {
          // Cria nova secao
          section = await tx.sections.create({
            data: {
              section_number: sectionNumber,
              fields_id: field.id,
              x: sectionData.x,
              y: sectionData.y,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        }

        // Processa rows da secao
        const rowsData = sectionData.rows || [];
        await this.processRowsUpdate(tx, section.id, rowsData, projects_id, fields_id);
      }

      return field;
    }, {
      timeout: 120000,
    });
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Soft delete em cascata de uma secao
   */
  private static async softDeleteSectionCascade(tx: any, sectionId: bigint) {
    // Soft delete da secao
    await tx.sections.update({
      where: { id: sectionId },
      data: { deleted_at: new Date() },
    });

    // Busca e deleta rows
    const rows = await tx.rows.findMany({
      where: { sections_id: sectionId, deleted_at: null },
    });

    for (const row of rows) {
      await this.softDeleteRowCascade(tx, row.id);
    }
  }

  /**
   * Soft delete em cascata de uma row
   */
  private static async softDeleteRowCascade(tx: any, rowId: bigint) {
    await tx.rows.update({
      where: { id: rowId },
      data: { deleted_at: new Date() },
    });

    // Busca e deleta rows_trackers
    const rowsTrackers = await tx.rows_trackers.findMany({
      where: { rows_id: rowId, deleted_at: null },
    });

    for (const rowTracker of rowsTrackers) {
      await this.softDeleteRowTrackerCascade(tx, rowTracker.id);
    }
  }

  /**
   * Soft delete em cascata de um row_tracker
   */
  private static async softDeleteRowTrackerCascade(tx: any, rowTrackerId: bigint) {
    await tx.rows_trackers.update({
      where: { id: rowTrackerId },
      data: { deleted_at: new Date() },
    });

    // Soft delete rows_stakes
    await tx.rows_stakes.updateMany({
      where: { rows_trackers_id: rowTrackerId, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    // Soft delete projects_backlogs
    await tx.projects_backlogs.updateMany({
      where: { rows_trackers_id: rowTrackerId, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Processa atualizacao de rows
   */
  private static async processRowsUpdate(
    tx: any,
    sectionId: bigint,
    rowsData: any[],
    projectsId: number | undefined,
    fieldsId: number
  ) {
    // Busca rows existentes
    const oldRows = await tx.rows.findMany({
      where: { sections_id: sectionId, deleted_at: null },
    });

    const oldRowIds = oldRows.map((r: any) => r.id);
    const newRowIds = rowsData
      .filter(r => typeof r.id === 'number')
      .map(r => BigInt(r.id));

    // Soft delete de rows removidas
    for (const rowId of oldRowIds) {
      if (!newRowIds.includes(rowId)) {
        await this.softDeleteRowCascade(tx, rowId);
      }
    }

    // Processa cada row
    let rowOrder = 0;
    for (const rowData of rowsData) {
      rowOrder++;
      const rowNumber = rowData.row_number || rowOrder;

      let row: any;

      if (typeof rowData.id === 'number') {
        // Atualiza row existente
        row = await tx.rows.update({
          where: { id: BigInt(rowData.id) },
          data: {
            row_number: rowNumber,
            sections_id: sectionId,
            x: rowData.x,
            y: rowData.y,
            group_offset_x: rowData.groupOffsetX,
            updated_at: new Date(),
            deleted_at: null,
          },
        });
      } else {
        // Cria nova row
        row = await tx.rows.create({
          data: {
            row_number: rowNumber,
            sections_id: sectionId,
            x: rowData.x,
            y: rowData.y,
            group_offset_x: rowData.groupOffsetX,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      // Processa trackers da row
      const trackersData = rowData.trackers || [];
      await this.processTrackersUpdate(tx, row.id, trackersData, projectsId, fieldsId, sectionId);
    }
  }

  /**
   * Processa atualizacao de trackers
   */
  private static async processTrackersUpdate(
    tx: any,
    rowId: bigint,
    trackersData: any[],
    projectsId: number | undefined,
    fieldsId: number,
    sectionId: bigint
  ) {
    // Busca rows_trackers existentes
    const existingTrackers = await tx.rows_trackers.findMany({
      where: { rows_id: rowId, deleted_at: null },
    });

    const existingTrackerIds = existingTrackers.map((t: any) => t.id);
    const payloadTrackerIds = trackersData
      .filter(t => typeof t.id === 'number')
      .map(t => BigInt(t.id));

    // Soft delete de trackers removidos
    for (const trackerId of existingTrackerIds) {
      if (!payloadTrackerIds.includes(trackerId)) {
        await this.softDeleteRowTrackerCascade(tx, trackerId);
      }
    }

    // Processa cada tracker
    let trackerOrder = 0;
    for (const trackerData of trackersData) {
      trackerOrder++;
      const position = trackerData.position || trackerOrder;

      if (typeof trackerData.id === 'number') {
        // Atualiza tracker existente
        const rowTracker = await tx.rows_trackers.update({
          where: { id: BigInt(trackerData.id) },
          data: {
            rows_id: rowId,
            row_y: trackerData.rowY,
            position: position.toString(),
            updated_at: new Date(),
            deleted_at: null,
          },
        });

        // Atualiza backlogs existentes com nova localizacao
        await tx.projects_backlogs.updateMany({
          where: { rows_trackers_id: rowTracker.id, deleted_at: null },
          data: { sections_id: sectionId, rows_id: rowId },
        });

        // Reordena stakes
        await this.reorderStakes(tx, rowTracker.id);
      } else if (trackerData.ext?.id) {
        // Cria novo tracker
        const rowTracker = await tx.rows_trackers.create({
          data: {
            position: position.toString(),
            rows_id: rowId,
            trackers_id: BigInt(trackerData.ext.id),
            rows_trackers_statuses_id: BigInt(1),
            row_y: trackerData.rowY,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Cria rows_stakes
        const stakes = await tx.stakes.findMany({
          where: { trackers_id: BigInt(trackerData.ext.id), deleted_at: null },
        });

        let stakePosition = 0;
        for (const stake of stakes) {
          stakePosition++;
          const rowStake = await tx.rows_stakes.create({
            data: {
              rows_trackers_id: rowTracker.id,
              stakes_id: stake.id,
              stakes_statuses_id: BigInt(1),
              position: stakePosition.toString(),
              created_at: new Date(),
            },
          });

          // Cria backlogs para stakes (equipaments_types_id == 3)
          if (projectsId) {
            const stakeTemplates = await tx.tasks_template.findMany({
              where: {
                equipaments_types_id: BigInt(3),
                fixed: true,
                deleted_at: null,
              },
            });

            for (const template of stakeTemplates) {
              await tx.projects_backlogs.create({
                data: {
                  projects_id: BigInt(projectsId),
                  tasks_template_id: template.id,
                  projects_backlogs_statuses_id: BigInt(1),
                  fields_id: BigInt(fieldsId),
                  sections_id: sectionId,
                  rows_id: rowId,
                  trackers_id: BigInt(trackerData.ext.id),
                  rows_trackers_id: rowTracker.id,
                  rows_stakes_id: rowStake.id,
                  description: template.description,
                  description_normalized: template.description_normalized,
                  discipline_id: template.discipline_id,
                  equipaments_types_id: template.equipaments_types_id,
                  weight: template.weight,
                  unity_id: template.unity_id,
                  quantity: 1,
                  quantity_done: 0,
                  sprint_added: false,
                  is_inspection: false,
                  quality_status_id: BigInt(1),
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              });
            }
          }
        }

        // Cria backlogs para tracker
        if (projectsId) {
          await this.createBacklogTasksForTracker(
            tx,
            projectsId,
            BigInt(fieldsId),
            sectionId,
            rowId,
            rowTracker.id,
            trackerData.ext.id
          );
        }
      }
    }
  }

  /**
   * Reordena stakes de um row_tracker
   */
  private static async reorderStakes(tx: any, rowTrackerId: bigint) {
    const stakes = await tx.rows_stakes.findMany({
      where: { rows_trackers_id: rowTrackerId, deleted_at: null },
    });

    let position = 0;
    for (const stake of stakes) {
      position++;
      await tx.rows_stakes.update({
        where: { id: stake.id },
        data: { position: position.toString() },
      });
    }
  }

  /**
   * Cria tarefas de backlog para um tracker baseado em templates
   * Equivalente a logica de criacao de projects_backlogs do Xano
   */
  private static async createBacklogTasksForTracker(
    tx: any,
    projectsId: number,
    fieldsId: bigint,
    sectionId: bigint,
    rowId: bigint,
    rowTrackerId: bigint,
    trackersId: number
  ) {
    // Busca o tracker para saber o tipo
    const tracker = await tx.trackers.findFirst({
      where: { id: BigInt(trackersId) },
    });

    if (!tracker?.trackers_types_id) return;

    // Busca templates para o tipo do tracker
    const templates = await tx.tasks_template.findMany({
      where: {
        equipaments_types_id: tracker.trackers_types_id,
        fixed: true,
        deleted_at: null,
      },
    });

    for (const template of templates) {
      await tx.projects_backlogs.create({
        data: {
          projects_id: BigInt(projectsId),
          tasks_template_id: template.id,
          projects_backlogs_statuses_id: BigInt(1),
          fields_id: fieldsId,
          sections_id: sectionId,
          rows_id: rowId,
          trackers_id: BigInt(trackersId),
          rows_trackers_id: rowTrackerId,
          rows_stakes_id: null,
          description: template.description,
          description_normalized: template.description_normalized,
          discipline_id: template.discipline_id,
          equipaments_types_id: template.equipaments_types_id,
          weight: template.weight,
          unity_id: template.unity_id,
          quantity: 1,
          quantity_done: 0,
          sprint_added: false,
          is_inspection: false,
          quality_status_id: BigInt(1),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  }

  // ===========================================================================
  // Rows Trackers Statuses
  // ===========================================================================

  /**
   * Lista status de rows_trackers
   */
  static async listRowsTrackersStatuses() {
    return db.rows_trackers_statuses.findMany({
      where: { deleted_at: null },
    });
  }

  /**
   * Busca status por ID
   */
  static async getRowsTrackersStatusById(id: number) {
    const status = await db.rows_trackers_statuses.findFirst({
      where: { id: BigInt(id) },
    });

    if (!status) {
      throw new NotFoundError('Not Found.');
    }

    return status;
  }

  /**
   * Cria status de rows_tracker
   */
  static async createRowsTrackersStatus(status: string) {
    return db.rows_trackers_statuses.create({
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
  static async updateRowsTrackersStatus(id: number, status?: string) {
    return db.rows_trackers_statuses.update({
      where: { id: BigInt(id) },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Deleta status (soft delete)
   */
  static async deleteRowsTrackersStatus(id: number) {
    return db.rows_trackers_statuses.update({
      where: { id: BigInt(id) },
      data: {
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Trackers Stakes (Rows Stakes)
  // ===========================================================================

  /**
   * Lista todos os rows_stakes
   * Equivalente a: query trackers_stakes verb=GET do Xano
   */
  static async listTrackersStakes() {
    return db.rows_stakes.findMany();
  }
}

export default TrackersService;
