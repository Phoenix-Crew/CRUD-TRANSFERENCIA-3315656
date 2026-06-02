import { userInfo, taskFormContainer, toastContainer } from './dom.js';

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `
        <span>${icons[type] || ''} ${message}</span>
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

export function showUserNotFound() {
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--error">
            ❌ El usuario no está registrado en el sistema.
        </div>
    `;
    taskFormContainer.style.display = 'none';
}

export function showValidationError(message) {
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--warning">
            ⚠️ ${message}
        </div>
    `;
}

export function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input.error').forEach(el => el.classList.remove('error'));
}

export function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
}
