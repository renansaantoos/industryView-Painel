// =============================================================================
// INDUSTRYVIEW BACKEND - Safety Module Controller
// Controller do modulo de seguranca do trabalho
// Cobre: safety_incidents, treinamentos e DDS
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { SafetyService } from './safety.service';
import { AuthenticatedRequest } from '../../types';
import { serializeBigInt } from '../../utils/bigint';
import {
  listIncidentsSchema,
  getIncidentStatisticsSchema,
  getIncidentByIdSchema,
  createSafetyIncidentSchema,
  updateSafetyIncidentSchema,
  investigateIncidentSchema,
  closeIncidentSchema,
  createIncidentWitnessSchema,
  createIncidentAttachmentSchema,
  listTrainingTypesSchema,
  createTrainingTypeSchema,
  updateTrainingTypeSchema,
  listWorkerTrainingsSchema,
  getExpiringTrainingsSchema,
  getExpiredTrainingsSchema,
  createWorkerTrainingSchema,
  checkTrainingEligibilitySchema,
  listTaskRequiredTrainingsSchema,
  createTaskRequiredTrainingSchema,
  deleteTaskRequiredTrainingSchema,
  listDdsRecordsSchema,
  getDdsStatisticsSchema,
  getDdsByIdSchema,
  createDdsRecordSchema,
  createDdsParticipantSchema,
  signDdsParticipationSchema,
} from './safety.schema';

/**
 * SafetyController - Controller do modulo de seguranca do trabalho
 */
export class SafetyController {
  // ===========================================================================
  // Safety Incidents
  // ===========================================================================

