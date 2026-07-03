import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5010/api/v1',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const tokenString = localStorage.getItem('token');
        if (tokenString) {
            try {
                const token = JSON.parse(tokenString);
                config.headers.Authorization = `Bearer ${token}`;
            } catch (e) {
                config.headers.Authorization = `Bearer ${tokenString}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default api;
