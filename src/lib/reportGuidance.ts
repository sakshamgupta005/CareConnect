export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  category?: string;
  createdByDoctorId: string;
  createdAt: number;
  updatedAt: number;
};

export type ReportRecord = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  reportTitle: string;
  uploadedFileName?: string;
  findings: string[];
  assignedFaqIds: string[];
  createdAt: number;
  updatedAt: number;
};

export type ReportGuidanceState = {
  faqs: FAQItem[];
  reports: ReportRecord[];
};

const STORAGE_KEY = "careconnect_report_guidance_v1";

const seedDate = Date.parse("2026-03-18T08:30:00.000Z");

const DEFAULT_STATE: ReportGuidanceState = {
  faqs: [
    {
      id: "faq_1",
      question: "What does low hemoglobin mean?",
      answer:
        "Low hemoglobin can suggest anemia. This may reduce oxygen delivery in the body and can contribute to tiredness, weakness, or shortness of breath.",
      tags: ["hemoglobin", "anemia", "low hb"],
      category: "Blood Test",
      createdByDoctorId: "doctor_1",
      createdAt: seedDate,
      updatedAt: seedDate,
    },
    {
      id: "faq_2",
      question: "Why is vitamin D important in my report?",
      answer:
        "Vitamin D supports bone health and immune function. Low vitamin D may be linked with fatigue, muscle weakness, or bone discomfort.",
      tags: ["vitamin d", "low vitamin d", "deficiency"],
      category: "Nutrition",
      createdByDoctorId: "doctor_1",
      createdAt: seedDate + 1000 * 60 * 20,
      updatedAt: seedDate + 1000 * 60 * 20,
    },
    {
      id: "faq_3",
      question: "What does high cholesterol indicate?",
      answer:
        "High cholesterol means more fat-like particles are present in the blood. Over time, this can increase heart and blood vessel risk if not managed.",
      tags: ["cholesterol", "lipids", "high cholesterol"],
      category: "Cardiometabolic",
      createdByDoctorId: "doctor_1",
      createdAt: seedDate + 1000 * 60 * 40,
      updatedAt: seedDate + 1000 * 60 * 40,
    },
    {
      id: "faq_4",
      question: "What does thyroid imbalance mean?",
      answer:
        "A thyroid imbalance means thyroid hormone levels may be outside the healthy range. It can affect energy, mood, metabolism, and body weight.",
      tags: ["thyroid", "tsh", "thyroid imbalance"],
      category: "Hormonal",
      createdByDoctorId: "doctor_1",
      createdAt: seedDate + 1000 * 60 * 60,
      updatedAt: seedDate + 1000 * 60 * 60,
    },
  ],
  reports: [
    {
      id: "report_1",
      patientId: "patient_1",
      patientName: "Eleanor Rigby",
      doctorId: "doctor_1",
      doctorName: "Dr. Saksham Gupta",
      reportTitle: "Blood Test - March 2026",
      uploadedFileName: "blood-test-march-2026.txt",
      findings: ["anemia", "low vitamin d", "high cholesterol"],
      assignedFaqIds: ["faq_1", "faq_2"],
      createdAt: seedDate,
      updatedAt: seedDate + 1000 * 60 * 80,
    },
  ],
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function createGuidanceId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function normalizeTag(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseTagsInput(value: string): string[] {
  return dedupeStringList(value.split(",").map((tag) => normalizeTag(tag)).filter(Boolean));
}

export function dedupeStringList(values: string[]): string[] {
  return [...new Set(values.map((value) => normalizeTag(value)).filter(Boolean))];
}

export function loadReportGuidanceState(): ReportGuidanceState {
  if (typeof window === "undefined") {
    return cloneState(DEFAULT_STATE);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneState(DEFAULT_STATE);
    }

    const parsed = JSON.parse(raw) as Partial<ReportGuidanceState>;
    const faqs = Array.isArray(parsed.faqs) ? parsed.faqs.map(sanitizeFaq).filter(Boolean) : [];
    const reports = Array.isArray(parsed.reports) ? parsed.reports.map(sanitizeReport).filter(Boolean) : [];

    return {
      faqs: faqs.length > 0 ? (faqs as FAQItem[]) : cloneState(DEFAULT_STATE).faqs,
      reports: reports.length > 0 ? (reports as ReportRecord[]) : cloneState(DEFAULT_STATE).reports,
    };
  } catch {
    return cloneState(DEFAULT_STATE);
  }
}

export function saveReportGuidanceState(state: ReportGuidanceState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getReportById(state: ReportGuidanceState, reportId: string): ReportRecord | null {
  return state.reports.find((report) => report.id === reportId) ?? null;
}

export function getAssignedFaqs(report: ReportRecord, faqs: FAQItem[]): FAQItem[] {
  const faqMap = new Map(faqs.map((faq) => [faq.id, faq]));
  return report.assignedFaqIds.map((faqId) => faqMap.get(faqId)).filter(Boolean) as FAQItem[];
}

export function getSuggestedFaqIdsFromFindings(faqs: FAQItem[], findings: string[]): string[] {
  const normalizedFindings = new Set(findings.map((finding) => normalizeTag(finding)).filter(Boolean));

  return faqs
    .filter((faq) => faq.tags.some((tag) => normalizedFindings.has(normalizeTag(tag))))
    .map((faq) => faq.id);
}

export function mergeUniqueIds(existingIds: string[], incomingIds: string[]): string[] {
  return [...new Set([...existingIds, ...incomingIds])];
}

export function formatReportDate(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return "N/A";
  return dateFormatter.format(new Date(timestamp));
}

export function formatTagLabel(tag: string): string {
  return tag
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function cloneState(state: ReportGuidanceState): ReportGuidanceState {
  return {
    faqs: state.faqs.map((faq) => ({ ...faq, tags: [...faq.tags] })),
    reports: state.reports.map((report) => ({
      ...report,
      findings: [...report.findings],
      assignedFaqIds: [...report.assignedFaqIds],
    })),
  };
}

function sanitizeFaq(value: unknown): FAQItem | null {
  if (!value || typeof value !== "object") return null;
  const faq = value as Partial<FAQItem>;

  const id = typeof faq.id === "string" ? faq.id : createGuidanceId("faq");
  const question = typeof faq.question === "string" ? faq.question.trim() : "";
  const answer = typeof faq.answer === "string" ? faq.answer.trim() : "";
  const tags = Array.isArray(faq.tags) ? dedupeStringList(faq.tags) : [];

  if (!question || !answer) return null;

  return {
    id,
    question,
    answer,
    tags,
    category: typeof faq.category === "string" && faq.category.trim() ? faq.category.trim() : undefined,
    createdByDoctorId: typeof faq.createdByDoctorId === "string" ? faq.createdByDoctorId : "doctor_1",
    createdAt: typeof faq.createdAt === "number" ? faq.createdAt : Date.now(),
    updatedAt: typeof faq.updatedAt === "number" ? faq.updatedAt : Date.now(),
  };
}

function sanitizeReport(value: unknown): ReportRecord | null {
  if (!value || typeof value !== "object") return null;
  const report = value as Partial<ReportRecord>;

  const id = typeof report.id === "string" ? report.id : createGuidanceId("report");
  const reportTitle = typeof report.reportTitle === "string" ? report.reportTitle.trim() : "";
  if (!reportTitle) return null;

  return {
    id,
    patientId: typeof report.patientId === "string" ? report.patientId : "patient_1",
    patientName: typeof report.patientName === "string" && report.patientName.trim() ? report.patientName.trim() : "Patient",
    doctorId: typeof report.doctorId === "string" ? report.doctorId : "doctor_1",
    doctorName:
      typeof report.doctorName === "string" && report.doctorName.trim() ? report.doctorName.trim() : "Doctor",
    reportTitle,
    uploadedFileName:
      typeof report.uploadedFileName === "string" && report.uploadedFileName.trim()
        ? report.uploadedFileName.trim()
        : undefined,
    findings: Array.isArray(report.findings) ? dedupeStringList(report.findings) : [],
    assignedFaqIds: Array.isArray(report.assignedFaqIds)
      ? report.assignedFaqIds.filter((faqId) => typeof faqId === "string" && faqId.trim().length > 0)
      : [],
    createdAt: typeof report.createdAt === "number" ? report.createdAt : Date.now(),
    updatedAt: typeof report.updatedAt === "number" ? report.updatedAt : Date.now(),
  };
}
