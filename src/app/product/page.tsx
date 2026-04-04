import { motion } from "motion/react";
import { BookOpen, FileText, SearchCheck, Users } from "lucide-react";
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
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Two services we provide</h1>
          <p className="max-w-3xl text-slate-600">
            CareConnect focuses on patient report understanding and doctor team research workflow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/patient/reports/report_1">
              <Button>Open Patient Understanding</Button>
            </Link>
            <Link to="/doctor/reports/report_1">
              <Button variant="outline">Open Doctor Workspace</Button>
            </Link>
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -4 }}
            className="card p-6 sm:p-7"
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">Patient Understanding</h2>
            <p className="mt-2 text-sm text-slate-600">
              Patients get clear explanations from doctor-assigned report FAQs in one clean view.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                { icon: FileText, text: "Understand report findings in simple language" },
                { icon: SearchCheck, text: "Open recommended questions and read explanations" },
                { icon: Users, text: "Guidance is curated by the doctor for each report" },
              ].map((entry, index) => (
                <motion.li
                  key={entry.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.05, duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <entry.icon className="h-4 w-4 text-secondary" />
                  {entry.text}
                </motion.li>
              ))}
            </ul>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -4 }}
            className="card p-6 sm:p-7"
          >
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">Doctor Team Research Workspace</h2>
            <p className="mt-2 text-sm text-slate-600">
              Doctors work together on research questions and create summaries from uploaded PDFs and text.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                { icon: FileText, text: "Upload PDF documents and text notes for review" },
                { icon: SearchCheck, text: "Frame research questions for the clinical team" },
                { icon: BookOpen, text: "Generate and store concise research summaries" },
              ].map((entry, index) => (
                <motion.li
                  key={entry.text}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.05, duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <entry.icon className="h-4 w-4 text-secondary" />
                  {entry.text}
                </motion.li>
              ))}
            </ul>
          </motion.article>
        </section>
      </div>
    </div>
  );
}
