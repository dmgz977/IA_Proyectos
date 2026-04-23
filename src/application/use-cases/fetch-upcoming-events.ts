import { CalendarEvent } from '../../domain/entities/calendar-event';
import { ICalendarRepository } from '../../domain/interfaces/calendar-repository.interface';
import { ILogger } from '../../domain/interfaces/logger.interface';

export class FetchUpcomingEvents {
  constructor(
    private readonly repository: ICalendarRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(lookaheadHours: number): Promise<CalendarEvent[]> {
    const events = await this.repository.getUpcomingEvents(lookaheadHours);
    const notifiable = events.filter((e) => e.isNotifiable());
    this.logger.info(`[FetchUpcomingEvents] ${notifiable.length} eventos notificables encontrados`);
    return notifiable;
  }
}
