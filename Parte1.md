# Parte 1 – Análisis del Proyecto Actual

Antes de realizar cambios, el equipo debe responder colectivamente:

---

## • ¿Qué responsabilidades existen actualmente dentro del archivo principal?

El archivo `script.js` (385 líneas) tenía las siguientes responsabilidades todas mezcladas:

1. **Obtener referencias del DOM** – `getElementById` para cada elemento del HTML.
2. **Comunicación con la API** – Peticiones `fetch` al backend (`GET /users`, `GET /tasks`, `POST /tasks`, `PATCH /tasks`, `DELETE /tasks`).
3. **Estado global** – Variables `currentUser` y `tasks` para mantener al usuario y sus tareas.
4. **Lógica de búsqueda** – Buscar usuario por ID, mostrar sus datos y cargar sus tareas.
5. **Validaciones** – Revisar que los campos del formulario no estén vacíos antes de enviar.
6. **CRUD de tareas** – Crear, leer, editar (inline) y eliminar tareas.
7. **Renderizado de la tabla** – Crear filas HTML, alternar modo edición, mostrar/ocultar estado vacío.
8. **Notificaciones** – Mostrar mensajes al usuario (toast, errores, usuario no encontrado).
9. **Actualizar contador** – Mostrar "1 tarea" o "N tareas" según la cantidad.

---

## • ¿Qué funciones pertenecen a la interfaz?

Funciones que solo se encargan de mostrar/ocultar cosas en pantalla (NO tienen lógica de negocio ni llamadas API):

| Función | ¿Qué hace? |
|---------|-----------|
| `showUserInfo(user)` | Muestra los datos del usuario encontrado |
| `showUserNotFound()` | Muestra mensaje de "usuario no registrado" |
| `showValidationError(msg)` | Muestra un error de validación |
| `clearFieldErrors()` | Limpia los mensajes de error de los campos |
| `showFieldError(inputId, errorId, msg)` | Muestra error debajo de un campo específico |
| `showToast(message, type)` | Muestra una notificación toast (verde/rojo/amarillo) |
| `enableTaskForm()` | Hace visible el formulario de tareas |
| `hideEmptyState()` | Oculta el mensaje de "no hay tareas" |
| `showEmptyState(tasks)` | Muestra el mensaje de "no hay tareas" si no hay ninguna |
| `updateTaskCount(tasks)` | Actualiza el texto del contador |
| `createTaskElement(task, callbacks)` | Crea una fila en la tabla con botones |
| `enableEditMode(row, task)` | Cambia una fila a modo edición |
| `cancelEdit(row, task)` | Sale del modo edición y vuelve a la vista normal |
| `disableAllEditModes(tasks)` | Cierra todos los modos edición abiertos |

---

## • ¿Qué funciones realizan comunicación con la API?

Funciones que solo hacen peticiones al servidor (fetch), sin validar datos ni tocar la pantalla:

| Función | Método HTTP | Endpoint |
|---------|------------|----------|
| `fetchUsers()` | GET | `/users` |
| `fetchTasksByUser(userId)` | GET | `/tasks?userId=X` |
| `createTask(task)` | POST | `/tasks` |
| `updateTask(taskId, data)` | PATCH | `/tasks/X` |
| `deleteTaskFromApi(taskId)` | DELETE | `/tasks/X` |

Todas devuelven la respuesta del servidor para que otra función la procese.

---

## • ¿Qué funciones coordinan el flujo general?

Son las que orquestan: llaman a la API, procesan la respuesta, actualizan el estado y le dicen a la interfaz qué mostrar:

| Función | ¿Qué coordina? |
|---------|---------------|
| `searchUser()` | Toma el ID del input → valida → pide usuarios a la API → busca coincidencia → si existe: muestra datos, pide tareas, las pinta en la tabla. Si no: muestra error. |
| `registerTask(event)` | Toma datos del formulario → valida campos → arma objeto con fecha actual → envía a la API → si ok: agrega a la tabla, actualiza contador, limpia formulario, muestra toast. |
| `saveEdit(taskId, row)` | Toma valores de edición → valida → envía cambios a la API → si ok: actualiza estado, sale de edición, refresca la fila, muestra toast. |
| `deleteTask(taskId, row)` | Pide confirmación → envía eliminación a la API → si ok: quita del estado, borra la fila, actualiza contador, muestra toast. |

---

## • ¿Existen funciones reutilizables que podrían aislarse?

Sí, varias funciones no dependen del contexto y pueden usarse desde cualquier parte:

| Función | ¿Por qué es reutilizable? |
|---------|--------------------------|
| `getCurrentTimestamp()` | Solo formatea una fecha. No necesita saber qué tarea ni qué usuario es. |
| `isValidInput(value)` | Solo revisa si un valor está vacío. Sirve para cualquier campo del proyecto. |
| `statusColors` | Objeto con colores. Se puede usar donde sea necesario pintar un estado. |
| `showToast()` | Muestra un mensaje temporal. Puede usarse desde cualquier operación. |
| `clearFieldErrors()` | Limpia errores de formulario. Se puede llamar antes de cualquier validación. |
| `showFieldError()` | Muestra error debajo de un campo específico. Reutilizable en cualquier formulario. |

---

## • Esquema de bloques funcionales (antes de la reorganización)

```
┌─────────────────────────────────────────────────────────────┐
│                     script.js  (385 líneas)                  │
│                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│   │  REFERENCIAS │  │  ESTADO      │  │  VALIDACIONES    │ │
│   │  DEL DOM     │  │  GLOBAL      │  │                  │ │
│   │              │  │              │  │  isValidInput()  │ │
│   │  getElement- │  │  currentUser │  │  validarCampos() │ │
│   │  ById() x9   │  │  tasks[]     │  │                  │ │
│   └──────────────┘  └──────────────┘  └──────────────────┘ │
│                                                             │
│   ┌──────────────────┐  ┌────────────────────────────────┐ │
│   │  API (FETCH)     │  │  COORDINACIÓN (LÓGICA NEGOCIO) │ │
│   │                  │  │                                │ │
│   │  fetchUsers()    │  │  searchUser()                  │ │
│   │  fetchTasks()    │  │  registerTask()                │ │
│   │  createTask()    │  │  saveEdit()                    │ │
│   │  updateTask()    │  │  deleteTask()                  │ │
│   │  deleteTask()    │  │                                │ │
│   └──────────────────┘  └────────────────────────────────┘ │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐ │
│   │  INTERFAZ DE USUARIO (UI)                            │ │
│   │                                                      │ │
│   │  showUserInfo()  showUserNotFound()  showToast()     │ │
│   │  createTaskElement()  enableEditMode()  cancelEdit() │ │
│   │  hideEmptyState()  showEmptyState()  updateCount()   │ │
│   └──────────────────────────────────────────────────────┘ │
│                                                             │
│   📌 PROBLEMA: Todo está mezclado → difícil de mantener,   │
│      probar y trabajar en equipo.                          │
└─────────────────────────────────────────────────────────────┘
```

### Resumen de la separación propuesta:

| Bloque | Debería ir a |
|--------|-------------|
| Referencias del DOM | `ui/dom.js` |
| Comunicación con API | `api/tareasApi.js` |
| Validaciones y utilidades | `utils/helpers.js` |
| Lógica de negocio (coordinación) | `services/tareasService.js` |
| Notificaciones y mensajes | `ui/notifications.js` |
| Renderizado de tabla y edición | `ui/taskRenderer.js` |
| Punto de entrada (eventos) | `app.js` |
