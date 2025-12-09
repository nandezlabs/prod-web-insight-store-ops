import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import type { TrendData } from "../types";

interface TrendChartProps {
  data: TrendData[];
  title?: string;
}

export function TrendChart({
  data,
  title = "Financial Trends",
}: TrendChartProps) {
  const [visibleSeries, setVisibleSeries] = useState({
    revenue: true,
    expenses: true,
    netProfit: true,
  });

  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({ ...prev, [series]: !prev[series] }));
  };

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{formatPeriod(label)}</p>
        {payload.map((entry: any) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-medium">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-center text-muted-foreground py-8">
          No trend data available. Add more reports to see trends.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="h-80" role="img" aria-label="Financial trends chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              tickFormatter={formatPeriod}
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              onClick={(e) =>
                toggleSeries(e.dataKey as keyof typeof visibleSeries)
              }
              wrapperStyle={{ cursor: "pointer" }}
            />

            {visibleSeries.revenue && (
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}

            {visibleSeries.expenses && (
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}

            {visibleSeries.netProfit && (
              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
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
                <th className="text-left py-2">Period</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">Expenses</th>
                <th className="text-right py-2">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.period} className="border-b">
                  <td className="py-2">{formatPeriod(row.period)}</td>
                  <td className="text-right py-2">
                    ${row.revenue.toLocaleString()}
                  </td>
                  <td className="text-right py-2">
                    ${row.expenses.toLocaleString()}
                  </td>
                  <td className="text-right py-2">
                    ${row.netProfit.toLocaleString()}
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
