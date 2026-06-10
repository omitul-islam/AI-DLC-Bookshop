// Reference: context/04-architecture/01-system-design/frontend-architecture.md
// API Client with interceptors

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (future)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Centralized error handling
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject({
      message,
      status: error.response?.status,
      details: error.response?.data?.details,
    });
  }
);

export default apiClient;
