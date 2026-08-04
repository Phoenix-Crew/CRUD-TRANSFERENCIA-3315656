// Archivo: taskRenderer.js — Renderizado de la tabla de tareas (capa de UI)

// ¿Que hace este archivo?
//   Se encarga de PINTAR en el DOM todo lo relacionado con la
//   tabla de tareas y su ordenamiento:
//     - Mostrar/ocultar el formulario y el estado vacío
//     - Actualizar el contador de tareas visibles
//     - Construir filas (<tr>) con badges de estado, usuarios
//       asignados y botones de acción (Editar, Completar, Eliminar)
//     - Reflejar el ordenamiento (iconos ▲▼ en los encabezados)
//
// ¿que no hace?
//   NO hace llamadas a la API ni guarda estado de negocio.
//   Acepta callbacks (onEdit, onDelete) para no depender de
//   services: quien invoca la fila decide qué hacer con los clics.
//
// ¿que exporta?
//   - enableTaskForm()          → muestra el formulario de registro
//   - hideEmptyState()          → oculta el mensaje "sin tareas"
//   - showEmptyState(tasks)     → muestra el vacío si la lista está vacía
//   - updateTaskCount(tasks)    → actualiza "N tareas"
//   - createTaskElement(task, cb)→ crea y agrega una fila a la tabla
//   - updateSortIcons(c,d)      → actualiza flechas de ordenamiento
//   - updateSortButtonLabel(d)  → actualiza el texto del botón de sort
//   - downloadJson(fn, content) → descarga un JSON en el navegador
//
// ¿quien lo usa?
//   - services/tareasService.js → casi todo (renderizado y sort)
//   - app.js                    → showEmptyState
//
// DEPENDENCIAS: usa completeTaskDirect desde tareasService.js
// para el botón "Completar" (único punto de acoplamiento a services).

import { taskTableBody, taskCount, emptyState, taskFormContainer, sortableHeaders } from './dom.js';
import { statusColors } from '../utils/helpers.js';
import { completeTaskDirect } from '../services/tareasService.js';

// enableTaskForm — Muestra el formulario de registro de tareas
// PASO 1: cambiar la propiedad display del contenedor del formulario a "block"
export function enableTaskForm() {
    taskFormContainer.style.display = 'block';
}

// hideEmptyState — Oculta el mensaje de "sin tareas"
// PASO 1: ocultar el elemento de estado vacío
export function hideEmptyState() {
    emptyState.style.display = 'none';
}

// showEmptyState — Muestra el mensaje de "sin tareas" si la lista esta vacia
// PASO 1: si no hay tareas, mostrar el mensaje; si hay tareas, dejar oculto
export function showEmptyState(tasks) {
    if (tasks.length === 0) {
        emptyState.style.display = 'block';
    }
}

// updateTaskCount — Actualiza el contador de tareas visibles
// PASO 1: mostrar "1 tarea" si hay exactamente una, o "N tareas" en caso contrario
export function updateTaskCount(tasks) {
    taskCount.textContent = tasks.length === 1 ? "1 tarea" : `${tasks.length} tareas`;
}

// createTaskElement — Crea una fila en la tabla con datos de la tarea y botones de accion
// PASO 1: crear la fila (<tr>) y asignar animación de entrada + data-taskId
export function createTaskElement(task, { onEdit, onDelete }) {
    const row = document.createElement('tr');
    row.style.animation = 'fadeIn 0.3s ease';
    row.dataset.taskId = task.id;

    // PASO 2: obtener el color de fondo según el estado de la tarea
    const bgColor = statusColors[task.status] || '#6b7280';
    // PASO 3: construir los badges de usuarios asignados (o "—" si no hay ninguno)
    const usersArray = task.assignedUsers || [];
    const usersBadges = usersArray.length > 0
        ? usersArray.map(u => `<span class="user-badge" style="background:rgba(16,185,129,0.15); color:#6ee7b7; padding:2px 8px; margin:2px; border-radius:4px; font-size:11px; display:inline-block;">${u.name}</span>`).join('')
        : `<span style="color:var(--ink-faint); font-size:12px;">—</span>`;

    // PASO 4: decidir si mostrar el botón "Completar" (solo si la tarea no está completada)
    const showCompleteBtn = task.status !== 'Completada';

    // PASO 5: inyectar todo el HTML de la fila (título, descripción, estado, badges, fecha, botones)
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

    // PASO 6: conectar los botones de acción a sus callbacks
    row.querySelector('.btn-edit').addEventListener('click', () => onEdit(task));
    row.querySelector('.btn-delete').addEventListener('click', () => onDelete(task.id));

    // PASO 7: si existe el botón "Completar", conectarlo a completeTaskDirect
    const btnComplete = row.querySelector('.btn-complete');
    if (btnComplete) {
        btnComplete.addEventListener('click', () => completeTaskDirect(task.id));
    }

    // PASO 8: agregar la fila al cuerpo de la tabla
    taskTableBody.appendChild(row);
}

// updateSortIcons — Actualiza los indicadores visuales de ordenamiento en los encabezados
// PASO 1: determinar la flecha según la dirección (▲ asc / ▼ desc)
// PASO 2: recorrer cada encabezado clickeable (th.sortable)
// PASO 3: si este encabezado es el criterio actual, mostrar la flecha y resaltar
//         si no, limpiar la flecha y quitar el resaltado
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

// updateSortButtonLabel — Actualiza el texto del boton de direccion de ordenamiento
// PASO 1: buscar el botón de dirección en el DOM
// PASO 2: cambiar su texto y dataset según la dirección
export function updateSortButtonLabel(direction) {
    const btn = document.getElementById('sortDirection');
    if (!btn) return;
    btn.textContent = direction === 'asc' ? '▲ Ascendente' : '▼ Descendente';
    btn.dataset.direction = direction;
}

// downloadJson — Descarga un archivo JSON en el navegador usando un Blob
// PASO 1: crear un Blob con el contenido JSON
// PASO 2: generar una URL temporal para ese Blob
// PASO 3: crear un <a> invisible, poner la URL como href y el nombre de archivo como download
// PASO 4: hacer clic programáticamente para disparar la descarga
// PASO 5: limpiar — quitar el <a> del DOM y revocar la URL temporal para liberar memoria
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
