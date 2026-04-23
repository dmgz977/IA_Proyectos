# Integration Test Instructions — SchedullerAdvisor AI

---

## Alcance

Los tests de integración validan la interacción entre el scheduler y las APIs externas reales (Google Calendar y WhatsApp). Requieren credenciales válidas configuradas en `.env`.

> **Nota**: Estos tests NO se ejecutan en CI automático por requerir credenciales reales y conexión de red.

---

## Test de Integración 1 — Google Calendar API

**Objetivo**: Verificar que `GoogleCalendarAdapter` conecta correctamente con la API real y mapea los eventos.

**Pre-requisitos**:
- `.env` con `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` válidos
- Al menos un evento en el calendario en las próximas 2 horas (crear uno de prueba)

**Ejecución manual**:
```typescript
// scripts/test-google-calendar.ts
import 'dotenv/config';
import { loadConfig } from '../src/shared/config';
import { ConsoleLogger } from '../src/shared/logger';
import { GoogleCalendarAdapter } from '../src/infrastructure/google-calendar/google-calendar.adapter';

async function main() {
  const config = loadConfig();
  const logger = new ConsoleLogger();
  const adapter = new GoogleCalendarAdapter(config, logger);

  console.log('Consultando eventos de las próximas 2 horas...');
  const events = await adapter.getUpcomingEvents(2);
  console.log(`Eventos encontrados: ${events.length}`);
  events.forEach(e => {
    console.log(`- ${e.title} | ${e.startTime.toISOString()} | ${e.displayLocation()}`);
  });
}

main().catch(console.error);
```

```bash
npx ts-node scripts/test-google-calendar.ts
```

**Resultado esperado**: Lista de eventos próximos sin errores de autenticación.

---

## Test de Integración 2 — WhatsApp (envío de mensaje de prueba)

**Objetivo**: Verificar que `WhatsAppWebAdapter` envía correctamente un mensaje a tu propio número.

**Pre-requisitos**:
- Sesión de WhatsApp vinculada (haber ejecutado el servicio al menos una vez)

**Ejecución manual**:
```typescript
// scripts/test-whatsapp.ts
import 'dotenv/config';
import { loadConfig } from '../src/shared/config';
import { ConsoleLogger } from '../src/shared/logger';
import { WhatsAppWebAdapter } from '../src/infrastructure/whatsapp/whatsapp-web.adapter';

async function main() {
  const config = loadConfig();
  const logger = new ConsoleLogger();
  const adapter = new WhatsAppWebAdapter(config, logger);

  await adapter.initialize();
  const ownNumber = await adapter.getOwnNumber();

  await adapter.sendMessage(ownNumber, '✅ Test de integración SchedullerAdvisor AI — OK');
  console.log('Mensaje de prueba enviado correctamente');
  process.exit(0);
}

main().catch(console.error);
```

```bash
npx ts-node scripts/test-whatsapp.ts
```

**Resultado esperado**: Recibes en tu WhatsApp el mensaje `✅ Test de integración SchedullerAdvisor AI — OK`.

---

## Test de Integración 3 — Ciclo completo end-to-end

**Objetivo**: Verificar el flujo completo: calendario → evaluación → mensaje → WhatsApp.

**Pre-requisitos**:
- Credenciales Google válidas
- Sesión WhatsApp vinculada
- Un evento en tu calendario en los próximos 15 minutos

**Procedimiento**:
1. Crear un evento de prueba en Google Calendar que comience en 14 minutos
2. Ejecutar el servicio: `npm run dev`
3. Observar los logs: debe detectar el evento y enviar la notificación
4. Verificar recepción del mensaje en WhatsApp

**Checklist de validación**:
- [ ] El servicio arranca sin errores
- [ ] Se muestra el conteo de eventos encontrados en logs
- [ ] El evento de prueba aparece como "notificable"
- [ ] Se recibe el mensaje WhatsApp con los datos correctos
- [ ] La hora en el mensaje está en zona horaria Bogotá
- [ ] No se recibe duplicado en el siguiente ciclo de escaneo
