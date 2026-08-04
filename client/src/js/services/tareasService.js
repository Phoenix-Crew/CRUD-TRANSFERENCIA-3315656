// ============================================================
// tareasService.js — Lógica de negocio del módulo de tareas
// ============================================================
// FLUJO GENERAL:
//   app.js (eventos del DOM)
//     → ESTE ARCHIVO (estado en memoria + coordinación)
//       → api/tareasApi.js (HTTP al backend :3002)
//         → Express → MySQL → respuesta
//     → ui/* (renderizado, notificaciones)
//
// ESTADO LOCAL (variables de módulo): usuario actual, tareas
// cargadas, filtro, criterio y dirección de ordenamiento.
// ============================================================

// Imports de UI (referencias al DOM) — vienen de ui/dom.js
import { userIdInput, btnSearch, userInfo, taskFormContainer, taskForm, taskTableBody, exportBtn, adminFilterStatus, adminFilterUser, adminFilterDateFrom, adminFilterDateTo, adminApplyFilters, adminStatTotal, adminStatCompletadas, adminStatPendientes, adminStatProgreso, adminGlobalBody, adminUserDistBody, adminGlobalCount, assignedUsersGroup, assignedUsersContainer, assignedUsersHint, assignedUsersError } from '../ui/dom.js';
// Imports de la capa HTTP — vienen de api/tareasApi.js
import { fetchUsers, fetchTasksByUser, createTask, updateTask, deleteTaskFromApi, assignTask, removeUserFromTask, fetchTasksFiltered, fetchDashboard } from '../api/tareasApi.js';
// Imports de UI de feedback — vienen de ui/notifications.js
import { showToast, showUserInfo, showUserNotFound, showValidationError, clearFieldErrors, showFieldError } from '../ui/notifications.js';
// Imports de UI de modales — vienen de ui/confirmDialog.js y ui/editModal.js
import { showConfirmDialog } from '../ui/confirmDialog.js';
import { showEditModal } from '../ui/editModal.js';
// Imports de renderizado — vienen de ui/taskRenderer.js
import { enableTaskForm, hideEmptyState, showEmptyState, updateTaskCount, createTaskElement, updateSortIcons, updateSortButtonLabel, downloadJson } from '../ui/taskRenderer.js';
// Imports de utilidades puras — vienen de utils/helpers.js
import { getCurrentTimestamp, isValidInput, statusColors, sortTasks, filterTasksByStatus, buildTasksJson, buildExportFilename } from '../utils/helpers.js';

// ---------- ESTADO EN MEMORIA (módulo) ----------
let currentUser = null;      // Usuario buscado actualmente
let tasks = [];              // Tareas cargadas de ese usuario
let filterStatus = 'all';    // Filtro por estado (all | Pendiente | ...)
let sortCriteria = 'createdAt'; // Columna de ordenamiento
let sortDirection = 'desc';  // Dirección (asc | desc)

// ============================================================
// clearUserInfo — Resetea la interfaz del módulo de tareas
// ORIGEN: searchUser() cuando se busca otro usuario
// DESTINO: ui/notifications.js (borra feedback), ui/taskRenderer.js
// QUÉ HACE: limpia info del usuario, oculta el formulario,
// limpia la tabla y los checkboxes, resetea contadores y estado
// ============================================================
function clearUserInfo() {
    userInfo.innerHTML = '';                 // Borra el feedback del usuario
    taskFormContainer.style.display = 'none'; // Oculta el formulario de tareas
    clearUserCheckboxes();                    // Limpia el selector multi-usuario
    currentUser = null;                       // Sin usuario cargado
    tasks = [];                               // Sin tareas en memoria
    taskTableBody.innerHTML = '';             // Vacía la tabla
    updateTaskCount(tasks);                   // Contador a 0
    showEmptyState(tasks);                    // Muestra "No hay tareas"
    updateSortIcons(sortCriteria, sortDirection); // Actualiza flechas de orden
    updateSortButtonLabel(sortDirection);     // Texto del botón asc/desc
    setExportBtnState(false);                 // Deshabilita exportar
}

