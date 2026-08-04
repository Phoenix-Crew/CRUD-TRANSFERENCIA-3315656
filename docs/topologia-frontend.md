# Topología del Frontend — Gestión de Tareas (Grupo 4)

Archivo de referencia que mapea **cada botón / evento del frontend** indicando:
1. Qué botón lo dispara (ID + selector)
2. Qué función de `app.js` recibe el evento
3. Qué función de servicio (`tareasService` / `usersService`) llama
4. Qué función de API (`tareasApi` / `usersApi`) ejecuta
5. Qué endpoint backend (`Express → ruta → controlador → modelo`) recibe
6. Qué recibe el backend (params, body, query)
7. Qué devuelve el backend
8. Qué función de renderizado (`taskRenderer`, `userRenderer`, `notifications`) se encarga de pintar la respuesta

---

## 1. Navegación por pestañas

| # | Botón / Elemento | ID | data-attribute | Función en app.js | ¿Llama a servicio? | Qué hace |
|---|---|---|---|---|---|---|
| 1 | Pestaña **Tareas** | `navTasks` | `data-section="tasks"` | `switchSection('tasks')` inline | No | Quita `nav-tab--active` de todas las pestañas, se la pone a `navTasks`. Oculta todas las `section-content` y muestra `#section-tasks`. |
| 2 | Pestaña **Admin** | `navAdmin` | `data-section="admin"` | `switchSection('admin')` inline | No | Mismo patrón: activa `navAdmin`, muestra `#section-admin`. |
| 3 | Pestaña **Usuarios** | `navUsers` | `data-section="users"` | `switchSection('users')` inline | No | Mismo patrón: activa `navUsers`, muestra `#section-users`. |

**Flujo:** `click` → `app.js` (líneas 47–60) → toggle de clases CSS → sin llamada a servicio ni API.

---

## 2. Búsqueda de usuario

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe el backend | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón **Buscar** | `btnSearch` | `click` | `searchUser()` | `tareasService.searchUser()` | `tareasApi.fetchUsers()` + `tareasApi.fetchTasksByUser()` | `GET /api/users` y `GET /api/users/:userId/tasks` | Ninguno (GET) | Array de usuarios (sin password) + array de tareas del usuario | `notifications.showUserInfo(user)` + `taskRenderer` renderiza tareas |
| 2 | Input de ID | `userIdInput` | `keypress` (Enter) | `searchUser()` | `tareasService.searchUser()` | (idem arriba) | (idem arriba) | Ninguno | (idem arriba) | (idem arriba) |

**Flujo detallado:**
1. `app.js` escucha `click` en `btnSearch` y `keypress` (Enter) en `userIdInput`.
2. Llama a `tareasService.searchUser()`.
3. `tareasService` llama a `tareasApi.fetchUsers()` → `GET /api/users` → Express → `user.controller.getAll` → `UserModel.findAll` → devuelve array de usuarios.
4. Si el usuario existe, `tareasService` llama `tareasApi.fetchTasksByUser(userId)` → `GET /api/users/:userId/tasks` → Express → `user.controller.getUserTasks` → `TaskModel.findByUserId` (SELECT + JOIN task_users) → devuelve tareas.
5. `notifications.showUserInfo(user)` pinta la tarjeta verde con nombre/rol/ficha.
6. `taskRenderer` renderiza las tareas del usuario en la tabla.
7. Si no existe: `notifications.showUserNotFound()` → tarjeta roja + oculta formulario.

---

## 3. Registro de tarea

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe el backend | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Formulario de tarea | `taskForm` | `submit` | `registerTask()` | `tareasService.registerTask()` | `tareasApi.createTask()` | `POST /api/tasks` | Body JSON: `{ title, description, status, assignedUserIds }` | Tarea creada (con ID) | `taskRenderer.createTaskElement(task)` agrega fila a la tabla |

**Flujo detallado:**
1. `app.js` escucha `submit` en `taskForm`.
2. Llama a `tareasService.registerTask()`.
3. `tareasService` valida los campos y llama `tareasApi.createTask(body)` → `POST /api/tasks` → Express → `task.controller.create` → `TaskModel.create` (INSERT) → devuelve la tarea creada.
4. `taskRenderer.createTaskElement(task)` agrega la nueva fila a la tabla.
5. `notifications.showToast('Tarea creada', 'success')`.
6. El formulario se limpia y se oculta.

