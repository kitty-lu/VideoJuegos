import axios from 'axios';
import { getAuthToken } from './auth';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getSales = () => api.get('/sales');
export const createSale = (saleData) => api.post('/sales', saleData);
export const updateSale = (id, saleData) => api.put(`/sales/${id}`, saleData);
export const deleteSale = (id) => api.delete(`/sales/${id}`);