// ============================================================
// bindCallbacks — Crea los callbacks edit/delete para las filas
// ORIGEN: applySorting() → createTaskElement
// QUÉ HACE: devuelve { onEdit, onDelete } que la fila ejecutará
// al pulsar sus botones (así taskRenderer no depende de services)
// ============================================================
function bindCallbacks() {
    return {
        onEdit: editTaskViaModal, // Botón "Editar" → modal de edición
        onDelete: deleteTask      // Botón "Eliminar" → confirmación + DELETE
    };
}

// ============================================================
// clearUserCheckboxes — Limpia el selector multi-usuario
// QUÉ HACE: oculta el grupo, borra los checkboxes creados,
// restaura el hint y limpia el mensaje de error
// ============================================================
function clearUserCheckboxes() {
    if (assignedUsersGroup) assignedUsersGroup.style.display = 'none';
    if (assignedUsersContainer) assignedUsersContainer.innerHTML = '';
    if (assignedUsersHint) assignedUsersHint.style.display = '';
    if (assignedUsersError) assignedUsersError.textContent = '';
}

// ============================================================
// renderUserCheckboxes — Renderiza los checkboxes de usuarios
// ORIGEN: searchUser() cuando se encuentra un usuario
// DESTINO: api/tareasApi.fetchUsers (GET /api/users)
// QUÉ HACE: crea un checkbox por cada usuario del sistema;
// el usuario buscado (preSelectedUserId) aparece marcado.
// registerTask() luego lee los marcados para armar assignedUsers
// ============================================================
async function renderUserCheckboxes(preSelectedUserId) {
    try {
        // 1. Obtiene todos los usuarios desde la API (backend :3002)
        const users = await fetchUsers();

        // 2. Muestra el contenedor y limpia el contenido previo
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'block';
        if (assignedUsersContainer) assignedUsersContainer.innerHTML = '';
        if (assignedUsersHint) assignedUsersHint.style.display = 'none';
        if (assignedUsersError) assignedUsersError.textContent = '';

        // 3. Crea un label con checkbox por cada usuario
        users.forEach(user => {
            // label contenedor (mejora la zona clicable)
            const label = document.createElement('label');
            label.className = 'multi-user-checkbox';

            // input tipo checkbox con el id y nombre del usuario en dataset
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = user.id;
            checkbox.dataset.name = user.name;
            checkbox.id = `user-chk-${user.id}`;

            // Si el ID coincide con el usuario buscado, se marca por defecto
            if (String(user.id) === String(preSelectedUserId)) {
                checkbox.checked = true;
            }

            // Texto con el nombre (y rol) del usuario
            const span = document.createElement('span');
            span.textContent = `${user.name} (${user.rol})`;

            // Arma la estructura: input + texto dentro del label
            label.appendChild(checkbox);
            label.appendChild(span);
            assignedUsersContainer.appendChild(label);
        });
    } catch (error) {
        // Si la API falla, oculta el grupo sin romper la app
        console.warn('No se pudieron cargar usuarios para checkboxes:', error.message);
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'none';
    }
}

// ============================================================
// setExportBtnState — Habilita/deshabilita el botón de exportar
// QUÉ HACE: solo existe si hay un usuario cargado con tareas
// ============================================================
function setExportBtnState(enabled) {
    if (!exportBtn) return;
    exportBtn.disabled = !enabled;
}

// ============================================================
// getVisibleTasks — Tareas visibles según filtro + orden
// QUÉ HACE: aplica filterTasksByStatus y sortTasks (helpers puros)
// QUÉ DEVUELVE: array nuevo (no muta el estado)
// ============================================================
function getVisibleTasks() {
    const filtered = filterTasksByStatus(tasks, filterStatus);
    return sortTasks(filtered, sortCriteria, sortDirection);
}

