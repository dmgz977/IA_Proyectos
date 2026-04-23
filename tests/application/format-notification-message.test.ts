import { FormatNotificationMessage } from '../../src/application/use-cases/format-notification-message';
import { CalendarEvent } from '../../src/domain/entities/calendar-event';

const makeEvent = (location: string | null, attendees: string[]): CalendarEvent =>
  new CalendarEvent('evt-1', 'Reunión de producto', new Date('2026-04-22T20:00:00Z'), location, attendees);

describe('FormatNotificationMessage', () => {
  const useCase = new FormatNotificationMessage();

  test('test_should_include_event_title_in_message', () => {
    const event = makeEvent('Sala A', ['ana@empresa.com']);
    const msg = useCase.execute(event, 15, 'America/Bogota');
    expect(msg).toContain('Reunión de producto');
  });

  test('test_should_show_sin_ubicacion_when_location_is_null', () => {
    const event = makeEvent(null, ['ana@empresa.com']);
    const msg = useCase.execute(event, 15, 'America/Bogota');
    expect(msg).toContain('Sin ubicación');
  });

  test('test_should_show_solo_tu_when_attendees_is_empty', () => {
    const event = makeEvent('Sala A', []);
    const msg = useCase.execute(event, 15, 'America/Bogota');
    expect(msg).toContain('Solo tú');
  });

  test('test_should_show_bogota_time_in_message', () => {
    // UTC 20:00 = Bogotá 15:00
    const event = makeEvent('Sala A', []);
    const msg = useCase.execute(event, 15, 'America/Bogota');
    expect(msg).toContain('15:00');
  });

  test('test_should_include_minutes_until_start_in_message', () => {
    const event = makeEvent('Sala A', []);
    const msg = useCase.execute(event, 10, 'America/Bogota');
    expect(msg).toContain('10 minutos');
  });

  test('test_should_use_singular_minuto_when_one_minute_remaining', () => {
    const event = makeEvent('Sala A', []);
    const msg = useCase.execute(event, 1, 'America/Bogota');
    expect(msg).toContain('1 minuto');
    expect(msg).not.toContain('1 minutos');
  });
});
