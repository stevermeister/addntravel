export const getSeasonFromDate = (date) => {
  const month = date.getMonth();
  
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
};

export const getSeasonFromDateRange = (startDate, endDate) => {
  const startSeason = getSeasonFromDate(startDate);
  const endSeason = getSeasonFromDate(endDate);
  
  return startSeason === endSeason ? startSeason : [startSeason, endSeason];
};
