import axios from 'axios';
import { API_URL } from '@env';

const api = axios.create({
    baseURL: API_URL || 'http://31.97.232.232:5010/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    me: (token) => api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
    }),
};

export const wallpaperApi = {
    getAll: (params) => api.get('/wallpapers', { params }),
    getBySlug: (slug) => api.get(`/wallpapers/slug/${slug}`),
    submitEnquiry: (data) => api.post('/leads', { ...data, type: 'enquiry' }),
    getEnquiries: (userId, token) => api.get(`/queries?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
};

export const categoryApi = {
    getAll: () => api.get('/categories'),
    getGroups: () => api.get('/groups'),
};

export const wishlistApi = {
    get: (token) => api.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
    }),
    add: (token, wallpaperId) => api.post('/wishlist', { wallpaperId }, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    remove: (token, id) => api.delete(`/wishlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
};

export const aiApi = {
    getRecommendations: (answers) => api.post('/ai/recommendations', { answers }),
};

export const visualizerApi = {
    uploadRoom: (token, formData) => api.post('/visualizer/upload-room', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        }
    }),
    generate: (token, data) => api.post('/visualizer/generate', data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    getHistory: (token) => api.get('/visualizer/history', {
        headers: { Authorization: `Bearer ${token}` }
    }),
};

export default api;
