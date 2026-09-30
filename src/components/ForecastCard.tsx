import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  timezone?: string;
}

export default function ForecastCard({ day, unit, timezone }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const precipitation =
    day.precipitationProbability === undefined || !Number.isFinite(day.precipitationProbability)
      ? '—'
      : `${day.precipitationProbability}%`;

  return (
    <article className="flex min-h-48 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md">
      <h3 className="text-sm font-semibold capitalize text-white">
        {formatDayLabel(day.date, timezone)}
      </h3>
      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <span
          aria-label={`Ícone: ${condition.label}`}
          className="text-4xl leading-none"
          data-weather-icon={condition.icon}
          role="img"
        >
          {condition.symbol}
        </span>
        <p className="text-sm text-white/70">{condition.label}</p>
      </div>
      <div className="mt-4 flex flex-col items-center justify-center gap-1 text-sm sm:flex-row sm:gap-3">
        <span className="font-semibold text-white">
          Máx. {formatTemperature(day.maximumCelsius, unit)}
        </span>
        <span className="text-white/75">Mín. {formatTemperature(day.minimumCelsius, unit)}</span>
      </div>
      <p className="mt-3 text-center text-xs text-white/75">
        Chuva: <span className="font-medium text-white/80">{precipitation}</span>
      </p>
    </article>
  );
}
