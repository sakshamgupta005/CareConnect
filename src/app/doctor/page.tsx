import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ClipboardList, Database, FileSearch, FileUp, Hash, Mail, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FocusBars } from "../../components/report-data";
import { Button } from "../../components/ui/Button";
import { loadAuthSession } from "../../lib/auth";
import { listContactSubmissions, type ContactSubmissionRecord } from "../../lib/contactApi";
import { buildDoctorPublicIdFromUsername } from "../../lib/doctorTeam";
import { deriveReportFocus, isStructuredInsight } from "../../lib/reportFocus";
import { getReportById, listReports, type ReportDetailsDto, type ReportListItemDto } from "../../lib/reportApi";

type FocusSection = "upload" | "faq" | null;

export default function DoctorDashboard() {
  const location = useLocation();
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmissionRecord[]>([]);
  const [previewDetails, setPreviewDetails] = useState<ReportDetailsDto | null>(null);
  const [focusSection, setFocusSection] = useState<FocusSection>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [loadedReports, loadedSubmissions] = await Promise.all([listReports(), listContactSubmissions()]);
        if (cancelled) return;
        const sortedReports = [...loadedReports].sort((left, right) => {
          const leftTime = Date.parse(left.createdAt);
          const rightTime = Date.parse(right.createdAt);

          if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
            return 0;
          }
          if (Number.isNaN(leftTime)) {
            return 1;
          }
          if (Number.isNaN(rightTime)) {
            return -1;
          }

          return rightTime - leftTime;
        });

        setReports(sortedReports);
        setSubmissions(loadedSubmissions);

        const previewId = sortedReports[0]?.id;
        if (previewId) {
          const details = await getReportById(previewId);
          if (cancelled) return;
          setPreviewDetails(details);
        } else {
          setPreviewDetails(null);
        }
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load dashboard data.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const target =
      location.hash === "#doctor-report-upload"
        ? "upload"
        : location.hash === "#doctor-faq-add"
          ? "faq"
          : null;

    if (!target) {
      setFocusSection(null);
      return;
    }

    setFocusSection(target);

    const sectionId = location.hash.replace("#", "");
    const scrollTimer = window.setTimeout(() => {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

    const clearTimer = window.setTimeout(() => {
      setFocusSection((current) => (current === target ? null : current));
    }, 2200);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [location.hash]);

  const totals = useMemo(() => {
    const analyzed = reports.filter((report) => report.status === "analyzed").length;
    const insights = reports.reduce((sum, report) => sum + report.counts.insights, 0);
    const faqs = reports.reduce((sum, report) => sum + report.counts.faqs, 0);
    const recommendations = reports.reduce((sum, report) => sum + report.counts.recommendations, 0);
    return { analyzed, insights, faqs, recommendations, submissions: submissions.length };
  }, [reports, submissions]);

  const insightMix = useMemo(() => {
    const source = (previewDetails?.insights ?? []).filter(isStructuredInsight);
    const low = source.filter((insight) => insight.status === "low").length;
    const normal = source.filter((insight) => insight.status === "normal").length;
    const high = source.filter((insight) => insight.status === "high").length;
    const total = source.length;

    return [
      { label: "Low", count: low, percent: total > 0 ? Math.round((low / total) * 100) : 0, color: "bg-red-500" },
      { label: "Normal", count: normal, percent: total > 0 ? Math.round((normal / total) * 100) : 0, color: "bg-emerald-500" },
      { label: "High", count: high, percent: total > 0 ? Math.round((high / total) * 100) : 0, color: "bg-orange-500" },
    ];
  }, [previewDetails]);

  const latestReportId = reports.find((report) => report.status === "analyzed")?.id ?? reports[0]?.id;
  const latestDoctorRoute = latestReportId ? `/doctor/reports/${latestReportId}` : "/test-upload";
  const latestPatientRoute = latestReportId ? `/patient/reports/${latestReportId}` : "/patient";
  const reportFocus = deriveReportFocus(previewDetails);
  const doctorPublicId = useMemo(() => buildDoctorPublicIdFromUsername(loadAuthSession()?.username ?? ""), []);

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3"
        >
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Doctor Dashboard</h1>
          <p className="text-sm text-slate-600">
            {reportFocus.doctorDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/doctor/data" className="inline-flex">
              <Button size="sm" variant="outline">
                <Database className="h-4 w-4" />
                View Saved Inputs
              </Button>
            </Link>
            <Link to="/doctor/submissions" className="inline-flex">
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4" />
                Patient Profiles
              </Button>
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            <Hash className="h-3.5 w-3.5 text-secondary" />
            Public Doctor ID:
            <span className="font-semibold text-slate-900">{doctorPublicId || "Not available"}</span>
          </div>
        </motion.header>

        <section className="grid gap-6 md:grid-cols-3">
          <motion.article
            id="doctor-report-upload"
            animate={focusSection === "upload" ? { scale: [1, 1.02, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className={`card-doctor scroll-mt-24 p-6 transition-all duration-700 ${
              focusSection === "upload"
                ? "ring-2 ring-secondary/40 ring-offset-2 ring-offset-slate-50 shadow-[0_18px_48px_rgba(0,106,97,0.16)]"
                : ""
            }`}
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <FileUp className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-slate-900">Upload New Report</h2>
            <p className="mt-1 text-sm text-slate-600">
              Save report text and PDF content directly into the database pipeline.
            </p>
            <Link to="/test-upload" className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                Open Upload Page <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.article>

          <motion.article
            id="doctor-faq-add"
            animate={focusSection === "faq" ? { scale: [1, 1.02, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className={`card-doctor scroll-mt-24 p-6 transition-all duration-700 ${
              focusSection === "faq"
                ? "ring-2 ring-secondary/55 ring-offset-2 ring-offset-slate-50 shadow-[0_22px_54px_rgba(0,106,97,0.2)]"
                : ""
            }`}
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <ClipboardList className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-slate-900">FAQ Explorer</h2>
            <p className="mt-1 text-sm text-slate-600">
              Review generated explanation FAQs by report with search and filters.
            </p>
            <Link to="/doctor/faqs" className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                Open FAQ Explorer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.article>

          <motion.article className="card-doctor p-6" whileHover={{ y: -2 }} transition={{ duration: 0.25 }}>
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-slate-900">Patient Preview</h2>
            <p className="mt-1 text-sm text-slate-600">
              Open the latest patient-facing report page with generated explanations.
            </p>
            <Link to={latestPatientRoute} className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                Open Patient View <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-doctor p-6 sm:p-8"
          >
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${reportFocus.concernClassName}`}>
              {reportFocus.concernLabel}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Insight Status Mix</h2>
            <p className="mt-1 text-sm text-slate-600">
              {reportFocus.siteHeadline}
            </p>
            <div className="mt-5 space-y-3">
              {insightMix.map((entry) => (
                <div key={entry.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{entry.label}</span>
                    <span>
                      {entry.count} ({entry.percent}%)
                    </span>
                  </div>
                  <div className="insight-track">
                    <div
                      className={`insight-fill ${entry.color}`}
                      style={{ width: entry.percent > 0 ? `${Math.max(6, entry.percent)}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading insight mix...</p>
              ) : insightMix.every((entry) => entry.count === 0) ? (
                <p className="text-sm text-slate-500">
                  Awaiting extracted lab values from the latest uploaded report.
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Mix is based on extracted values from the latest analyzed upload.
                </p>
              )}
            </div>
          </motion.article>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <FocusBars
              bars={reportFocus.bars}
              title="Latest report graph"
              subtitle="These bars refresh from the current analyzed report, not from generic site data."
            />
            <div className="mt-4 card p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900">Pipeline Overview</h2>
              <p className="mt-1 text-sm text-slate-600">
                Real-time counts from stored reports and generated clinical guidance output.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MetricBox label="Reports" value={`${reports.length}`} />
                <MetricBox label="Submissions" value={`${totals.submissions}`} />
                <MetricBox label="Analyzed" value={`${totals.analyzed}`} />
                <MetricBox label="Insights" value={`${totals.insights}`} />
                <MetricBox label="FAQs" value={`${totals.faqs}`} />
                <MetricBox label="Recommendations" value={`${totals.recommendations}`} />
                <MetricBox label="Status" value={error ? "Error" : isLoading ? "Loading" : "Ready"} />
              </div>
            </div>
            {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
          </motion.div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Saved Reports</h2>
              <Link to="/test-upload">
                <Button size="sm" variant="outline">Upload Another</Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {report.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {report.counts.insights} insights | {report.counts.faqs} faqs | {report.counts.recommendations} recommendations
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link to={`/doctor/reports/${report.id}`} className="inline-flex">
                        <Button size="sm">Manage Report</Button>
                      </Link>
                      <Link to={`/patient/reports/${report.id}`} className="inline-flex">
                        <Button size="sm" variant="outline">Patient View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  {isLoading ? "Loading reports..." : "No reports have been uploaded yet."}
                </p>
              )}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-6 sm:p-8"
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <FileSearch className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Next Action</h2>
            <p className="mt-2 text-sm text-slate-600">
              Continue from the latest report or upload a new one for fresh analysis.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current report focus</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{reportFocus.label}</p>
              <p className="mt-2 text-sm text-slate-600">{reportFocus.doctorDescription}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link to={latestDoctorRoute}>
                <Button className="w-full">Open Latest Report</Button>
              </Link>
              <Link to="/test-upload">
                <Button className="w-full" variant="outline">Create New Report</Button>
              </Link>
            </div>
          </motion.article>
        </section>

        <section className="card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Latest Patient Profiles</h2>
              <p className="mt-1 text-sm text-slate-600">
                New contact-page report submissions appear here with profile fields and linked report access.
              </p>
            </div>
            <Link to="/doctor/submissions">
              <Button size="sm" variant="outline">Open Profile Directory</Button>
            </Link>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {submissions.length > 0 ? (
              submissions.slice(0, 3).map((submission) => (
                <div key={submission.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{submission.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatSubmissionDate(submission.createdAt)}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {submission.linkedReportStatus || "saved"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">
                    {[
                      submission.age ? `Age ${submission.age}` : "",
                      submission.gender ? submission.gender : "",
                      submission.bloodGroup ? `Blood ${submission.bloodGroup}` : "",
                    ]
                      .filter(Boolean)
                      .join(" | ") || "Profile fields not provided"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-700">
                    {submission.message}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to="/doctor/submissions" className="inline-flex">
                      <Button size="sm" variant="outline">View Submission</Button>
                    </Link>
                    {submission.linkedReportId ? (
                      <Link to={`/doctor/reports/${submission.linkedReportId}`} className="inline-flex">
                        <Button size="sm">Open Report</Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                {isLoading ? "Loading submissions..." : "No patient submissions have been saved yet."}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatSubmissionDate(value: string): string {
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
