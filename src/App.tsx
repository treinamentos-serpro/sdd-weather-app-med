import { useEffect, useRef, useState } from 'react';

import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import type { Unit, WeatherData } from './types/weather';
import { mockWeatherData } from './types/weather';

type ViewState = 'idle' | 'loading' | 'empty' | 'error' | 'success';

const mockResponseDelay = 350;

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const requestId = useRef(0);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (responseTimer.current !== null) {
        clearTimeout(responseTimer.current);
      }
    };
  }, []);

  function handleSearch(city: string) {
    const query = city.trim();
    if (!query) {
      return;
    }

    requestId.current += 1;
    const currentRequestId = requestId.current;
    setLastQuery(query);
    setViewState('loading');
    setWeather(null);

    if (responseTimer.current !== null) {
      clearTimeout(responseTimer.current);
    }

    responseTimer.current = setTimeout(() => {
      if (currentRequestId !== requestId.current) {
        return;
      }

      const normalizedQuery = query.toLocaleLowerCase('pt-BR');
      if (normalizedQuery === 'erro') {
        setViewState('error');
        return;
      }

      if (normalizedQuery === 'vazio') {
        setViewState('empty');
        return;
      }

      setWeather({
        ...mockWeatherData,
        city: {
          ...mockWeatherData.city,
          name: query,
        },
      });
      setViewState('success');
    }, mockResponseDelay);
  }

  function renderContent() {
    switch (viewState) {
      case 'loading':
        return <LoadingState />;
      case 'empty':
        return (
          <EmptyState
            hint="Revise a grafia ou tente buscar por outra cidade."
            title="Nenhuma cidade encontrada"
          />
        );
      case 'error':
        return (
          <ErrorState
            message="Não foi possível consultar os dados agora. Tente novamente."
            onRetry={() => handleSearch(lastQuery)}
          />
        );
      case 'success':
        return weather ? (
          <div className="space-y-8">
            <CurrentWeather city={weather.city} current={weather.current} unit={unit} />
            <ForecastList days={weather.days} timezone={weather.timezone} unit={unit} />
          </div>
        ) : null;
      case 'idle':
        return (
          <EmptyState
            hint="Digite uma cidade acima para visualizar as condições atuais e a previsão."
            title="Consulte a previsão do tempo"
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold tracking-tight text-white">
              <a href="/">WeatherView</a>
            </h1>
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
          <SearchBar disabled={viewState === 'loading'} onSearch={handleSearch} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{renderContent()}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <p className="border-t border-white/10 pt-5 text-sm text-white/70">
          Dados meteorológicos por{' '}
          <a
            className="text-accent-400 underline decoration-accent-400/50 underline-offset-4 hover:text-accent-300"
            href="https://open-meteo.com/"
            rel="noreferrer"
            target="_blank"
          >
            Open-Meteo
          </a>
        </p>
      </footer>
    </div>
  );
}
