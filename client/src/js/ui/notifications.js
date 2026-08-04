
import { userInfo, taskFormContainer, toastContainer } from './dom.js';
import notificationManager from '../core/NotificationManager.js';

// createToastElement — Construye un toast visual y lo agrega al contenedor con auto-destruccion
function createToastElement(notification) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${notification.type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `
        <span>${icons[notification.type] || ''} ${notification.message}</span>
        <button class="toast__close">&times;</button>
    `;
    toast.querySelector('.toast__close').addEventListener('click', () => toast.remove());
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

const unsubscribe = notificationManager.subscribe(createToastElement);

// showToast — Añade una notificacion de tipo success/error/warning/info al gestor
export function showToast(message, type = 'success') {
    notificationManager.add(type, message);
}

// showUserInfo — Muestra los datos del usuario encontrado en la UI
export function showUserInfo(user) {
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--success">
            <strong>✅ Usuario encontrado:</strong><br>
            <strong>Nombre:</strong> ${user.name}<br>
            <strong>Rol:</strong> ${user.rol}<br>
            <strong>Ficha:</strong> ${user.ficha}
        </div>
    `;
}

// showUserNotFound — Indica que el usuario buscado no existe
export function showUserNotFound() {
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--error">
            ❌ El usuario no está registrado en el sistema.
        </div>
    `;
    taskFormContainer.style.display = 'none';
}

// showValidationError — Muestra un mensaje de advertencia (ej. ID invalido)
export function showValidationError(message) {
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--warning">
            ⚠️ ${message}
        </div>
    `;
}

// clearFieldErrors — Limpia todos los errores de validacion del formulario
export function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input.error').forEach(el => el.classList.remove('error'));
}

// showFieldError — Marca un campo como erroneo y muestra el mensaje de error
export function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
}
