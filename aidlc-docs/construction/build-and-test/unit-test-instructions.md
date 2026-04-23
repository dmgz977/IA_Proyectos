# Unit Test Instructions — SchedullerAdvisor AI

---

## Ejecutar todos los tests

```bash
npm test
```

## Ejecutar con reporte de cobertura

```bash
npm run test:coverage
```

**Cobertura mínima requerida: 80%** (configurado en `jest.config.ts`)

---

## Suite de Tests por Capa

### Domain (11 tests)
```bash
npx jest tests/domain
```

| Archivo | Tests | Qué valida |
|---|---|---|
| `calendar-event.test.ts` | 8 | `isNotifiable`, `minutesUntilStart`, `displayLocation`, `displayAttendees` |
| `notification.test.ts` | 3 | Inmutabilidad, `markSent`, `sentAt` inicial null |

### Shared (6 tests)
```bash
npx jest tests/shared
```

| Archivo | Tests | Qué valida |
|---|---|---|
| `timezone.utils.test.ts` | 3 | Conversión UTC→Bogotá, medianoche UTC |
| `config.test.ts` | 3 | Variables faltantes, defaults, valores custom |

### Application (18 tests)
```bash
npx jest tests/application
```

| Archivo | Tests | Qué valida |
|---|---|---|
| `fetch-upcoming-events.test.ts` | 3 | Filtrado de notificables, lista vacía, propagación de error |
| `evaluate-pending-notifications.test.ts` | 4 | Ventana de tiempo, ya notificado, fuera de ventana, evento pasado |
| `format-notification-message.test.ts` | 6 | Título, sin ubicación, sin asistentes, hora Bogotá, minutos, singular |
| `send-whatsapp-notification.test.ts` | 2 | Envío al número propio, propagación de error |
| `run-scheduler-cycle.test.ts` | 3 | Ciclo exitoso, fallo de calendario, fallo aislado por evento |

### Infrastructure (6 tests)
```bash
npx jest tests/infrastructure
```

| Archivo | Tests | Qué valida |
|---|---|---|
| `in-memory-notification-tracker.test.ts` | 4 | Estado inicial, markAsNotified, independencia, idempotencia |
| `google-calendar.adapter.test.ts` | 2 | Mapeo de eventos, lista vacía |

---

## Resultado esperado

```
Test Suites: 11 passed, 11 total
Tests:       41 passed, 41 total
Snapshots:   0 total
Time:        ~5s

Coverage summary:
Statements   : ≥80%
Branches     : ≥80%
Functions    : ≥80%
Lines        : ≥80%
```

---

## Convención de nombrado verificada

Todos los tests siguen: `test_should_[acción]_when_[condición]`

Ejemplos:
- `test_should_be_notifiable_when_event_has_specific_time`
- `test_should_return_false_when_event_has_not_been_notified`
- `test_should_not_throw_when_calendar_fetch_fails`
