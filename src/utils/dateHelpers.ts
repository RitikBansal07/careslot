/**
 * Generates ISO date strings (YYYY-MM-DD) relative to today.
 * Ensures demo slots are dynamically valid indefinitely.
 */
export function getRelativeDateString(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDisplayDate(dateStr: string): string {
  const todayStr = getRelativeDateString(0);
  const tomorrowStr = getRelativeDateString(1);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';

  const date = parseDateString(dateStr);
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];
  return `${dayName}, ${monthName} ${date.getDate()}`;
}

export function formatShortDay(dateStr: string): { dayName: string; dayNumber: number; monthName: string; isToday: boolean } {
  const date = parseDateString(dateStr);
  const todayStr = getRelativeDateString(0);
  return {
    dayName: DAY_NAMES[date.getDay()],
    dayNumber: date.getDate(),
    monthName: MONTH_NAMES[date.getMonth()],
    isToday: dateStr === todayStr,
  };
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

/**
 * Returns the next 7 days in YYYY-MM-DD format.
 */
export function getNextSevenDays(): string[] {
  return Array.from({ length: 7 }, (_, i) => getRelativeDateString(i));
}

