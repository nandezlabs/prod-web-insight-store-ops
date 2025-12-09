import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import type { AnalyticsFilters } from "../types";

interface ExportReportProps {
  filters: AnalyticsFilters;
}

export function ExportReport({ filters }: ExportReportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async (format: "csv" | "pdf") => {
    setIsExporting(true);
    setProgress(0);
    setShowDropdown(false);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const blob = await analyticsService.exportData(format, filters);

      clearInterval(progressInterval);
      setProgress(100);

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTimeout(() => {
        setProgress(0);
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
      setProgress(0);
      alert("Failed to export report. Please try again.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4" />
        {isExporting ? `Exporting... ${progress}%` : "Export Report"}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && !isExporting && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-10">
          <div className="py-1">
            <button
              onClick={() => handleExport("csv")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Export as CSV</p>
                <p className="text-xs text-muted-foreground">
                  Spreadsheet format
                </p>
              </div>
            </button>

            <button
              onClick={() => handleExport("pdf")}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <FileText className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-sm">Export as PDF</p>
                <p className="text-xs text-muted-foreground">
                  Printable report
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isExporting && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Preparing export...</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
