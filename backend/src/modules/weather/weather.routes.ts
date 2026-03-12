// =============================================================================
// INDUSTRYVIEW BACKEND - Weather Routes
// =============================================================================

import { Router } from 'express';
import { WeatherController } from './weather.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All weather routes require authentication
router.use(authenticate);

// Project-based weather (uses project's lat/lon)
router.get('/project/:projectId', WeatherController.getByProject);

// Coordinate-based endpoints
router.get('/current', WeatherController.getCurrent);
router.get('/forecast', WeatherController.getForecast);
router.get('/risk', WeatherController.getRiskAnalysis);

export { router as weatherRoutes };
