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
    userInfo.innerHTML = '';
    taskFormContainer.style.display = 'none';
    clearUserCheckboxes();
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

// Cómo se lee: "Si el contenedor del selector existe, se oculta y se limpia."
function clearUserCheckboxes() {
    if (assignedUsersGroup) assignedUsersGroup.style.display = 'none'; // Qué hace: oculta el grupo de casillas
    if (assignedUsersContainer) assignedUsersContainer.innerHTML = ''; // Qué hace: vacía las casillas
    if (assignedUsersHint) assignedUsersHint.style.display = ''; // Qué hace: restaura el texto de ayuda
    if (assignedUsersError) assignedUsersError.textContent = ''; // Qué hace: borra el mensaje de error
}

// Cómo se lee: "Async function renderUserCheckboxes, con preSelectedUserId como parámetro."
// Qué es preSelectedUserId: el id del usuario que buscamos; su casilla viene ya marcada.
async function renderUserCheckboxes(preSelectedUserId) { // Qué hace: es el motor del selector: trae todos los usuarios y crea una casilla por cada uno.
    try { // Qué hace: intenta cargar los usuarios; si falla, va al catch.
        // Cómo se lee: "Const users se asigna a await fetchUsers."
        // Qué es fetchUsers: una función de api/tareasApi. Vamos a su definición con Ctrl+Click.
        const users = await fetchUsers(); // Qué hace: pide todos los usuarios al backend, que serán los posibles destinatarios.
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'block'; // Qué hace: hace visible el contenedor que agrupa las casillas
        if (assignedUsersContainer) assignedUsersContainer.innerHTML = ''; // Qué hace: limpia casillas que pudieran sobrar de un intento anterior
        if (assignedUsersHint) assignedUsersHint.style.display = 'none'; // Qué hace: oculta el texto de ayuda porque ya vamos a mostrar las casillas
        if (assignedUsersError) assignedUsersError.textContent = ''; // Qué hace: borra el mensaje de error anterior

        // Cómo se lee: "Users invoca forEach, y por cada user crea una etiqueta."
        users.forEach(user => { // Qué hace: una casilla por usuario; cada una guarda id y nombre escondidos.
            // Cómo se lee: "Const label se asigna a document punto createElement, pasando label como argumento."
            const label = document.createElement('label'); // Qué hace: crea la etiqueta que va a envolver la casilla y el nombre
            // Cómo se lee: "label punto className se asigna a la clase multi-user-checkbox."
            label.className = 'multi-user-checkbox'; // Qué hace: le aplica los estilos del selector de usuarios
            // Cómo se lee: "Const checkbox se asigna a document punto createElement, con input como argumento."
            const checkbox = document.createElement('input'); // Qué hace: crea la casilla de verificación de este usuario
            // Cómo se lee: "checkbox punto type se asigna a checkbox."
            checkbox.type = 'checkbox'; // Qué hace: la define como casilla de verificación
            // Cómo se lee: "checkbox punto value se asigna a user punto id."
            checkbox.value = user.id; // Qué hace: guarda escondido el id del usuario en la casilla
            // Cómo se lee: "checkbox punto dataset punto name se asigna a user punto name."
            checkbox.dataset.name = user.name; // Qué hace: guarda escondido el nombre del usuario en la casilla
            // Cómo se lee: "checkbox punto id se asigna a la plantilla user-chk-más el id."
            checkbox.id = `user-chk-${user.id}`; // Qué hace: le pone un id único a cada casilla para identificarla
            // Cómo se lee: "If, con la condición String de user punto id es exactamente igual a String de preSelectedUserId."
            if (String(user.id) === String(preSelectedUserId)) { // Qué hace: compara el id de este usuario con el id que nos dieron al llamar
                // Cómo se lee: "checkbox punto checked se asigna a true."
                checkbox.checked = true; // Qué hace: el usuario que buscamos llega ya con la casilla marcada
            }
            // Cómo se lee: "Const span se asigna a document punto createElement, con span como argumento."
            const span = document.createElement('span'); // Qué hace: crea el texto con el nombre del usuario
            // Cómo se lee: "span punto textContent se asigna a la plantilla con user punto name y user punto rol."
            span.textContent = `${user.name} (${user.rol})`; // Qué hace: muestra el nombre y el rol dentro de la etiqueta
            // Cómo se lee: "label punto appendChild, pasando checkbox."
            label.appendChild(checkbox); // Qué hace: mete la casilla dentro de la etiqueta
            // Cómo se lee: "label punto appendChild, pasando span."
            label.appendChild(span); // Qué hace: mete el nombre después de la casilla
            // Cómo se lee: "assignedUsersContainer punto appendChild, pasando label."
            assignedUsersContainer.appendChild(label); // Qué hace: mete la etiqueta completa dentro del contenedor de asignación
        });
    } catch (error) {
        // Cómo se lee: "Console punto warn, con el mensaje y error punto message."
        console.warn('No se pudieron cargar usuarios para checkboxes:', error.message); // Qué hace: avisa en consola si no se pudieron cargar los usuarios
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'none'; // Qué hace: si algo falla, oculta el selector para no dejar un cajón vacío
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

// Cómo se lee: "Function applySorting."
function applySorting() { // Qué hace: vuelve a pintar la tabla completa con las tareas filtradas y ordenadas; refleja los asignados.
    // Cómo se lee: "taskTableBody punto innerHTML se asigna a comilla vacía."
    taskTableBody.innerHTML = ''; // Qué hace: limpia la tabla para volverla a dibujar desde cero
    // Cómo se lee: "Const filtered se asigna a filterTasksByStatus, pasando tasks y filterStatus."
    const filtered = filterTasksByStatus(tasks, filterStatus); // Qué hace: filtra las tareas según el estado elegido (todas, pendientes, etc.)
    // Cómo se lee: "Const ordered se asigna a sortTasks, pasando filtered, sortCriteria y sortDirection."
    const ordered = sortTasks(filtered, sortCriteria, sortDirection); // Qué hace: ordena las tareas ya filtradas por columna y dirección (fecha, estado, etc.)
    // Cómo se lee: "If, con la condición ordered punto length es mayor que 0."
    if (ordered.length > 0) { // Qué hace: si hay tareas que mostrar, las pinta; si no, va al else
        // Cómo se lee: "hideEmptyState."
        hideEmptyState(); // Qué hace: oculta el mensaje de "no hay tareas" porque ya hay datos
        // Cómo se lee: "Ordered invoca forEach, y por cada task llama a createTaskElement con la tarea y los callbacks."
        ordered.forEach(task => createTaskElement(task, bindCallbacks())); // Qué hace: crea la fila de cada tarea (incluye los badges de asignados) y la mete en la tabla
    } else {
        showEmptyState(ordered);
    }
    // Cómo se lee: "updateTaskCount, pasando ordered como argumento."
    updateTaskCount(ordered); // Qué hace: actualiza el contador "X tareas" con la cantidad visible
    // Cómo se lee: "UpdateSortIcons, pasando sortCriteria y sortDirection; updateSortButtonLabel con sortDirection."
    updateSortIcons(sortCriteria, sortDirection); // Qué hace: refresca las flechitas de orden en la fila de la tabla
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

// Cómo se lee: "async function searchUser."
// Qué hace: es el PASO 1 del flujo: encuentra al usuario por su id, muestra sus datos, prepara
// los checkboxes de asignación y carga las tareas que ya tiene. Llegamos con Ctrl+Click desde app.js.
// Cómo se lee: "Async function searchUser."
// Qué es: es el PASO 1 del flujo: encuentra al usuario por su id, muestra sus datos, prepara
// los checkboxes de asignación y carga las tareas que ya tiene. Llegamos con Ctrl+Click desde app.js.
async function searchUser() {
    // Cómo se lee: "Const userId se asigna a userIdInput punto value."
    const userId = userIdInput.value; // Qué hace: lee el documento/ID que el usuario escribió en el campo de buscar
    // Cómo se lee: "If, con la condición no isValidInput, pasando userId como argumento."
    if (!isValidInput(userId)) { // Qué hace: si el id no es válido (vacío o con caracteres raros) corta aquí y muestra el error
        // Cómo se lee: "ShowValidationError, pasando el mensaje como argumento."
        showValidationError('Por favor ingresa un documento/ID válido'); // Qué hace: muestra un error en pantalla pidiendo un documento válido
        // Cómo se lee: "Return."
        return; // Qué hace: termina la función aquí; no continúa el flujo
    }
    // Cómo se lee: "btnSearch punto disabled se asigna a true."
    btnSearch.disabled = true; // Qué hace: desactiva el botón mientras busca, para que no opriman doble
    // Cómo se lee: "btnSearch punto textContent se asigna a Buscando con puntos suspensivos."
    btnSearch.textContent = 'Buscando...'; // Qué hace: cambia la etiqueta del botón para avisar que está trabajando
    // Cómo se lee: "userInfo punto innerHTML se asigna a comilla vacía."
    userInfo.innerHTML = ''; // Qué hace: limpia la tarjeta de datos del usuario anterior
    // Cómo se lee: "taskFormContainer punto style punto display se asigna a none."
    taskFormContainer.style.display = 'none'; // Qué hace: oculta el formulario hasta que aparezca un usuario válido
    try { // Qué hace: inicia el bloque que intenta la búsqueda; si falla, va al catch
        // Cómo se lee: "Const users se asigna a await fetchUsers."
        // Qué es fetchUsers: una función de api/tareasApi. Vamos a su definición con Ctrl+Click.
        const users = await fetchUsers(); // Qué hace: pide al backend TODOS los usuarios para buscar en esa lista
        // Cómo se lee: "Const user se asigna a users punto find, con una función flecha que recibe u, donde
        // String de u punto id con trim es exactamente igual a String de userId con trim."
        const user = users.find(u => String(u.id).trim() === userId.trim()); // Qué hace: recorre los usuarios y devuelve el primero cuyo id (ya sin espacios) coincida con lo digitado
        // Cómo se lee: "If, con la condición de que exista user."
        if (user) { // Qué hace: si encontramos un usuario, entra a mostrar todo su contexto
            // Cómo se lee: "currentUser se asigna a user."
            currentUser = user; // Qué hace: guarda en el estado global quién es el usuario que estamos manejando
            // Cómo se lee: "ShowUserInfo, pasando user como argumento."
            showUserInfo(user); // Qué hace: pinta los datos del usuario (nombre, rol, ficha) en la tarjeta
            // Cómo se lee: "enableTaskForm."
            enableTaskForm(); // Qué hace: hace visible el formulario de tarea, ya hay un usuario válido a quien asignar
            // Cómo se lee: "Await renderUserCheckboxes, pasando user punto id como argumento."
            // Qué es: de aquí salen los posibles "asignados" para la tarea.
            await renderUserCheckboxes(user.id); // Qué hace: dibuja las casillas de destinatarios, con este usuario ya marcado
            // Cómo se lee: "Const savedTasks se asigna a await fetchTasksByUser, pasando userId como argumento."
            // Qué es fetchTasksByUser: está en la API. Vamos a su definición con Ctrl+Click.
            const savedTasks = await fetchTasksByUser(userId); // Qué hace: pide al backend las tareas que este usuario ya tiene asignadas
            // Cómo se lee: "Tasks se asigna a savedTasks."
            tasks = savedTasks; // Qué hace: reemplaza la lista global de tareas por las que trajo el backend
            // Cómo se lee: "applySorting."
            applySorting(); // Qué hace: pinta la tabla con las tareas del usuario
            // Cómo se lee: "SetExportBtnState, pasando true como argumento."
            setExportBtnState(true); // Qué hace: habilita el botón de exportar porque ya hay datos
        } else {
            // Cómo se lee: "ShowUserNotFound."
            showUserNotFound(); // Qué hace: muestra un mensaje de que no existe un usuario con ese id
        }
    } catch (error) {
        // Cómo se lee: "ShowValidationError, pasando el mensaje con error punto message."
        showValidationError('Error de conexión: ' + error.message + '. Verifica que el servidor esté corriendo.'); // Qué hace: avisa por si falla la conexión con el backend
    } finally {
        // Cómo se lee: "btnSearch punto disabled se asigna a false."
        btnSearch.disabled = false; // Qué hace: siempre (pase lo que pase) vuelve a activar el botón
        // Cómo se lee: "btnSearch punto textContent se asigna a Buscar."
        btnSearch.textContent = 'Buscar'; // Qué hace: restaura el texto normal del botón
    }
}

// Cómo se lee: "Async function registerTask, con event como parámetro."
// Qué es: es el PASO 2 del flujo: valida los campos, lee las casillas marcadas, arma la lista de
// asignados y envía la tarea al backend. Llegamos con Ctrl+Click desde taskForm.
async function registerTask(event) {
    // Cómo se lee: "Event punto preventDefault."
    event.preventDefault(); // Qué hace: evita que el navegador recargue la página al enviar el formulario
    // Cómo se lee: "clearFieldErrors."
    clearFieldErrors(); // Qué hace: borra los mensajes de error de intentos anteriores para empezar limpio

    // Cómo se lee: "Const titleInput se asigna a document punto getElementById, pasando el id como argumento."
    const titleInput = document.getElementById('taskTitle'); // Qué hace: busca el campo de título en el HTML y lo guarda en titleInput
    // Cómo se lee: "Const descriptionInput se asigna a document punto getElementById, pasando el id como argumento."
    const descriptionInput = document.getElementById('taskDescription'); // Qué hace: busca el campo de descripción del formulario
    // Cómo se lee: "Const statusInput se asigna a document punto getElementById, pasando el id como argumento."
    const statusInput = document.getElementById('taskStatus'); // Qué hace: busca el selector de estado del formulario
    // Cómo se lee: "Const title se asigna a titleInput punto value punto trim."
    const title = titleInput.value.trim(); // Qué hace: toma el texto del título y le quita los espacios de sobra
    // Cómo se lee: "Const description se asigna a descriptionInput punto value punto trim."
    const description = descriptionInput.value.trim(); // Qué hace: toma la descripción y le quita espacios de sobra
    // Cómo se lee: "Const status se asigna a statusInput punto value."
    const status = statusInput.value; // Qué hace: lee el estado elegido (Pendiente, En progreso, Completada)

    // Cómo se lee: "Let hasError se asigna a false."
    let hasError = false; // Qué hace: bandera que dice si algo está mal; empieza en falso (todo ok)
    // Cómo se lee: "If, con la condición no title."
    if (!title) { // Qué hace: si el título llegó vacío, corta aquí y muestra el error
        // Cómo se lee: "ShowFieldError, pasando el id del campo, el id del error y el mensaje."
        showFieldError('taskTitle', 'titleError', 'El título es obligatorio.'); // Qué hace: pinta bajo el título el mensaje de que es obligatorio
        // Cómo se lee: "hasError se asigna a true."
        hasError = true; // Qué hace: marca que hubo un error para no enviar el formulario
    }
    // Cómo se lee: "If, con la condición no description."
    if (!description) { // Qué hace: si la descripción llegó vacía hace lo mismo que el título
        showFieldError('taskDescription', 'descError', 'La descripción es obligatoria.');
        hasError = true;
    }

    // Cómo se lee: "Const checkedBoxes se asigna a ternario: si assignedUsersContainer existe, se asigna a su
    // querySelectorAll de checkboxes marcados, y si no, se asigna a un array vacío."
    const checkedBoxes = assignedUsersContainer
        ? assignedUsersContainer.querySelectorAll('input[type="checkbox"]:checked') // Qué hace: trae SOLO las casillas tildadas dentro del selector de asignación
        : [];

    // Cómo se lee: "If, con la condición checkedBoxes punto length es exactamente igual a 0."
    if (checkedBoxes.length === 0) { // Qué hace: si no marcaron a nadie, entra a advertir
        // Cómo se lee: "Si assignedUsersError existe, su textContent se asigna al mensaje."
        if (assignedUsersError) assignedUsersError.textContent = 'Debes seleccionar al menos un usuario.'; // Qué hace: pinta bajo el selector el aviso
        // Cómo se lee: "hasError se asigna a true."
        hasError = true; // Qué hace: registra el error para frenar el envío
    }

    // Cómo se lee: "If hasError, return."
    if (hasError) return; // Qué hace: si hubo algún error, termina la función aquí y no se manda nada

    // Cómo se lee: "Const assignedUsers se asigna a Array punto from de checkedBoxes, punto map, y por cada cb
    // devuelve un objeto con id se asigna a cb punto value y name se asigna a cb punto dataset punto name."
    // Qué es: LA LÍNEA MÁS IMPORTANTE: así queda la lista de a quién se le asigna la tarea.
    const assignedUsers = Array.from(checkedBoxes).map(cb => ({
        id: cb.value,
        name: cb.dataset.name
    }));

    // Cómo se lee: "Const taskData se asigna a un objeto con title, description, status, createdAt y assignedUsers."
    // Qué es: el paquete que viaja al backend; "assignedUsers" es la clave del flujo.
    const taskData = {
        title,
        description,
        status,
        createdAt: getCurrentTimestamp(),
        assignedUsers
    };

    try { // Qué hace: intenta el envío al backend; si falla, salta al catch
        // Cómo se lee: "Const response se asigna a await createTask, pasando taskData como argumento."
        // Qué es createTask: la que hace POST /api/tasks. Ctrl+Click para ir a su definición.
        const response = await createTask(taskData);
        // Cómo se lee: "If, con la condición response punto ok."
        if (response.ok) { // Qué hace: si el servidor respondió bien (202) entra al éxito
            // Cómo se lee: "Const savedTask se asigna a await response punto json."
            const savedTask = await response.json(); // Qué hace: convierte la respuesta en la tarea ya guardada (con sus asignados)
            // Cómo se lee: "Tasks punto push, pasando savedTask como argumento."
            tasks.push(savedTask); // Qué hace: agrega la tarea nueva a la lista local
            // Cómo se lee: "applySorting."
            applySorting(); // Qué hace: repinta la tabla para que aparezca con sus badges de asignados
            // Cómo se lee: "taskForm punto reset."
            taskForm.reset(); // Qué hace: deja el formulario en blanco para el siguiente
            // Cómo se lee: "ShowToast, pasando el mensaje y success como argumentos."
            showToast('Tarea registrada exitosamente', 'success'); // Qué hace: muestra el aviso verde de que todo salió bien
        } else {
            // Cómo se lee: "ShowToast con el mensaje y error."
            showToast('Error al guardar la tarea en el servidor', 'error'); // Qué hace: avisa que el servidor respondió pero algo falló
        }
    } catch (error) {
        // Cómo se lee: "ShowToast con el error de conexión."
        showToast('Error de conexión: no se pudo guardar la tarea', 'error'); // Qué hace: avisa si el backend no está disponible
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

export async function assignUserToTask(taskId, userObj) { // Asigna un usuario a una tarea ya creada
    try {
        const response = await assignTask(taskId, userObj); // POST /api/tasks/:taskId/assign
        if (response.ok) {
            const updatedTask = await response.json(); // Tarea con sus asignados actualizados
            const idx = tasks.findIndex(t => String(t.id) === String(taskId));
            if (idx !== -1) tasks[idx] = updatedTask;
            applySorting(); // Refresca la tabla para mostrar el nuevo asignado
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
        renderUserDistribution(dashboard.porUsuario);
    } catch (e) {
        console.warn('No se pudo cargar el dashboard', e);
    }

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
