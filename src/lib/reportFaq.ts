export type RecommendedQuestion = {
  id: string;
  question: string;
  createdAt: number;
};

export type ReportFaqState = {
  reportName: string;
  reportText: string;
  questions: RecommendedQuestion[];
};

const STORAGE_KEY = "careconnect_report_faq_v1";

const DEFAULT_STATE: ReportFaqState = {
  reportName: "",
  reportText: "",
  questions: [],
};

export function loadReportFaqState(): ReportFaqState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<ReportFaqState>;
    return {
      reportName: typeof parsed.reportName === "string" ? parsed.reportName : "",
      reportText: typeof parsed.reportText === "string" ? parsed.reportText : "",
      questions: Array.isArray(parsed.questions)
        ? parsed.questions
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              id: typeof item.id === "string" ? item.id : createId(),
              question: typeof item.question === "string" ? item.question : "",
              createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
            }))
            .filter((item) => item.question.trim().length > 0)
        : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveReportFaqState(state: ReportFaqState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function normalizeReportText(text: string): string {
  return text.replace(/\r/g, " ").replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

export function getReportWordCount(reportText: string): number {
  if (!reportText.trim()) return 0;
  return reportText.trim().split(/\s+/).length;
}

export function buildExplanationFromReport(reportText: string, question: string): string {
  const cleanReport = normalizeReportText(reportText);
  if (!cleanReport) {
    return "No report has been uploaded by the doctor yet.";
  }

  const keywords = extractKeywords(question);
  const sentences = splitIntoSentences(cleanReport);

  const ranked = sentences
    .map((sentence) => ({
      sentence,
      score: scoreSentence(sentence, keywords),
    }))
    .sort((a, b) => b.score - a.score);

  const strongMatches = ranked.filter((item) => item.score > 0).slice(0, 2).map((item) => item.sentence);
  const fallback = sentences.slice(0, 2);
  const selected = (strongMatches.length > 0 ? strongMatches : fallback).join(" ");

  return `Based on the uploaded report: ${selected}`;
}

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]?/g);
  if (!matches) return [text];
  return matches.map((s) => s.trim()).filter(Boolean);
}

function extractKeywords(question: string): string[] {
  const stopWords = new Set([
    "what",
    "when",
    "where",
    "which",
    "this",
    "that",
    "from",
    "with",
    "have",
    "your",
    "about",
    "there",
    "their",
    "does",
    "into",
    "for",
    "the",
    "and",
    "are",
    "how",
    "can",
    "why",
  ]);

  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function scoreSentence(sentence: string, keywords: string[]): number {
  const lower = sentence.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    if (lower.includes(keyword)) score += 1;
  }
  return score;
}

