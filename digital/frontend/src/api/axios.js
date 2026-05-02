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

// Response interceptor to handle global errors and show toasts
api.interceptors.response.use(
    (response) => {
        // Success toasts for non-GET requests (mutations)
        if (response.config.method !== 'get' && response.data?.message) {
            toast.success(response.data.message);
        }
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        const isLoginRequest = error.config?.url?.includes('/login');
        
        if (error.response?.status === 401 && !isLoginRequest) {
            // Token might be expired - only redirect if it's NOT a login attempt
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('Session expired. Please login again.');
            
            // Only redirect if not already on login page to avoid refresh loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else {
            // For login failures or other errors, just show the backend message
            toast.error(message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
