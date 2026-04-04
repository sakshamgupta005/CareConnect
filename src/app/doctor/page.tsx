import { Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { patientRecords, researchProjects } from "../../data/mock";
import { cn } from "../../lib/utils";

export default function DoctorDashboard() {
  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Doctor Dashboard</h1>
            <p className="text-sm text-slate-600">A simpler view of patient updates and ongoing research.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients"
                className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-secondary focus:outline-none"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Link to="/doctor/collaboration">
              <Button>Open Workspace</Button>
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Patient activity</h2>
          <div className="grid gap-3">
            {patientRecords.map((record) => (
              <article key={record.id} className="card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <img src={record.avatar} alt={record.name} className="h-10 w-10 rounded-full object-cover" />
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
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-slate-900">Research projects</h2>
            <div className="mt-4 space-y-3">
              {researchProjects.map((project) => (
                <article key={project.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                    <span className="text-xs text-slate-500">{project.updatedAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{project.update}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold text-slate-900">AI synthesis status</h2>
            <p className="mt-2 text-sm text-slate-600">
              CareConnect AI is summarizing newly published material and preparing updates for your team.
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Current queue: 14 papers in progress.
            </div>
            <Link to="/doctor/collaboration" className="mt-4 inline-block">
              <Button variant="secondary">View progress</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