---

## 4. Filtro por estado de tareas

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Select filtro | `filterStatus` | `change` | `setFilterStatus(valor)` | `tareasService.setFilterStatus()` | No llama API (filtro en memoria) | — | El valor seleccionado (`'all'`, `'Pendiente'`, `'En progreso'`, `'Completada'`) | Array de tareas filtrado | `taskRenderer` re-renderiza la tabla |

**Flujo:** `change` → `tareasService.setFilterStatus(value)` → filtra el array en memoria → `taskRenderer` re-renderiza.

---

## 5. Ordenamiento de tareas

### 5a. Botón de dirección de ordenamiento

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón dirección | `sortDirection` | `click` | `toggleSortDirection()` | `tareasService.toggleSortDirection()` | No llama API | Ninguno (alterna internamente) | Dirección invertida (`asc` ↔ `desc`) | `taskRenderer.updateSortButtonLabel(dir)` + `taskRenderer.updateSortIcons(criteria, dir)` + re-render tabla |

### 5b. Encabezados clickeables de la tabla

| # | Elemento | Selector | Evento | Función en app.js | Servicio | API | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `<th data-sort="title\|status\|createdAt">` | `th.sortable` | `click` | `setSortCriteria(criterio)` | `tareasService.setSortCriteria()` | No llama API | `dataset.sort` del `<th>` clickeado | Array de tareas reordenado | `taskRenderer.updateSortIcons(criteria, direction)` + re-render tabla |

**Flujo:** `click` en `<th>` → `app.js` lee `dataset.sort` → `tareasService.setSortCriteria(criteria)` → reordena en memoria → `taskRenderer` actualiza iconos y re-renderiza.

---

## 6. Exportación JSON

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Exportar | `exportBtn` | `click` | `exportVisibleTasks()` | `tareasService.exportVisibleTasks()` | No llama API (usa datos ya en memoria) | — | Ninguno (usa el array filtrado/ordenado actual) | Archivo JSON descargado en el navegador | No hay renderizado; se descarga el archivo |

**Flujo:** `click` → `tareasService.exportVisibleTasks()` → `taskRenderer.downloadJson(filename, JSON.stringify(tareas))` → crea Blob → `<a download>` → el navegador descarga.

---

## 7. Panel Admin — Filtros de administración

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe el backend | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Aplicar Filtros | `adminApplyFilters` | `click` | `applyAdminFilters()` | `tareasService.applyAdminFilters()` | `tareasApi.fetchFilteredTasks()` | `GET /api/tasks/filter?status=&userId=&dateFrom=&dateTo=` | Query params con los filtros seleccionados | Array de tareas filtradas | `taskRenderer` re-renderiza tabla admin + `userRenderer` actualiza tabla de usuarios |

**Flujo:** `click` → `tareasService.applyAdminFilters()` → lee valores de `adminFilterStatus`, `adminFilterUser`, `adminFilterDateFrom`, `adminFilterDateTo` → llama `tareasApi.fetchFilteredTasks(query)` → `GET /api/tasks/filter` → Express → `task.controller.getFiltered` → `TaskModel.findWithFilters` (SELECT con WHERE dinámico) → JSON → re-renderiza tablas.

---

## 8. CRUD de Usuarios

### 8a. Crear usuario

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe el backend | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Nuevo Usuario | `btnCreateUser` | `click` | `openCreateUserModal()` | `usersService.openCreateUserModal()` | `usersApi.createUser()` | `POST /api/users` | Body JSON: `{ name, rol, ficha }` | Usuario creado (con ID) | `userRenderer.renderUserTable(users)` re-renderiza tabla + `notifications.showToast` |

**Flujo:** `click` → `usersService.openCreateUserModal()` → muestra modal con formulario → usuario llena campos → `usersService.createUser(body)` → `usersApi.createUser(body)` → `POST /api/users` → Express → `user.controller.create` → `UserModel.create` → devuelve usuario → `userRenderer.renderUserTable(users)` → `notifications.showToast('Usuario creado', 'success')`.

### 8b. Editar usuario

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Editar (en cada fila de `userRenderer`) | `.btn-edit` (dinámico) | `click` | Dispara `CustomEvent: user:edit` | `usersService.openEditUserModal(user)` | `usersApi.updateUser(id, body)` | `PUT /api/users/:id` | Body JSON: `{ name, rol, ficha }` | Usuario actualizado | `userRenderer.renderUserTable(users)` + `notifications.showToast` |

