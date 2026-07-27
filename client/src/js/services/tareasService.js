import { userIdInput, btnSearch, userInfo, taskFormContainer, taskForm, taskTableBody, exportBtn, adminFilterStatus, adminFilterUser, adminFilterDateFrom, adminFilterDateTo, adminApplyFilters, adminStatTotal, adminStatCompletadas, adminStatPendientes, adminStatProgreso, adminGlobalBody, adminUserDistBody, adminGlobalCount, assignedUsersGroup, assignedUsersContainer, assignedUsersHint, assignedUsersError } from '../ui/dom.js';
import { fetchUsers, fetchTasksByUser, createTask, updateTask, deleteTaskFromApi, assignTask, removeUserFromTask, fetchTasksFiltered, fetchDashboard } from '../api/tareasApi.js';
import { showToast, showUserInfo, showUserNotFound, showValidationError, clearFieldErrors, showFieldError } from '../ui/notifications.js';
import { showConfirmDialog } from '../ui/confirmDialog.js';
import { showEditModal } from '../ui/editModal.js';
import { enableTaskForm, hideEmptyState, showEmptyState, updateTaskCount, createTaskElement, updateSortIcons, updateSortButtonLabel, downloadJson } from '../ui/taskRenderer.js';
import { getCurrentTimestamp, isValidInput, statusColors, sortTasks, filterTasksByStatus, buildTasksJson, buildExportFilename } from '../utils/helpers.js';

let currentUser = null;
let tasks = [];
let filterStatus = 'all';
let sortCriteria = 'createdAt';
let sortDirection = 'desc';

function clearUserInfo() {
    // Limpia la informacion del usuario mostrado
    userInfo.innerHTML = '';
    // Oculta el formulario de registro de tareas
    taskFormContainer.style.display = 'none';
    // Limpia los checkboxes de seleccion multiple de usuarios
    clearUserCheckboxes();
    // Reinicia el estado actual
    currentUser = null;
    tasks = [];
    taskTableBody.innerHTML = '';
    updateTaskCount(tasks);
    showEmptyState(tasks);
    updateSortIcons(sortCriteria, sortDirection);
    updateSortButtonLabel(sortDirection);
    setExportBtnState(false);
}

function bindCallbacks() {
    return {
        onEdit: editTaskViaModal,
        onDelete: deleteTask
    };
}

// ============================================================
// clearUserCheckboxes — Limpia el selector multi-usuario
// Oculta el grupo de checkboxes, borra el contenido y
// reinicia el mensaje de error.
// ============================================================
function clearUserCheckboxes() {
    if (assignedUsersGroup) assignedUsersGroup.style.display = 'none';
    if (assignedUsersContainer) assignedUsersContainer.innerHTML = '';
    if (assignedUsersHint) assignedUsersHint.style.display = '';
    if (assignedUsersError) assignedUsersError.textContent = '';
}

// ============================================================
// renderUserCheckboxes — Renderiza los checkboxes de usuarios
//
// ¿Que hace?
//   Obtiene todos los usuarios desde la API y crea un checkbox
//   por cada uno. El usuario que se acaba de buscar (userId)
//   aparece pre-seleccionado. Los demas aparecen sin marcar
//   para que el usuario pueda elegir a quienes asignar la tarea.
//
// ¿Por que checkboxes?
//   Porque son intuitivos: un clic para marcar, otro para
//   desmarcar. No requieren combinaciones de teclado (Ctrl+click)
//   como los select multiple, lo que evita confusiones en
//   usuarios no tecnicos.
//
// ¿Como se usa?
//   Se llama desde searchUser() cuando se encuentra un usuario.
//   registerTask() luego lee los checkboxes marcados para
//   construir el array assignedUsers.
// ============================================================
async function renderUserCheckboxes(preSelectedUserId) {
    try {
        // Obtener todos los usuarios del sistema
        const users = await fetchUsers();

        // Mostrar el contenedor de checkboxes
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'block';
        if (assignedUsersContainer) assignedUsersContainer.innerHTML = '';
        if (assignedUsersHint) assignedUsersHint.style.display = 'none';
        if (assignedUsersError) assignedUsersError.textContent = '';

        // Crear un checkbox por cada usuario
        users.forEach(user => {
            // label contenedor para mejor experiencia de click
            const label = document.createElement('label');
            label.className = 'multi-user-checkbox';

            // input tipo checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = user.id;
            checkbox.dataset.name = user.name;
            checkbox.id = `user-chk-${user.id}`;

            // Si el ID del usuario coincide con el buscado, se marca por defecto
            if (String(user.id) === String(preSelectedUserId)) {
                checkbox.checked = true;
            }

            // Texto con el nombre del usuario
            const span = document.createElement('span');
            span.textContent = `${user.name} (${user.rol})`;

            // Armar la estructura: input + texto dentro del label
            label.appendChild(checkbox);
            label.appendChild(span);
            assignedUsersContainer.appendChild(label);
        });
    } catch (error) {
        console.warn('No se pudieron cargar usuarios para checkboxes:', error.message);
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'none';
    }
}

