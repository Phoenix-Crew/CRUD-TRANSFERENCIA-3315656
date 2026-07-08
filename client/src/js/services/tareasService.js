//Archivo: tareasService.js — El cerebro de la aplicación

// ¿Que hace este archivo?
// Aquí se decide qué hacer cuando el usuario busca, agrega, edita,
// elimina, reordena, asigna usuarios o cambia estados en una tarea.
// Le pide datos a la API, los procesa y luego le dice a la pantalla
// que muestre los cambios.
//
// ¿Que no hace?
// NO habla directamente con el servidor (eso lo hace tareasApi.js),
// NO conoce los detalles de los elementos HTML (eso lo hacen dom.js,
// notifications.js y taskRenderer.js).
//
// Dependencias (archivos que importa):
// ./ui/dom.js            - referencias a los elementos HTML
// ./api/tareasApi.js     - funciones para hablar con el servidor
// ./ui/notifications.js  - mostrar mensajes al usuario
// ./ui/taskRenderer.js   - pintar la tabla, edición e iconos de sort
// ./utils/helpers.js     - timestamp, validación, sortTasks,
//                          filterTasksByStatus, colores
//
// ¿Qué exporta?  (10 funciones)
// CRUD de tareas:
//   - searchUser()         → busca usuario y carga sus tareas
//   - registerTask(ev)     → crea una tarea nueva con array de usuarios
//   - clearUserInfo()      → resetea estado y pantalla
// RF02 (ordenamiento + filtro):
//   - setSortCriteria(c)       → cambia el criterio de orden
//   - setSortDirection(d)      → fija la dirección del orden
//   - toggleSortDirection()    → alterna asc/desc
//   - setFilterStatus(s)       → filtra por estado (RF02)
// RF04 (exportación):
//   - exportVisibleTasks()     → descarga las tareas visibles a JSON
// Funciones Multiusuario y Estados [NUEVAS]:
//   - assignUserToTask(tId, u) → añade un usuario extra a la tarea
//   - completeTaskDirect(tId)  → pasa el estado de una tarea a 'Completada' directamente
//
// ¿quien las usa?
//   app.js → importa searchUser y registerTask para conectarlas
//   a los botones de la pantalla

import { userIdInput, btnSearch, userInfo, taskFormContainer, taskForm, taskTableBody, exportBtn } from '../ui/dom.js';
import { fetchUsers, fetchTasksByUser, createTask, updateTask, deleteTaskFromApi, assignTask, removeUserFromTask, updateTaskStatus, getUserTasks } from '../api/tareasApi.js';
import { showToast, showUserInfo, showUserNotFound, showValidationError, clearFieldErrors, showFieldError } from '../ui/notifications.js';
import { showConfirmDialog } from '../ui/confirmDialog.js';
import { enableTaskForm, hideEmptyState, showEmptyState, updateTaskCount, createTaskElement, enableEditMode, cancelEdit, disableAllEditModes, updateSortIcons, updateSortButtonLabel, downloadJson } from '../ui/taskRenderer.js';
import { getCurrentTimestamp, isValidInput, statusColors, sortTasks, filterTasksByStatus, buildTasksJson, buildExportFilename } from '../utils/helpers.js';


//   currentUser:    el usuario que se buscó (objeto con id, name, rol, ficha)
//   tasks:          las tareas de ese usuario (array de objetos)
//   filterStatus:   estado activo del filtro ('all' | 'Pendiente' | 'En progreso' | 'Completada')
//   sortCriteria:   criterio activo de ordenamiento ('createdAt' | 'title' | 'status')
//   sortDirection:  dirección del orden ('asc' | 'desc')
let currentUser = null;
let tasks = [];
let filterStatus = 'all';
let sortCriteria = 'createdAt';
let sortDirection = 'desc';


//   ¿Qué hace?  Limpia toda la pantalla y reinicia el estado.
//   ¿Cuándo se usa?  Cuando se va a buscar un usuario nuevo.
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


// bindCallbacks()  [privada — NO se exporta]
//   ¿Qué hace?  Junta las funciones de los botones interactivos de las filas.
function bindCallbacks() {
    return {
        onEdit: enableEditMode,
        onDelete: deleteTask,
        onSave: saveEdit,
        onCancel: cancelEdit
    };
}


