# Functional Design — Unit-01: SchedullerAdvisor AI Service

**Versión**: 1.0
**Fecha**: 2026-04-22
**Fase**: Construction
**Estado**: Pendiente de aprobación

---

## 1. Entidad: `CalendarEvent`

### Campos
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID único del evento en Google Calendar |
| `title` | `string` | Nombre/título del evento |
| `startTime` | `Date` | Hora de inicio en UTC |
| `location` | `string \| null` | Ubicación (null si no tiene) |
| `attendees` | `string[]` | Lista de nombres o emails de asistentes |

### Métodos y Reglas de Negocio
| Método | Descripción |
|---|---|
| `isNotifiable()` | Retorna `true` si el evento tiene hora definida (no es de todo el día) |
| `minutesUntilStart(now: Date)` | Calcula minutos restantes hasta el inicio desde `now` |
| `displayLocation()` | Retorna la ubicación o `"Sin ubicación"` si es null |
| `displayAttendees()` | Retorna asistentes separados por coma o `"Solo tú"` si no hay |

### Reglas de Negocio
- **RN-01**: Un evento de todo el día se detecta cuando `startTime` es medianoche UTC (`00:00:00`). Estos eventos NO son notificables.
- **RN-02**: La ubicación nula se presenta siempre como `"Sin ubicación"`.
- **RN-03**: Sin asistentes externos se presenta como `"Solo tú"`.
- **RN-04**: `minutesUntilStart` puede ser negativo (evento ya comenzó) — el evaluador lo descarta.

---

## 2. Entidad: `Notification`

### Campos
| Campo | Tipo | Descripción |
|---|---|---|
| `eventId` | `string` | ID del evento asociado |
| `message` | `string` | Texto formateado del mensaje WhatsApp |
| `scheduledFor` | `Date` | Momento objetivo de envío |
| `sentAt` | `Date \| null` | Momento real de envío (null = no enviada aún) |

### Métodos
| Método | Descripción |
|---|---|
| `markSent(sentAt: Date)` | Retorna nueva instancia con `sentAt` definido (inmutabilidad) |

---

## 3. Contratos de Casos de Uso

### `FetchUpcomingEvents`
| | |
|---|---|
| **Entrada** | `lookaheadHours: number` |
| **Salida** | `Promise<CalendarEvent[]>` |
| **Responsabilidad** | Consulta Google Calendar y retorna eventos notificables ordenados por `startTime` asc |
| **Errores** | Propaga excepciones del adaptador para que `RunSchedulerCycle` las capture |

### `EvaluatePendingNotifications`
| | |
|---|---|
| **Entrada** | `events: CalendarEvent[]`, `reminderMinutes: number`, `now: Date` |
| **Salida** | `CalendarEvent[]` |
| **Responsabilidad** | Filtra eventos dentro del umbral de notificación y no notificados aún en sesión |
| **Regla** | `0 <= minutesUntilStart(now) <= reminderMinutes` AND `!tracker.hasBeenNotified(id)` |

### `FormatNotificationMessage`
| | |
|---|---|
| **Entrada** | `event: CalendarEvent`, `minutesUntilStart: number`, `timezone: string` |
| **Salida** | `string` |
| **Responsabilidad** | Construye mensaje WhatsApp con hora en timezone configurado |
| **Template** | Ver sección 4 |

### `SendWhatsAppNotification`
| | |
|---|---|
| **Entrada** | `message: string` |
| **Salida** | `Promise<void>` |
| **Responsabilidad** | Delega al `IWhatsAppClient` el envío al número propio del usuario |
| **Errores** | Propaga excepciones para que `RunSchedulerCycle` las capture por evento |

### `RunSchedulerCycle`
| | |
|---|---|
| **Entrada** | ninguna (usa dependencias inyectadas) |
| **Salida** | `Promise<void>` |
| **Responsabilidad** | Orquesta el ciclo completo con manejo de errores aislado por etapa |
| **Garantía** | Nunca propaga excepción — el ciclo siempre termina sin crash |

---

## 4. Template del Mensaje de Notificación

```
🔔 Recordatorio de reunión

📌 Reunión: {event.title}
📍 Lugar: {event.displayLocation()}
👥 Asistentes: {event.displayAttendees()}
🕐 Hora: {startTime en HH:MM, timezone configurado}
⏰ En {minutesUntilStart} minutos
```

---

## 5. Flujo de `RunSchedulerCycle` (pseudocódigo)

```
FUNCIÓN RunSchedulerCycle():
  logger.info("Iniciando ciclo de escaneo — " + timestamp)
  notificacionesEnviadas = 0

  TRY:
    eventos = FetchUpcomingEvents(config.lookaheadHours)
    pendientes = EvaluatePendingNotifications(eventos, config.reminderMinutes, ahora)

    PARA CADA evento EN pendientes:
      minutos = evento.minutesUntilStart(ahora)
      mensaje = FormatNotificationMessage(evento, minutos, config.timezone)

      TRY:
        SendWhatsAppNotification(mensaje)
        tracker.markAsNotified(evento.id)
        logger.info("Notificado: " + evento.id)
        notificacionesEnviadas++
      CATCH error:
        logger.error("Error al notificar evento " + evento.id, error)

  CATCH error:
    logger.error("Error al consultar calendario", error)

  logger.info("Ciclo completado. Eventos: " + eventos.length + ", Notificaciones: " + notificacionesEnviadas)
```

---

## 6. Trazabilidad con Requerimientos y User Stories

| Elemento | RF | HU |
|---|---|---|
| `CalendarEvent.isNotifiable()` | RF-02 | HU-02 |
| `CalendarEvent.displayLocation()` | RF-02, RF-05 | HU-03 |
| `CalendarEvent.displayAttendees()` | RF-05 | HU-03 |
| `FetchUpcomingEvents` | RF-01 | HU-02 |
| `EvaluatePendingNotifications` | RF-02, RF-03 | HU-02, HU-04 |
| `FormatNotificationMessage` | RF-05, RF-06 | HU-03 |
| `SendWhatsAppNotification` | RF-04 | HU-02 |
| `RunSchedulerCycle` | RF-01, RF-05 | HU-02, HU-06 |

---

*Documento generado por AI-DLC Construction Phase — Functional Design*
