import { motion } from "motion/react";
import { ArrowLeft, Plus, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { researchProjects } from "../../../data/mock";

export default function CollaborationWorkspace() {
  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/doctor"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">Collaboration Workspace</h1>
              <p className="text-sm text-slate-600">Team chat, notes, and communication threads in one place.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Plus className="h-4 w-4" /> New project
            </Button>
            <Button>
              <Share2 className="h-4 w-4" /> Share workspace
            </Button>
          </div>
        </motion.header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {researchProjects.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.08, duration: 0.34 }}
                  whileHover={{ y: -4 }}
                  className="card p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{project.title}</h2>
                    <span className="text-xs text-slate-500">{project.updatedAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{project.update}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {project.members.map((member) => (
                        <motion.span
                          key={member}
                          whileHover={{ y: -2, scale: 1.06 }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-slate-200 text-[10px] font-semibold text-slate-700"
                        >
                          {member}
                        </motion.span>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm">Open</Button>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.article
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4 }}
              className="card relative overflow-hidden p-5"
            >
              <motion.div
                animate={{ x: [0, 20, 0], opacity: [0.18, 0.3, 0.18] }}
                transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-secondary/20 blur-3xl"
              />
              <h3 className="text-lg font-semibold text-slate-900">AI chat workspace</h3>
              <p className="mt-2 text-sm text-slate-600">
                Unified chat threads are available for patient communication and team coordination.
              </p>
              <Button className="mt-4" variant="secondary">Open active chat threads</Button>
            </motion.article>
          </div>

          <aside className="space-y-4">
            <motion.article
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.36 }}
              className="card p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Dr. Vance updated Project Alpha (2h ago)</li>
                <li>AI Agent posted a new team message (4h ago)</li>
                <li>Dr. Miller commented on protocols (Yesterday)</li>
              </ul>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.05, duration: 0.36 }}
              className="card p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">Team members</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Dr. Julian Vance - Lead Researcher</li>
                <li>Dr. Alice Miller - Cardiologist</li>
                <li>Dr. Marcus Chen - Neurologist</li>
                <li>AI Research Agent - Online</li>
              </ul>
            </motion.article>
          </aside>
        </section>
      </div>
    </div>
  );
}
