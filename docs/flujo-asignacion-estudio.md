# Flujo de "Asignar tarea al usuario" — Documento de estudio

Guía para exponer el flujo completo: frontend → backend → MySQL → pantalla.

---

## 1. El flujo en 6 pasos

1. `app.js` conecta los botones con las funciones (Buscar → `searchUser`, formulario → `registerTask`).
2. `searchUser` pide todos los usuarios al servidor y encuentra el que coincide con el id escrito.
3. `renderUserCheckboxes` dibuja una casilla por cada usuario; cada casilla guarda escondido el id y el nombre.
4. `registerTask` junta las casillas marcadas y arma la lista `assignedUsers` (a quiénes asigno la tarea).
5. Esa lista viaja dentro de la tarea hasta el servidor (`createTask` → `POST /api/tasks`).
6. El servidor guarda la tarea y, por cada asignado, una fila en la tabla `task_users`. Devuelve la tarea con sus asignados y la pantalla la pinta con los nombres.

---

## 2. app.js — el conector

**Archivo:** `client/src/js/app.js`

| Línea | Qué hace |
|---|---|
| `:24` | `btnSearch.addEventListener('click', searchUser)` — botón "Buscar" dispara la búsqueda |
| `:26-34` | `userIdInput.addEventListener('keypress', ...)` — presionar Enter hace lo mismo: `searchUser()` |
| `:41` | `taskForm.addEventListener('submit', registerTask)` — el formulario dispara la asignación |

**Explicación:** `addEventListener` = "avisame cuando pase este evento y ejecuto la función". Las funciones `searchUser` y `registerTask` vienen importadas de `services/tareasService.js` (`app.js:3`).

---

## 3. searchUser — buscar a la persona

**Archivo:** `services/tareasService.js:219` (llega con Ctrl+Click desde `app.js:24`)

| Línea | Qué hace |
|---|---|
| `:222` | `const userId = userIdInput.value` — lee lo escrito en el campo de buscar (`=` se lee "se asigna a") |
| `:225` | `if (!isValidInput(userId))` — valida que no esté vacío. `isValidInput` viene de `utils/helpers.js:10` |
| `:251` | `const users = await fetchUsers()` — pide TODOS los usuarios al servidor. **Ctrl+Click → `api/tareasApi.js:7`**: hace `fetch('/api/users')` y devuelve con `response.json()` un array de objetos usuario: `[{ id, name, email, rol, active, ficha }, ...]` |
| `:254` | `const user = users.find(u => u.id === userId)` — recorre la lista y devuelve el primer usuario cuyo id coincida. Resultado: un objeto usuario, o `undefined` |
| `:260` | `currentUser = user` — guarda el usuario encontrado en el estado global |
| `:263` | `showUserInfo(user)` — pinta sus datos. **Ctrl+Click → `ui/notifications.js:51`** |
| `:266` | `enableTaskForm()` — hace visible el formulario de tarea. **Ctrl+Click → `ui/taskRenderer.js:7`** |
| `:270` | `await renderUserCheckboxes(user.id)` — dibuja las casillas (paso siguiente) |
| `:274` | `await fetchTasksByUser(userId)` — trae las tareas ya asignadas a ese usuario. **Ctrl+Click → `api/tareasApi.js:21`** → `GET /api/users/:id/tasks` |
| `:280` | `applySorting()` — pinta las tareas en la tabla |

---

## 4. renderUserCheckboxes — las casillas para asignar

**Archivo:** `services/tareasService.js:48`

| Línea | Qué hace |
|---|---|
| `:55` | `const users = await fetchUsers()` — todos los usuarios del sistema |
| `:71` | `users.forEach(user => {...})` — recorre cada usuario y crea una casilla |
| `:83` | `checkbox.type = 'checkbox'` — la casilla es de verificación |
| `:86` | `checkbox.value = user.id` — guarda el **id** escondido en la casilla |
| `:89` | `checkbox.dataset.name = user.name` — guarda el **nombre** escondido en la casilla (`dataset` = atributos personalizados) |
| `:95-98` | `if (String(user.id) === String(preSelectedUserId)) checkbox.checked = true` — el usuario buscado ya viene marcado |
| `:105` | `span.textContent = user.name + ' (' + user.rol + ')'` — el texto que ve el usuario |
| `:108-114` | `appendChild` — mete casilla y texto dentro de una etiqueta, y la etiqueta al contenedor `assignedUsersContainer` |

**Contenedores** (si preguntan): `dom.js:37,40,46` → `assignedUsersGroup` (se muestra/oculta), `assignedUsersContainer` (donde viven las casillas), `assignedUsersError` (mensaje si no marca nadie). Están en `index.html:102-111`.

