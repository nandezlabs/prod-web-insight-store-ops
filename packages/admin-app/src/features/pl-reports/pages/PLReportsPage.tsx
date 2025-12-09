import { useState, useEffect } from "react";
import { usePLReportStore } from "../stores/plReportStore";
import { PLReportList } from "../components/PLReportList";
import { PLReportForm } from "../components/PLReportForm";
import { PLReportDetail } from "../components/PLReportDetail";
import { aiService } from "../services/aiService";
import type { PLReport, PLReportFormData, TrendData } from "../types";

// Mock stores data (replace with actual API call)
const MOCK_STORES = [
  { id: "store-1", name: "Downtown Store" },
  { id: "store-2", name: "Westside Mall" },
  { id: "store-3", name: "Eastside Plaza" },
  { id: "store-4", name: "Northpoint Center" },
];

export function PLReportsPage() {
  const {
    reports,
    currentReport,
    isLoading,
    error,
    chatHistory,
    aiSummary,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    setCurrentReport,
    addChatMessage,
    setAISummary,
  } = usePLReportStore();

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list"
  );
  const [editingReport, setEditingReport] = useState<PLReport | undefined>();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleCreateReport = async (data: PLReportFormData) => {
    try {
      await createReport(data);
      setView("list");
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  const handleUpdateReport = async (data: PLReportFormData) => {
    if (!editingReport) return;
    try {
      await updateReport(editingReport.id, data);
      setView("list");
      setEditingReport(undefined);
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      if (view === "detail") {
        setView("list");
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const handleViewReport = (report: PLReport) => {
    setCurrentReport(report);
    setView("detail");
  };

  const handleEditReport = (report: PLReport) => {
    setEditingReport(report);
    setView("edit");
  };

  const handleGenerateAISummary = async () => {
    if (!currentReport) return;

    setIsGeneratingAI(true);
    try {
      const summary = await aiService.generateSummary({
        revenue: currentReport.revenue,
        expenses: currentReport.totalExpenses,
        grossProfit: currentReport.grossProfit,
        netProfit: currentReport.netProfit,
        profitMargin: currentReport.profitMargin,
        period: currentReport.period,
        storeName: currentReport.storeName,
      });

      setAISummary({
        ...summary,
        generatedAt: new Date().toISOString(),
        reportId: currentReport.id,
      });
    } catch (error) {
      console.error("Failed to generate AI summary:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendChatMessage = async (message: string) => {
    if (!currentReport) return;

    // Add user message
    const userMessage = {
      role: "user" as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);

    setIsChatLoading(true);
    try {
      const response = await aiService.chat(
        message,
        {
          revenue: currentReport.revenue,
          expenses: currentReport.totalExpenses,
          netProfit: currentReport.netProfit,
          profitMargin: currentReport.profitMargin,
          period: currentReport.period,
        },
        chatHistory
      );

      // Add assistant message
      const assistantMessage = {
        role: "assistant" as const,
        content: response,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assistantMessage);
    } catch (error) {
      console.error("Failed to send chat message:", error);
      const errorMessage = {
        role: "assistant" as const,
        content:
          "Sorry, I encountered an error processing your question. Please try again.",
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getTrendData = (): TrendData[] => {
    if (!currentReport) return [];

    // Get reports for the same store, sorted by period
    const storeReports = reports
      .filter((r: PLReport) => r.storeId === currentReport.storeId)
      .sort((a: PLReport, b: PLReport) => a.period.localeCompare(b.period));

    return storeReports.map((report: PLReport) => ({
      period: report.period,
      revenue: report.revenue,
      expenses: report.totalExpenses,
      netProfit: report.netProfit,
    }));
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error loading P&L reports</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {view === "list" && (
        <PLReportList
          reports={reports}
          onCreateNew={() => setView("create")}
          onEdit={handleEditReport}
          onDelete={handleDeleteReport}
          onView={handleViewReport}
          stores={MOCK_STORES}
        />
      )}

      {view === "create" && (
        <PLReportForm
          onSubmit={handleCreateReport}
          onCancel={() => setView("list")}
          stores={MOCK_STORES}
        />
      )}

      {view === "edit" && editingReport && (
        <PLReportForm
          report={editingReport}
          onSubmit={handleUpdateReport}
          onCancel={() => {
            setView("list");
            setEditingReport(undefined);
          }}
          stores={MOCK_STORES}
        />
      )}

      {view === "detail" && currentReport && (
        <PLReportDetail
          report={currentReport}
          aiSummary={aiSummary}
          isLoadingAI={isGeneratingAI}
          chatMessages={chatHistory}
          isChatLoading={isChatLoading}
          trendData={getTrendData()}
          onBack={() => setView("list")}
          onEdit={() => handleEditReport(currentReport)}
          onDelete={() => handleDeleteReport(currentReport.id)}
          onGenerateAISummary={handleGenerateAISummary}
          onSendChatMessage={handleSendChatMessage}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
