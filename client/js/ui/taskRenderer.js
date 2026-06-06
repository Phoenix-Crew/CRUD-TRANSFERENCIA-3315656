// Archivo: taskRenderer.js — Renderizado de la tabla y modos de edición

// ¿Que hace este archivo?
//   Se encarga de toda la parte visual de las tareas en la tabla:
//   crear filas, alternar modo edición, contar tareas, mostrar
//   estado vacío, y los indicadores visuales del RF02 (ordenamiento).
//
// ¿que no hace?
//   NO llama a la API, NO maneja estado, NO valida formularios.
//
// ¿que exporta?  (11 funciones)
//   Formulario y tabla:
//     - enableTaskForm()         → muestra el contenedor del form
//     - hideEmptyState()         → oculta "no hay tareas"
//     - showEmptyState(tasks)    → muestra "no hay tareas" si length===0
//     - updateTaskCount(tasks)   → actualiza el contador "N tareas"
//     - createTaskElement(t, cb) → crea una fila <tr> con la tarea
//                                   y conecta los 4 botones de acción
//   Edición inline:
//     - enableEditMode(row, t)   → muestra inputs en una fila
//     - cancelEdit(row, t)       → revierte la fila a modo lectura
//     - disableAllEditModes(t)   → cierra todas las ediciones abiertas
//   RF02 (ordenamiento):
//     - updateSortIcons(c, d)    → pinta ▲/▼ en el <th> activo
//     - updateSortButtonLabel(d) → actualiza el texto del botón asc/desc
//
// ¿quien las usa?
//   - services/tareasService.js → enableTaskForm, hideEmptyState,
//     showEmptyState, updateTaskCount, createTaskElement, cancelEdit,
//     disableAllEditModes, updateSortIcons, updateSortButtonLabel
//   - app.js                     → showEmptyState (en carga inicial)

import { taskTableBody, taskCount, emptyState, taskFormContainer, sortableHeaders } from './dom.js';
import { statusColors } from '../utils/helpers.js';

export function enableTaskForm() {
    taskFormContainer.style.display = 'block';
}

export function hideEmptyState() {
    emptyState.style.display = 'none';
}

export function showEmptyState(tasks) {
    if (tasks.length === 0) {
        emptyState.style.display = 'block';
    }
}

export function updateTaskCount(tasks) {
    taskCount.textContent = tasks.length === 1 ? "1 tarea" : `${tasks.length} tareas`;
}

export function createTaskElement(task, { onEdit, onDelete, onSave, onCancel }) {
    const row = document.createElement('tr');
    row.style.animation = 'fadeIn 0.3s ease';
    row.dataset.taskId = task.id;

    row.innerHTML = `
        <td>
            <span class="task-title">${task.title}</span>
            <input class="edit-input task-edit-title" type="text" value="${task.title.replace(/"/g, '&quot;')}">
        </td>
        <td>
            <span class="task-desc">${task.description}</span>
            <input class="edit-input task-edit-desc" type="text" value="${task.description.replace(/"/g, '&quot;')}">
        </td>
        <td>
            <span class="status-badge task-status" style="background: ${statusColors[task.status]}">${task.status}</span>
            <select class="edit-input task-edit-status">
                <option value="Pendiente" ${task.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="En progreso" ${task.status === 'En progreso' ? 'selected' : ''}>En progreso</option>
                <option value="Completada" ${task.status === 'Completada' ? 'selected' : ''}>Completada</option>
            </select>
        </td>
        <td>
            <span class="task-date">${task.createdAt || ''}</span>
        </td>
        <td class="actions-cell">
            <button class="action-btn action-btn--edit btn-edit">Editar</button>
            <button class="action-btn action-btn--delete btn-delete">Eliminar</button>
            <button class="action-btn action-btn--save btn-save" style="display:none">Guardar</button>
            <button class="action-btn action-btn--cancel btn-cancel" style="display:none">Cancelar</button>
        </td>
    `;

    row.querySelector('.btn-edit').addEventListener('click', () => onEdit(row, task));
    row.querySelector('.btn-delete').addEventListener('click', () => onDelete(task.id, row));
    row.querySelector('.btn-save').addEventListener('click', () => onSave(task.id, row));
    row.querySelector('.btn-cancel').addEventListener('click', () => onCancel(row, task));

    taskTableBody.appendChild(row);
}

export function enableEditMode(row, task) {
    row.querySelector('.task-title').style.display = 'none';
    row.querySelector('.task-desc').style.display = 'none';
    row.querySelector('.task-status').style.display = 'none';
    row.querySelector('.task-edit-title').style.display = 'block';
    row.querySelector('.task-edit-desc').style.display = 'block';
    row.querySelector('.task-edit-status').style.display = 'block';
    row.querySelector('.btn-edit').style.display = 'none';
    row.querySelector('.btn-delete').style.display = 'none';
    row.querySelector('.btn-save').style.display = 'inline-block';
    row.querySelector('.btn-cancel').style.display = 'inline-block';
}

export function cancelEdit(row, task) {
    row.querySelector('.task-title').style.display = 'inline';
    row.querySelector('.task-desc').style.display = 'inline';
    row.querySelector('.task-status').style.display = 'inline';
    row.querySelector('.task-edit-title').style.display = 'none';
    row.querySelector('.task-edit-desc').style.display = 'none';
    row.querySelector('.task-edit-status').style.display = 'none';
    row.querySelector('.btn-edit').style.display = 'inline-block';
    row.querySelector('.btn-delete').style.display = 'inline-block';
    row.querySelector('.btn-save').style.display = 'none';
    row.querySelector('.btn-cancel').style.display = 'none';
}

export function disableAllEditModes(tasks) {
    document.querySelectorAll('#taskTableBody tr').forEach(row => {
        const taskId = row.dataset.taskId;
        const task = tasks.find(t => String(t.id) === String(taskId));
        if (task) cancelEdit(row, task);
    });
}


// updateSortIcons(criteria, direction)
//   ¿Qué hace?  Pinta el indicador visual (▲ o ▼) en el <th> que
//               coincide con el criterio activo, y limpia los demás.
//   Parámetros:
//     - criteria:  'createdAt' | 'title' | 'status'
//     - direction: 'asc' | 'desc'
//   ¿Quién la llama?  tareasService.js → applySorting()

export function updateSortIcons(criteria, direction) {
    const arrow = direction === 'asc' ? '▲' : '▼';
    sortableHeaders.forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if (!icon) return;
        if (th.dataset.sort === criteria) {
            icon.textContent = arrow;
            th.classList.add('sortable--active');
        } else {
            icon.textContent = '';
            th.classList.remove('sortable--active');
        }
    });
}


// updateSortButtonLabel(direction)
//   ¿Qué hace?  Cambia el texto del botón de dirección para que el
//               usuario vea el estado actual ("Ascendente" o "Descendente").
//   ¿Quién la llama?  tareasService.js → applySorting()

export function updateSortButtonLabel(direction) {
    const btn = document.getElementById('sortDirection');
    if (!btn) return;
    btn.textContent = direction === 'asc' ? '▲ Ascendente' : '▼ Descendente';
    btn.dataset.direction = direction;
}