**Flujo:** `userRenderer` crea botón Editar → al hacer clic dispara `CustomEvent('user:edit', { detail: user })` → `app.js` escucha `document.addEventListener('user:edit', ...)` → `usersService.openEditUserModal(user)` → muestra modal pre-llenado → usuario guarda → `usersService.updateUser(id, body)` → `usersApi.updateUser(id, body)` → `PUT /api/users/:id` → Express → `user.controller.update` → `UserModel.update` → devuelve usuario actualizado → `userRenderer.renderUserTable(users)`.

### 8c. Eliminar usuario

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Eliminar (en cada fila de `userRenderer`) | `.btn-delete` (dinámico) | `click` | Dispara `CustomEvent: user:delete` | `usersService.confirmDeleteUser(id)` | `usersApi.deleteUser(id)` | `DELETE /api/users/:id` | ID del usuario en la URL (`/api/users/:id`) | `{ success: true }` | `userRenderer.renderUserTable(users)` + `notifications.showToast` |

**Flujo:** `userRenderer` crea botón Eliminar → al hacer clic dispara `CustomEvent('user:delete', { detail: { id } })` → `app.js` → `usersService.confirmDeleteUser(id)` → primero muestra `confirmDialog` (Promise<boolean>) → si confirma → `usersService.deleteUser(id)` → `usersApi.deleteUser(id)` → `DELETE /api/users/:id` → Express → `user.controller.delete` → `UserModel.delete` → devuelve `{ success: true }` → `userRenderer.renderUserTable(users)`.

### 8d. Toggle de estado (activar/desactivar)

| # | Botón / Elemento | ID | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Toggle (en cada fila de `userRenderer`) | `.btn-toggle` (dinámico) | `click` | Dispara `CustomEvent: user:toggle` | `usersService.handleToggleStatus(id)` | `usersApi.toggleUserStatus(id)` | `PATCH /api/users/:id/toggle-status` | ID del usuario en la URL | Usuario con `active` invertido | `userRenderer.renderUserTable(users)` + `notifications.showToast` |

**Flujo:** `userRenderer` crea botón Toggle → al hacer clic dispara `CustomEvent('user:toggle', { detail: { id } })` → `app.js` → `usersService.handleToggleStatus(id)` → `usersApi.toggleUserStatus(id)` → `PATCH /api/users/:id/toggle-status` → Express → `user.controller.toggleStatus` → `UserModel.toggleStatus` → devuelve usuario actualizado → `userRenderer.renderUserTable(users)`.

---

## 9. Flujo de acciones sobre tareas (desde `taskRenderer`)

### 9a. Editar tarea

| # | Botón | Clase | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Editar en fila | `.btn-edit` | `click` | `onEdit(task)` (callback inyectado por `tareasService`) | `tareasService.openEditTaskModal(task)` | `tareasApi.updateTask(id, body)` | `PUT /api/tasks/:id` | Body JSON: `{ title, description, status }` | Tarea actualizada | `taskRenderer` re-renderiza la fila + `notifications.showToast` |

### 9b. Completar tarea

| # | Botón | Clase | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Completar | `.btn-complete` | `click` | `completeTaskDirect(task.id)` | `tareasService.completeTask(taskId)` | `tareasApi.updateTask(id, { status: 'Completada' })` | `PUT /api/tasks/:id` | `{ status: 'Completada' }` | Tarea actualizada | `taskRenderer` re-renderiza la fila (botón desaparece) + `notifications.showToast` |

### 9c. Eliminar tarea

| # | Botón | Clase | Evento | Función en app.js | Servicio | API | Endpoint backend | Qué recibe | Qué devuelve | Renderizado |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Botón Eliminar | `.btn-delete` | `click` | `onDelete(taskId)` (callback inyectado por `tareasService`) | `tareasService.deleteTask(taskId)` | `tareasApi.deleteTask(id)` | `DELETE /api/tasks/:id` | ID en la URL | `{ success: true }` | `taskRenderer` remueve la fila del DOM + `notifications.showToast` |

---

## 10. Notificaciones (toasts)