---

## 5. registerTask — el que hace la asignación

**Archivo:** `services/tareasService.js:306` (llega con Ctrl+Click desde `app.js:41`)

| Línea | Qué hace |
|---|---|
| `:309` | `event.preventDefault()` — evita que el formulario recargue la página |
| `:312` | `clearFieldErrors()` — borra mensajes de error de intentos anteriores |
| `:318-331` | `title`, `description`, `status` — lee los campos del formulario y les quita espacios (`trim()`) |
| `:335-351` | Validaciones: si título o descripción están vacíos → `showFieldError(...)` (de `ui/notifications.js:103`) y `hasError = true` |
| `:356-358` | `assignedUsersContainer.querySelectorAll('input[type="checkbox"]:checked')` — busca SOLO las casillas marcadas |
| `:362-369` | Si no hay ninguna → error "Debes seleccionar al menos un usuario." y se detiene |
| `:378-382` | **La línea estrella** — `Array.from(checkedBoxes).map(cb => ({ id: cb.value, name: cb.dataset.name }))` — convierte cada casilla marcada en un objeto `{id, name}`. Resultado: `assignedUsers = [{id:2, name:'Nestor'}, {id:4, name:'Ana'}]` |
| `:385-392` | `taskData = { title, description, status, createdAt, assignedUsers }` — el paquete de la tarea. `createdAt` viene de `utils/helpers.js:6` |
| `:398` | `const response = await createTask(taskData)` — lo envía al servidor |
| `:401-411` | Si `response.ok`: `savedTask = await response.json()` → `tasks.push(savedTask)` (agrega a la lista) → `applySorting()` (repinta la tabla) → `taskForm.reset()` → `showToast(...)` |

---

## 6. createTask — el mensajero

**Archivo:** `api/tareasApi.js:35`

- `:3` `API_URL = import.meta.env.VITE_API_URL` — en desarrollo vale `/api` (definido en `client/.env`), el proxy de Vite lo dirige al backend (`vite.config.js:9-14` → `http://localhost:3002`).
- `:39-47` hace `fetch('/api/tasks', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(taskData) })`.
  - `POST` = "create algo nuevo"
  - `JSON.stringify` = convierte el objeto `taskData` a texto para viajar por HTTP.

Aquí termina el frontend.

---

## 7. El backend — qué pasa cuando llega la petición

Sigue esta cadena de Ctrl+Click:

| Línea | Qué hace |
|---|---|
| `server/src/index.js:30` | `app.use('/api/tasks', taskRoutes)` — monta el enrutador de tareas |
| `routes/task.routes.js:9` | `router.post('/', taskController.create)` — POST en la raíz → función `create` |
| `controllers/task.controller.js:9` | `const { title, description, assignedUsers } = req.body` — saca los datos del body (lo que envió el frontend) |
| `controllers/task.controller.js:16-23` | `await TaskModel.create({ title, description, assignedUsers })` — delega al modelo |

### TaskModel.create — `models/task.model.js:127`

| Línea | Qué hace |
|---|---|
| `:130` | `conn = await pool.getConnection()` — abre una conexión exclusiva de MySQL |
| `:135` | `conn.beginTransaction()` — inicia transacción: se guarda todo o nada |
| `:139-142` | `INSERT INTO tasks (title, description, status, createdAt) VALUES (?, ?, 'Pendiente', NOW())` — guarda la tarea |
| `:145` | `taskId = result.insertId` — MySQL genera el id |
| `:148-151` | Si `assignedUsers` trae gente → `insertAssignments(conn, taskId, assignedUsers)` |

### insertAssignments — `src/models/task.model.js:12` (DONDE se guarda la asignación)

| Línea | Qué hace |
|---|---|
| `:15` | Normaliza: si llega un solo usuario, lo convierte en array |
| `:18` | `for (const entry of list)` — recorre cada asignado |
| `:24` | `userId = entry.id ?? entry.userId ?? entry` — extrae el id en cualquiera de los formatos posibles |
| `:31-33` | `SELECT 1 FROM task_users WHERE task_id=? AND user_id=?` — pregunta si ya existe (evita duplicados) |
| `:40-42` | Si no existe → `INSERT INTO task_users (task_id, user_id) VALUES (?, ?)` |

### Cierre del create

| Línea | Qué hace |
|---|---|
| `:155` | `conn.commit()` — confirma todo |
| `:162` | Si algo falla → `conn.rollback()` — deshace todo (no queda tarea sin asignación) |
| `:158` | `return exports.findById(taskId)` — relee la tarea |
| `src/models/task.model.js:102` | `findById` → `hydrate` (`:86`) → `getAssignedUsersFor` (`:51`): hace `JOIN` entre `task_users` y `users` y arma `assignedUsers = [{id, name}]` |

