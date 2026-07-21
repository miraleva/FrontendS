import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8083',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token to header (except for public auth endpoints or invalid tokens)
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isPublicAuthEndpoint =
      url.includes('/api/auth') ||
      url.includes('/api/authenticationservice/login');

    if (isPublicAuthEndpoint) {
      // Preserve explicit Authorization header if provided by caller (e.g. Bearer google_id_token for oauth-login)
      const hasExplicitAuthHeader =
        config.headers?.Authorization ||
        config.headers?.authorization ||
        (typeof config.headers?.get === 'function' && config.headers.get('Authorization'));

      if (!hasExplicitAuthHeader) {
        delete config.headers.Authorization;
        delete config.headers['Authorization'];
        if (typeof config.headers?.delete === 'function') {
          config.headers.delete('Authorization');
          config.headers.delete('authorization');
        }
      }
    } else {
      const token = localStorage.getItem('token');
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      } else {
        delete config.headers.Authorization;
        delete config.headers['Authorization'];
        if (typeof config.headers?.delete === 'function') {
          config.headers.delete('Authorization');
          config.headers.delete('authorization');
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Globally handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isGuestSession = localStorage.getItem('isGuest') === 'true';

      // Avoid redirecting when public auth endpoints fail OR when user is in a guest session
      if (!url.includes('/api/auth') && !isGuestSession) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;