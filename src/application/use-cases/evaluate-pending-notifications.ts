import { CalendarEvent } from '../../domain/entities/calendar-event';
import { INotificationTracker } from '../../domain/interfaces/notification-tracker.interface';

export class EvaluatePendingNotifications {
  constructor(private readonly tracker: INotificationTracker) {}

  execute(events: CalendarEvent[], reminderMinutes: number, now: Date): CalendarEvent[] {
    return events.filter((event) => {
      const minutes = event.minutesUntilStart(now);
      const withinWindow = minutes >= 0 && minutes <= reminderMinutes;
      const notYetNotified = !this.tracker.hasBeenNotified(event.id);
      return withinWindow && notYetNotified;
    });
  }
}
