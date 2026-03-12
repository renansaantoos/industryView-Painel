// =============================================================================
// INDUSTRYVIEW BACKEND - Weather Module Schemas (Zod)
// =============================================================================

import { z } from 'zod';

export const getWeatherByProjectSchema = z.object({
  params: z.object({
    projectId: z.string().transform(Number).pipe(z.number().int().positive()),
  }),
});

export const getCurrentWeatherSchema = z.object({
  query: z.object({
    lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
    lon: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
  }),
});

export const getForecastSchema = z.object({
  query: z.object({
    lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
    lon: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
  }),
});

export const getRiskAnalysisSchema = z.object({
  query: z.object({
    lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
    lon: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
  }),
});
