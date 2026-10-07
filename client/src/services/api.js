import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spendwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for central error handling and 401 redirection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status || 500;
    
    // Auto-logout on 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem('spendwise_token');
      localStorage.removeItem('spendwise_user');
      // If not on login or register page, redirect to login
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }

    const formattedError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors || [],
      status
    };
    return Promise.reject(formattedError);
  }
);

export default api;
