import { EvaluatePendingNotifications } from '../../src/application/use-cases/evaluate-pending-notifications';
import { CalendarEvent } from '../../src/domain/entities/calendar-event';
import { INotificationTracker } from '../../src/domain/interfaces/notification-tracker.interface';

const makeEvent = (id: string, startTime: Date): CalendarEvent =>
  new CalendarEvent(id, 'Reunión', startTime, null, []);

const makeTracker = (notifiedIds: string[] = []): INotificationTracker => ({
  hasBeenNotified: jest.fn((id) => notifiedIds.includes(id)),
  markAsNotified: jest.fn(),
});

describe('EvaluatePendingNotifications', () => {
  test('test_should_return_event_when_within_reminder_window_and_not_notified', () => {
    const now = new Date('2026-04-22T14:45:00Z');
    const event = makeEvent('evt-1', new Date('2026-04-22T15:00:00Z')); // 15 min
    const useCase = new EvaluatePendingNotifications(makeTracker());
    expect(useCase.execute([event], 15, now)).toHaveLength(1);
  });

  test('test_should_return_empty_when_event_already_notified', () => {
    const now = new Date('2026-04-22T14:45:00Z');
    const event = makeEvent('evt-1', new Date('2026-04-22T15:00:00Z'));
    const useCase = new EvaluatePendingNotifications(makeTracker(['evt-1']));
    expect(useCase.execute([event], 15, now)).toHaveLength(0);
  });

  test('test_should_return_empty_when_event_is_outside_reminder_window', () => {
    const now = new Date('2026-04-22T14:00:00Z');
    const event = makeEvent('evt-1', new Date('2026-04-22T15:00:00Z')); // 60 min
    const useCase = new EvaluatePendingNotifications(makeTracker());
    expect(useCase.execute([event], 15, now)).toHaveLength(0);
  });

  test('test_should_return_empty_when_event_already_started', () => {
    const now = new Date('2026-04-22T15:05:00Z');
    const event = makeEvent('evt-1', new Date('2026-04-22T15:00:00Z')); // -5 min
    const useCase = new EvaluatePendingNotifications(makeTracker());
    expect(useCase.execute([event], 15, now)).toHaveLength(0);
  });
});
