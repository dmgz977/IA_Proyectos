# NFR Requirements — Unit-01: SchedullerAdvisor AI Service

**Versión**: 1.0
**Fecha**: 2026-04-22
**Fase**: Construction
**Estado**: Pendiente de aprobación

---

## 1. Resiliencia y Disponibilidad

### NFR-RES-01 — Aislamiento de fallos por ciclo
- **Descripción**: Un fallo en un ciclo de escaneo NO debe detener el scheduler ni el proceso.
- **Criterio**: `RunSchedulerCycle` captura todas las excepciones. El cron continúa ejecutándose independientemente del resultado de cada ciclo.
- **Aplica a**: `RunSchedulerCycle`, `GoogleCalendarAdapter`, `WhatsAppWebAdapter`

### NFR-RES-02 — Aislamiento de fallos por notificación
- **Descripción**: Un fallo al enviar la notificación de un evento NO debe bloquear las notificaciones de los demás eventos del mismo ciclo.
- **Criterio**: El try/catch en el loop de envío es por evento individual, no engloba toda la iteración.
- **Aplica a**: `RunSchedulerCycle` → loop de envío

### NFR-RES-03 — Tolerancia a expiración de sesión WhatsApp
- **Descripción**: Si la sesión de WhatsApp expira durante la operación, el sistema loggea el error y continúa el ciclo sin crash.
- **Criterio**: El error de sesión expirada es capturado como cualquier otro error de envío.
- **Aplica a**: `WhatsAppWebAdapter`

### NFR-RES-04 — Compatibilidad con PM2
- **Descripción**: El proceso debe poder gestionarse con PM2 para auto-reiniciarse ante crashes inesperados.
- **Criterio**: El `index.ts` no tiene lógica que impida el reinicio. La sesión de WhatsApp se persiste en disco para recuperarse tras reinicio.

---

## 2. Seguridad

### NFR-SEC-01 — Credenciales en variables de entorno
- **Descripción**: Ninguna credencial, token, client_id, client_secret ni refresh_token puede estar hardcodeada en el código fuente.
- **Criterio**: Todos los valores sensibles provienen exclusivamente del archivo `.env`.
- **Aplica a**: `config.ts`, `GoogleCalendarAdapter`

### NFR-SEC-02 — Exclusión de archivos sensibles de Git
- **Descripción**: Los archivos `.env` y el directorio de sesión de WhatsApp NO deben ser versionados.
- **Criterio**: `.gitignore` incluye explícitamente `.env` y `whatsapp-session/`.
- **Aplica a**: Repositorio

### NFR-SEC-03 — Sin logging de datos sensibles
- **Descripción**: Los logs NO deben contener tokens OAuth, credenciales, ni el contenido de los mensajes enviados.
- **Criterio**: El logger registra IDs de eventos y conteos, nunca tokens ni texto de mensajes.
- **Aplica a**: `ConsoleLogger`, `RunSchedulerCycle`

### NFR-SEC-04 — Acceso de solo lectura a Google Calendar
- **Descripción**: El scope OAuth solicitado es únicamente `https://www.googleapis.com/auth/calendar.readonly`.
- **Criterio**: En la configuración del cliente OAuth no se solicitan scopes de escritura.
- **Aplica a**: `GoogleCalendarAdapter`

---

## 3. Configurabilidad y Mantenibilidad

### NFR-CFG-01 — Configuración externalizada completa
- **Descripción**: Todos los parámetros de comportamiento del sistema se cargan desde `.env`.
- **Criterio**: No existen valores mágicos (magic numbers) en el código de lógica de negocio.
- **Parámetros**: `SCAN_INTERVAL_MINUTES`, `REMINDER_MINUTES_BEFORE`, `LOOKAHEAD_HOURS`, `GOOGLE_CALENDAR_ID`, `TIMEZONE`, `WHATSAPP_SESSION_PATH`
- **Aplica a**: `config.ts`, todos los casos de uso que consumen configuración

### NFR-CFG-02 — Validación de configuración al arranque
- **Descripción**: Si faltan variables de entorno requeridas, el servicio debe fallar rápido con mensaje claro al iniciar, no durante la operación.
- **Criterio**: `config.ts` valida la presencia de variables obligatorias y lanza error descriptivo si alguna falta.
- **Aplica a**: `config.ts`, `index.ts`

### NFR-CFG-03 — Archivo `.env.example` documentado
- **Descripción**: Debe existir un `.env.example` con todos los parámetros, sus valores por defecto y descripción.
- **Criterio**: El `.env.example` está versionado en Git y está sincronizado con `config.ts`.

