import { GoogleCalendarAdapter } from '../../src/infrastructure/google-calendar/google-calendar.adapter';
import { AppConfig } from '../../src/shared/config';
import { ILogger } from '../../src/domain/interfaces/logger.interface';

// Mock del SDK de Google para no hacer llamadas reales en tests
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
      })),
    },
    calendar: jest.fn().mockReturnValue({
      events: {
        list: jest.fn(),
      },
    }),
  },
}));

import { google } from 'googleapis';

const mockConfig: AppConfig = {
  scanIntervalMinutes: 15,
  reminderMinutesBefore: 15,
  lookaheadHours: 2,
  googleCalendarId: 'primary',
  timezone: 'America/Bogota',
  whatsappSessionPath: './session',
  googleClientId: 'id',
  googleClientSecret: 'secret',
  googleRefreshToken: 'token',
};

const mockLogger: ILogger = { info: jest.fn(), error: jest.fn() };

describe('GoogleCalendarAdapter', () => {
  test('test_should_return_calendar_events_when_api_returns_items', async () => {
    const mockList = (google.calendar({} as never) as never as { events: { list: jest.Mock } }).events.list;
    mockList.mockResolvedValue({
      data: {
        items: [
          {
            id: 'evt-1',
            summary: 'Reunión importante',
            start: { dateTime: '2026-04-22T15:00:00Z' },
            location: 'Sala A',
            attendees: [{ displayName: 'Ana', email: 'ana@empresa.com' }],
          },
        ],
      },
    });

    const adapter = new GoogleCalendarAdapter(mockConfig, mockLogger);
    const events = await adapter.getUpcomingEvents(2);

    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Reunión importante');
    expect(events[0].location).toBe('Sala A');
    expect(events[0].attendees).toContain('Ana');
  });

  test('test_should_return_empty_array_when_api_returns_no_items', async () => {
    const mockList = (google.calendar({} as never) as never as { events: { list: jest.Mock } }).events.list;
    mockList.mockResolvedValue({ data: { items: [] } });

    const adapter = new GoogleCalendarAdapter(mockConfig, mockLogger);
    const events = await adapter.getUpcomingEvents(2);
    expect(events).toHaveLength(0);
  });
});
