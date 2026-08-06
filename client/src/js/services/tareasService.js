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

function clearUserCheckboxes() { // "function" declara una función; "clearUserCheckboxes" es su nombre: borra los checkboxes de asignación; la llave "{" abre el bloque de la función
    if (assignedUsersGroup) assignedUsersGroup.style.display = 'none'; // "if" pregunta si existe el grupo de checkboxes; "assignedUsersGroup" es ese contenedor; ".style" accede a los estilos; ".display" controla si se ve o no; "= 'none'" lo oculta
    if (assignedUsersContainer) assignedUsersContainer.innerHTML = ''; // "if" verifica que exista el contenedor de checkboxes; ".innerHTML" es el contenido interno; "= ''" lo deja vacío para quitar todos los checkboxes que había
    if (assignedUsersHint) assignedUsersHint.style.display = ''; // "if" verifica el texto de ayuda; "assignedUsersHint" es ese texto; ".display" se deja vacío para volver a mostrarlo
    if (assignedUsersError) assignedUsersError.textContent = ''; // "if" verifica el mensaje de error; ".textContent" es el texto del mensaje; "= ''" borra cualquier error anterior
}

async function renderUserCheckboxes(preSelectedUserId) { // "async" indica que dentro usaremos "await"; "function" declara la función; "renderUserCheckboxes" la dibuja en pantalla; "preSelectedUserId" recibe el id del usuario que se buscó; la llave abre el bloque
    try { // "try" empieza un bloque de código protegido: si algo falla aquí adentro, pasa al "catch"
        const users = await fetchUsers(); // "const" crea una constante; "users" guarda el resultado; "await" pausa el código hasta que la llamada termine; "fetchUsers()" trae la lista de todos los usuarios del sistema
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'block'; // "if" pregunta si existe el grupo; ".style.display" controla la visibilidad; "= 'block'" lo hace visible
        if (assignedUsersContainer) assignedUsersContainer.innerHTML = ''; // "if" pregunta si existe el contenedor; ".innerHTML" es su contenido; "= ''" lo vacía para empezar de cero
        if (assignedUsersHint) assignedUsersHint.style.display = 'none'; // "if" pregunta si existe el texto de ayuda; ".display" controla la visibilidad; "= 'none'" lo oculta porque ya vamos a listar usuarios
        if (assignedUsersError) assignedUsersError.textContent = ''; // "if" pregunta si existe el mensaje de error; ".textContent" es su texto; "= ''" lo limpia

        users.forEach(user => { // "users.forEach" recorre cada usuario de la lista; "user" es el usuario de esta vuelta; "=>" abre la función anónima que se ejecuta por cada uno
            const label = document.createElement('label'); // "const" crea una constante; "label" es una etiqueta; "document.createElement" crea un elemento del HTML; "'label'" indica que ese elemento es una etiqueta
            label.className = 'multi-user-checkbox'; // "label" es la etiqueta; ".className" le asigna la clase CSS; "'multi-user-checkbox'" es la clase que la estiliza
            const checkbox = document.createElement('input'); // "const" crea otra constante; "checkbox" es la casilla; "document.createElement('input')" crea un elemento de entrada de texto o casilla
            checkbox.type = 'checkbox'; // "checkbox" es la casilla; ".type" define qué tipo de entrada es; "'checkbox'" indica que será una casilla de verificación
            checkbox.value = user.id; // "checkbox" es la casilla; ".value" guarda un valor en ella; "user.id" le asigna el id del usuario, así sabemos a quién representa
            checkbox.dataset.name = user.name; // "checkbox" es la casilla; ".dataset" guarda datos personalizados; ".name" crea el atributo data-name; "user.name" le asigna el nombre del usuario, que luego se envía al backend
            checkbox.id = `user-chk-${user.id}`; // "checkbox" es la casilla; ".id" le da un identificador único; "user-chk-" es un prefijo fijo y "${user.id}" completa el id con el número del usuario
            if (String(user.id) === String(preSelectedUserId)) { // "if" pregunta si el id del usuario, convertido a texto con "String", es exactamente igual ("===") al id preseleccionado convertido a texto; si es el mismo usuario, entra al bloque
                checkbox.checked = true; // "checkbox" es la casilla; ".checked" controla si está marcada; "= true" la deja marcada, así el usuario buscado ya viene asignado por defecto
            } // la llave "}" cierra el bloque del "if"
            const span = document.createElement('span'); // "const" crea una constante; "span" es un elemento de texto; "document.createElement('span')" crea ese elemento
            span.textContent = `${user.name} (${user.rol})`; // "span" es el texto; ".textContent" le asigna contenido; "user.name" es el nombre del usuario y "${user.rol}" su rol, ambos entre paréntesis para mostrarlos juntos
            label.appendChild(checkbox); // "label" es la etiqueta; ".appendChild" agrega un hijo; "checkbox" se mete dentro de la etiqueta: primero la casilla
            label.appendChild(span); // "label" es la etiqueta; ".appendChild" agrega otro hijo; "span" con el nombre se coloca después de la casilla
            assignedUsersContainer.appendChild(label); // "assignedUsersContainer" es el contenedor de asignación; ".appendChild" agrega; "label" con su casilla y su nombre se mete al contenedor
        }); // la llave cierra el "forEach" y el ")" cierra la llamada, terminando el recorrido por todos los usuarios
    } catch (error) { // "catch" atrapa cualquier error que haya ocurrido dentro del "try"; "error" es ese error
        console.warn('No se pudieron cargar usuarios para checkboxes:', error.message); // "console.warn" muestra una advertencia en la consola; el primer texto explica el problema y "error.message" agrega el detalle técnico
        if (assignedUsersGroup) assignedUsersGroup.style.display = 'none'; // "if" pregunta si existe el grupo; ".style.display" controla la visibilidad; "= 'none'" lo oculta para que no se vea un selector vacío
    } // la llave cierra el bloque del "catch"
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
        ordered.forEach(task => createTaskElement(task, bindCallbacks())); // Renderiza cada tarea (incluye sus asignados)
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
        const users = await fetchUsers(); // "const" crea una constante; "users" guarda el resultado; "await" pausa el código hasta que termine la llamada; "fetchUsers()" trae todos los usuarios del sistema
        const user = users.find(u => String(u.id).trim() === userId.trim()); // "const" declara; "user" guarda el hallazgo; "users.find" recorre la lista y devuelve el primero que cumpla la condición; "u" es cada usuario; "String(u.id).trim()" convierte el id a texto y le quita espacios; "===" pregunta si es exactamente igual; "userId.trim()" es el id digitado sin espacios
        if (user) { // "if" pregunta si "user" existe, o sea si se encontró el usuario en la lista
            currentUser = user; // "currentUser" es la variable que recuerda al usuario actual; "= user" le asigna el usuario encontrado
            showUserInfo(user); // "showUserInfo" muestra la tarjeta con los datos del usuario; "user" es quien se muestra
            enableTaskForm(); // "enableTaskForm" hace visible el formulario de registrar tarea, que es donde se va a asignar
            await renderUserCheckboxes(user.id); // "await" espera a que termine; "renderUserCheckboxes" dibuja los checkboxes para asignar la tarea; "user.id" le pasa el id del usuario buscado para que aparezca ya marcado
            const savedTasks = await fetchTasksByUser(userId); // "const" declara; "savedTasks" guarda el resultado; "await" espera la llamada; "fetchTasksByUser(userId)" pide al backend las tareas ya asignadas a ese usuario
            tasks = savedTasks; // "tasks" es la lista de tareas de la aplicación; "= savedTasks" la reemplaza por las tareas que ya tiene asignadas el usuario
            applySorting(); // "applySorting" reordena y redibuja la tabla de tareas, mostrando sus asignados
            setExportBtnState(true); // "setExportBtnState" habilita el botón de exportar; "true" lo activa porque ya hay un usuario cargado
        } else { // "else" se ejecuta cuando el "if" fue falso, es decir cuando el usuario NO se encontró
            showUserNotFound(); // "showUserNotFound" muestra el mensaje de que el usuario no está registrado en el sistema
        } // la llave cierra el bloque del "else"
    } catch (error) {
        showValidationError('Error de conexión: ' + error.message + '. Verifica que el servidor esté corriendo.');
    } finally {
        btnSearch.disabled = false;
        btnSearch.textContent = 'Buscar';
    }
}

