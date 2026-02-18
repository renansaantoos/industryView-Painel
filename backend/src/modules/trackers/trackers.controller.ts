// =============================================================================
// INDUSTRYVIEW BACKEND - Trackers Module Controller
// Controller do modulo de trackers (rastreadores solares)
// Equivalente aos endpoints do Xano em apis/trackers/ e apis/trackers_map/
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { TrackersService } from './trackers.service';
import {
  listTrackersSchema,
  listAllTrackersSchema,
  getTrackerByIdSchema,
  createTrackerSchema,
  updateTrackerSchema,
  deleteTrackerSchema,
  listTrackerTypesSchema,
  createTrackerTypeSchema,
  getTrackerTypeByIdSchema,
  updateTrackerTypeSchema,
  deleteTrackerTypeSchema,
  listFieldsSchema,
  createFieldSchema,
  getFieldByIdSchema,
  updateFieldSchema,
  deleteFieldSchema,
  listSectionsSchema,
  createSectionSchema,
  getSectionByIdSchema,
  updateSectionSchema,
  deleteSectionSchema,
  duplicateSectionSchema,
  listRowsSchema,
  getRowByIdSchema,
  createRowSchema,
  updateRowSchema,
  deleteRowSchema,
  listRowsTrackersSchema,
  getRowsTrackerByIdSchema,
  createRowsTrackerSchema,
  updateRowsTrackerSchema,
  deleteRowsTrackerSchema,
  getRowsTrackersStatusByIdSchema,
  createRowsTrackersStatusSchema,
  updateRowsTrackersStatusSchema,
  deleteRowsTrackersStatusSchema,
  getTrackersMapSchema,
  createTrackersMapSchema,
  updateTrackersMapSchema,
  updateFieldNameSchema,
} from './trackers.schema';

/**
 * TrackersController - Controller do modulo de trackers
 */
export class TrackersController {
  // ===========================================================================
  // Trackers CRUD
  // ===========================================================================

