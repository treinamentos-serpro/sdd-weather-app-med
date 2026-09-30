import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class MockWeatherServiceError extends Error {},
}));

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

const cityA: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  latitude: 38.72,
  longitude: -9.14,
};

const cityB: City = {
  id: 2,
  name: 'Porto',
  country: 'Portugal',
  latitude: 41.15,
  longitude: -8.61,
};

function weatherFor(city: City): WeatherData {
  return {
    city,
    timezone: 'Europe/Lisbon',
    current: {
      time: '2026-09-30T14:00',
      temperatureCelsius: 20,
      weatherCode: 1,
    },
    days: [],
  };
}

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retries the last failed search once and reaches success', async () => {
    searchCitiesMock
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([cityA]);
    getWeatherMock.mockResolvedValue(weatherFor(cityA));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Falha de rede.');

    act(() => {
      result.current.retry();
    });
    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(getWeatherMock).toHaveBeenCalledWith(cityA, expect.any(AbortSignal));
    expect(result.current.data?.city).toEqual(cityA);
  });

  it('shows a friendly offline message and retries the last search', async () => {
    searchCitiesMock.mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce([cityA]);
    getWeatherMock.mockResolvedValue(weatherFor(cityA));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
    );

    act(() => {
      result.current.retry();
    });
    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(result.current.data?.city).toEqual(cityA);
  });

  it('keeps the newest result when an older search resolves later', async () => {
    let resolveFirstSearch: ((cities: City[]) => void) | undefined;
    searchCitiesMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstSearch = resolve;
          }),
      )
      .mockResolvedValueOnce([cityB]);
    getWeatherMock.mockResolvedValue(weatherFor(cityB));

    const { result } = renderHook(() => useWeather());

    act(() => {
      void result.current.search('Lisboa');
      void result.current.search('Porto');
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data?.city).toEqual(cityB);

    await act(async () => {
      resolveFirstSearch?.([cityA]);
      await Promise.resolve();
    });

    expect(result.current.data?.city).toEqual(cityB);
    expect(result.current.query).toBe('Porto');
  });

  it('aborts the active request when the hook unmounts', async () => {
    let requestSignal: AbortSignal | undefined;
    searchCitiesMock.mockImplementation((_name, signal) => {
      requestSignal = signal;
      return new Promise(() => {});
    });

    const { result, unmount } = renderHook(() => useWeather());

    act(() => {
      void result.current.search('Lisboa');
    });
    await waitFor(() => expect(requestSignal).toBeDefined());

    unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
