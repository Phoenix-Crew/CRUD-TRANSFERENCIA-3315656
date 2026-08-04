
// Archivo: notifications.js — Notificaciones (toasts) y feedback de usuario (capa de UI)

// ¿Que hace este archivo?
//   Maneja las dos formas de dar retroalimentación visual al
//   usuario:
//     1. Notificaciones tipo "toast" (✅ ❌ ⚠️ ℹ️) que se renderizan
//        a partir de la cola del NotificationManager (patrón
//        observador: se suscribe al cargar el módulo).
//     2. Feedback embebido en la interfaz: tarjeta del usuario
//        encontrado, mensaje de "no encontrado", mensajes de
//        advertencia y errores de validación de formulario.
//
// ¿que no hace?
//   NO hace llamadas a la API, NO guarda estado. Simplemente
//   pinta lo que recibe.
//
// ¿que exporta?
//   - showToast(message, type='success') → agrega notif al gestor
//   - showUserInfo(user)       → tarjeta verde "Usuario encontrado"
//   - showUserNotFound()       → tarjeta roja "no registrado"
//   - showValidationError(msg) → tarjeta amarilla de advertencia
//   - clearFieldErrors()       → limpia los errores de validación
//   - showFieldError(id, errId, msg) → marca un input como error
//
// ¿quien lo usa?
//   - services/tareasService.js → showToast, showUserInfo,
//                                 showUserNotFound, showValidationError,
//                                 clearFieldErrors, showFieldError
//   - services/usersService.js  → showToast
//   - core/NotificationManager.js → este módulo se suscribe y
//                                   renderiza los toasts

import { userInfo, taskFormContainer, toastContainer } from './dom.js';
import notificationManager from '../core/NotificationManager.js';

// createToastElement — Construye un toast visual y lo agrega al contenedor con auto-destruccion
// PASO 1: crear el elemento <div> del toast con la clase base + la clase según el tipo
function createToastElement(notification) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${notification.type}`;
    // PASO 2: mapear el tipo de notificación a un icono visual
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    // PASO 3: inyectar el HTML del toast (icono + mensaje + botón de cerrar)
    toast.innerHTML = `
        <span>${icons[notification.type] || ''} ${notification.message}</span>
        <button class="toast__close">&times;</button>
    `;
    // PASO 4: al hacer clic en la X, eliminar el toast inmediatamente
    toast.querySelector('.toast__close').addEventListener('click', () => toast.remove());
    // PASO 5: agregar el toast al contenedor visible
    toastContainer.appendChild(toast);
    // PASO 6: después de 4 segundos, iniciar la animación de salida (fade + slide)
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        // PASO 7: una vez terminada la transición (300ms), quitar el toast del DOM
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

const unsubscribe = notificationManager.subscribe(createToastElement);

// showToast — Añade una notificacion de tipo success/error/warning/info al gestor
// PASO 1: simplemente delega al NotificationManager para que lo distribuya a todos los suscriptores
export function showToast(message, type = 'success') {
    notificationManager.add(type, message);
}

// showUserInfo — Muestra los datos del usuario encontrado en la UI
// PASO 1: pintar una tarjeta verde con nombre, rol y ficha del usuario
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
// PASO 1: pintar una tarjeta roja de error
// PASO 2: ocultar el formulario de tareas (no tiene sentido mientras no hay usuario)
export function showUserNotFound() {
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--error">
            ❌ El usuario no está registrado en el sistema.
        </div>
    `;
    taskFormContainer.style.display = 'none';
}

// showValidationError — Muestra un mensaje de advertencia (ej. ID invalido)
// PASO 1: pintar una tarjeta amarilla de advertencia con el mensaje recibido
export function showValidationError(message) {
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--warning">
            ⚠️ ${message}
        </div>
    `;
}

// clearFieldErrors — Limpia todos los errores de validacion del formulario
// PASO 1: quitar todos los mensajes de error (span .field-error)
// PASO 2: quitar la clase .error de todos los inputs marcados
export function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input.error').forEach(el => el.classList.remove('error'));
}

// showFieldError — Marca un campo como erroneo y muestra el mensaje de error
// PASO 1: agregar la clase .error al input para el estilo visual rojo
// PASO 2: escribir el mensaje de error en el span de error correspondiente
export function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
}
