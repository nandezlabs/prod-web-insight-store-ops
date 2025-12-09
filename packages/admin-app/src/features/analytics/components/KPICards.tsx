import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  format?: "number" | "percentage";
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  format = "number",
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (format === "percentage") {
      return typeof val === "number" ? `${val.toFixed(1)}%` : val;
    }
    return typeof val === "number" ? val.toLocaleString() : val;
  };

  const getChangeColor = (change?: number) => {
    if (!change) return "text-gray-500";
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return <Minus className="w-4 h-4" />;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold">{formatValue(value)}</p>

        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm ${getChangeColor(
              change
            )}`}
          >
            {getChangeIcon(change)}
            <span className="font-medium">
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground ml-1">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface KPICardsProps {
  totalCompleted: number;
  avgCompletionRate: number;
  onTimeRate: number;
  activeStores: number;
  previousPeriod?: {
    totalCompleted: number;
    avgCompletionRate: number;
    onTimeRate: number;
    activeStores: number;
  };
}

export function KPICards({
  totalCompleted,
  avgCompletionRate,
  onTimeRate,
  activeStores,
  previousPeriod,
}: KPICardsProps) {
  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return undefined;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Checklists Completed"
        value={totalCompleted}
        change={calculateChange(totalCompleted, previousPeriod?.totalCompleted)}
        changeLabel="vs last period"
      />

      <KPICard
        title="Average Completion Rate"
        value={avgCompletionRate}
        format="percentage"
        change={calculateChange(
          avgCompletionRate,
          previousPeriod?.avgCompletionRate
        )}
        changeLabel="vs last period"
      />

      <KPICard
        title="On-Time Completion"
        value={onTimeRate}
        format="percentage"
        change={calculateChange(onTimeRate, previousPeriod?.onTimeRate)}
        changeLabel="vs last period"
      />

      <KPICard
        title="Active Stores"
        value={activeStores}
        change={calculateChange(activeStores, previousPeriod?.activeStores)}
        changeLabel="vs last period"
      />
    </div>
  );
}
