import { motion } from "motion/react";
import { FileText, Globe, MessageSquare, ShieldCheck, Share2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export default function ProductPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Product Overview
          </p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">One platform for patient clarity and doctor collaboration</h1>
          <p className="max-w-3xl text-slate-600">
            CareConnect AI has two core modules: a patient chat space and a clinician team chat space.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/contact">
              <Button>Request Demo</Button>
            </Link>
            <Link to="/doctor">
              <Button variant="outline">View Doctor Portal</Button>
            </Link>
          </motion.div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, x: -30, clipPath: "inset(0 100% 0 0 round 16px)" }}
            whileInView={{ opacity: 1, x: 0, clipPath: "inset(0 0% 0 0 round 16px)" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="card p-6 sm:p-7"
          >
            <h2 className="text-xl font-semibold text-slate-900">Patient AI Chat Space</h2>
            <p className="mt-2 text-sm text-slate-600">
              A focused chat area where patients can ask questions and receive clear, plain-language replies.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                { icon: Globe, text: "Multilingual chat support" },
                { icon: MessageSquare, text: "Plain-language conversation flow" },
                { icon: ShieldCheck, text: "Secure patient communication" },
              ].map((entry, index) => (
                <motion.li
                  key={entry.text}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.06, duration: 0.32 }}
                  className="flex items-center gap-2"
                >
                  <entry.icon className="h-4 w-4 text-secondary" />
                  {entry.text}
                </motion.li>
              ))}
            </ul>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, x: 30, clipPath: "inset(0 0 0 100% round 16px)" }}
            whileInView={{ opacity: 1, x: 0, clipPath: "inset(0 0 0 0% round 16px)" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
            className="card p-6 sm:p-7"
          >
            <h2 className="text-xl font-semibold text-slate-900">Doctor Team Chat Space</h2>
            <p className="mt-2 text-sm text-slate-600">
              A shared chat workspace for clinicians to coordinate tasks, messages, and case discussions.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                { icon: Zap, text: "Live team chat threads" },
                { icon: Share2, text: "Shared notes and updates" },
                { icon: FileText, text: "Organized conversation history" },
              ].map((entry, index) => (
                <motion.li
                  key={entry.text}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.06, duration: 0.32 }}
                  className="flex items-center gap-2"
                >
                  <entry.icon className="h-4 w-4 text-secondary" />
                  {entry.text}
                </motion.li>
              ))}
            </ul>
          </motion.article>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="card p-6 sm:p-7"
        >
          <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
          <p className="mt-2 text-sm text-slate-600">
            Connect the chat platform with your existing healthcare systems.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["Epic", "Cerner", "Athena", "Meditech", "FHIR APIs"].map((item, index) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * index, duration: 0.28 }}
                whileHover={{ y: -2, scale: 1.03 }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
