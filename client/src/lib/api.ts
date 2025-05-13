import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  config => {
    // Example: Add auth token
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Example: handle 401 unauthorized
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      console.error('Unauthorized, redirecting to login...');
    }
    return Promise.reject(error);
  }
);

export default api;