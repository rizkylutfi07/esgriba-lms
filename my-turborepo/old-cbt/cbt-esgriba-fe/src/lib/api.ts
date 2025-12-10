import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/authStore";

// Base URL from env or fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// Request interceptor: Add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Don't auto-logout for login endpoint
    const isLoginEndpoint = error.config?.url?.includes("/login");

    if (error.response?.status === 401 && !isLoginEndpoint) {
      // Token expired or invalid - logout and redirect
      const currentPath = window.location.pathname;

      // Only logout and redirect if not already on login page
      if (currentPath !== "/login" && currentPath !== "/register") {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    // Handle validation errors (422)
    if (error.response?.status === 422) {
      const data = error.response.data as any;
      if (data.errors) {
        // Format validation errors
        const formattedErrors = Object.entries(data.errors)
          .map(([field, messages]) => {
            // Handle both array and string messages
            if (Array.isArray(messages)) {
              return `${field}: ${messages.join(", ")}`;
            } else if (typeof messages === "string") {
              return `${field}: ${messages}`;
            } else {
              return `${field}: ${String(messages)}`;
            }
          })
          .join("\n");
        error.message = formattedErrors;
      }
    }

    // Handle other common errors
    if (error.response?.status === 403) {
      error.message = "Anda tidak memiliki izin untuk mengakses resource ini";
    }

    if (error.response?.status === 404) {
      error.message = "Resource tidak ditemukan";
    }

    if (error.response?.status === 500) {
      error.message = "Terjadi kesalahan server";
    }

    return Promise.reject(error);
  }
);

// Helper to manually set auth token (useful for non-interceptor scenarios)
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
