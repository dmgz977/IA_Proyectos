# Requirements — SchedullerAdvisor AI

**Versión**: 1.0
**Fecha**: 2026-04-22
**Fase**: Inception
**Estado**: Pendiente de aprobación

---

## 1. Descripción General

SchedullerAdvisor AI es un servicio de notificaciones inteligentes de uso personal que monitorea continuamente el Google Calendar del usuario y envía recordatorios proactivos vía WhatsApp antes de cada reunión. El sistema opera como un proceso en background en el PC/servidor local del usuario, sin interfaz gráfica.

---

## 2. Stakeholders

| Rol | Descripción |
|---|---|
| Usuario único | El dueño del sistema — único usuario, operador y destinatario |

---

## 3. Requerimientos Funcionales

### RF-01 — Monitoreo de Google Calendar
- El servicio debe consultar el Google Calendar del usuario cada **N minutos** (configurable, valor por defecto: 15 minutos).
- Debe leer los eventos del calendario usando la **Google Calendar API v3** con autenticación **OAuth2**.
- La cuenta objetivo es **Google Workspace personal** con dominio propio (el usuario es administrador).
- El acceso es de **solo lectura** (`calendar.readonly` scope).
- El servicio consulta los eventos de las próximas **X horas** (configurable, valor por defecto: 2 horas) en cada ciclo.

### RF-02 — Detección de reuniones próximas
- El sistema debe identificar eventos cuya hora de inicio esté dentro del umbral de notificación configurado.
- Solo se procesan eventos con **hora definida** (los eventos de todo el día son ignorados).
- Si un evento no tiene ubicación, se muestra el texto **"Sin ubicación"**.
- Si un evento no tiene asistentes adicionales, se muestra **"Solo tú"** en el campo de asistentes.

### RF-03 — Prevención de duplicados
- El sistema mantiene en memoria (runtime) un `Set` de IDs de eventos ya notificados durante la sesión activa.
- Un evento no se notifica más de una vez por sesión.
- Al reiniciar el servicio, el `Set` se resetea (comportamiento aceptado).

### RF-04 — Envío de notificación por WhatsApp
- Las notificaciones se envían usando una **librería no oficial de WhatsApp** (`whatsapp-web.js`).
- El mensaje se envía al **mismo número vinculado** (chat consigo mismo).
- La sesión de WhatsApp se persiste localmente para evitar re-escaneo del QR en cada reinicio.
- El primer arranque requiere escanear un código QR desde el celular del usuario.

### RF-05 — Contenido del mensaje de notificación
El mensaje enviado debe incluir:
```
🔔 Recordatorio de reunión

📌 Reunión: [nombre del evento]
📍 Lugar: [ubicación | "Sin ubicación"]
👥 Asistentes: [lista de asistentes | "Solo tú"]
🕐 Hora: [hora en zona horaria America/Bogota]
⏰ En [N] minutos
```

### RF-06 — Zona horaria
- Todas las horas mostradas en las notificaciones deben estar en zona horaria **America/Bogota (UTC-5)**.
- La lógica interna de comparación de tiempos también debe manejar correctamente esta zona horaria.

### RF-07 — Configuración externalizada
Los siguientes parámetros deben ser configurables sin modificar el código, mediante archivo `.env`:
| Parámetro | Descripción | Valor por defecto |
|---|---|---|
| `SCAN_INTERVAL_MINUTES` | Frecuencia de escaneo del calendario | `15` |
| `REMINDER_MINUTES_BEFORE` | Minutos de anticipación para notificar | `15` |
| `LOOKAHEAD_HOURS` | Horas hacia adelante a consultar | `2` |
| `GOOGLE_CALENDAR_ID` | ID del calendario a monitorear | `primary` |
| `TIMEZONE` | Zona horaria de display | `America/Bogota` |
| `WHATSAPP_SESSION_PATH` | Ruta donde persiste la sesión de WA | `./whatsapp-session` |

---

## 4. Requerimientos No Funcionales

### RNF-01 — Plataforma
- El servicio corre en **PC local / servidor siempre encendido** (Windows o Linux).
- Se ejecuta como proceso Node.js directamente o como servicio del sistema operativo (PM2 recomendado).

### RNF-02 — Stack tecnológico
| Componente | Tecnología |
|---|---|
| Runtime | Node.js (LTS) |
| Lenguaje | TypeScript 5 |
| Google Calendar | `googleapis` SDK oficial |
| WhatsApp | `whatsapp-web.js` |
| Scheduler | `node-cron` |
| Configuración | `dotenv` |
| Testing | Jest + ts-jest |
| Cobertura mínima | 80% |
| Containerización | Docker + docker-compose (opcional para despliegue) |

