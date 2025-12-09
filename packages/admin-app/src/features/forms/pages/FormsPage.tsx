import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@insight/ui";
import { Button } from "@insight/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { FileText, Plus } from "lucide-react";
import { FormBuilder } from "../components/FormBuilder";
import { useFormBuilderStore } from "../store/formBuilderStore";
import { formService } from "../services/formService";
import type { FormListItem } from "../types";

export function FormsPage() {
  const [view, setView] = useState<"list" | "builder">("list");
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { createNewForm, loadForm, reset } = useFormBuilderStore();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const allForms = await formService.getAllForms();
      setForms(
        allForms.map((form) => ({
          formId: form.formId,
          title: form.title,
          type: form.type,
          status: form.status,
          lastModified:
            form.updatedAt || form.createdAt || new Date().toISOString(),
          fieldCount: form.sections.reduce(
            (acc, s) => acc + s.fields.length,
            0
          ),
        }))
      );
    } catch (error) {
      console.error("Failed to load forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    createNewForm();
    setView("builder");
  };

  const handleEditForm = async (formId: string) => {
    await loadForm(formId);
    setView("builder");
  };

  const handleBackToList = () => {
    reset();
    setView("list");
    loadForms();
  };

  if (view === "builder") {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <button
            onClick={handleBackToList}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Forms
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <FormBuilder />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Form Builder"
        description="Create and manage dynamic checklists and forms for your stores"
        showAddButton
        addButtonLabel="Create Form"
        onAddClick={handleCreateNew}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading forms...</div>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No forms yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first form to get started
          </p>
          <Button onClick={handleCreateNew}>
            <Plus size={16} className="mr-2" />
            Create First Form
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <Card key={form.formId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="w-8 h-8 text-primary" />
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      form.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : form.status === "Draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {form.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">{form.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {form.type} Checklist
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  {form.fieldCount} field{form.fieldCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(form.lastModified).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditForm(form.formId)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={async () => {
                      if (confirm("Duplicate this form?")) {
                        await formService.duplicateForm(form.formId);
                        loadForms();
                      }
                    }}
                  >
                    Duplicate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
