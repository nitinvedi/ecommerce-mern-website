// API Configuration

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    GOOGLE_LOGIN: `${API_BASE_URL}/auth/google`,
    FORGOT: `${API_BASE_URL}/auth/forgot-password`,
    RESET: `${API_BASE_URL}/auth/reset-password`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  },
  // Products
  PRODUCTS: {
    BASE: `${API_BASE_URL}/products`,
    BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
    REVIEWS: (id) => `${API_BASE_URL}/products/${id}/reviews`,
  },
  // Orders
  ORDERS: {
    BASE: `${API_BASE_URL}/orders`,
    MY_ORDERS: `${API_BASE_URL}/orders/my-orders`,
    BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    STATUS: (id) => `${API_BASE_URL}/admin/orders/${id}/status`,
  },
  // Repairs
  REPAIRS: {
    BASE: `${API_BASE_URL}/repairs`,
    MY_REPAIRS: `${API_BASE_URL}/repairs/my-repairs`,
    BY_ID: (id) => `${API_BASE_URL}/repairs/${id}`,
    TRACK: (trackingId) => `${API_BASE_URL}/repairs/track/${trackingId}`,
    STATUS: (id) => `${API_BASE_URL}/repairs/${id}/status`,
  },
  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    BASE: `${API_BASE_URL}/users`,
    BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  },
  // Admin
  ADMIN: {
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
    DASHBOARD_ACTIVITIES: `${API_BASE_URL}/admin/dashboard/activities`,
    ORDER_STATUS: (id) => `${API_BASE_URL}/admin/orders/${id}/status`,
    ASSIGN_TECHNICIAN: (repairId) => `${API_BASE_URL}/admin/repairs/${repairId}/assign-technician`,
  },
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set auth token
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// API request helper
export const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API methods
export const api = {
  get: (url, options = {}) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, data, options = {}) => apiRequest(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (url, data, options = {}) => apiRequest(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (url, options = {}) => apiRequest(url, { ...options, method: 'DELETE' }),
  patch: (url, data, options = {}) => apiRequest(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// File upload helper
export const uploadFile = async (url, formData, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      method: options.method || 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('File Upload Error:', error);
    throw error;
  }
};

// Generic form-data helper (supports PUT/PATCH)
export const uploadForm = async (url, formData, method = 'POST', options = {}) => {
  return uploadFile(url, formData, { ...options, method });
};

export { SOCKET_URL };
export default API_ENDPOINTS;

