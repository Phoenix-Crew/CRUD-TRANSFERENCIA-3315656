// Archivo: tareasApi.js — Capa de comunicación con el servidor (json-server / Express backend)

// ¿Qué hace este archivo?
//   Solo se encarga de hacer peticiones al backend (fetch) y devolver
//   lo que el servidor responde.
//
// ¿Qué NO hace?
//   NO toca la pantalla, NO revisa si los datos son válidos,
//   NO guarda información en variables.
//
// ¿Qué exporta?
//   Funciones de conexión + la constante API_URL:
//     - fetchUsers()                 → GET /users
//     - fetchTasksByUser(userId)     → GET /tasks + filtro en cliente
//     - createTask(task)             → POST /tasks
//     - updateTask(id, data)         → PATCH /tasks/{id}
//     - deleteTaskFromApi(id)        → DELETE /tasks/{id}
//     - assignTask(taskId, userData) → POST /tasks/{taskId}/assign  [NUEVO]
//     - getTaskUsers(taskId)         → GET /tasks/{taskId}/users    [NUEVO]
//     - removeUserFromTask(tId, uId) → DELETE /tasks/{tId}/users/{uId} [NUEVO]
//     - updateTaskStatus(id, status) → PATCH /tasks/{id}/status     [NUEVO]
//     - getUserTasks(userId)         → GET /users/{userId}/tasks    [NUEVO]
//
// ¿Quién las usa?
//   tareasService.js — importa estas funciones para hacer las
//   operaciones de buscar, crear, editar y eliminar tareas.
//
// ============================================================
// NOTA SOBRE LA URL DEL API
// ============================================================
//   - En dev local:  http://localhost:3002
//   - Histórico:     antes apuntaba a :3005 (puerto incorrecto,
//                    provocaba "Error de conexión" en la UI).

const API_URL = import.meta.env.VITE_API_URL || '';


// fetchUsers()
//   ¿Qué hace?  Pide al servidor todos los usuarios registrados.
//   Método:     GET → /users
//   ¿Qué devuelve?  La lista completa de usuarios (array de objetos).
//   ¿Quién la llama?  tareasService.js → searchUser()

export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}


// fetchTasksByUser(userId)
//   ¿Qué hace?  Pide TODAS las tareas y filtra en el cliente
//               comparando con String() en ambos lados para que
//               matchee tanto con userId numérico como string.
//   Parámetros:
//     - userId: el número de documento del usuario
//   ¿Qué devuelve?  Un array con las tareas de ese usuario.
//   ¿Quién la llama?  tareasService.js → searchUser()

export async function fetchTasksByUser(userId) {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) throw new Error('Error al obtener tareas');
    const allTasks = await response.json();
    return allTasks.filter(t => String(t.userId) === String(userId));
}


// createTask(task)
//   ¿Qué hace?  Envía una tarea nueva al servidor para que la guarde.
//   Método:     POST → /tasks
//   Parámetros:
//     - task: objeto con title, description, status, createdAt, assignedUsers
//   ¿Qué devuelve?  La respuesta del servidor (response).
//   ¿Quién la llama?  tareasService.js → registerTask()

export async function createTask(task) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
    return response;
}


// updateTask(taskId, data)
//   ¿Qué hace?  Envía cambios de una tarea para actualizarla.
//   Método:     PATCH → /tasks/123
//   Parámetros:
//     - taskId: el ID de la tarea a actualizar
//     - data: objeto con los campos que cambiaron (title, description, status)
//   ¿Qué devuelve?  La respuesta del servidor (response).
//   ¿Quién la llama?  tareasService.js → saveEdit()

export async function updateTask(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}


// deleteTaskFromApi(taskId)
//   ¿Qué hace?  Le dice al servidor que borre una tarea.
//   Método:     DELETE → /tasks/123
//   Parámetros:
//     - taskId: el ID de la tarea a eliminar
//   ¿Qué devuelve?  La respuesta del servidor (response).
//   ¿Quién la llama?  tareasService.js → deleteTask()

export async function deleteTaskFromApi(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE'
    });
    return response;
}


// assignTask(taskId, userData)
//   ¿Qué hace?  Asigna un nuevo usuario al arreglo multiusuario de la tarea.
//   Método:     POST → /tasks/{taskId}/assign
//   Parámetros:
//     - taskId: ID de la tarea seleccionada.
//     - userData: Objeto con los datos del usuario { id, name }.
//   ¿Qué devuelve? La respuesta del servidor con la tarea modificada.

export async function assignTask(taskId, userData) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response;
}


// getTaskUsers(taskId)
//   ¿Qué hace?  Obtiene la lista de usuarios asignados únicamente a esa tarea.
//   Método:     GET → /tasks/{taskId}/users
//   ¿Qué devuelve? El array asignado "assignedUsers" de la tarea elegida.

export async function getTaskUsers(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios de la tarea');
    return response.json();
}


// removeUserFromTask(taskId, userId)
//   ¿Qué hace?  Desasigna un usuario específico de una tarea en el servidor.
//   Método:     DELETE → /tasks/{taskId}/users/{userId}

export async function removeUserFromTask(taskId, userId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users/${userId}`, {
        method: 'DELETE'
    });
    return response;
}


// updateTaskStatus(taskId, status)
//   ¿Qué hace?  Actualiza únicamente la propiedad de estado de una tarea.
//   Método:     PATCH → /tasks/{taskId}/status
//   Parámetros:
//     - status: String ('Pendiente' | 'En progreso' | 'Completada')

export async function updateTaskStatus(taskId, status) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    return response;
}


// getUserTasks(userId)
//   ¿Qué hace?  Pide al backend todas las tareas en las que esté asignado el ID del usuario.
//   Método:     GET → /users/{userId}/tasks

export async function getUserTasks(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/tasks`);
    if (!response.ok) throw new Error('Error al obtener tareas del usuario');
    return response.json();
}

export { API_URL };