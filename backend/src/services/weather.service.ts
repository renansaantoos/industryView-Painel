// =============================================================================
// INDUSTRYVIEW BACKEND - Weather Service
// Wrapper para OpenWeatherMap API com cache em memoria
// =============================================================================

import { config } from '../config/env';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface CurrentWeather {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  description: string;
  icon: string;
  condition: string; // main: Rain, Clear, Clouds, etc.
  pressure: number;
  visibility: number;
  clouds: number;
  rain_1h?: number;
  rain_3h?: number;
  dt: string; // ISO date
}

export interface ForecastItem {
  dt: string; // ISO date
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  wind_gust?: number;
  description: string;
  condition: string;
  icon: string;
  clouds: number;
  pop: number; // probability of precipitation (0-1)
  rain_3h?: number;
  snow_3h?: number;
}

export interface DailyForecastSummary {
  date: string; // YYYY-MM-DD
  temp_min: number;
  temp_max: number;
  avg_humidity: number;
  max_wind: number;
  max_pop: number; // max probability of precipitation
  dominant_condition: string;
  description: string;
  rain_total: number;
  work_risk: 'baixo' | 'medio' | 'alto' | 'critico';
  risk_factors: string[];
}

export interface WeatherForecast {
  current: CurrentWeather;
  hourly: ForecastItem[];
  daily_summary: DailyForecastSummary[];
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  fetched_at: string;
}

export interface WeatherRiskAnalysis {
  next_5_days: DailyForecastSummary[];
  critical_days: DailyForecastSummary[];
  work_days_at_risk: number;
  total_work_days: number;
  overall_risk: 'baixo' | 'medio' | 'alto' | 'critico';
  recommendations: string[];
}

// =============================================================================
// CACHE
// =============================================================================

interface CacheEntry<T> {
  data: T;
  expires_at: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CURRENT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const FORECAST_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires_at) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, expires_at: Date.now() + ttl });
}

// =============================================================================
// SERVICE
// =============================================================================

export class WeatherService {
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  private static get apiKey(): string | undefined {
    return config.weather?.apiKey;
  }

  private static get units(): string {
    return config.weather?.units || 'metric';
  }

  static isConfigured(): boolean {
    return !!this.apiKey;
  }

  // ===========================================================================
  // CURRENT WEATHER
  // ===========================================================================

