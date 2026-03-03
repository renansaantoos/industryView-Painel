import { Router } from 'express';
import { ScheduleController } from './schedule.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// POST /schedule — Criar escala diária
router.post('/', ScheduleController.create);

// GET /schedule — Listar schedule_users do dia
router.get('/', ScheduleController.listToday);

// PUT /schedule/:id — Atualizar colaboradores da escala
router.put('/:id', ScheduleController.update);

// GET /schedule/:id — Buscar schedule por ID
router.get('/:id', ScheduleController.getById);

export default router;
