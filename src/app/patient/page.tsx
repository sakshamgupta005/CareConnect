import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpenCheck, FileText, MessageCircle, TrendingUp, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { listReports, type ReportListItemDto } from "../../lib/reportApi";

const SITE_URL = "https://CareConnect.com";

export default function PatientDashboard() {
  const location = useLocation();
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const loaded = await listReports();
        if (cancelled) return;
        setReports(loaded);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load reports.");
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
    if (location.hash !== "#patient-report-explanation") {
      setIsFocused(false);
      return;
    }

    setIsFocused(true);
    const timer = window.setTimeout(() => setIsFocused(false), 2100);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById("patient-report-explanation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 70);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(scrollTimer);
    };
  }, [location.hash]);

  const patientPulse = useMemo(() => {
    const totalReports = reports.length;
    const analyzedReports = reports.filter((report) => report.status === "analyzed").length;
    const totalInsights = reports.reduce((count, report) => count + report.counts.insights, 0);
    const totalFaqs = reports.reduce((count, report) => count + report.counts.faqs, 0);
    const understandingScore =
      totalInsights > 0 ? Math.min(100, Math.round((totalFaqs / totalInsights) * 100)) : 0;

    return { totalReports, analyzedReports, totalInsights, totalFaqs, understandingScore };
  }, [reports]);

  const latestReportId = reports[0]?.id;
  const latestReportRoute = latestReportId ? `/patient/reports/${latestReportId}` : "/patient";
  const whatsappHelpMessage = useMemo(() => {
    const reportLink = latestReportId ? `${SITE_URL}/patient/reports/${latestReportId}` : `${SITE_URL}/patient`;
    return `CareConnect Patient Support
I need help understanding my health report.
Open report guidance: ${reportLink}
Questions I can ask:
1. What does my report summary mean?
2. Which findings are important for me?
3. What should I discuss with my doctor next?`;
  }, [latestReportId]);
  const whatsappHelpLink = `https://wa.me/?text=${encodeURIComponent(whatsappHelpMessage)}`;

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Patient Dashboard</h1>
          <p className="text-sm text-slate-600">
            View analyzed report insights, FAQs, and recommendations from your care team workflow.
          </p>
        </motion.header>

        <motion.section
          id="patient-report-explanation"
          className={`card-patient scroll-mt-24 p-6 transition-all duration-700 sm:p-8 ${
            isFocused
              ? "ring-2 ring-secondary/40 ring-offset-2 ring-offset-slate-50 shadow-[0_20px_50px_rgba(0,106,97,0.18)]"
              : ""
          }`}
          animate={isFocused ? { scale: [1, 1.01, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                Understand Your Report
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Recommended Explanations</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open your latest analyzed report to read personalized explanation FAQs.
              </p>
            </div>
            <Link to={latestReportRoute}>
              <Button>
                View Report Guidance <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricPill label="Reports" value={`${patientPulse.totalReports}`} />
            <MetricPill label="Analyzed" value={`${patientPulse.analyzedReports}`} />
            <MetricPill label="Understanding Score" value={`${patientPulse.understandingScore}%`} />
          </div>
          {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-6 sm:p-8"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary" />
              <h2 className="text-lg font-semibold text-slate-900">Your Reports</h2>
            </div>
            <div className="mt-4 space-y-3">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const progress =
                    report.counts.insights > 0
                      ? Math.min(100, Math.round((report.counts.faqs / report.counts.insights) * 100))
                      : 0;

                  return (
                    <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {report.counts.faqs} explanation{report.counts.faqs === 1 ? "" : "s"} | status: {report.status}
                      </p>
                      <div className="mt-2">
                        <div className="insight-track">
                          <div className="insight-fill bg-sky-500" style={{ width: `${Math.max(6, progress)}%` }} />
                        </div>
                      </div>
                      <Link to={`/patient/reports/${report.id}`} className="mt-3 inline-flex">
                        <Button size="sm" variant="outline">
                          Open Report
                        </Button>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">
                  {isLoading ? "Loading reports..." : "No reports are available yet."}
                </p>
              )}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-patient p-6 sm:p-8"
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <BookOpenCheck className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">How it works</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Doctor uploads report text or PDF from the dashboard.</li>
              <li>The report is analyzed and converted into insights and FAQs.</li>
              <li>You open your report page and read clear explanation cards.</li>
            </ul>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <UserRound className="h-3.5 w-3.5 text-secondary" />
                Care Team Mode
              </p>
              <p className="mt-1 text-sm text-slate-700">
                This experience is doctor-guided and report-based, with no chatbot-only flow.
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-sky-200/70 bg-white/80 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
                Guidance Progress
              </p>
              <div className="mt-2 insight-track">
                <div
                  className="insight-fill bg-sky-500"
                  style={{ width: `${Math.max(6, patientPulse.understandingScore)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Calculated from FAQ count versus extracted report insights.
              </p>
            </div>
          </motion.article>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-patient p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                Patient WhatsApp Help
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Use WhatsApp for easier support</h2>
              <p className="mt-1 text-sm text-slate-600">
                If app navigation feels difficult, tap once to open WhatsApp with a ready patient-help message.
              </p>
            </div>
            <a href={whatsappHelpLink} target="_blank" rel="noreferrer">
              <Button>
                <MessageCircle className="h-4 w-4" />
                Open WhatsApp Help
              </Button>
            </a>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message preview</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{whatsappHelpMessage}</p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-200/70 bg-white/80 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
