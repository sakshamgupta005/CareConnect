import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChartNoAxesColumn } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  EmptyState,
  RecommendedFAQAccordion,
  ReportSummaryCard,
} from "../../../components/report-guidance";
import { Button } from "../../../components/ui/Button";
import {
  formatTagLabel,
  getAssignedFaqs,
  getReportById,
  loadReportGuidanceState,
  normalizeTag,
  type ReportGuidanceState,
  type ReportRecord,
} from "../../../lib/reportGuidance";

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
  const understandingMetrics = useMemo(() => {
    if (!report) {
      return { findingsTotal: 0, coveredFindings: 0, coverage: 0 };
    }

    const normalizedFindings = report.findings
      .map((finding) => normalizeTag(finding))
      .filter((finding): finding is string => finding.length > 0);
    const findingSet = new Set<string>(normalizedFindings);
    const covered = new Set<string>();

    assignedFaqs.forEach((faq) => {
      faq.tags.forEach((tag) => {
        const normalizedTag = normalizeTag(tag);
        if (findingSet.has(normalizedTag)) {
          covered.add(normalizedTag);
        }
      });
    });

    const findingsTotal = findingSet.size;
    const coveredFindings = covered.size;
    const coverage = findingsTotal > 0 ? Math.round((coveredFindings / findingsTotal) * 100) : 0;

    return { findingsTotal, coveredFindings, coverage };
  }, [report, assignedFaqs]);

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
              Your doctor has added helpful explanations related to your report.
            </p>
          </div>
        </motion.header>

        <ReportSummaryCard report={report} mode="patient" />

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-patient p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <ChartNoAxesColumn className="h-4 w-4 text-sky-600" />
            <h2 className="text-lg font-semibold text-slate-900">Report Insight Graph</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            This view updates from your report findings and assigned doctor explanations.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InsightMetric label="Findings" value={`${understandingMetrics.findingsTotal}`} />
            <InsightMetric label="Covered Findings" value={`${understandingMetrics.coveredFindings}`} />
            <InsightMetric label="Coverage" value={`${understandingMetrics.coverage}%`} />
          </div>
          <div className="mt-4 insight-track">
            <div
              className="insight-fill bg-sky-500"
              style={{ width: `${Math.max(6, understandingMetrics.coverage)}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {report.findings.map((finding) => (
              <span
                key={finding}
                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
              >
                {formatTagLabel(finding)}
              </span>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="recommended-faqs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card scroll-mt-24 p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-slate-900">Recommended Questions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tap a question to see a doctor-curated explanation.
          </p>

          <div className="mt-4">
            {assignedFaqs.length === 0 ? (
              <EmptyState
                title="No explanations have been added yet for this report."
                description="Please check again after your doctor updates your report guidance."
              />
            ) : (
              <RecommendedFAQAccordion items={assignedFaqs} />
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function InsightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-200/70 bg-white/85 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
