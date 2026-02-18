// =============================================================================
// INDUSTRYVIEW BACKEND - Notifications Module Routes
// Rotas do modulo de notificacoes
// =============================================================================

import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Rotas estaticas antes das rotas com parametro :id
router.get('/unread-count', authenticate, NotificationsController.getUnreadCount);
router.put('/read-all', authenticate, NotificationsController.markAllAsRead);

router.get('/', authenticate, NotificationsController.listNotifications);
router.patch('/:id/read', authenticate, NotificationsController.markAsRead);
router.delete('/:id', authenticate, NotificationsController.deleteNotification);

export { router as notificationsRoutes };
export default router;
