// ============================================================
// usersService.js — Lógica de negocio para usuarios
// ============================================================
// FLUJO:
//   app.js (eventos: clics, user:edit, user:delete, user:toggle)
//     → ESTE ARCHIVO (modales + coordinación)
//       → api/usersApi.js (HTTP al backend :3002)
//         → Express /api/users/* → MySQL
//     → ui/userRenderer.js (renderiza la tabla)
//     → ui/notifications.js (toasts) y ui/confirmDialog.js
//
// ESTADO LOCAL: variable users (lista en memoria de la tabla)
// ============================================================

// Imports de la capa HTTP — vienen de api/usersApi.js
import { createUser, fetchUsers, updateUser, deleteUser, toggleUserStatus } from '../api/usersApi.js';
// Imports de UI — vienen de ui/userRenderer.js (tabla + modal de formulario)
import { renderUserTable } from '../ui/userRenderer.js';
import { showUserFormModal } from '../ui/userRenderer.js';
// Imports de UI de feedback — vienen de ui/notifications.js y ui/confirmDialog.js
import { showToast } from '../ui/notifications.js';
import { showConfirmDialog } from '../ui/confirmDialog.js';

// Estado en memoria: usuarios actuales de la tabla
let users = [];

// ============================================================
// loadUsers — Carga todos los usuarios y pinta la tabla
// ORIGEN: app.js (DOMContentLoaded) y tras cada operación CRUD
// DESTINO: api/usersApi.fetchUsers (GET /api/users)
// → ui/userRenderer.renderUserTable (pinta el DOM)
// ============================================================
export async function loadUsers() {
    try {
        users = await fetchUsers(); // GET /api/users → array de usuarios
        renderUserTable(users);     // Renderiza la tabla (userRenderer)
    } catch (error) {
        showToast('Error al cargar usuarios: ' + error.message, 'error');
    }
}

// ============================================================
// openCreateUserModal — Modal de creación de usuario
// ORIGEN: app.js (botón #btnCreateUser)
// DESTINO: ui/userRenderer.showUserFormModal + api/usersApi.createUser
// FLUJO: abre el modal (sin datos) → si confirma, valida y
// envía POST /api/users → toast → recarga la tabla
// ============================================================
export async function openCreateUserModal() {
    // null = modo crear (el modal cambia título y validación)
    const result = await showUserFormModal(null);
    if (!result) return; // Cancelado

    try {
        const response = await createUser(result); // POST /api/users
        if (response.ok) {
            showToast('Usuario creado exitosamente', 'success');
            await loadUsers(); // Refresca la tabla
        } else {
            // El backend puede rechazar (ej: email ya registrado → 400)
            const err = await response.json();
            showToast(err.message || 'Error al crear usuario', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al crear usuario', 'error');
    }
}

// ============================================================
// openEditUserModal — Modal de edición de usuario
// ORIGEN: app.js (evento personalizado 'user:edit', lanzado por
//         userRenderer con el usuario de la fila)
// DESTINO: ui/userRenderer.showUserFormModal + api/usersApi.updateUser
// FLUJO: abre el modal con los datos actuales → si confirma,
// envía PUT /api/users/:id → toast → recarga la tabla
// ============================================================
export async function openEditUserModal(user) {
    const result = await showUserFormModal(user); // user ≠ null = modo editar
    if (!result) return;

    try {
        const response = await updateUser(user.id, result); // PUT /api/users/:id
        if (response.ok) {
            showToast('Usuario actualizado correctamente', 'success');
            await loadUsers();
        } else {
            const err = await response.json();
            showToast(err.message || 'Error al actualizar usuario', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al actualizar usuario', 'error');
    }
}

// ============================================================
// confirmDeleteUser — Confirmación y eliminación de usuario
// ORIGEN: app.js (evento personalizado 'user:delete')
// DESTINO: ui/confirmDialog.js + api/usersApi.deleteUser
// FLUJO: modal de confirmación → DELETE /api/users/:id →
// toast → recarga la tabla
// ============================================================
export async function confirmDeleteUser(user) {
    // Pide confirmación con el nombre del usuario en el mensaje
    const confirmed = await showConfirmDialog({
        title: 'Eliminar usuario',
        message: `¿Estás seguro de eliminar a "${user.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    try {
        const response = await deleteUser(user.id); // DELETE /api/users/:id
        if (response.ok) {
            showToast('Usuario eliminado correctamente', 'success');
            await loadUsers();
        } else {
            showToast('Error al eliminar usuario', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al eliminar usuario', 'error');
    }
}

// ============================================================
// handleToggleStatus — Activa o desactiva un usuario
// ORIGEN: app.js (evento personalizado 'user:toggle')
// DESTINO: ui/confirmDialog.js + api/usersApi.toggleUserStatus
// FLUJO: calcula el estado opuesto → confirmación →
// PATCH /api/users/:id/status { active } → toast → recarga
// ============================================================
export async function handleToggleStatus(user) {
    const newStatus = !(user.active !== false); // Estado opuesto (activo↔inactivo)
    const actionText = newStatus ? 'activar' : 'desactivar';

    // Confirmación con el texto dinámico (Activar/Desactivar)
    const confirmed = await showConfirmDialog({
        title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} usuario`,
        message: `¿Estás seguro de ${actionText} a "${user.name}"?`,
        confirmText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    try {
        const response = await toggleUserStatus(user.id, newStatus); // PATCH status
        if (response.ok) {
            showToast(`Usuario ${actionText}do correctamente`, 'success');
            await loadUsers();
        } else {
            showToast('Error al cambiar estado del usuario', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al cambiar estado', 'error');
    }
}
