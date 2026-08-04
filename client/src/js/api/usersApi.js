// ============================================================
// usersApi.js — Capa HTTP para el módulo de usuarios
// ============================================================
// FLUJO: services/usersService.js llama a estas funciones
// → fetch al backend Express (Vite proxy /api → :3002)
// → rutas /api/users/* (user.routes.js → user.controller.js
// → user.model.js → MySQL) → respuesta JSON de vuelta
//
// REGLA DE ARQUITECTURA: esta capa SOLO hace HTTP.
// No manipula el DOM ni guarda estado.
// ============================================================

// URL base de la API: del .env del frontend o vacío (proxy de Vite)
const API_URL = import.meta.env.VITE_API_URL || '';

// ============================================================
// createUser — POST /api/users
// ORIGEN: usersService.openCreateUserModal()
// DESTINO BACKEND: Express → user.controller.create
// → UserModel.create (INSERT) → 201 con el usuario
// QUÉ DEVUELVE: Response (se verifica con .ok)
// ============================================================
export async function createUser(data) {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) // { name, email, rol, password, ficha? }
    });
    return response;
}

// ============================================================
// fetchUsers — GET /api/users
// ORIGEN: usersService.loadUsers() (y otros servicios)
// DESTINO BACKEND: Express → user.controller.getAll
// → UserModel.findAll (SELECT) → JSON
// QUÉ DEVUELVE: array de usuarios (sin password)
// ============================================================
export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

// ============================================================
// fetchUserById — GET /api/users/{id}
// ORIGEN: servicios que necesitan un usuario puntual
// DESTINO BACKEND: Express → user.controller.getById
// → UserModel.findById (SELECT WHERE id = ?)
// ============================================================
export async function fetchUserById(id) {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
}

// ============================================================
// updateUser — PUT /api/users/{id}
// ORIGEN: usersService.openEditUserModal()
// DESTINO BACKEND: Express → user.controller.update
// → UserModel.update (UPDATE parcial) → JSON
// ============================================================
export async function updateUser(id, data) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data) // { name?, email?, rol?, password?, ficha? }
    });
    return response;
}

// ============================================================
// deleteUser — DELETE /api/users/{id}
// ORIGEN: usersService.confirmDeleteUser()
// DESTINO BACKEND: Express → user.controller.remove
// → UserModel.delete (DELETE + CASCADE en task_users)
// ============================================================
export async function deleteUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
    });
    return response;
}

// ============================================================
// toggleUserStatus — PATCH /api/users/{id}/status
// ORIGEN: usersService.handleToggleStatus()
// DESTINO BACKEND: Express → user.controller.toggleStatus
// → UserModel.updateActive (UPDATE active = ?)
// ============================================================
export async function toggleUserStatus(id, active) {
    const response = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }) // { active: true | false }
    });
    return response;
}

// Exporta también la URL base (por si otro módulo la necesita)
export { API_URL };
