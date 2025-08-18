import axios from 'axios';
import { toast } from 'react-hot-toast';

// Base URL for API - will work for both development and production
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-backend-url.vercel.app'
  : 'http://localhost:1903';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// Properties API calls
export const propertiesAPI = {
  getAll: (params = {}) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  getRecommendations: () => api.get('/properties/user/recommendations'),
};

// Bookings API calls
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params = {}) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  processPayment: (id, data) => api.post(`/bookings/${id}/payment`, data),
  adminAction: (id, data) => api.put(`/bookings/${id}/admin-action`, data),
  getAllAdmin: (params = {}) => api.get('/bookings/admin/all', { params }),
};

// Reviews API calls
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getUserReviews: (userId, params = {}) => api.get(`/reviews/user/${userId}`, { params }),
  getPropertyReviews: (propertyId, params = {}) => api.get(`/reviews/property/${propertyId}`, { params }),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
  respond: (id, data) => api.put(`/reviews/${id}/respond`, data),
  flag: (id, data) => api.put(`/reviews/${id}/flag`, data),
  getFlagged: () => api.get('/reviews/admin/flagged'),
  adminReview: (id, data) => api.put(`/reviews/${id}/admin-review`, data),
};

// Notifications API calls
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
  getStats: () => api.get('/notifications/admin/stats'),
};

// Dashboard API calls
export const dashboardAPI = {
  getOwnerDashboard: () => api.get('/dashboard/owner'),
  updateOwnerDashboard: (data) => api.put('/dashboard/owner', data),
  generateMonthlyReport: (month) => api.post(`/dashboard/owner/reports/${month}`),
  getFinancials: (params = {}) => api.get('/dashboard/owner/financials', { params }),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getRecommendationAnalytics: (params = {}) => api.get('/dashboard/admin/recommendations', { params }),
};

// Commute API calls
export const commuteAPI = {
  createRoute: (data) => api.post('/commute/routes', data),
  getRoutes: (params = {}) => api.get('/commute/routes', { params }),
  getRoute: (id) => api.get(`/commute/routes/${id}`),
  updateRoute: (id, data) => api.put(`/commute/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/commute/routes/${id}`),
  toggleFavorite: (id) => api.put(`/commute/routes/${id}/favorite`),
  addAlert: (id, data) => api.post(`/commute/routes/${id}/alerts`, data),
  getNearbyMosques: (params = {}) => api.get('/commute/nearby-mosques', { params }),
  getPropertiesWithCommute: (params = {}) => api.get('/commute/properties-with-commute', { params }),
};

export default api;