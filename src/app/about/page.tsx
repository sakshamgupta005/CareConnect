import { motion } from "motion/react";
import { Eye, Heart, ShieldCheck, Target } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Conversation First",
    description: "We design chat experiences that keep medical communication clear and simple.",
  },
  {
    icon: Target,
    title: "Focused Use Cases",
    description: "Each page supports a defined AI chat workflow for a specific user type.",
  },
  {
    icon: Eye,
    title: "Clear Language",
    description: "The product language stays direct, neutral, and easy to understand.",
  },
];

const timeline = [
  { year: "2022", title: "Prototype", detail: "Built an initial patient AI chat interface for care communication." },
  { year: "2023", title: "Expansion", detail: "Added a doctor team chat workspace for coordinated discussions." },
  { year: "2024", title: "Scale", detail: "Expanded chat workflows across multiple healthcare environments." },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">About CareConnect AI</p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Built around AI chat for healthcare communication</h1>
          <p className="max-w-3xl text-slate-600">
            CareConnect AI is a communication-first project with dedicated chat spaces for patients and care teams.
          </p>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          {values.map((value, index) => (
            <motion.article
              key={value.title}
              initial={{ opacity: 0, y: 28, rotate: index % 2 === 0 ? -0.8 : 0.8 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08, duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="card p-5"
            >
              <value.icon className="h-6 w-6 text-secondary" />
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{value.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{value.description}</p>
            </motion.article>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card p-6 sm:p-7"
        >
          <h2 className="text-xl font-semibold text-slate-900">Our journey</h2>
          <div className="mt-5 space-y-4">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold text-secondary">{item.year}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.44 }}
          className="card p-6 sm:p-7"
        >
          <h2 className="text-xl font-semibold text-slate-900">Trust and compliance</h2>
          <p className="mt-2 text-sm text-slate-600">Privacy and security are built directly into every AI chat workflow.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["HIPAA", "GDPR", "SOC 2", "ISO 27001"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * index, duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ y: -3 }}
                className="rounded-lg border border-slate-200 bg-white p-3 text-center text-xs font-semibold text-slate-700"
              >
                <ShieldCheck className="mx-auto mb-2 h-4 w-4 text-secondary" />
                {item}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
