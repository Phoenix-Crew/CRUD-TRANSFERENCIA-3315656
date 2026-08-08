// Cómo se lee: "Const userIdInput se asigna a document punto getElementById, con userId como argumento."
// Qué es: la referencia al campo donde se digita el id del usuario a buscar.
export const userIdInput = document.getElementById('userId');
// Cómo se lee: "Const btnSearch se asigna a document punto getElementById, con btnSearch como argumento."
// Qué es: el botón Buscar: al presionarlo se dispara la búsqueda del usuario.
export const btnSearch = document.getElementById('btnSearch');
// Cómo se lee: "Const userInfo se asigna a document punto getElementById, con userInfo como argumento."
// Qué es: el espacio donde aparece la tarjeta con los datos del usuario buscado.
export const userInfo = document.getElementById('userInfo');
// Cómo se lee: "Const taskFormContainer se asigna a document punto getElementById, con taskFormContainer como argumento."
// Qué es: el contenedor del formulario de registro, visible cuando el usuario existe.
export const taskFormContainer = document.getElementById('taskFormContainer');
// Cómo se lee: "Const taskForm se asigna a document punto getElementById, con taskForm como argumento."
// Qué es: el formulario de la tarea; al enviarlo se dispara el evento que registra y asigna la tarea.
export const taskForm = document.getElementById('taskForm');
// Cómo se lee: "Const taskTableBody se asigna a document punto getElementById, con taskTableBody como argumento."
// Qué es: el cuerpo de la tabla donde se dibujan las filas de tareas con los badges de usuarios asignados.
export const taskTableBody = document.getElementById('taskTableBody');
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

// Cómo se lee: "Const assignedUsersGroup: la referencia al contenedor del selector multi-usuario".
// Qué es: el corazón del flujo: el bloque donde el usuario elige a quién se le asigna la tarea.
export const assignedUsersGroup = document.getElementById('assignedUsersGroup');
// Cómo se lee: "Const assignedUsersContainer: el contenedor donde viven las casillas".
// Qué es: aquí renderUserCheckboxes dibuja un checkbox por cada usuario disponible.
export const assignedUsersContainer = document.getElementById('assignedUsersContainer');
// Cómo se lee: "Const assignedUsersHint: el texto de ayuda del selector".
// Qué es: la indicación que se oculta cuando ya aparecen los checkboxes.
export const assignedUsersHint = document.getElementById('assignedUsersHint');
// Cómo se lee: "Const assignedUsersError: el lugar del mensaje de error del selector".
// Qué es: ahí aparece el aviso si no se marca ningún usuario para asignar.
export const assignedUsersError = document.getElementById('assignedUsersError');