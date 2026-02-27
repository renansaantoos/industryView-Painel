import { Router } from 'express';
import { ProjectCalendarController } from './projectCalendar.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Holidays
router.get('/holidays',                authenticate, ProjectCalendarController.listHolidays);
router.post('/holidays',               authenticate, ProjectCalendarController.createHoliday);
router.patch('/holidays/:id',          authenticate, ProjectCalendarController.updateHoliday);
router.delete('/holidays/:id',         authenticate, ProjectCalendarController.deleteHoliday);
router.post('/holidays/seed',          authenticate, ProjectCalendarController.seedHolidays);

// Work Calendar
router.get('/work-calendar',           authenticate, ProjectCalendarController.getWorkCalendar);
router.put('/work-calendar',           authenticate, ProjectCalendarController.upsertWorkCalendar);
router.get('/work-calendar/overrides', authenticate, ProjectCalendarController.listCalendarOverrides);
router.put('/work-calendar/overrides', authenticate, ProjectCalendarController.upsertCalendarOverride);
router.delete('/work-calendar/overrides/:id', authenticate, ProjectCalendarController.deleteCalendarOverride);

// Countries
router.get('/countries',               authenticate, ProjectCalendarController.getCountries);

export default router;
