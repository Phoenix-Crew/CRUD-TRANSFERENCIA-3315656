// ============================================================
// usersApi.js — Capa HTTP para el módulo de usuarios
// ============================================================
// [F1 - Joser] El backend ahora responde con:
//   { success, message, data, errors }
// Donde antes respondía con el objeto directamente.
// Cada función debe adaptarse para extraer .data de la respuesta.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || '';

// createUser — POST /api/users → registra un nuevo usuario en el sistema
export async function createUser(data) {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

// fetchUsers — GET /api/users → obtiene todos los usuarios registrados
export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// fetchUserById — GET /api/users/{id} → obtiene un usuario por su ID
export async function fetchUserById(id) {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
}

// updateUser — PUT /api/users/{id} → actualiza los datos de un usuario
export async function updateUser(id, data) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

// deleteUser — DELETE /api/users/{id} → elimina un usuario del sistema
export async function deleteUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
    });
    return response;
}

// toggleUserStatus — PATCH /api/users/{id}/status → activa o desactiva un usuario
export async function toggleUserStatus(id, active) {
    const response = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
    });
    return response;
}

export { API_URL };