---

## 4. Observabilidad

### NFR-OBS-01 — Logging estructurado mínimo
- **Descripción**: El servicio debe producir logs con suficiente contexto para diagnosticar problemas sin acceso al código.
- **Criterio**: Cada log incluye: timestamp, nivel (INFO/ERROR), componente origen y mensaje descriptivo.
- **Formato**: `[YYYY-MM-DD HH:MM:SS] [NIVEL] [Componente] Mensaje`
- **Aplica a**: `ConsoleLogger`, todos los adaptadores y casos de uso

### NFR-OBS-02 — Log de ciclo completo
- **Descripción**: Cada ciclo de escaneo produce al menos 2 entradas de log: inicio y fin con resultados.
- **Criterio**: `RunSchedulerCycle` loggea inicio, cantidad de eventos encontrados, notificaciones enviadas y errores ocurridos.

### NFR-OBS-03 — Log de arranque del servicio
- **Descripción**: Al iniciar el servicio se loggean los parámetros de configuración activos (excepto valores sensibles).
- **Criterio**: `index.ts` loggea: intervalo de escaneo, minutos de anticipación, lookahead, timezone y calendar ID.

---

## 5. Calidad de Código y Testabilidad

### NFR-TEST-01 — Cobertura mínima de tests
- **Descripción**: La cobertura de tests unitarios debe ser igual o superior al 80%.
- **Criterio**: `jest --coverage` reporta ≥ 80% de líneas cubiertas.
- **Framework**: Jest + ts-jest

### NFR-TEST-02 — Inyección de dependencias para testabilidad
- **Descripción**: Los casos de uso reciben sus dependencias por constructor (no las instancian internamente).
- **Criterio**: Todos los casos de uso aceptan interfaces, no implementaciones concretas. Los tests inyectan mocks.
- **Aplica a**: Todos los casos de uso en `application/use-cases/`

### NFR-TEST-03 — `now` inyectable en evaluación
- **Descripción**: El parámetro `now: Date` en `EvaluatePendingNotifications` es inyectado, no obtenido con `new Date()` internamente.
- **Criterio**: Permite tests deterministas sin manipulación de tiempo del sistema.

### NFR-TEST-04 — Convención de nombrado de tests
- **Descripción**: Todos los tests siguen el patrón: `test_should_[acción]_when_[condición]`.
- **Ejemplo**: `test_should_return_empty_when_no_events_in_lookahead`

### NFR-CODE-01 — Límites de tamaño de archivos y funciones
- **Descripción**: Ninguna función supera 40 líneas. Ningún archivo supera 300 líneas.
- **Aplica a**: Todo el código fuente en `src/`

---

## 6. Resumen de NFRs por Categoría

| ID | Categoría | Descripción corta | Prioridad |
|---|---|---|---|
| NFR-RES-01 | Resiliencia | Fallo por ciclo aislado | Alta |
| NFR-RES-02 | Resiliencia | Fallo por notificación aislado | Alta |
| NFR-RES-03 | Resiliencia | Tolerancia a expiración sesión WA | Media |
| NFR-RES-04 | Resiliencia | Compatibilidad PM2 | Media |
| NFR-SEC-01 | Seguridad | Credenciales en .env | Alta |
| NFR-SEC-02 | Seguridad | .env y sesión excluidos de Git | Alta |
| NFR-SEC-03 | Seguridad | Sin logging de datos sensibles | Alta |
| NFR-SEC-04 | Seguridad | OAuth scope solo lectura | Alta |
| NFR-CFG-01 | Configuración | Sin magic numbers | Media |
| NFR-CFG-02 | Configuración | Validación al arranque | Alta |
| NFR-CFG-03 | Configuración | .env.example documentado | Media |
| NFR-OBS-01 | Observabilidad | Logging estructurado | Media |
| NFR-OBS-02 | Observabilidad | Log por ciclo | Media |
| NFR-OBS-03 | Observabilidad | Log de arranque | Baja |
| NFR-TEST-01 | Testing | Cobertura ≥ 80% | Alta |
| NFR-TEST-02 | Testing | Inyección de dependencias | Alta |
| NFR-TEST-03 | Testing | `now` inyectable | Alta |
| NFR-TEST-04 | Testing | Convención de nombrado | Media |
| NFR-CODE-01 | Código | Límites de tamaño | Media |

---

*Documento generado por AI-DLC Construction Phase — NFR Requirements*