// ============================================================
// exportVisibleTasks — Exporta las tareas visibles a JSON
// ORIGEN: app.js (botón #exportBtn)
// DESTINO: utils/helpers.js (buildTasksJson, buildExportFilename)
// y ui/taskRenderer.js (downloadJson)
// FLUJO: valida usuario y tareas → arma metadata → JSON
// → descarga .json → toast de éxito
// ============================================================
function exportVisibleTasks() {
    // Validación: hace falta un usuario cargado
    if (!currentUser) {
        showToast('No hay un usuario cargado para exportar', 'warning');
        return;
    }
    const visible = getVisibleTasks();
    // Validación: debe haber tareas con el filtro actual
    if (visible.length === 0) {
        showToast('No hay tareas para exportar con el filtro actual', 'warning');
        return;
    }
    try {
        // Metadata del archivo: usuario, filtro y fecha de exportación
        const exportedAt = getCurrentTimestamp();
        const meta = {
            user: { id: String(currentUser.id), name: currentUser.name },
            filter: { status: filterStatus, sortCriteria, sortDirection },
            exportedAt
        };
        // Construye el objeto JSON (helper puro)
        const jsonObject = buildTasksJson(visible, meta);
        const jsonString = JSON.stringify(jsonObject, null, 2);
        // Genera el nombre del archivo (helper puro)
        const filename = buildExportFilename(String(currentUser.id), filterStatus, exportedAt);
        // Dispara la descarga en el navegador (ui/taskRenderer.js)
        downloadJson(filename, jsonString);
        showToast(`Tareas exportadas (${visible.length})`, 'success');
    } catch (error) {
        showToast('Error al exportar las tareas: ' + error.message, 'error');
    }
}

// ============================================================
// applySorting — Re-renderiza la tabla con filtro + orden actuales
// ORIGEN: cualquier cambio de filtro/orden/datos
// DESTINO: ui/taskRenderer.js (createTaskElement, emptyState)
// QUÉ HACE: vacía el tbody, filtra y ordena, crea una fila por
// tarea (o muestra el estado vacío) y actualiza contador e iconos
// ============================================================
function applySorting() {
    taskTableBody.innerHTML = ''; // Limpia la tabla
    const filtered = filterTasksByStatus(tasks, filterStatus); // Filtra
    const ordered = sortTasks(filtered, sortCriteria, sortDirection); // Ordena
    if (ordered.length > 0) {
        hideEmptyState(); // Oculta "No hay tareas"
        ordered.forEach(task => createTaskElement(task, bindCallbacks())); // Una fila por tarea
    } else {
        showEmptyState(ordered); // Muestra "No hay tareas"
    }
    updateTaskCount(ordered); // Contador de filas visibles
    updateSortIcons(sortCriteria, sortDirection); // Flechas en los th
    updateSortButtonLabel(sortDirection); // Texto del botón asc/desc
}

// ============================================================
// setSortCriteria — Cambia la columna de ordenamiento
// ORIGEN: app.js (clic en th.sortable con data-sort)
// DESTINO: applySorting()
// ============================================================
function setSortCriteria(criteria) {
    sortCriteria = criteria;
    applySorting();
}

// ============================================================
// setFilterStatus — Cambia el filtro por estado
// ORIGEN: app.js (select #filterStatus)
// DESTINO: applySorting()
// ============================================================
function setFilterStatus(status) {
    filterStatus = status;
    applySorting();
}

// ============================================================
// setSortDirection — Fija la dirección de ordenamiento
// ORIGEN: interno (toggleSortDirection lo usa)
// DESTINO: applySorting()
// ============================================================
function setSortDirection(direction) {
    sortDirection = direction;
    applySorting();
}

