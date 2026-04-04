import { FileText, Globe, MessageSquare, ShieldCheck, Share2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export default function ProductPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
        <section className="space-y-4">
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Product Overview
          </p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">One platform for patient clarity and doctor collaboration</h1>
          <p className="max-w-3xl text-slate-600">
            CareConnect AI has two simple modules: one for helping patients understand care instructions, and one for helping clinicians coordinate faster.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact">
              <Button>Request Demo</Button>
            </Link>
            <Link to="/doctor">
              <Button variant="outline">View Doctor Portal</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="card p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">Patient AI Assistant</h2>
            <p className="mt-2 text-sm text-slate-600">
              Support patients with plain-language explanations and guided follow-up messaging.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-secondary" /> Multilingual support</li>
              <li className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-secondary" /> Easy explanations for complex terms</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary" /> Privacy-focused interactions</li>
            </ul>
          </article>

          <article className="card p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-slate-900">Doctor Collaboration Workspace</h2>
            <p className="mt-2 text-sm text-slate-600">
              Give clinical teams a shared place to review research, discuss cases, and document decisions.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-secondary" /> AI research summaries</li>
              <li className="flex items-center gap-2"><Share2 className="h-4 w-4 text-secondary" /> Shared notes and teamwork tools</li>
              <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-secondary" /> Structured documentation support</li>
            </ul>
          </article>
        </section>

        <section className="card p-6 sm:p-7">
          <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
          <p className="mt-2 text-sm text-slate-600">
            Connect CareConnect AI to your existing ecosystem at your own pace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["Epic", "Cerner", "Athena", "Meditech", "FHIR APIs"].map((item) => (
              <span key={item} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
