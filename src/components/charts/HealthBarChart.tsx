"use client";

import { type ChartData, type ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { type InsightDto } from "../../lib/reportApi";
import { getChartableInsightMarkers } from "../../lib/reportCharts";
import { ensureChartSetup } from "./chartSetup";

ensureChartSetup();

type HealthBarChartProps = {
  insights: InsightDto[];
};

const STATUS_COLORS = {
  low: {
    fill: "rgba(239, 68, 68, 0.82)",
    stroke: "#dc2626",
  },
  normal: {
    fill: "rgba(16, 185, 129, 0.82)",
    stroke: "#059669",
  },
  high: {
    fill: "rgba(249, 115, 22, 0.82)",
    stroke: "#ea580c",
  },
} as const;

const AXIS_COLOR = "#64748b";
const GRID_COLOR = "rgba(148, 163, 184, 0.18)";

export function HealthBarChart({ insights }: HealthBarChartProps) {
  const markers = getChartableInsightMarkers(insights);

  if (markers.length === 0) {
    return (
      <ChartMessageCard
        title="Lab Marker Values"
        description="Numeric chart values will appear here when the analyzed report includes measurable lab markers such as hemoglobin, vitamin D, glucose, cholesterol, or TSH."
      />
    );
  }

  const data: ChartData<"bar"> = {
    labels: markers.map((marker) => marker.label),
    datasets: [
      {
        label: "Extracted report value",
        data: markers.map((marker) => marker.numericValue),
        backgroundColor: markers.map((marker) => STATUS_COLORS[marker.status].fill),
        borderColor: markers.map((marker) => STATUS_COLORS[marker.status].stroke),
        borderWidth: 1.5,
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 30,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title(items) {
            const marker = items[0] ? markers[items[0].dataIndex] : null;
            return marker?.label ?? "Extracted value";
          },
          label(context) {
            const marker = markers[context.dataIndex];
            return marker ? `Value: ${marker.rawValue}` : `Value: ${context.formattedValue}`;
          },
          afterLabel(context) {
            const marker = markers[context.dataIndex];
            return marker && marker.rawLabel !== marker.label ? `Source label: ${marker.rawLabel}` : "";
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: GRID_COLOR,
        },
        ticks: {
          color: AXIS_COLOR,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "Extracted numeric value (units differ by marker)",
          color: AXIS_COLOR,
          font: {
            size: 11,
            weight: 600,
          },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: AXIS_COLOR,
          font: {
            size: 12,
            weight: 600,
          },
        },
      },
    },
  };

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Lab Marker Values</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Only numeric values extracted from this uploaded report are charted here.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {markers.length} marker{markers.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 h-[320px] sm:h-[360px]">
        <Bar data={data} options={options} aria-label="Bar chart of extracted health marker values" />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Values stay in their original report units, so compare each bar with its label and tooltip instead of comparing unlike units directly.
      </p>
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
