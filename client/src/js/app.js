// ============================================================
// app.js — Orquestador principal de la aplicación
// ============================================================
// FLUJO: el navegador carga index.html → <script src="app.js">
// → este archivo conecta los EVENTOS del DOM con las funciones
// de negocio (services). NO tiene lógica de negocio ni llama
// a la API directamente: SOLO conecta y coordina.
//
// ARQUITECTURA (modularización):
//   app.js (orquestador)
//     ├── ui/dom.js               → referencias a elementos del HTML
//     ├── services/tareasService.js → lógica de tareas (buscar, crear, filtrar, admin)
//     ├── services/usersService.js  → lógica de usuarios (CRUD)
//     ├── api/tareasApi.js + usersApi.js → fetch al backend Express (:3002)
//     └── ui/taskRenderer.js, userRenderer.js, notifications.js → renderizado
//
// EVENTOS QUE CONECTA:
//   1. Navegación por pestañas (tasks/admin/users)
//   2. Búsqueda de usuario
//   3. Registro de tarea
//   4. Filtro y ordenamiento de tareas
//   5. Exportación JSON
//   6. Filtros del panel admin
//   7. CRUD de usuarios (crear, editar, eliminar, toggle)
//   8. Carga inicial de datos
// ============================================================

// Importa los estilos (Vite los inyecta en el HTML)
import '../styles/styles.css';
// Importa las referencias al DOM (vienen de ui/dom.js — capa de UI)
import { userIdInput, btnSearch, taskForm, filterStatusSelect, sortDirectionBtn, sortableHeaders, exportBtn, adminApplyFilters, btnCreateUser } from './ui/dom.js';
// Importa la lógica de tareas (vienen de services/tareasService.js)
import { searchUser, registerTask, setSortCriteria, toggleSortDirection, setFilterStatus, exportVisibleTasks, loadAdminPanel, applyAdminFilters } from './services/tareasService.js';
// Importa la capa HTTP de tareas (viene de api/tareasApi.js → GET /api/users)
import { fetchUsers } from './api/tareasApi.js';
// Importa el renderizado del estado vacío (viene de ui/taskRenderer.js)
import { showEmptyState } from './ui/taskRenderer.js';
// Importa la lógica de usuarios (viene de services/usersService.js)
import { loadUsers, openCreateUserModal, openEditUserModal, confirmDeleteUser, handleToggleStatus } from './services/usersService.js';

// ============================================================
// EVENTO 1 — Navegación por pestañas
// ORIGEN: botones .nav-tab del index.html
// DESTINO: cambia clases nav-tab--active y section-content--active
// QUÉ HACE: muestra/oculta las 3 secciones sin recargar la página
// ============================================================
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const section = this.dataset.section; // tasks | admin | users (data-section del botón)

        // Quita la clase activa de todos los botones y la pone en el clickeado
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('nav-tab--active'));
        this.classList.add('nav-tab--active');

        // Oculta todas las secciones y muestra la correspondiente (id = section-{nombre})
        document.querySelectorAll('.section-content').forEach(s => s.classList.remove('section-content--active'));
        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) targetSection.classList.add('section-content--active');
    });
});

// EVENTO 2 — Botón "Buscar" (#btnSearch)
// ORIGEN: index.html → DESTINO: tareasService.searchUser()
// FLUJO: searchUser → api.fetchUsers + fetchTasksByUser → pinta info del usuario
btnSearch.addEventListener('click', searchUser);

// EVENTO 2b — Tecla Enter en el campo de ID (#userId)
// ORIGEN: input userId → DESTINO: misma búsqueda de usuario
userIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUser();
    }
});

// EVENTO 3 — Envío del formulario de tareas (#taskForm)
// ORIGEN: index.html → DESTINO: tareasService.registerTask()
// FLUJO: registerTask valida → POST /api/tasks → refresca la tabla
taskForm.addEventListener('submit', registerTask);

