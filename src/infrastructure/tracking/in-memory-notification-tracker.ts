import { INotificationTracker } from '../../domain/interfaces/notification-tracker.interface';

export class InMemoryNotificationTracker implements INotificationTracker {
  private readonly notified = new Set<string>();

  hasBeenNotified(eventId: string): boolean {
    return this.notified.has(eventId);
  }

  markAsNotified(eventId: string): void {
    this.notified.add(eventId);
  }
}
