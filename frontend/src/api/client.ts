/**
 * Axios instance with base URL and auth header from localStorage.
 * Use for all API calls that may need the JWT.
 * On 401 (e.g. expired token), clears token and dispatches auth:session-expired so UI logs out.
 */
import axios from "axios";
import { TOKEN_KEY } from "./constants";

const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = configuredBaseUrl || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      globalThis.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    return Promise.reject(error);
  }
);
