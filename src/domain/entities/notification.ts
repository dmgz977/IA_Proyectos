export class Notification {
  constructor(
    readonly eventId: string,
    readonly message: string,
    readonly scheduledFor: Date,
    readonly sentAt: Date | null = null,
  ) {}

  markSent(sentAt: Date): Notification {
    return new Notification(this.eventId, this.message, this.scheduledFor, sentAt);
  }
}
