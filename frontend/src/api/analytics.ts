import { apiClient } from "./client";

const ANALYTICS_PREFIX = "/api/v1/analytics";

export type ProgressMetric = "weight" | "reps" | "volume";

export interface ProgressPoint {
  date: string;
  weight: number;
  reps: number;
  volume: number;
}

export interface ProgressSeries {
  set_number: number;
  points: ProgressPoint[];
}

export interface ExerciseProgressOut {
  exercise_id: number;
  exercise_name: string;
  series: ProgressSeries[];
}

export interface ProgressQueryParams {
  start_date?: string;
  end_date?: string;
  set_number?: number;
}

export interface ProgressChartParams extends ProgressQueryParams {
  metric: ProgressMetric;
}

export async function getProgress(
  exerciseId: number,
  params?: ProgressQueryParams
): Promise<ExerciseProgressOut> {
  const { data } = await apiClient.get<ExerciseProgressOut>(
    `${ANALYTICS_PREFIX}/progress/${exerciseId}`,
    { params: params ?? {} }
  );
  return data;
}

export async function getProgressChartObjectUrl(
  exerciseId: number,
  params: ProgressChartParams
): Promise<string> {
  const response = await apiClient.get<Blob>(`${ANALYTICS_PREFIX}/progress/${exerciseId}/chart`, {
    params,
    responseType: "blob",
  });
  return URL.createObjectURL(response.data);
}