| # | Función que dispara | Módulo | Qué genera | Cómo se renderiza |
|---|---|---|---|---|
| 1 | `notifications.showToast(message, type)` | `ui/notifications.js` | `notificationManager.add(type, message)` | `notificationManager` notifica a suscriptores → `notifications.createToastElement()` crea un `<div.toast>` con icono, mensaje y botón X → se agrega a `#toastContainer` → auto-destrucción tras 4s con animación fade+slide |
| 2 | `notifications.showUserInfo(user)` | `ui/notifications.js` | InnerHTML de `#userInfo` con tarjeta verde | Renderizado directo en el DOM |
| 3 | `notifications.showUserNotFound()` | `ui/notifications.js` | InnerHTML de `#userInfo` con tarjeta roja + oculta `#taskFormContainer` | Renderizado directo |
| 4 | `notifications.showValidationError(msg)` | `ui/notifications.js` | InnerHTML de `#userInfo` con tarjeta amarilla | Renderizado directo |
| 5 | `notifications.showFieldError(inputId, errorId, msg)` | `ui/notifications.js` | Agrega `.error` al input + escribe mensaje en `#errorId` | Renderizado directo |
| 6 | `notifications.clearFieldErrors()` | `ui/notifications.js` | Quita `.error` de inputs y limpia spans `.field-error` | Renderizado directo |

---

## 11. Carga inicial (DOMContentLoaded)

| # | Función | Servicio/API | Endpoint | Qué hace |
|---|---|---|---|---|
| 1 | `showEmptyState([])` | — | — | Muestra el mensaje "sin tareas" en la tabla de tareas |
| 2 | `fetchUsers()` | `tareasApi` | `GET /api/users` | Precarga los usuarios para loguear IDs disponibles en consola |
| 3 | `loadAdminPanel()` | `tareasService` | `GET /api/tasks` (o similar) | Carga estadísticas (total, completadas, pendientes, en progreso) + tablas admin |
| 4 | `loadUsers()` | `usersService` | `GET /api/users` | Carga la tabla de usuarios en la sección "Usuarios" |

**Flujo:** `DOMContentLoaded` → `showEmptyState([])` → `fetchUsers()` (precarga para log) → `loadAdminPanel()` → `loadUsers()`. Si el backend no responde, se captura el error y se continúa con `loadAdminPanel()` de todos modos.

---

## Resumen de dependencias de archivos

```
index.html
  └── app.js (orquestador)
        ├── ui/dom.js (referencias a elementos del HTML)
        ├── services/tareasService.js (lógica de tareas)
        │     ├── api/tareasApi.js (HTTP → backend Express :3002)
        │     └── ui/taskRenderer.js (renderizado de tabla)
        ├── services/usersService.js (lógica de usuarios)
        │     ├── api/usersApi.js (HTTP → backend Express :3002)
        │     └── ui/userRenderer.js (renderizado de tabla de usuarios)
        ├── ui/notifications.js (toasts + feedback)
        │     └── core/NotificationManager.js (cola de notificaciones)
        ├── ui/confirmDialog.js (modal de confirmación)
        ├── ui/editModal.js (modal de edición)
        └── ui/taskRenderer.js (renderizado de tabla de tareas)
```

---

## Resumen de endpoints backend

| Método | Endpoint | Controlador | Modelo | Acción |
|---|---|---|---|---|
| GET | `/api/users` | `user.controller.getAll` | `UserModel.findAll` | Lista todos los usuarios |
| GET | `/api/users/:userId/tasks` | `user.controller.getUserTasks` | `TaskModel.findByUserId` | Tareas asignadas a un usuario |
| POST | `/api/tasks` | `task.controller.create` | `TaskModel.create` | Crea una tarea |
| PUT | `/api/tasks/:id` | `task.controller.update` | `TaskModel.update` | Actualiza una tarea |
| DELETE | `/api/tasks/:id` | `task.controller.delete` | `TaskModel.delete` | Elimina una tarea |
| GET | `/api/tasks/filter` | `task.controller.getFiltered` | `TaskModel.findWithFilters` | Tareas filtradas (admin) |
| POST | `/api/users` | `user.controller.create` | `UserModel.create` | Crea un usuario |
| PUT | `/api/users/:id` | `user.controller.update` | `UserModel.update` | Actualiza un usuario |
| DELETE | `/api/users/:id` | `user.controller.delete` | `UserModel.delete` | Elimina un usuario |
| PATCH | `/api/users/:id/toggle-status` | `user.controller.toggleStatus` | `UserModel.toggleStatus` | Alterna estado activo/inactivo |