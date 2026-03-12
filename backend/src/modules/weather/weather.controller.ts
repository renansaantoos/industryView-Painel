// =============================================================================
// INDUSTRYVIEW BACKEND - Weather Controller
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { WeatherService } from '../../services/weather.service';
import { db } from '../../config/database';
import {
  getWeatherByProjectSchema,
  getCurrentWeatherSchema,
  getForecastSchema,
  getRiskAnalysisSchema,
} from './weather.schema';
import { getProjectCoordinates } from './weather.utils';

export class WeatherController {
  // GET /weather/project/:projectId - Weather + risk for a project's location
  static async getByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = getWeatherByProjectSchema.parse({ params: req.params });
      const projectId = parsed.params.projectId;

      if (!WeatherService.isConfigured()) {
        res.status(503).json({
          error: true,
          code: 'WEATHER_NOT_CONFIGURED',
          message: 'Servico de meteorologia nao configurado. Configure OPENWEATHERMAP_API_KEY.',
        });
        return;
      }

      const project = await db.projects.findFirst({
        where: { id: BigInt(projectId), deleted_at: null },
        select: {
          id: true, name: true, city: true, state: true,
          client: { select: { latitude: true, longitude: true } },
        },
      });

      if (!project) {
        res.status(404).json({ error: true, code: 'PROJECT_NOT_FOUND', message: 'Projeto nao encontrado.' });
        return;
      }

      const coords = await getProjectCoordinates(project);
      if (!coords) {
        res.status(400).json({
          error: true,
          code: 'PROJECT_NO_COORDINATES',
          message: 'Nao foi possivel determinar a localizacao do projeto. Cadastre coordenadas no cliente ou endereco no projeto.',
        });
        return;
      }

      const [forecast, riskAnalysis] = await Promise.all([
        WeatherService.getForecast(coords.lat, coords.lon),
        WeatherService.getWeatherRiskAnalysis(coords.lat, coords.lon),
      ]);

      res.json({
        project: { id: Number(project.id), name: project.name, lat: coords.lat, lon: coords.lon },
        forecast,
        risk_analysis: riskAnalysis,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /weather/current?lat=X&lon=Y - Current weather by coordinates
  static async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = getCurrentWeatherSchema.parse({ query: req.query });

      if (!WeatherService.isConfigured()) {
        res.status(503).json({
          error: true,
          code: 'WEATHER_NOT_CONFIGURED',
          message: 'Servico de meteorologia nao configurado.',
        });
        return;
      }

      const current = await WeatherService.getCurrentWeather(parsed.query.lat, parsed.query.lon);
      res.json(current);
    } catch (error) {
      next(error);
    }
  }

  // GET /weather/forecast?lat=X&lon=Y - 5-day forecast
  static async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = getForecastSchema.parse({ query: req.query });

      if (!WeatherService.isConfigured()) {
        res.status(503).json({
          error: true,
          code: 'WEATHER_NOT_CONFIGURED',
          message: 'Servico de meteorologia nao configurado.',
        });
        return;
      }

      const forecast = await WeatherService.getForecast(parsed.query.lat, parsed.query.lon);
      res.json(forecast);
    } catch (error) {
      next(error);
    }
  }

  // GET /weather/risk?lat=X&lon=Y - Risk analysis
  static async getRiskAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = getRiskAnalysisSchema.parse({ query: req.query });

      if (!WeatherService.isConfigured()) {
        res.status(503).json({
          error: true,
          code: 'WEATHER_NOT_CONFIGURED',
          message: 'Servico de meteorologia nao configurado.',
        });
        return;
      }

      const risk = await WeatherService.getWeatherRiskAnalysis(parsed.query.lat, parsed.query.lon);
      res.json(risk);
    } catch (error) {
      next(error);
    }
  }
}

export default WeatherController;
