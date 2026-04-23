# NFR Design — Unit-01: SchedullerAdvisor AI Service

**Versión**: 1.0
**Fecha**: 2026-04-22
**Fase**: Construction
**Estado**: Pendiente de aprobación

---

## 1. Patrón: Inyección de Dependencias (NFR-TEST-02)

Todos los casos de uso reciben dependencias por constructor usando interfaces, no implementaciones concretas.

```typescript
// Ejemplo: RunSchedulerCycle
class RunSchedulerCycle {
  constructor(
    private readonly fetchEvents: FetchUpcomingEvents,
    private readonly evaluateNotifications: EvaluatePendingNotifications,
    private readonly formatMessage: FormatNotificationMessage,
    private readonly sendNotification: SendWhatsAppNotification,
    private readonly logger: ILogger,
    private readonly config: AppConfig
  ) {}
}
```

**Composición en `index.ts`** (Composition Root):
```typescript
const logger = new ConsoleLogger();
const config = loadConfig();                          // valida .env al arranque
const tracker = new InMemoryNotificationTracker();
const calendarAdapter = new GoogleCalendarAdapter(config, logger);
const whatsappAdapter = new WhatsAppWebAdapter(config, logger);

const fetchEvents       = new FetchUpcomingEvents(calendarAdapter, logger);
const evaluateNotifs    = new EvaluatePendingNotifications(tracker);
const formatMessage     = new FormatNotificationMessage();
const sendNotification  = new SendWhatsAppNotification(whatsappAdapter);
const schedulerCycle    = new RunSchedulerCycle(
  fetchEvents, evaluateNotifs, formatMessage, sendNotification, logger, config
);
```

---

## 2. Patrón: Error Handling por Capas (NFR-RES-01, NFR-RES-02)

Cada capa tiene responsabilidad clara de captura de errores:

### Capa Infrastructure (Adaptadores)
- Deja propagar las excepciones nativas de los SDKs.
- Agrega contexto antes de propagar: `throw new Error(\`GoogleCalendar: \${err.message}\`)`.

### Capa Application (Casos de Uso)
- `FetchUpcomingEvents` y `SendWhatsAppNotification` propagan errores hacia `RunSchedulerCycle`.
- `RunSchedulerCycle` es el único punto de captura global del ciclo.

### `RunSchedulerCycle` — Estructura de error handling:
```typescript
async execute(): Promise<void> {
  this.logger.info('[Scheduler] Iniciando ciclo');
  let sent = 0;

  try {
    const events = await this.fetchEvents.execute(this.config.lookaheadHours);
    const pending = this.evaluateNotifications.execute(events, this.config.reminderMinutes, new Date());

    for (const event of pending) {
      try {
        const minutes = event.minutesUntilStart(new Date());
        const message = this.formatMessage.execute(event, minutes, this.config.timezone);
        await this.sendNotification.execute(message);
        this.tracker.markAsNotified(event.id);
        this.logger.info(`[Scheduler] Notificado: ${event.id}`);
        sent++;
      } catch (err) {
        this.logger.error(`[Scheduler] Error notificando ${event.id}`, err as Error);
        // continúa con el siguiente evento
      }
    }
  } catch (err) {
    this.logger.error('[Scheduler] Error en ciclo', err as Error);
    // el cron continuará en el próximo ciclo
  }

  this.logger.info(`[Scheduler] Ciclo completado. Notificaciones enviadas: ${sent}`);
}
```

---

## 3. Patrón: Validación de Configuración al Arranque (NFR-CFG-02)

```typescript
// shared/config.ts
interface AppConfig {
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

function loadConfig(): AppConfig {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Configuración faltante: ${missing.join(', ')}. Revisa tu archivo .env`);
  }

  return {
    scanIntervalMinutes:   parseInt(process.env.SCAN_INTERVAL_MINUTES  ?? '15'),
    reminderMinutesBefore: parseInt(process.env.REMINDER_MINUTES_BEFORE ?? '15'),
    lookaheadHours:        parseInt(process.env.LOOKAHEAD_HOURS         ?? '2'),
    googleCalendarId:      process.env.GOOGLE_CALENDAR_ID  ?? 'primary',
    timezone:              process.env.TIMEZONE             ?? 'America/Bogota',
    whatsappSessionPath:   process.env.WHATSAPP_SESSION_PATH ?? './whatsapp-session',
    googleClientId:        process.env.GOOGLE_CLIENT_ID!,
    googleClientSecret:    process.env.GOOGLE_CLIENT_SECRET!,
    googleRefreshToken:    process.env.GOOGLE_REFRESH_TOKEN!,
  };
}
```

---

## 4. Patrón: Logger Estructurado (NFR-OBS-01)

```typescript
// shared/logger.ts
class ConsoleLogger implements ILogger {
  private format(level: string, component: string, message: string): string {
    const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
    return `[${ts}] [${level}] [${component}] ${message}`;
  }

