import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { KPICards } from "../components/KPICards";
import { DateRangePicker } from "../components/DateRangePicker";
import { CompletionChart } from "../components/CompletionChart";
import { StoreComparison } from "../components/StoreComparison";
import { ChecklistBreakdown } from "../components/ChecklistBreakdown";
import { ExportReport } from "../components/ExportReport";
import { useAnalyticsStore } from "../stores/analyticsStore";

export function AnalyticsDashboard() {
  const {
    data,
    isLoading,
    error,
    filters,
    fetchAnalytics,
    setDateRange,
    setDateRangePreset,
    refreshData,
  } = useAnalyticsStore();

  // Fetch data on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visualize completion rates, trends, and store performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <ExportReport filters={filters} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Date Range Picker */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DateRangePicker
              value={filters.dateRange}
              onChange={setDateRange}
              onPresetChange={setDateRangePreset}
            />
          </div>

          {/* KPI Cards */}
          <div className="lg:col-span-3">
            {isLoading && !data ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            ) : data ? (
              <KPICards
                totalCompleted={data.totalCompleted}
                avgCompletionRate={data.avgCompletionRate}
                onTimeRate={data.onTimeRate}
                activeStores={data.activeStores}
                previousPeriod={data.previousPeriod}
              />
            ) : null}
          </div>
        </div>

        {/* Charts Row 1 - Completion Trend */}
        {data && <CompletionChart data={data.completionTrend} />}

        {/* Charts Row 2 - Store Comparison & Type Breakdown */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StoreComparison data={data.storeComparison} />
            <ChecklistBreakdown data={data.typeBreakdown} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !data && !error && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-muted-foreground">
              No analytics data available. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
