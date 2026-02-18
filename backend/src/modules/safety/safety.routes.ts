// =============================================================================
// INDUSTRYVIEW BACKEND - Safety Module Routes
// Rotas do modulo de seguranca do trabalho
// Cobre: safety_incidents, treinamentos e DDS
// =============================================================================

import { Router } from 'express';
import { SafetyController } from './safety.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ===========================================================================
// Safety Incidents Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/safety/incidents:
 *   get:
 *     summary: Lista incidentes de seguranca com paginacao e filtros
 *     tags: [Safety]
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
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [leve, moderado, grave, fatal]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberto, em_investigacao, encerrado]
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
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de incidentes de seguranca
 */
router.get('/incidents', authenticate, SafetyController.listIncidents);

/**
 * @swagger
 * /api/v1/safety/incidents/statistics:
 *   get:
 *     summary: Retorna estatisticas de incidentes baseadas na Piramide de Bird
 *     tags: [Safety]
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
 *     responses:
 *       200:
 *         description: Estatisticas de incidentes por severidade e status
 */
router.get('/incidents/statistics', authenticate, SafetyController.getIncidentStatistics);

/**
 * @swagger
 * /api/v1/safety/incidents/{id}:
 *   get:
 *     summary: Busca incidente de seguranca por ID
 *     tags: [Safety]
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
 *         description: Incidente encontrado com witnesses e attachments
 *       404:
 *         description: Incidente nao encontrado
 */
router.get('/incidents/:id', authenticate, SafetyController.getIncidentById);

/**
 * @swagger
 * /api/v1/safety/incidents:
 *   post:
 *     summary: Cria incidente de seguranca
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reported_by
 *               - incident_date
 *               - description
 *               - location
 *               - severity
 *             properties:
 *               projects_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               reported_by:
 *                 type: integer
 *               incident_date:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [leve, moderado, grave, fatal]
 *               injured_user_id:
 *                 type: integer
 *               injured_name:
 *                 type: string
 *               body_part_affected:
 *                 type: string
 *               lost_time_days:
 *                 type: integer
 *               immediate_cause:
 *                 type: string
 *               property_damage:
 *                 type: boolean
 *               property_damage_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Incidente criado com numero sequencial automatico (INC-YYYY-NNN)
 */
router.post('/incidents', authenticate, SafetyController.createIncident);

/**
 * @swagger
 * /api/v1/safety/incidents/{id}:
 *   patch:
 *     summary: Atualiza incidente de seguranca
 *     description: Bloqueado para incidentes com status encerrado
 *     tags: [Safety]
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
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [leve, moderado, grave, fatal]
 *               injured_user_id:
 *                 type: integer
 *               injured_name:
 *                 type: string
 *               body_part_affected:
 *                 type: string
 *               lost_time_days:
 *                 type: integer
 *               immediate_cause:
 *                 type: string
 *               property_damage:
 *                 type: boolean
 *               property_damage_description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incidente atualizado
 *       400:
 *         description: Incidentes encerrados nao podem ser modificados
 *       404:
 *         description: Incidente nao encontrado
 */
router.patch('/incidents/:id', authenticate, SafetyController.updateIncident);

/**
 * @swagger
 * /api/v1/safety/incidents/{id}/investigate:
 *   post:
 *     summary: Inicia investigacao de incidente
 *     description: Muda status para em_investigacao e registra o investigador
 *     tags: [Safety]
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
 *               - investigated_by
 *             properties:
 *               investigated_by:
 *                 type: integer
 *               investigation_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Investigacao iniciada com sucesso
 *       400:
 *         description: Incidente ja encerrado ou ja em investigacao
 *       404:
 *         description: Incidente nao encontrado
 */
router.post('/incidents/:id/investigate', authenticate, SafetyController.investigateIncident);

/**
 * @swagger
 * /api/v1/safety/incidents/{id}/close:
 *   post:
 *     summary: Encerra incidente com causa raiz e acoes corretivas
 *     tags: [Safety]
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
 *               - closed_by
 *               - root_cause
 *               - corrective_actions
 *             properties:
 *               closed_by:
 *                 type: integer
 *               root_cause:
 *                 type: string
 *               corrective_actions:
 *                 type: string
 *               preventive_actions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Incidente encerrado com sucesso
 *       400:
 *         description: Incidente ja estava encerrado
 *       404:
 *         description: Incidente nao encontrado
 */
router.post('/incidents/:id/close', authenticate, SafetyController.closeIncident);

