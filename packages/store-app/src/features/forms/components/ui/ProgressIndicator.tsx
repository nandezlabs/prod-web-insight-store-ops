interface ProgressIndicatorProps {
  currentSection: number;
  totalSections: number;
  sectionTitle?: string;
}

export function ProgressIndicator({
  currentSection,
  totalSections,
  sectionTitle,
}: ProgressIndicatorProps) {
  const progress = ((currentSection + 1) / totalSections) * 100;

  return (
    <div className="space-y-3">
      {/* Section info */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {sectionTitle || `Section ${currentSection + 1}`}
        </h2>
        <span className="text-sm font-medium text-gray-600">
          {currentSection + 1} of {totalSections}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Section dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalSections }).map((_, index) => (
          <div
            key={index}
            className={`
              flex-1 h-1 rounded-full transition-colors
              ${index < currentSection ? "bg-blue-600" : ""}
              ${index === currentSection ? "bg-blue-400" : ""}
              ${index > currentSection ? "bg-gray-300" : ""}
            `}
          />
        ))}
      </div>
    </div>
  );
}
