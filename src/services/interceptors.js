// src/services/interceptors.js
import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'  
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn('Unauthorized! Redirecting to login...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
