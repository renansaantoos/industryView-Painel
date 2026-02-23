// =============================================================================
// INDUSTRYVIEW BACKEND - Clients Module Routes
// Rotas do modulo de clientes
// =============================================================================

import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Rotas de listagem e criacao
router.get('/', authenticate, ClientsController.listClients);
router.post('/', authenticate, ClientsController.createClient);

// Rotas por ID - DEVEM vir apos rotas estaticas
router.get('/:id', authenticate, ClientsController.getClient);
router.patch('/:id', authenticate, ClientsController.updateClient);
router.delete('/:id', authenticate, ClientsController.deleteClient);

export { router as clientsRoutes };
export default router;
