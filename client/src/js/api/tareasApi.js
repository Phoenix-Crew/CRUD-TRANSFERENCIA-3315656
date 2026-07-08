const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

export async function fetchTasksByUser(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/tasks`);
    if (!response.ok) throw new Error('Error al obtener tareas del usuario');
    return response.json();
}

export async function createTask(task) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
    return response;
}

export async function updateTask(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

export async function deleteTaskFromApi(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE'
    });
    return response;
}

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

export async function fetchDashboard() {
    const response = await fetch(`${API_URL}/dashboard`);
    if (!response.ok) throw new Error('Error al obtener dashboard');
    return response.json();
}

export async function assignTask(taskId, userObj) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
    });
    return response;
}

export async function getTaskUsers(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios de la tarea');
    const task = await response.json();
    return task.assignedUsers || [];
}

export async function removeUserFromTask(taskId, userId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users/${userId}`, {
        method: 'DELETE'
    });
    return response;
}

export { API_URL };
