import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// IMPORTANT: return full axios response (not response.data)
// This makes consuming code predictable: response.data will be server body.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // if 401, remove token and redirect to auth
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        try { window.location.href = '/auth'; } catch (e) {}
      }
      return Promise.reject(error.response);
    } else if (error.request) {
      return Promise.reject({ status: 0, message: 'Network error' });
    } else {
      return Promise.reject({ status: null, message: error.message });
    }
  }
);

export default API;
