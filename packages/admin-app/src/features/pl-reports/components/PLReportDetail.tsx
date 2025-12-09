import { ArrowLeft, Edit, Trash2, FileText } from "lucide-react";
import { useEffect } from "react";
import { PLMetrics } from "./PLMetrics";
import { AISummary } from "./AISummary";
import { AIChat } from "./AIChat";
import { TrendChart } from "./TrendChart";
import type {
  PLReport,
  AISummary as AISummaryType,
  ChatMessage,
  TrendData,
} from "../types";

interface PLReportDetailProps {
  report: PLReport;
  aiSummary: AISummaryType | null;
  isLoadingAI: boolean;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  trendData: TrendData[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateAISummary: () => void;
  onSendChatMessage: (message: string) => void;
}

export function PLReportDetail({
  report,
  aiSummary,
  isLoadingAI,
  chatMessages,
  isChatLoading,
  trendData,
  onBack,
  onEdit,
  onDelete,
  onGenerateAISummary,
  onSendChatMessage,
}: PLReportDetailProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Auto-generate AI summary on mount if not already present
  useEffect(() => {
    if (!aiSummary && !isLoadingAI) {
      onGenerateAISummary();
    }
  }, []);

  const metrics = {
    revenue: report.revenue,
    totalExpenses: report.totalExpenses,
    grossProfit: report.grossProfit,
    netProfit: report.netProfit,
    profitMargin: report.profitMargin,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{report.reportName}</h1>
            <p className="text-muted-foreground">
              {report.storeName} · {formatPeriod(report.period)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this report?")) {
                onDelete();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <PLMetrics metrics={metrics} />

      {/* Financial Details */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Financial Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Section */}
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">
              Revenue
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Revenue</span>
                <span className="font-medium">
                  {formatCurrency(report.revenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">
              Expenses Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Cost of Goods Sold</span>
                <span className="font-medium">
                  {formatCurrency(report.cogs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Labor Costs</span>
                <span className="font-medium">
                  {formatCurrency(report.laborCosts)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rent</span>
                <span className="font-medium">
                  {formatCurrency(report.rent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Utilities</span>
                <span className="font-medium">
                  {formatCurrency(report.utilities)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Marketing</span>
                <span className="font-medium">
                  {formatCurrency(report.marketing)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Other Expenses</span>
                <span className="font-medium">
                  {formatCurrency(report.otherExpenses)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Total Expenses</span>
                <span>{formatCurrency(report.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Profitability Section */}
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">
              Profitability
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Gross Profit</span>
                <span className="font-medium">
                  {formatCurrency(report.grossProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Net Profit</span>
                <span
                  className={`font-semibold ${
                    report.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(report.netProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Profit Margin</span>
                <span
                  className={`font-semibold ${
                    report.profitMargin >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {report.profitMargin.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {report.notes && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Notes
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {report.notes}
              </p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Created: {new Date(report.createdAt).toLocaleString()}</span>
            {report.updatedAt && (
              <span>
                Last updated: {new Date(report.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {trendData.length > 0 && <TrendChart data={trendData} />}

      {/* AI Summary */}
      <AISummary
        summary={aiSummary}
        isLoading={isLoadingAI}
        onRegenerate={onGenerateAISummary}
      />

      {/* AI Chat */}
      <AIChat
        messages={chatMessages}
        isLoading={isChatLoading}
        onSendMessage={onSendChatMessage}
      />
    </div>
  );
}
