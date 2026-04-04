import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { faqs, stats } from "../data/mock";

const heroContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function LandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <motion.div variants={heroContainer} initial="hidden" animate="show" className="space-y-6">
            <motion.p
              variants={heroItem}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 330, damping: 18 }}
              className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
            >
              AI Chat Platform
            </motion.p>
            <motion.h1
              variants={heroItem}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl"
            >
              CareConnect AI
            </motion.h1>
            <motion.p variants={heroItem} className="max-w-xl text-base text-slate-600 sm:text-lg">
              The project is focused on clear communication through structured AI chat, for both patient-side and clinician-side workflows.
            </motion.p>
            <motion.div variants={heroItem} className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button size="lg">
                  Request Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/product">
                <Button variant="outline" size="lg">
                  View Product
                </Button>
              </Link>
            </motion.div>
            <motion.ul variants={heroContainer} className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {[
                "Easy patient explanations",
                "Team collaboration tools",
                "Secure by design",
                "Fast onboarding",
              ].map((item) => (
                <motion.li key={item} variants={heroItem} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, rotate: 1.2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="card relative overflow-hidden p-6 sm:p-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.25, 0.38, 0.25],
              }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-secondary/20 blur-2xl"
            />
            <h2 className="text-xl font-semibold text-slate-900">What you can do today</h2>
            <div className="relative mt-5 space-y-4">
              <FeatureRow
                icon={<MessageSquare className="h-5 w-5 text-secondary" />}
                title="Patient Assistant"
                description="Patient-facing AI chat space for clear medical communication."
                to="/patient-assistant"
              />
              <FeatureRow
                icon={<Users className="h-5 w-5 text-secondary" />}
                title="Doctor Workspace"
                description="Team AI chat space for shared updates and coordination."
                to="/doctor-workspace"
              />
              <FeatureRow
                icon={<ShieldCheck className="h-5 w-5 text-secondary" />}
                title="Trust and Compliance"
                description="Privacy and security controls around every chat workflow."
                to="/trust-and-compliance"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="card p-4 text-center"
            >
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-2xl font-bold text-primary sm:text-3xl"
          >
            Frequently asked questions
          </motion.h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: index * 0.05, duration: 0.36 }}
              >
                <FAQItem question={faq.question} answer={faq.answer} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white sm:p-8"
          >
            <motion.div
              animate={{ x: [0, 30, 0], opacity: [0.26, 0.4, 0.26] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute -right-16 -top-12 h-52 w-52 rounded-full bg-secondary/30 blur-3xl"
            />
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to launch your AI chat workflow?</h2>
            <p className="mt-2 max-w-2xl text-slate-200">
              Start with one focused chat use case and expand across your organization.
            </p>
            <Link to="/contact" className="mt-5 inline-block">
              <Button variant="secondary" size="lg">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
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
