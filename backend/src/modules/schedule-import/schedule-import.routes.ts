// =============================================================================
// INDUSTRYVIEW BACKEND - Schedule Import Routes
// Rotas do modulo de importacao de cronograma
// Prefixo registrado em index.ts: /api/v1/schedule-import
// =============================================================================

import { Router } from 'express';
import multer from 'multer';
import { ScheduleImportController } from './schedule-import.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Multer configurado para manter o arquivo em memoria (Buffer)
// Limite de 50MB para suportar arquivos grandes de MS Project
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'application/csv',
      'text/plain',
      'text/xml',
      'application/xml',
      'application/octet-stream',
    ];
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const validExt = ['xlsx', 'xls', 'csv', 'xml'].includes(ext ?? '');

    if (validExt || allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato invalido. Use .xlsx, .xls, .csv ou .xml'));
    }
  },
});

/**
 * @swagger
 * /api/schedule-import/upload:
 *   post:
 *     summary: Faz upload e importacao de cronograma
 *     tags: [Schedule Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - projects_id
 *               - import_mode
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               projects_id:
 *                 type: integer
 *               import_mode:
 *                 type: string
 *                 enum: [create, update, replace]
 *               column_mapping:
 *                 type: string
 *                 description: JSON com mapeamento de colunas
 */
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  ScheduleImportController.upload
);

/**
 * @swagger
 * /api/schedule-import/history:
 *   get:
 *     summary: Historico de importacoes de um projeto
 *     tags: [Schedule Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projects_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/history',
  authenticate,
  ScheduleImportController.getHistory
);

/**
 * @swagger
 * /api/schedule-import/template:
 *   get:
 *     summary: Download de template de importacao
 *     tags: [Schedule Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *           default: xlsx
 */
router.get(
  '/template',
  authenticate,
  ScheduleImportController.downloadTemplate
);

export default router;
