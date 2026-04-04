import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ClipboardList, FileText, FileUp, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  formatTagLabel,
  loadReportGuidanceState,
  type ReportGuidanceState,
} from "../../lib/reportGuidance";

type FocusSection = "upload" | "faq" | null;

export default function DoctorDashboard() {
  const location = useLocation();
  const [state, setState] = useState<ReportGuidanceState>({ faqs: [], reports: [] });
  const [focusSection, setFocusSection] = useState<FocusSection>(null);

  useEffect(() => {
    setState(loadReportGuidanceState());
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

  const totalAssignedFaqs = useMemo(
    () => state.reports.reduce((count, report) => count + report.assignedFaqIds.length, 0),
    [state.reports],
  );
  const findingFrequency = useMemo(() => {
    const map = new Map<string, number>();
    state.reports.forEach((report) => {
      report.findings.forEach((finding) => {
        map.set(finding, (map.get(finding) || 0) + 1);
      });
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [state.reports]);

  const maxFindingCount = findingFrequency[0]?.[1] || 1;

  const reportCoverage = useMemo(
    () =>
      state.reports.map((report) => {
        const findings = report.findings.length;
        const assigned = report.assignedFaqIds.length;
        const coverage = findings > 0 ? Math.min(100, Math.round((assigned / findings) * 100)) : 0;
        return { report, coverage, findings, assigned };
      }),
    [state.reports],
  );

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Doctor Dashboard</h1>
          <p className="text-sm text-slate-600">
            Curate report explanations and assign trusted FAQ guidance to each patient report.
          </p>
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
            <h2 className="mt-3 text-base font-semibold text-slate-900">Doctor Uploads Report</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload report context and manage findings for each patient record.
            </p>
            <Link to="/doctor/reports/report_1#report-upload" className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                Open Report Manager <ArrowRight className="h-4 w-4" />
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
            <h2 className="mt-3 text-base font-semibold text-slate-900">Doctor Adds FAQ Questions</h2>
            <p className="mt-1 text-sm text-slate-600">
              Build reusable educational explanations with tags and categories.
            </p>
            <Link to="/doctor/faqs#faq-form" className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                Open FAQ Explanations <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.article>

          <motion.article
            className="card-doctor p-6"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.25 }}
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-slate-900">Assign and Publish Guidance</h2>
            <p className="mt-1 text-sm text-slate-600">
              Assign FAQs manually or suggest matches from findings with one click.
            </p>
            <Link to="/doctor/reports/report_1#assign-faqs" className="mt-4 inline-flex">
              <Button size="sm" variant="outline">
                Open Assignment Panel <ArrowRight className="h-4 w-4" />
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
            <h2 className="text-lg font-semibold text-slate-900">Finding Trend Snapshot</h2>
            <p className="mt-1 text-sm text-slate-600">
              Common findings across active reports, updated directly from current data.
            </p>
            <div className="mt-5 space-y-3">
              {findingFrequency.length === 0 ? (
                <p className="text-sm text-slate-500">No finding data available yet.</p>
              ) : (
                findingFrequency.map(([finding, count], index) => (
                  <div key={finding} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{formatTagLabel(finding)}</span>
                      <span>{count}</span>
                    </div>
                    <div className="insight-track">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(8, Math.round((count / maxFindingCount) * 100))}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.06, duration: 0.45 }}
                        className="insight-fill bg-secondary/85"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-slate-900">Report Guidance Coverage</h2>
            <p className="mt-1 text-sm text-slate-600">
              Assigned explanation depth per report based on findings and selected FAQs.
            </p>
            <div className="mt-5 space-y-4">
              {reportCoverage.map(({ report, coverage, findings, assigned }) => (
                <div key={report.id} className="space-y-1.5 rounded-xl border border-slate-200 bg-white/80 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="truncate pr-3">{report.reportTitle}</span>
                    <span>{coverage}%</span>
                  </div>
                  <div className="insight-track">
                    <div
                      className={`insight-fill ${
                        coverage >= 80 ? "bg-emerald-500" : coverage >= 45 ? "bg-amber-500" : "bg-sky-500"
                      }`}
                      style={{ width: `${Math.max(6, coverage)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {assigned} assigned FAQs for {findings} findings
                  </p>
                </div>
              ))}
            </div>
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
              <h2 className="text-lg font-semibold text-slate-900">Patient Reports</h2>
              <Link to="/doctor/faqs">
                <Button size="sm" variant="outline">Manage FAQs</Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {state.reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{report.reportTitle}</p>
                    <span className="text-xs text-slate-500">{report.patientName}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {report.findings.length} finding{report.findings.length === 1 ? "" : "s"} | {report.assignedFaqIds.length} assigned FAQ
                  </p>
                  <Link to={`/doctor/reports/${report.id}`} className="mt-3 inline-flex">
                    <Button size="sm">Manage This Report</Button>
                  </Link>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-6 sm:p-8"
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Library Overview</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>{state.faqs.length} total reusable FAQ explanations</li>
              <li>{totalAssignedFaqs} assigned explanations across reports</li>
              <li>Tag-based matching enabled for report findings</li>
            </ul>
            <Link to="/patient/reports/report_1" className="mt-4 inline-flex">
              <Button variant="secondary">View Patient Experience</Button>
            </Link>
          </motion.article>
        </section>
      </div>
    </div>
  );
}

