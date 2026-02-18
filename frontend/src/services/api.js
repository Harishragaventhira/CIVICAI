import axios from 'axios';

const api = axios.create({
    baseURL: '', // Using Vite proxy
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const login = (username, password) => api.post('/api/login', { username, password });
export const register = (userData) => api.post('/api/register', userData);
export const logout = () => api.post('/api/logout');
export const getUser = () => api.get('/api/user');
export const getReports = () => api.get('/api/reports');
export const createReport = (formData) => api.post('/api/reports', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
export const resolveReport = (id) => api.put(`/api/resolve/${id}`);

export default api;
