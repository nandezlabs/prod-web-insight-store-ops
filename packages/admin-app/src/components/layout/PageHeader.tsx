import { ReactNode } from "react";
import { Button } from "@insight/ui";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAddClick?: () => void;
}

export function PageHeader({
  title,
  description,
  actions,
  showAddButton = false,
  addButtonLabel = "Add New",
  onAddClick,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showAddButton && (
            <Button onClick={onAddClick}>
              <Plus className="w-4 h-4 mr-2" />
              {addButtonLabel}
            </Button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
