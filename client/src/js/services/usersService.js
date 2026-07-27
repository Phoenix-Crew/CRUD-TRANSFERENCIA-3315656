// ============================================================
// usersService.js — Lógica de negocio para usuarios
// ============================================================
// Coordina las llamadas a la API de usuarios con la interfaz
// de usuario (renderizado, modales, confirmaciones).

import { createUser, fetchUsers, updateUser, deleteUser, toggleUserStatus } from '../api/usersApi.js';
import { renderUserTable } from '../ui/userRenderer.js';
import { showUserFormModal } from '../ui/userRenderer.js';
import { showToast } from '../ui/notifications.js';
import { showConfirmDialog } from '../ui/confirmDialog.js';

let users = [];

export async function loadUsers() {
    try {
        users = await fetchUsers();
        renderUserTable(users);
    } catch (error) {
        showToast('Error al cargar usuarios: ' + error.message, 'error');
    }
}

export async function openCreateUserModal() {
    const result = await showUserFormModal(null);
    if (!result) return;

    try {
        const response = await createUser(result);
        if (response.ok) {
            showToast('Usuario creado exitosamente', 'success');
            await loadUsers();
        } else {
            const err = await response.json();
            showToast(err.message || 'Error al crear usuario', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al crear usuario', 'error');
    }
}

export async function openEditUserModal(user) {
    const result = await showUserFormModal(user);
    if (!result) return;

    try {
        const response = await updateUser(user.id, result);
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

export async function confirmDeleteUser(user) {
    const confirmed = await showConfirmDialog({
        title: 'Eliminar usuario',
        message: `¿Estás seguro de eliminar a "${user.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    try {
        const response = await deleteUser(user.id);
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

export async function handleToggleStatus(user) {
    const newStatus = !(user.active !== false);
    const actionText = newStatus ? 'activar' : 'desactivar';

    const confirmed = await showConfirmDialog({
        title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} usuario`,
        message: `¿Estás seguro de ${actionText} a "${user.name}"?`,
        confirmText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    try {
        const response = await toggleUserStatus(user.id, newStatus);
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