async function registerTask(event) { // "async" indica que adentro usaremos "await"; "function" declara la función; "registerTask" es su nombre: registra la tarea y la asigna; "event" recibe el objeto del evento que se disparó al enviar el formulario; la llave abre el bloque
    event.preventDefault(); // "event" es el evento del formulario; ".preventDefault" le dice al navegador que no haga la acción por defecto, o sea que no recargue la página
    clearFieldErrors(); // "clearFieldErrors" borra los mensajes de error de un intento anterior para empezar limpio

    const titleInput = document.getElementById('taskTitle'); // "const" declara una constante; "titleInput" guarda el campo; "document.getElementById" busca un elemento por su id; "'taskTitle'" es el id del campo de título
    const descriptionInput = document.getElementById('taskDescription'); // "const" declara; "descriptionInput" guarda el campo; "getElementById" busca por id; "'taskDescription'" es el id del campo de descripción
    const statusInput = document.getElementById('taskStatus'); // "const" declara; "statusInput" guarda el campo; "getElementById" busca por id; "'taskStatus'" es el id del selector de estado
    const title = titleInput.value.trim(); // "const" declara; "title" es el nombre donde se guarda el valor; "titleInput" es el campo; ".value" lee lo que escribió el usuario; ".trim()" quita los espacios sobrantes al inicio y al final
    const description = descriptionInput.value.trim(); // "const" declara; "description" guarda el valor; "descriptionInput" es el campo; ".value" lee lo escrito; ".trim()" quita espacios sobrantes
    const status = statusInput.value; // "const" declara; "status" guarda el valor; "statusInput" es el selector; ".value" lee la opción que eligió el usuario

    let hasError = false; // "let" crea una variable que puede cambiar; "hasError" es el semáforo de errores; "= false" inicia en falso, o sea sin errores
    if (!title) { // "if" pregunta si "title" está vacío; el signo "!" niega, así que "!title" significa "si el título está vacío"
        showFieldError('taskTitle', 'titleError', 'El título es obligatorio.'); // "showFieldError" marca el campo y muestra el mensaje; "taskTitle" es el campo, "titleError" el lugar del mensaje y el texto avisa que el título es obligatorio
        hasError = true; // "hasError" el semáforo; "= true" se enciende porque hubo un error
    } // la llave cierra el bloque del primer "if"
    if (!description) { // "if" pregunta si "description" está vacía; "!description" niega y significa "si la descripción está vacía"
        showFieldError('taskDescription', 'descError', 'La descripción es obligatoria.'); // "showFieldError" marca el campo; "taskDescription" es el campo, "descError" el lugar del mensaje y el texto avisa que la descripción es obligatoria
        hasError = true; // "hasError" el semáforo; "= true" se enciende porque también hubo error aquí
    } // la llave cierra el segundo "if"

    const checkedBoxes = assignedUsersContainer // "const" declara una constante; "checkedBoxes" guardará los checkboxes marcados; "assignedUsersContainer" es el contenedor donde están los checkboxes
        ? assignedUsersContainer.querySelectorAll('input[type="checkbox"]:checked') // el signo "?" significa "si el contenedor existe, haz esto": "querySelectorAll" busca todos los elementos que cumplan el selector; "input[type='checkbox']:checked" selecciona solo los checkboxes marcados
        : []; // el signo ":" significa "si el contenedor no existe, haz esto": devuelve un array vacío para que la lista no esté indefinida

    if (checkedBoxes.length === 0) { // "if" pregunta si la cantidad de checkboxes marcados es exactamente cero ("length === 0"), es decir que no marcaron a nadie
        if (assignedUsersError) assignedUsersError.textContent = 'Debes seleccionar al menos un usuario.'; // "if" pregunta si existe el mensaje de error; "assignedUsersError" es ese lugar; ".textContent" es su texto; "= 'Debes seleccionar al menos un usuario.'" avisa que hay que marcar a alguien
        hasError = true; // "hasError" el semáforo; "= true" se enciende porque falta la asignación
    } // la llave cierra el bloque del "if"

    if (hasError) return; // "if" pregunta si el semáforo está encendido; "return" termina la función aquí mismo, sin enviar nada al backend

    const assignedUsers = Array.from(checkedBoxes).map(cb => ({ // "const" declara; "assignedUsers" guardará el array final de asignados; "Array.from" convierte la lista de checkboxes en un array real; ".map" recorre cada uno; "cb" es cada checkbox; "=>" abre la función que transforma cada casilla en un objeto
        id: cb.value, // "id" es la propiedad del objeto; "cb.value" lee el id del usuario que guardamos en el atributo value del checkbox
        name: cb.dataset.name // "name" es la otra propiedad; "cb.dataset.name" lee el nombre del usuario que guardamos en data-name del checkbox
    })); // la llave cierra el objeto, el paréntesis cierra la función del "map" y el otro cierra la llamada, quedando algo como [{ id, name }, ...]

    const taskData = { // "const" declara; "taskData" es el paquete de datos de la tarea; la llave abre el objeto
        title, // "title" es la propiedad y toma el valor del título que se leyó antes
        description, // "description" es la propiedad y toma el valor de la descripción
        status, // "status" es la propiedad y toma el estado elegido
        createdAt: getCurrentTimestamp(), // "createdAt" es la fecha de creación; "getCurrentTimestamp()" genera la fecha y hora actual formateada
        assignedUsers // "assignedUsers" es la propiedad clave: contiene los usuarios a quienes se les asigna la tarea y se envía al backend
    }; // la llave cierra el objeto "taskData"

    try { // "try" abre el bloque protegido: cualquier error dentro pasa al "catch"
        const response = await createTask(taskData); // "const" declara; "response" guardará lo que devuelva la llamada; "await" pausa hasta que termine; "createTask(taskData)" envía la tarea y sus asignados con POST /api/tasks
        if (response.ok) { // "if" pregunta si la respuesta del servidor fue exitosa; "response" es la respuesta; ".ok" es verdadero cuando el servidor respondió correctamente
            const savedTask = await response.json(); // "const" declara; "savedTask" guarda el resultado; "await" espera; "response.json()" convierte la respuesta en objeto, que ya trae la tarea con sus asignados
            tasks.push(savedTask); // "tasks" es la lista de tareas; ".push" agrega al final; "savedTask" es la tarea recién creada con sus asignados
            applySorting(); // "applySorting" reordena y redibuja la tabla: aquí es donde se ven los badges de los usuarios asignados
            taskForm.reset(); // "taskForm" es el formulario; ".reset" limpia todos los campos para poder registrar otra tarea
            showToast('Tarea registrada exitosamente', 'success'); // "showToast" muestra una notificación; el texto confirma el éxito y "'success'" define el color verde
        } else { // "else" se ejecuta si la respuesta NO fue exitosa
            showToast('Error al guardar la tarea en el servidor', 'error'); // "showToast" muestra una notificación; el texto avisa del error al guardar y "'error'" define el color rojo
        } // la llave cierra el bloque del "else"
    } catch (error) { // "catch" atrapa cualquier error de conexión que haya ocurrido en el "try"; "error" es ese error
        showToast('Error de conexión: no se pudo guardar la tarea', 'error'); // "showToast" muestra una notificación; el texto avisa que no hubo conexión y no se pudo guardar, en color rojo
    } // la llave cierra el bloque del "catch"
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
