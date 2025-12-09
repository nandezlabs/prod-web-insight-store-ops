import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useState } from "react";
import { marked } from "marked";
import type { AISummary as AISummaryType } from "../types";

interface AISummaryProps {
  summary: AISummaryType | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export function AISummary({
  summary,
  isLoading,
  onRegenerate,
}: AISummaryProps) {
  const [expanded, setExpanded] = useState(true);

  const renderMarkdown = (text: string) => {
    return { __html: marked(text) as string };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          <h3 className="text-lg font-semibold">AI Financial Analysis</h3>
        </div>

        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Financial Analysis</h3>
        </div>

        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            No AI analysis available yet.
          </p>
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 hover:text-purple-600 transition-colors"
        >
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Financial Analysis</h3>
        </button>

        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Regenerate analysis"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Overview */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Overview
            </h4>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={renderMarkdown(summary.overview)}
            />
          </div>

          {/* Key Insights */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Key Insights
            </h4>
            <ul className="space-y-2">
              {summary.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Recommendations
            </h4>
            <ul className="space-y-2">
              {summary.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t text-xs text-muted-foreground">
            Generated on {new Date(summary.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
