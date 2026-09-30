export interface WeatherCondition {
  label: string;
  icon: string;
}

const weatherConditions: Record<number, WeatherCondition> = {
  0: { label: 'Céu limpo', icon: 'clear' },
  1: { label: 'Principalmente limpo', icon: 'mostly-clear' },
  2: { label: 'Parcialmente nublado', icon: 'partly-cloudy' },
  3: { label: 'Nublado', icon: 'cloudy' },
  45: { label: 'Nevoeiro', icon: 'fog' },
  48: { label: 'Nevoeiro', icon: 'fog' },
  51: { label: 'Chuvisco', icon: 'drizzle' },
  53: { label: 'Chuvisco', icon: 'drizzle' },
  55: { label: 'Chuvisco', icon: 'drizzle' },
  56: { label: 'Chuvisco congelante', icon: 'freezing-drizzle' },
  57: { label: 'Chuvisco congelante', icon: 'freezing-drizzle' },
  61: { label: 'Chuva', icon: 'rain' },
  63: { label: 'Chuva', icon: 'rain' },
  65: { label: 'Chuva', icon: 'rain' },
  66: { label: 'Chuva congelante', icon: 'freezing-rain' },
  67: { label: 'Chuva congelante', icon: 'freezing-rain' },
  71: { label: 'Neve', icon: 'snow' },
  73: { label: 'Neve', icon: 'snow' },
  75: { label: 'Neve', icon: 'snow' },
  77: { label: 'Neve', icon: 'snow' },
  80: { label: 'Pancadas de chuva', icon: 'rain-showers' },
  81: { label: 'Pancadas de chuva', icon: 'rain-showers' },
  82: { label: 'Pancadas de chuva', icon: 'rain-showers' },
  85: { label: 'Pancadas de neve', icon: 'snow-showers' },
  86: { label: 'Pancadas de neve', icon: 'snow-showers' },
  95: { label: 'Trovoada', icon: 'thunderstorm' },
  96: { label: 'Trovoada com granizo', icon: 'thunderstorm-hail' },
  99: { label: 'Trovoada com granizo', icon: 'thunderstorm-hail' },
};

export function getWeatherCondition(weatherCode: number): WeatherCondition {
  return (
    weatherConditions[weatherCode] ?? {
      label: 'Condição não disponível',
      icon: 'unknown',
    }
  );
}
