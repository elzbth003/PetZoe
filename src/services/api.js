import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('petzoe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('petzoe_token');
      sessionStorage.removeItem('petzoe_user');
      window.dispatchEvent(new Event('auth-change'));
    }
    return Promise.reject(error);
  }
);

export default api;
