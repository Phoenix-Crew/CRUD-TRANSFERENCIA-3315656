const API_URL = import.meta.env.VITE_API_URL || '';

export async function createUser(data) {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

export async function fetchUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}

export async function fetchUserById(id) {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
}

export async function updateUser(id, data) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

export async function deleteUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
    });
    return response;
}

export async function toggleUserStatus(id, active) {
    const response = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
    });
    return response;
}

export { API_URL };
