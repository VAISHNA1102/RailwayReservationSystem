






// src/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8765";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const url = config.url || "";

  // Public endpoints: register & login
  const isPublic =
    url.includes("api/v1/users/register") ||
    url.includes("api/v1/auth/login");

  if (!isPublic) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Cancellation API methods
export const cancelTicket = async (pnr, reason) => {
  return await api.put(`/api/v1/reservations/cancel/${pnr}`, { reason });
};

export const isCancellable = async (pnr) => {
  return await api.get(`/api/v1/reservations/cancellable/${pnr}`);
};

// Revenue API method
export const getTotalRevenue = async () => {
  return await api.get('/api/v1/payments/revenue');
};

// Date-specific availability API method
export const getDateSpecificAvailability = async (trainId, journeyDate) => {
  return await api.get(`/api/v1/trips/availability/${trainId}/${journeyDate}`);
};

export default api;
