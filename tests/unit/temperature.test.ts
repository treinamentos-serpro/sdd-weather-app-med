import { describe, expect, it } from 'vitest';

import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature utilities', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converts %d°C to %d°F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('returns the value unchanged for Celsius', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
  });

  it('rounds only the displayed temperature and adds the unit symbol', () => {
    expect(formatTemperature(21.6, 'celsius')).toBe('22°C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32°F');
  });

  it('returns the label for each unit', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
