import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import type { DataPoint } from "../types";

interface CompletionChartProps {
  data: DataPoint[];
  title?: string;
}

export function CompletionChart({
  data,
  title = "Completion Trend",
}: CompletionChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [visibleSeries, setVisibleSeries] = useState({
    opening: true,
    daily: true,
    weekly: true,
  });

  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [series]: !prev[series] }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const ChartComponent = chartType === "line" ? LineChart : BarChart;

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>

        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === "line"
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Line chart"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                chartType === "bar"
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Bar chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80" role="img" aria-label="Completion trend chart">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              onClick={(e) =>
                toggleSeries(e.dataKey as keyof typeof visibleSeries)
              }
              wrapperStyle={{ cursor: "pointer" }}
            />

            {visibleSeries.opening &&
              (chartType === "line" ? (
                <Line
                  type="monotone"
                  dataKey="opening"
                  name="Opening"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ) : (
                <Bar dataKey="opening" name="Opening" fill="#3b82f6" />
              ))}

            {visibleSeries.daily &&
              (chartType === "line" ? (
                <Line
                  type="monotone"
                  dataKey="daily"
                  name="Daily"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ) : (
                <Bar dataKey="daily" name="Daily" fill="#10b981" />
              ))}

            {visibleSeries.weekly &&
              (chartType === "line" ? (
                <Line
                  type="monotone"
                  dataKey="weekly"
                  name="Weekly"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ) : (
                <Bar dataKey="weekly" name="Weekly" fill="#f59e0b" />
              ))}
          </ChartComponent>
        </ResponsiveContainer>
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
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Opening</th>
                <th className="text-right py-2">Daily</th>
                <th className="text-right py-2">Weekly</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.date} className="border-b">
                  <td className="py-2">{row.date}</td>
                  <td className="text-right py-2">{row.opening}</td>
                  <td className="text-right py-2">{row.daily}</td>
                  <td className="text-right py-2">{row.weekly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
