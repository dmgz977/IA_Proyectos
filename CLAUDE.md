CLAUDE.md Completo — Plantilla Maestra (copia y adapta)
# [NOMBRE_PROYECTO] — Reglas del Agente AI-DLC

## Metadatos del Proyecto
PROJECT_TYPE: [greenfield | brownfield]
AUTONOMY_LEVEL: [L1 | L2 | L3 | L4]
CURRENT_PHASE: [inception | construction | operations]
CYCLE_NUMBER: 1

## Stack Tecnológico (no negociable)
- Lenguaje principal: [Python 3.11 / TypeScript 5 / Java 21 / Go 1.22]
- Framework web: [FastAPI / NestJS / Spring Boot / Gin]
- Base de datos: [PostgreSQL 15 / MongoDB 7 / MySQL 8]
- ORM / Query builder: [SQLAlchemy / Prisma / Hibernate / GORM]
- Cache: [Redis 7 / Memcached] (si aplica)
- Mensajería: [RabbitMQ / Kafka / SQS] (si aplica)
- Testing: [pytest / Jest / JUnit 5 / Go testing]
- Cobertura mínima requerida: 80%
- Containerización: Docker + docker-compose

## Arquitectura (no modificar sin aprobación humana)
- Patrón: [Clean Architecture / Hexagonal / MVC / CQRS]
- Estructura de capas:
  src/
  ├── api/          (controllers, routers, middlewares)
  ├── domain/       (entidades, value objects, interfaces)
  ├── application/  (casos de uso, servicios de aplicación)
  ├── infrastructure/ (repositorios, adapters externos)
  └── shared/       (utilidades, constantes, excepciones comunes)

## Convenciones de Código
- Nombrado variables: snake_case (Python/Go) | camelCase (TS/Java)
- Nombrado clases: PascalCase siempre
- Nombrado archivos: kebab-case (TS) | snake_case (Python)
- Longitud máxima de función: 40 líneas
- Longitud máxima de archivo: 300 líneas
- Un archivo = una responsabilidad principal
- Comentarios: solo para lógica NO obvia. En español.
- No usar abreviaciones oscuras. Nombres descriptivos siempre.

## Reglas de Testing
- OBLIGATORIO: escribir tests ANTES del código (TDD)
- Nombrado: test_should_[acción]_when_[condición]
- No mockear la función bajo prueba
- Mocks solo para dependencias externas (DB, APIs, filesystem)
- Un test = una sola aserción de comportamiento
- Tests de integración: obligatorios para cada endpoint

## Reglas de Seguridad (nunca violar)
- NUNCA hardcodear credenciales, tokens, o claves
- SIEMPRE usar variables de entorno para configuración sensible
- SIEMPRE validar y sanitizar toda entrada de usuario
- NUNCA loggear contraseñas, tokens, o PII
- SIEMPRE usar hash para contraseñas (bcrypt, argon2id)
- SIEMPRE parametrizar queries SQL (nunca concatenar strings)
- Revisar OWASP Top 10 antes de cada Bolt de superficie de API

## Reglas de Git
- Formato de commits: tipo(scope): descripción en presente
  Tipos: feat | fix | test | refactor | docs | chore | security
- Un commit por unidad atómica de cambio
- NUNCA hacer commit de .env, secrets, o archivos con credenciales
- NUNCA hacer push directo a main

## Autonomía del Agente

### Puede hacer sin pedir permiso:
- Leer cualquier archivo del repositorio
- Crear/modificar archivos en src/, tests/, docs/
- Ejecutar tests (pytest/npm test/go test)
- Ejecutar linters y formatters
- Hacer commits con prefijo wip: durante el Bolt

### SIEMPRE pedir confirmación antes de:
- Modificar CLAUDE.md, .github/workflows/, o archivos de configuración raíz
- Eliminar archivos existentes
- Agregar dependencias nuevas (requirements.txt / package.json / go.mod)
- Tomar decisiones de arquitectura no documentadas aquí
- Hacer merge a ramas main o staging
- Ejecutar migraciones de base de datos

### Si encuentra ambigüedad:
- Primero busca la respuesta en: este CLAUDE.md, prd.md, unit activa
- Si no encuentra respuesta, formula UNA pregunta concreta y específica
- No hace suposiciones silenciosas en decisiones de arquitectura
- Reporta el bloqueo con contexto si no puede continuar

## Anti-Alucinación
- Si no sabe algo, DICE que no sabe. No inventa.
- Si el código existente contradice los docs, confía en el código.
- Antes de modificar código existente, describe qué hace actualmente.
- No agrega funcionalidad que no esté en la Unit activa.
- No modifica archivos fuera del scope del Bolt activo.

## Formato de Reporte al Finalizar un Bolt
Al terminar cada Bolt, reportar SIEMPRE en este formato:
BOLT COMPLETADO: [Bolt-NN]
Archivos creados: [lista]
Archivos modificados: [lista]
Tests escritos: [N] | Tests pasando: [N] | Cobertura: [X]%
Decisiones tomadas: [lista de decisiones no triviales]
Pendiente de revisión humana: [lista o 'ninguno']
