import { fetchJsonWithApiFallback } from "./apiClient";

export type ReportStatus = "uploaded" | "analyzed";

export type ReportDto = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  filePath: string | null;
  rawText: string;
  aiSummary: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};

export type InsightDto = {
  id: string;
  reportId: string;
  type: string;
  label: string;
  value: string;
  status: "low" | "normal" | "high";
};

export type FaqDto = {
  id: string;
  reportId: string;
  question: string;
  answer: string;
};

export type RecommendationDto = {
  id: string;
  reportId: string;
  category: string;
  text: string;
};

export type ReportDetailsDto = {
  report: ReportDto;
  insights: InsightDto[];
  faqs: FaqDto[];
  recommendations: RecommendationDto[];
};

export type ReportListItemDto = ReportDto & {
  counts: {
    insights: number;
    faqs: number;
    recommendations: number;
  };
};

export type UploadReportPayload = {
  title: string;
  fileName: string;
  fileType: string;
  filePath?: string;
  rawText: string;
  patientId?: string;
  phone?: string;
};

export async function uploadReport(payload: UploadReportPayload): Promise<ReportDto> {
  const { response, payload: parsed } = await fetchJsonWithApiFallback("/api/upload-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  ensureHttpSuccess(response, parsed, "Could not save report.");

  if (!isReport(parsed)) {
    throw new Error("Invalid upload response from server.");
  }

  return parsed;
}

export async function analyzeReport(reportId: string): Promise<ReportDetailsDto> {
  const { response, payload: parsed } = await fetchJsonWithApiFallback("/api/analyze-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  });
  ensureHttpSuccess(response, parsed, "Could not analyze report.");

  if (!isReportDetails(parsed)) {
    throw new Error("Invalid analyze response from server.");
  }

  return parsed;
}

export async function getReportById(reportId: string): Promise<ReportDetailsDto> {
  const { response, payload: parsed } = await fetchJsonWithApiFallback(`/api/report/${encodeURIComponent(reportId)}`);
  ensureHttpSuccess(response, parsed, "Could not load report.");

  if (!isReportDetails(parsed)) {
    throw new Error("Invalid report response from server.");
  }

  return parsed;
}

export async function listReports(): Promise<ReportListItemDto[]> {
  const { response, payload: parsed } = await fetchJsonWithApiFallback("/api/reports");
  ensureHttpSuccess(response, parsed, "Could not load reports.");

  if (!Array.isArray(parsed) || !parsed.every(isReportListItem)) {
    throw new Error("Invalid report list response from server.");
  }

  return parsed;
}

function ensureHttpSuccess(response: Response, payload: unknown, fallback: string): void {
  if (response.ok) return;

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.trim()
  ) {
    throw new Error(payload.error);
  }

  throw new Error(fallback);
}

function isReport(value: unknown): value is ReportDto {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.fileName === "string" &&
    typeof item.fileType === "string" &&
    (typeof item.filePath === "string" || item.filePath === null) &&
    typeof item.rawText === "string" &&
    (typeof item.aiSummary === "string" || item.aiSummary === null) &&
    (item.status === "uploaded" || item.status === "analyzed") &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function isInsight(value: unknown): value is InsightDto {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.reportId === "string" &&
    typeof item.type === "string" &&
    typeof item.label === "string" &&
    typeof item.value === "string" &&
    (item.status === "low" || item.status === "normal" || item.status === "high")
  );
}

function isFaq(value: unknown): value is FaqDto {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.reportId === "string" &&
    typeof item.question === "string" &&
    typeof item.answer === "string"
  );
}

function isRecommendation(value: unknown): value is RecommendationDto {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.reportId === "string" &&
    typeof item.category === "string" &&
    typeof item.text === "string"
  );
}

function isReportDetails(value: unknown): value is ReportDetailsDto {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    isReport(item.report) &&
    Array.isArray(item.insights) &&
    item.insights.every(isInsight) &&
    Array.isArray(item.faqs) &&
    item.faqs.every(isFaq) &&
    Array.isArray(item.recommendations) &&
    item.recommendations.every(isRecommendation)
  );
}

function isReportListItem(value: unknown): value is ReportListItemDto {
  if (!isReport(value)) return false;
  const item = value as ReportListItemDto & { counts?: unknown };
  return (
    Boolean(item.counts) &&
    typeof item.counts === "object" &&
    typeof item.counts.insights === "number" &&
    typeof item.counts.faqs === "number" &&
    typeof item.counts.recommendations === "number"
  );
}
