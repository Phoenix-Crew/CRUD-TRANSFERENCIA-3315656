
// Archivo: tareasApi.js — Capa de comunicación con el servidor (json-server)

// ¿Qué hace este archivo?
//   Solo se encarga de hacer peticiones al backend (fetch) y devolver
//   lo que el servidor responde.
//
// ¿Qué NO hace?
//   NO toca la pantalla, NO revisa si los datos son válidos,
//   NO guarda información en variables.
//
// ¿Qué exporta?
//   Todas las funciones de aquí + la constante API_URL
//
// ¿Quién las usa?
//   tareasService.js — importa estas funciones para hacer las
//   operaciones de buscar, crear, editar y eliminar tareas.

const API_URL = "http://192.168.1.125:3005";


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
//   ¿Qué hace?  Pide las tareas de un usuario específico.
//   Método:     GET → /tasks?userId=123
//   Parámetros:
//     - userId: el número de documento del usuario
//   ¿Qué devuelve?  Un array con las tareas de ese usuario.
//   ¿Quién la llama?  tareasService.js → searchUser()

export async function fetchTasksByUser(userId) {
    const response = await fetch(`${API_URL}/tasks?userId=${userId}`);
    if (!response.ok) throw new Error('Error al obtener tareas');
    return response.json();
}


// createTask(task)
//   ¿Qué hace?  Envía una tarea nueva al servidor para que la guarde.
//   Método:     POST → /tasks
//   Parámetros:
//     - task: un objeto con userId, userName, title, description, status, createdAt
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

export { API_URL };