  info(message: string): void {
    console.log(this.format('INFO ', 'App', message));
  }

  error(message: string, error?: Error): void {
    console.error(this.format('ERROR', 'App', message));
    if (error?.stack) console.error(error.stack);
  }
}
```

**Formato de salida:**
```
[2026-04-22 10:30:00] [INFO ] [App] Iniciando ciclo de escaneo
[2026-04-22 10:30:01] [INFO ] [App] Ciclo completado. Notificaciones enviadas: 1
[2026-04-22 10:45:00] [ERROR] [App] Error al consultar calendario
```

---

## 5. Patrón: Sesión WhatsApp Persistida (NFR-RES-04, HU-01)

```typescript
// infrastructure/whatsapp/whatsapp-web.adapter.ts
class WhatsAppWebAdapter implements IWhatsAppClient {
  private client: Client;

  constructor(private readonly config: AppConfig, private readonly logger: ILogger) {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.whatsappSessionPath  // persiste sesión en disco
      }),
      puppeteer: { headless: true }
    });
  }

  async initialize(): Promise<void> {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });  // muestra QR en consola
      this.logger.info('[WhatsApp] Escanea el QR para vincular tu cuenta');
    });

    this.client.on('ready', () => {
      this.logger.info('[WhatsApp] Cliente conectado y listo');
    });

    this.client.on('disconnected', (reason) => {
      this.logger.error(`[WhatsApp] Sesión desconectada: ${reason}`);
      // loggea y continúa — no reinicia automáticamente (NFR-RES-03)
    });

    await this.client.initialize();
  }

  async sendMessage(to: string, message: string): Promise<void> {
    const chat = await this.client.getChatById(to);
    await chat.sendMessage(message);
  }
}
```

---

## 6. Patrón: Timezone con Luxon (NFR-RES, RF-06)

```typescript
// shared/timezone.utils.ts
import { DateTime } from 'luxon';

function toTimezone(date: Date, timezone: string): DateTime {
  return DateTime.fromJSDate(date).setZone(timezone);
}

function formatTime(date: Date, timezone: string): string {
  return toTimezone(date, timezone).toFormat('HH:mm');
}
```

---

## 7. Estructura del `.env.example`

```dotenv
# === Google Calendar ===
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REFRESH_TOKEN=tu_refresh_token_aqui
GOOGLE_CALENDAR_ID=primary

# === Comportamiento del Scheduler ===
SCAN_INTERVAL_MINUTES=15
REMINDER_MINUTES_BEFORE=15
LOOKAHEAD_HOURS=2

# === Display ===
TIMEZONE=America/Bogota

# === WhatsApp ===
WHATSAPP_SESSION_PATH=./whatsapp-session
```

---

## 8. `.gitignore` requerido

```
.env
whatsapp-session/
node_modules/
dist/
coverage/
```

---

## 9. Trazabilidad NFR → Patrón de Diseño

| NFR | Patrón aplicado | Sección |
|---|---|---|
| NFR-RES-01 | Try/catch global en `RunSchedulerCycle` | §2 |
| NFR-RES-02 | Try/catch individual por evento en loop | §2 |
| NFR-RES-03 | Handler `disconnected` loggea y no crashea | §5 |
| NFR-RES-04 | `LocalAuth` persiste sesión en disco | §5 |
| NFR-SEC-01 | `loadConfig()` lee solo desde `process.env` | §3 |
| NFR-SEC-02 | `.gitignore` con `.env` y `whatsapp-session/` | §8 |
| NFR-SEC-03 | Logger no incluye tokens ni mensajes | §4 |
| NFR-SEC-04 | Scope `calendar.readonly` en OAuth | §3 |
| NFR-CFG-01 | Config centralizado en `AppConfig` | §3 |
| NFR-CFG-02 | Validación en `loadConfig()` al arranque | §3 |
| NFR-CFG-03 | `.env.example` documentado | §7 |
| NFR-OBS-01 | `ConsoleLogger` con formato estructurado | §4 |
| NFR-TEST-02 | Inyección por constructor en todos los CU | §1 |
| NFR-TEST-03 | `now: Date` como parámetro inyectado | §1 |

---

*Documento generado por AI-DLC Construction Phase — NFR Design*
