# Build Instructions — SchedullerAdvisor AI

---

## Pre-requisitos

| Requisito | Versión mínima | Verificar con |
|---|---|---|
| Node.js | 18 LTS | `node --version` |
| npm | 9+ | `npm --version` |
| Google Cloud Console | — | Cuenta activa |
| WhatsApp | — | App instalada en celular |

---

## 1. Instalar dependencias

```bash
npm install
```

**Dependencias clave instaladas:**
- `googleapis` — Google Calendar API v3
- `whatsapp-web.js` — Cliente WhatsApp no oficial
- `node-cron` — Scheduler
- `luxon` — Manejo de zonas horarias
- `dotenv` — Variables de entorno

---

## 2. Configurar credenciales de Google Calendar

### Paso 2.1 — Crear proyecto en Google Cloud Console
1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear nuevo proyecto: `scheduller-advisor-ai`
3. Activar la API: **Google Calendar API**

### Paso 2.2 — Crear credenciales OAuth2
1. Ir a **APIs & Services → Credentials**
2. Crear credencial tipo **OAuth 2.0 Client ID**
3. Tipo de aplicación: **Desktop app**
4. Descargar el JSON con `client_id` y `client_secret`

### Paso 2.3 — Obtener el refresh_token
Ejecutar el siguiente script de autorización una sola vez:

```bash
npx ts-node scripts/get-google-token.ts
```

> **Nota**: Deberás crear el script `scripts/get-google-token.ts` con el flujo OAuth2 de Google para obtener el `refresh_token`. Consulta la documentación de `googleapis` para el flujo de autorización de aplicación de escritorio.

Alternativamente, usa el [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) con el scope `https://www.googleapis.com/auth/calendar.readonly`.

---

## 3. Configurar el archivo .env

```bash
cp .env.example .env
```

Editar `.env` con los valores reales:

```dotenv
GOOGLE_CLIENT_ID=<tu_client_id>
GOOGLE_CLIENT_SECRET=<tu_client_secret>
GOOGLE_REFRESH_TOKEN=<tu_refresh_token>
GOOGLE_CALENDAR_ID=primary

SCAN_INTERVAL_MINUTES=15
REMINDER_MINUTES_BEFORE=15
LOOKAHEAD_HOURS=2
TIMEZONE=America/Bogota
WHATSAPP_SESSION_PATH=./whatsapp-session
```

---

## 4. Compilar el proyecto

```bash
npm run build
```

Genera los archivos JavaScript en `dist/`.

**Verificar compilación exitosa:**
```bash
# Sin errores de TypeScript
npm run lint
```

---

## 5. Ejecutar el servicio

### Modo desarrollo (ts-node, sin compilar)
```bash
npm run dev
```

### Modo producción (compilado)
```bash
npm start
```

### Con PM2 (recomendado para producción)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el servicio
pm2 start dist/index.js --name scheduller-advisor-ai

# Ver logs en tiempo real
pm2 logs scheduller-advisor-ai

# Configurar auto-inicio con el sistema
pm2 startup
pm2 save
```

---

## 6. Primer arranque — Vincular WhatsApp

Al ejecutar por primera vez, verás en la consola:

```
[2026-04-22 10:00:00] [INFO ] [WhatsApp] Escanea el QR con tu celular para vincular la sesión
```

Seguido de un código QR en formato ASCII.

**Pasos:**
1. Abrir WhatsApp en tu celular
2. Ir a **Dispositivos vinculados → Vincular un dispositivo**
3. Escanear el QR que aparece en la consola
4. Esperar mensaje: `[WhatsApp] Cliente conectado y listo para enviar mensajes`

La sesión queda guardada en `./whatsapp-session/` y no necesitarás repetir este paso en reinicios.

---

## 7. Verificar funcionamiento

Tras el arranque exitoso deberías ver:
```
====== SchedullerAdvisor AI — Iniciando ======
Intervalo de escaneo: 15 minutos
Anticipación de recordatorio: 15 minutos
Lookahead: 2 horas
Timezone: America/Bogota
Calendario: primary
[WhatsApp] Inicializando cliente...
[WhatsApp] Cliente conectado y listo para enviar mensajes
[Scheduler] Iniciado. Expresión cron: */15 * * * *
[Scheduler] Iniciando ciclo de escaneo
[FetchUpcomingEvents] N eventos notificables encontrados
[Scheduler] Ciclo completado. Notificaciones enviadas: M
```