  static async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather | null> {
    if (!this.isConfigured()) {
      logger.warn('OpenWeatherMap API key not configured');
      return null;
    }

    const cacheKey = `current_${lat}_${lon}`;
    const cached = getCached<CurrentWeather>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=pt_br`;
      const response = await fetch(url);

      if (!response.ok) {
        logger.error({ status: response.status }, 'OpenWeatherMap current weather API error');
        return null;
      }

      const data = await response.json() as any;

      const result: CurrentWeather = {
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        wind_direction: data.wind.deg,
        description: data.weather[0]?.description || '',
        icon: data.weather[0]?.icon || '',
        condition: data.weather[0]?.main || '',
        pressure: data.main.pressure,
        visibility: data.visibility,
        clouds: data.clouds?.all || 0,
        rain_1h: data.rain?.['1h'],
        rain_3h: data.rain?.['3h'],
        dt: new Date(data.dt * 1000).toISOString(),
      };

      setCache(cacheKey, result, CURRENT_CACHE_TTL);
      return result;
    } catch (error) {
      logger.error({ error, lat, lon }, 'Erro ao buscar clima atual');
      return null;
    }
  }

  // ===========================================================================
  // 5-DAY FORECAST
  // ===========================================================================

  static async getForecast(lat: number, lon: number): Promise<WeatherForecast | null> {
    if (!this.isConfigured()) {
      logger.warn('OpenWeatherMap API key not configured');
      return null;
    }

    const cacheKey = `forecast_${lat}_${lon}`;
    const cached = getCached<WeatherForecast>(cacheKey);
    if (cached) return cached;

    try {
      // Fetch current + forecast in parallel
      const [currentData, forecastResponse] = await Promise.all([
        this.getCurrentWeather(lat, lon),
        fetch(`${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=pt_br`),
      ]);

      if (!forecastResponse.ok) {
        logger.error({ status: forecastResponse.status }, 'OpenWeatherMap forecast API error');
        return null;
      }

      const forecastData = await forecastResponse.json() as any;

      const hourly: ForecastItem[] = forecastData.list.map((item: any) => ({
        dt: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        feels_like: item.main.feels_like,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        wind_gust: item.wind.gust,
        description: item.weather[0]?.description || '',
        condition: item.weather[0]?.main || '',
        icon: item.weather[0]?.icon || '',
        clouds: item.clouds?.all || 0,
        pop: item.pop || 0,
        rain_3h: item.rain?.['3h'],
        snow_3h: item.snow?.['3h'],
      }));

      const dailySummary = this.aggregateDailyForecast(hourly);

      const result: WeatherForecast = {
        current: currentData || {
          temperature: 0, feels_like: 0, humidity: 0, wind_speed: 0,
          wind_direction: 0, description: 'N/A', icon: '', condition: 'Unknown',
          pressure: 0, visibility: 0, clouds: 0, dt: new Date().toISOString(),
        },
        hourly,
        daily_summary: dailySummary,
        location: {
          name: forecastData.city?.name || '',
          country: forecastData.city?.country || '',
          lat,
          lon,
        },
        fetched_at: new Date().toISOString(),
      };

      setCache(cacheKey, result, FORECAST_CACHE_TTL);
      return result;
    } catch (error) {
      logger.error({ error, lat, lon }, 'Erro ao buscar previsao do tempo');
      return null;
    }
  }

  // ===========================================================================
  // RISK ANALYSIS
  // ===========================================================================

  static async getWeatherRiskAnalysis(lat: number, lon: number): Promise<WeatherRiskAnalysis | null> {
    const forecast = await this.getForecast(lat, lon);
    if (!forecast) return null;

    const criticalDays = forecast.daily_summary.filter(
      d => d.work_risk === 'alto' || d.work_risk === 'critico'
    );

    const workDaysAtRisk = criticalDays.length;
    const totalWorkDays = forecast.daily_summary.length;

    let overallRisk: 'baixo' | 'medio' | 'alto' | 'critico' = 'baixo';
    if (workDaysAtRisk >= 3) overallRisk = 'critico';
    else if (workDaysAtRisk >= 2) overallRisk = 'alto';
    else if (workDaysAtRisk >= 1) overallRisk = 'medio';

    const recommendations: string[] = [];
    if (criticalDays.length > 0) {
      recommendations.push(`${criticalDays.length} dia(s) com risco alto/critico nos proximos 5 dias`);
    }

    const heavyRainDays = forecast.daily_summary.filter(d => d.rain_total > 10);
    if (heavyRainDays.length > 0) {
      recommendations.push(`Chuva forte prevista em ${heavyRainDays.map(d => d.date).join(', ')} - considere replanejar atividades externas`);
    }

    const highWindDays = forecast.daily_summary.filter(d => d.max_wind > 10);
    if (highWindDays.length > 0) {
      recommendations.push(`Ventos fortes (>${highWindDays[0].max_wind.toFixed(0)} m/s) previstos - avaliar seguranca de trabalhos em altura`);
    }

    const highTempDays = forecast.daily_summary.filter(d => d.temp_max > 35);
    if (highTempDays.length > 0) {
      recommendations.push(`Temperaturas acima de 35C previstas - garantir hidratacao e pausas para equipes externas`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Condicoes meteorologicas favoraveis para os proximos dias');
    }

    return {
      next_5_days: forecast.daily_summary,
      critical_days: criticalDays,
      work_days_at_risk: workDaysAtRisk,
      total_work_days: totalWorkDays,
      overall_risk: overallRisk,
      recommendations,
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private static aggregateDailyForecast(hourly: ForecastItem[]): DailyForecastSummary[] {
    const byDate = new Map<string, ForecastItem[]>();

    for (const item of hourly) {
      const date = item.dt.split('T')[0];
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push(item);
    }

    const summaries: DailyForecastSummary[] = [];

    for (const [date, items] of byDate) {
      const tempMin = Math.min(...items.map(i => i.temp_min));
      const tempMax = Math.max(...items.map(i => i.temp_max));
      const avgHumidity = Math.round(items.reduce((s, i) => s + i.humidity, 0) / items.length);
      const maxWind = Math.max(...items.map(i => i.wind_speed));
      const maxPop = Math.max(...items.map(i => i.pop));
      const rainTotal = items.reduce((s, i) => s + (i.rain_3h || 0), 0);

      // Dominant condition: most frequent
      const conditionCount = new Map<string, number>();
      for (const item of items) {
        conditionCount.set(item.condition, (conditionCount.get(item.condition) || 0) + 1);
      }
      let dominantCondition = 'Clear';
      let maxCount = 0;
      for (const [cond, count] of conditionCount) {
        if (count > maxCount) { dominantCondition = cond; maxCount = count; }
      }

      // Risk assessment
      const riskFactors: string[] = [];
      if (rainTotal > 20) riskFactors.push('chuva_forte');
      else if (rainTotal > 5) riskFactors.push('chuva_moderada');
      if (maxWind > 15) riskFactors.push('vento_forte');
      else if (maxWind > 10) riskFactors.push('vento_moderado');
      if (tempMax > 38) riskFactors.push('calor_extremo');
      else if (tempMax > 35) riskFactors.push('calor_intenso');
      if (maxPop > 0.8) riskFactors.push('alta_probabilidade_precipitacao');

      let workRisk: 'baixo' | 'medio' | 'alto' | 'critico' = 'baixo';
      if (riskFactors.includes('chuva_forte') || riskFactors.includes('vento_forte') || riskFactors.includes('calor_extremo')) {
        workRisk = 'critico';
      } else if (riskFactors.length >= 2) {
        workRisk = 'alto';
      } else if (riskFactors.length === 1) {
        workRisk = 'medio';
      }

      // Best description from most common condition
      const descriptionItem = items.find(i => i.condition === dominantCondition);

      summaries.push({
        date,
        temp_min: Math.round(tempMin * 10) / 10,
        temp_max: Math.round(tempMax * 10) / 10,
        avg_humidity: avgHumidity,
        max_wind: Math.round(maxWind * 10) / 10,
        max_pop: Math.round(maxPop * 100) / 100,
        dominant_condition: dominantCondition,
        description: descriptionItem?.description || '',
        rain_total: Math.round(rainTotal * 10) / 10,
        work_risk: workRisk,
        risk_factors: riskFactors,
      });
    }

    return summaries;
  }

  // Clear cache (useful for testing)
  static clearCache(): void {
    cache.clear();
  }
}

export default WeatherService;
