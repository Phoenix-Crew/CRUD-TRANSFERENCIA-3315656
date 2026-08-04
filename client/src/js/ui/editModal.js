// Archivo: editModal.js — Modal de edición de tareas (capa de UI)

// ¿Que hace este archivo?
//   Construye dinámicamente un modal para editar una tarea:
//   título, descripción y estado (Pendiente / En progreso /
//   Completada). Crea el overlay, el formulario y sus botones
//   sin depender del HTML estático de index.html.
//
// ¿que no hace?
//   NO hace llamadas a la API, NO manipula estado ni guarda la
//   tarea editada. Solo captura los datos del formulario y los
//   devuelve al abrir/guardar. No usa dom.js.
//
// ¿que exporta?
//   - showEditModal({ title, description, status, onSave, onCancel })
//     → Promise<datos|null>  (datos = { title, description, status })
//
// COMPORTAMIENTO:
//   - Valida que título y descripción no estén vacíos (marca el
//     campo con la clase .error si falla).
//   - Cierra con Escape, al hacer clic fuera (devuelve null) o
//     con Ctrl+Enter / Cmd+Enter (equivale a Guardar).
//   - Crea el modal con animaciones modalIn/modalOut.

// showEditModal — Muestra modal para editar titulo, descripcion y estado de una tarea; retorna Promise con los datos
export function showEditModal({ title = '', description = '', status = 'Pendiente', onSave, onCancel }) {
    // PASO 0: devolvemos una Promise. resolve() se llamará con los
    //         datos editados { title, description, status } o null al cancelar.
    return new Promise(resolve => {
        // PASO 1: crear el overlay (fondo oscuro)
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // PASO 2: construir el HTML del modal con los datos actuales.
        //         title y description se escapan (replace de ") para
        //         evitar romper el HTML si contienen comillas.
        overlay.innerHTML = `
            <div class="modal edit-modal" role="dialog" aria-modal="true">
                <div class="modal__header">
                    <h3 class="modal__title">Editar Tarea</h3>
                </div>
                <div class="edit-modal__body">
                    <div class="form__group">
                        <label for="editTaskTitle" class="form__label">Título</label>
                        <input type="text" id="editTaskTitle" class="form__input" value="${title.replace(/"/g, '&quot;')}" placeholder="Título de la tarea">
                    </div>
                    <div class="form__group">
                        <label for="editTaskDesc" class="form__label">Descripción</label>
                        <textarea id="editTaskDesc" class="form__input form__textarea" rows="3" placeholder="Descripción de la tarea">${description.replace(/"/g, '&quot;')}</textarea>
                    </div>
                    <div class="form__group">
                        <label for="editTaskStatus" class="form__label">Estado</label>
                        <select id="editTaskStatus" class="form__input">
                            <option value="Pendiente" ${status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="En progreso" ${status === 'En progreso' ? 'selected' : ''}>En progreso</option>
                            <option value="Completada" ${status === 'Completada' ? 'selected' : ''}>Completada</option>
                        </select>
                    </div>
                </div>
                <div class="modal__actions">
                    <button class="modal__btn modal__btn--cancel">Cancelar</button>
                    <button class="modal__btn modal__btn--save">Guardar Cambios</button>
                </div>
            </div>
        `;

        // PASO 3: referenciar los elementos recién creados
        const modal = overlay.querySelector('.modal');
        const cancelBtn = overlay.querySelector('.modal__btn--cancel');
        const saveBtn = overlay.querySelector('.modal__btn--save');

        // PASO 4: bandera para que close() solo se ejecute UNA vez
        let closed = false;

        // close — Cierra el modal con animacion y resuelve la Promise
        const close = (result) => {
            // 4.1 si ya se cerró, salir
            if (closed) return;
            closed = true;
            // 4.2 animación de salida (modalOut)
            modal.style.animation = 'modalOut 0.2s ease-out forwards';
            // 4.3 al terminar animación, quitar overlay y resolver
            overlay.addEventListener('animationend', () => {
                overlay.remove();
                resolve(result);
            }, { once: true });
            // 4.4 fallback por tiempo (250ms)
            setTimeout(() => {
                if (overlay.isConnected) {
                    overlay.remove();
                    resolve(result);
                }
            }, 250);
        };

        // PASO 5: botón "Cancelar" → cierra con null
        cancelBtn.addEventListener('click', () => close(null));

        // PASO 6: botón "Guardar Cambios"
        saveBtn.addEventListener('click', () => {
            // 6.1 leer y limpiar (trim) los valores del formulario
            const newTitle = document.getElementById('editTaskTitle').value.trim();
            const newDesc = document.getElementById('editTaskDesc').value.trim();
            const newStatus = document.getElementById('editTaskStatus').value;

            // 6.2 validar: título y descripción son obligatorios
            if (!newTitle || !newDesc) {
                // marca cada campo vacío con la clase .error
                if (!newTitle) document.getElementById('editTaskTitle').classList.add('error');
                if (!newDesc) document.getElementById('editTaskDesc').classList.add('error');
                return; // no cierra: se queda para corregir
            }

            // 6.3 si todo ok → cerrar resolviendo con los datos
            close({ title: newTitle, description: newDesc, status: newStatus });
        });

        // PASO 7: clic FUERA del modal → cancela (null)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(null);
        });

        // PASO 8: atajos de teclado — Escape cancela;
        //         Ctrl+Enter / Cmd+Enter equivale a Guardar
        const keyHandler = (e) => {
            if (e.key === 'Escape') close(null);
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                saveBtn.click();
            }
        };
        document.addEventListener('keydown', keyHandler);

        // PASO 9: al quitar el overlay, eliminar el listener de teclado
        overlay.addEventListener('remove', () => {
            document.removeEventListener('keydown', keyHandler);
        }, { once: true });

        // PASO 10: agregar el overlay al <body>
        document.body.appendChild(overlay);
        // PASO 11: animación de entrada en el siguiente frame
        requestAnimationFrame(() => {
            modal.style.animation = 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        });

        // PASO 12: foco inicial en el campo de título (accesibilidad)
        document.getElementById('editTaskTitle').focus();
    });
}