// EVENTO 4 — Selector de filtro por estado (#filterStatus)
// ORIGEN: index.html → DESTINO: tareasService.setFilterStatus()
// FLUJO: setFilterStatus → applySorting() (filtro en memoria + re-render)
if (filterStatusSelect) {
    filterStatusSelect.addEventListener('change', (e) => {
        setFilterStatus(e.target.value);
    });
}

// EVENTO 5 — Botón de dirección de ordenamiento (#sortDirection)
// ORIGEN: index.html → DESTINO: tareasService.toggleSortDirection()
// QUÉ HACE: alterna asc ↔ desc y vuelve a ordenar
if (sortDirectionBtn) {
    sortDirectionBtn.addEventListener('click', () => {
        toggleSortDirection();
    });
}

// EVENTO 6 — Encabezados ordenables de la tabla (th.sortable)
// ORIGEN: index.html (data-sort="title|status|createdAt")
// DESTINO: tareasService.setSortCriteria(criterio)
sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
        const criteria = th.dataset.sort;
        if (!criteria) return;
        setSortCriteria(criteria);
    });
});

// EVENTO 7 — Botón "Exportar JSON" (#exportBtn)
// ORIGEN: index.html → DESTINO: tareasService.exportVisibleTasks()
// QUÉ HACE: descarga las tareas visibles (filtradas/ordenadas) como .json
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        exportVisibleTasks();
    });
}

// EVENTO 8 — Botón "Aplicar Filtros" del panel admin (#adminApplyFilters)
// ORIGEN: index.html → DESTINO: tareasService.applyAdminFilters()
// FLUJO: arma query params → GET /api/tasks/filter → re-renderiza tablas admin
if (adminApplyFilters) {
    adminApplyFilters.addEventListener('click', applyAdminFilters);
}

// EVENTO 9 — Botón "Nuevo Usuario" (#btnCreateUser)
// ORIGEN: index.html → DESTINO: usersService.openCreateUserModal()
// FLUJO: abre modal → POST /api/users → recarga la tabla
if (btnCreateUser) {
    btnCreateUser.addEventListener('click', openCreateUserModal);
}

// ============================================================
// EVENTOS PERSONALIZADOS del CRUD de usuarios
// ORIGEN: ui/userRenderer.js (los botones de cada fila despachan
//         CustomEvent: user:edit, user:delete, user:toggle)
// DESTINO: services/usersService.js (modales + API)
// ============================================================
document.addEventListener('user:edit', (e) => openEditUserModal(e.detail));
document.addEventListener('user:delete', (e) => confirmDeleteUser(e.detail));
document.addEventListener('user:toggle', (e) => handleToggleStatus(e.detail));

// ============================================================
// CARGA INICIAL — cuando el DOM está listo
// FLUJO: DOMContentLoaded → showEmptyState → fetchUsers (log de IDs
// disponibles para buscar) → loadAdminPanel (estadísticas + tablas)
// → loadUsers (tabla de usuarios)
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
    showEmptyState([]); // Deja el estado vacío visible en la tabla de tareas

    try {
        // Pre-carga los usuarios solo para LOGUEAR los IDs disponibles
        // (viene de api/tareasApi.js → GET /api/users)
        const users = await fetchUsers();
        console.group("IDs DISPONIBLES PARA BUSCAR (Carga Inicial)");
        console.table(users.map(u => ({ ID: u.id, Nombre: u.name, Rol: u.rol })));
        console.groupEnd();
        loadAdminPanel(); // Carga estadísticas, filtros y tablas del panel admin
    } catch (error) {
        // Si el backend no responde, avisa en consola pero no bloquea la app
        console.warn("No se pudieron precargar los IDs. ¿El backend está encendido?", error.message);
        loadAdminPanel();
    }

    loadUsers(); // Carga la tabla de usuarios (services/usersService.js → GET /api/users)
});
