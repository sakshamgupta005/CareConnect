import { type ReactNode } from "react";
import { BarChart3, CalendarDays, CircleAlert, FileBadge2, Lightbulb, MessageSquareText, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { HealthBarChart } from "../charts/HealthBarChart";
import { HealthStatusDonut } from "../charts/HealthStatusDonut";
import { extractPatientProfile } from "../../lib/patientProfile";
import { type ReportDetailsDto } from "../../lib/reportApi";
import { deriveReportFocus } from "../../lib/reportFocus";
import { FaqItem } from "./FaqItem";
import { InsightCard } from "./InsightCard";
import { PatientProfileCard } from "./PatientProfileCard";
import { RecommendationCard } from "./RecommendationCard";

type ReportResultsViewProps = {
  data: ReportDetailsDto;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  showRawTextPreview?: boolean;
};

export function ReportResultsView({
  data,
  title = "Report Results",
  subtitle = "AI-generated summary, insights, FAQs, and recommendations from this report.",
  headerAction,
  showRawTextPreview = true,
}: ReportResultsViewProps) {
  const { report, insights, faqs, recommendations } = data;
  const meaningfulInsights = getMeaningfulInsights(insights);
  const visibleFaqs = getVisibleFaqs(faqs);
  const visibleRecommendations = getVisibleRecommendations(recommendations);
  const patientProfile = extractPatientProfile({ title: report.title, rawText: report.rawText });
  const lowInsights = meaningfulInsights.filter((insight) => insight.status === "low").length;
  const highInsights = meaningfulInsights.filter((insight) => insight.status === "high").length;
  const normalInsights = meaningfulInsights.filter((insight) => insight.status === "normal").length;
  const summaryLines = buildReportSummaryLines(data);
  const reportFocus = deriveReportFocus(data);
  const focusLabel = meaningfulInsights.length > 0 ? reportFocus.label : "Manual report review";
  const focusDescription =
    meaningfulInsights.length > 0
      ? reportFocus.patientDescription
      : "Specific measurements were not reliably extracted from this file, so the original report or PDF should be used to confirm the impression, flagged values, and reference ranges.";
  const focusTags = meaningfulInsights.length > 0 ? reportFocus.tags : ["original report", "reference ranges", "follow-up"];
  const focusQuickFacts =
    meaningfulInsights.length > 0
      ? reportFocus.quickFacts
      : [
          "The original report impression and each flagged value should be reviewed directly from the source file.",
          "Reference ranges on the report matter before deciding whether a finding is truly low, normal, or high.",
          "A cleaner PDF or copied text usually gives more usable structured findings than a blurry scan.",
        ];
  const focusPrompts =
    meaningfulInsights.length > 0
      ? reportFocus.conversationPrompts
      : [
          "What is the main clinical impression written in the original report?",
          "Which values are abnormal once the source reference ranges are checked?",
          "Is repeat testing or a better-quality upload needed before acting on this report?",
        ];
  const focusConcernLabel = meaningfulInsights.length > 0 ? reportFocus.concernLabel : "Limited extraction";
  const focusConcernClassName =
    meaningfulInsights.length > 0
      ? reportFocus.concernClassName
      : "border-slate-200 bg-slate-100 text-slate-700";
  const atGlanceText = buildAtGlanceText(meaningfulInsights);
  const standoutText = buildStandoutText(meaningfulInsights);
  const understandingText = buildUnderstandingText(meaningfulInsights, visibleFaqs);
  const discussionText = buildDiscussionText(meaningfulInsights, visibleRecommendations);
  const reportSignal =
    meaningfulInsights.length === 0
      ? { label: "Limited extraction", className: "border-slate-200 bg-slate-100 text-slate-700", icon: CircleAlert }
      : highInsights > 0
      ? { label: "Needs attention", className: "border-orange-200 bg-orange-50 text-orange-700", icon: CircleAlert }
      : lowInsights > 0
        ? { label: "Monitor closely", className: "border-amber-200 bg-amber-50 text-amber-700", icon: CircleAlert }
        : { label: "Looks stable", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: ShieldCheck };

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${reportSignal.className}`}>
              <reportSignal.icon className="h-4 w-4" />
              {reportSignal.label}
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">
                <FileBadge2 className="h-3.5 w-3.5 text-secondary" />
                {report.fileName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">
                <CalendarDays className="h-3.5 w-3.5 text-secondary" />
                {formatReportDate(report.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">
                {report.fileType}
              </span>
            </div>
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReportMetric label="Status" value={report.status} />
          <ReportMetric label="Signals Found" value={`${meaningfulInsights.length}`} />
          <ReportMetric label="Explainers" value={`${visibleFaqs.length}`} />
          <ReportMetric label="Next Steps" value={`${visibleRecommendations.length}`} />
        </div>

        <div className="mt-4">
          <PatientProfileCard
            profile={patientProfile}
            title="Detected Patient Details"
            subtitle="Age, gender, and blood type are pulled from the report text whenever they are present."
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-secondary" />
              Summary
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              {summaryLines.map((line, index) => (
                <li key={`${report.id}-summary-${index}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">At a Glance</p>
            <p className="text-sm leading-relaxed text-slate-600">{atGlanceText}</p>
            <StatusRow label="Low" count={lowInsights} total={meaningfulInsights.length} colorClassName="bg-red-500" />
            <StatusRow label="Normal" count={normalInsights} total={meaningfulInsights.length} colorClassName="bg-emerald-500" />
            <StatusRow label="High" count={highInsights} total={meaningfulInsights.length} colorClassName="bg-orange-500" />
            {report.filePath ? (
              <a
                href={report.filePath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-medium text-secondary hover:underline"
              >
                Open uploaded PDF
              </a>
            ) : (
              <p className="text-xs text-slate-500">This report does not have a saved PDF link yet.</p>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${focusConcernClassName}`}>
              <ShieldCheck className="h-4 w-4" />
              {focusConcernLabel}
            </div>
            <p className="mt-3 text-base font-semibold text-slate-900">{focusLabel}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{focusDescription}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {focusTags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <HealthStatusDonut insights={meaningfulInsights} />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ReadingCard
            icon={<CircleAlert className="h-4 w-4 text-orange-600" />}
            title="What stands out"
            text={standoutText}
          />
          <ReadingCard
            icon={<MessageSquareText className="h-4 w-4 text-sky-600" />}
            title="What to understand"
            text={understandingText}
          />
          <ReadingCard
            icon={<Stethoscope className="h-4 w-4 text-emerald-600" />}
            title="What to discuss next"
            text={discussionText}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <InsightListCard
            title="Condition-specific notes"
            items={focusQuickFacts}
            toneClassName="border-sky-200 bg-sky-50/50"
          />
          <InsightListCard
            title="Useful questions for this report"
            items={focusPrompts}
            toneClassName="border-emerald-200 bg-emerald-50/50"
          />
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BarChart3 className="h-4 w-4 text-secondary" />
          Report Visualizations
        </p>
        <p className="mt-1 text-sm text-slate-600">
          These charts use the analyzed values and status labels saved for this report.
        </p>
        <div className="mt-4">
          <HealthBarChart insights={meaningfulInsights} />
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">Key Insights</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {meaningfulInsights.length > 0 ? (
            meaningfulInsights.map((insight) => (
              <div key={insight.id}>
                <InsightCard insight={insight} />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No structured lab findings were extracted from this report yet.</p>
          )}
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MessageSquareText className="h-4 w-4 text-secondary" />
          FAQs
        </p>
        <div className="mt-4 space-y-3">
          {visibleFaqs.length > 0 ? (
            visibleFaqs.map((item) => (
              <div key={item.id}>
                <FaqItem item={item} />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No tailored explanation items are available for this report yet.</p>
          )}
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Lightbulb className="h-4 w-4 text-secondary" />
          Recommendations
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {visibleRecommendations.length > 0 ? (
            visibleRecommendations.map((item) => (
              <div key={item.id}>
                <RecommendationCard item={item} />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No tailored follow-up recommendations are available for this report yet.</p>
          )}
        </div>
      </section>

      {showRawTextPreview ? (
        <section className="card p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-slate-900">Raw Report Text</h3>
          <p className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {report.rawText}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ReadingCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="inline-flex rounded-lg bg-slate-50 p-2">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function InsightListCard({
  title,
  items,
  toneClassName,
}: {
  title: string;
  items: string[];
  toneClassName: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${toneClassName}`}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusRow({
  label,
  count,
  total,
  colorClassName,
}: {
  label: string;
  count: number;
  total: number;
  colorClassName: string;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>
          {count} ({percent}%)
        </span>
      </div>
      <div className="insight-track">
        <div className={`insight-fill ${colorClassName}`} style={{ width: total > 0 ? `${Math.max(6, percent)}%` : "0%" }} />
      </div>
    </div>
  );
}

function buildReportSummaryLines(data: ReportDetailsDto): string[] {
  const { report } = data;
  const insights = getMeaningfulInsights(data.insights);
  const faqs = getVisibleFaqs(data.faqs);
  const recommendations = getVisibleRecommendations(data.recommendations);
  const savedSummary = typeof report.aiSummary === "string" ? report.aiSummary.trim() : "";
  const fallbackSummary =
    "the report text was saved successfully. specific lab values were not clearly detected, so please review the full report with your doctor.";

  const cleanedLines = savedSummary
    ? savedSummary
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  const hasUsefulSavedSummary =
    Boolean(savedSummary) &&
    savedSummary.toLowerCase() !== fallbackSummary &&
    !isWeakSavedSummary(cleanedLines.length > 0 ? cleanedLines : [savedSummary]);

  if (cleanedLines.length > 1 && hasUsefulSavedSummary) {
    return cleanedLines;
  }

  if (insights.length === 0) {
    const baseLines = [
      "Specific values were not reliably extracted from this file.",
      "Use the original report or PDF to confirm the impression, flagged values, and reference ranges.",
      recommendations[0]?.text || "During follow-up, confirm the main clinical impression and whether repeat testing or a cleaner upload is needed.",
    ];

    return hasUsefulSavedSummary
      ? [savedSummary, ...baseLines]
      : baseLines;
  }

  const topLabels = prioritizeInsights(insights).slice(0, 3).map((insight) => formatInsightSummary(insight));
  const generatedLines = [
    `Key extracted findings: ${topLabels.join(", ")}.`,
    buildUnderstandingText(insights, faqs),
    buildDiscussionText(insights, recommendations),
  ];

  return hasUsefulSavedSummary
    ? [savedSummary, ...generatedLines]
    : generatedLines;
}

function getMeaningfulInsights(insights: ReportDetailsDto["insights"]): ReportDetailsDto["insights"] {
  return insights.filter((insight) => !isPlaceholderInsight(insight));
}

function getVisibleFaqs(faqs: ReportDetailsDto["faqs"]): ReportDetailsDto["faqs"] {
  return faqs.filter((item) => !isPlaceholderFaq(item));
}

function getVisibleRecommendations(
  recommendations: ReportDetailsDto["recommendations"],
): ReportDetailsDto["recommendations"] {
  return recommendations.filter((item) => !isGenericRecommendation(item.text));
}

function isPlaceholderInsight(insight: ReportDetailsDto["insights"][number]): boolean {
  return insight.label.trim().toLowerCase() === "report observation";
}

function isPlaceholderFaq(item: ReportDetailsDto["faqs"][number]): boolean {
  const content = `${item.question} ${item.answer}`.toLowerCase();
  return content.includes("report observation") || content.includes("identified in your report text");
}

function isGenericRecommendation(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return (
    normalized.includes("continue regular follow-up and keep a copy of this report") ||
    normalized.includes("review the findings and decide follow-up with your doctor") ||
    normalized.includes("use the findings below to ask your doctor which values matter most and what follow-up is needed")
  );
}

function prioritizeInsights(insights: ReportDetailsDto["insights"]): ReportDetailsDto["insights"] {
  return [...insights].sort((left, right) => getInsightPriority(right) - getInsightPriority(left));
}

function getInsightPriority(insight: ReportDetailsDto["insights"][number]): number {
  if (insight.status === "high") return 3;
  if (insight.status === "low") return 2;
  return 1;
}

function buildAtGlanceText(insights: ReportDetailsDto["insights"]): string {
  const flagged = prioritizeInsights(insights).filter((insight) => insight.status !== "normal");

  if (flagged.length > 0) {
    const leadItems = flagged.slice(0, 2).map((insight) => formatInsightSummary(insight)).join(" and ");
    return `${flagged.length} finding${flagged.length === 1 ? "" : "s"} need closer review, led by ${leadItems}.`;
  }

  if (insights.length > 0) {
    const leadItems = insights.slice(0, 2).map((insight) => formatInsightSummary(insight)).join(" and ");
    return `No out-of-range extracted values were flagged. Main structured results: ${leadItems}.`;
  }

  return "No specific measurements were reliably extracted from this file, so the original report remains the main source for review.";
}

function buildStandoutText(insights: ReportDetailsDto["insights"]): string {
  const flagged = prioritizeInsights(insights).filter((insight) => insight.status !== "normal");

  if (flagged.length > 0) {
    return flagged.slice(0, 2).map((insight) => formatInsightSentence(insight)).join(" ");
  }

  if (insights.length > 0) {
    const leadItems = insights.slice(0, 2).map((insight) => formatInsightSummary(insight)).join(" and ");
    return `No clearly abnormal extracted value stands out. The available structured results are ${leadItems}.`;
  }

  return "There is no reliable standout result yet because the analyzer did not extract specific lab measurements from this file.";
}

function buildUnderstandingText(
  insights: ReportDetailsDto["insights"],
  faqs: ReportDetailsDto["faqs"],
): string {
  const leadFaq = faqs[0];
  if (leadFaq) {
    return extractLeadSentence(leadFaq.answer);
  }

  const primaryInsight = prioritizeInsights(insights)[0];
  if (!primaryInsight) {
    return "The key task is to confirm the report impression, abnormal values, and reference ranges directly from the original document.";
  }

  if (primaryInsight.value === "Mentioned in report") {
    return `Confirm whether ${formatInsightLabel(primaryInsight)} is documented as a final impression, a possible concern, or a follow-up note in the original report.`;
  }

  const rangeText =
    primaryInsight.status === "low"
      ? "below"
      : primaryInsight.status === "high"
        ? "above"
        : "within";

  return `${formatInsightLabel(primaryInsight)} is ${rangeText} the extracted range at ${primaryInsight.value}, and it should be interpreted with symptoms, medicines, and prior results.`;
}

function buildDiscussionText(
  insights: ReportDetailsDto["insights"],
  recommendations: ReportDetailsDto["recommendations"],
): string {
  const primaryInsight = prioritizeInsights(insights).find((insight) => insight.status !== "normal");
  if (primaryInsight) {
    return buildDiscussionPrompt(primaryInsight);
  }

  if (recommendations[0]?.text) {
    return recommendations[0].text;
  }

  if (insights.length > 0) {
    return "Discuss which extracted result matters most, whether it changes management, and when the next review or repeat test is needed.";
  }

  return "Review the original report together and confirm the main impression, any flagged values, and whether repeat testing or better text extraction is needed.";
}

function buildDiscussionPrompt(insight: ReportDetailsDto["insights"][number]): string {
  const label = insight.label.toLowerCase();

  if (label.includes("hemoglobin") || label.includes("anemia")) {
    return "Discuss whether this blood finding suggests anemia, whether iron or related tests are needed, and when the blood count should be repeated.";
  }

  if (label.includes("vitamin d")) {
    return "Discuss whether supplementation is needed, what dose or exposure plan makes sense, and when the level should be checked again.";
  }

  if (label.includes("glucose") || label.includes("diabetes")) {
    return "Discuss whether this glucose-related finding was fasting, whether HbA1c or repeat sugar testing is needed, and what follow-up timeline fits.";
  }

  if (label.includes("cholesterol")) {
    return "Discuss whether this lipid finding changes long-term risk, whether lifestyle measures are enough, and when the profile should be repeated.";
  }

  if (label.includes("tsh") || label.includes("thyroid")) {
    return "Discuss how this thyroid finding fits symptoms or current treatment and whether repeat thyroid testing is needed.";
  }

  return "Discuss how this flagged result fits symptoms, medicines, and prior results, whether it changes management, and when it should be rechecked.";
}

function formatInsightSummary(insight: ReportDetailsDto["insights"][number]): string {
  if (insight.value === "Mentioned in report") {
    return formatInsightLabel(insight);
  }

  return `${formatInsightLabel(insight)} (${insight.value})`;
}

function formatInsightSentence(insight: ReportDetailsDto["insights"][number]): string {
  if (insight.value === "Mentioned in report") {
    return `${formatInsightLabel(insight)} is mentioned in the report and should be confirmed in the original wording.`;
  }

  const rangeText =
    insight.status === "low"
      ? "below range"
      : insight.status === "high"
        ? "above range"
        : "within range";

  return `${formatInsightLabel(insight)} is ${rangeText} at ${insight.value}.`;
}

function formatInsightLabel(insight: ReportDetailsDto["insights"][number]): string {
  return insight.label.replace(/\s+note$/i, "");
}

function extractLeadSentence(text: string): string {
  const cleaned = text.trim();
  if (!cleaned) {
    return "";
  }

  const match = cleaned.match(/.+?[.!?](?:\s|$)/);
  return match ? match[0].trim() : cleaned;
}

function isWeakSavedSummary(lines: string[]): boolean {
  const content = lines.join(" ").toLowerCase();
  return (
    content.includes("report text was reviewed and saved successfully") ||
    content.includes("specific lab values were not clearly detected") ||
    content.includes("use the full report text and any attached pdf with your doctor") ||
    content.includes("if this report includes scanned values")
  );
}

function formatReportDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
