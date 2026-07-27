// Archivo: dom.js — Referencias a elementos del HTML (capa de UI)

// ¿Que hace este archivo?
//   Centraliza TODAS las referencias a elementos del DOM usando
//   getElementById / querySelectorAll. Los demás módulos importan
//   estas constantes en vez de llamar a getElementById directamente.
//
// ¿que no hace?
//   NO manipula el DOM, NO agrega listeners, NO tiene lógica.
//
// ¿que exporta?  (13 referencias)
//   Búsqueda de usuario:
//     - userIdInput, btnSearch, userInfo
//   Formulario y tabla de tareas:
//     - taskFormContainer, taskForm, taskTableBody,
//       taskCount, emptyState
//   Notificaciones:
//     - toastContainer
//   RF02 (ordenamiento + filtro):
//     - filterStatusSelect  → <select> para filtrar por estado
//     - sortDirectionBtn   → botón que alterna asc/desc
//     - sortableHeaders    → NodeList de <th.sortable> (clickeables)
//   RF04 (exportación JSON):
//     - exportBtn          → botón "Exportar JSON"
//
// ¿quien las usa?
//   - app.js             → userIdInput, btnSearch, taskForm,
//                          filterStatusSelect, sortDirectionBtn,
//                          sortableHeaders, exportBtn
//   - services/tareasService.js → userInfo, taskFormContainer,
//                                  taskTableBody, taskForm, exportBtn
//   - ui/notifications.js → userInfo, taskFormContainer, toastContainer
//   - ui/taskRenderer.js  → taskTableBody, taskCount, emptyState,
//                           taskFormContainer, sortableHeaders

export const userIdInput = document.getElementById('userId');
export const btnSearch = document.getElementById('btnSearch');
export const userInfo = document.getElementById('userInfo');
export const taskFormContainer = document.getElementById('taskFormContainer');
export const taskForm = document.getElementById('taskForm');
export const taskTableBody = document.getElementById('taskTableBody');
export const taskCount = document.getElementById('taskCount');
export const emptyState = document.getElementById('emptyState');
export const toastContainer = document.getElementById('toastContainer');
export const filterStatusSelect = document.getElementById('filterStatus');
export const sortDirectionBtn = document.getElementById('sortDirection');
export const sortableHeaders = document.querySelectorAll('th.sortable');
export const exportBtn = document.getElementById('exportBtn');

// Admin Panel
export const adminPanel = document.getElementById('adminPanel');
export const adminFilterStatus = document.getElementById('adminFilterStatus');
export const adminFilterUser = document.getElementById('adminFilterUser');
export const adminFilterDateFrom = document.getElementById('adminFilterDateFrom');
export const adminFilterDateTo = document.getElementById('adminFilterDateTo');
export const adminApplyFilters = document.getElementById('adminApplyFilters');
export const adminStatTotal = document.getElementById('adminStatTotal');
export const adminStatCompletadas = document.getElementById('adminStatCompletadas');
export const adminStatPendientes = document.getElementById('adminStatPendientes');
export const adminStatProgreso = document.getElementById('adminStatProgreso');
export const adminGlobalBody = document.getElementById('adminGlobalBody');
export const adminUserDistBody = document.getElementById('adminUserDistBody');
export const adminGlobalCount = document.getElementById('adminGlobalCount');


// User Admin
export const userAdminSection = document.getElementById('userAdminSection');
export const userTableBody = document.getElementById('userTableBody');
export const userEmptyState = document.getElementById('userEmptyState');
export const btnCreateUser = document.getElementById('btnCreateUser');
export const userCount = document.getElementById('userCount');

// ============================================================
// Multi-usuario (asignacion de tareas a varios usuarios)
// Agregados en la Fase de Transferencia (v4.0)
// ============================================================
//   - assignedUsersGroup    → contenedor visible del grupo de checkboxes
//   - assignedUsersContainer → donde se renderizan los checkboxes
//   - assignedUsersHint     → texto de ayuda (se oculta al cargar)
//   - assignedUsersError    → mensaje de error si no se selecciona ninguno
export const assignedUsersGroup = document.getElementById('assignedUsersGroup');
export const assignedUsersContainer = document.getElementById('assignedUsersContainer');
export const assignedUsersHint = document.getElementById('assignedUsersHint');
export const assignedUsersError = document.getElementById('assignedUsersError');
