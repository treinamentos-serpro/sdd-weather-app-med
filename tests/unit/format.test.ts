import { describe, expect, it } from 'vitest';

import { formatForecastDay, getShortDate } from '../../src/lib/format';

describe('date formatting utilities', () => {
  it('labels the first forecast day as Hoje', () => {
    expect(formatForecastDay('2026-09-30', 0, 'America/Sao_Paulo')).toBe('Hoje');
  });

  it('labels the second forecast day as Amanhã', () => {
    expect(formatForecastDay('2026-10-01', 1, 'America/Sao_Paulo')).toBe('Amanhã');
  });

  it('uses the weekday for subsequent forecast days', () => {
    expect(formatForecastDay('2026-10-02', 2, 'America/Sao_Paulo')).toMatch(/sex/i);
  });

  it('formats a date as a short day/month value', () => {
    expect(getShortDate('2026-09-30', 'America/Sao_Paulo')).toBe('30/09');
  });
});
