import { userInfo, taskFormContainer, toastContainer } from './dom.js';
import notificationManager from '../core/NotificationManager.js';

// Cómo se lee: "Function createToastElement, con notification como parámetro."
function createToastElement(notification) { // Qué hace: arma el aviso flotante (toast) y lo elimina solo tras 4 segundos.
    // Cómo se lee: "Const toast se asigna a document punto createElement, con div como argumento."
    const toast = document.createElement('div'); // Qué hace: crea el contenedor del aviso
    // Cómo se lee: "Toast punto className se asigna a la plantilla toast guion guion más notification punto type."
    toast.className = `toast toast--${notification.type}`; // Qué hace: le da la clase que lo pinta del color según el tipo (éxito, error, etc.)
    // Cómo se lee: "Const icons se asigna a un objeto con las cuatro llaves y sus emojis."
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }; // Qué hace: guarda el icono que corresponde a cada tipo
    // Cómo se lee: "Toast punto innerHTML se asigna a la plantilla con el icono y el mensaje."
    toast.innerHTML = `
        <span>${icons[notification.type] || ''} ${notification.message}</span>
        <button class="toast__close">&times;</button>
    `; // Qué hace: dibuja dentro del toast el emoji, el mensaje y el botón de cerrar
    // Cómo se lee: "Toast punto querySelector pasando la clase, punto addEventListener, y al hacer clic elimina el toast."
    toast.querySelector('.toast__close').addEventListener('click', () => toast.remove()); // Qué hace: el botón X cierra el aviso manualmente
    // Cómo se lee: "ToastContainer punto appendChild pasando toast."
    toastContainer.appendChild(toast); // Qué hace: mete el aviso dentro del área donde flotan los toasts
    // Cómo se lee: "SetTimeout, pasando una función y 4000, para que se autodestruya."
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000); // Qué hace: a los 4 segundos desvanece el toast y a los 300 ms más lo borra del DOM
}

// Cómo se lee: "Const unsubscribe se asigna a notificationManager punto subscribe, pasando createToastElement."
// Qué es: conecta el centro de notificaciones con la función que dibuja el toast.
const unsubscribe = notificationManager.subscribe(createToastElement);

// Cómo se lee: "Export function showToast, pasando message y type como parámetros."
export function showToast(message, type = 'success') { // Qué hace: es la notificación que el flujo muestra de fondo (éxito, error, advertencia, info).
    // Cómo se lee: "NotificationManager punto add, pasando type y message como argumentos."
    notificationManager.add(type, message); // Qué hace: registra la notificación; NotificationManager la reparte a la función suscrita
}

// Cómo se lee: "Export function showUserInfo, con user como parámetro."
export function showUserInfo(user) { // Qué hace: se llama en searchUser cuando el usuario es encontrado; pinta su tarjeta.
    // Cómo se lee: "UserInfo punto innerHTML se asigna a la plantilla con nombre, rol y ficha del user."
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--success">
            <strong>✅ Usuario encontrado:</strong><br>
            <strong>Nombre:</strong> ${user.name}<br>
            <strong>Rol:</strong> ${user.rol}<br>
            <strong>Ficha:</strong> ${user.ficha}
        </div>
    `; // Qué hace: dibuja en la tarjeta verde los datos del usuario buscado
}

// Cómo se lee: "Export function showUserNotFound."
export function showUserNotFound() { // Qué hace: se llama cuando el ID no coincide con nadie; además oculta el formulario.
    // Cómo se lee: "UserInfo punto innerHTML se asigna al aviso de error."
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--error">
            ❌ El usuario no está registrado en el sistema.
        </div>
    `; // Qué hace: pinta el aviso en rojo de que el usuario no existe
    // Cómo se lee: "TaskFormContainer punto style punto display se asigna a none."
    taskFormContainer.style.display = 'none'; // Qué hace: oculta el formulario porque no hay usuario válido a quien asignar
}

// Cómo se lee: "Export function showValidationError, con message como parámetro."
export function showValidationError(message) { // Qué hace: se usa cuando la búsqueda es inválida o hubo error de conexión.
    // Cómo se lee: "UserInfo punto innerHTML se asigna a la plantilla del aviso de advertencia."
    userInfo.innerHTML = `
        <div class="user-feedback user-feedback--warning">
            ⚠️ ${message}
        </div>
    `; // Qué hace: pinta el mensaje de advertencia en la tarjeta del usuario
}

// Cómo se lee: "Export function clearFieldErrors."
// Qué es: como te dijo tu compañero: itera los campos con 'field-error' y les borra texto y clase.
export function clearFieldErrors() {
    // Cómo se lee: "Document punto querySelectorAll punto field-error invoca forEach, y a cada el le asigna
    // textContent a comilla vacía."
    document.querySelectorAll('.field-error').forEach(el => el.textContent = ''); // Qué hace: limpia el mensaje de los campos que tenían error
    // Cómo se lee: "Document punto querySelectorAll punto form guion input punto error forEach, y a cada el le quita la clase error."
    document.querySelectorAll('.form__input.error').forEach(el => el.classList.remove('error')); // Qué hace: quita el borde rojo de los campos marcados
}

// Cómo se lee: "Export function showFieldError, pasando inputId, errorId y message como parámetros."
export function showFieldError(inputId, errorId, message) { // Qué hace: es lo opuesto a clearFieldErrors: enciende el error de UN campo específico.
    // Cómo se lee: "Const input se asigna a document punto getElementById, pasando inputId."
    const input = document.getElementById(inputId); // Qué hace: busca el campo del formulario que va a quedar en rojo
    // Cómo se lee: "Const errorEl se asigna a document punto getElementById, pasando errorId."
    const errorEl = document.getElementById(errorId); // Qué hace: busca el espacio donde va el mensaje de error
    // Cómo se lee: "Si input existe, input punto classList punto add, con la clase error."
    if (input) input.classList.add('error'); // Qué hace: marca el campo en rojo
    // Cómo se lee: "Si errorEl existe, su textContent se asigna a message."
    if (errorEl) errorEl.textContent = message; // Qué hace: pone el mensaje debajo del campo
}
