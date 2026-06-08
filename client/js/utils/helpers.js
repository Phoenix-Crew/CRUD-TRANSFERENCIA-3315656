
// Archivo: helpers.js / Herramientas genéricas para todo el proyecto

// ¿Que hace este archivo?
//   Tiene funciones pequeñas y útiles que cualquier otro archivo
//   puede usar. No depende de nada más.
//
// ¿que no hace?
//   NO toca la pantalla, NO habla con el servidor, NO guarda estado.
//
// ¿que exporta?
//   Las 2 funciones + el objeto statusColors
//
// ¿quien las usa?
//   - tareasService.js → usa getCurrentTimestamp() e isValidInput()
//   - taskRenderer.js  → usa statusColors para pintar los colores



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
