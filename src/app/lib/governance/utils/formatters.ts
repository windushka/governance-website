import BigNumber from 'bignumber.js';

export const formatPercentageCompact = (value: BigNumber): string => {
  return `${value.decimalPlaces() ? value.toFixed(2) : value.toFixed()}%`;
}

export const formatDateTimeCompact = (value: Date): string => {
  const now = new Date();
  const isToday = now.getFullYear() === value.getFullYear()
    && now.getMonth() === value.getMonth()
    && now.getDate() === value.getDate();

  const formatter = new Intl.DateTimeFormat('en', {
    year: now.getFullYear() !== value.getFullYear() ? '2-digit' : undefined,
    month: !isToday ? '2-digit' : undefined,
    day: !isToday ? '2-digit' : undefined,
    hour: '2-digit',
    minute: '2-digit',
    formatMatcher: 'best fit',
  });
  return formatter.format(value);
}

const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  formatMatcher: 'best fit',
});

export const formatDateTime = (value: Date): string => {
  return dateTimeFormatter.format(value);
}