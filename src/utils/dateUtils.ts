export function getSeason(date: Date): string {
  const month = date.getMonth();
  
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

export function getDateRangeSeasons(startDate: Date, endDate: Date): string[] {
  const seasons = new Set<string>();
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    seasons.add(getSeason(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return Array.from(seasons);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return `${start} - ${end} (${days} days)`;
}