/**
 * @swagger
 * /api/v1/safety/incidents/{id}/witnesses:
 *   post:
 *     summary: Adiciona testemunha a um incidente
 *     tags: [Safety]
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
 *               - witness_name
 *             properties:
 *               user_id:
 *                 type: integer
 *               witness_name:
 *                 type: string
 *               witness_statement:
 *                 type: string
 *               witness_contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Testemunha adicionada com sucesso
 *       400:
 *         description: Incidente encerrado nao aceita novas testemunhas
 *       404:
 *         description: Incidente nao encontrado
 */
router.post('/incidents/:id/witnesses', authenticate, SafetyController.addWitness);

/**
 * @swagger
 * /api/v1/safety/incidents/{id}/attachments:
 *   post:
 *     summary: Adiciona anexo a um incidente
 *     tags: [Safety]
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
 *               - file_url
 *               - file_name
 *               - uploaded_by
 *             properties:
 *               file_url:
 *                 type: string
 *                 format: uri
 *               file_name:
 *                 type: string
 *               file_type:
 *                 type: string
 *               uploaded_by:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Anexo adicionado com sucesso
 *       400:
 *         description: Incidente encerrado nao aceita novos anexos
 *       404:
 *         description: Incidente nao encontrado
 */
router.post('/incidents/:id/attachments', authenticate, SafetyController.addAttachment);

// ===========================================================================
// Training Types Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/safety/training-types:
 *   get:
 *     summary: Lista tipos de treinamento
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de tipos de treinamento
 */
router.get('/training-types', authenticate, SafetyController.listTrainingTypes);

/**
 * @swagger
 * /api/v1/safety/training-types:
 *   post:
 *     summary: Cria tipo de treinamento
 *     tags: [Safety]
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
 *               - validity_months
 *             properties:
 *               company_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               validity_months:
 *                 type: integer
 *               is_mandatory:
 *                 type: boolean
 *               regulatory_norm:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tipo de treinamento criado com sucesso
 *       400:
 *         description: Ja existe treinamento com este nome para esta empresa
 */
router.post('/training-types', authenticate, SafetyController.createTrainingType);

/**
 * @swagger
 * /api/v1/safety/training-types/{id}:
 *   patch:
 *     summary: Atualiza tipo de treinamento
 *     tags: [Safety]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               validity_months:
 *                 type: integer
 *               is_mandatory:
 *                 type: boolean
 *               regulatory_norm:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tipo de treinamento atualizado
 *       404:
 *         description: Tipo de treinamento nao encontrado
 */
router.patch('/training-types/:id', authenticate, SafetyController.updateTrainingType);

/**
 * @swagger
 * /api/v1/safety/training-types/{id}:
 *   delete:
 *     summary: Remove tipo de treinamento
 *     description: Bloqueado se houver treinamentos de trabalhadores ou tarefas vinculadas
 *     tags: [Safety]
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
 *         description: Tipo de treinamento removido com sucesso
 *       400:
 *         description: Nao e possivel excluir pois ha registros vinculados
 *       404:
 *         description: Tipo de treinamento nao encontrado
 */
router.delete('/training-types/:id', authenticate, SafetyController.deleteTrainingType);

// ===========================================================================
// Worker Trainings Routes
// IMPORTANTE: rotas especificas devem vir antes de /:id
// ===========================================================================

/**
 * @swagger
 * /api/v1/safety/worker-trainings/expiring:
 *   get:
 *     summary: Lista treinamentos proximos do vencimento
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Numero de dias para considerar como proximo do vencimento
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de treinamentos expirando em breve
 */
router.get('/worker-trainings/expiring', authenticate, SafetyController.getExpiringTrainings);

/**
 * @swagger
 * /api/v1/safety/worker-trainings/expired:
 *   get:
 *     summary: Lista treinamentos ja vencidos
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de treinamentos vencidos
 */
router.get('/worker-trainings/expired', authenticate, SafetyController.getExpiredTrainings);

/**
 * @swagger
 * /api/v1/safety/worker-trainings/check-eligibility:
 *   get:
 *     summary: Verifica se trabalhador possui treinamentos necessarios para uma tarefa
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tasks_template_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado da verificacao de elegibilidade com lista de treinamentos faltantes
 */
router.get('/worker-trainings/check-eligibility', authenticate, SafetyController.checkTrainingEligibility);

/**
 * @swagger
 * /api/v1/safety/worker-trainings:
 *   get:
 *     summary: Lista treinamentos de trabalhadores com paginacao e filtros
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: training_types_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [valido, expirado, expirando]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de treinamentos de trabalhadores com status calculado
 */
router.get('/worker-trainings', authenticate, SafetyController.listWorkerTrainings);

