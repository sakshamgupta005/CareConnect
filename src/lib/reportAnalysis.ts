export type FindingStatus = "low" | "normal" | "high";

export type AnalyzedKeyFinding = {
  name: string;
  value: string;
  status: FindingStatus;
  explanation: string;
};

export type AnalyzedFaqItem = {
  question: string;
  answer: string;
};

export type ReportAnalysis = {
  summary: string;
  keyFindings: AnalyzedKeyFinding[];
  faqs: AnalyzedFaqItem[];
  recommendations: string[];
};

export const EMPTY_REPORT_ANALYSIS: ReportAnalysis = {
  summary: "",
  keyFindings: [],
  faqs: [],
  recommendations: [],
};

export function sanitizeReportAnalysis(input: unknown): ReportAnalysis {
  if (!input || typeof input !== "object") {
    return {
      ...EMPTY_REPORT_ANALYSIS,
      summary: "The report was analyzed, but no structured insights were returned.",
    };
  }

  const source = input as {
    summary?: unknown;
    keyFindings?: unknown;
    faqs?: unknown;
    recommendations?: unknown;
  };

  const summary = sanitizeSummary(source.summary);
  const keyFindings = sanitizeKeyFindings(source.keyFindings);
  const faqs = sanitizeFaqs(source.faqs);
  const recommendations = sanitizeRecommendations(source.recommendations);

  return {
    summary,
    keyFindings,
    faqs,
    recommendations,
  };
}

export function normalizeFindingStatus(value: unknown): FindingStatus {
  if (typeof value !== "string") {
    return "normal";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "low" || normalized === "normal" || normalized === "high") {
    return normalized;
  }

  return "normal";
}

export function extractNumericValue(raw: string): number | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }

  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeSummary(value: unknown): string {
  if (typeof value !== "string") {
    return "Your uploaded report has been analyzed.";
  }

  const summary = value.trim().replace(/\s+/g, " ");
  if (!summary) {
    return "Your uploaded report has been analyzed.";
  }

  return summary.slice(0, 420);
}

function sanitizeKeyFindings(value: unknown): AnalyzedKeyFinding[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const finding = item as {
        name?: unknown;
        value?: unknown;
        status?: unknown;
        explanation?: unknown;
      };

      const name = typeof finding.name === "string" ? finding.name.trim() : "";
      const valueText = typeof finding.value === "string" ? finding.value.trim() : "";
      const explanation = typeof finding.explanation === "string" ? finding.explanation.trim() : "";

      if (!name || !explanation) {
        return null;
      }

      return {
        name,
        value: valueText || "Not stated",
        status: normalizeFindingStatus(finding.status),
        explanation: explanation.slice(0, 360),
      } satisfies AnalyzedKeyFinding;
    })
    .filter((item): item is AnalyzedKeyFinding => Boolean(item));
}

function sanitizeFaqs(value: unknown): AnalyzedFaqItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const faq = item as {
        question?: unknown;
        answer?: unknown;
      };

      const question = typeof faq.question === "string" ? faq.question.trim() : "";
      const answer = typeof faq.answer === "string" ? faq.answer.trim() : "";

      if (!question || !answer) {
        return null;
      }

      return {
        question: question.slice(0, 200),
        answer: answer.slice(0, 380),
      } satisfies AnalyzedFaqItem;
    })
    .filter((item): item is AnalyzedFaqItem => Boolean(item));
}

function sanitizeRecommendations(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 8)
    .map((item) => item.slice(0, 220));
}

