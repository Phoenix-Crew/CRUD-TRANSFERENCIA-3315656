export const userIdInput = document.getElementById('userId'); // "export" hace pública la referencia; "const" la fija; "userIdInput" es el campo; "document.getElementById('userId')" busca en el HTML el elemento con ese id, donde se digita el id del usuario a buscar
export const btnSearch = document.getElementById('btnSearch'); // "export" y "const" como antes; "btnSearch" es el botón; "getElementById('btnSearch')" lo encuentra: al presionarlo se dispara la búsqueda del usuario
export const userInfo = document.getElementById('userInfo'); // "export" y "const"; "userInfo" es el espacio; "getElementById('userInfo')" lo encuentra: ahí se muestra la tarjeta con los datos del usuario buscado
export const taskFormContainer = document.getElementById('taskFormContainer'); // "export" y "const"; "taskFormContainer" es el contenedor; "getElementById('taskFormContainer')" lo encuentra: es el bloque donde se muestra el formulario de registro, visible cuando el usuario existe
export const taskForm = document.getElementById('taskForm'); // "export" y "const"; "taskForm" es el formulario; "getElementById('taskForm')" lo encuentra: al enviarlo se dispara el evento que registra y asigna la tarea
export const taskTableBody = document.getElementById('taskTableBody'); // "export" y "const"; "taskTableBody" es el cuerpo de la tabla; "getElementById('taskTableBody')" lo encuentra: ahí se dibujan las filas de tareas con los badges de usuarios asignados
export const taskCount = document.getElementById('taskCount');
export const emptyState = document.getElementById('emptyState');
export const toastContainer = document.getElementById('toastContainer');
export const filterStatusSelect = document.getElementById('filterStatus');
export const sortDirectionBtn = document.getElementById('sortDirection');
export const sortableHeaders = document.querySelectorAll('th.sortable');
export const exportBtn = document.getElementById('exportBtn');

export const adminPanel = document.getElementById('adminPanel');
export const adminFilterStatus = document.getElementById('adminFilterStatus');
export const adminFilterUser = document.getElementById('adminFilterUser');
export const adminFilterDateFrom = document.getElementById('adminFilterDateFrom');
export const adminFilterDateTo = document.getElementById('adminFilterDateTo');
export const adminApplyFilters = document.getElementById('adminApplyFilters');
export const adminStatTotal = document.getElementById('adminStatTotal');
export const adminStatCompletadas = document.getElementById('adminStatCompletadas');
export const adminStatPendientes = document.getElementById('adminStatPendientes');
export const adminStatProgreso = document.getElementById('adminStatProgreso');
export const adminGlobalBody = document.getElementById('adminGlobalBody');
export const adminUserDistBody = document.getElementById('adminUserDistBody');
export const adminGlobalCount = document.getElementById('adminGlobalCount');

export const userAdminSection = document.getElementById('userAdminSection');
export const userTableBody = document.getElementById('userTableBody');
export const userEmptyState = document.getElementById('userEmptyState');
export const btnCreateUser = document.getElementById('btnCreateUser');
export const userCount = document.getElementById('userCount');

// "//" inicia un comentario en JavaScript: el texto de abajo explica dónde empieza la sección de los elementos del selector multi-usuario, que es el corazón del flujo de asignar tarea
export const assignedUsersGroup = document.getElementById('assignedUsersGroup'); // "export" hace pública la referencia; "const" la fija; "assignedUsersGroup" es el grupo; "getElementById('assignedUsersGroup')" lo encuentra: es el contenedor que se muestra u oculta para ver el selector de asignación
export const assignedUsersContainer = document.getElementById('assignedUsersContainer'); // "export" y "const"; "assignedUsersContainer" es el contenedor; "getElementById('assignedUsersContainer')" lo encuentra: es donde se dibujan los checkboxes de todos los usuarios disponibles para asignar
export const assignedUsersHint = document.getElementById('assignedUsersHint'); // "export" y "const"; "assignedUsersHint" es el texto de ayuda; "getElementById('assignedUsersHint')" lo encuentra: es la indicación que se oculta cuando los checkboxes ya están cargados
export const assignedUsersError = document.getElementById('assignedUsersError'); // "export" y "const"; "assignedUsersError" es el mensaje de error; "getElementById('assignedUsersError')" lo encuentra: ahí se avisa si no se marcó ningún usuario para asignar
