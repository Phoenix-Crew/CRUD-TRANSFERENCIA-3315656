---
title: "[Backend] Configuración inicial del proyecto para base de datos"
assignee: Brian
labels: ["backend", "setup", "config"]
milestone: "Actividad D - Persistencia con BD"
---

## Descripción
Preparar el proyecto backend con las dependencias y configuración necesarias para trabajar con base de datos.

## Tareas
- [ ] Instalar driver de BD (`npm install mysql2` o `npm install pg`)
- [ ] Instalar `dotenv` para variables de entorno
- [ ] Crear archivo `.env.example` con variables documentadas
- [ ] Crear `src/config/database.js` con configuración de conexión
- [ ] Crear script SQL `src/database/init.sql` con tablas:
  - `users` (id, name, email, rol, password, active, ficha)
  - `tasks` (id, title, description, status, createdAt)
  - `task_users` (task_id, user_id) — relación N:M
- [ ] Agregar `.env` al `.gitignore`
- [ ] Verificar que el servidor solo inicia si la conexión a BD es exitosa
- [ ] Actualizar `README.md` con pasos de configuración

## Criterios de aceptación
- [ ] `npm install` instala todas las dependencias
- [ ] `.env.example` documenta todas las variables
- [ ] El servidor rechaza iniciar si no hay BD
- [ ] README actualizado con guía de configuración
