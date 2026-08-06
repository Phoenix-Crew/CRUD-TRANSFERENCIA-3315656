import '../styles/styles.css';
import { userIdInput, btnSearch, taskForm, filterStatusSelect, sortDirectionBtn, sortableHeaders, exportBtn, adminApplyFilters, btnCreateUser } from './ui/dom.js';
import { searchUser, registerTask, setSortCriteria, toggleSortDirection, setFilterStatus, exportVisibleTasks, loadAdminPanel, applyAdminFilters } from './services/tareasService.js';
import { fetchUsers } from './api/tareasApi.js';
import { showEmptyState } from './ui/taskRenderer.js';
import { loadUsers, openCreateUserModal, openEditUserModal, confirmDeleteUser, handleToggleStatus } from './services/usersService.js';

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const section = this.dataset.section;

        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('nav-tab--active'));
        this.classList.add('nav-tab--active');

        document.querySelectorAll('.section-content').forEach(s => s.classList.remove('section-content--active'));
        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) targetSection.classList.add('section-content--active');
    });
});

btnSearch.addEventListener('click', searchUser); // "btnSearch" es el botón de buscar; ".addEventListener" le asigna un escuchador; "'click'" se dispara al presionar el botón; "searchUser" es la función que busca al usuario: carga sus tareas y prepara los checkboxes para asignar la tarea

userIdInput.addEventListener('keypress', function(e) { // "userIdInput" es el campo donde se digita el id; ".addEventListener" escucha; "'keypress'" se dispara al presionar una tecla; "function(e)" recibe el evento de la tecla; la llave abre la función
    if (e.key === 'Enter') { // "if" pregunta; "e.key" es la tecla presionada; "===" pregunta si es exactamente igual; "'Enter'" es la tecla de enter; si la presionan, entra al bloque
        searchUser(); // "searchUser()" ejecuta la misma búsqueda que hace el botón, para que enter también funcione
    } // la llave cierra el bloque del "if"
});

taskForm.addEventListener('submit', registerTask); // "taskForm" es el formulario; ".addEventListener" escucha; "'submit'" se dispara al enviar el formulario; "registerTask" es la función que registra la tarea y la asigna a los usuarios marcados: es el evento principal del flujo "asignar tarea"

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

if (adminApplyFilters) {
    adminApplyFilters.addEventListener('click', applyAdminFilters);
}

if (btnCreateUser) {
    btnCreateUser.addEventListener('click', openCreateUserModal);
}

document.addEventListener('user:edit', (e) => openEditUserModal(e.detail));
document.addEventListener('user:delete', (e) => confirmDeleteUser(e.detail));
document.addEventListener('user:toggle', (e) => handleToggleStatus(e.detail));

document.addEventListener('DOMContentLoaded', async function() {
    showEmptyState([]);

    try { // "try" abre el bloque protegido: si algo falla, pasa al "catch"
        const users = await fetchUsers(); // "const" declara; "users" guarda la lista; "await" espera a que termine; "fetchUsers()" pide al backend todos los usuarios, que son quienes luego se pueden asignar a las tareas
        console.group("IDs DISPONIBLES PARA BUSCAR (Carga Inicial)"); // "console.group" abre un grupo en la consola; el texto indica que se listan los ids disponibles para buscar
        console.table(users.map(u => ({ ID: u.id, Nombre: u.name, Rol: u.rol }))); // "console.table" muestra una tabla en la consola; "users.map" recorre cada usuario y "u" es cada uno; las llaves crean un objeto con "ID", "Nombre" y "Rol" del usuario para verlos ordenados
        console.groupEnd(); // "console.groupEnd" cierra el grupo abierto antes en la consola
        loadAdminPanel(); // "loadAdminPanel" carga el panel de administración con los datos ya disponibles
    } catch (error) { // "catch" atrapa el error; "error" es ese error
        console.warn("No se pudieron precargar los IDs. ¿El backend está encendido?", error.message); // "console.warn" muestra una advertencia; el texto avisa que no se pudieron precargar los ids y "error.message" agrega el detalle técnico
        loadAdminPanel(); // "loadAdminPanel" carga el panel igualmente para no dejar la interfaz sin datos
    } // la llave cierra el bloque del "catch"

    loadUsers();
});
