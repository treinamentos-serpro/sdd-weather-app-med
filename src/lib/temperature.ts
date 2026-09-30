import type { Unit } from '../types/weather';

export function convertTemperature(valueCelsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (valueCelsius * 9) / 5 + 32 : valueCelsius;
}

export function formatTemperature(valueCelsius: number, unit: Unit): string {
  const value = Math.round(convertTemperature(valueCelsius, unit));
  return `${value}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}
