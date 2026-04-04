"use client";

import { type ChartData, type ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { type InsightDto } from "../../lib/reportApi";
import { getInsightStatusCounts } from "../../lib/reportCharts";
import { ensureChartSetup } from "./chartSetup";

ensureChartSetup();

type HealthStatusDonutProps = {
  insights: InsightDto[];
};

const STATUS_STYLES = {
  normal: {
    fill: "#10b981",
    toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  low: {
    fill: "#ef4444",
    toneClassName: "border-red-200 bg-red-50 text-red-700",
  },
  high: {
    fill: "#f97316",
    toneClassName: "border-orange-200 bg-orange-50 text-orange-700",
  },
} as const;

const LEGEND_COLOR = "#64748b";

export function HealthStatusDonut({ insights }: HealthStatusDonutProps) {
  const counts = getInsightStatusCounts(insights);
  const total = counts.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <ChartMessageCard
        title="Status Distribution"
        description="Once the report analysis stores low, normal, or high insights, their distribution will appear here."
      />
    );
  }

  const data: ChartData<"doughnut"> = {
    labels: counts.map((item) => item.label),
    datasets: [
      {
        data: counts.map((item) => item.count),
        backgroundColor: counts.map((item) => STATUS_STYLES[item.key].fill),
        borderColor: counts.map(() => "#ffffff"),
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: LEGEND_COLOR,
          boxWidth: 10,
          padding: 18,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const count = Number(context.raw) || 0;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return `${count} marker${count === 1 ? "" : "s"} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Status Distribution</h3>
          <p className="mt-1 text-sm text-slate-600">
            Counts are calculated from the current report&apos;s saved insight statuses only.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {total} total
        </span>
      </div>

      <div className="relative mt-5 h-[260px] sm:h-[300px]">
        <Doughnut data={data} options={options} aria-label="Donut chart of report marker status distribution" />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-900">{total}</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Markers</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {counts.map((item) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <div key={item.key} className={`rounded-xl border px-3 py-2 ${STATUS_STYLES[item.key].toneClassName}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide">{item.label}</p>
              <p className="mt-1 text-base font-semibold">{item.count}</p>
              <p className="text-[11px]">{percent}% of report markers</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartMessageCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
