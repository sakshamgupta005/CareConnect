import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, FileText, MessageSquare, ShieldCheck, Sparkles, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { FocusBars } from "../components/report-data";
import { Button } from "../components/ui/Button";
import { deriveReportFocus } from "../lib/reportFocus";
import { getReportById, listReports, type ReportDetailsDto, type ReportListItemDto } from "../lib/reportApi";
import { cn } from "../lib/utils";

export default function LandingPage() {
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [latestReportDetails, setLatestReportDetails] = useState<ReportDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const loadedReports = await listReports();
        if (cancelled) return;

        setReports(loadedReports);

        const previewId = loadedReports.find((report) => report.status === "analyzed")?.id ?? loadedReports[0]?.id;

        if (previewId) {
          const details = await getReportById(previewId);
          if (cancelled) return;
          setLatestReportDetails(details);
        } else {
          setLatestReportDetails(null);
        }
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Could not load report data.");
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

  const latestReportId = reports.find((report) => report.status === "analyzed")?.id ?? reports[0]?.id;
  const doctorReportLink = latestReportId ? `/doctor/reports/${latestReportId}` : "/test-upload";
  const patientReportLink = latestReportId ? `/patient/reports/${latestReportId}` : "/patient";
  const sharedReportLink = latestReportId ? `/reports/${latestReportId}` : "/test-upload";

  const dashboardStats = useMemo(() => {
    const analyzedCount = reports.filter((report) => report.status === "analyzed").length;
    const totalInsights = reports.reduce((sum, report) => sum + report.counts.insights, 0);
    const totalFaqs = reports.reduce((sum, report) => sum + report.counts.faqs, 0);

    return [
      { label: "Reports Saved", value: `${reports.length}` },
      { label: "Reports Analyzed", value: `${analyzedCount}` },
      { label: "Insights Extracted", value: `${totalInsights}` },
      { label: "FAQs Generated", value: `${totalFaqs}` },
    ];
  }, [reports]);

  const homeFaqs = latestReportDetails?.faqs ?? [];
  const reportFocus = deriveReportFocus(latestReportDetails);

  return (
    <div className="relative overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(2,132,199,0.18),transparent_58%)]" />

      <section className="relative py-14 sm:py-20">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
          >
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Report-aware care communication
              </p>
              <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
                CareConnect AI
              </h1>
              <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
                {reportFocus.siteDescription}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/doctor">
                  <Button size="lg">
                    Open Doctor Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/patient">
                  <Button variant="outline" size="lg">
                    Open Patient View
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {reportFocus.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="card relative overflow-hidden p-6 sm:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-100/70 blur-3xl" />
              <div className="relative">
                <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${reportFocus.concernClassName}`}>
                  {reportFocus.concernLabel}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{reportFocus.siteHeadline}</h2>
                <p className="mt-2 text-sm text-slate-600">{reportFocus.label}</p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-700">
                  {reportFocus.quickFacts.slice(0, 3).map((fact, index) => (
                    <li key={`hero-focus-${index}`} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {dashboardStats.slice(0, 2).map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-200 bg-white/80 p-3">
                      <p className="text-lg font-bold text-primary">{stat.value}</p>
                      <p className="text-[11px] text-slate-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Patient-ready workflow</p>
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Three steps from report to explanation</h2>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <WorkflowCard
                step="01"
                icon={<Upload className="h-5 w-5 text-sky-700" />}
                title="Doctor Uploads Report"
                description="Upload the latest report text or PDF into the dashboard."
                delay={0}
                to="/test-upload"
                tone="sky"
              />
              <WorkflowCard
                step="02"
                icon={<MessageSquare className="h-5 w-5 text-violet-700" />}
                title="System Generates FAQs"
                description="Detected findings are converted into explainable question-answer content."
                delay={0.06}
                to="/doctor/faqs"
                tone="violet"
              />
              <WorkflowCard
                step="03"
                icon={<FileText className="h-5 w-5 text-indigo-700" />}
                title="Patient Reads Clearly"
                description="Patients open focused explanations with report-aware language."
                delay={0.12}
                to={patientReportLink}
                tone="teal"
              />
            </div>
          </div>

          {loadError ? (
            <p className="text-sm text-amber-700">{loadError}</p>
          ) : null}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/80 py-14 backdrop-blur">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              whileHover={{ y: -2 }}
              className="card p-4 text-left"
            >
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Live intelligence</p>
              <h2 className="text-2xl font-semibold text-slate-900">Latest report focus</h2>
            </div>
            <Link to={sharedReportLink}>
              <Button variant="outline" size="sm">
                View Report Guidance
              </Button>
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <motion.article
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              className="card p-6 sm:p-8"
            >
              <h3 className="text-xl font-semibold text-slate-900">{reportFocus.label}</h3>
              <p className="mt-2 text-sm text-slate-600">{reportFocus.siteHeadline}</p>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
                {reportFocus.quickFacts.map((fact, index) => (
                  <li key={`home-focus-${index}`} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </motion.article>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
            >
              <FocusBars
                bars={reportFocus.bars}
                title="Latest analysis graph"
                subtitle="This graph is built from the most recently analyzed report only."
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="card p-7 sm:p-10"
          >
            <h2 className="text-xl font-semibold text-slate-900">What you can do today</h2>
            <div className="mt-5 space-y-4">
              <FeatureRow
                icon={<Users className="h-5 w-5 text-indigo-700" />}
                title="Doctor Workflow"
                description={reportFocus.doctorDescription}
                to={doctorReportLink}
                tone="teal"
              />
              <FeatureRow
                icon={<FileText className="h-5 w-5 text-sky-700" />}
                title="Patient Workflow"
                description={reportFocus.patientDescription}
                to={patientReportLink}
                tone="sky"
              />
              <FeatureRow
                icon={<ShieldCheck className="h-5 w-5 text-amber-700" />}
                title="Trust and Compliance"
                description="Privacy-focused report processing and controlled access flow."
                to="/trust-and-compliance"
                tone="amber"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="card p-7 sm:p-10"
          >
            <h2 className="text-xl font-semibold text-slate-900">System highlights</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Report text is persisted and analyzed with deterministic rules
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Insights, FAQs, and recommendations are stored in Prisma
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Compact visualization for key report metrics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Patient-first accordion FAQ reading experience
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Understand Your Report Better</h3>
              <p className="mt-1 text-sm text-slate-600">
                {latestReportDetails
                  ? `The website is currently reacting to the latest report focus: ${reportFocus.label}.`
                  : "Report guidance is now data-driven from uploaded medical documents."}
              </p>
              <Link to={sharedReportLink} className="mt-3 inline-flex">
                <Button size="sm" variant="outline">
                  View Report Guidance
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-bold text-primary sm:text-3xl"
          >
            Frequently asked questions
          </motion.h2>
          <div className="mt-6 space-y-3">
            {homeFaqs.length > 0 ? (
              homeFaqs.slice(0, 4).map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <FAQItem question={faq.question} answer={faq.answer} />
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-slate-600">
                {isLoading ? "Loading FAQs from the latest report..." : "No report FAQs available yet."}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-primary via-slate-800 to-secondary p-6 text-white sm:p-8"
          >
            <div className="pointer-events-none absolute -top-20 right-8 h-56 w-56 rounded-full bg-white/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-12 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-bold sm:text-3xl">Ready to start the FAQ recommendation flow?</h2>
              <p className="mt-2 max-w-2xl text-slate-200">
                Upload a report, analyze it, and share clear explanation guidance with patients.
              </p>
              <Link to={doctorReportLink} className="mt-5 inline-block">
                <Button variant="secondary" size="lg">
                  Go to Doctor Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function WorkflowCard({
  step,
  icon,
  title,
  description,
  delay,
  to,
  tone,
}: {
  step: string;
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
  to: string;
  tone: "teal" | "sky" | "violet" | "amber";
}) {
  const toneClassName = {
    teal: "accent-card-teal",
    sky: "accent-card-sky",
    violet: "accent-card-violet",
    amber: "accent-card-amber",
  }[tone];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.32 }}
      whileHover={{ y: -2 }}
      className={cn("card p-5 sm:p-6", toneClassName)}
    >
      <Link
        to={to}
        className="group flex h-full flex-col rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30"
      >
        <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-600">
          {step}
        </div>
        <div className="inline-flex rounded-lg bg-white/70 p-2">{icon}</div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
          Show workflow
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.article>
  );
}

function FeatureRow({
  icon,
  title,
  description,
  to,
  tone,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  to: string;
  tone: "teal" | "sky" | "violet" | "amber";
}) {
  const toneClassName = {
    teal: "accent-card-teal",
    sky: "accent-card-sky",
    violet: "accent-card-violet",
    amber: "accent-card-amber",
  }[tone];

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 330, damping: 22 }}>
      <Link
        to={to}
        className={cn(
          "group flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-secondary/30",
          toneClassName,
        )}
      >
        <motion.div whileHover={{ rotate: -8, scale: 1.08 }} transition={{ type: "spring", stiffness: 320, damping: 16 }} className="mt-0.5">
          {icon}
        </motion.div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">
            Show details
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{question}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="text-slate-500">
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-slate-200 px-4 py-3 text-sm text-slate-600"
          >
            {answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
