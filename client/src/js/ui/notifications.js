import { userInfo, taskFormContainer, toastContainer } from './dom.js';
import notificationManager from '../core/NotificationManager.js';

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

export function showToast(message, type = 'success') {
    notificationManager.add(type, message);
}

export function showUserInfo(user) { // "export" hace pública la función; "function" declara; "showUserInfo" muestra la información del usuario; "user" recibe el objeto del usuario buscado; la llave abre el bloque
    userInfo.innerHTML = ` // "userInfo" es el espacio de la tarjeta; ".innerHTML" le asigna contenido HTML; la plantilla (acento grave) permite escribir HTML y meter valores
        <div class="user-feedback user-feedback--success"> // etiqueta "div" con la clase "user-feedback" y el modificador "--success" que la pinta de verde
            <strong>✅ Usuario encontrado:</strong><br> // "strong" resalta el texto de confirmación; "<br>" hace un salto de línea
            <strong>Nombre:</strong> ${user.name}<br> // "strong" resalta la etiqueta "Nombre:" y "${user.name}" muestra el nombre del usuario; "<br>" salta de línea
            <strong>Rol:</strong> ${user.rol}<br> // "strong" resalta la etiqueta "Rol:" y "${user.rol}" muestra el rol del usuario; "<br>" salta de línea
            <strong>Ficha:</strong> ${user.ficha} // "strong" resalta la etiqueta "Ficha:" y "${user.ficha}" muestra la ficha del usuario
        </div> // la etiqueta de cierre termina el contenedor de la tarjeta
    `; // el acento grave cierra la plantilla HTML
}

export function showUserNotFound() { // "export" hace pública la función; "function" declara; "showUserNotFound" avisa que no se encontró al usuario; la llave abre el bloque
    userInfo.innerHTML = ` // "userInfo" es el espacio de la tarjeta; ".innerHTML" le asigna contenido; la plantilla permite escribir HTML
        <div class="user-feedback user-feedback--error"> // etiqueta "div" con la clase "user-feedback" y el modificador "--error" que la pinta de rojo
            ❌ El usuario no está registrado en el sistema. // el icono y el texto le comunican al usuario que su documento no está en el sistema
        </div> // la etiqueta de cierre termina el contenedor
    `; // el acento grave cierra la plantilla HTML
    taskFormContainer.style.display = 'none'; // "taskFormContainer" es el contenedor del formulario de registrar tarea; ".style" accede a los estilos; ".display" controla la visibilidad; "= 'none'" lo oculta porque, sin un usuario válido, no se puede asignar ninguna tarea
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
