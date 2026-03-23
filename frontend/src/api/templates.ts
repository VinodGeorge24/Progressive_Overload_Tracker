/**
 * Workout templates API helpers.
 * Templates can also be applied into a session-shaped prefill payload for Today's Log.
 */
import { apiClient } from "./client";

const TEMPLATES_PREFIX = "/api/v1/templates";

export interface TemplateExercise {
  exercise_id: number;
  exercise_name: string;
  target_sets: number;
  target_reps: number;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  exercises: TemplateExercise[];
}

export interface TemplateExerciseInput {
  exercise_id: number;
  target_sets: number;
  target_reps: number;
}

export interface TemplateCreateInput {
  name: string;
  exercises: TemplateExerciseInput[];
}

export interface TemplateUpdateInput {
  name?: string;
  exercises?: TemplateExerciseInput[];
}

export interface TemplateApplySet {
  set_number: number;
  reps: number;
  weight: number | string;
}

export interface TemplateApplyExercise {
  exercise_id: number;
  exercise_name: string;
  sets: TemplateApplySet[];
  notes?: string | null;
}

export interface TemplateApplyOut {
  template_id: number;
  template_name: string;
  exercises: TemplateApplyExercise[];
}

export async function listTemplates(): Promise<WorkoutTemplate[]> {
  const { data } = await apiClient.get<WorkoutTemplate[]>(`${TEMPLATES_PREFIX}/`);
  return data;
}

export async function getTemplate(id: number): Promise<WorkoutTemplate> {
  const { data } = await apiClient.get<WorkoutTemplate>(`${TEMPLATES_PREFIX}/${id}`);
  return data;
}

export async function createTemplate(input: TemplateCreateInput): Promise<WorkoutTemplate> {
  const { data } = await apiClient.post<WorkoutTemplate>(`${TEMPLATES_PREFIX}/`, input);
  return data;
}

export async function updateTemplate(id: number, input: TemplateUpdateInput): Promise<WorkoutTemplate> {
  const { data } = await apiClient.put<WorkoutTemplate>(`${TEMPLATES_PREFIX}/${id}`, input);
  return data;
}

export async function deleteTemplate(id: number): Promise<void> {
  await apiClient.delete(`${TEMPLATES_PREFIX}/${id}`);
}

export async function applyTemplate(id: number): Promise<TemplateApplyOut> {
  const { data } = await apiClient.get<TemplateApplyOut>(`${TEMPLATES_PREFIX}/${id}/apply`);
  return data;
}
