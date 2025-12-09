import { useState, useEffect } from "react";
import { X, Calculator } from "lucide-react";
import type { PLReport, PLReportFormData } from "../types";

interface PLReportFormProps {
  report?: PLReport;
  onSubmit: (data: PLReportFormData) => void;
  onCancel: () => void;
  stores: { id: string; name: string }[];
}

export function PLReportForm({
  report,
  onSubmit,
  onCancel,
  stores,
}: PLReportFormProps) {
  const [formData, setFormData] = useState<PLReportFormData>({
    reportName: report?.reportName || "",
    period: report?.period || "",
    storeId: report?.storeId || "",
    revenue: report?.revenue || "",
    cogs: report?.cogs || "",
    laborCosts: report?.laborCosts || "",
    rent: report?.rent || "",
    utilities: report?.utilities || "",
    marketing: report?.marketing || "",
    otherExpenses: report?.otherExpenses || "",
    notes: report?.notes || "",
  });

  const [calculatedMetrics, setCalculatedMetrics] = useState({
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
    profitMargin: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate metrics whenever financial fields change
  useEffect(() => {
    const revenue = Number(formData.revenue) || 0;
    const cogs = Number(formData.cogs) || 0;
    const laborCosts = Number(formData.laborCosts) || 0;
    const rent = Number(formData.rent) || 0;
    const utilities = Number(formData.utilities) || 0;
    const marketing = Number(formData.marketing) || 0;
    const otherExpenses = Number(formData.otherExpenses) || 0;

    const totalExpenses =
      cogs + laborCosts + rent + utilities + marketing + otherExpenses;
    const grossProfit = revenue - cogs;
    const netProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    setCalculatedMetrics({
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin,
    });
  }, [
    formData.revenue,
    formData.cogs,
    formData.laborCosts,
    formData.rent,
    formData.utilities,
    formData.marketing,
    formData.otherExpenses,
  ]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reportName.trim()) {
      newErrors.reportName = "Report name is required";
    }
    if (!formData.period) {
      newErrors.period = "Period is required";
    }
    if (!formData.storeId) {
      newErrors.storeId = "Store is required";
    }
    if (!formData.revenue || Number(formData.revenue) <= 0) {
      newErrors.revenue = "Revenue must be greater than 0";
    }
    if (Number(formData.cogs) < 0) {
      newErrors.cogs = "Cost of goods sold cannot be negative";
    }
    if (Number(formData.laborCosts) < 0) {
      newErrors.laborCosts = "Labor costs cannot be negative";
    }
    if (Number(formData.rent) < 0) {
      newErrors.rent = "Rent cannot be negative";
    }
    if (Number(formData.utilities) < 0) {
      newErrors.utilities = "Utilities cannot be negative";
    }
    if (Number(formData.marketing) < 0) {
      newErrors.marketing = "Marketing cannot be negative";
    }
    if (Number(formData.otherExpenses) < 0) {
      newErrors.otherExpenses = "Other expenses cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    field: keyof PLReportFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isProfitable = calculatedMetrics.netProfit >= 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {report ? "Edit P&L Report" : "Create P&L Report"}
          </h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Report Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.reportName}
                onChange={(e) => handleChange("reportName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reportName ? "border-red-500" : ""
                }`}
                placeholder="e.g., December 2024 P&L"
              />
              {errors.reportName && (
                <p className="text-red-500 text-sm mt-1">{errors.reportName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Period <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={formData.period}
                onChange={(e) => handleChange("period", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.period ? "border-red-500" : ""
                }`}
              />
              {errors.period && (
                <p className="text-red-500 text-sm mt-1">{errors.period}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Store <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.storeId}
                onChange={(e) => handleChange("storeId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.storeId ? "border-red-500" : ""
                }`}
              >
                <option value="">Select store...</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              {errors.storeId && (
                <p className="text-red-500 text-sm mt-1">{errors.storeId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Revenue <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.revenue}
                onChange={(e) => handleChange("revenue", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.revenue ? "border-red-500" : ""
                }`}
                placeholder="0.00"
              />
              {errors.revenue && (
                <p className="text-red-500 text-sm mt-1">{errors.revenue}</p>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Expenses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cost of Goods Sold (COGS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cogs}
                  onChange={(e) => handleChange("cogs", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cogs ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.cogs && (
                  <p className="text-red-500 text-sm mt-1">{errors.cogs}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Labor Costs
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.laborCosts}
                  onChange={(e) => handleChange("laborCosts", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.laborCosts ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.laborCosts && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.laborCosts}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rent</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rent}
                  onChange={(e) => handleChange("rent", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.rent ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.rent && (
                  <p className="text-red-500 text-sm mt-1">{errors.rent}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Utilities
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.utilities}
                  onChange={(e) => handleChange("utilities", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.utilities ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.utilities && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.utilities}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Marketing
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.marketing}
                  onChange={(e) => handleChange("marketing", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.marketing ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.marketing && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.marketing}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Other Expenses
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.otherExpenses}
                  onChange={(e) =>
                    handleChange("otherExpenses", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.otherExpenses ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.otherExpenses && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.otherExpenses}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Calculated Metrics */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Calculated Metrics</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Expenses</p>
                <p className="font-semibold">
                  {formatCurrency(calculatedMetrics.totalExpenses)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Gross Profit</p>
                <p className="font-semibold">
                  {formatCurrency(calculatedMetrics.grossProfit)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Profit</p>
                <p
                  className={`font-semibold ${
                    isProfitable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(calculatedMetrics.netProfit)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Profit Margin</p>
                <p
                  className={`font-semibold ${
                    isProfitable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {calculatedMetrics.profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes or context..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {report ? "Update Report" : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
