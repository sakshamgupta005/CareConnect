import { type InsightDto } from "../../lib/reportApi";

type CompactInsightsGraphProps = {
  insights: InsightDto[];
};

function parseNumericValue(value: string): number | null {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CompactInsightsGraph({ insights }: CompactInsightsGraphProps) {
  if (insights.length === 0) {
    return <p className="text-sm text-slate-600">No insight graph data available yet.</p>;
  }

  const numericValues = insights
    .map((insight) => parseNumericValue(insight.value))
    .filter((value): value is number => value !== null);

  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : null;

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[460px] items-end gap-3">
        {insights.map((insight) => {
          const numeric = parseNumericValue(insight.value);
          const heightPercent =
            numeric !== null && maxValue && maxValue > 0
              ? Math.max(14, Math.round((numeric / maxValue) * 100))
              : insight.status === "low"
                ? 36
                : insight.status === "high"
                  ? 70
                  : 52;

          const barColor =
            insight.status === "low"
              ? "bg-red-500"
              : insight.status === "high"
                ? "bg-orange-500"
                : "bg-emerald-500";

          return (
            <div key={insight.id} className="flex flex-1 flex-col items-center gap-2">
              <p className="truncate text-xs font-medium text-slate-700">{insight.value}</p>
              <div className="flex h-36 w-full items-end rounded-lg bg-slate-100 p-2">
                <div className={`w-full rounded-md ${barColor}`} style={{ height: `${heightPercent}%` }} />
              </div>
              <p className="line-clamp-2 text-center text-[11px] leading-tight text-slate-600">{insight.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