  /**
   * Lista incidentes de seguranca com paginacao e filtros
   * Route: GET /api/v1/safety/incidents
   */
  static async listIncidents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listIncidentsSchema.parse(req.query) as any;
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await SafetyService.listIncidents(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna estatisticas de incidentes (Piramide de Bird)
   * Route: GET /api/v1/safety/incidents/statistics
   */
  static async getIncidentStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = getIncidentStatisticsSchema.parse(req.query) as any;
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await SafetyService.getIncidentStatistics(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca incidente de seguranca por ID com witnesses e attachments
   * Route: GET /api/v1/safety/incidents/:id
   */
  static async getIncidentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const result = await SafetyService.getIncidentById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria incidente de seguranca
   * Route: POST /api/v1/safety/incidents
   */
  static async createIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSafetyIncidentSchema.parse(req.body);
      const result = await SafetyService.createIncident(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza incidente de seguranca
   * Bloqueado para incidentes com status 'encerrado'
   * Route: PATCH /api/v1/safety/incidents/:id
   */
  static async updateIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const input = updateSafetyIncidentSchema.parse(req.body);
      const result = await SafetyService.updateIncident(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Inicia investigacao de incidente
   * Muda status para 'em_investigacao'
   * Route: POST /api/v1/safety/incidents/:id/investigate
   */
  static async investigateIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const input = investigateIncidentSchema.parse(req.body);
      const result = await SafetyService.investigateIncident(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Encerra incidente com causa raiz e acoes corretivas
   * Route: POST /api/v1/safety/incidents/:id/close
   */
  static async closeIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const input = closeIncidentSchema.parse(req.body);
      const result = await SafetyService.closeIncident(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adiciona testemunha a um incidente
   * Route: POST /api/v1/safety/incidents/:id/witnesses
   */
  static async addWitness(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const input = createIncidentWitnessSchema.parse(req.body);
      const result = await SafetyService.addWitness(id, input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adiciona anexo a um incidente
   * Route: POST /api/v1/safety/incidents/:id/attachments
   */
  static async addAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const input = createIncidentAttachmentSchema.parse(req.body);
      const result = await SafetyService.addAttachment(id, input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Training Types
  // ===========================================================================

  /**
   * Lista tipos de treinamento
   * Route: GET /api/v1/safety/training-types
   */
  static async listTrainingTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listTrainingTypesSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await SafetyService.listTrainingTypes(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria tipo de treinamento
   * Route: POST /api/v1/safety/training-types
   */
  static async createTrainingType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        body.company_id = req.user.companyId;
      }
      const input = createTrainingTypeSchema.parse(body);
      const result = await SafetyService.createTrainingType(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza tipo de treinamento
   * Route: PATCH /api/v1/safety/training-types/:id
   */
  static async updateTrainingType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const input = updateTrainingTypeSchema.parse(req.body);
      const result = await SafetyService.updateTrainingType(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove tipo de treinamento
   * Route: DELETE /api/v1/safety/training-types/:id
   */
  static async deleteTrainingType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getIncidentByIdSchema.parse(req.params);
      const result = await SafetyService.deleteTrainingType(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Worker Trainings
  // ===========================================================================

  /**
   * Lista treinamentos de trabalhadores com paginacao e filtros
   * Route: GET /api/v1/safety/worker-trainings
   */
  static async listWorkerTrainings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listWorkerTrainingsSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await SafetyService.listWorkerTrainings(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista treinamentos proximos do vencimento
   * Route: GET /api/v1/safety/worker-trainings/expiring
   */
  static async getExpiringTrainings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = getExpiringTrainingsSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await SafetyService.getExpiringTrainings(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista treinamentos vencidos
   * Route: GET /api/v1/safety/worker-trainings/expired
   */
  static async getExpiredTrainings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = getExpiredTrainingsSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      const companyId = req.user?.companyId ?? input.company_id;
      const result = await SafetyService.getExpiredTrainings(companyId);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica elegibilidade de treinamento para execucao de tarefa
   * Route: GET /api/v1/safety/worker-trainings/check-eligibility
   */
  static async checkTrainingEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const input = checkTrainingEligibilitySchema.parse(req.query);
      const result = await SafetyService.checkTrainingEligibility(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria registro de treinamento para um trabalhador
   * Route: POST /api/v1/safety/worker-trainings
   */
  static async createWorkerTraining(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createWorkerTrainingSchema.parse(req.body);
      const registeredBy = req.user?.id ?? input.users_id;
      const result = await SafetyService.createWorkerTraining(input, registeredBy);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Task Required Trainings
  // ===========================================================================

  /**
   * Lista treinamentos requeridos para templates de tarefas
   * Route: GET /api/v1/safety/task-required-trainings
   */
  static async listTaskRequiredTrainings(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listTaskRequiredTrainingsSchema.parse(req.query);
      const result = await SafetyService.listTaskRequiredTrainings(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Associa treinamento obrigatorio a template de tarefa
   * Route: POST /api/v1/safety/task-required-trainings
   */
  static async createTaskRequiredTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTaskRequiredTrainingSchema.parse(req.body);
      const result = await SafetyService.createTaskRequiredTraining(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove associacao de treinamento obrigatorio de template de tarefa
   * Route: DELETE /api/v1/safety/task-required-trainings/:id
   */
  static async deleteTaskRequiredTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = deleteTaskRequiredTrainingSchema.parse(req.params);
      const result = await SafetyService.deleteTaskRequiredTraining(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // DDS Records (Dialogo Diario de Seguranca)
  // ===========================================================================

  /**
   * Lista registros de DDS com paginacao e filtros
   * Route: GET /api/v1/safety/dds
   */
  static async listDdsRecords(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listDdsRecordsSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await SafetyService.listDdsRecords(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna estatisticas de DDS
   * Route: GET /api/v1/safety/dds/statistics
   */
  static async getDdsStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = getDdsStatisticsSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await SafetyService.getDdsStatistics(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca registro de DDS por ID com lista de participantes
   * Route: GET /api/v1/safety/dds/:id
   */
  static async getDdsById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getDdsByIdSchema.parse(req.params);
      const result = await SafetyService.getDdsById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria registro de DDS com participantes iniciais
   * Route: POST /api/v1/safety/dds
   */
  static async createDdsRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        body.company_id = req.user.companyId;
      }
      const input = createDdsRecordSchema.parse(body);
      const result = await SafetyService.createDdsRecord(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adiciona participante a um DDS existente
   * Route: POST /api/v1/safety/dds/:id/participants
   */
  static async addDdsParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getDdsByIdSchema.parse(req.params);
      const { user_id } = createDdsParticipantSchema.parse(req.body);
      const result = await SafetyService.addDdsParticipant(id, user_id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra assinatura de participacao em DDS
   * Route: POST /api/v1/safety/dds/:id/sign
   */
  static async signDdsParticipation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getDdsByIdSchema.parse(req.params);
      const { user_id } = signDdsParticipationSchema.parse(req.body);
      const result = await SafetyService.signDdsParticipation(id, user_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default SafetyController;
