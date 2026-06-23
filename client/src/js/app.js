// Archivo: app.js — Punto de entrada / orquestador de la app

// ¿Que hace este archivo?
//   Es el único archivo que conecta eventos del DOM con la lógica
//   del service. Importa los módulos, registra listeners y dispara
//   la carga inicial. NO tiene lógica de negocio ni llamadas API.
//
// ¿Que no hace?
//   NO toca la API, NO manipula estado, NO renderiza la tabla.
//
// ¿Que importa?
//   - ui/dom.js                  → referencias a elementos HTML
//   - services/tareasService.js  → funciones de negocio (7 exports)
//   - api/tareasApi.js           → solo fetchUsers() (carga inicial)
//   - ui/taskRenderer.js         → showEmptyState() (estado vacío)
//
// Listeners que conecta (8 eventos):
//   Búsqueda de usuario:
//     1. click en btnSearch           → searchUser()
//     2. keypress Enter en userIdInput → searchUser()
//   Formulario de tareas:
//     3. submit en taskForm           → registerTask(ev)
//   RF02 (ordenamiento + filtro):
//     4. change en filterStatusSelect → setFilterStatus(value)
//     5. click en sortDirectionBtn    → toggleSortDirection()
//     6. click en cada th.sortable    → setSortCriteria(dataset.sort)
//   RF04 (exportación JSON):
//     7. click en exportBtn           → exportVisibleTasks()
//   Carga inicial:
//     8. DOMContentLoaded             → showEmptyState + fetchUsers
//                                       (log en consola con IDs)

import '../styles/styles.css';
import { userIdInput, btnSearch, taskForm, filterStatusSelect, sortDirectionBtn, sortableHeaders, exportBtn } from './ui/dom.js';
import { searchUser, registerTask, setSortCriteria, toggleSortDirection, setFilterStatus, exportVisibleTasks } from './services/tareasService.js';
import { fetchUsers } from './api/tareasApi.js';
import { showEmptyState } from './ui/taskRenderer.js';

btnSearch.addEventListener('click', searchUser);

userIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUser();
    }
});

taskForm.addEventListener('submit', registerTask);

if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', (e) => {
        setFilterStatus(e.target.value);
    });
}

if (sortDirectionBtn) {
    sortDirectionBtn.addEventListener('click', () => {
        toggleSortDirection();
    });
}

sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
        const criteria = th.dataset.sort;
        if (!criteria) return;
        setSortCriteria(criteria);
    });
});

if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        exportVisibleTasks();
    });
}

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
