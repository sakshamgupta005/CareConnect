import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ClipboardList, Database, FileSearch, FileUp, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { getReportById, listReports, type ReportDetailsDto, type ReportListItemDto } from "../../lib/reportApi";

type FocusSection = "upload" | "faq" | null;

export default function DoctorDashboard() {
  const location = useLocation();
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
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
        const loadedReports = await listReports();
        if (cancelled) return;
        setReports(loadedReports);

        const previewId = loadedReports.find((report) => report.status === "analyzed")?.id ?? loadedReports[0]?.id;
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
    return { analyzed, insights, faqs, recommendations };
  }, [reports]);

  const insightMix = useMemo(() => {
    const source = previewDetails?.insights ?? [];
    const low = source.filter((insight) => insight.status === "low").length;
    const normal = source.filter((insight) => insight.status === "normal").length;
    const high = source.filter((insight) => insight.status === "high").length;
    const total = source.length || 1;

    return [
      { label: "Low", count: low, percent: Math.round((low / total) * 100), color: "bg-red-500" },
      { label: "Normal", count: normal, percent: Math.round((normal / total) * 100), color: "bg-emerald-500" },
      { label: "High", count: high, percent: Math.round((high / total) * 100), color: "bg-orange-500" },
    ];
  }, [previewDetails]);

  const latestReportId = reports[0]?.id;
  const latestDoctorRoute = latestReportId ? `/doctor/reports/${latestReportId}` : "/test-upload";
  const latestPatientRoute = latestReportId ? `/patient/reports/${latestReportId}` : "/patient";

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
            Upload reports, run analysis, and review generated patient guidance data.
          </p>
          <Link to="/doctor/data" className="inline-flex">
            <Button size="sm" variant="outline">
              <Database className="h-4 w-4" />
              View Saved Inputs
            </Button>
          </Link>
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
            <h2 className="text-lg font-semibold text-slate-900">Insight Status Mix</h2>
            <p className="mt-1 text-sm text-slate-600">
              Compact status breakdown from the latest analyzed report.
            </p>
            <div className="mt-5 space-y-3">
              {previewDetails && previewDetails.insights.length > 0 ? (
                insightMix.map((entry) => (
                  <div key={entry.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{entry.label}</span>
                      <span>
                        {entry.count} ({entry.percent}%)
                      </span>
                    </div>
                    <div className="insight-track">
                      <div className={`insight-fill ${entry.color}`} style={{ width: `${Math.max(6, entry.percent)}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  {isLoading ? "Loading insight mix..." : "No analyzed insights available yet."}
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
            <h2 className="text-lg font-semibold text-slate-900">Pipeline Overview</h2>
            <p className="mt-1 text-sm text-slate-600">
              Real-time counts from stored reports and generated clinical guidance output.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MetricBox label="Reports" value={`${reports.length}`} />
              <MetricBox label="Analyzed" value={`${totals.analyzed}`} />
              <MetricBox label="Insights" value={`${totals.insights}`} />
              <MetricBox label="FAQs" value={`${totals.faqs}`} />
              <MetricBox label="Recommendations" value={`${totals.recommendations}`} />
              <MetricBox label="Status" value={error ? "Error" : isLoading ? "Loading" : "Ready"} />
            </div>
            {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
          </motion.article>
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
