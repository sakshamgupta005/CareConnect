import { sanitizeReportAnalysis, type ReportAnalysis } from "./reportAnalysis";

type AnalyzeReportRequestBody = {
  reportText: string;
};

export async function analyzeReportText(reportText: string): Promise<ReportAnalysis> {
  const text = reportText.trim();
  if (!text) {
    throw new Error("Cannot analyze an empty report.");
  }

  const response = await fetch("/api/analyze-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reportText: text } satisfies AnalyzeReportRequestBody),
  });

  const raw = await response.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string"
        ? parsed.error
        : "Report analysis failed. Please try again.";
    throw new Error(message);
  }

  return sanitizeReportAnalysis(parsed);
}

