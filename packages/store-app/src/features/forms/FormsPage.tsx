import { DynamicForm } from "./components/DynamicForm";

export function FormsPage() {
  const handleComplete = () => {
    console.log("Form completed!");
    // Navigate back or show success message
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    // Navigate back
  };

  return (
    <DynamicForm
      formId="opening-checklist" // Replace with actual form ID from Notion
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
