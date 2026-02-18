// =============================================================================
// INDUSTRYVIEW BACKEND - Notifications Module Controller
// Controller do modulo de notificacoes
// =============================================================================

import { Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import {
  listNotificationsSchema,
  getNotificationByIdSchema,
  createNotificationSchema,
} from './notifications.schema';
import { AuthenticatedRequest } from '../../types';

/**
 * NotificationsController - Controller do modulo de notificacoes
 */
export class NotificationsController {
  /**
   * Lista notificacoes do usuario autenticado
   * Route: GET /api/v1/notifications
   */
  static async listNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user_id = Number(req.auth!.id);
      const input = listNotificationsSchema.parse(req.query);
      const result = await NotificationsService.listNotifications(user_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna contagem de notificacoes nao lidas
   * Route: GET /api/v1/notifications/unread-count
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user_id = Number(req.auth!.id);
      const result = await NotificationsService.getUnreadCount(user_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca uma notificacao como lida
   * Route: PATCH /api/v1/notifications/:id/read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getNotificationByIdSchema.parse(req.params);
      const result = await NotificationsService.markAsRead(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marca todas as notificacoes do usuario como lidas
   * Route: PUT /api/v1/notifications/read-all
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user_id = Number(req.auth!.id);
      const result = await NotificationsService.markAllAsRead(user_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria notificacao (uso interno ou admin)
   * Route: POST /api/v1/notifications (nao exposto em rotas de usuario final)
   */
  static async createNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createNotificationSchema.parse(req.body);
      const result = await NotificationsService.createNotification(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove uma notificacao
   * Route: DELETE /api/v1/notifications/:id
   */
  static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getNotificationByIdSchema.parse(req.params);
      await NotificationsService.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationsController;
