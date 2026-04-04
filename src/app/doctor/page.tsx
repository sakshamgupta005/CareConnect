import { motion } from "motion/react";
import { Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { patientRecords, researchProjects } from "../../data/mock";
import { cn } from "../../lib/utils";

export default function DoctorDashboard() {
  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Doctor Dashboard</h1>
            <p className="text-sm text-slate-600">A focused view of team communication and patient chat activity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ y: -1 }} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients"
                className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-secondary focus:outline-none"
              />
            </motion.div>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Link to="/doctor/collaboration">
              <Button>Open Workspace</Button>
            </Link>
          </div>
        </motion.header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Patient activity</h2>
          <div className="grid gap-3">
            {patientRecords.map((record, index) => (
              <motion.article
                key={record.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ delay: index * 0.07, duration: 0.38 }}
                whileHover={{ y: -2, scale: 1.005 }}
                className="card p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      src={record.avatar}
                      alt={record.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{record.name}</p>
                      <p className="text-xs text-slate-500">{record.time}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                      record.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {record.priority}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{record.insight}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="card p-5"
          >
            <h2 className="text-lg font-semibold text-slate-900">Team chat channels</h2>
            <div className="mt-4 space-y-3">
              {researchProjects.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * index, duration: 0.3 }}
                  whileHover={{ x: 4 }}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                    <span className="text-xs text-slate-500">{project.updatedAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{project.update}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="card relative overflow-hidden p-5"
          >
            <motion.div
              animate={{ y: [0, 14, 0], opacity: [0.16, 0.26, 0.16] }}
              transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-secondary/20 blur-3xl"
            />
            <h2 className="text-lg font-semibold text-slate-900">AI chat status</h2>
            <p className="mt-2 text-sm text-slate-600">
              CareConnect AI chat is online and ready for team communication.
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Active channels: Patient Support and Team Coordination.
            </div>
            <Link to="/doctor/collaboration" className="mt-4 inline-block">
              <Button variant="secondary">Open chat workspace</Button>
            </Link>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
