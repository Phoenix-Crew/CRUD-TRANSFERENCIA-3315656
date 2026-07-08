import { userIdInput, btnSearch, userInfo, taskFormContainer, taskForm, taskTableBody, exportBtn, adminFilterStatus, adminFilterUser, adminFilterDateFrom, adminFilterDateTo, adminApplyFilters, adminStatTotal, adminStatCompletadas, adminStatPendientes, adminStatProgreso, adminGlobalBody, adminUserDistBody, adminGlobalCount } from '../ui/dom.js';
import { fetchUsers, fetchTasksByUser, createTask, updateTask, deleteTaskFromApi, fetchTasksFiltered, fetchDashboard } from '../api/tareasApi.js';
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
    userInfo.innerHTML = '';
    taskFormContainer.style.display = 'none';
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
            filter: { status: filterStatus, sortCriteria: sortCriteria, sortDirection: sortDirection },
            exportedAt: exportedAt
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
        showValidationError("Por favor ingresa un documento/ID válido");
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
            const savedTasks = await fetchTasksByUser(userId);
            tasks = savedTasks;
            applySorting();
            setExportBtnState(true);
        } else {
            showUserNotFound();
        }
    } catch (error) {
        showValidationError("Error de conexión: " + error.message + ". Verifica que el servidor esté corriendo.");
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
    let hasError = false;
    if (!title) {
        showFieldError('taskTitle', 'titleError', 'El título es obligatorio.');
        hasError = true;
    }
    if (!description) {
        showFieldError('taskDescription', 'descError', 'La descripción es obligatoria.');
        hasError = true;
    }
    if (hasError) return;
    const taskData = {
        userId: String(currentUser.id),
        userName: currentUser.name,
        title: title,
        description: description,
        status: status,
        createdAt: getCurrentTimestamp()
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
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td><span class="status-badge" style="background:${bgColor}">${task.status}</span></td>
            <td>${task.userName || '—'}</td>
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
    try {
        const dashboard = await fetchDashboard();
        renderAdminStats(dashboard);
        renderGlobalTable([]);
        renderUserDistribution(dashboard.porUsuario);
    } catch (e) {
        console.warn('No se pudo cargar el dashboard', e);
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
