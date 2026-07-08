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
//     - assignTask(taskId, users)    → PATCH /tasks/{id} (Estandarizado para persistir el array multiusuario)
//     - getTaskUsers(taskId)         → GET /tasks/{id} (Retorna los usuarios desde la estructura de la tarea)
//     - removeUserFromTask(tId, uId) → PATCH /tasks/{id} (Estandarizado remitiendo el nuevo array filtrado)
//     - updateTaskStatus(id, status) → PATCH /tasks/{id} (Estandarizado usando actualización parcial)
//     - getUserTasks(userId)         → GET /tasks?userId=... o filtro avanzado
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

// fetchUsers()
//   ¿Qué hace?  Pide al servidor todos los usuarios registrados.
//   Método:     GET → /users
export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// fetchTasksByUser(userId)
//   ¿Qué hace?  Pide TODAS las tareas y filtra en el cliente garantizando
//               que matchee tanto con userId numérico como string.
export async function fetchTasksByUser(userId) {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) throw new Error('Error al obtener tareas');
    const allTasks = await response.json();
    return allTasks.filter(t => String(t.userId) === String(userId));
}

// createTask(task)
//   ¿Qué hace?  Envía una tarea nueva al servidor para que la guarde.
//   Método:     POST → /tasks
export async function createTask(task) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
    return response;
}

// updateTask(taskId, data)
//   ¿Qué hace?  Envía cambios parciales de una tarea (título, descripción, etc.)
//   Método:     PATCH → /tasks/{id}
export async function updateTask(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

// deleteTaskFromApi(taskId)
//   ¿Qué hace?  Le dice al servidor que borre una tarea por completo.
//   Método:     DELETE → /tasks/{id}
export async function deleteTaskFromApi(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE'
    });
    return response;
}

// assignTask(taskId, updatedUsersArray)
//   ¿Qué hace?  Persiste la lista mutada de usuarios asignados sobre la tarea.
//   Nota:       Usa PATCH directo sobre el recurso para máxima compatibilidad con REST/json-server.
export async function assignTask(taskId, updatedUsersArray) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedUsers: updatedUsersArray })
    });
    return response;
}

// getTaskUsers(taskId)
//   ¿Qué hace?  Obtiene la tarea concreta y expone sus asignados.
export async function getTaskUsers(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`);
    if (!response.ok) throw new Error('Error al obtener usuarios de la tarea');
    const task = await response.json();
    return task.assignedUsers || [];
}

// removeUserFromTask(taskId, updatedUsersArray)
//   ¿Qué hace?  Actualiza la tarea tras haber removido un miembro del array en el service.
export async function removeUserFromTask(taskId, updatedUsersArray) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedUsers: updatedUsersArray })
    });
    return response;
}

// updateTaskStatus(taskId, status)
//   ¿Qué hace?  Modifica de forma ágil el estado actual de la tarea seleccionada.
export async function updateTaskStatus(taskId, status) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    return response;
}

// getUserTasks(userId)
//   ¿Qué hace?  Recupera las tareas asociadas a un identificador.
export async function getUserTasks(userId) {
    return fetchTasksByUser(userId);
}

export { API_URL };