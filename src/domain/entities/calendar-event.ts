export class CalendarEvent {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly startTime: Date,
    readonly location: string | null,
    readonly attendees: string[],
  ) {}

  isNotifiable(): boolean {
    return !this.isAllDay();
  }

  minutesUntilStart(now: Date): number {
    return Math.floor((this.startTime.getTime() - now.getTime()) / 60_000);
  }

  displayLocation(): string {
    return this.location ?? 'Sin ubicación';
  }

  displayAttendees(): string {
    return this.attendees.length > 0 ? this.attendees.join(', ') : 'Solo tú';
  }

  // Un evento de todo el día no tiene hora específica: inicia a medianoche UTC
  private isAllDay(): boolean {
    return (
      this.startTime.getUTCHours() === 0 &&
      this.startTime.getUTCMinutes() === 0 &&
      this.startTime.getUTCSeconds() === 0
    );
  }
}
