/**
 * Export API: download a JSON attachment for the authenticated user.
 */
import { apiClient } from "./client";

const EXPORT_PREFIX = "/api/v1/export";

function getFilenameFromDisposition(contentDisposition?: string): string {
  const match = contentDisposition?.match(/filename="?(?<filename>[^"]+)"?/i);
  return match?.groups?.filename || "progressive-overload-export.json";
}

export async function downloadExportFile(format: "json" = "json"): Promise<string> {
  const response = await apiClient.get<Blob>(`${EXPORT_PREFIX}/`, {
    params: { format },
    responseType: "blob",
  });
  const filename = getFilenameFromDisposition(response.headers["content-disposition"]);
  const blob = new Blob([response.data], {
    type: response.headers["content-type"] || "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);

  return filename;
}
