import { expect, type Page, test } from '@playwright/test';

const forecastResponse = {
  timezone: 'Europe/Lisbon',
  current: {
    time: '2026-09-30T14:00',
    temperature_2m: 0,
    relative_humidity_2m: 70,
    wind_speed_10m: 12,
    surface_pressure: 1015,
    precipitation: 0,
    weather_code: 1,
  },
  daily: {
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    weather_code: [1, 2, 3, 61, 80],
    temperature_2m_max: [10, 11, 12, 13, 14],
    temperature_2m_min: [2, 3, 4, 5, 6],
    precipitation_probability_max: [10, 20, 30, 40, 50],
  },
};

async function mockWeatherApi(
  page: Page,
  geocodingBody: object = {
    results: [
      {
        id: 1,
        name: 'Lisboa',
        country: 'Portugal',
        admin1: 'Lisboa',
        latitude: 38.72,
        longitude: -9.14,
        timezone: 'Europe/Lisbon',
      },
    ],
  },
) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(geocodingBody),
      status: 200,
    }),
  );
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(forecastResponse),
      status: 200,
    }),
  );
}

async function searchForCity(page: Page) {
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
}

test('busca uma cidade, exibe a previsão e alterna para Fahrenheit', async ({ page }) => {
  await mockWeatherApi(page);
  await page.goto('/');

  await searchForCity(page);

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('0°C', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('32°F', { exact: true })).toBeVisible();
});

test('exibe estado vazio quando o geocoding não retorna results', async ({ page }) => {
  await mockWeatherApi(page, {});
  await page.goto('/');

  await searchForCity(page);

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('mantém o fluxo principal funcional em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherApi(page);
  await page.goto('/');

  await searchForCity(page);

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('0°C', { exact: true })).toBeVisible();
});
