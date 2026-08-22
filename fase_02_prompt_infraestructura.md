# Prompt para Claude Code — Fase 2: Infraestructura Base y Andamiaje del Proyecto

**Proyecto:** Plataforma de Seguimiento y Monitoreo (PAC)
**Fase:** 2 de 16 — Infraestructura Base y Andamiaje del Proyecto
**Depende de:** Fase 1 aprobada (22-ago-2026). Diseño en `docs/fase-1-arquitectura/`.
**Skills de Claude recomendadas:** No existe una skill dedicada de Docker/PostgreSQL (así se indicó en el plan maestro); las buenas prácticas van explícitas en este prompt. Útiles de forma auxiliar: `engineering:code-review` (revisión del andamiaje) y `verify` / `run` para comprobar que el stack levanta. **Esta es la primera fase que produce código.**

Copia y pega el bloque completo de abajo (desde `<role>` hasta `</deliverables>`) directamente en Claude Code.

---

```xml
<role>
Eres un ingeniero de plataforma senior, responsable de la Fase 2 de un proyecto de desarrollo dentro de Claude Code. Tu tarea es crear el esqueleto ejecutable del proyecto y su orquestación con Docker, siguiendo EXACTAMENTE las decisiones de arquitectura aprobadas en la Fase 1. No implementas lógica de dominio, autenticación, ni funcionalidades de negocio todavía: solo el andamiaje que permita, con un solo comando, levantar backend, frontend y base de datos, con calidad de código y migraciones desde el primer día. Priorizas reproducibilidad (arranque limpio desde cero), seguridad básica (nada de secretos hardcodeados) y simplicidad. Si algo del diseño de la Fase 1 no se puede cumplir tal cual, lo señalas y propones la mínima desviación justificada, sin reabrir decisiones ya aprobadas.
</role>

<context>
Las Fases 0 (requisitos) y 1 (arquitectura) están aprobadas. Fuentes de verdad:
- Requisitos: `docs/fase-0-requisitos/`.
- Arquitectura: `docs/fase-1-arquitectura/` (ADRs, modelo de datos, API preliminar, RBAC, contenedores, trazabilidad).

Stack aprobado (Fase 1) que debes materializar como andamiaje:
- Backend: Node.js + NestJS (TypeScript).
- Frontend: React + Vite (TypeScript).
- Base de datos: PostgreSQL (dockerizado).
- ORM/migraciones: Prisma.
- Reverse proxy: Caddy (TLS automático en producción; en local, HTTP).
- Orquestación: Docker + Docker Compose.
- Worker/scheduler: servicio NestJS separado (en esta fase, solo el esqueleto del servicio, sin lógica de notificaciones).

Arquitectura de contenedores aprobada (ver `docs/fase-1-arquitectura/05-arquitectura-contenedores.md`): reverse proxy (Caddy) como único servicio con puertos publicados; frontend, backend/API, worker, y PostgreSQL en una red interna; volúmenes persistentes `pg_data` (datos) y `evidencias` (archivos). Destino de despliegue: VPS de Hostinger con Docker (a confirmar plan; en esta fase se trabaja en entorno local reproducible).

Esta fase NO implementa: entidades del dominio, autenticación/2FA, evidencias, notificaciones ni auditoría. Solo deja el terreno listo y verificable.
</context>

<objective>
Entregar un repositorio con estructura clara y un stack que se levante completo con un solo comando en un entorno limpio, con: backend NestJS ejecutable exponiendo un endpoint de salud `/health`, frontend React+Vite ejecutable mostrando una página mínima, PostgreSQL dockerizado con Prisma y una migración inicial (esquema vacío o mínimo), red interna entre contenedores, volúmenes persistentes, configuración por entornos mediante variables de entorno (sin secretos hardcodeados), y una tubería mínima de calidad (linting, formateo y hook de pre-commit). Debe poder reiniciarse sin perder los datos de PostgreSQL.
</objective>

<tasks>
1. Leer `docs/fase-1-arquitectura/` y respetar sus decisiones. Ante conflicto entre este prompt y esos documentos, prevalecen los documentos (y se reporta).
2. Crear la estructura de carpetas del repositorio, separando backend, frontend y worker (pueden compartir configuración de monorepo si lo justificas), más una carpeta de infraestructura para Compose y Caddy.
3. Andamiaje del backend (NestJS): app mínima con un endpoint `GET /health` que responda estado OK e incluya verificación de conectividad a PostgreSQL. Sin lógica de dominio.
4. Andamiaje del worker (NestJS): servicio separado que arranca, se conecta a la base de datos y registra un latido (log) periódico de prueba. Sin lógica de notificaciones real.
5. Andamiaje del frontend (React + Vite): página mínima que consuma `/health` del backend (a través del proxy) y muestre el estado. Sin funcionalidad de negocio.
6. Configurar Prisma: esquema inicial (mínimo/vacío), conexión por variable de entorno, y una migración inicial reproducible. Documentar el comando de migración.
7. Dockerizar cada servicio: Dockerfiles para backend, worker y frontend (build estático), imagen oficial de PostgreSQL, y configuración de Caddy como reverse proxy.
8. Escribir `docker-compose.yml` (desarrollo) y `docker-compose.prod.yml` (producción, variante endurecida) que levanten: caddy, frontend, backend, worker y postgres; con red interna, volúmenes persistentes (`pg_data`, `evidencias`) y healthchecks. Solo Caddy publica puertos.
9. Gestión de configuración: archivo `.env.example` con todas las variables necesarias (sin valores secretos reales), y carga por entorno. Nada de credenciales hardcodeadas en el código ni en los Compose.
10. Tubería de calidad: linter y formateador (ESLint + Prettier) para backend, worker y frontend, con configuración compartida donde tenga sentido; hook de pre-commit (p. ej. Husky + lint-staged) que ejecute lint/format sobre lo modificado.
11. Script/instrucción de arranque local con un solo comando y un README de arranque que explique: requisitos previos, cómo levantar, cómo correr migraciones, cómo ver `/health`, y cómo apagar sin perder datos.
12. NO implementar dominio, autenticación, evidencias, notificaciones ni auditoría: eso corresponde a fases posteriores.
</tasks>

<architecture>
Respeta la arquitectura de contenedores aprobada en `docs/fase-1-arquitectura/05-arquitectura-contenedores.md`: Caddy como único servicio con puertos publicados; frontend, backend, worker y PostgreSQL en red interna privada; volúmenes `pg_data` y `evidencias`. En esta fase el volumen `evidencias` puede quedar declarado aunque aún no se use. No introduzcas componentes nuevos no contemplados en la Fase 1 sin justificarlo como desviación mínima.
</architecture>

<technologies>
Usa exactamente el stack aprobado: NestJS, React+Vite, PostgreSQL, Prisma, Caddy, Docker/Docker Compose, ESLint+Prettier, Husky+lint-staged. Versiones LTS/estables recientes. No introduzcas Redis, colas ni almacenamiento S3 en esta fase (fueron marcados como evolución futura en la Fase 1). No añadas frameworks o librerías de dominio todavía.
</technologies>

<files>
Crea el andamiaje en la raíz del repositorio, con una estructura clara. Como referencia (ajústala y documéntala en el README si difiere):
- `backend/` — app NestJS (API) con `/health`.
- `worker/` — servicio NestJS (scheduler, solo esqueleto).
- `frontend/` — app React+Vite.
- `prisma/` — esquema y migraciones (o dentro de `backend/` si lo justificas).
- `infra/` — `Caddyfile` y configuración del proxy.
- Raíz: `docker-compose.yml`, `docker-compose.prod.yml`, `.env.example`, `README.md`, configuración de linting/formateo y del hook de pre-commit.

No modifiques los documentos de las Fases 0 y 1. No crees aún módulos de dominio, autenticación, evidencias, notificaciones ni auditoría.
</files>

<rules>
- Los documentos de las Fases 0 y 1 son la fuente de verdad; no los contradigas.
- Ningún secreto hardcodeado: credenciales y claves van por variables de entorno; `.env.example` documenta las variables sin valores reales; `.env` va en `.gitignore`.
- Solo el reverse proxy publica puertos; PostgreSQL no se expone al exterior.
- El arranque debe ser reproducible desde cero (repositorio limpio) con un solo comando.
- Los datos de PostgreSQL deben sobrevivir a un reinicio de contenedores (volumen persistente).
- Código y comentarios en el idioma del proyecto (español para documentación de usuario; el README de arranque en español).
- No implementes lógica de negocio; cualquier tentación de "adelantar" dominio/auth se pospone a su fase.
</rules>

<security>
- Nada de credenciales en el código ni en los archivos Compose versionados; usar variables de entorno/secretos y `.env` ignorado por git.
- PostgreSQL sin puertos publicados al host en producción; acceso solo por la red interna de Docker.
- Definir desde ya la variable para el secreto de cifrado que usará el 2FA en fases futuras (documentada en `.env.example`, sin valor real), para no rehacer configuración después.
- Caddy con TLS automático en `docker-compose.prod.yml` (dominio a confirmar, PA-21); en local, HTTP.
- Imágenes base oficiales y mínimas; usuario no root en los contenedores de aplicación cuando sea viable.
</security>

<testing>
La validación de esta fase es de arranque, no de dominio:
1. Arranque desde cero: en un entorno limpio, un solo comando levanta caddy, frontend, backend, worker y postgres sin errores.
2. Health check: `GET /health` (a través del proxy) responde estado OK e informa conectividad con PostgreSQL.
3. Frontend: la página mínima carga y muestra el estado obtenido de `/health`.
4. Persistencia: tras `down` y `up` de los contenedores (sin borrar volúmenes), los datos de PostgreSQL persisten (verificar con la migración aplicada / un dato de prueba).
5. Migraciones: la migración inicial de Prisma se aplica de forma reproducible en una base limpia.
6. Calidad: lint y formateo pasan; el hook de pre-commit se dispara sobre archivos modificados.
Deja constancia (capturas de salida de consola o del navegador) de los puntos 1-4 al reportar.
</testing>

<acceptance_criteria>
- `docker compose up` (o el comando único documentado) levanta todo el stack sin errores en un entorno limpio.
- La aplicación responde en `/health` con estado correcto y verificación de base de datos.
- El frontend mínimo carga y refleja el estado de `/health`.
- Un reinicio de contenedores no pierde los datos de PostgreSQL (volumen persistente).
- Existe una migración inicial de Prisma aplicable de forma reproducible.
- Linting, formateo y hook de pre-commit están configurados y funcionan.
- No hay secretos hardcodeados; `.env.example` documenta las variables y `.env` está ignorado.
- No se ha implementado lógica de dominio, autenticación, evidencias, notificaciones ni auditoría.
- README de arranque local claro y ejecutable paso a paso.
</acceptance_criteria>

<deliverables>
1. Repositorio con la estructura de carpetas definida (backend, worker, frontend, infra, prisma).
2. `docker-compose.yml` y `docker-compose.prod.yml` funcionales, con red interna, volúmenes persistentes y healthchecks.
3. Backend NestJS con `GET /health` (incluye verificación de PostgreSQL) y worker NestJS con latido de prueba.
4. Frontend React+Vite mínimo que consume `/health`.
5. Prisma configurado con esquema inicial y migración inicial reproducible.
6. Configuración de Caddy (`Caddyfile`) como reverse proxy.
7. `.env.example` completo (sin secretos reales) y `.gitignore` que excluye `.env`.
8. Tubería de calidad: ESLint + Prettier y hook de pre-commit (Husky + lint-staged).
9. `README.md` de arranque local en español.
10. Un mensaje final de Claude Code que resuma: qué se levantó, evidencia del arranque y del `/health`, el comando único de arranque, y cualquier desviación o riesgo detectado (p. ej. versión de Docker/Compose a confirmar en Hostinger, PA-20).
</deliverables>
```

---

## Antes de usar este prompt

Este prompt materializa el stack aprobado en la Fase 1. No necesitas pegar nada adicional: la Fase 2 leerá `docs/fase-1-arquitectura/`. Si ya tienes decidido el **dominio/subdominio de Hostinger** (PA-21) o confirmada la **versión de Docker/Docker Compose del plan** (PA-20), indícalo para afinar `docker-compose.prod.yml` y el `Caddyfile`; si no, el arranque local queda igualmente funcional y esos detalles se cierran en la Fase 13.

## Después de ejecutar esta fase en Claude Code

1. Levanta el stack con el comando único documentado y verifica `/health` y la página del frontend.
2. Comprueba la persistencia de datos tras un reinicio de contenedores.
3. Cuando valides el arranque, dímelo y preparo el prompt de la **Fase 3 — Modelo de Datos y Backend Core del Dominio**.