function setExportBtnState(enabled) {
    if (!exportBtn) return;
    exportBtn.disabled = !enabled;
}

function getVisibleTasks() {
    const filtered = filterTasksByStatus(tasks, filterStatus);
    return sortTasks(filtered, sortCriteria, sortDirection);
}

function exportVisibleTasks() {
    if (!currentUser) {
        showToast('No hay un usuario cargado para exportar', 'warning');
        return;
    }
    const visible = getVisibleTasks();
    if (visible.length === 0) {
        showToast('No hay tareas para exportar con el filtro actual', 'warning');
        return;
    }
    try {
        const exportedAt = getCurrentTimestamp();
        const meta = {
            user: { id: String(currentUser.id), name: currentUser.name },
            filter: { status: filterStatus, sortCriteria, sortDirection },
            exportedAt
        };
        const jsonObject = buildTasksJson(visible, meta);
        const jsonString = JSON.stringify(jsonObject, null, 2);
        const filename = buildExportFilename(String(currentUser.id), filterStatus, exportedAt);
        downloadJson(filename, jsonString);
        showToast(`Tareas exportadas (${visible.length})`, 'success');
    } catch (error) {
        showToast('Error al exportar las tareas: ' + error.message, 'error');
    }
}

function applySorting() {
    taskTableBody.innerHTML = '';
    const filtered = filterTasksByStatus(tasks, filterStatus);
    const ordered = sortTasks(filtered, sortCriteria, sortDirection);
    if (ordered.length > 0) {
        hideEmptyState();
        ordered.forEach(task => createTaskElement(task, bindCallbacks()));
    } else {
        showEmptyState(ordered);
    }
    updateTaskCount(ordered);
    updateSortIcons(sortCriteria, sortDirection);
    updateSortButtonLabel(sortDirection);
}

function setSortCriteria(criteria) {
    sortCriteria = criteria;
    applySorting();
}

function setFilterStatus(status) {
    filterStatus = status;
    applySorting();
}

function setSortDirection(direction) {
    sortDirection = direction;
    applySorting();
}

function toggleSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    applySorting();
}

async function searchUser() {
    const userId = userIdInput.value;
    if (!isValidInput(userId)) {
        showValidationError('Por favor ingresa un documento/ID válido');
        return;
    }
    btnSearch.disabled = true;
    btnSearch.textContent = 'Buscando...';
    userInfo.innerHTML = '';
    taskFormContainer.style.display = 'none';
    try {
        const users = await fetchUsers();
        const user = users.find(u => String(u.id).trim() === userId.trim());
        if (user) {
            currentUser = user;
            showUserInfo(user);
            enableTaskForm();
            // Cargar los checkboxes con todos los usuarios,
            // marcando por defecto al usuario que se acaba de buscar
            await renderUserCheckboxes(user.id);
            const savedTasks = await fetchTasksByUser(userId);
            tasks = savedTasks;
            applySorting();
            setExportBtnState(true);
        } else {
            showUserNotFound();
        }
    } catch (error) {
        showValidationError('Error de conexión: ' + error.message + '. Verifica que el servidor esté corriendo.');
    } finally {
        btnSearch.disabled = false;
        btnSearch.textContent = 'Buscar';
    }
}

async function registerTask(event) {
    event.preventDefault();
    clearFieldErrors();

    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const statusInput = document.getElementById('taskStatus');
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const status = statusInput.value;

    // Validar campos obligatorios
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
    // Leer los checkboxes de usuarios marcados
    // Busca dentro del contenedor todos los input[type=checkbox]
    // que esten checkeados y arma el array assignedUsers
    // con la estructura { id, name } que espera el backend.
    // ============================================================
    const checkedBoxes = assignedUsersContainer
        ? assignedUsersContainer.querySelectorAll('input[type="checkbox"]:checked')
        : [];

    if (checkedBoxes.length === 0) {
        // Si no se selecciono ningun usuario, mostrar error directamente
        // (no usamos showFieldError porque el contenedor de checkboxes
        //  no es un input normal, asi que manejamos el error manualmente)
        if (assignedUsersError) assignedUsersError.textContent = 'Debes seleccionar al menos un usuario.';
        hasError = true;
    }

    if (hasError) return;

    // Construir el array de usuarios asignados desde los checkboxes marcados
    const assignedUsers = Array.from(checkedBoxes).map(cb => ({
        id: cb.value,
        name: cb.dataset.name
    }));

    const taskData = {
        title,
        description,
        status,
        createdAt: getCurrentTimestamp(),
        assignedUsers
    };

    try {
        const response = await createTask(taskData);
        if (response.ok) {
            const savedTask = await response.json();
            tasks.push(savedTask);
            applySorting();
            taskForm.reset();
            showToast('Tarea registrada exitosamente', 'success');
        } else {
            showToast('Error al guardar la tarea en el servidor', 'error');
        }
    } catch (error) {
        showToast('Error de conexión: no se pudo guardar la tarea', 'error');
    }
}

