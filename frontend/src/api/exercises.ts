/**
 * Exercises API: list, create, get, update, delete.
 * All requests go through apiClient, which attaches the Authorization header.
 */
import { apiClient } from "./client";

const EXERCISES_PREFIX = "/api/v1/exercises";

export interface Exercise {
  id: number;
  name: string;
  muscle_group: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseCreateInput {
  name: string;
  muscle_group?: string | null;
}

export interface ExerciseUpdateInput {
  name?: string;
  muscle_group?: string | null;
}

export async function listExercises(): Promise<Exercise[]> {
  const { data } = await apiClient.get<Exercise[]>(`${EXERCISES_PREFIX}/`);
  return data;
}

export async function createExercise(input: ExerciseCreateInput): Promise<Exercise> {
  const { data } = await apiClient.post<Exercise>(`${EXERCISES_PREFIX}/`, input);
  return data;
}

export async function getExercise(id: number): Promise<Exercise> {
  const { data } = await apiClient.get<Exercise>(`${EXERCISES_PREFIX}/${id}`);
  return data;
}

export async function updateExercise(id: number, input: ExerciseUpdateInput): Promise<Exercise> {
  const { data } = await apiClient.put<Exercise>(`${EXERCISES_PREFIX}/${id}`, input);
  return data;
}

export async function deleteExercise(id: number): Promise<void> {
  await apiClient.delete(`${EXERCISES_PREFIX}/${id}`);
}

