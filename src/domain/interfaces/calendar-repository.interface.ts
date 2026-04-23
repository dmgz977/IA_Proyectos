import { CalendarEvent } from '../entities/calendar-event';

export interface ICalendarRepository {
  getUpcomingEvents(lookaheadHours: number): Promise<CalendarEvent[]>;
}
