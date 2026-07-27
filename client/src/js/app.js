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

// ============================================================
// Navegación por pestañas
// Muestra/oculta secciones al hacer clic en las pestañas
// ============================================================
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const section = this.dataset.section;

        // Actualizar clase activa en pestañas
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('nav-tab--active'));
        this.classList.add('nav-tab--active');

        // Mostrar sección correspondiente, ocultar las demás
        document.querySelectorAll('.section-content').forEach(s => s.classList.remove('section-content--active'));
        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) targetSection.classList.add('section-content--active');
    });
});

// ============================================================
// Listeners de búsqueda de usuario
// ============================================================
btnSearch.addEventListener('click', searchUser);

userIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUser();
    }
});

// ============================================================
// Listeners del formulario de tareas
// ============================================================
taskForm.addEventListener('submit', registerTask);

// ============================================================
// Listeners de filtro y ordenamiento
// ============================================================
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

// ============================================================
// Listener de exportación JSON
// ============================================================
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        exportVisibleTasks();
    });
}

// ============================================================
// Listeners del panel de administración
// ============================================================
if (adminApplyFilters) {
    adminApplyFilters.addEventListener('click', applyAdminFilters);
}

// ============================================================
// Listeners de administración de usuarios
// ============================================================
if (btnCreateUser) {
    btnCreateUser.addEventListener('click', openCreateUserModal);
}

document.addEventListener('user:edit', (e) => openEditUserModal(e.detail));
document.addEventListener('user:delete', (e) => confirmDeleteUser(e.detail));
document.addEventListener('user:toggle', (e) => handleToggleStatus(e.detail));

// ============================================================
// Carga inicial — se ejecuta cuando el DOM está listo
// ============================================================
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