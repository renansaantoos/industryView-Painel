import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { WorkScheduleController } from './work-schedule.controller';

const router = Router();
router.use(authenticate);

router.get('/:users_id', WorkScheduleController.get);
router.put('/:users_id', WorkScheduleController.upsert);

export const workScheduleRoutes = router;
