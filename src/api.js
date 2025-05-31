const API_URL = 'http://localhost:5000/api';

export async function login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
        throw new Error('Error en la autenticación');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
}

export async function register(username, password) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
        throw new Error('Error en el registro');
    }
    
    return response.json();
}

export async function getGames() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/games`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error('Error al obtener los juegos');
    }
    
    return response.json();
}

export async function createGame(gameData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(gameData),
    });
    
    if (!response.ok) {
        throw new Error('Error al crear el juego');
    }
    
    return response.json();
}

export async function updateGame(gameId, gameData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/games/${gameId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(gameData),
    });
    
    if (!response.ok) {
        throw new Error('Error al actualizar el juego');
    }
    
    return response.json();
}

export async function deleteGame(gameId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    
    if (!response.ok) {
        throw new Error('Error al eliminar el juego');
    }
    
    return response.json();
}