### RNF-03 — Arquitectura
- Patrón: **Clean Architecture**
- Estructura de capas:
  ```
  src/
  ├── api/              (no aplica — no hay API HTTP)
  ├── domain/           (entidades: CalendarEvent, Notification)
  ├── application/      (casos de uso: CheckUpcomingMeetings, SendReminder)
  ├── infrastructure/   (adapters: GoogleCalendarAdapter, WhatsAppAdapter)
  └── shared/           (config, logger, timezone utils)
  ```

### RNF-04 — Seguridad
- NUNCA hardcodear credenciales, tokens OAuth o claves en el código.
- Credenciales de Google (client_id, client_secret, refresh_token) gestionadas vía `.env`.
- El archivo `.env` y `whatsapp-session/` excluidos de Git (`.gitignore`).
- No loggear tokens, credenciales ni información de las reuniones con datos sensibles.

### RNF-05 — Resiliencia
- Si falla la consulta a Google Calendar en un ciclo, el servicio debe loggear el error y continuar en el siguiente ciclo sin detenerse.
- Si falla el envío de WhatsApp, loggear el error y no reintentar en el mismo ciclo.
- El servicio no debe caerse por errores de red transitorios.

### RNF-06 — Privacidad
- El sistema es de uso estrictamente personal — un único usuario.
- No existe autenticación de usuarios en la aplicación (el acceso físico al PC es el control de acceso).
- Los datos del calendario no se persisten ni se exponen a terceros.

### RNF-07 — Logging
- El servicio debe loggear en consola (y opcionalmente en archivo):
  - Inicio y cierre del servicio
  - Cada ciclo de escaneo con resultado (N eventos encontrados, M notificaciones enviadas)
  - Errores con contexto suficiente para diagnóstico
- No loggear contenido sensible de las reuniones (solo IDs y conteos).

---

## 5. Restricciones

| ID | Restricción |
|---|---|
| REST-01 | El uso de `whatsapp-web.js` viola los ToS de WhatsApp. Aceptado para uso personal. |
| REST-02 | El servicio requiere que el PC esté siempre encendido para funcionar. |
| REST-03 | La sesión de WhatsApp debe re-vincularse (QR) si la sesión expira o se cierra desde el celular. |
| REST-04 | Google OAuth2 requiere configuración inicial en Google Cloud Console. |

---

## 6. Casos de Uso (alto nivel)

| ID | Caso de Uso | Actor |
|---|---|---|
| CU-01 | Iniciar servicio y vincular WhatsApp (QR) | Usuario |
| CU-02 | Escanear calendario automáticamente cada N minutos | Sistema |
| CU-03 | Detectar reunión próxima dentro del umbral configurado | Sistema |
| CU-04 | Enviar notificación WhatsApp al usuario | Sistema |
| CU-05 | Prevenir notificación duplicada por evento ya notificado | Sistema |
| CU-06 | Manejar error de red y continuar operación | Sistema |

---

## 7. Fuera de Alcance

- Interfaz gráfica o dashboard web
- Soporte multi-usuario
- Notificaciones por otros canales (email, Telegram, SMS)
- Gestión o modificación de eventos del calendario
- Integración con otros calendarios (Outlook, Apple Calendar)
- API HTTP expuesta al exterior
- Autenticación de usuarios en la aplicación

---

## 8. Decisiones Técnicas Documentadas

| ID | Decisión | Razón |
|---|---|---|
| DEC-01 | `whatsapp-web.js` como cliente WhatsApp | Uso personal, sin costo, sin proceso de registro empresarial |
| DEC-02 | Stack Node.js + TypeScript unificado | Coherencia con librería WhatsApp, un solo runtime |
| DEC-03 | Anti-duplicados en memoria (no persistidos) | Simplicidad aceptada; duplicados ocasionales tras reinicio son tolerables |
| DEC-04 | Configuración vía `.env` | Permite ajustar comportamiento sin tocar código |
| DEC-05 | Clean Architecture | Aislamiento de dependencias externas, testabilidad |

---

## 9. Criterios de Aceptación

- [ ] El servicio arranca y muestra QR para vincular WhatsApp en primer uso
- [ ] La sesión de WhatsApp persiste entre reinicios
- [ ] El calendario se consulta automáticamente cada N minutos (configurable)
- [ ] Se recibe notificación WhatsApp con los datos correctos N minutos antes de cada reunión
- [ ] La hora en la notificación aparece en zona horaria Bogotá
- [ ] No se envían notificaciones duplicadas durante una sesión activa
- [ ] El servicio no se cae ante errores de red transitorios
- [ ] Los parámetros clave son configurables sin modificar código
- [ ] Cobertura de tests ≥ 80%
- [ ] `.env` y `whatsapp-session/` excluidos de Git

---

*Documento generado por AI-DLC Inception Phase — Requirements Analysis*
