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
