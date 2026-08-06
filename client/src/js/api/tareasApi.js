const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchUsers() { // "export" hace pública la función para usarla desde otros archivos; "async" permite usar "await"; "function" declara la función; "fetchUsers" la trae del servidor; la llave abre el bloque
    const response = await fetch(`${API_URL}/users`); // "const" declara; "response" guardará la respuesta del servidor; "await" pausa hasta que termine; "fetch" hace la petición; "`${API_URL}/users`" es la dirección: "API_URL" es la base y "/users" el recurso de todos los usuarios, que luego llenan los checkboxes de asignación
    if (!response.ok) throw new Error('Error al obtener usuarios'); // "if" pregunta si la respuesta no fue correcta; "!" niega "response.ok"; "throw" lanza; "new Error" crea un error nuevo; el texto describe que no se pudieron obtener los usuarios
    return response.json(); // "return" devuelve el resultado; "response.json()" convierte la respuesta en un array de objetos con los usuarios
}

export async function fetchTasksByUser(userId) { // "export" hace pública la función; "async" permite "await"; "function" declara; "fetchTasksByUser" busca las tareas de un usuario; "userId" recibe el id del usuario buscado
    const response = await fetch(`${API_URL}/users/${userId}/tasks`); // "const" declara; "response" guardará la respuesta; "await" espera; "fetch" hace la petición; la plantilla arma la ruta con "/users/", luego "${userId}" (el id buscado) y "/tasks" (las tareas asignadas a ese usuario)
    if (!response.ok) throw new Error('Error al obtener tareas del usuario'); // "if" pregunta si la respuesta falló; "!" niega "response.ok"; "throw" lanza; "new Error" crea el error; el texto describe que no se pudieron obtener las tareas del usuario
    return response.json(); // "return" devuelve el resultado; "response.json()" convierte la respuesta en la lista de tareas que ya tiene asignadas el usuario
}

export async function createTask(task) { // "export" hace pública la función; "async" permite "await"; "function" declara; "createTask" crea la tarea y la asigna; "task" recibe el objeto con título, descripción, estado y "assignedUsers"; la llave abre el bloque
    const response = await fetch(`${API_URL}/tasks`, { // "const" declara; "response" guardará la respuesta; "await" espera; "fetch" hace la petición a "`${API_URL}/tasks`" (el endpoint para crear tareas); la llave abre la configuración de la petición
        method: 'POST', // "method" define el verbo HTTP; "'POST'" indica que enviamos datos al servidor para crear algo nuevo
        headers: { 'Content-Type': 'application/json' }, // "headers" define las cabeceras; la llave abre el objeto; "'Content-Type'" avisa al servidor qué tipo de datos enviamos; "'application/json'" indica que es un objeto JSON
        body: JSON.stringify(task) // "body" es el contenido que se envía; "JSON.stringify" convierte el objeto a texto JSON; "task" es ese objeto que incluye "title", "description", "status" y "assignedUsers" (los usuarios a quienes se asigna la tarea)
    }); // la llave cierra la configuración y el paréntesis cierra la llamada a "fetch"
    return response; // "return" devuelve; "response" es la respuesta del servidor, que luego el servicio revisa con ".ok"
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

export async function assignTask(taskId, userObj) { // "export" hace pública la función; "async" permite "await"; "function" declara; "assignTask" asigna un usuario a una tarea ya existente; "taskId" es el id de la tarea y "userObj" el objeto con "id" y "name" del usuario; la llave abre el bloque
    const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, { // "const" declara; "response" guardará la respuesta; "await" espera; "fetch" hace la petición; la plantilla arma la ruta "/tasks/", luego "${taskId}" (la tarea) y "/assign" (la acción de asignar); la llave abre la configuración
        method: 'POST', // "method" define el verbo HTTP; "'POST'" envía datos al servidor para registrar la asignación
        headers: { 'Content-Type': 'application/json' }, // "headers" define las cabeceras; la llave abre el objeto; "'Content-Type'" avisa el tipo de datos; "'application/json'" indica que es un objeto JSON
        body: JSON.stringify(userObj) // "body" es el contenido que se envía; "JSON.stringify" convierte a texto JSON; "userObj" es el objeto con "id" y "name" del usuario que se va a asignar
    }); // la llave cierra la configuración y el paréntesis cierra la llamada a "fetch"
    return response; // "return" devuelve; "response" es la respuesta del servidor con el resultado de la asignación
}

export async function getTaskUsers(taskId) { // "export" hace pública la función; "async" permite "await"; "function" declara; "getTaskUsers" obtiene los usuarios asignados; "taskId" es el id de la tarea
    const response = await fetch(`${API_URL}/tasks/${taskId}/users`); // "const" declara; "response" guardará la respuesta; "await" espera; "fetch" hace la petición; la plantilla arma la ruta "/tasks/", luego "${taskId}" y "/users" (los asignados de esa tarea)
    if (!response.ok) throw new Error('Error al obtener usuarios de la tarea'); // "if" pregunta si la respuesta falló; "!" niega "response.ok"; "throw" lanza; "new Error" crea el error; el texto describe que no se pudieron obtener los usuarios
    const task = await response.json(); // "const" declara; "task" guarda la respuesta convertida; "await" espera; "response.json()" convierte el JSON en objeto de la tarea
    return task.assignedUsers || []; // "return" devuelve; "task.assignedUsers" es la propiedad con los asignados; el operador "||" usa la lista si existe o, si no existe, devuelve un array vacío para no romper el código
}

export async function removeUserFromTask(taskId, userId) { // "export" hace pública la función; "async" permite "await"; "function" declara; "removeUserFromTask" quita la asignación; "taskId" es la tarea y "userId" el usuario que se desasigna
    const response = await fetch(`${API_URL}/tasks/${taskId}/users/${userId}`, { // "const" declara; "response" guardará la respuesta; "await" espera; "fetch" hace la petición; la plantilla arma la ruta "/tasks/", luego "${taskId}", "/users/" y "${userId}" (a quién se le quita); la llave abre la configuración
        method: 'DELETE' // "method" define el verbo HTTP; "'DELETE'" le dice al servidor que debe eliminar la asignación
    }); // la llave cierra la configuración y el paréntesis cierra la llamada a "fetch"
    return response; // "return" devuelve; "response" es la respuesta del servidor
}

export { API_URL };
