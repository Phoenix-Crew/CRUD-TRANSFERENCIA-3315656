
//Archivo: tareasService.js — El cerebro de la aplicación

// ¿Que hace este archivo?
// Aquí se decide qué hacer cuando el usuario busca, agrega, edita,
// elimina o reordena una tarea. Le pide datos a la API, los procesa
// y luego le dice a la pantalla que muestre los cambios.
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
// ¿Qué exporta?  (8 funciones)
// CRUD de tareas:
//   - searchUser()         → busca usuario y carga sus tareas
//   - registerTask(ev)     → crea una tarea nueva
//   - clearUserInfo()      → resetea estado y pantalla
// RF02 (ordenamiento + filtro):
//   - setSortCriteria(c)       → cambia el criterio de orden
//   - setSortDirection(d)      → fija la dirección del orden
//   - toggleSortDirection()    → alterna asc/desc
//   - setFilterStatus(s)       → filtra por estado (RF02)
//
// ¿quien las usa?
//   app.js → importa searchUser y registerTask para conectarlas
//   a los botones de la pantalla

import { userIdInput, btnSearch, userInfo, taskFormContainer, taskForm, taskTableBody } from '../ui/dom.js';
import { fetchUsers, fetchTasksByUser, createTask, updateTask, deleteTaskFromApi } from '../api/tareasApi.js';
import { showToast, showUserInfo, showUserNotFound, showValidationError, clearFieldErrors, showFieldError } from '../ui/notifications.js';
import { enableTaskForm, hideEmptyState, showEmptyState, updateTaskCount, createTaskElement, enableEditMode, cancelEdit, disableAllEditModes, updateSortIcons, updateSortButtonLabel } from '../ui/taskRenderer.js';
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
//   Flujo:
//     1. Borra el HTML del contenedor de información del usuario
//     2. Oculta el formulario de tareas
//     3. currentUser = null  y  tasks = []
//     4. Limpia la tabla y actualiza el contador a 0
//     5. Muestra el mensaje de "no hay tareas"

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
}


// bindCallbacks()  [privada — NO se exporta]
//   ¿Qué hace?  Junta las 4 funciones de los botones (editar, eliminar,
//               guardar, cancelar) en un solo objeto.
//   ¿Para qué sirve?  Para pasarle ese objeto a createTaskElement() y
//   que cada fila de la tabla tenga sus botones funcionando.

function bindCallbacks() {
    return {
        onEdit: enableEditMode,
        onDelete: deleteTask,
        onSave: saveEdit,
        onCancel: cancelEdit
    };
}


