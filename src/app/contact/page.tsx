import { type FormEvent, useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <section className="space-y-3">
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Contact Us</p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">We are here to help</h1>
          <p className="max-w-3xl text-slate-600">
            Reach out for a demo, integration planning, or onboarding support.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <aside className="card p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Contact information</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-secondary" /> hello@careconnect.ai
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-secondary" /> +1 (555) 123-4567
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-secondary" /> 123 Clinical Way, San Francisco, CA
              </p>
            </div>
          </aside>

          <div className="card p-6 sm:p-7">
            {submitted ? (
              <div className="space-y-3 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-secondary" />
                <h3 className="text-lg font-semibold text-slate-900">Message sent</h3>
                <p className="text-sm text-slate-600">
                  Thank you. Our team will get back to you shortly.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-700">
                    <span>Name</span>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      placeholder="john@hospital.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:outline-none"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-sm text-slate-700">
                  <span>Role</span>
                  <select className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:outline-none">
                    <option>Hospital Administrator</option>
                    <option>Healthcare Provider</option>
                    <option>Clinical Researcher</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm text-slate-700">
                  <span>Message</span>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:outline-none"
                  />
                </label>

                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
