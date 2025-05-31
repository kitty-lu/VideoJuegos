import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5000/api';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return jwtDecode(token);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

export const register = async (username, password) => {
  try {
    await axios.post(`${API_URL}/register`, { username, password });
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al registrar usuario');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};