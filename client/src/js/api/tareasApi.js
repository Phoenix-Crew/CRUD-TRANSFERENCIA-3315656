// ============================================================
// tareasApi.js — Capa HTTP para el módulo de tareas
// ============================================================
// FLUJO: services/tareasService.js llama a estas funciones
// → fetch al backend Express (Vite proxy /api → :3002)
// → rutas /api/tasks/* (task.routes.js → task.controller.js
// → task.model.js → MySQL) → respuesta JSON de vuelta
//
// REGLA DE ARQUITECTURA: esta capa SOLO hace HTTP.
// No manipula el DOM ni guarda estado.
//
// CONEXIÓN: API_URL viene del .env del frontend
// (VITE_API_URL) o vacío → usa el proxy de vite.config.js
// ============================================================

// URL base de la API: import.meta.env.VITE_API_URL (definida en client/.env)
// Si está vacía, se usan rutas relativas → las resuelve el proxy de Vite
const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================================
// fetchUsers — GET /api/users
// ORIGEN: tareasService.searchUser() / renderUserCheckboxes()
// DESTINO BACKEND: Express GET /api/users → user.controller.getAll
// → UserModel.findAll (SELECT) → JSON
// QUÉ DEVUELVE: array de usuarios (sin password)
// ============================================================
export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// ============================================================
// fetchTasksByUser — GET /api/users/{userId}/tasks
// ORIGEN: tareasService.searchUser() (al encontrar un usuario)
// DESTINO BACKEND: Express → user.controller.getUserTasks
// → TaskModel.findByUserId (SELECT + JOIN task_users) → JSON
// QUÉ DEVUELVE: tareas asignadas a ese usuario
// ============================================================
export async function fetchTasksByUser(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/tasks`);
    if (!response.ok) throw new Error('Error al obtener tareas del usuario');
    return response.json();
}

// ============================================================
// createTask — POST /api/tasks
// ORIGEN: tareasService.registerTask()
// DESTINO BACKEND: Express → task.controller.create
// → TaskModel.create (INSERT + asignaciones en transacción)
// QUÉ DEVUELVE: Response (se verifica con .ok y se lee .json())
// ============================================================
export async function createTask(task) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task) // { title, description, status, assignedUsers }
    });
    return response;
}

// ============================================================
// updateTask — PATCH /api/tasks/{id}
// ORIGEN: tareasService.editTaskViaModal() / completeTaskDirect()
// DESTINO BACKEND: Express → task.controller.update
// → TaskModel.update (UPDATE parcial) → JSON
// ============================================================
export async function updateTask(taskId, data) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) // { title?, description?, status? }
    });
    return response;
}

// ============================================================
// deleteTaskFromApi — DELETE /api/tasks/{id}
// ORIGEN: tareasService.deleteTask()
// DESTINO BACKEND: Express → task.controller.remove
// → TaskModel.delete (DELETE + CASCADE en task_users)
// ============================================================
export async function deleteTaskFromApi(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE'
    });
    return response;
}

// ============================================================
// fetchTasksFiltered — GET /api/tasks/filter?status=&userId=&dateFrom=&dateTo=
// ORIGEN: tareasService.loadAdminPanel() / applyAdminFilters()
// DESTINO BACKEND: Express → task.controller.filter
// → TaskModel.filter (WHERE dinámico + JOIN opcional)
// QUÉ HACE: arma los query params solo si están definidos
// ============================================================
export async function fetchTasksFiltered(params = {}) {
    const query = new URLSearchParams();
    // Cada filtro presente se agrega al query string
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

// ============================================================
// fetchDashboard — GET /api/dashboard
// ORIGEN: tareasService.loadAdminPanel() / applyAdminFilters()
// DESTINO BACKEND: Express GET /api/dashboard (definida en index.js)
// → task.controller.getDashboard → TaskModel.getDashboard
// (COUNTs + GROUP BY) → JSON con estadísticas globales
// ============================================================
export async function fetchDashboard() {
    const response = await fetch(`${API_URL}/dashboard`);
    if (!response.ok) throw new Error('Error al obtener dashboard');
    return response.json();
}

// ============================================================
// assignTask — POST /api/tasks/{taskId}/assign
// ORIGEN: tareasService.assignUserToTask()
// DESTINO BACKEND: Express → task.controller.assignUsers
// → TaskModel.assignUsers (INSERT en task_users)
// QUÉ DEVUELVE: Response
// ============================================================
export async function assignTask(taskId, userObj) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj) // { id, name }
    });
    return response;
}

// ============================================================
// getTaskUsers — GET /api/tasks/{taskId}/users
// ORIGEN: servicios que necesitan los asignados de una tarea
// DESTINO BACKEND: Express → task.controller.getAssignedUsers
// QUÉ DEVUELVE: el array assignedUsers de la tarea (o [] si no tiene)
// ============================================================
export async function getTaskUsers(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios de la tarea');
    const task = await response.json();
    return task.assignedUsers || [];
}

// ============================================================
// removeUserFromTask — DELETE /api/tasks/{taskId}/users/{userId}
// ORIGEN: servicios que quitan asignaciones
// DESTINO BACKEND: Express → task.controller.removeUserAssignment
// → TaskModel.removeUserAssignment (DELETE en task_users)
// ============================================================
export async function removeUserFromTask(taskId, userId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users/${userId}`, {
        method: 'DELETE'
    });
    return response;
}

// Exporta también la URL base (por si otro módulo la necesita)
export { API_URL };
