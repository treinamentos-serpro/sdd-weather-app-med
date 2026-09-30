/** Unidade de temperatura escolhida para a apresentação. */
export type Unit = 'celsius' | 'fahrenheit';

/** Localização retornada pelo geocoding e selecionada pelo usuário. */
export interface City {
  /** Identificador Open-Meteo, quando fornecido. */
  id?: number;
  /** Nome da cidade. */
  name: string;
  /** Nome do país, quando fornecido. */
  country?: string;
  /** Estado ou região derivado de `admin1`, quando fornecido. */
  region?: string;
  /** Latitude em graus decimais, entre -90 e 90. */
  latitude: number;
  /** Longitude em graus decimais, entre -180 e 180. */
  longitude: number;
  /** Identificador IANA do fuso horário, quando fornecido. */
  timezone?: string;
}

/** Condições atuais normalizadas a partir do objeto `current`. */
export interface CurrentWeather {
  /** Horário da medição em ISO 8601, no fuso retornado pela API. */
  time: string;
  /** Temperatura em Celsius; Fahrenheit é derivado na apresentação. */
  temperatureCelsius: number;
  /** Código meteorológico WMO. */
  weatherCode: number;
  /** Umidade relativa em percentual, quando disponível. */
  humidity?: number;
  /** Velocidade do vento em km/h, quando disponível. */
  windSpeed?: number;
  /** Pressão atmosférica em hPa, quando disponível. */
  pressure?: number;
  /** Precipitação acumulada em mm, quando disponível. */
  precipitation?: number;
}

/** Previsão diária normalizada a partir dos arrays `daily`. */
export interface ForecastDay {
  /** Data local do dia no formato ISO 8601 (`YYYY-MM-DD`). */
  date: string;
  /** Código meteorológico WMO do dia. */
  weatherCode: number;
  /** Temperatura mínima em Celsius. */
  minimumCelsius: number;
  /** Temperatura máxima em Celsius. */
  maximumCelsius: number;
  /** Probabilidade máxima de precipitação em percentual, quando disponível. */
  precipitationProbability?: number;
}

/** Conjunto de dados exibido para uma cidade selecionada. */
export interface WeatherData {
  /** Cidade à qual os dados pertencem. */
  city: City;
  /** Fuso horário usado para interpretar as datas, quando disponível. */
  timezone?: string;
  /** Condições meteorológicas atuais. */
  current: CurrentWeather;
  /** Exatamente cinco dias: hoje e os quatro dias seguintes. */
  days: ForecastDay[];
}

/** Dados determinísticos para desenvolver a interface sem consultar a API. */
export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    country: 'Brasil',
    region: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-30T14:00',
    temperatureCelsius: 24.5,
    weatherCode: 2,
    humidity: 68,
    windSpeed: 13.2,
    pressure: 1014.6,
    precipitation: 0,
  },
  days: [
    {
      date: '2026-09-30',
      weatherCode: 2,
      minimumCelsius: 17.4,
      maximumCelsius: 25.1,
      precipitationProbability: 20,
    },
    {
      date: '2026-10-01',
      weatherCode: 61,
      minimumCelsius: 18.1,
      maximumCelsius: 23.7,
      precipitationProbability: 65,
    },
    {
      date: '2026-10-02',
      weatherCode: 3,
      minimumCelsius: 17.8,
      maximumCelsius: 24.4,
      precipitationProbability: 35,
    },
    {
      date: '2026-10-03',
      weatherCode: 1,
      minimumCelsius: 16.9,
      maximumCelsius: 26.3,
      precipitationProbability: 15,
    },
    {
      date: '2026-10-04',
      weatherCode: 80,
      minimumCelsius: 18.5,
      maximumCelsius: 25.8,
      precipitationProbability: 55,
    },
  ],
};
