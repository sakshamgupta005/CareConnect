import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, UploadCloud } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  AssignFAQPanel,
  EmptyState,
  ReportFindingsEditor,
  ReportSummaryCard,
} from "../../../components/report-guidance";
import { Button } from "../../../components/ui/Button";
import {
  formatTagLabel,
  getAssignedFaqs,
  getReportById,
  loadReportGuidanceState,
  normalizeTag,
  saveReportGuidanceState,
  type ReportGuidanceState,
  type ReportRecord,
} from "../../../lib/reportGuidance";

type FocusSection = "upload" | "assign" | null;

export default function DoctorReportDetailsPage() {
  const { reportId = "" } = useParams();
  const location = useLocation();
  const [state, setState] = useState<ReportGuidanceState>({ faqs: [], reports: [] });
  const [draftReport, setDraftReport] = useState<ReportRecord | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [focusSection, setFocusSection] = useState<FocusSection>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setState(loadReportGuidanceState());
    setIsReady(true);
  }, []);

  useEffect(() => {
    const report = getReportById(state, reportId);
    setDraftReport(
      report
        ? {
            ...report,
            findings: [...report.findings],
            assignedFaqIds: [...report.assignedFaqIds],
          }
        : null,
    );
  }, [state, reportId]);

  useEffect(() => {
    const target = location.hash === "#report-upload" ? "upload" : location.hash === "#assign-faqs" ? "assign" : null;
    if (!target) {
      setFocusSection(null);
      return;
    }

    setFocusSection(target);

    const sectionId = location.hash.replace("#", "");
    const scrollTimer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 70);

    const clearTimer = window.setTimeout(() => {
      setFocusSection((current) => (current === target ? null : current));
    }, 2200);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [location.hash]);

  const assignedFaqs = useMemo(() => {
    if (!draftReport) return [];
    return getAssignedFaqs(draftReport, state.faqs);
  }, [draftReport, state.faqs]);
  const findingsCoverage = useMemo(() => {
    if (!draftReport) {
      return { covered: 0, total: 0, coverage: 0, missing: [] as string[] };
    }

    const normalizedFindings = draftReport.findings
      .map((finding) => normalizeTag(finding))
      .filter((finding): finding is string => finding.length > 0);
    const findingSet = new Set<string>(normalizedFindings);
    const coveredSet = new Set<string>();

    assignedFaqs.forEach((faq) => {
      faq.tags.forEach((tag) => {
        const normalizedTag = normalizeTag(tag);
        if (findingSet.has(normalizedTag)) {
          coveredSet.add(normalizedTag);
        }
      });
    });

    const total = findingSet.size;
    const covered = coveredSet.size;
    const coverage = total > 0 ? Math.round((covered / total) * 100) : 0;
    const missing = [...findingSet].filter((finding) => !coveredSet.has(finding)).slice(0, 3);

    return { covered, total, coverage, missing };
  }, [draftReport, assignedFaqs]);
  const libraryUtilization = state.faqs.length > 0 ? Math.round((assignedFaqs.length / state.faqs.length) * 100) : 0;

  const handleReportUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draftReport) return;

    setDraftReport({
      ...draftReport,
      uploadedFileName: file.name,
    });

    event.target.value = "";
  };

  const handleSaveChanges = () => {
    if (!draftReport) return;

    const nextReport = { ...draftReport, updatedAt: Date.now() };

    const nextState = {
      ...state,
      reports: state.reports.map((report) => (report.id === nextReport.id ? nextReport : report)),
    };

    setState(nextState);
    if (isReady) {
      saveReportGuidanceState(nextState);
    }

    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1800);
  };

  if (!draftReport) {
    return (
      <div className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <EmptyState
            title="Report not found"
            description="This report does not exist yet. Open the doctor dashboard to continue."
            action={
              <Link to="/doctor">
                <Button>Go to Doctor Dashboard</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3"
        >
          <Link
            to="/doctor"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Doctor Dashboard
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">Report FAQ Assignment</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage findings and assign doctor-curated explanation FAQs to this report.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/doctor/faqs">
                <Button variant="outline">Manage FAQ Library</Button>
              </Link>
              <Link to={`/patient/reports/${draftReport.id}`}>
                <Button variant="secondary">Preview Patient View</Button>
              </Link>
            </div>
          </div>
        </motion.header>

        <ReportSummaryCard report={draftReport} mode="doctor" />

        <section className="grid gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-doctor p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-slate-900">Guidance Progress</h2>
            <p className="mt-1 text-sm text-slate-600">
              These meters update automatically from findings and assigned FAQ data.
            </p>

            <div className="mt-5 space-y-4">
              <ProgressRow
                label="Findings Covered"
                value={`${findingsCoverage.covered}/${findingsCoverage.total || 0}`}
                percent={findingsCoverage.coverage}
                tone={findingsCoverage.coverage >= 70 ? "good" : findingsCoverage.coverage >= 40 ? "warn" : "base"}
              />
              <ProgressRow
                label="Assigned FAQ Depth"
                value={`${assignedFaqs.length}`}
                percent={Math.min(100, assignedFaqs.length * 18)}
                tone="base"
              />
              <ProgressRow
                label="FAQ Library Utilization"
                value={`${libraryUtilization}%`}
                percent={libraryUtilization}
                tone="good"
              />
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-slate-900">Open Findings</h2>
            <p className="mt-1 text-sm text-slate-600">
              Findings below are not yet matched by assigned FAQ tags.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {findingsCoverage.missing.length === 0 ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  All findings are currently covered.
                </span>
              ) : (
                findingsCoverage.missing.map((finding) => (
                  <span
                    key={finding}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                  >
                    {formatTagLabel(finding)}
                  </span>
                ))
              )}
            </div>
          </motion.article>
        </section>

        <motion.section
          id="report-upload"
          animate={focusSection === "upload" ? { scale: [1, 1.01, 1] } : { scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={`card scroll-mt-24 p-6 transition-all duration-700 sm:p-8 ${
            focusSection === "upload"
              ? "ring-2 ring-secondary/35 ring-offset-2 ring-offset-slate-50 shadow-[0_18px_46px_rgba(0,106,97,0.18)]"
              : ""
          }`}
        >
          <h2 className="text-lg font-semibold text-slate-900">Report Upload</h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload a report file name placeholder for this workflow. You can replace it anytime.
          </p>

          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100">
            <UploadCloud className="h-5 w-5 text-secondary" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">Upload report file</p>
              <p className="text-xs text-slate-500">Accepted for placeholder: .txt, .md, .csv, .pdf</p>
            </div>
            <input type="file" accept=".txt,.md,.csv,.pdf" onChange={handleReportUpload} className="hidden" />
          </label>

          <p className="mt-3 text-sm text-slate-600">
            Current file:{" "}
            <span className="font-medium text-slate-900">{draftReport.uploadedFileName || "No file uploaded yet"}</span>
          </p>
        </motion.section>

        <ReportFindingsEditor
          findings={draftReport.findings}
          onChange={(nextFindings) => setDraftReport({ ...draftReport, findings: nextFindings })}
        />

        <motion.div
          id="assign-faqs"
          className="scroll-mt-24"
          animate={focusSection === "assign" ? { scale: [1, 1.01, 1] } : { scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <AssignFAQPanel
            faqs={state.faqs}
            findings={draftReport.findings}
            assignedFaqIds={draftReport.assignedFaqIds}
            onChangeAssignedFaqIds={(ids) => setDraftReport({ ...draftReport, assignedFaqIds: ids })}
          />
        </motion.div>

        <section className="card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Save Report Guidance</h2>
              <p className="mt-1 text-sm text-slate-600">
                {assignedFaqs.length} FAQ explanation{assignedFaqs.length === 1 ? "" : "s"} currently assigned.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saveState === "saved" ? (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              ) : null}
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent: number;
  tone: "base" | "good" | "warn";
}) {
  const colorClass = tone === "good" ? "bg-emerald-500" : tone === "warn" ? "bg-amber-500" : "bg-secondary";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="insight-track">
        <div className={`insight-fill ${colorClass}`} style={{ width: `${Math.max(6, percent)}%` }} />
      </div>
    </div>
  );
}
