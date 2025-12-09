import { api } from "./api";
import { FormDefinition, FormResponse } from "../types/form";

/**
 * Fetch form definition from Notion
 */
export async function getFormDefinition(
  formId: string
): Promise<FormDefinition | null> {
  const response = await api.get<FormDefinition>(`/forms/${formId}`);

  if (response.error || !response.data) {
    console.error("Failed to fetch form definition:", response.error);
    return null;
  }

  return response.data;
}

/**
 * Submit form response to backend
 */
export async function submitFormResponse(
  response: FormResponse
): Promise<boolean> {
  const result = await api.post<{ success: boolean; id: string }>(
    `/forms/${response.formId}/responses`,
    response
  );

  if (result.error || !result.data?.success) {
    console.error("Failed to submit form response:", result.error);
    return false;
  }

  return true;
}

/**
 * Sync pending form responses
 */
export async function syncFormResponses(responses: FormResponse[]): Promise<{
  synced: string[];
  failed: string[];
}> {
  const synced: string[] = [];
  const failed: string[] = [];

  for (const response of responses) {
    const success = await submitFormResponse(response);
    if (success) {
      synced.push(response.id);
    } else {
      failed.push(response.id);
    }
  }

  return { synced, failed };
}
