import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ArrowRight } from "lucide-react";
import type { StoreMetric } from "../types";

interface StoreComparisonProps {
  data: StoreMetric[];
  maxStores?: number;
  onViewAll?: () => void;
}

export function StoreComparison({
  data,
  maxStores = 10,
  onViewAll,
}: StoreComparisonProps) {
  const topStores = data
    .sort((a, b) => b.completionCount - a.completionCount)
    .slice(0, maxStores);

  const getBarColor = (rate: number) => {
    if (rate >= 90) return "#10b981"; // green
    if (rate >= 80) return "#3b82f6"; // blue
    if (rate >= 70) return "#f59e0b"; // orange
    return "#ef4444"; // red
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{data.storeName}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Completions:</span>
            <span className="font-medium">{data.completionCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Rate:</span>
            <span className="font-medium">
              {data.completionRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Store Comparison</h3>
        {data.length > maxStores && onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all {data.length} stores
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="h-80" role="img" aria-label="Store comparison chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topStores}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="storeName"
              tick={{ fontSize: 12 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="completionCount"
              name="Completions"
              radius={[0, 4, 4, 0]}
            >
              {topStores.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.completionRate)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#10b981" }}
          />
          <span>≥90%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#3b82f6" }}
          />
          <span>80-89%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#f59e0b" }}
          />
          <span>70-79%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#ef4444" }}
          />
          <span>&lt;70%</span>
        </div>
      </div>

      {/* Data Table Alternative */}
      <details className="mt-4">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          View data table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Store</th>
                <th className="text-right py-2">Completions</th>
                <th className="text-right py-2">Rate</th>
              </tr>
            </thead>
            <tbody>
              {topStores.map((store) => (
                <tr key={store.storeId} className="border-b">
                  <td className="py-2">{store.storeName}</td>
                  <td className="text-right py-2">{store.completionCount}</td>
                  <td className="text-right py-2">
                    {store.completionRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
