import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpenCheck, FileText, TrendingUp, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { loadReportGuidanceState, type ReportGuidanceState } from "../../lib/reportGuidance";

export default function PatientDashboard() {
  const location = useLocation();
  const [state, setState] = useState<ReportGuidanceState>({ faqs: [], reports: [] });
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setState(loadReportGuidanceState());
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
    const totalReports = state.reports.length;
    const totalFindings = state.reports.reduce((count, report) => count + report.findings.length, 0);
    const totalAssigned = state.reports.reduce((count, report) => count + report.assignedFaqIds.length, 0);
    const understandingScore = totalFindings > 0 ? Math.min(100, Math.round((totalAssigned / totalFindings) * 100)) : 0;

    return { totalReports, totalFindings, totalAssigned, understandingScore };
  }, [state.reports]);

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Patient Dashboard</h1>
          <p className="text-sm text-slate-600">
            View doctor-curated report explanations in a clear and easy-to-understand format.
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
                Open your report guidance page to read explanations selected by your doctor.
              </p>
            </div>
            <Link to="/patient/reports/report_1">
              <Button>
                View Report Guidance <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-200/70 bg-white/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Reports</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{patientPulse.totalReports}</p>
            </div>
            <div className="rounded-xl border border-sky-200/70 bg-white/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Key Findings</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{patientPulse.totalFindings}</p>
            </div>
            <div className="rounded-xl border border-sky-200/70 bg-white/80 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Understanding Score</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{patientPulse.understandingScore}%</p>
            </div>
          </div>
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
              {state.reports.map((report) => (
                <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{report.reportTitle}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {report.assignedFaqIds.length} recommended explanation
                    {report.assignedFaqIds.length === 1 ? "" : "s"} available
                  </p>
                  <div className="mt-2">
                    <div className="insight-track">
                      <div
                        className="insight-fill bg-sky-500"
                        style={{
                          width: `${Math.max(
                            6,
                            report.findings.length > 0
                              ? Math.min(100, Math.round((report.assignedFaqIds.length / report.findings.length) * 100))
                              : 0,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <Link to={`/patient/reports/${report.id}`} className="mt-3 inline-flex">
                    <Button size="sm" variant="outline">
                      Open Report
                    </Button>
                  </Link>
                </div>
              ))}
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
              <li>Doctor uploads and reviews your report findings.</li>
              <li>Doctor assigns educational FAQs to your report.</li>
              <li>You read simple explanations in one guided view.</li>
            </ul>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <UserRound className="h-3.5 w-3.5 text-secondary" />
                Care Team Mode
              </p>
              <p className="mt-1 text-sm text-slate-700">
                This experience is designed for doctor-guided patient education, not chatbot-style interaction.
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
                Based on assigned explanations versus findings in your available reports.
              </p>
            </div>
          </motion.article>
        </section>
      </div>
    </div>
  );
}