// ============================================================
// toggleSortDirection — Alterna asc ↔ desc
// ORIGEN: app.js (botón #sortDirection)
// DESTINO: applySorting()
// ============================================================
function toggleSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    applySorting();
}

// ============================================================
// searchUser — Busca un usuario por su ID y carga sus tareas
// ORIGEN: app.js (botón #btnSearch o Enter en #userId)
// DESTINO: api/tareasApi (fetchUsers + fetchTasksByUser)
// FLUJO: valida el input → busca en la lista de usuarios →
// si existe: muestra info, activa formulario, renderiza
// checkboxes, carga sus tareas y aplica ordenamiento.
// Si no: muestra "usuario no registrado".
// ============================================================
async function searchUser() {
    const userId = userIdInput.value;
    // Validación del input (helper puro isValidInput)
    if (!isValidInput(userId)) {
        showValidationError('Por favor ingresa un documento/ID válido');
        return;
    }
    // Feedback visual: deshabilita el botón mientras busca
    btnSearch.disabled = true;
    btnSearch.textContent = 'Buscando...';
    userInfo.innerHTML = '';
    taskFormContainer.style.display = 'none';
    try {
        // 1. Obtiene todos los usuarios (GET /api/users)
        const users = await fetchUsers();
        // 2. Busca por ID exacto (con trim para tolerar espacios)
        const user = users.find(u => String(u.id).trim() === userId.trim());
        if (user) {
            // USUARIO ENCONTRADO:
            currentUser = user;                          // Guarda en estado
            showUserInfo(user);                          // Muestra nombre/rol/ficha
            enableTaskForm();                            // Activa el formulario
            await renderUserCheckboxes(user.id);         // Checkboxes (pre-marca al buscado)
            const savedTasks = await fetchTasksByUser(userId); // GET /api/users/:id/tasks
            tasks = savedTasks;                          // Guarda tareas en memoria
            applySorting();                              // Pinta la tabla
            setExportBtnState(true);                     // Habilita exportar
        } else {
            showUserNotFound(); // Usuario no existe en la BD
        }
    } catch (error) {
        // Error de red/backend: avisa que el servidor puede estar apagado
        showValidationError('Error de conexión: ' + error.message + '. Verifica que el servidor esté corriendo.');
    } finally {
        // Restaura el botón pase lo que pase
        btnSearch.disabled = false;
        btnSearch.textContent = 'Buscar';
    }
}

// ============================================================
// registerTask — Registra una nueva tarea
// ORIGEN: app.js (submit del formulario #taskForm)
// DESTINO: api/tareasApi.createTask (POST /api/tasks)
// FLUJO: previene el submit → limpia errores → valida título y
// descripción → lee los checkboxes marcados → arma assignedUsers
// [{ id, name }] → POST → agrega la tarea al estado → re-renderiza
// ============================================================
async function registerTask(event) {
    event.preventDefault(); // Evita recargar la página con el submit
    clearFieldErrors();     // Limpia errores de validación previos

    // Lee los campos del formulario
    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const statusInput = document.getElementById('taskStatus');
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const status = statusInput.value;

    // ---------- VALIDACIÓN ----------
    let hasError = false;
    if (!title) {
        showFieldError('taskTitle', 'titleError', 'El título es obligatorio.');
        hasError = true;
    }
    if (!description) {
        showFieldError('taskDescription', 'descError', 'La descripción es obligatoria.');
        hasError = true;
    }

    // ============================================================
    // Lee los checkboxes de usuarios marcados
    // Busca todos los input[type=checkbox]:checked del contenedor
    // y arma el array assignedUsers con la estructura { id, name }
    // que espera el backend (task.model.js insertAssignments).
    // ============================================================
    const checkedBoxes = assignedUsersContainer
        ? assignedUsersContainer.querySelectorAll('input[type="checkbox"]:checked')
        : [];

    if (checkedBoxes.length === 0) {
        // Sin usuarios seleccionados → error manual (el contenedor no es un input normal)
        if (assignedUsersError) assignedUsersError.textContent = 'Debes seleccionar al menos un usuario.';
        hasError = true;
    }

    // Si hay errores de validación, no envía nada
    if (hasError) return;

    // Construye el array de asignados desde los checkboxes marcados
    const assignedUsers = Array.from(checkedBoxes).map(cb => ({
        id: cb.value,
        name: cb.dataset.name
    }));

    // Objeto de la tarea que se envía al backend
    const taskData = {
        title,
        description,
        status,
        createdAt: getCurrentTimestamp(), // Solo informativo (el backend pone su propia fecha)
        assignedUsers
    };

    // ---------- ENVÍO AL BACKEND ----------
    try {
        const response = await createTask(taskData); // POST /api/tasks
        if (response.ok) {
            const savedTask = await response.json(); // Tarea creada (con id)
            tasks.push(savedTask);                   // Agrega al estado local
            applySorting();                          // Re-renderiza la tabla
            taskForm.reset();                        // Limpia el formulario
            showToast('Tarea registrada exitosamente', 'success');
        } else {
            showToast('Error al guardar la tarea en el servidor', 'error');
        }
    } catch (error) {
        showToast('Error de conexión: no se pudo guardar la tarea', 'error');
    }
}

