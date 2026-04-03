import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://tushar-form.onrender.com"
    : "http://localhost:5000");

export const TOKEN_STORAGE_KEY = "employee_payroll_system_auth_token";

export const getStoredToken = () => window.localStorage.getItem(TOKEN_STORAGE_KEY);

export const setStoredToken = (token) => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearStoredToken = () => {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
