import { Router } from 'express';
import { HolidaysController } from './holidays.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/',                authenticate, HolidaysController.list);
router.post('/',               authenticate, HolidaysController.create);
router.patch('/:id',           authenticate, HolidaysController.update);
router.delete('/:id',          authenticate, HolidaysController.delete);
router.post('/seed',           authenticate, HolidaysController.seed);
router.get('/work-calendar',   authenticate, HolidaysController.getWorkCalendar);
router.put('/work-calendar',   authenticate, HolidaysController.upsertWorkCalendar);

export default router;
