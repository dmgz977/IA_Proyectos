import { CalendarEvent } from '../../domain/entities/calendar-event';
import { formatTimeInZone } from '../../shared/timezone.utils';

export class FormatNotificationMessage {
  execute(event: CalendarEvent, minutesUntilStart: number, timezone: string): string {
    const hora = formatTimeInZone(event.startTime, timezone);

    return [
      '🔔 *Recordatorio de reunión*',
      '',
      `📌 *Reunión:* ${event.title}`,
      `📍 *Lugar:* ${event.displayLocation()}`,
      `👥 *Asistentes:* ${event.displayAttendees()}`,
      `🕐 *Hora:* ${hora}`,
      `⏰ *En ${minutesUntilStart} minuto${minutesUntilStart !== 1 ? 's' : ''}*`,
    ].join('\n');
  }
}
