import { google } from 'googleapis';
import { CalendarEvent } from '../../domain/entities/calendar-event';
import { ICalendarRepository } from '../../domain/interfaces/calendar-repository.interface';
import { ILogger } from '../../domain/interfaces/logger.interface';
import { AppConfig } from '../../shared/config';

export class GoogleCalendarAdapter implements ICalendarRepository {
  private readonly calendar;

  constructor(
    private readonly config: AppConfig,
    private readonly logger: ILogger,
  ) {
    const auth = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
    );
    auth.setCredentials({ refresh_token: config.googleRefreshToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getUpcomingEvents(lookaheadHours: number): Promise<CalendarEvent[]> {
    const now = new Date();
    const timeMax = new Date(now.getTime() + lookaheadHours * 3_600_000);

    const response = await this.calendar.events.list({
      calendarId: this.config.googleCalendarId,
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const items = response.data.items ?? [];
    this.logger.info(`[GoogleCalendar] ${items.length} eventos obtenidos del API`);

    return items.map((item) => new CalendarEvent(
      item.id ?? '',
      item.summary ?? '(Sin título)',
      new Date(item.start?.dateTime ?? item.start?.date ?? now.toISOString()),
      item.location ?? null,
      (item.attendees ?? [])
        .map((a) => a.displayName ?? a.email ?? '')
        .filter(Boolean),
    ));
  }
}
