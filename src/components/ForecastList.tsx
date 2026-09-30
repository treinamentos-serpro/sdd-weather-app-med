import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: ForecastDay[];
  unit: Unit;
  timezone?: string;
}

export default function ForecastList({ days, unit, timezone }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title">
      <h2 className="text-xl font-semibold text-white" id="forecast-title">
        Previsão para os próximos dias
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {days.map((day) => (
          <ForecastCard day={day} key={day.date} timezone={timezone} unit={unit} />
        ))}
      </div>
    </section>
  );
}
