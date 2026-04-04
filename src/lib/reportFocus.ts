import { type ReportDetailsDto } from "./reportApi";

export type ReportFocusBar = {
  label: string;
  value: number;
  colorClassName: string;
};

export type ReportFocus = {
  key: "diabetes" | "cholesterol" | "thyroid" | "anemia" | "vitamin-d" | "general";
  label: string;
  siteHeadline: string;
  siteDescription: string;
  patientDescription: string;
  doctorDescription: string;
  quickFacts: string[];
  conversationPrompts: string[];
  tags: string[];
  bars: ReportFocusBar[];
  concernLabel: string;
  concernClassName: string;
};

type ThemeDefinition = Omit<ReportFocus, "bars" | "concernLabel" | "concernClassName"> & {
  patterns: RegExp[];
};

export function isStructuredInsight(insight: ReportDetailsDto["insights"][number]): boolean {
  const label = insight.label.trim().toLowerCase();
  const value = insight.value.trim().toLowerCase();

  if (label === "report observation") {
    return false;
  }

  if (value === "mentioned in report") {
    return false;
  }

  return /\d/.test(value);
}

const THEMES: ThemeDefinition[] = [
  {
    key: "diabetes",
    label: "Glucose and Diabetes Focus",
    siteHeadline: "Current live focus: blood sugar interpretation and diabetes-related follow-up.",
    siteDescription: "The latest analyzed report is centered on glucose trends, follow-up testing, and patient understanding around diabetes-related questions.",
    patientDescription: "Your current report focus is blood sugar understanding, diabetes-related guidance, and what to ask about repeat testing.",
    doctorDescription: "The latest report needs glucose-focused explanation, patient follow-up planning, and clearer diabetes-related communication.",
    quickFacts: [
      "Glucose-related findings should be interpreted with fasting status, symptoms, and clinical history.",
      "High glucose often leads to discussion about repeat testing, HbA1c, and lifestyle follow-up.",
      "Patient guidance works best when sugar-related numbers are explained in plain language with next steps.",
    ],
    conversationPrompts: [
      "Was this result fasting or non-fasting?",
      "Does this result suggest diabetes, prediabetes, or just a temporary rise?",
      "Should glucose or HbA1c testing be repeated?",
    ],
    tags: ["glucose", "blood sugar", "diabetes", "follow-up"],
    patterns: [/\bdiabet/i, /\bglucose\b/i, /blood sugar/i, /hba1c/i, /fasting sugar/i],
  },
  {
    key: "cholesterol",
    label: "Cholesterol and Heart Risk Focus",
    siteHeadline: "Current live focus: lipid findings, heart-risk explanation, and lifestyle follow-up.",
    siteDescription: "The latest analyzed report is emphasizing cholesterol-related explanation and follow-up around long-term cardiovascular risk.",
    patientDescription: "Your current report focus is cholesterol understanding, risk explanation, and what lifestyle follow-up to discuss.",
    doctorDescription: "The latest report needs lipid-focused explanation, risk framing, and clearer lifestyle/action guidance for the patient.",
    quickFacts: [
      "Cholesterol findings are best explained together with long-term heart-health risk, not as isolated numbers.",
      "Patients usually benefit from clear explanation about diet, exercise, and repeat testing timelines.",
      "A strong summary should separate immediate concern from long-term prevention advice.",
    ],
    conversationPrompts: [
      "Is this cholesterol level urgent or something to improve over time?",
      "What food or activity changes matter most for this finding?",
      "Should this test be repeated after lifestyle changes or treatment?",
    ],
    tags: ["cholesterol", "lipid", "heart risk", "lifestyle"],
    patterns: [/\bcholesterol\b/i, /\blipid\b/i, /\bldl\b/i, /\bhdl\b/i, /\btriglyceride/i],
  },
  {
    key: "thyroid",
    label: "Thyroid Function Focus",
    siteHeadline: "Current live focus: thyroid explanation, hormone balance, and follow-up review.",
    siteDescription: "The latest analyzed report is centered on thyroid-related interpretation and whether more endocrine follow-up is needed.",
    patientDescription: "Your current report focus is thyroid understanding, symptom review, and next-step testing questions.",
    doctorDescription: "The latest report needs thyroid-focused explanation, symptom correlation, and careful follow-up discussion.",
    quickFacts: [
      "Thyroid findings are usually understood best when matched with symptoms, medication history, and repeat testing.",
      "TSH results often need context rather than a single-number explanation.",
      "Patients benefit from simple guidance on what symptoms to mention during review.",
    ],
    conversationPrompts: [
      "Does this thyroid value explain my current symptoms?",
      "Do I need repeat thyroid testing or more detailed hormone testing?",
      "Should my medicines, supplements, or routine be reviewed with this result?",
    ],
    tags: ["thyroid", "tsh", "hormones", "follow-up"],
    patterns: [/\bthyroid\b/i, /\btsh\b/i, /thyroid stimulating hormone/i],
  },
  {
    key: "anemia",
    label: "Hemoglobin and Anemia Focus",
    siteHeadline: "Current live focus: blood health, hemoglobin explanation, and anemia-related follow-up.",
    siteDescription: "The latest analyzed report is centered on hemoglobin and anemia-style findings that need clear patient explanation.",
    patientDescription: "Your current report focus is blood health, hemoglobin understanding, and what low-value findings may mean.",
    doctorDescription: "The latest report needs blood-health explanation, anemia-related counseling, and clearer nutrition/follow-up advice.",
    quickFacts: [
      "Low hemoglobin findings are often discussed together with fatigue, diet, iron status, and repeat testing.",
      "Patients usually need plain-language explanation of whether the result is mild, moderate, or worth closer review.",
      "Nutrition and follow-up planning should be separated clearly from diagnosis language.",
    ],
    conversationPrompts: [
      "Does this low hemoglobin value suggest anemia?",
      "Should I discuss iron studies, diet, or supplements with my doctor?",
      "When should this be rechecked?",
    ],
    tags: ["hemoglobin", "anemia", "blood health", "nutrition"],
    patterns: [/\bhemoglobin\b/i, /\bhb\b/i, /\banemia\b/i, /\biron\b/i],
  },
  {
    key: "vitamin-d",
    label: "Vitamin D and Bone Health Focus",
    siteHeadline: "Current live focus: vitamin deficiency explanation and bone-health follow-up.",
    siteDescription: "The latest analyzed report is emphasizing vitamin D understanding, deficiency support, and lifestyle guidance.",
    patientDescription: "Your current report focus is vitamin D understanding, deficiency support, and what to ask about supplements or sunlight exposure.",
    doctorDescription: "The latest report needs deficiency-focused explanation and practical guidance around supplementation and follow-up.",
    quickFacts: [
      "Vitamin D findings often need practical explanation around deficiency, supplementation, and repeat testing.",
      "Patients usually understand this better when bone health and general energy/immunity context are explained simply.",
      "Follow-up guidance should clarify whether the result needs monitoring or treatment review.",
    ],
    conversationPrompts: [
      "How low is this vitamin D value compared with the target range?",
      "Should I change sunlight exposure or supplements?",
      "When should the level be checked again?",
    ],
    tags: ["vitamin d", "deficiency", "bone health", "supplements"],
    patterns: [/vitamin\s*d/i, /\bdeficiency\b/i, /\bbone\b/i, /\bsupplement/i],
  },
  {
    key: "general",
    label: "General Clinical Review",
    siteHeadline: "Current live focus: report understanding, patient explanation, and follow-up planning.",
    siteDescription: "The latest analyzed report is being used to drive patient explanation, clearer report reading, and next-step follow-up guidance across the site.",
    patientDescription: "Your current report focus is understanding the main findings, what they mean, and which questions to ask next.",
    doctorDescription: "The latest report is driving the site guidance, FAQs, and next-step communication for patient understanding.",
    quickFacts: [
      "The site is using the latest analyzed report to shape explanation content across the patient and doctor views.",
      "Findings become easier to understand when signals, FAQs, and next steps are shown together.",
      "The most useful follow-up questions are the ones tied directly to detected report findings.",
    ],
    conversationPrompts: [
      "Which result matters most in this report?",
      "What should I discuss with my doctor first?",
      "Do I need repeat testing or just explanation?",
    ],
    tags: ["analysis", "guidance", "next steps", "patient support"],
    patterns: [],
  },
];

