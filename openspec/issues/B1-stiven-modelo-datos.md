---
title: "[Backend] Migrar modelo de persistencia de JSON a base de datos SQL"
assignee: Stiven
labels: ["backend", "database", "model", "rf01"]
milestone: "Actividad D - Persistencia con BD"
---

## Descripción
Reemplazar el almacenamiento en `db.json` por una base de datos real (MySQL o PostgreSQL).

## Tareas
- [ ] Crear `src/config/database.js` con la conexión a la BD
- [ ] Configurar variables de entorno (`.env`): DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- [ ] Crear `src/models/task.model.js` con métodos SQL:
  - `create(data)` → INSERT
  - `findAll()` → SELECT
  - `findById(id)` → SELECT WHERE
  - `update(id, data)` → UPDATE
  - `delete(id)` → DELETE
- [ ] Crear `src/models/user.model.js` con mismos métodos
- [ ] Crear script SQL (`src/database/init.sql`) para generar tablas
- [ ] Migrar datos existentes de `db.json` a la BD

## Criterios de aceptación
- [ ] La conexión a BD se configura desde `.env`
- [ ] Los modelos ejecutan SQL correctamente
- [ ] Las tablas se crean automáticamente al iniciar
