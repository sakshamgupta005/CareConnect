import { motion } from "motion/react";
import { CheckCircle2, Languages, MessageSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export default function PatientAssistantPage() {
  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Feature Detail
          </p>
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Patient Assistant</h1>
          <p className="text-slate-600">
            A dedicated AI chat space for patient communication in clear, simple language.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.38 }}
          className="card p-6 sm:p-7"
        >
          <h2 className="text-lg font-semibold text-slate-900">What this helps with</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {[
              { icon: MessageSquare, text: "Clear patient-chat conversations" },
              { icon: Languages, text: "Multilingual chat support" },
              { icon: Sparkles, text: "Consistent response style across messages" },
            ].map((item, index) => (
              <motion.li
                key={item.text}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * index, duration: 0.28 }}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4 text-secondary" />
                {item.text}
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.38 }}
          className="card p-6 sm:p-7"
        >
          <h2 className="text-lg font-semibold text-slate-900">Typical outcomes</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {[
              "Better patient understanding",
              "Fewer repeated clarification questions",
              "Smoother onboarding communication",
            ].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index, duration: 0.26 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="flex flex-wrap gap-3">
          <Link to="/contact">
            <Button>Request Demo</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