export function deriveReportFocus(details: ReportDetailsDto | null): ReportFocus {
  if (!details) {
    const fallback = THEMES.find((theme) => theme.key === "general")!;
    return {
      ...fallback,
      bars: buildFocusBars(null),
      concernLabel: "Awaiting analysis",
      concernClassName: "border-slate-200 bg-slate-100 text-slate-700",
    };
  }

  if (details.report.status !== "analyzed") {
    const fallback = THEMES.find((theme) => theme.key === "general")!;
    return {
      ...fallback,
      bars: buildFocusBars(null),
      concernLabel: "Analysis pending",
      concernClassName: "border-slate-200 bg-slate-100 text-slate-700",
    };
  }

  const structuredInsights = details.insights.filter(isStructuredInsight);
  if (structuredInsights.length === 0) {
    const fallback = THEMES.find((theme) => theme.key === "general")!;
    return {
      ...fallback,
      bars: buildFocusBars(null),
      concernLabel: "Awaiting extracted values",
      concernClassName: "border-slate-200 bg-slate-100 text-slate-700",
    };
  }

  const corpus = [
    details.report.rawText,
    details.report.aiSummary || "",
    ...structuredInsights.map((item) => `${item.label} ${item.value} ${item.status}`),
    ...details.faqs.map((item) => `${item.question} ${item.answer}`),
    ...details.recommendations.map((item) => item.text),
  ]
    .join(" ")
    .toLowerCase();

  const selected =
    THEMES.filter((theme) => theme.key !== "general")
      .map((theme) => ({
        theme,
        score: theme.patterns.reduce((total, pattern) => total + (pattern.test(corpus) ? 1 : 0), 0),
      }))
      .sort((left, right) => right.score - left.score)[0]?.score > 0
      ? THEMES.filter((theme) => theme.key !== "general")
          .map((theme) => ({
            theme,
            score: theme.patterns.reduce((total, pattern) => total + (pattern.test(corpus) ? 1 : 0), 0),
          }))
          .sort((left, right) => right.score - left.score)[0]!.theme
      : THEMES.find((theme) => theme.key === "general")!;

  const highCount = structuredInsights.filter((item) => item.status === "high").length;
  const lowCount = structuredInsights.filter((item) => item.status === "low").length;
  const concern =
    highCount > 0
      ? {
          label: "Priority review",
          className: "border-orange-200 bg-orange-50 text-orange-700",
        }
      : lowCount > 0
        ? {
            label: "Monitor carefully",
            className: "border-amber-200 bg-amber-50 text-amber-700",
          }
        : {
            label: "Mostly stable",
            className: "border-emerald-200 bg-emerald-50 text-emerald-700",
          };

  return {
    ...selected,
    bars: buildFocusBars(details),
    concernLabel: concern.label,
    concernClassName: concern.className,
  };
}

function buildFocusBars(details: ReportDetailsDto | null): ReportFocusBar[] {
  const structuredInsights = details?.insights.filter(isStructuredInsight) ?? [];
  const insightCount = structuredInsights.length;
  const faqCount = details?.faqs.length ?? 0;
  const recommendationCount = details?.recommendations.length ?? 0;
  const attentionSignals =
    structuredInsights.filter((item) => item.status === "low" || item.status === "high").length;

  return [
    {
      label: "Signals",
      value: insightCount > 0 ? Math.min(100, Math.max(10, insightCount * 15)) : 0,
      colorClassName: "bg-sky-500",
    },
    {
      label: "Explainers",
      value: faqCount > 0 ? Math.min(100, Math.max(10, faqCount * 18)) : 0,
      colorClassName: "bg-indigo-500",
    },
    {
      label: "Actions",
      value: recommendationCount > 0 ? Math.min(100, Math.max(10, recommendationCount * 18)) : 0,
      colorClassName: "bg-emerald-500",
    },
    {
      label: "Attention",
      value:
        insightCount > 0
          ? Math.min(100, Math.max(10, Math.round((attentionSignals / insightCount) * 100)))
          : 0,
      colorClassName: "bg-orange-500",
    },
  ];
}
