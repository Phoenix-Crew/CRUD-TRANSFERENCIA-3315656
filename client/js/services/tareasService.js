import { userIdInput, btnSearch, userInfo, taskFormContainer, taskForm, taskTableBody } from '../ui/dom.js';
import { fetchUsers, fetchTasksByUser, createTask, updateTask, deleteTaskFromApi } from '../api/tareasApi.js';
import { showToast, showUserInfo, showUserNotFound, showValidationError, clearFieldErrors, showFieldError } from '../ui/notifications.js';
import { enableTaskForm, hideEmptyState, showEmptyState, updateTaskCount, createTaskElement, enableEditMode, cancelEdit, disableAllEditModes } from '../ui/taskRenderer.js';
import { getCurrentTimestamp, isValidInput, statusColors } from '../utils/helpers.js';

let currentUser = null;
let tasks = [];

function clearUserInfo() {
    userInfo.innerHTML = '';
    taskFormContainer.style.display = 'none';
    currentUser = null;
    tasks = [];
    taskTableBody.innerHTML = '';
    updateTaskCount(tasks);
    showEmptyState(tasks);
}

function bindCallbacks() {
    return {
        onEdit: enableEditMode,
        onDelete: deleteTask,
        onSave: saveEdit,
        onCancel: cancelEdit
    };
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
            taskTableBody.innerHTML = '';

            if (tasks.length > 0) {
                hideEmptyState();
                tasks.forEach(task => createTaskElement(task, bindCallbacks()));
            } else {
                showEmptyState(tasks);
            }

            updateTaskCount(tasks);
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
        userId: currentUser.id,
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
            createTaskElement(savedTask, bindCallbacks());
            hideEmptyState();
            updateTaskCount(tasks);
            taskForm.reset();
            showToast('Tarea registrada exitosamente', 'success');
        } else {
            showToast('Error al guardar la tarea en el servidor', 'error');
        }
    } catch (error) {
        showToast('Error de conexión: no se pudo guardar la tarea', 'error');
    }
}

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
            cancelEdit(row, updatedTask);
            row.querySelector('.task-title').textContent = updatedTask.title;
            row.querySelector('.task-desc').textContent = updatedTask.description;
            const statusBadge = row.querySelector('.task-status');
            statusBadge.textContent = updatedTask.status;
            statusBadge.style.background = statusColors[updatedTask.status];
            showToast('Tarea actualizada correctamente', 'success');
        } else {
            showToast('Error al actualizar la tarea', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al actualizar la tarea', 'error');
    }
}

async function deleteTask(taskId, row) {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
        const response = await deleteTaskFromApi(taskId);

        if (response.ok) {
            tasks = tasks.filter(t => String(t.id) !== String(taskId));
            row.remove();
            updateTaskCount(tasks);
            if (tasks.length === 0) showEmptyState(tasks);
            showToast('Tarea eliminada correctamente', 'success');
        } else {
            showToast('Error al eliminar la tarea', 'error');
        }
    } catch (error) {
        showToast('Error de conexión al eliminar la tarea', 'error');
    }
}

export { searchUser, registerTask, clearUserInfo };
