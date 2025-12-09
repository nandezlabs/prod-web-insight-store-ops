import axios from "axios";
import type { FormSchema, NotionFormPage } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class FormService {
  /**
   * Get all forms
   */
  async getAllForms(): Promise<FormSchema[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/forms`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch forms:", error);
      // Return mock data for development
      return this.getMockForms();
    }
  }

  /**
   * Get form by ID
   */
  async getFormById(formId: string): Promise<FormSchema | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/forms/${formId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch form:", error);
      return null;
    }
  }

  /**
   * Create new form
   */
  async createForm(form: Omit<FormSchema, "formId">): Promise<FormSchema> {
    try {
      const response = await axios.post(`${API_BASE_URL}/forms`, form);
      return response.data;
    } catch (error) {
      console.error("Failed to create form:", error);
      throw error;
    }
  }

  /**
   * Update existing form
   */
  async updateForm(
    formId: string,
    form: Partial<FormSchema>
  ): Promise<FormSchema> {
    try {
      const response = await axios.put(`${API_BASE_URL}/forms/${formId}`, form);
      return response.data;
    } catch (error) {
      console.error("Failed to update form:", error);
      throw error;
    }
  }

  /**
   * Delete form
   */
  async deleteForm(formId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/forms/${formId}`);
    } catch (error) {
      console.error("Failed to delete form:", error);
      throw error;
    }
  }

  /**
   * Duplicate form
   */
  async duplicateForm(formId: string): Promise<FormSchema> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/forms/${formId}/duplicate`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to duplicate form:", error);
      throw error;
    }
  }

  /**
   * Archive form
   */
  async archiveForm(formId: string): Promise<FormSchema> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/forms/${formId}/archive`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to archive form:", error);
      throw error;
    }
  }

  /**
   * Save form to Notion
   */
  async saveToNotion(form: FormSchema): Promise<void> {
    try {
      const notionData: NotionFormPage = {
        formTitle: form.title,
        formId: form.formId,
        formType: form.type,
        schemaJson: JSON.stringify(form, null, 2),
        section: "Admin", // Could be dynamic
        status: form.status,
        lastModified: new Date().toISOString(),
      };

      await axios.post(`${API_BASE_URL}/notion/forms`, notionData);
    } catch (error) {
      console.error("Failed to save to Notion:", error);
      throw error;
    }
  }

  /**
   * Export form as JSON
   */
  exportAsJson(form: FormSchema): void {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.formId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate unique form ID
   */
  generateFormId(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const timestamp = Date.now().toString(36);
    return `${slug}-${timestamp}`;
  }

  /**
   * Mock forms for development
   */
  private getMockForms(): FormSchema[] {
    return [
      {
        formId: "opening-checklist-001",
        title: "Opening Checklist",
        type: "Opening",
        status: "Active",
        sections: [
          {
            id: "section-1",
            title: "Safety Checks",
            description: "Verify all safety equipment",
            order: 0,
            fields: [
              {
                id: "field-1",
                type: "checkbox",
                label: "Fire extinguisher inspected",
                required: true,
                order: 0,
              },
              {
                id: "field-2",
                type: "checkbox",
                label: "Emergency exits clear",
                required: true,
                order: 1,
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

export const formService = new FormService();
