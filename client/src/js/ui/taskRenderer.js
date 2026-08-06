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

export function createTaskElement(task, { onEdit, onDelete }) { // "export" hace pública la función; "function" declara; "createTaskElement" crea la fila de una tarea en la tabla; "task" recibe el objeto de la tarea (que incluye "assignedUsers"); las llaves desestructuran el segundo parámetro en "onEdit" y "onDelete", que son las acciones de los botones; la llave abre el bloque
    const row = document.createElement('tr'); // "const" declara; "row" es la fila; "document.createElement('tr')" crea un elemento de fila de tabla
    row.style.animation = 'fadeIn 0.3s ease'; // "row" es la fila; ".style" accede a los estilos; ".animation" controla la animación; "'fadeIn 0.3s ease'" hace que aparezca con una transición suave
    row.dataset.taskId = task.id; // "row" es la fila; ".dataset" guarda datos personalizados; ".taskId" crea el atributo data-task-id; "task.id" le asigna el id de la tarea para identificarla luego
    const bgColor = statusColors[task.status] || '#6b7280'; // "const" declara; "bgColor" guarda el color; "statusColors" es el mapa de colores; "[task.status]" busca el color del estado de la tarea; "||" si no existe usa el gris "'#6b7280'" como color por defecto
    const usersArray = task.assignedUsers || []; // "const" declara; "usersArray" guarda la lista; "task.assignedUsers" es la propiedad que llega del backend con los usuarios asignados a esta tarea; "||" si no viene usa un array vacío
    const usersBadges = usersArray.length > 0 // "const" declara; "usersBadges" guardará las etiquetas visuales; "usersArray.length" cuenta cuántos asignados hay; "> 0" pregunta si hay más de cero, o sea si tiene asignados
        ? usersArray.map(u => `<span class="user-badge" style="background:rgba(16,185,129,0.15); color:#6ee7b7; padding:2px 8px; margin:2px; border-radius:4px; font-size:11px; display:inline-block;">${u.name}</span>`).join('') // el signo "?" significa "si tiene asignados": "usersArray.map" recorre cada asignado; "u" es cada usuario; la plantilla crea un "span" con clase "user-badge" y estilos en línea (fondo verde claro, texto verde y márgenes); "${u.name}" muestra el nombre del usuario asignado; ".join('')" une todos los badges sin separadores
        : `<span style="color:var(--ink-faint); font-size:12px;">—</span>`; // el signo ":" significa "si NO tiene asignados": crea un "span" con texto gris "—" para indicar que no hay nadie asignado
    const showCompleteBtn = task.status !== 'Completada'; // "const" declara; "showCompleteBtn" decide si se muestra el botón; "task.status" es el estado; "!==" pregunta si es distinto; "'Completada'" es el estado final; si no está completada, el botón se muestra
    // "row" es la fila; ".innerHTML" asigna el contenido HTML; la plantilla (acento grave) permite escribir las celdas de la tabla y meter los valores de la tarea: "<td>" es una celda, "task-title" muestra el título, "task-desc" la descripción, "status-badge" el estado con su color "bgColor", "task-assigned-users-container" los badges "usersBadges" de los asignados, "task-date" la fecha, y "actions-cell" los botones Editar, Completar y Eliminar
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
    `; // el acento grave cierra la plantilla HTML de la fila
    row.querySelector('.btn-edit').addEventListener('click', () => onEdit(task)); // "row" es la fila; ".querySelector" busca el botón con clase "btn-edit"; ".addEventListener" escucha el evento; "'click'" se dispara al hacer clic; "=>" abre la función que llama a "onEdit(task)" para editar la tarea
    row.querySelector('.btn-delete').addEventListener('click', () => onDelete(task.id)); // "row" es la fila; ".querySelector" busca el botón "btn-delete"; ".addEventListener" escucha; "'click'" dispara al hacer clic; "=>" abre la función que llama a "onDelete(task.id)" para eliminar la tarea
    const btnComplete = row.querySelector('.btn-complete'); // "const" declara; "btnComplete" guarda el botón de completar; "row.querySelector('.btn-complete')" lo busca en la fila (puede no existir si ya está completada)
    if (btnComplete) { // "if" pregunta si el botón existe en la fila
        btnComplete.addEventListener('click', () => completeTaskDirect(task.id)); // "btnComplete" es el botón; ".addEventListener" escucha; "'click'" dispara al hacer clic; "=>" abre la función que llama a "completeTaskDirect(task.id)" para marcarla como completada
    } // la llave cierra el bloque del "if"
    taskTableBody.appendChild(row); // "taskTableBody" es el cuerpo de la tabla; ".appendChild" agrega; "row" (con sus celdas y badges de asignados) se inserta al final de la tabla
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
