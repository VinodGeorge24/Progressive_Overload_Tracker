/**
 * Auth API: register, login, logout, getMe, updateProfile.
 * Token is stored in localStorage; client discards on logout (no server invalidation in MVP).
 * Session expires after 30 minutes (JWT expiry); client clears token on 401 (see api/client.ts).
 */
import { apiClient } from "./client";
import { TOKEN_KEY } from "./constants";

const AUTH_PREFIX = "/api/v1/auth";

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UpdateProfileInput {
  username?: string;
  current_password?: string;
  new_password?: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function register(email: string, username: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>(`${AUTH_PREFIX}/register`, {
    email,
    username,
    password,
  });
  return data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(`${AUTH_PREFIX}/login`, {
    email,
    password,
  });
  setStoredToken(data.access_token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(`${AUTH_PREFIX}/logout`);
  } finally {
    clearStoredToken();
  }
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>(`${AUTH_PREFIX}/me`);
  return data;
}

export async function getProfile(): Promise<User> {
  return getMe();
}

export async function updateProfile(a_input: UpdateProfileInput): Promise<User> {
  const { data } = await apiClient.patch<User>(`${AUTH_PREFIX}/me`, a_input);
  return data;
}
