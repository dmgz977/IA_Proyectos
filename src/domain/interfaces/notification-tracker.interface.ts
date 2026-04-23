export interface INotificationTracker {
  hasBeenNotified(eventId: string): boolean;
  markAsNotified(eventId: string): void;
}
