# Code Summary — Unit-01: SchedullerAdvisor AI Service

**Fecha**: 2026-04-22
**Fase**: Construction — Code Generation

---

## Archivos Generados

### Configuración del Proyecto
| Archivo | Descripción |
|---|---|
| `package.json` | Dependencias y scripts del proyecto |
| `tsconfig.json` | Configuración TypeScript (target ES2022, strict) |
| `jest.config.ts` | Configuración Jest con cobertura mínima 80% |
| `.env.example` | Variables de entorno documentadas con valores por defecto |
| `.gitignore` | Exclusión de `.env`, `whatsapp-session/`, `node_modules/`, `dist/` |

### Domain — Entidades
| Archivo | Descripción |
|---|---|
| `src/domain/entities/calendar-event.ts` | Entidad CalendarEvent con reglas de negocio |
| `src/domain/entities/notification.ts` | Entidad Notification inmutable |

### Domain — Interfaces (Puertos)
| Archivo | Descripción |
|---|---|
| `src/domain/interfaces/calendar-repository.interface.ts` | Puerto ICalendarRepository |
| `src/domain/interfaces/whatsapp-client.interface.ts` | Puerto IWhatsAppClient |
| `src/domain/interfaces/notification-tracker.interface.ts` | Puerto INotificationTracker |
| `src/domain/interfaces/logger.interface.ts` | Puerto ILogger |

### Shared — Utilidades
| Archivo | Descripción |
|---|---|
| `src/shared/config.ts` | Carga y valida variables de entorno, AppConfig interface |
| `src/shared/logger.ts` | ConsoleLogger con formato estructurado |
| `src/shared/timezone.utils.ts` | Conversión UTC → timezone con Luxon |

### Application — Casos de Uso
| Archivo | Descripción |
|---|---|
| `src/application/use-cases/fetch-upcoming-events.ts` | Consulta calendario y filtra eventos notificables |
| `src/application/use-cases/evaluate-pending-notifications.ts` | Filtra eventos en ventana de recordatorio |
| `src/application/use-cases/format-notification-message.ts` | Construye mensaje WhatsApp con template |
| `src/application/use-cases/send-whatsapp-notification.ts` | Envía mensaje al número propio |
| `src/application/use-cases/run-scheduler-cycle.ts` | Orquesta ciclo completo con manejo de errores |

### Infrastructure — Adaptadores
| Archivo | Descripción |
|---|---|
| `src/infrastructure/tracking/in-memory-notification-tracker.ts` | Tracker con Set en memoria |
| `src/infrastructure/google-calendar/google-calendar.adapter.ts` | Adapter Google Calendar API v3 |
| `src/infrastructure/whatsapp/whatsapp-web.adapter.ts` | Adapter whatsapp-web.js con LocalAuth |

### Entry Point
| Archivo | Descripción |
|---|---|
| `src/index.ts` | Composition Root, inicialización WhatsApp, arranque cron |

---

## Tests Generados

| Archivo | Tests |
|---|---|
| `tests/domain/calendar-event.test.ts` | 8 tests |
| `tests/domain/notification.test.ts` | 3 tests |
| `tests/shared/timezone.utils.test.ts` | 3 tests |
| `tests/shared/config.test.ts` | 3 tests |
| `tests/application/fetch-upcoming-events.test.ts` | 3 tests |
| `tests/application/evaluate-pending-notifications.test.ts` | 4 tests |
| `tests/application/format-notification-message.test.ts` | 6 tests |
| `tests/application/send-whatsapp-notification.test.ts` | 2 tests |
| `tests/application/run-scheduler-cycle.test.ts` | 3 tests |
| `tests/infrastructure/in-memory-notification-tracker.test.ts` | 4 tests |
| `tests/infrastructure/google-calendar.adapter.test.ts` | 2 tests |
| **Total** | **41 tests** |

---

## Decisiones Técnicas en Código

| Decisión | Implementación |
|---|---|
| Inyección de dependencias | Constructor injection en todos los casos de uso |
| `now` inyectable | Parámetro explícito en `EvaluatePendingNotifications.execute()` |
| Error handling aislado | Try/catch global + Try/catch por evento en `RunSchedulerCycle` |
| Validación al arranque | `loadConfig()` lanza error descriptivo si faltan variables requeridas |
| Sesión WhatsApp persistida | `LocalAuth` con `dataPath` configurable |
| Timezone con Luxon | `formatTimeInZone()` en `timezone.utils.ts` |
| Sin magic numbers | Toda configuración fluye desde `AppConfig` |

---

*Documento generado por AI-DLC Construction Phase — Code Generation*
