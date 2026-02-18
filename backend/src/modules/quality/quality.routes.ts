// =============================================================================
// INDUSTRYVIEW BACKEND - Quality Module Routes
// Rotas do modulo de qualidade
// Abrange: non_conformances, documents (GED), checklists, golden_rules
// =============================================================================

import { Router } from 'express';
import { QualityController } from './quality.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ===========================================================================
// Non Conformances Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/non-conformances:
 *   get:
 *     summary: Lista nao conformidades com paginacao e filtros
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberta, em_analise, em_tratamento, verificacao, fechada]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta, critica]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *       - in: query
 *         name: responsible_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: initial_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: final_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de nao conformidades
 */
router.get('/non-conformances', authenticate, QualityController.listNonConformances);

/**
 * @swagger
 * /api/v1/quality/non-conformances/statistics:
 *   get:
 *     summary: Retorna estatisticas de nao conformidades (Pareto por categoria, severidade e origem)
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: initial_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: final_date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estatisticas de nao conformidades com distribuicao por status, severidade, categoria e origem
 */
router.get('/non-conformances/statistics', authenticate, QualityController.getNcStatistics);

/**
 * @swagger
 * /api/v1/quality/non-conformances/{id}:
 *   get:
 *     summary: Busca nao conformidade por ID
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nao conformidade encontrada
 *       404:
 *         description: Nao conformidade nao encontrada
 */
router.get('/non-conformances/:id', authenticate, QualityController.getNcById);

/**
 * @swagger
 * /api/v1/quality/non-conformances:
 *   post:
 *     summary: Cria nao conformidade com numero automatico RNC-YYYY-NNN
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               projects_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               origin:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [baixa, media, alta, critica]
 *               location:
 *                 type: string
 *               detected_by_id:
 *                 type: integer
 *               responsible_id:
 *                 type: integer
 *               due_date:
 *                 type: string
 *               immediate_action:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nao conformidade criada com sucesso
 */
router.post('/non-conformances', authenticate, QualityController.createNc);

/**
 * @swagger
 * /api/v1/quality/non-conformances/{id}:
 *   patch:
 *     summary: Atualiza nao conformidade (bloqueado se status=fechada)
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [aberta, em_analise, em_tratamento, verificacao, fechada]
 *               severity:
 *                 type: string
 *                 enum: [baixa, media, alta, critica]
 *     responses:
 *       200:
 *         description: Nao conformidade atualizada
 */
router.patch('/non-conformances/:id', authenticate, QualityController.updateNc);

/**
 * @swagger
 * /api/v1/quality/non-conformances/{id}/close:
 *   post:
 *     summary: Fecha nao conformidade (requer root_cause_analysis e corrective_action_plan)
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - root_cause_analysis
 *               - corrective_action_plan
 *             properties:
 *               root_cause_analysis:
 *                 type: string
 *               corrective_action_plan:
 *                 type: string
 *               effectiveness_check:
 *                 type: string
 *               closed_by_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Nao conformidade fechada com sucesso
 */
router.post('/non-conformances/:id/close', authenticate, QualityController.closeNc);

/**
 * @swagger
 * /api/v1/quality/non-conformances/{id}/attachments:
 *   post:
 *     summary: Adiciona anexo a nao conformidade
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - file_name
 *               - file_url
 *             properties:
 *               file_name:
 *                 type: string
 *               file_url:
 *                 type: string
 *               file_type:
 *                 type: string
 *               file_size:
 *                 type: integer
 *               uploaded_by_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Anexo criado com sucesso
 */
router.post('/non-conformances/:id/attachments', authenticate, QualityController.createNcAttachment);

// ===========================================================================
// Documents (GED) Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/documents:
 *   get:
 *     summary: Lista documentos com paginacao e filtros
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: document_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, em_revisao, aprovado, obsoleto]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de documentos
 */
router.get('/documents', authenticate, QualityController.listDocuments);

/**
 * @swagger
 * /api/v1/quality/documents/pending-acknowledgments:
 *   get:
 *     summary: Lista documentos aprovados pendentes de ciencia para o usuario
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: users_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de documentos pendentes de ciencia
 */
router.get('/documents/pending-acknowledgments', authenticate, QualityController.getPendingAcknowledgments);

/**
 * @swagger
 * /api/v1/quality/documents/{id}:
 *   get:
 *     summary: Busca documento por ID
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Documento encontrado
 *       404:
 *         description: Documento nao encontrado
 */
