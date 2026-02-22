import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://31.97.232.232:5010/api/v1',
    withCredentials: true, // For cookies (JWT)
});

// Request interceptor to add token to headers
api.interceptors.request.use(
    (config) => {
        const tokenString = localStorage.getItem('token');
        if (tokenString) {
            try {
                // Token is stored as JSON string "token" in logic above, or just value. 
                // Context saves it as: localStorage.setItem('token', JSON.stringify(res.data.user.token));
                // So we need to parse it.
                const token = JSON.parse(tokenString);
                config.headers.Authorization = `Bearer ${token}`;
            } catch (e) {
                // Fallback if not JSON
                config.headers.Authorization = `Bearer ${tokenString}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (optional)
        }
        return Promise.reject(error);
    }
);

export default api;
