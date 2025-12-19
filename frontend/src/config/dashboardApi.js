// Dashboard API endpoints

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const DASHBOARD_ENDPOINTS = {
  SUMMARY: `${API_BASE_URL}/dashboard/summary`,
  ORDERS: `${API_BASE_URL}/dashboard/orders`,
  REORDER: (orderId) => `${API_BASE_URL}/dashboard/orders/${orderId}/reorder`,
};
