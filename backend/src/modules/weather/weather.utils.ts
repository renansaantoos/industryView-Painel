// =============================================================================
// INDUSTRYVIEW BACKEND - Weather Utilities
// Resolucao de coordenadas a partir de projeto/cliente
// =============================================================================

import { config } from '../../config/env';
import { logger } from '../../utils/logger';

interface ProjectWithClient {
  city?: string | null;
  state?: string | null;
  client?: {
    latitude?: any;
    longitude?: any;
  } | null;
}

interface Coordinates {
  lat: number;
  lon: number;
}

// In-memory geocode cache
const geocodeCache = new Map<string, Coordinates | null>();

/**
 * Resolve project coordinates:
 * 1. From client's latitude/longitude if available
 * 2. From project city/state via OpenWeatherMap geocoding API
 */
export async function getProjectCoordinates(project: ProjectWithClient): Promise<Coordinates | null> {
  // Try client coordinates first
  if (project.client?.latitude && project.client?.longitude) {
    const lat = Number(project.client.latitude);
    const lon = Number(project.client.longitude);
    if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      return { lat, lon };
    }
  }

  // Fallback: geocode from city/state
  if (project.city) {
    const query = project.state ? `${project.city},${project.state},BR` : `${project.city},BR`;
    return geocodeCity(query);
  }

  return null;
}

async function geocodeCity(query: string): Promise<Coordinates | null> {
  if (geocodeCache.has(query)) {
    return geocodeCache.get(query)!;
  }

  const apiKey = config.weather?.apiKey;
  if (!apiKey) return null;

  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      logger.warn({ status: response.status, query }, 'Geocoding API error');
      geocodeCache.set(query, null);
      return null;
    }

    const data = await response.json() as any[];
    if (data.length === 0) {
      geocodeCache.set(query, null);
      return null;
    }

    const result = { lat: data[0].lat, lon: data[0].lon };
    geocodeCache.set(query, result);
    return result;
  } catch (error) {
    logger.error({ error, query }, 'Erro ao geocodificar cidade');
    return null;
  }
}
