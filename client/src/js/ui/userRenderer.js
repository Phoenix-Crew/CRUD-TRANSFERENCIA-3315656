// ============================================================
// userRenderer.js — Renderizado de la tabla de usuarios
// ============================================================
// Se encarga de pintar la tabla de usuarios en el DOM,
// y de mostrar/ocultar el estado vacio. Tambien contiene
// el modal de formulario para crear/editar usuarios.

import { userTableBody, userEmptyState, userCount } from './dom.js';

export function renderUserTable(users) {
    userTableBody.innerHTML = '';

    // Mostrar estado vacio si no hay usuarios
    if (users.length === 0) {
        userEmptyState.style.display = 'block';
        userCount.textContent = '0 usuarios';
        return;
    }

    userEmptyState.style.display = 'none';
    userCount.textContent = users.length === 1 ? '1 usuario' : `${users.length} usuarios`;

    users.forEach(user => {
        const row = document.createElement('tr');
        row.style.animation = 'fadeIn 0.3s ease';
        row.dataset.userId = user.id;

        const isActive = user.active !== false;
        const statusClass = isActive ? 'user-status-badge--active' : 'user-status-badge--inactive';
        const statusText = isActive ? 'Activo' : 'Inactivo';

        row.innerHTML = `
            <td><span class="user-name">${user.name}</span></td>
            <td><span class="user-email">${user.email || '—'}</span></td>
            <td><span class="user-rol">${user.rol}</span></td>
            <td><span class="user-status-badge ${statusClass}">${statusText}</span></td>
            <td class="actions-cell">
                <button class="action-btn action-btn--edit btn-user-edit">Editar</button>
                <button class="action-btn action-btn--delete btn-user-delete">Eliminar</button>
                <button class="action-btn ${isActive ? 'action-btn--status-off' : 'action-btn--status-on'} btn-user-toggle">${isActive ? 'Desactivar' : 'Activar'}</button>
            </td>
        `;

        // Disparar eventos personalizados para que app.js los maneje
        row.querySelector('.btn-user-edit').addEventListener('click', () => {
            const event = new CustomEvent('user:edit', { detail: user });
            document.dispatchEvent(event);
        });

        row.querySelector('.btn-user-delete').addEventListener('click', () => {
            const event = new CustomEvent('user:delete', { detail: user });
            document.dispatchEvent(event);
        });

        row.querySelector('.btn-user-toggle').addEventListener('click', () => {
            const event = new CustomEvent('user:toggle', { detail: user });
            document.dispatchEvent(event);
        });

        userTableBody.appendChild(row);
    });
}

export function renderUserCount(users) {
    userCount.textContent = users.length === 1 ? '1 usuario' : `${users.length} usuarios`;
}