async function editTaskViaModal(task) {
    const result = await showEditModal({
        title: task.title,
        description: task.description,
        status: task.status
    });
    if (!result) return;
    try {
        const response = await updateTask(task.id, {
            title: result.title,
            description: result.description,
            status: result.status
        });
        if (response.ok) {
            const updatedTask = await response.json();
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

async function deleteTask(taskId) {
    const confirmed = await showConfirmDialog({
        title: 'Eliminar tarea',
        message: '¿Estás seguro de eliminar esta tarea? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
    });
    if (!confirmed) return;
    try {
        const response = await deleteTaskFromApi(taskId);
        if (response.ok) {
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
            const errData = await response.json();
            showToast(errData.message || 'Error al asignar usuario', 'warning');
        }
    } catch (error) {
        showToast('Error de conexión al asignar el usuario', 'error');
    }
}

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

function renderAdminStats(dashboard) {
    if (!dashboard) return;
    adminStatTotal.textContent = dashboard.total;
    adminStatCompletadas.textContent = dashboard.completadas;
    adminStatPendientes.textContent = dashboard.pendientes;
    adminStatProgreso.textContent = dashboard.enProgreso;
}

function renderGlobalTable(tasks) {
    adminGlobalBody.innerHTML = '';
    adminGlobalCount.textContent = tasks.length === 1 ? '1 tarea' : `${tasks.length} tareas`;
    if (tasks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align:center;color:var(--ink-faint);padding:24px;">No se encontraron tareas con los filtros actuales</td>';
        adminGlobalBody.appendChild(row);
        return;
    }
    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.style.animation = 'fadeSlideUp 0.3s ease-out';
        const bgColor = statusColors[task.status] || '#6b7280';
        const userNames = task.assignedUsers && task.assignedUsers.length > 0
            ? task.assignedUsers.map(u => u.name).join(', ')
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

function renderUserDistribution(porUsuario) {
    adminUserDistBody.innerHTML = '';
    if (!porUsuario || porUsuario.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="2" style="text-align:center;color:var(--ink-faint);padding:16px;">Sin datos</td>';
        adminUserDistBody.appendChild(row);
        return;
    }
    porUsuario.sort((a, b) => b.count - a.count);
    porUsuario.forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${u.userName}</td><td><strong>${u.count}</strong></td>`;
        adminUserDistBody.appendChild(row);
    });
}

async function loadAdminPanel() {
    // Cargar usuarios para el filtro del panel admin
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

    // Cargar dashboard (estadisticas y distribucion por usuario)
    try {
        const dashboard = await fetchDashboard();
        renderAdminStats(dashboard);
        renderUserDistribution(dashboard.porUsuario);
    } catch (e) {
        console.warn('No se pudo cargar el dashboard', e);
    }

    // Cargar todas las tareas para la tabla global (sin filtros)
    try {
        const allTasks = await fetchTasksFiltered({});
        renderGlobalTable(allTasks);
    } catch (e) {
        console.warn('No se pudieron cargar las tareas globales', e);
    }
}

async function applyAdminFilters() {
    const params = {};
    const status = adminFilterStatus.value;
    const userId = adminFilterUser.value;
    const dateFrom = adminFilterDateFrom.value;
    const dateTo = adminFilterDateTo.value;
    if (status) params.status = status;
    if (userId) params.userId = userId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    try {
        const filtered = await fetchTasksFiltered(params);
        renderGlobalTable(filtered);
        const dashboard = await fetchDashboard();
        renderAdminStats(dashboard);
        renderUserDistribution(dashboard.porUsuario);
        showToast(`Filtro aplicado: ${filtered.length} tarea(s) encontrada(s)`, 'info');
    } catch (e) {
        showToast('Error al aplicar filtros: ' + e.message, 'error');
    }
}

export { searchUser, registerTask, clearUserInfo, setSortCriteria, setSortDirection, toggleSortDirection, setFilterStatus, exportVisibleTasks, loadAdminPanel, applyAdminFilters };
