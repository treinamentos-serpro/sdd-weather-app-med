import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const city: City = {
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

const current: CurrentWeatherData = {
  time: '2026-09-30T14:00',
  temperatureCelsius: 0,
  weatherCode: 0,
};

function WeatherWithUnit() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle onChange={setUnit} unit={unit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('unit conversion in the UI', () => {
  it('updates the displayed temperature when Fahrenheit is selected', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnit />);

    expect(screen.getByText('0°C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });
});
