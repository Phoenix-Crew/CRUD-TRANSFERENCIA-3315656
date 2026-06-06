
// Archivo: helpers.js / Herramientas genéricas para todo el proyecto

// ¿Que hace este archivo?
//   Tiene funciones pequeñas y útiles que cualquier otro archivo
//   puede usar. No depende de nada más.
//
// ¿que no hace?
//   NO toca la pantalla, NO habla con el servidor, NO guarda estado.
//
// ¿que exporta?
//   6 funciones:
//     - getCurrentTimestamp()      → fecha actual en formato es-CO
//     - isValidInput(value)        → valida que un texto no esté vacío
//     - sortTasks(tasks, c, d)     → ordena por fecha/título/status
//     - filterTasksByStatus(t, s)  → filtra tareas por estado
////   2 objetos:
//     - statusColors  → colores hex por estado (para badges)
//     - statusOrder   → orden lógico del ciclo de vida (no alfabético)
//
// ¿quien las usa?
//   - tareasService.js → getCurrentTimestamp, isValidInput,
//                        sortTasks, filterTasksByStatus, statusColors,
//   - taskRenderer.js  → statusColors, updateSortIcons (vía dom)



// getCurrentTimestamp()
//   ¿Qué hace?  Crea la fecha y hora actual con formato colombiano.
//   Ejemplo:    "06/06/2026, 03:45 p. m."
//   ¿Qué devuelve?  Un texto con la fecha y hora.
//   ¿Quién la llama?  tareasService.js → registerTask()

export function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}


// isValidInput(value)
//   ¿Qué hace?  Revisa que un valor no esté vacío.
//   Parámetros:
//     - value: el texto que escribió el usuario
//   ¿Qué devuelve?  true si tiene algo escrito, false si está vacío.
//   ¿Quién la llama?  tareasService.js → searchUser()

export function isValidInput(value) {
    return value && value.trim().length > 0;
}


// statusColors
//   ¿Qué es?  Un objeto que asigna un color a cada estado de tarea.
//   ¿Para qué sirve?  Para pintar la etiqueta del estado en la tabla.
//   Valores:
//     "Pendiente"    → amarillo (#ffc107)
//     "En progreso"  → azul    (#17a2b8)
//     "Completada"   → verde   (#28a745)
//   ¿Quién lo usa?  taskRenderer.js y tareasService.js

export const statusColors = {
    'Pendiente': '#ffc107',
    'En progreso': '#17a2b8',
    'Completada': '#28a745'
};


// statusOrder
//   ¿Qué es?  Un objeto que define el orden lógico del ciclo de vida
//             de una tarea (no es orden alfabético).
//   ¿Para qué sirve?  Para que al ordenar por estado, las tareas
//   "Pendiente" aparezcan antes que "En progreso" y estas antes que
//   "Completada", siguiendo el flujo natural del trabajo.
//   ¿Quién lo usa?  helpers.js → sortTasks() cuando criteria === 'status'

export const statusOrder = {
    'Pendiente': 1,
    'En progreso': 2,
    'Completada': 3
};


// sortTasks(tasks, criteria, direction)
//   ¿Qué hace?  Devuelve un NUEVO array de tareas ordenado según el
//               criterio y la dirección indicados. NO muta el array original.
//   Parámetros:
//     - tasks:     array de objetos tarea
//     - criteria:  'createdAt' | 'title' | 'status'
//     - direction: 'asc' | 'desc' (por defecto 'asc')
//   ¿Qué devuelve?  Un nuevo array ordenado.
//   ¿Quién la llama?  tareasService.js → applySorting()
//
//   Reglas de comparación:
//     - 'createdAt' → parsea el string de fecha a Date y compara timestamps
//                     (desempate: título con localeCompare es-CO)
//     - 'title'     → localeCompare en es-CO (maneja acentos y ñ)
//     - 'status'    → usa statusOrder (orden lógico de ciclo de vida)

export function sortTasks(tasks, criteria, direction = 'asc') {
    const sorted = tasks.slice();

    const compare = (a, b) => {
        let result = 0;

        if (criteria === 'createdAt') {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (isNaN(dateA) || isNaN(dateB)) {
                result = String(a.createdAt).localeCompare(String(b.createdAt), 'es-CO');
            } else if (dateA === dateB) {
                result = String(a.title || '').localeCompare(String(b.title || ''), 'es-CO');
            } else {
                result = dateA - dateB;
            }
        } else if (criteria === 'title') {
            result = String(a.title || '').localeCompare(String(b.title || ''), 'es-CO');
        } else if (criteria === 'status') {
            const orderA = statusOrder[a.status] ?? 99;
            const orderB = statusOrder[b.status] ?? 99;
            if (orderA === orderB) {
                result = String(a.title || '').localeCompare(String(b.title || ''), 'es-CO');
            } else {
                result = orderA - orderB;
            }
        } else {
            result = 0;
        }

        return direction === 'desc' ? -result : result;
    };

    return sorted.sort(compare);
}


// filterTasksByStatus(tasks, status)
//   ¿Qué hace?  Devuelve solo las tareas que coincidan con el estado
//               indicado. Si el estado es 'all' (o vacío), devuelve
//               el array completo sin filtrar.
//   Parámetros:
//     - tasks:  array de objetos tarea
//     - status: 'all' | 'Pendiente' | 'En progreso' | 'Completada'
//   ¿Qué devuelve?  Un NUEVO array (no muta el original).
//   ¿Quién la llama?  tareasService.js → applySorting() antes de ordenar.

export function filterTasksByStatus(tasks, status) {
    if (!status || status === 'all') return tasks.slice();
    return tasks.filter(t => t.status === status);
}
