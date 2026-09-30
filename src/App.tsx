import { useEffect, useRef, useState } from 'react';

import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { data, error, retry, search, status } = useWeather();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === 'success') {
      mainRef.current?.focus();
    }
  }, [status]);

  function renderContent() {
    switch (status) {
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
          <ErrorState message={error ?? 'Não foi possível consultar o clima.'} onRetry={retry} />
        );
      case 'success':
        return data ? (
          <div className="space-y-8">
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList days={data.days} timezone={data.timezone} unit={unit} />
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
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-night-800 focus:px-4 focus:py-3 focus:text-white focus:ring-2 focus:ring-accent-400"
        href="#main-content"
      >
        Ir para o conteúdo principal
      </a>
      <header className="border-b border-white/10 bg-night-900/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold tracking-tight text-white">
              <a href="/">WeatherView</a>
            </h1>
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
          <SearchBar disabled={status === 'loading'} onSearch={search} />
        </div>
      </header>

      <main
        aria-busy={status === 'loading'}
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        {status === 'success' && data && (
          <div aria-live="polite" className="sr-only">
            Previsão carregada para {data.city.name}.
          </div>
        )}
        {renderContent()}
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <p className="border-t border-white/10 pt-5 text-sm text-white/70">
          Dados meteorológicos por{' '}
          <a
            className="text-accent-400 underline decoration-accent-400/50 underline-offset-4 hover:text-accent-300"
            aria-label="Open-Meteo, abre em uma nova aba"
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