router.get('/documents/:id', authenticate, QualityController.getDocumentById);

/**
 * @swagger
 * /api/v1/quality/documents:
 *   post:
 *     summary: Cria documento no GED
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               company_id:
 *                 type: integer
 *               projects_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               document_code:
 *                 type: string
 *               document_type:
 *                 type: string
 *               description:
 *                 type: string
 *               revision:
 *                 type: string
 *               file_url:
 *                 type: string
 *               file_name:
 *                 type: string
 *               requires_acknowledgment:
 *                 type: boolean
 *               valid_until:
 *                 type: string
 *               created_by_id:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Documento criado com sucesso (status inicial = rascunho)
 */
router.post('/documents', authenticate, QualityController.createDocument);

/**
 * @swagger
 * /api/v1/quality/documents/{id}:
 *   patch:
 *     summary: Atualiza documento (bloqueado se status=aprovado)
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Documento atualizado
 *       400:
 *         description: Documento aprovado nao pode ser editado - crie uma nova revisao
 */
router.patch('/documents/:id', authenticate, QualityController.updateDocument);

/**
 * @swagger
 * /api/v1/quality/documents/{id}/approve:
 *   post:
 *     summary: Aprova documento e muda status para aprovado
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved_by_id
 *             properties:
 *               approved_by_id:
 *                 type: integer
 *               approval_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documento aprovado com sucesso
 */
router.post('/documents/:id/approve', authenticate, QualityController.approveDocument);

/**
 * @swagger
 * /api/v1/quality/documents/{id}/acknowledge:
 *   post:
 *     summary: Registra ciencia do documento pelo usuario
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - users_id
 *             properties:
 *               users_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ciencia registrada com sucesso
 */
router.post('/documents/:id/acknowledge', authenticate, QualityController.acknowledgeDocument);

// ===========================================================================
// Task Documents Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/task-documents:
 *   get:
 *     summary: Lista vinculos task-documento
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tasks_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: documents_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de vinculos task-documento
 */
router.get('/task-documents', authenticate, QualityController.listTaskDocuments);

/**
 * @swagger
 * /api/v1/quality/task-documents:
 *   post:
 *     summary: Cria vinculo entre task e documento
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks_id
 *               - documents_id
 *             properties:
 *               tasks_id:
 *                 type: integer
 *               documents_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vinculo criado com sucesso
 */
router.post('/task-documents', authenticate, QualityController.createTaskDocument);

/**
 * @swagger
 * /api/v1/quality/task-documents/{id}:
 *   delete:
 *     summary: Remove vinculo task-documento
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Vinculo removido com sucesso
 */
router.delete('/task-documents/:id', authenticate, QualityController.deleteTaskDocument);

// ===========================================================================
// Checklist Templates Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/checklist-templates:
 *   get:
 *     summary: Lista templates de checklist
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: checklist_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de templates de checklist com seus itens
 */
router.get('/checklist-templates', authenticate, QualityController.listChecklistTemplates);

/**
 * @swagger
 * /api/v1/quality/checklist-templates:
 *   post:
 *     summary: Cria template de checklist com seus itens
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               company_id:
 *                 type: integer
 *               projects_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               checklist_type:
 *                 type: string
 *               is_safety:
 *                 type: boolean
 *               created_by_id:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     item_type:
 *                       type: string
 *                       enum: [check, text, number, select]
 *                     required:
 *                       type: boolean
 *                     order_index:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Template criado com sucesso
 */
router.post('/checklist-templates', authenticate, QualityController.createChecklistTemplate);

/**
 * @swagger
 * /api/v1/quality/checklist-templates/{id}:
 *   patch:
 *     summary: Atualiza template de checklist e seus itens
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Template atualizado com sucesso
 */
router.patch('/checklist-templates/:id', authenticate, QualityController.updateChecklistTemplate);

/**
 * @swagger
 * /api/v1/quality/checklist-templates/{id}:
 *   delete:
 *     summary: Soft delete de template de checklist
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Template removido com sucesso
 */
router.delete('/checklist-templates/:id', authenticate, QualityController.deleteChecklistTemplate);

// ===========================================================================
// Checklist Responses Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/checklist-responses:
 *   get:
 *     summary: Lista respostas de checklist com filtros
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: checklist_templates_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tasks_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: initial_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: final_date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de respostas de checklist
 */
router.get('/checklist-responses', authenticate, QualityController.listChecklistResponses);

