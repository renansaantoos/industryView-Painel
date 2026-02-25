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

// Rotas de unidades (Matriz / Filiais)
router.get('/:id/units', authenticate, ClientsController.listUnits);
router.post('/:id/units', authenticate, ClientsController.createUnit);
router.patch('/:id/units/:unitId', authenticate, ClientsController.updateUnit);
router.delete('/:id/units/:unitId', authenticate, ClientsController.deleteUnit);

export { router as clientsRoutes };
export default router;
