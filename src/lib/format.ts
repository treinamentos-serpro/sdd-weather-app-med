export function formatDayLabel(date: string, timezone?: string): string {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data não disponível';
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      timeZone: timezone,
      weekday: 'short',
    })
      .format(parsedDate)
      .replace('.', '')
      .replace(/^./, (letter) => letter.toUpperCase());
  } catch {
    return 'Data não disponível';
  }
}

export function getShortDate(date: string, timezone?: string): string {
  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data não disponível';
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: timezone,
    }).format(parsedDate);
  } catch {
    return 'Data não disponível';
  }
}

export function formatForecastDay(date: string, index: number, timezone?: string): string {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  return formatDayLabel(date, timezone);
}
