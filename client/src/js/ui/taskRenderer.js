import { taskTableBody, taskCount, emptyState, taskFormContainer, sortableHeaders } from './dom.js';
import { statusColors } from '../utils/helpers.js';
import { completeTaskDirect } from '../services/tareasService.js';

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

export function createTaskElement(task, { onEdit, onDelete }) {
    const row = document.createElement('tr');
    row.style.animation = 'fadeIn 0.3s ease';
    row.dataset.taskId = task.id;

    const bgColor = statusColors[task.status] || '#6b7280';
    const usersArray = task.assignedUsers || [];
    const usersBadges = usersArray.length > 0
        ? usersArray.map(u => `<span class="user-badge" style="background:rgba(16,185,129,0.15); color:#6ee7b7; padding:2px 8px; margin:2px; border-radius:4px; font-size:11px; display:inline-block;">${u.name}</span>`).join('')
        : `<span style="color:var(--ink-faint); font-size:12px;">—</span>`;

    const showCompleteBtn = task.status !== 'Completada';

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

    row.querySelector('.btn-edit').addEventListener('click', () => onEdit(task));
    row.querySelector('.btn-delete').addEventListener('click', () => onDelete(task.id));

    const btnComplete = row.querySelector('.btn-complete');
    if (btnComplete) {
        btnComplete.addEventListener('click', () => completeTaskDirect(task.id));
    }

    taskTableBody.appendChild(row);
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
