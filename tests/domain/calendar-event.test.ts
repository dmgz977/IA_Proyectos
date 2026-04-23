import { CalendarEvent } from '../../src/domain/entities/calendar-event';

const makeEvent = (overrides: Partial<ConstructorParameters<typeof CalendarEvent>[0]> & {
  id?: string; title?: string; startTime?: Date; location?: string | null; attendees?: string[];
} = {}): CalendarEvent =>
  new CalendarEvent(
    overrides.id ?? 'evt-1',
    overrides.title ?? 'Reunión de equipo',
    overrides.startTime ?? new Date('2026-04-22T15:00:00Z'),
    overrides.location !== undefined ? overrides.location : 'Sala A',
    overrides.attendees ?? ['juan@empresa.com'],
  );

describe('CalendarEvent', () => {
  test('test_should_be_notifiable_when_event_has_specific_time', () => {
    const event = makeEvent({ startTime: new Date('2026-04-22T15:00:00Z') });
    expect(event.isNotifiable()).toBe(true);
  });

  test('test_should_not_be_notifiable_when_event_is_all_day', () => {
    const event = makeEvent({ startTime: new Date('2026-04-22T00:00:00Z') });
    expect(event.isNotifiable()).toBe(false);
  });

  test('test_should_return_positive_minutes_when_event_is_in_future', () => {
    const start = new Date('2026-04-22T15:00:00Z');
    const now = new Date('2026-04-22T14:45:00Z');
    const event = makeEvent({ startTime: start });
    expect(event.minutesUntilStart(now)).toBe(15);
  });

  test('test_should_return_negative_minutes_when_event_already_started', () => {
    const start = new Date('2026-04-22T14:00:00Z');
    const now = new Date('2026-04-22T14:10:00Z');
    const event = makeEvent({ startTime: start });
    expect(event.minutesUntilStart(now)).toBe(-10);
  });

  test('test_should_display_location_when_location_is_set', () => {
    const event = makeEvent({ location: 'Sala Bogotá' });
    expect(event.displayLocation()).toBe('Sala Bogotá');
  });

  test('test_should_display_sin_ubicacion_when_location_is_null', () => {
    const event = makeEvent({ location: null });
    expect(event.displayLocation()).toBe('Sin ubicación');
  });

  test('test_should_display_attendees_when_list_is_not_empty', () => {
    const event = makeEvent({ attendees: ['ana@empresa.com', 'luis@empresa.com'] });
    expect(event.displayAttendees()).toBe('ana@empresa.com, luis@empresa.com');
  });

  test('test_should_display_solo_tu_when_attendees_list_is_empty', () => {
    const event = makeEvent({ attendees: [] });
    expect(event.displayAttendees()).toBe('Solo tú');
  });
});
