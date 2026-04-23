# Code Generation Plan — Unit-01: SchedullerAdvisor AI Service

**Fecha**: 2026-04-22
**Estado**: En ejecución

---

## BLOQUE 0 — Scaffolding del proyecto
- [x] 0.1 package.json
- [x] 0.2 tsconfig.json
- [x] 0.3 jest.config.ts
- [x] 0.4 .env.example
- [x] 0.5 .gitignore
- [x] 0.6 Estructura de directorios src/

## BLOQUE 1 — Domain: Entidades
- [x] 1.1 src/domain/entities/calendar-event.ts
- [x] 1.2 src/domain/entities/notification.ts
- [x] 1.3 tests/domain/calendar-event.test.ts
- [x] 1.4 tests/domain/notification.test.ts

## BLOQUE 2 — Domain: Interfaces (Puertos)
- [x] 2.1 src/domain/interfaces/calendar-repository.interface.ts
- [x] 2.2 src/domain/interfaces/whatsapp-client.interface.ts
- [x] 2.3 src/domain/interfaces/notification-tracker.interface.ts
- [x] 2.4 src/domain/interfaces/logger.interface.ts

## BLOQUE 3 — Shared: Utilidades
- [x] 3.1 src/shared/config.ts
- [x] 3.2 src/shared/logger.ts
- [x] 3.3 src/shared/timezone.utils.ts
- [x] 3.4 tests/shared/timezone.utils.test.ts
- [x] 3.5 tests/shared/config.test.ts

## BLOQUE 4 — Application: Casos de Uso
- [x] 4.1 src/application/use-cases/fetch-upcoming-events.ts
- [x] 4.2 src/application/use-cases/evaluate-pending-notifications.ts
- [x] 4.3 src/application/use-cases/format-notification-message.ts
- [x] 4.4 src/application/use-cases/send-whatsapp-notification.ts
- [x] 4.5 src/application/use-cases/run-scheduler-cycle.ts
- [x] 4.6 tests/application/fetch-upcoming-events.test.ts
- [x] 4.7 tests/application/evaluate-pending-notifications.test.ts
- [x] 4.8 tests/application/format-notification-message.test.ts
- [x] 4.9 tests/application/send-whatsapp-notification.test.ts
- [x] 4.10 tests/application/run-scheduler-cycle.test.ts

## BLOQUE 5 — Infrastructure: Adaptadores
- [x] 5.1 src/infrastructure/tracking/in-memory-notification-tracker.ts
- [x] 5.2 src/infrastructure/google-calendar/google-calendar.adapter.ts
- [x] 5.3 src/infrastructure/whatsapp/whatsapp-web.adapter.ts
- [x] 5.4 tests/infrastructure/in-memory-notification-tracker.test.ts
- [x] 5.5 tests/infrastructure/google-calendar.adapter.test.ts

## BLOQUE 6 — Entry Point
- [x] 6.1 src/index.ts

## BLOQUE 7 — Documentación
- [x] 7.1 aidlc-docs/construction/unit-01/code/code-summary.md
