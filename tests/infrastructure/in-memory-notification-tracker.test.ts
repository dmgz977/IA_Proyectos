import { InMemoryNotificationTracker } from '../../src/infrastructure/tracking/in-memory-notification-tracker';

describe('InMemoryNotificationTracker', () => {
  test('test_should_return_false_when_event_has_not_been_notified', () => {
    const tracker = new InMemoryNotificationTracker();
    expect(tracker.hasBeenNotified('evt-1')).toBe(false);
  });

  test('test_should_return_true_when_event_has_been_marked', () => {
    const tracker = new InMemoryNotificationTracker();
    tracker.markAsNotified('evt-1');
    expect(tracker.hasBeenNotified('evt-1')).toBe(true);
  });

  test('test_should_track_multiple_events_independently', () => {
    const tracker = new InMemoryNotificationTracker();
    tracker.markAsNotified('evt-1');
    expect(tracker.hasBeenNotified('evt-1')).toBe(true);
    expect(tracker.hasBeenNotified('evt-2')).toBe(false);
  });

  test('test_should_not_duplicate_entry_when_same_event_marked_twice', () => {
    const tracker = new InMemoryNotificationTracker();
    tracker.markAsNotified('evt-1');
    tracker.markAsNotified('evt-1');
    expect(tracker.hasBeenNotified('evt-1')).toBe(true);
  });
});