export function showUserFormModal(user) {
    const isEditing = !!user;
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        overlay.innerHTML = `
            <div class="modal edit-modal" role="dialog" aria-modal="true">
                <div class="modal__header">
                    <h3 class="modal__title">${isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                </div>
                <div class="edit-modal__body">
                    <div class="form__group">
                        <label for="userFormName" class="form__label">Nombre</label>
                        <input type="text" id="userFormName" class="form__input" value="${isEditing ? user.name.replace(/"/g, '&quot;') : ''}" placeholder="Nombre completo">
                        <span class="field-error" id="userFormNameError"></span>
                    </div>
                    <div class="form__group">
                        <label for="userFormEmail" class="form__label">Email</label>
                        <input type="email" id="userFormEmail" class="form__input" value="${isEditing ? (user.email || '').replace(/"/g, '&quot;') : ''}" placeholder="correo@ejemplo.com">
                        <span class="field-error" id="userFormEmailError"></span>
                    </div>
                    <div class="form__group">
                        <label for="userFormRol" class="form__label">Rol</label>
                        <select id="userFormRol" class="form__input">
                            <option value="">Selecciona un rol</option>
                            <option value="Aprendiz" ${isEditing && user.rol === 'Aprendiz' ? 'selected' : ''}>Aprendiz</option>
                            <option value="Instructor" ${isEditing && user.rol === 'Instructor' ? 'selected' : ''}>Instructor</option>
                            <option value="Coordinador" ${isEditing && user.rol === 'Coordinador' ? 'selected' : ''}>Coordinador</option>
                            <option value="Admin" ${isEditing && user.rol === 'Admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <span class="field-error" id="userFormRolError"></span>
                    </div>
                    <div class="form__group">
                        <label for="userFormPassword" class="form__label">${isEditing ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}</label>
                        <input type="password" id="userFormPassword" class="form__input" placeholder="${isEditing ? 'Dejar vacío para mantener' : 'Mínimo 6 caracteres'}">
                        <span class="field-error" id="userFormPasswordError"></span>
                    </div>
                </div>
                <div class="modal__actions">
                    <button class="modal__btn modal__btn--cancel">Cancelar</button>
                    <button class="modal__btn modal__btn--save">${isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</button>
                </div>
            </div>
        `;

        const modal = overlay.querySelector('.modal');
        const cancelBtn = overlay.querySelector('.modal__btn--cancel');
        const saveBtn = overlay.querySelector('.modal__btn--save');

        let closed = false;

        function clearUserFormErrors() {
            ['userFormNameError', 'userFormEmailError', 'userFormRolError', 'userFormPasswordError'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '';
            });
            overlay.querySelectorAll('.form__input.error').forEach(el => el.classList.remove('error'));
        }

        function showUserFormError(inputId, errorId, message) {
            const input = document.getElementById(inputId);
            const errorEl = document.getElementById(errorId);
            if (input) input.classList.add('error');
            if (errorEl) errorEl.textContent = message;
        }

        const close = (result) => {
            if (closed) return;
            closed = true;
            modal.style.animation = 'modalOut 0.2s ease-out forwards';
            overlay.addEventListener('animationend', () => {
                overlay.remove();
                resolve(result);
            }, { once: true });
            setTimeout(() => {
                if (overlay.isConnected) {
                    overlay.remove();
                    resolve(result);
                }
            }, 250);
        };

        cancelBtn.addEventListener('click', () => close(null));

        saveBtn.addEventListener('click', () => {
            clearUserFormErrors();

            const name = document.getElementById('userFormName').value.trim();
            const email = document.getElementById('userFormEmail').value.trim();
            const rol = document.getElementById('userFormRol').value;
            const password = document.getElementById('userFormPassword').value;

            let hasError = false;

            if (!name) {
                showUserFormError('userFormName', 'userFormNameError', 'El nombre es obligatorio');
                hasError = true;
            }
            if (!email) {
                showUserFormError('userFormEmail', 'userFormEmailError', 'El email es obligatorio');
                hasError = true;
            } else if (!email.includes('@')) {
                showUserFormError('userFormEmail', 'userFormEmailError', 'Ingresa un email válido');
                hasError = true;
            }
            if (!rol) {
                showUserFormError('userFormRol', 'userFormRolError', 'Selecciona un rol');
                hasError = true;
            }
            if (!isEditing && !password) {
                showUserFormError('userFormPassword', 'userFormPasswordError', 'La contraseña es obligatoria');
                hasError = true;
            } else if (password && password.length < 6) {
                showUserFormError('userFormPassword', 'userFormPasswordError', 'Mínimo 6 caracteres');
                hasError = true;
            }

            if (hasError) return;

            const data = { name, email, rol };
            if (password) data.password = password;

            close(data);
        });

        // Cerrar al hacer click fuera o presionar Escape
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(null);
        });

        const keyHandler = (e) => {
            if (e.key === 'Escape') close(null);
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                saveBtn.click();
            }
        };
        document.addEventListener('keydown', keyHandler);

        overlay.addEventListener('remove', () => {
            document.removeEventListener('keydown', keyHandler);
        }, { once: true });

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            modal.style.animation = 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        });

        document.getElementById('userFormName').focus();
    });
}