// searchUser()  [se exporta]
//   ¿Qué hace?  Busca un usuario por su número de documento.
//               Si lo encuentra, muestra sus datos y carga sus tareas.
//
//   ¿Quién la llama?  app.js → cuando el usuario hace clic en "Buscar"
//                      o presiona Enter en el campo de texto.
//
//   Flujo completo:
//     1. Toma el valor del input (userIdInput)
//     2. Valida que no esté vacío usando isValidInput() de helpers.js
//        → Si está vacío: muestra error y se detiene
//     3. Deshabilita el botón y cambia el texto a "Buscando..."
//     4. Pide todos los usuarios al servidor con fetchUsers() de tareasApi.js
//     5. Busca en la lista un usuario cuyo ID coincida con lo escrito
//     6. Si existe el usuario:
//        a. Guarda el usuario en currentUser
//        b. Muestra los datos en pantalla con showUserInfo() de notifications.js
//        c. Muestra el formulario de tareas con enableTaskForm() de taskRenderer.js
//        d. Pide las tareas de ese usuario con fetchTasksByUser() de tareasApi.js
//        e. Guarda las tareas en la variable tasks
//        f. Limpia la tabla y pinta cada tarea con createTaskElement()
//        g. Actualiza el contador con updateTaskCount()
//     7. Si NO existe: muestra "Usuario no registrado" con showUserNotFound()
//     8. Si hay error de conexión: muestra mensaje de error
//     9. Vuelve a habilitar el botón y restaura el texto "Buscar"

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
//   ¿Qué hace?  Toma los datos del formulario, los valida y crea una
//               tarea nueva en el servidor.
//
//   ¿Quién la llama?  app.js → cuando el usuario envía el formulario
//                      (hace clic en "Agregar Tarea").
//
//   Flujo completo:
//     1. Detiene el envío normal del formulario (event.preventDefault())
//     2. Sale de cualquier modo edición que esté abierto
//     3. Limpia los mensajes de error anteriores
//     4. Toma los valores de título, descripción y estado del formulario
//     5. Valida que título y descripción NO estén vacíos
//        → Si falta alguno: muestra error debajo del campo y se detiene
//     6. Arma el objeto taskData con:
//        - userId, userName (del currentUser)
//        - title, description, status (del formulario)
//        - createdAt (fecha actual con getCurrentTimestamp())
//     7. Envía la tarea al servidor con createTask() de tareasApi.js
//     8. Si el servidor responde ok:
//        a. Agrega la tarea devuelta al array tasks
//        b. La pinta en la tabla con createTaskElement()
//        c. Oculta el mensaje de "no hay tareas"
//        d. Actualiza el contador
//        e. Limpia el formulario
//        f. Muestra un toast verde "Tarea registrada exitosamente"
//     9. Si el servidor responde con error: muestra toast rojo
//    10. Si hay error de conexión: muestra toast rojo

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


// saveEdit(taskId, row)  [privada — NO se exporta directamente]
//   ¿Qué hace?  Toma los valores que el usuario escribió en los inputs
//               de edición y los guarda en el servidor.
//
//   ¿Cuándo se usa?  Cuando el usuario hace clic en "Guardar" después
//                     de editar una tarea en la tabla.
//
//   Flujo completo:
//     1. Toma los valores de los inputs de edición (título, descripción, estado)
//     2. Valida que título y descripción no estén vacíos
//        → Si están vacíos: muestra toast de advertencia y se detiene
//     3. Envía los cambios al servidor con updateTask() de tareasApi.js
//     4. Si el servidor responde ok:
//        a. Actualiza la tarea en el array tasks
//        b. Sale del modo edición con cancelEdit()
//        c. Actualiza el texto del título, descripción y color del estado
//        d. Muestra toast verde "Tarea actualizada correctamente"
//     5. Si hay error: muestra toast rojo

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


// deleteTask(taskId, row)  [privada — NO se exporta directamente]
//   ¿Qué hace?  Pregunta si está seguro y luego borra la tarea.
//
//   ¿Cuándo se usa?  Cuando el usuario hace clic en "Eliminar" en una tarea.
//
//   Flujo completo:
//     1. Muestra un confirm() preguntando "¿Estás seguro?"
//        → Si el usuario cancela: no hace nada
//     2. Envía la orden de eliminar al servidor con deleteTaskFromApi()
//     3. Si el servidor responde ok:
//        a. Quita la tarea del array tasks (filter)
//        b. Borra la fila de la tabla (row.remove())
//        c. Actualiza el contador
//        d. Si ya no quedan tareas: muestra el mensaje de vacío
//        e. Muestra toast verde "Tarea eliminada correctamente"
//     4. Si hay error: muestra toast rojo

async function deleteTask(taskId, row) {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

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


// Exportaciones — lo que este archivo comparte con app.js
//   searchUser()         → para conectarlo al botón "Buscar"
//   registerTask()       → para conectarlo al formulario de tareas
//   clearUserInfo()      → para limpiar la pantalla cuando sea necesario
//   setSortCriteria()    → para conectarlo al <select> de criterio
//   setSortDirection()   → para conectarlo al botón de dirección directa
//   toggleSortDirection()→ para alternar asc/desc con un solo botón

export { searchUser, registerTask, clearUserInfo, setSortCriteria, setSortDirection, toggleSortDirection, setFilterStatus };
