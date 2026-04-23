import { formatTimeInZone, toZonedDateTime } from '../../src/shared/timezone.utils';

describe('timezone.utils', () => {
  test('test_should_format_utc_time_in_bogota_timezone', () => {
    // UTC 20:00 = Bogotá 15:00 (UTC-5)
    const date = new Date('2026-04-22T20:00:00Z');
    expect(formatTimeInZone(date, 'America/Bogota')).toBe('15:00');
  });

  test('test_should_return_zoned_datetime_with_correct_offset_when_bogota', () => {
    const date = new Date('2026-04-22T20:00:00Z');
    const zoned = toZonedDateTime(date, 'America/Bogota');
    expect(zoned.hour).toBe(15);
    expect(zoned.zoneName).toBe('America/Bogota');
  });

  test('test_should_handle_midnight_utc_correctly_in_bogota', () => {
    // UTC 00:00 = Bogotá 19:00 del día anterior
    const date = new Date('2026-04-22T00:00:00Z');
    expect(formatTimeInZone(date, 'America/Bogota')).toBe('19:00');
  });
});
