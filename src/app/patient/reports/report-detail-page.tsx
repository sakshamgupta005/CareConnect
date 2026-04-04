import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChartNoAxesColumn, CircleAlert, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  EmptyState,
  RecommendedFAQAccordion,
  ReportSummaryCard,
} from "../../../components/report-guidance";
import { Button } from "../../../components/ui/Button";
import {
  getAssignedFaqs,
  getReportById,
  loadReportGuidanceState,
  type ReportGuidanceState,
  type ReportRecord,
} from "../../../lib/reportGuidance";
import { extractNumericValue } from "../../../lib/reportAnalysis";

export default function PatientReportDetailsPage() {
  const { reportId = "" } = useParams();
  const [state, setState] = useState<ReportGuidanceState>({ faqs: [], reports: [] });
  const [report, setReport] = useState<ReportRecord | null>(null);

  useEffect(() => {
    const loaded = loadReportGuidanceState();
    setState(loaded);
    setReport(getReportById(loaded, reportId));
  }, [reportId]);

  const assignedFaqs = useMemo(() => {
    if (!report) return [];
    return getAssignedFaqs(report, state.faqs);
  }, [report, state.faqs]);

  const analysis = report?.aiAnalysis;
  const faqItems = useMemo(() => {
    if (analysis && analysis.faqs.length > 0) {
      return analysis.faqs.map((faq, index) => ({
        id: `ai-faq-${index}-${faq.question.slice(0, 24)}`,
        question: faq.question,
        answer: faq.answer,
      }));
    }

    return assignedFaqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
    }));
  }, [analysis, assignedFaqs]);

  const chartData = useMemo(() => {
    if (!analysis || analysis.keyFindings.length === 0) {
      return [];
    }

    const numericValues = analysis.keyFindings
      .map((finding) => extractNumericValue(finding.value))
      .filter((value): value is number => value !== null);
    const maxNumericValue = numericValues.length > 0 ? Math.max(...numericValues) : null;

    return analysis.keyFindings.map((finding) => {
      const numericValue = extractNumericValue(finding.value);
      const percent =
        numericValue !== null && maxNumericValue && maxNumericValue > 0
          ? Math.max(12, Math.round((numericValue / maxNumericValue) * 100))
          : finding.status === "low"
            ? 35
            : finding.status === "high"
              ? 70
              : 52;

      return {
        ...finding,
        percent,
      };
    });
  }, [analysis]);

  if (!report) {
    return (
      <div className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <EmptyState
            title="Report unavailable"
            description="This report could not be found. Contact your care team for support."
            action={
              <Link to="/patient">
                <Button>Go to Patient Dashboard</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3"
        >
          <Link
            to="/patient"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Understand Your Report</h1>
            <p className="mt-1 text-sm text-slate-600">
              Your uploaded report is converted into clear findings, helpful FAQs, and actionable guidance.
            </p>
          </div>
        </motion.header>

        <ReportSummaryCard report={report} mode="patient" />

        {analysis ? (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-patient p-6 sm:p-8"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{analysis.summary}</p>
          </motion.section>
        ) : null}

        {report.analysisError ? (
          <section className="card p-5">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-700">
              <CircleAlert className="h-4 w-4" />
              Report uploaded, but AI analysis failed.
            </p>
            <p className="mt-1 text-sm text-slate-600">{report.analysisError}</p>
          </section>
        ) : null}

        {!analysis && !report.analysisError && report.uploadedFileName ? (
          <section className="card p-5">
            <p className="text-sm font-medium text-secondary">Analyzing your report...</p>
          </section>
        ) : null}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card scroll-mt-24 p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-slate-900">Key Findings</h2>
          <p className="mt-1 text-sm text-slate-600">Values and status are extracted directly from your uploaded report.</p>

          {analysis && analysis.keyFindings.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {analysis.keyFindings.map((finding, index) => (
                <article key={`${finding.name}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{finding.name}</p>
                      <p className="mt-1 text-xs text-slate-500">Value: {finding.value}</p>
                    </div>
                    <StatusPill status={finding.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{finding.explanation}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No key findings were generated yet.</p>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <ChartNoAxesColumn className="h-4 w-4 text-secondary" />
            <h2 className="text-lg font-semibold text-slate-900">Report Insight Graph</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Bar height is based on detected numeric values in your report.
          </p>

          {chartData.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <div className="flex min-w-[520px] items-end gap-4">
                {chartData.map((finding, index) => (
                  <div key={`${finding.name}-bar-${index}`} className="flex flex-1 flex-col items-center gap-2">
                    <p className="text-xs font-semibold text-slate-700">{finding.value}</p>
                    <div className="flex h-44 w-full items-end rounded-lg bg-slate-100 p-2">
                      <div
                        className={`w-full rounded-md ${
                          finding.status === "low"
                            ? "bg-red-500"
                            : finding.status === "high"
                              ? "bg-orange-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ height: `${finding.percent}%` }}
                      />
                    </div>
                    <p className="text-center text-[11px] font-medium text-slate-600">{finding.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No graph data available yet.</p>
          )}
        </motion.section>

        <motion.section
          id="recommended-faqs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card scroll-mt-24 p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-slate-900">Recommended Questions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tap a question to see a clear explanation generated from your report.
          </p>

          <div className="mt-4">
            {faqItems.length === 0 ? (
              <EmptyState
                title="No explanations have been added yet for this report."
                description="Please check again after your report analysis completes."
              />
            ) : (
              <RecommendedFAQAccordion items={faqItems} />
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-slate-900">Recommendations</h2>
          <p className="mt-1 text-sm text-slate-600">
            Suggestions listed here are based on report content only.
          </p>

          {analysis && analysis.recommendations.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {analysis.recommendations.map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No recommendations available yet.</p>
          )}
        </motion.section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "low" | "normal" | "high" }) {
  const classes =
    status === "low"
      ? "border-red-200 bg-red-50 text-red-700"
      : status === "high"
        ? "border-orange-200 bg-orange-50 text-orange-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${classes}`}>
      {status}
    </span>
  );
}

