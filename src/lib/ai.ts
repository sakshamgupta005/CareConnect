export type HealthInsight = {
  type: string;
  label: string;
  value: string;
  status: "low" | "normal" | "high";
};

export type HealthFaq = {
  question: string;
  answer: string;
};

export type HealthRecommendation = {
  category: string;
  text: string;
};

export type HealthReportAnalysis = {
  summary: string;
  insights: HealthInsight[];
  faqs: HealthFaq[];
  recommendations: HealthRecommendation[];
};

type MetricConfig = {
  type: string;
  label: string;
  patterns: RegExp[];
  low: number;
  high: number;
  unit?: string;
  lowHint: string;
  highHint: string;
  normalHint: string;
};

const METRICS: MetricConfig[] = [
  {
    type: "blood",
    label: "Hemoglobin",
    patterns: [/hemoglobin[^0-9-]{0,20}(-?\d+(?:\.\d+)?)/i, /\bhb[^0-9-]{0,10}(-?\d+(?:\.\d+)?)/i],
    low: 12,
    high: 17.5,
    unit: "g/dL",
    lowHint: "may indicate anemia or low oxygen-carrying capacity",
    highHint: "can be seen with dehydration or other blood concentration changes",
    normalHint: "is within the expected range",
  },
  {
    type: "vitamin",
    label: "Vitamin D",
    patterns: [/vitamin\s*d[^0-9-]{0,24}(-?\d+(?:\.\d+)?)/i],
    low: 20,
    high: 60,
    unit: "ng/mL",
    lowHint: "suggests deficiency and may affect bone strength and immunity",
    highHint: "is above the usual target and may need review of supplements",
    normalHint: "is within the usual target range",
  },
  {
    type: "lipid",
    label: "Total Cholesterol",
    patterns: [/cholesterol[^0-9-]{0,24}(-?\d+(?:\.\d+)?)/i],
    low: 120,
    high: 200,
    unit: "mg/dL",
    lowHint: "is below the common range and may need nutritional review",
    highHint: "is elevated and may increase cardiovascular risk over time",
    normalHint: "is in a commonly acceptable range",
  },
  {
    type: "sugar",
    label: "Glucose",
    patterns: [/\bglucose[^0-9-]{0,24}(-?\d+(?:\.\d+)?)/i, /\bblood sugar[^0-9-]{0,24}(-?\d+(?:\.\d+)?)/i],
    low: 70,
    high: 100,
    unit: "mg/dL",
    lowHint: "is below the usual fasting range",
    highHint: "is above the usual fasting range",
    normalHint: "is within the usual fasting range",
  },
  {
    type: "thyroid",
    label: "TSH",
    patterns: [/\btsh[^0-9-]{0,20}(-?\d+(?:\.\d+)?)/i, /thyroid stimulating hormone[^0-9-]{0,20}(-?\d+(?:\.\d+)?)/i],
    low: 0.4,
    high: 4.5,
    unit: "mIU/L",
    lowHint: "is lower than expected and may reflect thyroid overactivity",
    highHint: "is higher than expected and may reflect thyroid underactivity",
    normalHint: "is in the expected thyroid range",
  },
];

const KEYWORD_INSIGHTS: Array<{
  keyword: RegExp;
  insight: HealthInsight;
}> = [
  {
    keyword: /anemia/i,
    insight: {
      type: "blood",
      label: "Anemia Note",
      value: "Mentioned in report",
      status: "low",
    },
  },
  {
    keyword: /vitamin\s*d\s*(deficiency|low)/i,
    insight: {
      type: "vitamin",
      label: "Vitamin D Deficiency Note",
      value: "Mentioned in report",
      status: "low",
    },
  },
  {
    keyword: /(high|elevated)\s+cholesterol/i,
    insight: {
      type: "lipid",
      label: "Cholesterol Note",
      value: "Mentioned in report",
      status: "high",
    },
  },
];

export function analyzeHealthReport(rawText: string): HealthReportAnalysis {
  const cleanText = normalizeText(rawText);
  const insights = extractInsights(cleanText);
  const summary = buildSummary(insights, cleanText);
  const faqs = buildFaqs(insights);
  const recommendations = buildRecommendations(insights);

  return {
    summary,
    insights,
    faqs,
    recommendations,
  };
}

