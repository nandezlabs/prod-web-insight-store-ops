import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import type { PLReport } from "../types";

interface PLReportListProps {
  reports: PLReport[];
  onCreateNew: () => void;
  onEdit: (report: PLReport) => void;
  onDelete: (id: string) => void;
  onView: (report: PLReport) => void;
  stores: { id: string; name: string }[];
}

export function PLReportList({
  reports,
  onCreateNew,
  onEdit,
  onDelete,
  onView,
  stores,
}: PLReportListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [sortBy, setSortBy] = useState<"period" | "revenue" | "netProfit">(
    "period"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const filteredReports = reports
    .filter((report) => {
      const matchesSearch =
        report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.storeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStore = !storeFilter || report.storeId === storeFilter;
      return matchesSearch && matchesStore;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * multiplier;
      }
      return ((aValue as number) - (bValue as number)) * multiplier;
    });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">P&L Reports</h1>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports or stores..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {filteredReports.length} report
              {filteredReports.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                  Report Name
                </th>
                <th
                  className="text-left px-6 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("period")}
                >
                  <div className="flex items-center gap-1">
                    Period
                    {sortBy === "period" && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                  Store
                </th>
                <th
                  className="text-right px-6 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("revenue")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Revenue
                    {sortBy === "revenue" && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="text-right px-6 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("netProfit")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Net Profit
                    {sortBy === "netProfit" && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">
                  Margin
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    {searchTerm || storeFilter
                      ? "No reports match your filters"
                      : "No reports yet. Create your first P&L report to get started."}
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const isProfitable = report.netProfit >= 0;
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onView(report)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{report.reportName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatPeriod(report.period)}
                      </td>
                      <td className="px-6 py-4 text-sm">{report.storeName}</td>
                      <td className="px-6 py-4 text-right font-medium">
                        {formatCurrency(report.revenue)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          isProfitable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(report.netProfit)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${
                          isProfitable ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {report.profitMargin.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(report);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(report);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  "Are you sure you want to delete this report?"
                                )
                              ) {
                                onDelete(report.id);
                              }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
