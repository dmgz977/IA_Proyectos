import { DateTime } from 'luxon';

export function formatTimeInZone(date: Date, timezone: string): string {
  return DateTime.fromJSDate(date).setZone(timezone).toFormat('HH:mm');
}

export function toZonedDateTime(date: Date, timezone: string): DateTime {
  return DateTime.fromJSDate(date).setZone(timezone);
}