function normalizeText(input: string): string {
  return input.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

function extractInsights(text: string): HealthInsight[] {
  const insights: HealthInsight[] = [];

  for (const metric of METRICS) {
    const matchValue = findFirstNumericValue(text, metric.patterns);
    if (matchValue === null) {
      continue;
    }

    const status = classifyStatus(matchValue, metric.low, metric.high);
    const value = metric.unit ? `${trimNumeric(matchValue)} ${metric.unit}` : trimNumeric(matchValue);

    insights.push({
      type: metric.type,
      label: metric.label,
      value,
      status,
    });
  }

  if (insights.length === 0) {
    for (const keyword of KEYWORD_INSIGHTS) {
      if (keyword.keyword.test(text)) {
        insights.push(keyword.insight);
      }
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: "general",
      label: "Report Observation",
      value: "Text reviewed",
      status: "normal",
    });
  }

  return dedupeInsights(insights).slice(0, 8);
}

function findFirstNumericValue(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const raw = match?.[1];
    if (!raw) {
      continue;
    }

    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function classifyStatus(value: number, low: number, high: number): "low" | "normal" | "high" {
  if (value < low) return "low";
  if (value > high) return "high";
  return "normal";
}

function trimNumeric(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, "");
}

function buildSummary(insights: HealthInsight[], text: string): string {
  const low = insights.filter((item) => item.status === "low").length;
  const high = insights.filter((item) => item.status === "high").length;
  const normal = insights.filter((item) => item.status === "normal").length;

  if (insights.length === 1 && insights[0].label === "Report Observation") {
    return "The report text was saved successfully. Specific lab values were not clearly detected, so please review the full report with your doctor.";
  }

  const leadLabels = insights
    .slice(0, 3)
    .map((item) => item.label)
    .join(", ");

  const rangeSummary = `${low} low, ${normal} normal, ${high} high`;

  const mentionFollowUp = /follow[-\s]?up|repeat test|retest|consult/i.test(text)
    ? " A follow-up note is also mentioned in the report."
    : "";

  return `This report highlights ${leadLabels}. Overall status distribution is ${rangeSummary}.${mentionFollowUp}`.trim();
}

function buildFaqs(insights: HealthInsight[]): HealthFaq[] {
  return insights.slice(0, 5).map((insight) => ({
    question:
      insight.status === "normal"
        ? `Is my ${insight.label} value okay?`
        : `What does ${insight.status} ${insight.label.toLowerCase()} mean?`,
    answer: buildInsightExplanation(insight),
  }));
}

function buildRecommendations(insights: HealthInsight[]): HealthRecommendation[] {
  const items: HealthRecommendation[] = [];

  for (const insight of insights) {
    const label = insight.label.toLowerCase();

    if (insight.status === "low") {
      if (label.includes("hemoglobin") || label.includes("anemia")) {
        items.push({
          category: "Nutrition",
          text: "Discuss iron-rich meal options and any required supplements with your doctor.",
        });
      } else if (label.includes("vitamin d")) {
        items.push({
          category: "Lifestyle",
          text: "Ask your doctor about safe sunlight exposure and vitamin D supplementation.",
        });
      } else {
        items.push({
          category: "Follow-up",
          text: `Plan follow-up testing to monitor low ${insight.label.toLowerCase()}.`,
        });
      }
    }

    if (insight.status === "high") {
      if (label.includes("cholesterol")) {
        items.push({
          category: "Lifestyle",
          text: "Review dietary fat intake and exercise goals with your care team.",
        });
      } else if (label.includes("glucose")) {
        items.push({
          category: "Follow-up",
          text: "Discuss blood sugar monitoring and repeat testing with your doctor.",
        });
      } else {
        items.push({
          category: "Follow-up",
          text: `Schedule a review visit for elevated ${insight.label.toLowerCase()}.`,
        });
      }
    }
  }

  if (items.length === 0) {
    items.push({
      category: "General",
      text: "Continue regular follow-up and keep a copy of this report for your next consultation.",
    });
  }

  return dedupeRecommendations(items).slice(0, 6);
}

function buildInsightExplanation(insight: HealthInsight): string {
  const metric = METRICS.find((item) => item.label === insight.label);
  if (!metric) {
    return `This finding was identified in your report text. Please review it with your doctor for exact clinical interpretation.`;
  }

  if (insight.status === "low") {
    return `${insight.label} is lower than the expected range and ${metric.lowHint}.`;
  }
  if (insight.status === "high") {
    return `${insight.label} is higher than the expected range and ${metric.highHint}.`;
  }

  return `${insight.label} ${metric.normalHint}.`;
}

function dedupeInsights(items: HealthInsight[]): HealthInsight[] {
  const map = new Map<string, HealthInsight>();
  for (const item of items) {
    const key = `${item.type}-${item.label}`.toLowerCase();
    if (!map.has(key)) {
      map.set(key, item);
    }
  }
  return [...map.values()];
}

function dedupeRecommendations(items: HealthRecommendation[]): HealthRecommendation[] {
  const seen = new Set<string>();
  const deduped: HealthRecommendation[] = [];

  for (const item of items) {
    const key = `${item.category}|${item.text}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped;
}

