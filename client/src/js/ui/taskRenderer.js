import { taskTableBody, taskCount, emptyState, taskFormContainer, sortableHeaders } from './dom.js';
import { statusColors } from '../utils/helpers.js';
import { completeTaskDirect } from '../services/tareasService.js';

// Cómo se lee: "Export function enableTaskForm."
export function enableTaskForm() { // Qué hace: hace visible el formulario de tarea; se llama en searchUser cuando hay usuario válido.
    // Cómo se lee: "TaskFormContainer punto style punto display se asigna a block."
    taskFormContainer.style.display = 'block'; // Qué hace: pasa de oculto a visible el contenedor donde está el formulario
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

// Cómo se lee: "Export function createTaskElement, con task y un objeto con onEdit y onDelete."
// Qué es: crea la fila de la tarea y pinta los badges de los usuarios asignados.
// Qué es task.assignedUsers: la propiedad que trae del backend con la lista de asignados.
export function createTaskElement(task, { onEdit, onDelete }) {
    // Cómo se lee: "Const row se asigna a document punto createElement, con tr como argumento."
    const row = document.createElement('tr'); // Qué hace: crea la fila de la tabla para esta tarea
    // Cómo se lee: "Row punto style punto animation se asigna al efecto fadeIn."
    row.style.animation = 'fadeIn 0.3s ease'; // Qué hace: le da una pequeña animación de entrada a la fila
    // Cómo se lee: "Row punto dataset punto taskId se asigna a task punto id."
    row.dataset.taskId = task.id; // Qué hace: guarda en la fila el id de la tarea para identificarla después
    // Cómo se lee: "Const bgColor se asigna a statusColors, posicionando con task punto status, o un gris si no existe."
    const bgColor = statusColors[task.status] || '#6b7280'; // Qué hace: busca el color que corresponde al estado de la tarea
    // Cómo se lee: "Const usersArray = task punto assignedUsers o array vacío."
    const usersArray = task.assignedUsers || []; // Qué hace: toma la lista de asignados; si no trae, usa vacía para no romper
    // Cómo se lee: "Const usersBadges se asigna a ternario: si hay asignados, un span badge por cada uno
    // unidos, y si no, un guion."
    const usersBadges = usersArray.length > 0 // Qué hace: convierte la lista de asignados en etiquetas visuales verdes con el nombre
        ? usersArray.map(u => `<span class="user-badge" style="background:rgba(16,185,129,0.15); color:#6ee7b7; padding:2px 8px; margin:2px; border-radius:4px; font-size:11px; display:inline-block;">${u.name}</span>`).join('')
        : `<span style="color:var(--ink-faint); font-size:12px;">—</span>`;
    // Cómo se lee: "Const showCompleteBtn se asigna a task punto status no es exactamente igual a Completada."
    const showCompleteBtn = task.status !== 'Completada'; // Qué hace: solo muestra el botón Completar si la tarea aún no está completada
    // Cómo se lee: "Row punto innerHTML se asigna a la plantilla de la fila con título, descripción, estado,
    // badges de asignados, fecha y botones."
    row.innerHTML = `
        <td><span class="task-title">${task.title}</span></td>
        <td><span class="task-desc">${task.description}</span></td>
        <td><span class="status-badge" style="background:${bgColor}">${task.status}</span></td>
        <td><div class="task-assigned-users-container">${usersBadges}</div></td>
        <td><span class="task-date">${task.createdAt || ''}</span></td>
        <td class="actions-cell">
            <button class="action-btn action-btn--edit btn-edit">Editar</button>
            ${showCompleteBtn ? `<button class="action-btn action-btn--complete btn-complete" style="background:#10b981;">Completar</button>` : ''}
            <button class="action-btn action-btn--delete btn-delete">Eliminar</button>
        </td>
    `;
    // Cómo se lee: "Row punto querySelector punto btn-edit invoca addEventListener, y al hacer clic llama a onEdit con task."
    row.querySelector('.btn-edit').addEventListener('click', () => onEdit(task)); // Qué hace: el botón Editar abre el modal de edición con la tarea
    // Cómo se lee: "Row punto querySelector punto btn-delete addEventListener, y al hacer clic llama a onDelete con el id."
    row.querySelector('.btn-delete').addEventListener('click', () => onDelete(task.id)); // Qué hace: el botón Eliminar borra la tarea
    // Cómo se lee: "Const btnComplete = row punto querySelector punto btn-complete."
    const btnComplete = row.querySelector('.btn-complete'); // Qué hace: busca el botón Completar, que puede no existir
    // Cómo se lee: "Si btnComplete existe, entra."
    if (btnComplete) {
        // Cómo se lee: "BtnComplete addEventListener, y al hacer clic llama a completeTaskDirect con el id."
        btnComplete.addEventListener('click', () => completeTaskDirect(task.id)); // Qué hace: completa la tarea directamente desde la fila
    }
    // Cómo se lee: "TaskTableBody punto appendChild pasando row."
taskTableBody.appendChild(row); // Qué hace: mete la fila terminada dentro del cuerpo de la tabla
}

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

export function updateSortButtonLabel(direction) {
    const btn = document.getElementById('sortDirection');
    if (!btn) return;
    btn.textContent = direction === 'asc' ? '▲ Ascendente' : '▼ Descendente';
    btn.dataset.direction = direction;
}

export function downloadJson(filename, content) {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
