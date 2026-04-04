import { type InsightDto } from "./reportApi";

export type ChartableInsightMarker = {
  id: string;
  label: string;
  rawLabel: string;
  rawValue: string;
  numericValue: number;
  status: InsightDto["status"];
  unit: string | null;
};

export type InsightStatusCount = {
  key: InsightDto["status"];
  label: "Normal" | "Low" | "High";
  count: number;
};

type MarkerAlias = {
  label: string;
  order: number;
  pattern: RegExp;
};

const MARKER_ALIASES: MarkerAlias[] = [
  { label: "Hemoglobin", order: 0, pattern: /\bhemoglobin\b|\bhb\b/i },
  { label: "Vitamin D", order: 1, pattern: /vitamin\s*d/i },
  { label: "Glucose", order: 2, pattern: /\b(fasting\s+)?(glucose|blood sugar|sugar)\b/i },
  { label: "Total Cholesterol", order: 3, pattern: /cholesterol/i },
  { label: "TSH", order: 4, pattern: /\btsh\b|thyroid/i },
];

export function parseInsightNumericValue(value: string): number | null {
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeInsightLabel(label: string): string {
  const cleaned = label.trim().replace(/\s+/g, " ");
  const alias = MARKER_ALIASES.find((item) => item.pattern.test(cleaned));
  return alias?.label ?? cleaned;
}

export function extractInsightUnit(value: string): string | null {
  const cleaned = value.replace(/\s+/g, " ").trim();
  const numericMatch = cleaned.match(/-?\d[\d,]*(?:\.\d+)?/);

  if (!numericMatch || typeof numericMatch.index !== "number") {
    return null;
  }

  const unitCandidate = cleaned
    .slice(numericMatch.index + numericMatch[0].length)
    .replace(/^[\s:;,-]+/, "")
    .replace(/\([^)]*\)/g, "")
    .trim();

  return unitCandidate || null;
}

export function getChartableInsightMarkers(insights: InsightDto[]): ChartableInsightMarker[] {
  const markers = insights.flatMap((insight) => {
    const numericValue = parseInsightNumericValue(insight.value);

    if (numericValue === null) {
      return [];
    }

    return [
      {
        id: insight.id,
        label: normalizeInsightLabel(insight.label),
        rawLabel: insight.label,
        rawValue: insight.value,
        numericValue,
        status: insight.status,
        unit: extractInsightUnit(insight.value),
      },
    ];
  });

  const deduped = new Map<string, ChartableInsightMarker>();

  for (const marker of markers) {
    const key = `${marker.label}|${marker.rawValue}`.toLowerCase();
    if (!deduped.has(key)) {
      deduped.set(key, marker);
    }
  }

  return [...deduped.values()].sort(compareMarkers);
}

export function getInsightStatusCounts(insights: InsightDto[]): InsightStatusCount[] {
  return [
    {
      key: "normal",
      label: "Normal",
      count: insights.filter((insight) => insight.status === "normal").length,
    },
    {
      key: "low",
      label: "Low",
      count: insights.filter((insight) => insight.status === "low").length,
    },
    {
      key: "high",
      label: "High",
      count: insights.filter((insight) => insight.status === "high").length,
    },
  ];
}

function compareMarkers(left: ChartableInsightMarker, right: ChartableInsightMarker): number {
  const orderDiff = getMarkerOrder(left.label) - getMarkerOrder(right.label);

  if (orderDiff !== 0) {
    return orderDiff;
  }

  return left.label.localeCompare(right.label);
}

function getMarkerOrder(label: string): number {
  const alias = MARKER_ALIASES.find((item) => item.label === label || item.pattern.test(label));
  return alias?.order ?? MARKER_ALIASES.length + label.toLowerCase().charCodeAt(0) / 1000;
}
