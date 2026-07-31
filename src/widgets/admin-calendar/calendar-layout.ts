export type CalendarView = 'day' | 'week';

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const HOUR_HEIGHT_PX = 72;
export const MINUTE_HEIGHT_PX = HOUR_HEIGHT_PX / 60;
export const DAY_START_MINUTES = DAY_START_HOUR * 60;
export const DAY_END_MINUTES = DAY_END_HOUR * 60;
export const DAY_TIMELINE_HEIGHT_PX =
  (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT_PX;
export const GRID_HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, index) => index + DAY_START_HOUR,
);

export function staffLaneColor(staffId: number): string {
  const hue = (staffId * 47) % 360;
  return `hsl(${hue} 65% 42%)`;
}

export function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}

export function zonedTimeToUtc(
  dateKey: string,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset = getTimezoneOffsetMs(timeZone, new Date(utcGuess));
  return new Date(utcGuess - offset);
}