/**
 * @swagger
 * /api/v1/safety/worker-trainings:
 *   post:
 *     summary: Cria registro de treinamento para trabalhador
 *     description: Calcula automaticamente expiry_date com base na validity_months do tipo de treinamento
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - training_types_id
 *               - training_date
 *             properties:
 *               user_id:
 *                 type: integer
 *               training_types_id:
 *                 type: integer
 *               training_date:
 *                 type: string
 *               instructor_name:
 *                 type: string
 *               training_provider:
 *                 type: string
 *               certificate_url:
 *                 type: string
 *                 format: uri
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Treinamento registrado com expiry_date calculada automaticamente
 *       404:
 *         description: Tipo de treinamento nao encontrado
 */
router.post('/worker-trainings', authenticate, SafetyController.createWorkerTraining);

// ===========================================================================
// Task Required Trainings Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/safety/task-required-trainings:
 *   get:
 *     summary: Lista treinamentos obrigatorios por template de tarefa
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tasks_template_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: training_types_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de treinamentos obrigatorios para os templates de tarefas
 */
router.get('/task-required-trainings', authenticate, SafetyController.listTaskRequiredTrainings);

/**
 * @swagger
 * /api/v1/safety/task-required-trainings:
 *   post:
 *     summary: Associa treinamento obrigatorio a template de tarefa
 *     tags: [Safety]
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
 *               - training_types_id
 *             properties:
 *               tasks_template_id:
 *                 type: integer
 *               training_types_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Associacao criada com sucesso
 *       400:
 *         description: Associacao ja existe ou tipo de treinamento invalido
 */
router.post('/task-required-trainings', authenticate, SafetyController.createTaskRequiredTraining);

/**
 * @swagger
 * /api/v1/safety/task-required-trainings/{id}:
 *   delete:
 *     summary: Remove associacao de treinamento obrigatorio de template de tarefa
 *     tags: [Safety]
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
 *         description: Associacao removida com sucesso
 *       404:
 *         description: Associacao nao encontrada
 */
router.delete('/task-required-trainings/:id', authenticate, SafetyController.deleteTaskRequiredTraining);

// ===========================================================================
// DDS Records Routes
// IMPORTANTE: /statistics deve vir antes de /:id para evitar conflito de rota
// ===========================================================================

/**
 * @swagger
 * /api/v1/safety/dds/statistics:
 *   get:
 *     summary: Retorna estatisticas de DDS (participacao, assinaturas, media)
 *     tags: [Safety]
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
 *     responses:
 *       200:
 *         description: Estatisticas de participacao nos DDS
 */
router.get('/dds/statistics', authenticate, SafetyController.getDdsStatistics);

/**
 * @swagger
 * /api/v1/safety/dds:
 *   get:
 *     summary: Lista registros de DDS com paginacao e filtros
 *     tags: [Safety]
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de registros de DDS com contagem de participantes
 */
router.get('/dds', authenticate, SafetyController.listDdsRecords);

/**
 * @swagger
 * /api/v1/safety/dds/{id}:
 *   get:
 *     summary: Busca registro de DDS por ID com lista de participantes
 *     tags: [Safety]
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
 *         description: Registro de DDS com participantes e assinaturas
 *       404:
 *         description: DDS nao encontrado
 */
router.get('/dds/:id', authenticate, SafetyController.getDdsById);

/**
 * @swagger
 * /api/v1/safety/dds:
 *   post:
 *     summary: Cria registro de DDS com participantes iniciais
 *     tags: [Safety]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conducted_by
 *               - dds_date
 *               - topic
 *             properties:
 *               projects_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               conducted_by:
 *                 type: integer
 *               dds_date:
 *                 type: string
 *               topic:
 *                 type: string
 *               duration_minutes:
 *                 type: integer
 *                 default: 15
 *               content:
 *                 type: string
 *               location:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: DDS criado com sucesso incluindo participantes iniciais
 */
router.post('/dds', authenticate, SafetyController.createDdsRecord);

/**
 * @swagger
 * /api/v1/safety/dds/{id}/participants:
 *   post:
 *     summary: Adiciona participante a um DDS existente
 *     tags: [Safety]
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Participante adicionado com sucesso
 *       400:
 *         description: Participante ja registrado neste DDS
 *       404:
 *         description: DDS nao encontrado
 */
router.post('/dds/:id/participants', authenticate, SafetyController.addDdsParticipant);

/**
 * @swagger
 * /api/v1/safety/dds/{id}/sign:
 *   post:
 *     summary: Registra assinatura de participacao em DDS
 *     description: Define signed_at para o timestamp atual do participante
 *     tags: [Safety]
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Assinatura registrada com sucesso
 *       400:
 *         description: Participante ja assinou ou nao esta registrado no DDS
 *       404:
 *         description: Participante nao encontrado neste DDS
 */
router.post('/dds/:id/sign', authenticate, SafetyController.signDdsParticipation);

export { router as safetyRoutes };
export default router;
