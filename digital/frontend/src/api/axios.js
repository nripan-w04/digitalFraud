import toast from 'react-hot-toast';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
});

// Request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/login');
        
        if (error.response?.status === 401 && !isLoginRequest) {
            // Token might be expired - only redirect if it's NOT a login attempt
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on login page to avoid refresh loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
