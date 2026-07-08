
export function showEditModal({ title = '', description = '', status = 'Pendiente', onSave, onCancel }) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

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

        const modal = overlay.querySelector('.modal');
        const cancelBtn = overlay.querySelector('.modal__btn--cancel');
        const saveBtn = overlay.querySelector('.modal__btn--save');

        let closed = false;

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
            const newTitle = document.getElementById('editTaskTitle').value.trim();
            const newDesc = document.getElementById('editTaskDesc').value.trim();
            const newStatus = document.getElementById('editTaskStatus').value;

            if (!newTitle || !newDesc) {
                if (!newTitle) document.getElementById('editTaskTitle').classList.add('error');
                if (!newDesc) document.getElementById('editTaskDesc').classList.add('error');
                return;
            }

            close({ title: newTitle, description: newDesc, status: newStatus });
        });

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

        document.getElementById('editTaskTitle').focus();
    });
}
