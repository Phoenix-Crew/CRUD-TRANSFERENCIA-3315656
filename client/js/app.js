import { userIdInput, btnSearch, taskForm } from './ui/dom.js';
import { searchUser, registerTask } from './services/tareasService.js';
import { fetchUsers } from './api/tareasApi.js';
import { showEmptyState } from './ui/taskRenderer.js';

btnSearch.addEventListener('click', searchUser);

userIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUser();
    }
});

taskForm.addEventListener('submit', registerTask);

document.addEventListener('DOMContentLoaded', async function() {
    showEmptyState([]);

    try {
        const users = await fetchUsers();
        console.group("IDs DISPONIBLES PARA BUSCAR (Carga Inicial)");
        console.table(users.map(u => ({ ID: u.id, Nombre: u.name, Rol: u.rol })));
        console.groupEnd();
    } catch (error) {
        console.warn("No se pudieron precargar los IDs. ¿El backend está encendido?", error.message);
    }
});
