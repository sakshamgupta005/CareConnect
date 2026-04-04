import { type ReactNode, useState } from "react";
import { ArrowRight, CheckCircle2, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { faqs, stats } from "../data/mock";
import { cn } from "../lib/utils";

export default function LandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Simple Clinical Communication
            </p>
            <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
              CareConnect AI helps patients and doctors stay on the same page.
            </h1>
            <p className="max-w-xl text-base text-slate-600 sm:text-lg">
              Explain care clearly for patients, speed up collaboration for doctors, and keep everything in one clean workflow.
            </p>
            <div className="flex flex-wrap gap-3">
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
            </div>
            <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Easy patient explanations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Team collaboration tools
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Secure by design
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                Fast onboarding
              </li>
            </ul>
          </div>

          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">What you can do today</h2>
            <div className="mt-5 space-y-4">
              <FeatureRow
                icon={<MessageSquare className="h-5 w-5 text-secondary" />}
                title="Patient Assistant"
                description="Translate clinical terms into plain language in seconds."
              />
              <FeatureRow
                icon={<Users className="h-5 w-5 text-secondary" />}
                title="Doctor Workspace"
                description="Share notes, updates, and AI summaries with your care team."
              />
              <FeatureRow
                icon={<ShieldCheck className="h-5 w-5 text-secondary" />}
                title="Trust and Compliance"
                description="Built with privacy and security best practices in mind."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-primary sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <FAQItem question={faq.question} answer={faq.answer} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl bg-primary p-6 text-white sm:p-8">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to simplify your care workflows?</h2>
            <p className="mt-2 max-w-2xl text-slate-200">
              Start with one team, one workflow, and scale as your organization grows.
            </p>
            <Link to="/contact" className="mt-5 inline-block">
              <Button variant="secondary" size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 p-4">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
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
        <span className="text-slate-500">{open ? "-" : "+"}</span>
      </button>
      {open && <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">{answer}</p>}
    </div>
  );
}
