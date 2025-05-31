import { jwtDecode } from 'jwt-decode';

export function isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const decoded = jwtDecode(token);
        return decoded.exp > Date.now() / 1000;
    } catch (error) {
        return false;
    }
}

export function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

export function getUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const decoded = jwtDecode(token);
        return decoded.sub;
    } catch (error) {
        return null;
    }
}