/**
 * @swagger
 * /api/v1/quality/checklist-responses/{id}:
 *   get:
 *     summary: Busca resposta de checklist por ID
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resposta de checklist encontrada
 */
router.get('/checklist-responses/:id', authenticate, QualityController.getChecklistResponse);

/**
 * @swagger
 * /api/v1/quality/checklist-responses:
 *   post:
 *     summary: Cria resposta de checklist com todos os itens
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checklist_templates_id
 *               - items
 *             properties:
 *               checklist_templates_id:
 *                 type: integer
 *               tasks_id:
 *                 type: integer
 *               projects_id:
 *                 type: integer
 *               responded_by_id:
 *                 type: integer
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - checklist_template_items_id
 *                   properties:
 *                     checklist_template_items_id:
 *                       type: integer
 *                     value:
 *                       type: string
 *                     checked:
 *                       type: boolean
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Resposta de checklist criada com sucesso
 */
router.post('/checklist-responses', authenticate, QualityController.createChecklistResponse);

// ===========================================================================
// Golden Rules Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/golden-rules:
 *   get:
 *     summary: Lista regras de ouro com paginacao
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista paginada de regras de ouro
 */
router.get('/golden-rules', authenticate, QualityController.listGoldenRules);

/**
 * @swagger
 * /api/v1/quality/golden-rules:
 *   post:
 *     summary: Cria regra de ouro
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               company_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               icon_url:
 *                 type: string
 *               category:
 *                 type: string
 *               order_index:
 *                 type: integer
 *               active:
 *                 type: boolean
 *               created_by_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Regra de ouro criada com sucesso
 */
router.post('/golden-rules', authenticate, QualityController.createGoldenRule);

/**
 * @swagger
 * /api/v1/quality/golden-rules/{id}:
 *   patch:
 *     summary: Atualiza regra de ouro
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Regra de ouro atualizada
 */
router.patch('/golden-rules/:id', authenticate, QualityController.updateGoldenRule);

/**
 * @swagger
 * /api/v1/quality/golden-rules/{id}:
 *   delete:
 *     summary: Soft delete de regra de ouro
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Regra de ouro removida com sucesso
 */
router.delete('/golden-rules/:id', authenticate, QualityController.deleteGoldenRule);

// ===========================================================================
// Task Golden Rules Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/task-golden-rules:
 *   get:
 *     summary: Lista vinculos task/template-golden rule
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tasks_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: golden_rules_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: checklist_templates_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de vinculos com detalhes das regras de ouro
 */
router.get('/task-golden-rules', authenticate, QualityController.listTaskGoldenRules);

/**
 * @swagger
 * /api/v1/quality/task-golden-rules:
 *   post:
 *     summary: Cria vinculo entre task ou template e uma golden rule
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - golden_rules_id
 *             properties:
 *               tasks_id:
 *                 type: integer
 *               checklist_templates_id:
 *                 type: integer
 *               golden_rules_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vinculo criado com sucesso
 */
router.post('/task-golden-rules', authenticate, QualityController.createTaskGoldenRule);

/**
 * @swagger
 * /api/v1/quality/task-golden-rules/{id}:
 *   delete:
 *     summary: Remove vinculo task-golden rule
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Vinculo removido com sucesso
 */
router.delete('/task-golden-rules/:id', authenticate, QualityController.deleteTaskGoldenRule);

// ===========================================================================
// Task Checklists Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/quality/task-checklists:
 *   get:
 *     summary: Lista vinculos task/template-checklist com os itens do checklist
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tasks_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: checklist_templates_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de vinculos com detalhes dos checklist templates
 */
router.get('/task-checklists', authenticate, QualityController.listTaskChecklists);

/**
 * @swagger
 * /api/v1/quality/task-checklists:
 *   post:
 *     summary: Cria vinculo entre task template e checklist template (idempotente)
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks_template_id
 *               - checklist_templates_id
 *             properties:
 *               tasks_template_id:
 *                 type: integer
 *               checklist_templates_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Vinculo criado com sucesso
 */
router.post('/task-checklists', authenticate, QualityController.createTaskChecklist);

/**
 * @swagger
 * /api/v1/quality/task-checklists/{id}:
 *   delete:
 *     summary: Remove vinculo task template-checklist template
 *     tags: [Quality]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Vinculo removido com sucesso
 */
router.delete('/task-checklists/:id', authenticate, QualityController.deleteTaskChecklist);

export { router as qualityRoutes };
export default router;
