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

// Cómo se lee: "btnSearch invoca addEventListener, con 'click' como evento y searchUser como callback."
// Qué es searchUser: es una función importada de tareasService. Vamos a su definición con Ctrl+Click.
btnSearch.addEventListener('click', searchUser); // Qué hace: registra el clic y ejecuta searchUser cuando se presione el botón.

// Cómo se lee: "userIdInput invoca addEventListener, con 'keypress' como evento y una función anónima que recibe el evento e."
// Qué es e: el objeto del evento; e.key trae la tecla que se presionó.
userIdInput.addEventListener('keypress', function(e) {
    // Cómo se lee: "If, con la condición e punto key es exactamente igual a Enter."
    if (e.key === 'Enter') { // Qué hace: comprueba si la tecla presionada es Enter (=== compara tipo y valor) para disparar la búsqueda.
        searchUser();
    }
});

// Cómo se lee: "taskForm invoca addEventListener, con 'submit' como evento y registerTask como callback."
// Qué es registerTask: es la función que arma la lista assignedUsers y la envía al backend. Lo veremos con Ctrl+Click.
// Qué es: esta línea inicia el flujo de asignación: aquí guardamos la tarea para los usuarios marcados.
taskForm.addEventListener('submit', registerTask); // Qué hace: al enviar el formulario ejecuta registerTask, que registra la tarea y la asigna a los usuarios marcados.

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

    // Cómo se lee: "Try, con la condición de intentar la carga inicial."
    try { // Qué hace: protege la carga inicial por si el backend no responde; si falla, pasa al catch.
        // Cómo se lee: "Const users se asigna a await fetchUsers."
        const users = await fetchUsers(); // Qué hace: pide al backend todos los usuarios y los guarda; son quienes luego se pueden asignar a las tareas.
        // Cómo se lee: "console punto group, con el texto 'IDs DISPONIBLES PARA BUSCAR (Carga Inicial)'."
        console.group("IDs DISPONIBLES PARA BUSCAR (Carga Inicial)"); // Qué hace: abre un grupo en la consola para listar los ids disponibles.
        // Cómo se lee: "console punto table, con users punto map, pasando cada usuario u como objeto con ID, Nombre y Rol."
        console.table(users.map(u => ({ ID: u.id, Nombre: u.name, Rol: u.rol }))); // Qué hace: muestra en tabla el id, nombre y rol de cada usuario.
        // Cómo se lee: "console punto groupEnd."
        console.groupEnd(); // Qué hace: cierra el grupo abierto antes en la consola.
        // Cómo se lee: "loadAdminPanel."
        loadAdminPanel(); // Qué hace: carga el panel de administración con los datos ya disponibles.
    } catch (error) {
        // Cómo se lee: "Catch, con error: si el try falló, entra aquí."
        console.warn("No se pudieron precargar los IDs. ¿El backend está encendido?", error.message); // Qué hace: muestra en consola una advertencia con el detalle técnico del error.
        // Cómo se lee: "loadAdminPanel."
        loadAdminPanel(); // Qué hace: carga el panel igualmente para no dejar la interfaz sin datos.
    }

    loadUsers();
});
