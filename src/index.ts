import cron from 'node-cron';
import { loadConfig } from './shared/config';
import { ConsoleLogger } from './shared/logger';
import { GoogleCalendarAdapter } from './infrastructure/google-calendar/google-calendar.adapter';
import { WhatsAppWebAdapter } from './infrastructure/whatsapp/whatsapp-web.adapter';
import { InMemoryNotificationTracker } from './infrastructure/tracking/in-memory-notification-tracker';
import { FetchUpcomingEvents } from './application/use-cases/fetch-upcoming-events';
import { EvaluatePendingNotifications } from './application/use-cases/evaluate-pending-notifications';
import { FormatNotificationMessage } from './application/use-cases/format-notification-message';
import { SendWhatsAppNotification } from './application/use-cases/send-whatsapp-notification';
import { RunSchedulerCycle } from './application/use-cases/run-scheduler-cycle';

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = new ConsoleLogger();

  logger.info('====== SchedullerAdvisor AI — Iniciando ======');
  logger.info(`Intervalo de escaneo: ${config.scanIntervalMinutes} minutos`);
  logger.info(`Anticipación de recordatorio: ${config.reminderMinutesBefore} minutos`);
  logger.info(`Lookahead: ${config.lookaheadHours} horas`);
  logger.info(`Timezone: ${config.timezone}`);
  logger.info(`Calendario: ${config.googleCalendarId}`);

  // Composition Root
  const tracker = new InMemoryNotificationTracker();
  const calendarAdapter = new GoogleCalendarAdapter(config, logger);
  const whatsappAdapter = new WhatsAppWebAdapter(config, logger);

  const fetchEvents = new FetchUpcomingEvents(calendarAdapter, logger);
  const evaluateNotifications = new EvaluatePendingNotifications(tracker);
  const formatMessage = new FormatNotificationMessage();
  const sendNotification = new SendWhatsAppNotification(whatsappAdapter);

  const schedulerCycle = new RunSchedulerCycle(
    fetchEvents,
    evaluateNotifications,
    formatMessage,
    sendNotification,
    tracker,
    logger,
    config,
  );

  // Inicializar WhatsApp (muestra QR si es primera vez)
  logger.info('[WhatsApp] Inicializando cliente...');
  await whatsappAdapter.initialize();

  // Iniciar scheduler
  const cronExpression = `*/${config.scanIntervalMinutes} * * * *`;
  logger.info(`[Scheduler] Iniciado. Expresión cron: ${cronExpression}`);

  cron.schedule(cronExpression, async () => {
    await schedulerCycle.execute();
  });

  // Ejecutar primer ciclo inmediatamente al arrancar
  await schedulerCycle.execute();
}

main().catch((err) => {
  console.error('Error fatal al iniciar SchedullerAdvisor AI:', err);
  process.exit(1);
});