// ============================================================
// editTaskViaModal — Edita una tarea desde el modal
// ORIGEN: bindCallbacks() → botón "Editar" de la fila
// DESTINO: ui/editModal.js (showEditModal) + api/tareasApi.updateTask
// FLUJO: abre modal con los datos actuales → si confirma, envía
// PATCH /api/tasks/:id → actualiza el estado local → re-renderiza
// ============================================================
async function editTaskViaModal(task) {
    // Abre el modal y espera el resultado (Promise<datos|null>)
    const result = await showEditModal({
        title: task.title,
        description: task.description,
        status: task.status
    });
    if (!result) return; // Cancelado

    try {
        // Envía la actualización al backend (PATCH /api/tasks/:id)
        const response = await updateTask(task.id, {
            title: result.title,
            description: result.description,
            status: result.status
        });
        if (response.ok) {
            const updatedTask = await response.json();
            // Reemplaza la tarea en el estado local
            const idx = tasks.findIndex(t => String(t.id) === String(task.id));
            if (idx !== -1) tasks[idx] = updatedTask;
            applySorting();
            showToast('Tarea actualizada correctamente', 'success');
        } else {
            showToast('Error al actualizar la tarea', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al actualizar la tarea', 'error');
    }
}

// ============================================================
// deleteTask — Elimina una tarea con confirmación
// ORIGEN: bindCallbacks() → botón "Eliminar" de la fila
// DESTINO: ui/confirmDialog.js + api/tareasApi.deleteTaskFromApi
// FLUJO: pide confirmación → DELETE /api/tasks/:id →
// quita la tarea del estado local → re-renderiza
// ============================================================
async function deleteTask(taskId) {
    // Modal de confirmación (Promise<boolean>)
    const confirmed = await showConfirmDialog({
        title: 'Eliminar tarea',
        message: '¿Estás seguro de eliminar esta tarea? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    try {
        const response = await deleteTaskFromApi(taskId); // DELETE /api/tasks/:id
        if (response.ok) {
            // Quita la tarea del estado local
            tasks = tasks.filter(t => String(t.id) !== String(taskId));
            applySorting();
            showToast('Tarea eliminada correctamente', 'success');
        } else {
            showToast('Error al eliminar la tarea', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al eliminar la tarea', 'error');
    }
}

// ============================================================
// assignUserToTask — Asigna un usuario a una tarea existente
// ORIGEN: exportada para otros módulos (asignaciones rápidas)
// DESTINO: api/tareasApi.assignTask (POST /api/tasks/:id/assign)
// FLUJO: POST → actualiza la tarea en estado local → toast
// ============================================================
export async function assignUserToTask(taskId, userObj) {
    try {
        const response = await assignTask(taskId, userObj);
        if (response.ok) {
            const updatedTask = await response.json();
            const idx = tasks.findIndex(t => String(t.id) === String(taskId));
            if (idx !== -1) tasks[idx] = updatedTask;
            applySorting();
            showToast(`Usuario ${userObj.name} asignado correctamente`, 'success');
        } else {
            // El backend puede responder 400 (ej: "El usuario ya está asignado")
            const errData = await response.json();
            showToast(errData.message || 'Error al asignar usuario', 'warning');
        }
    } catch (error) {
        showToast('Error de conexión al asignar el usuario', 'error');
    }
}

// ============================================================
// completeTaskDirect — Marca una tarea como Completada
// ORIGEN: ui/taskRenderer.js (botón "Completar" de la fila)
// DESTINO: api/tareasApi.updateTask (PATCH status: Completada)
// ============================================================
export async function completeTaskDirect(taskId) {
    try {
        const response = await updateTask(taskId, { status: 'Completada' });
        if (response.ok) {
            const updatedTask = await response.json();
            const idx = tasks.findIndex(t => String(t.id) === String(taskId));
            if (idx !== -1) tasks[idx] = updatedTask;
            applySorting();
            showToast('Tarea completada', 'success');
        } else {
            showToast('Error al completar la tarea', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// ============================================================
// renderAdminStats — Pinta las 4 tarjetas de estadísticas
// ORIGEN: loadAdminPanel() / applyAdminFilters()
// DESTINO: elementos del DOM (#adminStatTotal, etc.)
// QUÉ HACE: escribe los valores del dashboard en las tarjetas
// ============================================================
function renderAdminStats(dashboard) {
    if (!dashboard) return;
    adminStatTotal.textContent = dashboard.total;
    adminStatCompletadas.textContent = dashboard.completadas;
    adminStatPendientes.textContent = dashboard.pendientes;
    adminStatProgreso.textContent = dashboard.enProgreso;
}

// ============================================================
// renderGlobalTable — Pinta la tabla global de tareas (admin)
// ORIGEN: loadAdminPanel() / applyAdminFilters()
// DESTINO: #adminGlobalBody + #adminGlobalCount
// QUÉ HACE: crea una fila por tarea con título, descripción,
// badge de estado (coloreado), nombres de asignados y fecha
// ============================================================
function renderGlobalTable(tasks) {
    adminGlobalBody.innerHTML = '';
    adminGlobalCount.textContent = tasks.length === 1 ? '1 tarea' : `${tasks.length} tareas`;
    // Sin resultados: fila informativa en toda la tabla
    if (tasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align:center;color:var(--ink-faint);padding:24px;">No se encontraron tareas con los filtros actuales</td>';
        adminGlobalBody.appendChild(row);
        return;
    }
    // Una fila por tarea
    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.style.animation = 'fadeSlideUp 0.3s ease-out'; // Animación de entrada
        const bgColor = statusColors[task.status] || '#6b7280'; // Color según estado
        const userNames = task.assignedUsers && task.assignedUsers.length > 0
            ? task.assignedUsers.map(u => u.name).join(', ') // Nombres separados por coma
            : '—';
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td><span class="status-badge" style="background:${bgColor}">${task.status}</span></td>
            <td>${userNames}</td>
            <td>${task.createdAt || ''}</td>
            <td class="actions-cell">${task.id}</td>
        `;
        adminGlobalBody.appendChild(row);
    });
}

// ============================================================
// renderUserDistribution — Pinta la distribución por usuario
// ORIGEN: loadAdminPanel() / applyAdminFilters()
// DESTINO: #adminUserDistBody
// QUÉ HACE: ordena por cantidad descendente y crea una fila
// por usuario con su conteo de tareas
// ============================================================
function renderUserDistribution(porUsuario) {
    adminUserDistBody.innerHTML = '';
    // Sin datos: fila informativa
    if (!porUsuario || porUsuario.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="2" style="text-align:center;color:var(--ink-faint);padding:16px;">Sin datos</td>';
        adminUserDistBody.appendChild(row);
        return;
    }
    // Mayor cantidad primero
    porUsuario.sort((a, b) => b.count - a.count);
    porUsuario.forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${u.userName}</td><td><strong>${u.count}</strong></td>`;
        adminUserDistBody.appendChild(row);
    });
}

// ============================================================
// loadAdminPanel — Carga todo el panel de administración
// ORIGEN: app.js (DOMContentLoaded, y cada vez que se entra al panel)
// DESTINO: api/tareasApi (fetchUsers + fetchDashboard + fetchTasksFiltered)
// FLUJO: llena el select de usuarios del filtro → renderiza
// estadísticas y distribución → pinta la tabla global de tareas
// ============================================================
async function loadAdminPanel() {
    // 1. Usuarios para el select de filtro (GET /api/users)
    try {
        const users = await fetchUsers();
        adminFilterUser.innerHTML = '<option value="">Todos los usuarios</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.name;
            adminFilterUser.appendChild(opt);
        });
    } catch (e) {
        console.warn('No se pudieron cargar usuarios para el filtro admin', e);
    }

    // 2. Dashboard: estadísticas y distribución (GET /api/dashboard)
    try {
        const dashboard = await fetchDashboard();
        renderAdminStats(dashboard);
        renderUserDistribution(dashboard.porUsuario);
    } catch (e) {
        console.warn('No se pudo cargar el dashboard', e);
    }

    // 3. Todas las tareas para la tabla global (GET /api/tasks/filter sin filtros)
    try {
        const allTasks = await fetchTasksFiltered({});
        renderGlobalTable(allTasks);
    } catch (e) {
        console.warn('No se pudieron cargar las tareas globales', e);
    }
}

// ============================================================
// applyAdminFilters — Aplica los filtros combinados del admin
// ORIGEN: app.js (botón #adminApplyFilters)
// DESTINO: api/tareasApi (fetchTasksFiltered + fetchDashboard)
// FLUJO: arma los params desde los selects → GET /api/tasks/filter
// → re-renderiza la tabla global → refresca estadísticas
// (los filtros se aplican en el BACKEND con SQL dinámico)
// ============================================================
async function applyAdminFilters() {
    const params = {};
    const status = adminFilterStatus.value;
    const userId = adminFilterUser.value;
    const dateFrom = adminFilterDateFrom.value;
    const dateTo = adminFilterDateTo.value;
    // Solo agrega al query los filtros con valor
    if (status) params.status = status;
    if (userId) params.userId = userId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    try {
        const filtered = await fetchTasksFiltered(params); // GET /api/tasks/filter
        renderGlobalTable(filtered);                       // Tabla global filtrada
        const dashboard = await fetchDashboard();          // Refresca stats
        renderAdminStats(dashboard);
        renderUserDistribution(dashboard.porUsuario);
        showToast(`Filtro aplicado: ${filtered.length} tarea(s) encontrada(s)`, 'info');
    } catch (e) {
        showToast('Error al aplicar filtros: ' + e.message, 'error');
    }
}

// ============================================================
// EXPORTACIONES — lo que consume app.js (y otros módulos)
// searchUser, registerTask: eventos principales
// setSortCriteria / setSortDirection / toggleSortDirection /
// setFilterStatus: controles de orden y filtro
// exportVisibleTasks: exportación JSON
// loadAdminPanel / applyAdminFilters: panel de administración
// clearUserInfo: reset de interfaz
// ============================================================
export { searchUser, registerTask, clearUserInfo, setSortCriteria, setSortDirection, toggleSortDirection, setFilterStatus, exportVisibleTasks, loadAdminPanel, applyAdminFilters };
