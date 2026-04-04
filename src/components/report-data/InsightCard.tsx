import { type InsightDto } from "../../lib/reportApi";

type InsightCardProps = {
  insight: InsightDto;
};

export function InsightCard({ insight }: InsightCardProps) {
  const statusStyle =
    insight.status === "low"
      ? "border-red-200 bg-red-50 text-red-700"
      : insight.status === "high"
        ? "border-orange-200 bg-orange-50 text-orange-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{insight.label}</p>
          <p className="mt-1 text-xs text-slate-500">{insight.type}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${statusStyle}`}>
          {insight.status}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">{insight.value}</p>
    </article>
  );
}

