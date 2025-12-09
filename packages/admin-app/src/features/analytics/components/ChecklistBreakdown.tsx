import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { TypeMetric } from "../types";

interface ChecklistBreakdownProps {
  data: TypeMetric[];
  onTypeClick?: (type: string) => void;
}

export function ChecklistBreakdown({
  data,
  onTypeClick,
}: ChecklistBreakdownProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{data.type}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Count:</span>
            <span className="font-medium">{data.count}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Percentage:</span>
            <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  const handleClick = (data: any, index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
    if (onTypeClick) {
      onTypeClick(data.type);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Checklist Type Breakdown</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click on a slice to filter by type
        </p>
      </div>

      {/* Chart */}
      <div
        className="h-80"
        role="img"
        aria-label="Checklist type breakdown chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="count"
              onClick={handleClick}
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.5
                  }
                  strokeWidth={activeIndex === index ? 3 : 0}
                  stroke="#fff"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm">
                  {value} ({entry.payload.count})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div
            key={item.type}
            className={`p-3 rounded-md border transition-all cursor-pointer ${
              activeIndex === index ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleClick(item, index)}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.type}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{item.count}</span>
              <span className="text-sm text-muted-foreground">
                ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
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
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Count</th>
                <th className="text-right py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.type} className="border-b">
                  <td className="py-2 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    {row.type}
                  </td>
                  <td className="text-right py-2">{row.count}</td>
                  <td className="text-right py-2">
                    {row.percentage.toFixed(1)}%
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
