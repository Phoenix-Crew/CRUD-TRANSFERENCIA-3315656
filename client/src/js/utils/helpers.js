import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

export function getCurrentTimestamp() {
    return dayjs().format('DD/MM/YYYY, hh:mm a');
}

export function isValidInput(value) {
    return value && value.trim().length > 0;
}

export const statusColors = {
    'Pendiente': '#d97706',
    'En progreso': '#2563eb',
    'Completada': '#047857'
};

export const statusOrder = {
    'Pendiente': 1,
    'En progreso': 2,
    'Completada': 3
};

export function sortTasks(tasks, criteria, direction = 'asc') {
    const sorted = tasks.slice();

    const compare = (a, b) => {
        let result = 0;

        if (criteria === 'createdAt') {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (isNaN(dateA) || isNaN(dateB)) {
                result = String(a.createdAt).localeCompare(String(b.createdAt), 'es-CO');
            } else if (dateA === dateB) {
                result = String(a.title || '').localeCompare(String(b.title || ''), 'es-CO');
            } else {
                result = dateA - dateB;
            }
        } else if (criteria === 'title') {
            result = String(a.title || '').localeCompare(String(b.title || ''), 'es-CO');
        } else if (criteria === 'status') {
            const orderA = statusOrder[a.status] ?? 99;
            const orderB = statusOrder[b.status] ?? 99;
            if (orderA === orderB) {
                result = String(a.title || '').localeCompare(String(b.title || ''), 'es-CO');
            } else {
                result = orderA - orderB;
            }
        } else {
            result = 0;
        }

        return direction === 'desc' ? -result : result;
    };

    return sorted.sort(compare);
}

export function filterTasksByStatus(tasks, status) {
    if (!status || status === 'all') return tasks.slice();
    return tasks.filter(t => t.status === status);
}

export function buildTasksJson(visibleTasks, meta) {
    return {
        exportedAt: meta.exportedAt,
        user: {
            id: meta.user.id,
            name: meta.user.name
        },
        filter: {
            status: meta.filter.status,
            sortCriteria: meta.filter.sortCriteria,
            sortDirection: meta.filter.sortDirection
        },
        count: visibleTasks.length,
        tasks: visibleTasks.map(t => ({
            id: t.id,
            userId: t.userId,
            userName: t.userName,
            title: t.title,
            description: t.description,
            status: t.status,
            createdAt: t.createdAt
        }))
    };
}

export function buildExportFilename(userId, filterStatus, exportedAt) {
    const filterMap = {
        'all': 'todas',
        'Pendiente': 'pendiente',
        'En progreso': 'en_progreso',
        'Completada': 'completada'
    };
    const safeFilter = filterMap[filterStatus] || 'todas';

    let safeTimestamp = 'ts';
    if (exportedAt) {
        const datePart = exportedAt.split(',')[0].trim();
        safeTimestamp = datePart.replace(/\//g, '-').replace(/\s/g, '');
    }

    return `tareas_${userId}_${safeFilter}_${safeTimestamp}.json`;
}
