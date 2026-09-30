import { describe, expect, it } from 'vitest';

import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('weather code mapping', () => {
  it('maps a known WMO code to label, technical icon and visual symbol', () => {
    expect(getWeatherCondition(61)).toEqual({
      label: 'Chuva',
      icon: 'rain',
      symbol: '🌧️',
    });
  });

  it('returns the fallback for an unknown code', () => {
    expect(getWeatherCondition(999)).toEqual({
      label: 'Condição não disponível',
      icon: 'unknown',
      symbol: '🌡️',
    });
  });
});
