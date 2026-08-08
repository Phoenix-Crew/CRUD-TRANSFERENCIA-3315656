// Cómo se lee: "Const API_URL se asigna a import punto meta punto env punto VITE_API_URL o comilla vacía."
// Qué es: la base de las URLs del backend; en desarrollo vale "/api" y el proxy de Vite lo dirige a localhost:3002.
const API_URL = import.meta.env.VITE_API_URL || '';

// Cómo se lee: "Export async function fetchUsers."
export async function fetchUsers() { // Qué hace: pide al servidor todos los usuarios; es el origen de los checkboxes de asignación.
    // Cómo se lee: "Const response se asigna a await fetch, pasando la plantilla API_URL más /users como argumento."
    const response = await fetch(`${API_URL}/users`); // Qué hace: hace GET a /users y espera la respuesta del backend. Aquí el frontend toca el backend por primera vez
    // Cómo se lee: "If, con la condición no response punto ok, lanza throw new Error con el mensaje."
    if (!response.ok) throw new Error('Error al obtener usuarios'); // Qué hace: si el servidor respondió mal, lanza un error para avisar en pantalla
    // Cómo se lee: "Return response punto json."
    return response.json(); // Qué hace: devuelve la respuesta ya convertida en array de usuarios
}

// Cómo se lee: "Export async function fetchTasksByUser, con userId como parámetro."
export async function fetchTasksByUser(userId) { // Qué hace: trae las tareas que ese usuario ya tiene asignadas para mostrarlas en la tabla.
    // Cómo se lee: "Const response se asigna a await fetch, pasando la plantilla API_URL más users más userId más tasks."
    const response = await fetch(`${API_URL}/users/${userId}/tasks`); // Qué hace: hace GET a /users/{id}/tasks para pedir las tareas del usuario que buscamos
    // Cómo se lee: "If, con la condición no response punto ok, lanza throw new Error con el mensaje."
    if (!response.ok) throw new Error('Error al obtener tareas del usuario'); // Qué hace: si el servidor falla, lanza un error
    // Cómo se lee: "Return response punto json."
    return response.json(); // Qué hace: devuelve la lista de tareas ya como array de objetos
}

// Cómo se lee: "Export async function createTask, con task como parámetro."
// Qué es: envía la tarea al servidor con su lista assignedUsers; aquí termina el frontend y empieza el backend.
export async function createTask(task) {
    // Cómo se lee: "Const response se asigna a await fetch, pasando la plantilla API_URL más /tasks como primer
    // argumento, y luego un objeto con method, headers y body como segundo argumento."
    const response = await fetch(`${API_URL}/tasks`, { // Qué hace: arma el POST hacia /tasks con la configuración del envío
        // Cómo se lee: "Method se asigna a POST."
        method: 'POST', // Qué hace: POST = pedirle al servidor que cree algo nuevo (la tarea y sus asignaciones)
        headers: { 'Content-Type': 'application/json' },
        // Cómo se lee: "Body se asigna a JSON punto stringify, pasando task como argumento."
        body: JSON.stringify(task) // Qué hace: convierte el objeto de la tarea a texto JSON para viajar por HTTP
    });
    // Cómo se lee: "Return response."
    return response; // Qué hace: regresa la respuesta cruda para que registerTask decida si fue éxito o error
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

// Cómo se lee: "assignTask agrupa la petición POST /tasks/:taskId/assign".
// Qué es: la que agrega un usuario a una tarea que ya existe.
// Qué hace: manda el { id, name } del usuario en el body; aquí nace la asignación con checkboxes.
export async function assignTask(taskId, userObj) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
    });
    return response;
}

// Cómo se lee: "getTaskUsers: GET /tasks/:taskId/users".
// Qué es: la que el editor usa al abrir para pintar los badges ya asignados.
export async function getTaskUsers(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios de la tarea');
    const task = await response.json();
    return task.assignedUsers || [];
}

// Cómo se lee: "removeUserFromTask: DELETE /tasks/:taskId/users/:userId".
// Qué es: el caso contrario de assignTask: borra el vínculo en task_users.
export async function removeUserFromTask(taskId, userId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}/users/${userId}`, {
        method: 'DELETE'
    });
    return response;
}

export { API_URL };
