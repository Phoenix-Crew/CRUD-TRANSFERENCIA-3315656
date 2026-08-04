// Archivo: confirmDialog.js — Ventana modal de confirmación (capa de UI)

// ¿Que hace este archivo?
//   Construye dinámicamente una ventana modal de confirmación
//   (Sí/No / Aceptar/Cancelar) y retorna una Promise con el
//   resultado. Crea el overlay, el modal y sus botones sin
//   depender del HTML estático de index.html.
//
// ¿que no hace?
//   NO hace llamadas a la API, NO manipula estado, NO agrega
//   referencias a dom.js. Su única responsabilidad es mostrar
//   el modal y resolver la Promise con true/false (o null).
//
// ¿que exporta?
//   - showConfirmDialog({ title, message, confirmText, cancelText })
//     → Promise<boolean> (true = confirmar, false = cancelar/cerrar)
//
// ¿que parámetros acepta?
//   - title        → título del modal (por defecto: "Confirmar acción")
//   - message      → mensaje de la pregunta (¿Estás seguro?)
//   - confirmText  → texto del botón de confirmar ("Confirmar")
//   - cancelText   → texto del botón de cancelar ("Cancelar")
//
// ¿quien lo usa?
//   - services/tareasService.js → eliminar tarea (confirmación)
//   - services/usersService.js  → eliminar / desactivar usuario
//
// COMPORTAMIENTO: cierra con la tecla Escape, al hacer clic
// fuera del modal o con los botones. Usa animaciones modalIn/modalOut.

// showConfirmDialog — Muestra ventana modal de confirmacion; retorna Promise<boolean>
export function showConfirmDialog({
    title = 'Confirmar acción',
    message = '¿Estás seguro?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
} = {}) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true">
                <div class="modal__header">
                    <h3 class="modal__title">${title}</h3>
                </div>
                <p class="modal__message">${message}</p>
                <div class="modal__actions">
                    <button class="modal__btn modal__btn--cancel">${cancelText}</button>
                    <button class="modal__btn modal__btn--confirm">${confirmText}</button>
                </div>
            </div>
        `;

        const modal = overlay.querySelector('.modal');
        const cancelBtn = overlay.querySelector('.modal__btn--cancel');
        const confirmBtn = overlay.querySelector('.modal__btn--confirm');

        // PASO 3: bandera para que close() solo se ejecute UNA vez
        //         (evita dobles resoluciones si se disparan varios clics)
        let closed = false;

        // close — Cierra el modal, elimina el overlay y resuelve la Promise
        const close = (result) => {
            // 3.1 si ya se cerró, no hacer nada de nuevo
            if (closed) return;
            closed = true;
            // 3.2 lanzar animación de salida (modalOut)
            modal.style.animation = 'modalOut 0.2s ease-out forwards';
            // 3.3 al terminar la animación, quitar el overlay y resolver
            overlay.addEventListener('animationend', () => {
                overlay.remove();
                resolve(result);
            }, { once: true });
            // 3.4 fallback de seguridad: si pasan 250ms y el overlay sigue
            //     conectado, quitarlo igualmente (por si no dispara animación)
            setTimeout(() => {
                if (overlay.isConnected) {
                    overlay.remove();
                    resolve(result);
                }
            }, 250);
        };

        // PASO 4: conectar los botones
        // 4.1 "Cancelar" → false
        cancelBtn.addEventListener('click', () => close(false));
        // 4.2 "Confirmar" → true
        confirmBtn.addEventListener('click', () => close(true));
        // 4.3 clic FUERA del modal (sobre el overlay) → equivale a cancelar
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
        });

        // PASO 5: soporte de teclado — tecla Escape cierra cancelando
        const keyHandler = (e) => {
            if (e.key === 'Escape') close(false);
        };
        document.addEventListener('keydown', keyHandler);

        // PASO 6: al eliminarse el overlay, quitar el listener de Escape
        //         para no dejar fugas de memoria
        overlay.addEventListener('remove', () => {
            document.removeEventListener('keydown', keyHandler);
        }, { once: true });

        // PASO 7: agregar el overlay al <body> para que se vea
        document.body.appendChild(overlay);
        // PASO 8: en el siguiente frame, lanzar la animación de entrada
        //         (sin requestAnimationFrame no se ve la transición)
        requestAnimationFrame(() => {
            modal.style.animation = 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        });

        // PASO 9: poner el foco en el botón de confirmar (accesibilidad)
        confirmBtn.focus();
    });
}
