import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export type WeatherServiceErrorKind =
  | 'cancelled'
  | 'http'
  | 'invalid-payload'
  | 'network'
  | 'timeout'
  | 'unknown';

export class WeatherServiceError extends Error {
  readonly status?: number;
  readonly kind: WeatherServiceErrorKind;

  constructor(message: string, status?: number, kind: WeatherServiceErrorKind = 'unknown') {
    super(message);
    this.name = 'WeatherServiceError';
    this.status = status;
    this.kind = kind;
  }
}

interface GeocodingResult {
  id?: unknown;
  name?: unknown;
  country?: unknown;
  admin1?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
}

interface GeocodingResponse {
  results?: unknown;
}

interface ForecastCurrent {
  time?: unknown;
  temperature_2m?: unknown;
  relative_humidity_2m?: unknown;
  wind_speed_10m?: unknown;
  surface_pressure?: unknown;
  precipitation?: unknown;
  weather_code?: unknown;
}

interface ForecastDaily {
  time?: unknown;
  weather_code?: unknown;
  temperature_2m_max?: unknown;
  temperature_2m_min?: unknown;
  precipitation_probability_max?: unknown;
}

interface ForecastResponse {
  timezone?: unknown;
  current?: unknown;
  daily?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    typeof value.latitude === 'number' &&
    Number.isFinite(value.latitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.longitude) &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function optionalId(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item))
  );
}

function isNullableNumberArray(value: unknown): value is Array<number | null> {
  return (
    Array.isArray(value) &&
    value.length === 5 &&
    value.every((item) => item === null || (typeof item === 'number' && Number.isFinite(item)))
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.length === 5 && value.every((item) => typeof item === 'string')
  );
}

function mapCity(result: GeocodingResult): City {
  return {
    id: optionalId(result.id),
    name: result.name as string,
    country: optionalString(result.country),
    region: optionalString(result.admin1),
    latitude: result.latitude as number,
    longitude: result.longitude as number,
    timezone: optionalString(result.timezone),
  };
}

export async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  let didTimeout = false;
  let didCancel = signal?.aborted ?? false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortRequest = () => {
    didCancel = true;
    controller.abort();
  };

  signal?.addEventListener('abort', abortRequest, { once: true });
  if (didCancel) {
    controller.abort();
  }

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof WeatherServiceError) {
      throw error;
    }

    if (didTimeout) {
      throw new WeatherServiceError('A requisição demorou demais.', undefined, 'timeout');
    }

    if (didCancel || (error instanceof DOMException && error.name === 'AbortError')) {
      throw new WeatherServiceError('A requisição foi cancelada.', undefined, 'cancelled');
    }

    throw new WeatherServiceError('Falha de rede.', undefined, 'network');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortRequest);
  }
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();
  if (!query) {
    return [];
  }

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const response = await fetchWithTimeout(url, signal);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Geocoding request failed with status ${response.status}.`,
      response.status,
      'http',
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new WeatherServiceError(
      'Geocoding response is not valid JSON.',
      undefined,
      'invalid-payload',
    );
  }

  if (!isRecord(payload)) {
    throw new WeatherServiceError(
      'Geocoding response has an invalid format.',
      undefined,
      'invalid-payload',
    );
  }

  const geocodingResponse = payload as GeocodingResponse;
  if (!Array.isArray(geocodingResponse.results)) {
    return [];
  }

  return geocodingResponse.results.filter(isGeocodingResult).slice(0, 5).map(mapCity);
}

function mapCurrent(current: ForecastCurrent): CurrentWeather | null {
  if (
    typeof current.time !== 'string' ||
    typeof current.temperature_2m !== 'number' ||
    !Number.isFinite(current.temperature_2m) ||
    typeof current.weather_code !== 'number' ||
    !Number.isFinite(current.weather_code)
  ) {
    return null;
  }

  return {
    time: current.time,
    temperatureCelsius: current.temperature_2m,
    weatherCode: current.weather_code,
    humidity: optionalNumber(current.relative_humidity_2m),
    windSpeed: optionalNumber(current.wind_speed_10m),
    pressure: optionalNumber(current.surface_pressure),
    precipitation: optionalNumber(current.precipitation),
  };
}

function mapDaily(daily: ForecastDaily): ForecastDay[] | null {
  const dates = daily.time;
  const weatherCodes = daily.weather_code;
  const maximums = daily.temperature_2m_max;
  const minimums = daily.temperature_2m_min;

  if (
    !isStringArray(dates) ||
    !isNumberArray(weatherCodes) ||
    !isNumberArray(maximums) ||
    !isNumberArray(minimums)
  ) {
    return null;
  }

  const precipitation = daily.precipitation_probability_max;

  if (
    precipitation !== undefined &&
    precipitation !== null &&
    !isNullableNumberArray(precipitation)
  ) {
    return null;
  }

  return dates.map((date, index) => ({
    date,
    weatherCode: weatherCodes[index],
    minimumCelsius: minimums[index],
    maximumCelsius: maximums[index],
    precipitationProbability:
      precipitation && precipitation[index] !== null ? precipitation[index] : 0,
  }));
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });
  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`, signal);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Forecast request failed with status ${response.status}.`,
      response.status,
      'http',
    );
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new WeatherServiceError(
      'Forecast response is not valid JSON.',
      undefined,
      'invalid-payload',
    );
  }

  if (!isRecord(payload)) {
    throw new WeatherServiceError(
      'Forecast response has an invalid format.',
      undefined,
      'invalid-payload',
    );
  }

  const forecast = payload as ForecastResponse;
  if (!isRecord(forecast.current) || !isRecord(forecast.daily)) {
    throw new WeatherServiceError('Resposta de forecast incompleta.', undefined, 'invalid-payload');
  }

  const current = mapCurrent(forecast.current as ForecastCurrent);
  const days = mapDaily(forecast.daily as ForecastDaily);
  if (!current || !days) {
    throw new WeatherServiceError('Resposta de forecast incompleta.', undefined, 'invalid-payload');
  }

  return {
    city,
    timezone: optionalString(forecast.timezone) ?? city.timezone,
    current,
    days,
  };
}
