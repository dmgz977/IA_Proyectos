import { Notification } from '../../src/domain/entities/notification';

describe('Notification', () => {
  test('test_should_have_null_sentAt_when_created', () => {
    const notif = new Notification('evt-1', 'mensaje', new Date());
    expect(notif.sentAt).toBeNull();
  });

  test('test_should_return_new_instance_with_sentAt_when_markSent_called', () => {
    const notif = new Notification('evt-1', 'mensaje', new Date());
    const sentAt = new Date('2026-04-22T15:00:00Z');
    const sent = notif.markSent(sentAt);
    expect(sent.sentAt).toEqual(sentAt);
    expect(sent.eventId).toBe(notif.eventId);
  });

  test('test_should_not_mutate_original_when_markSent_called', () => {
    const notif = new Notification('evt-1', 'mensaje', new Date());
    notif.markSent(new Date());
    expect(notif.sentAt).toBeNull();
  });
});