// setExportBtnState(enabled)  [privada — NO se exporta]
function setExportBtnState(enabled) {
    if (!exportBtn) return;
    exportBtn.disabled = !enabled;
}


// getVisibleTasks()  [privada — NO se exporta]
function getVisibleTasks() {
    const filtered = filterTasksByStatus(tasks, filterStatus);
    return sortTasks(filtered, sortCriteria, sortDirection);
}


// exportVisibleTasks()  [se exporta]
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
            user: {
                id: String(currentUser.id),
                name: currentUser.name
            },
            filter: {
                status: filterStatus,
                sortCriteria: sortCriteria,
                sortDirection: sortDirection
            },
            exportedAt: exportedAt
        };

        const jsonObject = buildTasksJson(visible, meta);
        const jsonString = JSON.stringify(jsonObject, null, 2);

        const filename = buildExportFilename(
            String(currentUser.id),
            filterStatus,
            exportedAt
        );

        downloadJson(filename, jsonString);

        showToast(`Tareas exportadas (${visible.length})`, 'success');
    } catch (error) {
        showToast('Error al exportar las tareas: ' + error.message, 'error');
    }
}


// applySorting()  [privada — NO se exporta]
function applySorting() {
    disableAllEditModes(tasks);
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


// setSortCriteria(criteria)  [se exporta]
function setSortCriteria(criteria) {
    sortCriteria = criteria;
    applySorting();
}


// setFilterStatus(status)  [se exporta]
function setFilterStatus(status) {
    filterStatus = status;
    applySorting();
}


// setSortDirection(direction)  [se exporta]
function setSortDirection(direction) {
    sortDirection = direction;
    applySorting();
}


// toggleSortDirection()  [se exporta]
function toggleSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    applySorting();
}


// searchUser()  [se exporta]
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

            // Usamos la nueva API dedicada del backend para jalar las tareas mapeadas en assignedUsers
            const savedTasks = await getUserTasks(userId);
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


// registerTask(event)  [se exporta]
//   ¿Qué cambió aquí? Ahora inyecta por defecto al creador (currentUser) 
//   dentro del array inicial "assignedUsers", adaptándose al nuevo formato multiusuario.
async function registerTask(event) {
    event.preventDefault();
    disableAllEditModes(tasks);
    clearFieldErrors();

    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const statusInput = document.getElementById('taskStatus');

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const status = statusInput.value;

    let hasError = false;

    if (!title) {
        showFieldError('taskTitle', 'titleError', 'El título es obligatorio. Escribe un título para la tarea.');
        hasError = true;
    }

    if (!description) {
        showFieldError('taskDescription', 'descError', 'La descripción es obligatoria. Describe brevemente la tarea.');
        hasError = true;
    }

    if (hasError) return;

    const taskData = {
        title: title,
        description: description,
        status: status,
        createdAt: getCurrentTimestamp(),
        assignedUsers: [
            { id: String(currentUser.id), name: currentUser.name }
        ]
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


// saveEdit(taskId, row)  [privada]
async function saveEdit(taskId, row) {
    const newTitle = row.querySelector('.task-edit-title').value.trim();
    const newDesc = row.querySelector('.task-edit-desc').value.trim();
    const newStatus = row.querySelector('.task-edit-status').value;

    if (!newTitle || !newDesc) {
        showToast('El título y la descripción no pueden estar vacíos', 'warning');
        return;
    }

    try {
        const response = await updateTask(taskId, { title: newTitle, description: newDesc, status: newStatus });

        if (response.ok) {
            const updatedTask = await response.json();
            const idx = tasks.findIndex(t => String(t.id) === String(taskId));
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


// deleteTask(taskId, row)  [privada]
async function deleteTask(taskId, row) {
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


// assignUserToTask(taskId, userObj)  [se exporta]
//   ¿Qué hace? Envía los datos de un nuevo colaborador al endpoint de asignación.
//   ¿Quién la llama? ui/taskRenderer o los controles de asignación múltiple.
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


// completeTaskDirect(taskId)  [se exporta]
//   ¿Qué hace? Cambia velozmente el estado de una tarea a '