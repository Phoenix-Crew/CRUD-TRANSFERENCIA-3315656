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

        cancelBtn.addEventListener('click', () => close(false));
        confirmBtn.addEventListener('click', () => close(true));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
        });

        const keyHandler = (e) => {
            if (e.key === 'Escape') close(false);
        };
        document.addEventListener('keydown', keyHandler);

        overlay.addEventListener('remove', () => {
            document.removeEventListener('keydown', keyHandler);
        }, { once: true });

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            modal.style.animation = 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        });

        confirmBtn.focus();
    });
}
