// ============================================================
// app.js — Orquestador principal de la aplicación
// ============================================================
// Conecta eventos del DOM con la lógica de negocio.
// NO tiene lógica de negocio ni llamadas API directas.
//
// Eventos que conecta:
//   1. Navegación por pestañas (tasks/admin/users)
//   2. Búsqueda de usuario
//   3. Registro de tarea
//   4. Filtro y ordenamiento de tareas
//   5. Exportación JSON
//   6. Filtros del panel admin
//   7. CRUD de usuarios (crear, editar, eliminar, toggle)
//   8. Carga inicial de datos

import '../styles/styles.css';
import { userIdInput, btnSearch, taskForm, filterStatusSelect, sortDirectionBtn, sortableHeaders, exportBtn, adminApplyFilters, btnCreateUser } from './ui/dom.js';
import { searchUser, registerTask, setSortCriteria, toggleSortDirection, setFilterStatus, exportVisibleTasks, loadAdminPanel, applyAdminFilters } from './services/tareasService.js';
import { fetchUsers } from './api/tareasApi.js';
import { showEmptyState } from './ui/taskRenderer.js';
import { loadUsers, openCreateUserModal, openEditUserModal, confirmDeleteUser, handleToggleStatus } from './services/usersService.js';

// Navegacion por pestanas: al hacer clic cambia la seccion activa
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

// Listener: boton de busqueda de usuario
btnSearch.addEventListener('click', searchUser);

// Listener: tecla Enter en el campo de ID de usuario
userIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUser();
    }
});

// Listener: envio del formulario de registro de tareas
taskForm.addEventListener('submit', registerTask);

// Listener: cambio en el selector de filtro por estado
if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', (e) => {
        setFilterStatus(e.target.value);
    });
}

// Listener: clic en el boton de direccion de ordenamiento
if (sortDirectionBtn) {
    sortDirectionBtn.addEventListener('click', () => {
        toggleSortDirection();
    });
}

// Listeners: clic en encabezados ordenables de la tabla
sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
        const criteria = th.dataset.sort;
        if (!criteria) return;
        setSortCriteria(criteria);
    });
});

// Listener: boton de exportacion JSON
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        exportVisibleTasks();
    });
}

// Listener: boton de aplicar filtros del panel admin
if (adminApplyFilters) {
    adminApplyFilters.addEventListener('click', applyAdminFilters);
}

// Listener: boton de crear usuario
if (btnCreateUser) {
    btnCreateUser.addEventListener('click', openCreateUserModal);
}

// Listeners de eventos personalizados para CRUD de usuarios
document.addEventListener('user:edit', (e) => openEditUserModal(e.detail));
document.addEventListener('user:delete', (e) => confirmDeleteUser(e.detail));
document.addEventListener('user:toggle', (e) => handleToggleStatus(e.detail));

// Carga inicial al cargar el DOM: muestra IDs disponibles, carga panel admin y usuarios
document.addEventListener('DOMContentLoaded', async function() {
    showEmptyState([]);

    try {
        const users = await fetchUsers();
        console.group("IDs DISPONIBLES PARA BUSCAR (Carga Inicial)");
        console.table(users.map(u => ({ ID: u.id, Nombre: u.name, Rol: u.rol })));
        console.groupEnd();
        loadAdminPanel();
    } catch (error) {
        console.warn("No se pudieron precargar los IDs. ¿El backend está encendido?", error.message);
        loadAdminPanel();
    }

    loadUsers();
});