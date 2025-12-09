import { useState } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import type { DateRange, DateRangePreset } from "../types";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onPresetChange: (preset: DateRangePreset) => void;
}

const presets: Array<{ value: DateRangePreset; label: string }> = [
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "last90days", label: "Last 90 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

export function DateRangePicker({
  value,
  onChange,
  onPresetChange,
}: DateRangePickerProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customStart, setCustomStart] = useState(
    format(value.startDate, "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(
    format(value.endDate, "yyyy-MM-dd")
  );

  const handlePresetClick = (preset: DateRangePreset) => {
    if (preset === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      onPresetChange(preset);
    }
  };

  const handleApplyCustom = () => {
    onChange({
      startDate: new Date(customStart),
      endDate: new Date(customEnd),
      label: "Custom range",
    });
    setIsCustom(false);
  };

  const handleClear = () => {
    setIsCustom(false);
    onPresetChange("last30days");
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-medium">Date Range</h3>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
              value.label === preset.label && !isCustom
                ? "bg-primary text-white border-primary"
                : "bg-white hover:bg-gray-50 border-gray-300"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {isCustom && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-md">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={customEnd}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              min={customStart}
              max={format(new Date(), "yyyy-MM-dd")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleApplyCustom}
              className="flex-1 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current Range Display */}
      {!isCustom && (
        <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
          <p className="font-medium mb-1">Selected Period:</p>
          <p>
            {format(value.startDate, "MMM d, yyyy")} -{" "}
            {format(value.endDate, "MMM d, yyyy")}
          </p>
        </div>
      )}
    </div>
  );
}
