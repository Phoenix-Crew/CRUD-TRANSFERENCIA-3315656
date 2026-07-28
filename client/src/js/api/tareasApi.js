// ============================================================
// tareasApi.js — Capa HTTP para el módulo de tareas
// ============================================================
// Cada función llama a un endpoint del backend y retorna
// la respuesta (Response o JSON). Ninguna manipula el DOM.

const API_URL = import.meta.env.VITE_API_URL || '';

// fetchUsers — GET /api/users → obtiene el listado completo de usuarios
export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// fetchTasksByUser — GET /api/users/{userId}/tasks → tareas asignadas a un usuario
export async function fetchTasksByUser(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/tasks`);
    if (!response.ok) throw new Error('Error al obtener tareas del usuario');
    return response.json();
}

// createTask — POST /api/tasks → crea una nueva tarea con assignedUsers
export async function createTask(task) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
    return response;
}

// updateTask — PATCH /api/tasks/{id} → actualiza parcialmente una tarea
export async function updateTask(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

// deleteTaskFromApi — DELETE /api/tasks/{id} → elimina una tarea
export async function deleteTaskFromApi(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE'
    });
    return response;
}

// fetchTasksFiltered — GET /api/tasks/filter?status=&userId=&dateFrom=&dateTo=
// Arma los query params solo si estan definidos y filtra las tareas
export async function fetchTasksFiltered(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.userId) query.set('userId', params.userId);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);
    const qs = query.toString();
    const url = `${API_URL}/tasks/filter${qs ? '?' + qs : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al filtrar tareas');
    return response.json();
}

// fetchDashboard — GET /api/dashboard → estadisticas globales (total, por estado, por usuario)
export async function fetchDashboard() {
    const response = await fetch(`${API_URL}/dashboard`);
    if (!response.ok) throw new Error('Error al obtener dashboard');
    return response.json();
}

// assignTask — POST /api/tasks/{taskId}/assign → asigna un usuario a una tarea existente
export async function assignTask(taskId, userObj) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
    });
    return response;
}

// getTaskUsers — GET /api/tasks/{taskId}/users → obtiene los usuarios asignados a una tarea
export async function getTaskUsers(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios de la tarea');
    const task = await response.json();
    return task.assignedUsers || [];
}

// removeUserFromTask — DELETE /api/tasks/{taskId}/users/{userId} → quita un usuario de la tarea
export async function removeUserFromTask(taskId, userId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users/${userId}`, {
        method: 'DELETE'
    });
    return response;
}

export { API_URL };