**Respuesta al frontend:** `res.status(201).json(task)` (`task.controller.js:32`) → la tarea con su `assignedUsers` completo. El frontend la recibe, la agrega a `tasks` y la pinta con los badges en la coluna "Asignados" (`taskRenderer.js:30-57`).

---

## 8. Diccionario rápido — preguntas trampa

| Palabra | Explicación humana | Dónde aparece |
|---|---|---|
| `=` | "se asigna a": guarda un valor en una variable | `tareasService.js:222` |
| `===` | "es exactamente igual a": mismo valor y mismo tipo | `tareasService.js:95` |
| `=>` | función corta (flecha): "con tal cosa haz esto" | `tareasService.js:378` |
| `&&` | "y además" | `task.model.js:148` |
| `??` | "o si está vacío, usa esto" | `task.model.js:24` |
| `find` | devuelve el primer elemento que cumpla la condición | `tareasService.js:254` |
| `forEach` | recorre toda la lista (no devuelve nada) | `tareasService.js:71` |
| `map` | recorre y devuelve una lista NUEVA transformada | `tareasService.js:378` |
| `push` | agrega un elemento al final del array | `tareasService.js:407` |
| `trim()` | quita espacios de sobra al inicio y final | `tareasService.js:325` |
| `Array.from` | convierte una lista en un array real | `tareasService.js:378` |
| `querySelectorAll(':checked')` | "dame las casillas marcadas" | `tareasService.js:356-360` |
| `getElementById` | busca un elemento del HTML por su id | `dom.js:37` |
| `createElement` + `appendChild` | creo un elemento y lo meto dentro de otro | `tareasService.js:71-114` |
| `innerHTML` | el contenido HTML dentro de un contenedor | `notifications.js:54` |
| `value` | el texto que lee un input | `tareasService.js:222` |
| `dataset.name` | atributo personalizado del elemento | `tareasService.js:89` |
| `checked = true` | marca la casilla | `tareasService.js:98` |
| `addEventListener` | "cuando pase el evento, ejecuta la función" | `app.js:24` |
| `async` / `await` | la función espera a que termine la llamada | `tareasService.js:251` |
| `fetch` | hace una petición HTTP al servidor | `tareasApi.js:39` |
| `JSON.stringify` | convierte objeto → texto JSON | `tareasApi.js:44` |
| `response.ok` | el servidor respondió bien (200) | `tareasService.js:401` |
| `response.json()` | convierte la respuesta a objeto JS | `tareasService.js:404` |
| `try / catch` | intenta algo; si falla, atrapa el error | `tareasService.js:396-423` |
| `transacción` (begin/commit/rollback) | "todo o nada": se guarda completo o se deshace | `task.model.js:135,155,162` |

---

## 9. Los objetos y arrays del flujo

| Dato | Forma | Ejemplo |
|---|---|---|
| `user` | objeto (ficha con propiedades) | `{ id: 1, name: "Brian", rol: "Aprendiz", ... }` |
| `users` | array de objetos | `[ {id:1}, {id:2}, ... ]` |
| `checkbox` | casilla con info escondida | `{ value: "2", dataset: { name: "Nestor" }, checked: true }` |
| `assignedUsers` | array de objetos (la estrella) | `[ {id:2, name:"Nestor"}, {id:4, name:"Ana"} ]` |
| `taskData` | objeto (el paquete) | `{ title, description, status, createdAt, assignedUsers }` |
| `task` (respuesta) | objeto con asignados | `{ id, title, status, assignedUsers: [...] }` |

Regla: **objeto = ficha con propiedades** (`{}`), **array = lista** (`[]`).

---

## 10. Hoja de repaso (para 5 minutos antes)

1. app.js conecta: Buscar/Enter → `searchUser`; formulario → `registerTask`.
2. `searchUser`: pide usuarios → `find` por id → muestra info → dibuja casillas → trae tareas.
3. `renderUserCheckboxes`: una casilla por usuario, con `value=id` y `dataset.name=nombre`; el buscado ya marcado.
4. `registerTask`: valida → toma casillas marcadas → `map` arma `assignedUsers [{id,name}]` → `taskData` → `createTask` = `POST /api/tasks`.
5. Backend: `TaskModel.create` (transacción) → INSERT `tasks` → `insertAssignments` → INSERT `task_users` por cada asignado → devuelve tarea con `assignedUsers`.
6. Frontend: `tasks.push` → `applySorting` → tabla muestra los badges + toast verde.
