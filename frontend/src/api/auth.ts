/**
 * Auth API: register, login, logout, getMe.
 * Token is stored in localStorage; client discards on logout (no server invalidation in MVP).
 */
import { apiClient } from "./client";

const AUTH_PREFIX = "/api/v1/auth";
const TOKEN_KEY = "access_token";

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
