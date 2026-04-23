import { RunSchedulerCycle } from '../../src/application/use-cases/run-scheduler-cycle';
import { FetchUpcomingEvents } from '../../src/application/use-cases/fetch-upcoming-events';
import { EvaluatePendingNotifications } from '../../src/application/use-cases/evaluate-pending-notifications';
import { FormatNotificationMessage } from '../../src/application/use-cases/format-notification-message';
import { SendWhatsAppNotification } from '../../src/application/use-cases/send-whatsapp-notification';
import { CalendarEvent } from '../../src/domain/entities/calendar-event';
import { INotificationTracker } from '../../src/domain/interfaces/notification-tracker.interface';
import { ILogger } from '../../src/domain/interfaces/logger.interface';
import { AppConfig } from '../../src/shared/config';

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
const mockTracker: INotificationTracker = { hasBeenNotified: jest.fn().mockReturnValue(false), markAsNotified: jest.fn() };

const makeEvent = (): CalendarEvent =>
  new CalendarEvent('evt-1', 'Reunión', new Date(Date.now() + 10 * 60_000), null, []);

describe('RunSchedulerCycle', () => {
  test('test_should_complete_cycle_without_throwing_when_all_succeeds', async () => {
    const event = makeEvent();
    const fetchEvents = { execute: jest.fn().mockResolvedValue([event]) } as unknown as FetchUpcomingEvents;
    const evaluateNotifs = { execute: jest.fn().mockReturnValue([event]) } as unknown as EvaluatePendingNotifications;
    const formatMsg = { execute: jest.fn().mockReturnValue('mensaje') } as unknown as FormatNotificationMessage;
    const sendNotif = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as SendWhatsAppNotification;

    const cycle = new RunSchedulerCycle(fetchEvents, evaluateNotifs, formatMsg, sendNotif, mockTracker, mockLogger, mockConfig);
    await expect(cycle.execute()).resolves.not.toThrow();
    expect(sendNotif.execute).toHaveBeenCalledWith('mensaje');
    expect(mockTracker.markAsNotified).toHaveBeenCalledWith('evt-1');
  });

  test('test_should_not_throw_when_calendar_fetch_fails', async () => {
    const fetchEvents = { execute: jest.fn().mockRejectedValue(new Error('API down')) } as unknown as FetchUpcomingEvents;
    const evaluateNotifs = { execute: jest.fn() } as unknown as EvaluatePendingNotifications;
    const formatMsg = { execute: jest.fn() } as unknown as FormatNotificationMessage;
    const sendNotif = { execute: jest.fn() } as unknown as SendWhatsAppNotification;

    const cycle = new RunSchedulerCycle(fetchEvents, evaluateNotifs, formatMsg, sendNotif, mockTracker, mockLogger, mockConfig);
    await expect(cycle.execute()).resolves.not.toThrow();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test('test_should_continue_with_next_event_when_send_fails_for_one', async () => {
    const event1 = new CalendarEvent('evt-1', 'R1', new Date(Date.now() + 10 * 60_000), null, []);
    const event2 = new CalendarEvent('evt-2', 'R2', new Date(Date.now() + 12 * 60_000), null, []);
    const fetchEvents = { execute: jest.fn().mockResolvedValue([event1, event2]) } as unknown as FetchUpcomingEvents;
    const evaluateNotifs = { execute: jest.fn().mockReturnValue([event1, event2]) } as unknown as EvaluatePendingNotifications;
    const formatMsg = { execute: jest.fn().mockReturnValue('msg') } as unknown as FormatNotificationMessage;
    const sendNotif = {
      execute: jest.fn()
        .mockRejectedValueOnce(new Error('WA error'))
        .mockResolvedValueOnce(undefined),
    } as unknown as SendWhatsAppNotification;

    const cycle = new RunSchedulerCycle(fetchEvents, evaluateNotifs, formatMsg, sendNotif, mockTracker, mockLogger, mockConfig);
    await cycle.execute();
    expect(sendNotif.execute).toHaveBeenCalledTimes(2);
    expect(mockTracker.markAsNotified).toHaveBeenCalledWith('evt-2');
  });
});
