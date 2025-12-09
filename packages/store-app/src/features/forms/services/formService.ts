import type { FormSchema, FormSubmissionPayload } from "../types";

const API_BASE_URL = "/api";

/**
 * Fetch form schema from Notion Form Definitions database
 */
export async function fetchFormSchema(
  formId: string,
  sessionToken: string
): Promise<FormSchema> {
  const response = await fetch(
    `${API_BASE_URL}/notion-proxy.php?action=query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        databaseId: import.meta.env.VITE_DB_FORM_DEFINITIONS || "",
        filter: {
          property: "Form ID",
          rich_text: {
            equals: formId,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch form schema");
  }

  const data = await response.json();

  if (!data.success || !data.results || data.results.length === 0) {
    throw new Error("Form not found");
  }

  const formPage = data.results[0];

  // Extract form schema from Notion properties
  const schema: FormSchema = {
    formId,
    title: getPropertyValue(formPage, "Title") || "Untitled Form",
    description: getPropertyValue(formPage, "Description"),
    type: getPropertyValue(formPage, "Type"),
    section: getPropertyValue(formPage, "Section"),
    sections: JSON.parse(getPropertyValue(formPage, "Schema JSON") || "[]"),
  };

  return schema;
}

/**
 * Submit completed form to Notion Checklists database
 */
export async function submitForm(
  payload: FormSubmissionPayload,
  sessionToken: string
): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/notion-proxy.php?action=create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        databaseId: import.meta.env.VITE_DB_CHECKLISTS || "",
        properties: {
          "Checklist Title": formatProperty("title", payload.checklistTitle),
          Type: formatProperty("select", payload.type),
          "Task Items": formatProperty("rich_text", payload.taskItems),
          Status: formatProperty("select", payload.status),
          "Completed By": formatProperty("rich_text", payload.completedBy),
          "Completed Date": formatProperty("date", payload.completedDate),
          Section: formatProperty("select", payload.section),
          "Photo URLs": formatProperty(
            "rich_text",
            JSON.stringify(payload.photoUrls || [])
          ),
          "Signature Data": formatProperty(
            "rich_text",
            payload.signatureData || ""
          ),
          "Completion Percentage": formatProperty(
            "number",
            payload.completionPercentage
          ),
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit form");
  }

  const data = await response.json();
  return data.success;
}

/**
 * Upload photo to server (implement based on your storage solution)
 */
export async function uploadPhoto(
  photo: Blob,
  sessionToken: string
): Promise<string> {
  // This is a placeholder - implement based on your storage solution
  // Could be Cloudinary, AWS S3, or Notion file upload

  const formData = new FormData();
  formData.append("photo", photo);

  const response = await fetch(`${API_BASE_URL}/upload-photo.php`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload photo");
  }

  const data = await response.json();
  return data.url;
}

/**
 * Log form completion event
 */
export async function logFormCompletion(
  formId: string,
  formTitle: string,
  storeId: string,
  sessionToken: string
): Promise<void> {
  await fetch(`${API_BASE_URL}/notion-proxy.php?action=create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      databaseId: import.meta.env.VITE_DB_ANALYTICS_LOGS || "",
      properties: {
        "Event Type": formatProperty("select", "form_completion"),
        "Store ID": formatProperty("rich_text", storeId),
        Timestamp: formatProperty("date", new Date().toISOString()),
        Metadata: formatProperty(
          "rich_text",
          JSON.stringify({
            formId,
            formTitle,
          })
        ),
      },
    }),
  });
}

/**
 * Helper: Extract property value from Notion page
 */
function getPropertyValue(page: any, propertyName: string): any {
  if (!page.properties || !page.properties[propertyName]) {
    return null;
  }

  const property = page.properties[propertyName];
  const type = property.type;

  switch (type) {
    case "title":
      return property.title[0]?.plain_text || null;
    case "rich_text":
      return property.rich_text[0]?.plain_text || null;
    case "number":
      return property.number;
    case "select":
      return property.select?.name || null;
    case "date":
      return property.date?.start || null;
    default:
      return null;
  }
}

/**
 * Helper: Format property for Notion API
 */
function formatProperty(type: string, value: any): any {
  switch (type) {
    case "title":
      return {
        title: [{ text: { content: String(value) } }],
      };
    case "rich_text":
      return {
        rich_text: [{ text: { content: String(value) } }],
      };
    case "number":
      return {
        number: Number(value),
      };
    case "select":
      return {
        select: { name: String(value) },
      };
    case "date":
      return {
        date: { start: String(value) },
      };
    default:
      return {
        rich_text: [{ text: { content: String(value) } }],
      };
  }
}
