import { useEffect, useRef, useState } from 'react';

import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { kind: 'search'; name: string } | { kind: 'forecast'; city: City } | null;

interface WeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const lastOperation = useRef<LastOperation>(null);
  const activeController = useRef<AbortController | null>(null);
  const requestId = useRef(0);

  function beginRequest() {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    requestId.current += 1;
    return { controller, id: requestId.current };
  }

  function isCurrentRequest(id: number): boolean {
    return id === requestId.current;
  }

  function getErrorMessage(error: unknown): string {
    return error instanceof WeatherServiceError
      ? error.message
      : 'Não foi possível consultar o clima agora.';
  }

  async function search(name: string) {
    const query = name.trim();
    if (!query) {
      return;
    }

    lastOperation.current = { kind: 'search', name: query };
    const { controller, id } = beginRequest();
    setState((current) => ({
      ...current,
      status: 'loading',
      cities: [],
      data: null,
      error: null,
      query,
    }));

    try {
      const results = await searchCities(query, controller.signal);
      if (!isCurrentRequest(id)) {
        return;
      }

      setState((current) => ({ ...current, cities: results }));
      if (results.length === 0) {
        setState((current) => ({ ...current, status: 'empty' }));
        return;
      }

      const data = await getWeather(results[0], controller.signal);
      if (!isCurrentRequest(id)) {
        return;
      }

      setState((current) => ({ ...current, data, status: 'success', error: null }));
    } catch (error) {
      if (!isCurrentRequest(id)) {
        return;
      }

      setState((current) => ({
        ...current,
        error: getErrorMessage(error),
        status: 'error',
      }));
    }
  }

  async function selectCity(city: City) {
    lastOperation.current = { kind: 'forecast', city };
    const { controller, id } = beginRequest();
    setState((current) => ({ ...current, error: null, status: 'loading' }));

    try {
      const data = await getWeather(city, controller.signal);
      if (!isCurrentRequest(id)) {
        return;
      }

      setState((current) => ({ ...current, data, status: 'success', error: null }));
    } catch (error) {
      if (!isCurrentRequest(id)) {
        return;
      }

      setState((current) => ({
        ...current,
        error: getErrorMessage(error),
        status: 'error',
      }));
    }
  }

  function retry() {
    const operation = lastOperation.current;
    if (!operation) {
      return;
    }

    if (operation.kind === 'search') {
      void search(operation.name);
      return;
    }

    void selectCity(operation.city);
  }

  useEffect(() => {
    return () => {
      requestId.current += 1;
      activeController.current?.abort();
    };
  }, []);

  return {
    ...state,
    search,
    selectCity,
    retry,
  };
}
