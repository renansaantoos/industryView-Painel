import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';

/** API base URL from environment or default to localhost */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/** Create axios instance with base configuration */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Request interceptor: attach auth token */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ff_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/** Response interceptor: handle errors globally */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      // Unauthorized - token expired or invalid
      if (status === 401) {
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_infoUser');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Forbidden
      if (status === 403) {
        console.error('Access forbidden');
      }

      // Payment required / plan expired
      if (status === 402) {
        window.location.href = '/expiredplan';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
