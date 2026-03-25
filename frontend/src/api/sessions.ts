/**
 * Sessions API: list, create, get, update, delete.
 * Handles 409 (duplicate date) via error response; caller should show detail message.
 */
import { apiClient } from "./client";

const SESSIONS_PREFIX = "/api/v1/sessions";

export interface SetOut {
  id: number;
  set_number: number;
  reps: number;
  weight: number;
  rest_seconds?: number | null;
  notes?: string | null;
}

export interface WorkoutExerciseOut {
  exercise_id: number;
  exercise_name: string;
  sets: SetOut[];
  notes?: string | null;
}

export interface SessionOut {
  id: number;
  date: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  exercises: WorkoutExerciseOut[];
}

export interface SessionListResponse {
  sessions: SessionOut[];
  total: number;
}

export interface SetIn {
  set_number: number;
  reps: number;
  weight: number;
  rest_seconds?: number | null;
  notes?: string | null;
}

export interface WorkoutExerciseIn {
  exercise_id: number;
  sets: SetIn[];
  notes?: string | null;
}

export interface SessionCreateInput {
  date: string;
  notes?: string | null;
  exercises: WorkoutExerciseIn[];
}

export interface SessionUpdateInput {
  date?: string;
  notes?: string | null;
  exercises?: WorkoutExerciseIn[];
}

export interface ListSessionsParams {
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

export async function listSessions(params?: ListSessionsParams): Promise<SessionListResponse> {
  const { data } = await apiClient.get<SessionListResponse>(`${SESSIONS_PREFIX}/`, {
    params: params ?? {},
  });
  return data;
}

export async function getSession(id: number): Promise<SessionOut> {
  const { data } = await apiClient.get<SessionOut>(`${SESSIONS_PREFIX}/${id}`);
  return data;
}

export async function createSession(input: SessionCreateInput): Promise<SessionOut> {
  const { data } = await apiClient.post<SessionOut>(`${SESSIONS_PREFIX}/`, input);
  return data;
}

export async function updateSession(id: number, input: SessionUpdateInput): Promise<SessionOut> {
  const { data } = await apiClient.put<SessionOut>(`${SESSIONS_PREFIX}/${id}`, input);
  return data;
}

export async function deleteSession(id: number): Promise<void> {
  await apiClient.delete(`${SESSIONS_PREFIX}/${id}`);
}

/** Last time this exercise was logged: date and sets (for pre-fill). 404 if never logged. */
export interface LastSetPoint {
  set_number: number;
  weight: number;
  reps: number;
}

export interface LastSetsOut {
  date: string;
  sets: LastSetPoint[];
}

export async function getLastSetsForExercise(exerciseId: number): Promise<LastSetsOut | null> {
  try {
    const { data } = await apiClient.get<LastSetsOut>(`${SESSIONS_PREFIX}/last-sets`, {
      params: { exercise_id: exerciseId },
    });
    return data;
  } catch {
    return null;
  }
}

/** Format date as YYYY-MM-DD for API. */
export function formatDateForApi(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today in YYYY-MM-DD. */
export function todayApi(): string {
  return formatDateForApi(new Date());
}
