import { AppConfig } from '../../shared/config';
import { ILogger } from '../../domain/interfaces/logger.interface';
import { INotificationTracker } from '../../domain/interfaces/notification-tracker.interface';
import { FetchUpcomingEvents } from './fetch-upcoming-events';
import { EvaluatePendingNotifications } from './evaluate-pending-notifications';
import { FormatNotificationMessage } from './format-notification-message';
import { SendWhatsAppNotification } from './send-whatsapp-notification';

export class RunSchedulerCycle {
  constructor(
    private readonly fetchEvents: FetchUpcomingEvents,
    private readonly evaluateNotifications: EvaluatePendingNotifications,
    private readonly formatMessage: FormatNotificationMessage,
    private readonly sendNotification: SendWhatsAppNotification,
    private readonly tracker: INotificationTracker,
    private readonly logger: ILogger,
    private readonly config: AppConfig,
  ) {}

  async execute(): Promise<void> {
    this.logger.info('[Scheduler] Iniciando ciclo de escaneo');
    let sent = 0;

    try {
      const events = await this.fetchEvents.execute(this.config.lookaheadHours);
      const now = new Date();
      const pending = this.evaluateNotifications.execute(
        events,
        this.config.reminderMinutesBefore,
        now,
      );

      for (const event of pending) {
        try {
          const minutes = event.minutesUntilStart(now);
          const message = this.formatMessage.execute(event, minutes, this.config.timezone);
          await this.sendNotification.execute(message);
          this.tracker.markAsNotified(event.id);
          this.logger.info(`[Scheduler] Notificado evento: ${event.id}`);
          sent++;
        } catch (err) {
          this.logger.error(`[Scheduler] Error notificando evento ${event.id}`, err as Error);
        }
      }
    } catch (err) {
      this.logger.error('[Scheduler] Error al consultar calendario', err as Error);
    }

    this.logger.info(`[Scheduler] Ciclo completado. Notificaciones enviadas: ${sent}`);
  }
}
