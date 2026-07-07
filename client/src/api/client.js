import axios from 'axios';

const api = axios.create({
  baseURL: 'https://queue-management-application-92ka.onrender.com/api',
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('queue_app_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('queue_app_token');
      localStorage.removeItem('queue_app_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
