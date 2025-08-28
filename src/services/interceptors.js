// src/services/interceptors.js
import axios from 'axios';




 const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });


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


 apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.warn('Unauthorized! Redirecting to login...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

export default apiClient;
