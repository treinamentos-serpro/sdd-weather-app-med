import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | undefined, suffix: string): string {
  return value === undefined || !Number.isFinite(value) ? '—' : `${value} ${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-white/75">Agora em</p>
          <h2 className="mt-1 text-2xl font-semibold text-white" id="current-weather-title">
            {city.name}
          </h2>
          {(city.region || city.country) && (
            <p className="mt-1 text-sm text-white/75">
              {[city.region, city.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span
            aria-label={`Ícone: ${condition.label}`}
            className="text-5xl leading-none"
            data-weather-icon={condition.icon}
            role="img"
          >
            {condition.symbol}
          </span>
          <div>
            <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
              {formatTemperature(current.temperatureCelsius, unit)}
            </p>
            <p className="mt-1 text-base text-white/70">{condition.label}</p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-white/75">Umidade</dt>
          <dd className="mt-1 font-semibold text-white">{formatMetric(current.humidity, '%')}</dd>
        </div>
        <div>
          <dt className="text-sm text-white/75">Vento</dt>
          <dd className="mt-1 font-semibold text-white">
            {formatMetric(current.windSpeed, 'km/h')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/75">Precipitação</dt>
          <dd className="mt-1 font-semibold text-white">
            {formatMetric(current.precipitation, 'mm')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/75">Pressão</dt>
          <dd className="mt-1 font-semibold text-white">{formatMetric(current.pressure, 'hPa')}</dd>
        </div>
      </dl>
    </section>
  );
}
