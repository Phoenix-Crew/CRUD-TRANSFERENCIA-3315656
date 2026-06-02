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

export function isValidInput(value) {
    return value && value.trim().length > 0;
}

export const statusColors = {
    'Pendiente': '#ffc107',
    'En progreso': '#17a2b8',
    'Completada': '#28a745'
};
