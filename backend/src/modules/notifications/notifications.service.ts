// =============================================================================
// INDUSTRYVIEW BACKEND - Notifications Module Service
// Service do modulo de notificacoes
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListNotificationsInput,
  CreateNotificationInput,
} from './notifications.schema';

/**
 * NotificationsService - Service do modulo de notificacoes
 * Tabela notifications nao possui deleted_at nem updated_at
 */
export class NotificationsService {
  /**
   * Lista notificacoes de um usuario com suporte a filtro por lida/nao lida
   */
  static async listNotifications(user_id: number, input: ListNotificationsInput) {
    const { is_read, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      users_id: BigInt(user_id),
    };

    if (is_read !== undefined) {
      whereClause.is_read = is_read;
    }

    const [items, total] = await Promise.all([
      db.notifications.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.notifications.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Retorna contagem de notificacoes nao lidas do usuario
   */
  static async getUnreadCount(user_id: number) {
    const count = await db.notifications.count({
      where: {
        users_id: BigInt(user_id),
        is_read: false,
      },
    });

    return { unread_count: count };
  }

  /**
   * Marca uma notificacao como lida
   */
  static async markAsRead(id: number) {
    const notification = await db.notifications.findFirst({
      where: { id: BigInt(id) },
    });

    if (!notification) {
      throw new NotFoundError('Notificacao nao encontrada.');
    }

    return db.notifications.update({
      where: { id: BigInt(id) },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  /**
   * Marca todas as notificacoes de um usuario como lidas
   */
  static async markAllAsRead(user_id: number) {
    const result = await db.notifications.updateMany({
      where: {
        users_id: BigInt(user_id),
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { updated_count: result.count };
  }

  /**
   * Cria uma nova notificacao para um usuario
   */
  static async createNotification(input: CreateNotificationInput) {
    return db.notifications.create({
      data: {
        users_id: BigInt(input.users_id),
        title: input.title,
        message: input.message,
        notification_type: input.notification_type ?? 'info',
        reference_type: input.reference_type ?? null,
        reference_id: input.reference_id ? BigInt(input.reference_id) : null,
        is_read: false,
      },
    });
  }

  /**
   * Remove uma notificacao (hard delete - tabela nao tem deleted_at)
   */
  static async deleteNotification(id: number) {
    const notification = await db.notifications.findFirst({
      where: { id: BigInt(id) },
    });

    if (!notification) {
      throw new NotFoundError('Notificacao nao encontrada.');
    }

    return db.notifications.delete({
      where: { id: BigInt(id) },
    });
  }
}

export default NotificationsService;
