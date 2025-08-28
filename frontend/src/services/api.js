// frontend/src/services/api.js
import axios from 'axios';

/**
 * Base URL (from .env) — e.g.
 * REACT_APP_APIBASE_URL=http://localhost:5001
 */
const normalizeBase = (u) => (u || '').replace(/\/+$/, '');
const API_BASE_URL =
  normalizeBase(process.env.REACT_APP_APIBASE_URL) || 'http://localhost:5001';

/**
 * Read token from localStorage (covers common keys).
 * - "token"
 * - "authToken"
 * - "user" JSON with { token }
 */
const getToken = () => {
  const direct =
    localStorage.getItem('token') || localStorage.getItem('authToken');
  if (direct) return direct;

  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || '';
  } catch {
    return '';
  }
};

/**
 * Single axios instance for the whole app.
 * We attach the Authorization header on every request.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

/** Request: inject Authorization header when token exists */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response: DO NOT auto-logout on 401 here.
 * Let pages/components decide what to do.
 */
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

/* ---------------------- API GROUPS ---------------------- */

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

export const propertiesAPI = {
  getAll: (params) => api.get('/api/properties', { params }),
  getById: (id) => api.get(`/api/properties/${id}`),
  // (kept for completeness; only used if you create/edit as owner/admin)
  create: (data) => api.post('/api/properties', data),
  update: (id, data) => api.put(`/api/properties/${id}`, data),
  remove: (id) => api.delete(`/api/properties/${id}`),
  recommendations: () => api.get('/api/properties/user/recommendations'),
};

export const bookingsAPI = {
  create: (data) => api.post('/api/bookings', data),
  myBookings: () => api.get('/api/bookings/my-bookings'),
  getById: (id) => api.get(`/api/bookings/${id}`),
  pay: (id, data) => api.post(`/api/bookings/${id}/payment`, data),

  // admin helpers (unused for regular users, included for completeness)
  adminAll: (params) => api.get('/api/bookings/admin/all', { params }),
  adminAction: (id, data) => api.put(`/api/bookings/${id}/admin-action`, data),
};

export const notificationsAPI = {
  list: (params) => api.get('/api/notifications', { params }),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/mark-all-read'),
  remove: (id) => api.delete(`/api/notifications/${id}`),
};

export const dashboardAPI = {
  owner: () => api.get('/api/dashboard/owner'),
  updateOwner: (data) => api.put('/api/dashboard/owner', data),
  ownerFinancials: (params) =>
    api.get('/api/dashboard/owner/financials', { params }),
  admin: () => api.get('/api/dashboard/admin'),
  adminRecs: (params) =>
    api.get('/api/dashboard/admin/recommendations', { params }),
};

export const commuteAPI = {
  nearbyMosques: (params) =>
    api.get('/api/commute/nearby-mosques', { params }),
  propertiesWithCommute: (params) =>
    api.get('/api/commute/properties-with-commute', { params }),

  // user routes (protected)
  listRoutes: (params) => api.get('/api/commute/routes', { params }),
  createRoute: (data) => api.post('/api/commute/routes', data),
  getRoute: (id) => api.get(`/api/commute/routes/${id}`),
  updateRoute: (id, data) => api.put(`/api/commute/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/api/commute/routes/${id}`),
  toggleFavorite: (id) => api.put(`/api/commute/routes/${id}/favorite`),
  addAlert: (id, data) => api.post(`/api/commute/routes/${id}/alerts`, data),
};

export default api;
