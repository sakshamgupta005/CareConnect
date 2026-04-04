import { Eye, Heart, ShieldCheck, Target } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Empathy First",
    description: "We design every interaction to make care clearer and less stressful for patients.",
  },
  {
    icon: Target,
    title: "Clinical Precision",
    description: "We focus on accurate, review-friendly outputs that support medical teams.",
  },
  {
    icon: Eye,
    title: "Clear Communication",
    description: "We keep explanations transparent, simple, and easy to act on.",
  },
];

const timeline = [
  { year: "2022", title: "Prototype", detail: "Built initial workflows for patient-friendly care explanations." },
  { year: "2023", title: "Expansion", detail: "Added shared doctor collaboration and research support tools." },
  { year: "2024", title: "Scale", detail: "Expanded usage across hospitals with multilingual support." },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
        <section className="space-y-4">
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">About CareConnect AI</p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Helping patients and clinicians communicate better</h1>
          <p className="max-w-3xl text-slate-600">
            CareConnect AI was created to reduce confusion in healthcare communication and improve coordination across care teams.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="card p-5">
              <value.icon className="h-6 w-6 text-secondary" />
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{value.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{value.description}</p>
            </article>
          ))}
        </section>

        <section className="card p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-slate-900">Our journey</h2>
          <div className="mt-5 space-y-4">
            {timeline.map((item) => (
              <div key={item.year} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-secondary">{item.year}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-slate-900">Trust and compliance</h2>
          <p className="mt-2 text-sm text-slate-600">
            CareConnect AI is built with a strong focus on privacy, security, and responsible clinical support.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["HIPAA", "GDPR", "SOC 2", "ISO 27001"].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white p-3 text-center text-xs font-semibold text-slate-700">
                <ShieldCheck className="mx-auto mb-2 h-4 w-4 text-secondary" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
