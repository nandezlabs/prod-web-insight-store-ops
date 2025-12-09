import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import type { PLMetrics as PLMetricsType } from "../types";

interface PLMetricsProps {
  metrics: PLMetricsType;
}

export function PLMetrics({ metrics }: PLMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChangeIndicator = (current: number, previous?: number) => {
    if (!previous) return null;

    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;

    return (
      <div
        className={`flex items-center gap-1 text-sm ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const isProfitable = metrics.netProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </h3>
          <DollarSign className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-3xl font-bold mb-1">
          {formatCurrency(metrics.revenue)}
        </p>
        {metrics.previousPeriod &&
          getChangeIndicator(metrics.revenue, metrics.previousPeriod.revenue)}
      </div>

      {/* Total Expenses */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </h3>
          <DollarSign className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-3xl font-bold">
          {formatCurrency(metrics.totalExpenses)}
        </p>
      </div>

      {/* Gross Profit */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Gross Profit
          </h3>
          <DollarSign className="w-5 h-5 text-purple-600" />
        </div>
        <p className="text-3xl font-bold">
          {formatCurrency(metrics.grossProfit)}
        </p>
      </div>

      {/* Net Profit */}
      <div
        className={`bg-white rounded-lg border-2 p-6 shadow-sm ${
          isProfitable ? "border-green-500" : "border-red-500"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Net Profit
          </h3>
          <DollarSign
            className={`w-5 h-5 ${
              isProfitable ? "text-green-600" : "text-red-600"
            }`}
          />
        </div>
        <p
          className={`text-3xl font-bold mb-1 ${
            isProfitable ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(metrics.netProfit)}
        </p>
        {metrics.previousPeriod &&
          getChangeIndicator(
            metrics.netProfit,
            metrics.previousPeriod.netProfit
          )}
      </div>

      {/* Profit Margin */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Profit Margin
          </h3>
          <Percent
            className={`w-5 h-5 ${
              isProfitable ? "text-green-600" : "text-red-600"
            }`}
          />
        </div>
        <p
          className={`text-3xl font-bold mb-1 ${
            isProfitable ? "text-green-600" : "text-red-600"
          }`}
        >
          {metrics.profitMargin.toFixed(1)}%
        </p>
        {metrics.previousPeriod &&
          getChangeIndicator(
            metrics.profitMargin,
            metrics.previousPeriod.profitMargin
          )}
      </div>
    </div>
  );
}
