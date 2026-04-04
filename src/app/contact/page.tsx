import { type FormEvent, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Contact Us</p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">We are here to help</h1>
          <p className="max-w-3xl text-slate-600">
            Reach out for a demo, integration planning, or onboarding support.
          </p>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-2">
          <motion.aside
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="card p-6 sm:p-7"
          >
            <h2 className="text-lg font-semibold text-slate-900">Contact information</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              {[
                { icon: Mail, text: "hello@careconnect.ai" },
                { icon: Phone, text: "+1 (555) 123-4567" },
                { icon: MapPin, text: "123 Clinical Way, San Francisco, CA" },
              ].map((item, index) => (
                <motion.p
                  key={item.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.06, duration: 0.28 }}
                  className="flex items-center gap-3"
                >
                  <item.icon className="h-4 w-4 text-secondary" /> {item.text}
                </motion.p>
              ))}
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="card overflow-hidden p-6 sm:p-7"
          >
            <AnimatePresence mode="wait" initial={false}>
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="space-y-3 text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <CheckCircle2 className="mx-auto h-10 w-10 text-secondary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-900">Message sent</h3>
                  <p className="text-sm text-slate-600">
                    Thank you. Our team will get back to you shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                  onSubmit={handleSubmit}
                >
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
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
