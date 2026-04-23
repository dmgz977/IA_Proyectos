import 'dotenv/config';

export interface AppConfig {
  scanIntervalMinutes: number;
  reminderMinutesBefore: number;
  lookaheadHours: number;
  googleCalendarId: string;
  timezone: string;
  whatsappSessionPath: string;
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
}

export function loadConfig(): AppConfig {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Configuración faltante: ${missing.join(', ')}. Revisa tu archivo .env`,
    );
  }

  return {
    scanIntervalMinutes:   parseInt(process.env.SCAN_INTERVAL_MINUTES   ?? '15', 10),
    reminderMinutesBefore: parseInt(process.env.REMINDER_MINUTES_BEFORE ?? '15', 10),
    lookaheadHours:        parseInt(process.env.LOOKAHEAD_HOURS          ?? '2',  10),
    googleCalendarId:      process.env.GOOGLE_CALENDAR_ID   ?? 'primary',
    timezone:              process.env.TIMEZONE              ?? 'America/Bogota',
    whatsappSessionPath:   process.env.WHATSAPP_SESSION_PATH ?? './whatsapp-session',
    googleClientId:        process.env.GOOGLE_CLIENT_ID!,
    googleClientSecret:    process.env.GOOGLE_CLIENT_SECRET!,
    googleRefreshToken:    process.env.GOOGLE_REFRESH_TOKEN!,
  };
}
