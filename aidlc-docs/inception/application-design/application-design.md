# Application Design — SchedullerAdvisor AI

**Versión**: 1.0
**Fecha**: 2026-04-22
**Fase**: Inception
**Unidad**: Unit-01 — SchedullerAdvisor AI Service
**Estado**: Pendiente de aprobación

---

## 1. Entidades de Dominio

### `CalendarEvent`
Representa un evento del calendario de Google.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID único del evento en Google Calendar |
| `title` | `string` | Nombre/título del evento |
| `startTime` | `Date` | Hora de inicio en UTC |
| `location` | `string \| null` | Ubicación física o virtual (null si no tiene) |
| `attendees` | `string[]` | Lista de nombres o emails de asistentes |

### `Notification`
Representa una notificación generada para un evento.

| Campo | Tipo | Descripción |
|---|---|---|
| `eventId` | `string` | Referencia al CalendarEvent |
| `message` | `string` | Texto formateado del mensaje WhatsApp |
| `scheduledFor` | `Date` | Momento en que debe enviarse |
| `sentAt` | `Date \| null` | Momento en que fue enviada efectivamente |

---

## 2. Interfaces (Puertos)

### `ICalendarRepository`
```typescript
interface ICalendarRepository {
  getUpcomingEvents(lookaheadHours: number): Promise<CalendarEvent[]>;
}
```

### `IWhatsAppClient`
```typescript
interface IWhatsAppClient {
  initialize(): Promise<void>;
  sendMessage(to: string, message: string): Promise<void>;
}
```

### `INotificationTracker`
```typescript
interface INotificationTracker {
  hasBeenNotified(eventId: string): boolean;
  markAsNotified(eventId: string): void;
}
```

### `ILogger`
```typescript
interface ILogger {
  info(message: string): void;
  error(message: string, error?: Error): void;
}
```

---

## 3. Casos de Uso

### `FetchUpcomingEvents`
- **Entrada**: `lookaheadHours: number`
- **Salida**: `Promise<CalendarEvent[]>`
- **Responsabilidad**: Consulta el adaptador de Google Calendar y retorna eventos con hora definida dentro de la ventana de tiempo configurada. Ignora eventos de todo el día.

### `EvaluatePendingNotifications`
- **Entrada**: `events: CalendarEvent[]`, `reminderMinutes: number`
- **Salida**: `CalendarEvent[]` (eventos pendientes de notificar)
- **Responsabilidad**: Filtra eventos cuya hora de inicio esté dentro del umbral de notificación y que no hayan sido notificados en la sesión actual.

### `FormatNotificationMessage`
- **Entrada**: `event: CalendarEvent`, `minutesUntilStart: number`
- **Salida**: `string`
- **Responsabilidad**: Construye el texto del mensaje WhatsApp con los datos del evento, mostrando la hora en zona horaria America/Bogota.

### `SendWhatsAppNotification`
- **Entrada**: `message: string`
- **Salida**: `Promise<void>`
- **Responsabilidad**: Envía el mensaje formateado via el adaptador de WhatsApp al número propio del usuario.

### `RunSchedulerCycle`
- **Entrada**: ninguna (usa configuración inyectada)
- **Salida**: `Promise<void>`
- **Responsabilidad**: Orquesta el ciclo completo: fetch → evaluar → formatear → enviar. Captura errores para evitar que el ciclo falle completamente.

---

## 4. Adaptadores (Infrastructure)

| Adaptador | Puerto | Tecnología |
|---|---|---|
| `GoogleCalendarAdapter` | `ICalendarRepository` | `googleapis` v6 SDK |
| `WhatsAppWebAdapter` | `IWhatsAppClient` | `whatsapp-web.js` |
| `InMemoryNotificationTracker` | `INotificationTracker` | `Set<string>` en runtime |
| `ConsoleLogger` | `ILogger` | `console` con formato estructurado |

---

## 5. Estructura de Directorios

```
src/
├── domain/
│   ├── entities/
│   │   ├── calendar-event.ts
│   │   └── notification.ts
│   └── interfaces/
│       ├── calendar-repository.interface.ts
│       ├── whatsapp-client.interface.ts
│       ├── notification-tracker.interface.ts
│       └── logger.interface.ts
├── application/
│   └── use-cases/
│       ├── fetch-upcoming-events.ts
│       ├── evaluate-pending-notifications.ts
│       ├── format-notification-message.ts
│       ├── send-whatsapp-notification.ts
│       └── run-scheduler-cycle.ts
├── infrastructure/
│   ├── google-calendar/
│   │   └── google-calendar.adapter.ts
│   ├── whatsapp/
│   │   └── whatsapp-web.adapter.ts
│   └── tracking/
│       └── in-memory-notification-tracker.ts
└── shared/
    ├── config.ts
    ├── logger.ts
    └── timezone.utils.ts

index.ts
.env
.env.example
```

---

## 6. Flujo Principal (Secuencia)

```
index.ts
  │
  ├─► WhatsAppWebAdapter.initialize()    ← QR en primer arranque
  │
  └─► node-cron (cada SCAN_INTERVAL_MINUTES)
        │
        └─► RunSchedulerCycle
              │
              ├─► FetchUpcomingEvents
              │     └─► GoogleCalendarAdapter → Google Calendar API v3
              │
              ├─► EvaluatePendingNotifications
              │     └─► InMemoryNotificationTracker.hasBeenNotified()
              │
              ├─► FormatNotificationMessage
              │     └─► timezone.utils (UTC → America/Bogota)
              │
              └─► SendWhatsAppNotification
                    └─► WhatsAppWebAdapter.sendMessage()
                          └─► whatsapp-web.js → celular del usuario
```

---

## 7. Dependencias del Proyecto

| Paquete | Versión | Uso |
|---|---|---|
| `googleapis` | ^6.x | Google Calendar API v3 |
| `whatsapp-web.js` | ^1.x | Cliente WhatsApp no oficial |
| `qrcode-terminal` | ^0.12 | Mostrar QR en consola |
| `node-cron` | ^3.x | Scheduler de ciclos |
| `dotenv` | ^16.x | Carga de variables de entorno |
| `luxon` | ^3.x | Manejo de zonas horarias |
| `typescript` | ^5.x | Lenguaje principal |
| `ts-node` | ^10.x | Ejecución TypeScript en desarrollo |
| `jest` | ^29.x | Testing |
| `ts-jest` | ^29.x | Jest con TypeScript |

---

*Documento generado por AI-DLC Inception Phase — Application Design*
