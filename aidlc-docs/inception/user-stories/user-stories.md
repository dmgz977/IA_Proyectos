# User Stories — SchedullerAdvisor AI

**Versión**: 1.0
**Fecha**: 2026-04-22
**Fase**: Inception
**Estado**: Pendiente de aprobación

---

## Persona

### David — Usuario Único y Operador del Sistema

> **Perfil**: Profesional con agenda corporativa activa en Google Workspace personal. Maneja múltiples reuniones al día y necesita estar al tanto de ellas sin revisar manualmente el calendario. Usa WhatsApp como su canal de comunicación principal en el celular. Tiene conocimientos técnicos básicos para instalar y configurar un servicio en su PC.

**Motivación principal**: No perderse reuniones importantes ni estar pendiente constantemente del calendario.

**Contexto técnico**: PC local siempre encendido, celular con WhatsApp activo, cuenta Google Workspace propia.

---

## Historias de Usuario

---

### HU-01 — Vincular WhatsApp al arrancar el servicio

**Como** David,
**quiero** que al iniciar el servicio por primera vez se me muestre un código QR en la consola para vincular mi WhatsApp,
**para que** el sistema pueda enviarme notificaciones a mi propio número sin configuraciones complicadas.

**Criterios de aceptación:**
- [ ] Al primer arranque, el sistema muestra un QR en consola si no existe sesión previa.
- [ ] Al escanear el QR desde mi celular, la sesión queda vinculada y persiste en disco.
- [ ] En arranques posteriores, el sistema reutiliza la sesión existente sin mostrar QR.
- [ ] Si la sesión expira o falla, el sistema loggea el error en consola y continúa operando sin detenerse.
- [ ] El directorio de sesión es configurable vía `.env` (`WHATSAPP_SESSION_PATH`).

**Notas técnicas:**
- Librería: `whatsapp-web.js`
- Sesión persistida en carpeta local (excluida de Git)

---

### HU-02 — Recibir recordatorio antes de una reunión

**Como** David,
**quiero** recibir un mensaje de WhatsApp automáticamente antes de que comience una reunión en mi calendario,
**para que** nunca me tome desprevenido una reunión próxima sin tener que revisar el calendario manualmente.

**Criterios de aceptación:**
- [ ] El sistema escanea el calendario cada N minutos (configurable, default 15 min).
- [ ] Se envía un mensaje de WhatsApp cuando una reunión está a X minutos de comenzar (configurable, default 15 min).
- [ ] Solo se notifican eventos con hora definida (los eventos de todo el día se ignoran).
- [ ] El mensaje llega al mismo número de WhatsApp que tiene vinculado el servicio (chat consigo mismo).
- [ ] No se envían notificaciones duplicadas por el mismo evento durante una sesión activa.

**Notas técnicas:**
- Scheduler: `node-cron`
- Anti-duplicados: `Set<string>` en memoria con IDs de eventos notificados

---

### HU-03 — Ver datos completos de la reunión en la notificación

**Como** David,
**quiero** que el mensaje de recordatorio incluya toda la información relevante de la reunión,
**para que** pueda prepararme adecuadamente sin necesidad de abrir el calendario.

**Criterios de aceptación:**
- [ ] El mensaje incluye el nombre del evento.
- [ ] El mensaje incluye la ubicación del evento (si no tiene, muestra "Sin ubicación").
- [ ] El mensaje incluye la lista de asistentes (si no hay otros asistentes, muestra "Solo tú").
- [ ] El mensaje incluye la hora de inicio en zona horaria **America/Bogota (UTC-5)**.
- [ ] El mensaje indica cuántos minutos faltan para que comience la reunión.
- [ ] El formato del mensaje es claro y legible en pantalla de celular.

**Formato esperado del mensaje:**
```
🔔 Recordatorio de reunión

📌 Reunión: [nombre del evento]
📍 Lugar: [ubicación | "Sin ubicación"]
👥 Asistentes: [lista de asistentes | "Solo tú"]
🕐 Hora: [HH:MM - zona horaria Bogotá]
⏰ En [N] minutos
```

**Notas técnicas:**
- Timezone: `America/Bogota` usando librería `date-fns-tz` o `luxon`
- Datos obtenidos del Google Calendar API v3

