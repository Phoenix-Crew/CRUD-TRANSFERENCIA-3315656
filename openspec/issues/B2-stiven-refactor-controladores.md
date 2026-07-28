---
title: "[Backend] Refactorizar controladores CRUD para usar base de datos"
assignee: Stiven
labels: ["backend", "crud", "controllers", "rf02", "rf03", "rf04", "rf05"]
milestone: "Actividad D - Persistencia con BD"
---

## Descripción
Actualizar todos los controladores para que usen los nuevos modelos con base de datos en lugar de `readDB/writeDB`.

## Tareas

### Task Controller (`task.controller.js`)
- [ ] `create` → usar `TaskModel.create()`
- [ ] `getAll` → usar `TaskModel.findAll()`
- [ ] `getById` → usar `TaskModel.findById()`
- [ ] `update` → usar `TaskModel.update()`
- [ ] `remove` → usar `TaskModel.delete()`
- [ ] `updateStatus` → usar `TaskModel.update()`
- [ ] `filter` → usar `TaskModel.findAll()` con WHERE dinámico
- [ ] `getDashboard` → usar consultas agregadas SQL
- [ ] `assignUsers` → crear tabla intermedia task_users
- [ ] `getAssignedUsers` → JOIN task_users
- [ ] `removeUserAssignment` → DELETE FROM task_users

### User Controller (`user.controller.js`)
- [ ] `create` → usar `UserModel.create()`
- [ ] `getAll` → usar `UserModel.findAll()`
- [ ] `getById` → usar `UserModel.findById()`
- [ ] `update` → usar `UserModel.update()`
- [ ] `remove` → usar `UserModel.delete()`
- [ ] `toggleStatus` → usar `UserModel.update()`
- [ ] `getUserTasks` → JOIN con tasks

### Auth Controller (`auth.controller.js`)
- [ ] `login` → consultar usuario por email en BD

## Criterios de aceptación
- [ ] Todos los endpoints funcionan con BD
- [ ] Se mantiene la arquitectura Routes → Controllers → Models
- [ ] Código de estado HTTP correcto en cada respuesta
- [ ] Los datos persisten al reiniciar el servidor