  /**
   * Lista trackers com paginacao
   * Equivalente a: query trackers verb=GET do Xano
   * Route: GET /api/v1/trackers
   */
  static async listTrackers(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listTrackersSchema.parse(req.query);
      const result = await TrackersService.listTrackers(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todos os trackers sem paginacao
   * Equivalente a: query trackers_0 verb=GET do Xano
   * Route: GET /api/v1/trackers/all
   */
  static async listAllTrackers(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listAllTrackersSchema.parse(req.query);
      const result = await TrackersService.listAllTrackers(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca tracker por ID
   * Equivalente a: query "trackers/{trackers_id}" verb=GET do Xano
   * Route: GET /api/v1/trackers/:trackers_id
   */
  static async getTrackerById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getTrackerByIdSchema.parse(req.params);
      const result = await TrackersService.getTrackerById(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria um novo tracker
   * Equivalente a: query trackers verb=POST do Xano
   * Route: POST /api/v1/trackers
   */
  static async createTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTrackerSchema.parse(req.body);
      const result = await TrackersService.createTracker(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza um tracker
   * Equivalente a: query "trackers/{trackers_id}" verb=PATCH do Xano
   * Route: PATCH /api/v1/trackers/:trackers_id
   */
  static async updateTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateTrackerSchema.parse({
        ...req.body,
        trackers_id: req.params.trackers_id,
      });
      const result = await TrackersService.updateTracker(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta um tracker (soft delete)
   * Equivalente a: query "trackers/{trackers_id}" verb=DELETE do Xano
   * Route: DELETE /api/v1/trackers/:trackers_id
   */
  static async deleteTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteTrackerSchema.parse(req.params);
      const result = await TrackersService.deleteTracker(input.trackers_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Trackers Types CRUD
  // ===========================================================================

  /**
   * Lista tipos de trackers
   * Equivalente a: query trackers_types verb=GET do Xano
   * Route: GET /api/v1/trackers/types
   */
  static async listTrackerTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listTrackerTypesSchema.parse(req.query);
      const result = await TrackersService.listTrackerTypes(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca tipo de tracker por ID
   * Equivalente a: query "trackers_types/{trackers_types_id}" verb=GET do Xano
   * Route: GET /api/v1/trackers/types/:trackers_types_id
   */
  static async getTrackerTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getTrackerTypeByIdSchema.parse(req.params);
      const result = await TrackersService.getTrackerTypeById(input.trackers_types_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria tipo de tracker
   * Equivalente a: query trackers_types verb=POST do Xano
   * Route: POST /api/v1/trackers/types
   */
  static async createTrackerType(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTrackerTypeSchema.parse(req.body);
      const result = await TrackersService.createTrackerType(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza tipo de tracker
   * Equivalente a: query "trackers_types/{trackers_types_id}" verb=PATCH do Xano
   * Route: PATCH /api/v1/trackers/types/:trackers_types_id
   */
  static async updateTrackerType(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getTrackerTypeByIdSchema.parse(req.params);
      const input = updateTrackerTypeSchema.parse(req.body);
      const result = await TrackersService.updateTrackerType(params.trackers_types_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta tipo de tracker (soft delete)
   * Equivalente a: query "trackers_types/{trackers_types_id}" verb=DELETE do Xano
   * Route: DELETE /api/v1/trackers/types/:trackers_types_id
   */
  static async deleteTrackerType(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteTrackerTypeSchema.parse(req.params);
      const result = await TrackersService.deleteTrackerType(input.trackers_types_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Fields CRUD
  // ===========================================================================

  /**
   * Lista campos
   * Equivalente a: query fields verb=GET do Xano
   * Route: GET /api/v1/trackers/fields
   */
  static async listFields(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listFieldsSchema.parse(req.query);
      const userId = (req as any).user?.id;
      const result = await TrackersService.listFields(input, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca campo por ID
   * Equivalente a: query "fields/{fields_id}" verb=GET do Xano
   * Route: GET /api/v1/trackers/fields/:fields_id
   */
  static async getFieldById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getFieldByIdSchema.parse(req.params);
      const result = await TrackersService.getFieldById(input.fields_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria campo
   * Equivalente a: query fields verb=POST do Xano
   * Route: POST /api/v1/trackers/fields
   */
  static async createField(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createFieldSchema.parse(req.body);
      const result = await TrackersService.createField(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza campo
   * Equivalente a: query "fields/{fields_id}" verb=PATCH do Xano
   * Route: PATCH /api/v1/trackers/fields/:fields_id
   */
  static async updateField(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getFieldByIdSchema.parse(req.params);
      const input = updateFieldSchema.parse(req.body);
      const result = await TrackersService.updateField(params.fields_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta campo (soft delete)
   * Equivalente a: query "fields/{fields_id}" verb=DELETE do Xano
   * Route: DELETE /api/v1/trackers/fields/:fields_id
   */
  static async deleteField(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteFieldSchema.parse(req.params);
      const result = await TrackersService.deleteField(input.fields_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza nome do campo
   * Equivalente a: query field_name verb=PUT do Xano
   * Route: PUT /api/v1/trackers/field-name
   */
  static async updateFieldName(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateFieldNameSchema.parse(req.body);
      const result = await TrackersService.updateField(input.fields_id, { name: input.name });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Sections CRUD
  // ===========================================================================

  /**
   * Lista secoes
   * Equivalente a: query sections verb=GET do Xano
   * Route: GET /api/v1/trackers/sections
   */
  static async listSections(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listSectionsSchema.parse(req.query);
      const result = await TrackersService.listSections(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca secao por ID
   * Equivalente a: query "sections/{sections_id}" verb=GET do Xano
   * Route: GET /api/v1/trackers/sections/:sections_id
   */
  static async getSectionById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getSectionByIdSchema.parse(req.params);
      const result = await TrackersService.getSectionById(input.sections_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria secao
   * Equivalente a: query sections verb=POST do Xano
   * Route: POST /api/v1/trackers/sections
   */
  static async createSection(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSectionSchema.parse(req.body);
      const result = await TrackersService.createSection(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza secao
   * Equivalente a: query "sections/{sections_id}" verb=PATCH do Xano
   * Route: PATCH /api/v1/trackers/sections/:sections_id
   */
  static async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getSectionByIdSchema.parse(req.params);
      const input = updateSectionSchema.parse(req.body);
      const result = await TrackersService.updateSection(params.sections_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta secao (soft delete)
   * Equivalente a: query "sections/{sections_id}" verb=DELETE do Xano
   * Route: DELETE /api/v1/trackers/sections/:sections_id
   */
  static async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteSectionSchema.parse(req.params);
      const result = await TrackersService.deleteSection(input.sections_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duplica secao
   * Equivalente a: query section_duplicate verb=POST do Xano
   * Route: POST /api/v1/trackers/sections/duplicate
   */
  static async duplicateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const input = duplicateSectionSchema.parse(req.body);
      const result = await TrackersService.duplicateSection(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Rows CRUD
  // ===========================================================================

  /**
   * Lista rows com filtros
   * Equivalente a: query rows_list verb=POST do Xano
   * Route: POST /api/v1/trackers/rows/list
   */
  static async listRows(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listRowsSchema.parse(req.body);
      const result = await TrackersService.listRows(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca row por ID
   * Route: GET /api/v1/trackers/rows/:rows_id
   */
  static async getRowById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = getRowByIdSchema.parse(req.params);
      // Implementacao basica - busca row por ID
      const { db } = await import('../../config/database');
      const row = await db.rows.findFirst({
        where: { id: BigInt(input.rows_id) },
      });
      if (!row) {
        res.status(404).json({ message: 'Not Found.' });
        return;
      }
      res.json(row);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria row
   * Route: POST /api/v1/trackers/rows
   */
  static async createRow(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createRowSchema.parse(req.body);
      const { db } = await import('../../config/database');
      const row = await db.rows.create({
        data: {
          row_number: input.row_number,
          sections_id: BigInt(input.sections_id),
          x: input.x,
          y: input.y,
          group_offset_x: input.groupOffsetX,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      res.status(201).json(row);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza row
   * Route: PATCH /api/v1/trackers/rows/:rows_id
   */
  static async updateRow(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getRowByIdSchema.parse(req.params);
      const input = updateRowSchema.parse(req.body);
      const { db } = await import('../../config/database');
      const row = await db.rows.update({
        where: { id: BigInt(params.rows_id) },
        data: {
          row_number: input.row_number,
          x: input.x,
          y: input.y,
          group_offset_x: input.groupOffsetX,
          updated_at: new Date(),
        },
      });
      res.json(row);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta row (soft delete)
   * Route: DELETE /api/v1/trackers/rows/:rows_id
   */
  static async deleteRow(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteRowSchema.parse(req.params);
      const { db } = await import('../../config/database');
      const row = await db.rows.update({
        where: { id: BigInt(input.rows_id) },
        data: {
          updated_at: new Date(),
          deleted_at: new Date(),
        },
      });
      res.json(row);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Rows Trackers CRUD
  // ===========================================================================

  /**
   * Lista rows_trackers
   * Equivalente a: query rows_trackers verb=GET do Xano
   * Route: GET /api/v1/trackers/rows-trackers
   */
  static async listRowsTrackers(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listRowsTrackersSchema.parse(req.query);
      const { db } = await import('../../config/database');

      const result = await db.rows_trackers.findMany({
        where: {
          rows_id: input.rows_id ? BigInt(input.rows_id) : undefined,
        },
        include: {
          trackers: {
            include: {
              trackers_types: {
                select: { id: true, type: true },
              },
            },
          },
        },
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca rows_tracker por ID
   * Route: GET /api/v1/trackers/rows-trackers/:rows_trackers_id
   */
  static async getRowsTrackerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = getRowsTrackerByIdSchema.parse(req.params);
      const { db } = await import('../../config/database');
      const rowTracker = await db.rows_trackers.findFirst({
        where: { id: BigInt(input.rows_trackers_id) },
        include: {
          trackers: true,
        },
      });
      if (!rowTracker) {
        res.status(404).json({ message: 'Not Found.' });
        return;
      }
      res.json(rowTracker);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria rows_tracker
   * Route: POST /api/v1/trackers/rows-trackers
   */
  static async createRowsTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createRowsTrackerSchema.parse(req.body);
      const { db } = await import('../../config/database');
      const rowTracker = await db.rows_trackers.create({
        data: {
          rows_id: BigInt(input.rows_id),
          trackers_id: BigInt(input.trackers_id),
          position: input.position,
          row_y: input.row_y,
          rows_trackers_statuses_id: BigInt(input.rows_trackers_statuses_id || 1),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      res.status(201).json(rowTracker);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza rows_tracker
   * Route: PATCH /api/v1/trackers/rows-trackers/:rows_trackers_id
   */
  static async updateRowsTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getRowsTrackerByIdSchema.parse(req.params);
      const input = updateRowsTrackerSchema.parse(req.body);
      const { db } = await import('../../config/database');
      const rowTracker = await db.rows_trackers.update({
        where: { id: BigInt(params.rows_trackers_id) },
        data: {
          position: input.position,
          row_y: input.row_y,
          rows_trackers_statuses_id: input.rows_trackers_statuses_id
            ? BigInt(input.rows_trackers_statuses_id)
            : undefined,
          updated_at: new Date(),
        },
      });
      res.json(rowTracker);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta rows_tracker (soft delete)
   * Route: DELETE /api/v1/trackers/rows-trackers/:rows_trackers_id
   */
  static async deleteRowsTracker(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteRowsTrackerSchema.parse(req.params);
      const { db } = await import('../../config/database');
      const rowTracker = await db.rows_trackers.update({
        where: { id: BigInt(input.rows_trackers_id) },
        data: {
          updated_at: new Date(),
          deleted_at: new Date(),
        },
      });
      res.json(rowTracker);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Rows Trackers Statuses CRUD
  // ===========================================================================

  /**
   * Lista status de rows_trackers
   * Route: GET /api/v1/trackers/rows-trackers-statuses
   */
  static async listRowsTrackersStatuses(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TrackersService.listRowsTrackersStatuses();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca status por ID
   * Route: GET /api/v1/trackers/rows-trackers-statuses/:rows_trackers_statuses_id
   */
  static async getRowsTrackersStatusById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getRowsTrackersStatusByIdSchema.parse(req.params);
      const result = await TrackersService.getRowsTrackersStatusById(input.rows_trackers_statuses_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria status de rows_tracker
   * Route: POST /api/v1/trackers/rows-trackers-statuses
   */
  static async createRowsTrackersStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createRowsTrackersStatusSchema.parse(req.body);
      const result = await TrackersService.createRowsTrackersStatus(input.status);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza status
   * Route: PATCH /api/v1/trackers/rows-trackers-statuses/:rows_trackers_statuses_id
   */
  static async updateRowsTrackersStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getRowsTrackersStatusByIdSchema.parse(req.params);
      const input = updateRowsTrackersStatusSchema.parse(req.body);
      const result = await TrackersService.updateRowsTrackersStatus(
        params.rows_trackers_statuses_id,
        input.status
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta status (soft delete)
   * Route: DELETE /api/v1/trackers/rows-trackers-statuses/:rows_trackers_statuses_id
   */
  static async deleteRowsTrackersStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteRowsTrackersStatusSchema.parse(req.params);
      const result = await TrackersService.deleteRowsTrackersStatus(input.rows_trackers_statuses_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Trackers Map
  // ===========================================================================

  /**
   * Busca mapa de trackers
   * Equivalente a: query "trackers-map" verb=GET do Xano
   * Route: GET /api/v1/trackers/map
   */
  static async getTrackersMap(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getTrackersMapSchema.parse(req.query);
      const result = await TrackersService.getTrackersMap(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria mapa de trackers
   * Equivalente a: query "trackers-map" verb=POST do Xano
   * Route: POST /api/v1/trackers/map
   */
  static async createTrackersMap(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTrackersMapSchema.parse(req.body);
      const result = await TrackersService.createTrackersMap(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza mapa de trackers
   * Equivalente a: query "trackers-map" verb=PUT do Xano
   * Route: PUT /api/v1/trackers/map
   */
  static async updateTrackersMap(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateTrackersMapSchema.parse(req.body);
      const result = await TrackersService.updateTrackersMap(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Trackers Stakes (Rows Stakes)
  // ===========================================================================

  /**
   * Lista todos os trackers_stakes
   * Equivalente a: query trackers_stakes verb=GET do Xano
   * Route: GET /api/v1/trackers/stakes
   */
  static async listTrackersStakes(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TrackersService.listTrackersStakes();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default TrackersController;
