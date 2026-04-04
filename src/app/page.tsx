import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, FileText, MessageSquare, ShieldCheck, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
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

        if (loadedReports.length > 0) {
          const details = await getReportById(loadedReports[0].id);
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

  const latestReportId = reports[0]?.id;
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

  return (
    <div className="bg-slate-50">
      <section className="py-14 sm:py-20">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-5 text-center"
          >
            <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">CareConnect AI</h1>
            <p className="mx-auto max-w-4xl text-base text-slate-600 sm:text-lg">
              Doctors upload reports, analyze findings, and publish clear explanations. Patients then open one guided page to understand report insights quickly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
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
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            <WorkflowCard
              icon={<Upload className="h-5 w-5 text-sky-700" />}
              title="Doctor Uploads Report"
              description="The doctor uploads a text-based report file from the dashboard."
              delay={0}
              to="/test-upload"
              tone="sky"
            />
            <WorkflowCard
              icon={<MessageSquare className="h-5 w-5 text-violet-700" />}
              title="Doctor Adds FAQ Questions"
              description="FAQs are generated and saved from analyzed report content."
              delay={0.06}
              to="/doctor/faqs"
              tone="violet"
            />
            <WorkflowCard
              icon={<FileText className="h-5 w-5 text-indigo-700" />}
              title="Patient Gets Explanation"
              description="The patient clicks a question and sees report-based explanation instantly."
              delay={0.12}
              to={patientReportLink}
              tone="teal"
            />
          </div>
          {loadError ? (
            <p className="text-center text-sm text-amber-700">{loadError}</p>
          ) : null}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              whileHover={{ y: -2 }}
              className="card p-4 text-center"
            >
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
            </motion.div>
          ))}
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
                description="Upload reports and run analysis to generate patient guidance."
                to={doctorReportLink}
                tone="teal"
              />
              <FeatureRow
                icon={<FileText className="h-5 w-5 text-sky-700" />}
                title="Patient Workflow"
                description="Open your report page and review generated insights and FAQs."
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
                Report guidance is now data-driven from uploaded medical documents.
              </p>
              <Link to={sharedReportLink} className="mt-3 inline-flex">
                <Button size="sm" variant="outline">View Report Guidance</Button>
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
            className="rounded-2xl bg-primary p-6 text-white sm:p-8"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to start the FAQ recommendation flow?</h2>
            <p className="mt-2 max-w-2xl text-slate-200">
              Upload a report, analyze it, and share clear explanation guidance with patients.
            </p>
            <Link to={doctorReportLink} className="mt-5 inline-block">
              <Button variant="secondary" size="lg">Go to Doctor Dashboard</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function WorkflowCard({
  icon,
  title,
  description,
  delay,
  to,
  tone,
}: {
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
      className={cn("card p-5", toneClassName)}
    >
      <Link
        to={to}
        className="flex h-full flex-col rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30"
      >
        <div className="inline-flex rounded-lg bg-white/70 p-2">{icon}</div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{description}</p>
        <span className="mt-3 inline-flex items-center rounded-md border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
          Show workflow
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
          "flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-secondary/30",
          toneClassName,
        )}
      >
        <motion.div whileHover={{ rotate: -8, scale: 1.08 }} transition={{ type: "spring", stiffness: 320, damping: 16 }} className="mt-0.5">
          {icon}
        </motion.div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
          <span className="mt-2 inline-flex items-center rounded-md border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary">
            Show details
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
