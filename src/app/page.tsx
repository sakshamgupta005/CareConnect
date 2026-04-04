import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, FileText, MessageSquare, ShieldCheck, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { faqs, stats } from "../data/mock";

export default function LandingPage() {
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
            <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              FAQ Recommendation Platform
            </p>
            <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">CareConnect AI</h1>
            <p className="mx-auto max-w-4xl text-base text-slate-600 sm:text-lg">
              Doctors upload reports, curate findings, and assign explanation FAQs. Patients then open a clean guidance page to understand their report clearly.
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
              icon={<Upload className="h-5 w-5 text-secondary" />}
              title="Doctor Uploads Report"
              description="The doctor uploads a text-based report file from the dashboard."
              delay={0}
              to="/doctor/reports/report_1#report-upload"
            />
            <WorkflowCard
              icon={<MessageSquare className="h-5 w-5 text-secondary" />}
              title="Doctor Adds FAQ Questions"
              description="The doctor adds recommended FAQ questions for the patient."
              delay={0.06}
              to="/doctor/faqs#faq-form"
            />
            <WorkflowCard
              icon={<FileText className="h-5 w-5 text-secondary" />}
              title="Patient Gets Explanation"
              description="The patient clicks a question and sees report-based explanation instantly."
              delay={0.12}
              to="/patient/reports/report_1#recommended-faqs"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4">
          {stats.map((stat, index) => (
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
                icon={<Users className="h-5 w-5 text-secondary" />}
                title="Doctor Workflow"
                description="Upload reports, define findings, and assign reusable explanations."
                to="/doctor/reports/report_1"
              />
              <FeatureRow
                icon={<FileText className="h-5 w-5 text-secondary" />}
                title="Patient Workflow"
                description="Open your report page and read doctor-selected explanations."
                to="/patient/reports/report_1"
              />
              <FeatureRow
                icon={<ShieldCheck className="h-5 w-5 text-secondary" />}
                title="Trust and Compliance"
                description="Privacy and security controls around every FAQ workflow."
                to="/trust-and-compliance"
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
                Doctor-curated reusable FAQ explanation library
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Report findings and tag-based FAQ suggestions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Patient-first accordion view for easier understanding
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Simple clinical workflow with manual assignment control
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Understand Your Report Better</h3>
              <p className="mt-1 text-sm text-slate-600">
                Doctors can add simple explanations and helpful guidance related to your report.
              </p>
              <Link to="/patient/reports/report_1" className="mt-3 inline-flex">
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
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <FAQItem question={faq.question} answer={faq.answer} />
              </motion.div>
            ))}
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
              Go to the doctor dashboard, curate FAQ explanations, and assign guidance to a patient report.
            </p>
            <Link to="/doctor/reports/report_1" className="mt-5 inline-block">
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
}: {
  icon: ReactNode;
  title: string;
  description: string;
  delay: number;
  to: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.32 }}
      whileHover={{ y: -2 }}
      className="card p-5"
    >
      <Link
        to={to}
        className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30"
      >
        <div className="inline-flex rounded-lg bg-secondary/10 p-2">{icon}</div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
        <p className="mt-3 text-xs font-semibold text-secondary">Open this workflow</p>
      </Link>
    </motion.article>
  );
}

function FeatureRow({
  icon,
  title,
  description,
  to,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 330, damping: 22 }}>
      <Link
        to={to}
        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-secondary/30"
      >
        <motion.div whileHover={{ rotate: -8, scale: 1.08 }} transition={{ type: "spring", stiffness: 320, damping: 16 }} className="mt-0.5">
          {icon}
        </motion.div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
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
