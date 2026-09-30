import { afterEach, describe, expect, it, vi } from 'vitest';

import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  region: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('does not call fetch for empty input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps geocoding results to City values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              country: 'Brasil',
              admin1: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São Paulo ')).resolves.toEqual([city]);
    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get('name')).toBe('São Paulo');
    expect(requestUrl.searchParams.get('count')).toBe('5');
    expect(requestUrl.searchParams.get('language')).toBe('pt');
    expect(requestUrl.searchParams.get('format')).toBe('json');
  });

  it('returns an empty list when results is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));

    await expect(searchCities('Lisboa')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError for a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));

    await expect(searchCities('Lisboa')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('converts network failures to WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({ message: 'Falha de rede.' });
  });

  it('throws for invalid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{invalid')));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      message: 'Geocoding response is not valid JSON.',
    });
  });

  it('discards invalid cities and limits results to five entries', async () => {
    const validResults = Array.from({ length: 6 }, (_, index) => ({
      id: index,
      name: `Cidade ${index}`,
      latitude: index,
      longitude: -index,
    }));
    const invalidResults = [
      { name: 'Sem latitude', longitude: 10 },
      { name: 'Latitude inválida', latitude: 91, longitude: 10 },
    ];
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ results: [...invalidResults, ...validResults] })),
        ),
    );

    const results = await searchCities('Cidades');

    expect(results).toHaveLength(5);
    expect(results.map((result) => result.name)).toEqual([
      'Cidade 0',
      'Cidade 1',
      'Cidade 2',
      'Cidade 3',
      'Cidade 4',
    ]);
  });
});

describe('getWeather', () => {
  const daily = {
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    weather_code: [2, 61, 3, 1, 80],
    temperature_2m_max: [25, 23, 24, 26, 25],
    temperature_2m_min: [17, 18, 17, 16, 18],
    precipitation_probability_max: [null, 65, 35, 15, 55],
  };

  it('maps current weather and five daily entries', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-09-30T14:00',
            temperature_2m: 24.5,
            relative_humidity_2m: 68,
            wind_speed_10m: 13.2,
            surface_pressure: 1014.6,
            precipitation: 0,
            weather_code: 2,
          },
          daily,
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.current).toMatchObject({
      temperatureCelsius: 24.5,
      weatherCode: 2,
      humidity: 68,
    });
    expect(result.days).toHaveLength(5);
    expect(result.days[0]).toMatchObject({
      date: '2026-09-30',
      maximumCelsius: 25,
      minimumCelsius: 17,
      precipitationProbability: 0,
    });
    const requestUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestUrl.searchParams.get('latitude')).toBe('-23.55');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
  });

  it.each([
    { current: undefined, daily },
    {
      current: { time: '2026-09-30T14:00', temperature_2m: 24, weather_code: 2 },
      daily: undefined,
    },
  ])('throws for an incomplete response', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('throws when required daily arrays have different lengths', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: { time: '2026-09-30T14:00', temperature_2m: 24, weather_code: 2 },
            daily: { ...daily, weather_code: [2] },
          }),
        ),
      ),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('throws for invalid forecast JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{invalid')));

    await expect(getWeather(city)).rejects.toMatchObject({
      message: 'Forecast response is not valid JSON.',
    });
  });

  it('throws for a forecast HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));

    await expect(getWeather(city)).rejects.toMatchObject({
      message: 'Forecast request failed with status 500.',
      status: 500,
    });
  });

  it('preserves valid forecast data when optional fields are absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {
              time: '2026-09-30T14:00',
              temperature_2m: 24,
              weather_code: 1,
            },
            daily: {
              time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
              weather_code: [1, 2, 3, 61, 80],
              temperature_2m_max: [25, 23, 24, 26, 25],
              temperature_2m_min: [17, 18, 17, 16, 18],
            },
          }),
        ),
      ),
    );

    const result = await getWeather(city);

    expect(result.timezone).toBe(city.timezone);
    expect(result.current).toMatchObject({
      humidity: undefined,
      windSpeed: undefined,
      pressure: undefined,
      precipitation: undefined,
    });
    expect(result.days[0].precipitationProbability).toBe(0);
  });

  it('converts a request timeout into a user-facing service error', async () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(
          (_url: string, options?: { signal?: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              options?.signal?.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        ),
      );

      const request = expect(getWeather(city)).rejects.toMatchObject({
        message: 'A requisição demorou demais.',
      });
      await vi.advanceTimersByTimeAsync(10_000);

      await request;
    } finally {
      vi.useRealTimers();
    }
  });
});
