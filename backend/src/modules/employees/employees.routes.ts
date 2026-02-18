// =============================================================================
// INDUSTRYVIEW BACKEND - Employees Module Routes
// Rotas do modulo de funcionarios (dados de RH, ferias, documentos)
// =============================================================================

import { Router } from 'express';
import { EmployeesController } from './employees.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// HR Data
router.get('/hr-data/:users_id', authenticate, EmployeesController.getHrData);
router.put('/hr-data/:users_id', authenticate, EmployeesController.upsertHrData);

// Ferias - rota estatica antes de /:id
router.get('/vacations/balance/:users_id', authenticate, EmployeesController.getVacationBalance);
router.get('/vacations', authenticate, EmployeesController.listVacations);
router.post('/vacations', authenticate, EmployeesController.createVacation);
router.patch('/vacations/:id', authenticate, EmployeesController.updateVacation);
router.post('/vacations/:id/approve', authenticate, EmployeesController.approveVacation);
router.delete('/vacations/:id', authenticate, EmployeesController.deleteVacation);

// Documentos
router.get('/documents', authenticate, EmployeesController.listDocuments);
router.post('/documents', authenticate, EmployeesController.createDocument);
router.patch('/documents/:id', authenticate, EmployeesController.updateDocument);
router.delete('/documents/:id', authenticate, EmployeesController.deleteDocument);

// Day Offs (Folgas / Banco de Horas)
router.get('/day-offs/balance/:users_id', authenticate, EmployeesController.getDayOffBalance);
router.get('/day-offs', authenticate, EmployeesController.listDayOffs);
router.post('/day-offs', authenticate, EmployeesController.createDayOff);
router.patch('/day-offs/:id', authenticate, EmployeesController.updateDayOff);
router.post('/day-offs/:id/approve', authenticate, EmployeesController.approveDayOff);
router.delete('/day-offs/:id', authenticate, EmployeesController.deleteDayOff);

// Benefits (Beneficios)
router.get('/benefits', authenticate, EmployeesController.listBenefits);
router.post('/benefits', authenticate, EmployeesController.createBenefit);
router.patch('/benefits/:id', authenticate, EmployeesController.updateBenefit);
router.delete('/benefits/:id', authenticate, EmployeesController.deleteBenefit);

// Career History (Historico de Cargos)
router.get('/career-history', authenticate, EmployeesController.listCareerHistory);
router.post('/career-history', authenticate, EmployeesController.createCareerHistory);
router.patch('/career-history/:id', authenticate, EmployeesController.updateCareerHistory);
router.delete('/career-history/:id', authenticate, EmployeesController.deleteCareerHistory);

export { router as employeesRoutes };
export default router;