---

### HU-04 — No recibir recordatorios duplicados

**Como** David,
**quiero** recibir como máximo un recordatorio por reunión por sesión activa del servicio,
**para que** mi WhatsApp no se llene de mensajes repetidos de la misma reunión.

**Criterios de aceptación:**
- [ ] Si el servicio detecta el mismo evento en dos ciclos de escaneo consecutivos dentro del umbral de notificación, solo envía el mensaje la primera vez.
- [ ] El registro de eventos notificados se mantiene en memoria durante la sesión activa.
- [ ] Al reiniciar el servicio, el registro se resetea (comportamiento esperado y aceptado).
- [ ] El sistema loggea cuando omite una notificación por ser duplicada.

**Notas técnicas:**
- Implementación: `Set<string>` con event IDs del Google Calendar

---

### HU-05 — Configurar el comportamiento del servicio sin tocar el código

**Como** David,
**quiero** poder ajustar los parámetros principales del servicio (frecuencia de escaneo, tiempo de anticipación, etc.) desde un archivo de configuración,
**para que** pueda personalizar el comportamiento sin necesidad de modificar ni recompilar el código.

**Criterios de aceptación:**
- [ ] Existe un archivo `.env` con los parámetros configurables del sistema.
- [ ] Cambiar `SCAN_INTERVAL_MINUTES` modifica la frecuencia de escaneo del calendario.
- [ ] Cambiar `REMINDER_MINUTES_BEFORE` modifica con cuánta anticipación se envía el recordatorio.
- [ ] Cambiar `GOOGLE_CALENDAR_ID` permite monitorear un calendario diferente al principal.
- [ ] El servicio carga la configuración al arrancar y la aplica correctamente.
- [ ] Existe un archivo `.env.example` documentado con todos los parámetros y sus valores por defecto.
- [ ] El archivo `.env` está excluido de Git (`.gitignore`).

**Parámetros configurables:**
| Variable | Default | Descripción |
|---|---|---|
| `SCAN_INTERVAL_MINUTES` | `15` | Frecuencia de escaneo en minutos |
| `REMINDER_MINUTES_BEFORE` | `15` | Minutos de anticipación para notificar |
| `LOOKAHEAD_HOURS` | `2` | Horas hacia adelante a consultar |
| `GOOGLE_CALENDAR_ID` | `primary` | ID del calendario a monitorear |
| `TIMEZONE` | `America/Bogota` | Zona horaria para mostrar horas |
| `WHATSAPP_SESSION_PATH` | `./whatsapp-session` | Ruta de la sesión de WhatsApp |

---

### HU-06 — El servicio continúa operando ante fallos transitorios

**Como** David,
**quiero** que el servicio no se detenga por errores de red o fallos temporales en las APIs externas,
**para que** no tenga que revisar constantemente si el servicio sigue corriendo.

**Criterios de aceptación:**
- [ ] Si falla la consulta a Google Calendar en un ciclo, el servicio loggea el error y espera al siguiente ciclo.
- [ ] Si falla el envío del mensaje de WhatsApp, el servicio loggea el error y continúa sin detenerse.
- [ ] El servicio no propaga excepciones no controladas que causen un crash del proceso.
- [ ] Los errores quedan registrados en consola con suficiente contexto para diagnóstico.
- [ ] El servicio puede iniciarse con `pm2` para auto-reiniciarse si el proceso muere por algún motivo.

**Notas técnicas:**
- Try/catch en los adaptadores de Google Calendar y WhatsApp
- Logging estructurado con nivel de error
- Compatible con PM2 para gestión del proceso

---

## Resumen

| ID | Historia | Prioridad | Complejidad |
|---|---|---|---|
| HU-01 | Vincular WhatsApp (QR) | Alta | Media |
| HU-02 | Recibir recordatorio antes de reunión | Alta | Media |
| HU-03 | Ver datos completos en la notificación | Alta | Baja |
| HU-04 | Sin recordatorios duplicados | Media | Baja |
| HU-05 | Configurar comportamiento vía .env | Media | Baja |
| HU-06 | Servicio resiliente ante fallos | Media | Media |

---

*Documento generado por AI-DLC Inception Phase — User Stories*
