import { ArrowLeft, Plus, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { researchProjects } from "../../../data/mock";

export default function CollaborationWorkspace() {
  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/doctor"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">Collaboration Workspace</h1>
              <p className="text-sm text-slate-600">Research, notes, and team activity in one place.</p>
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
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {researchProjects.map((project) => (
                <article key={project.id} className="card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{project.title}</h2>
                    <span className="text-xs text-slate-500">{project.updatedAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{project.update}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-1">
                      {project.members.map((member) => (
                        <span
                          key={member}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-slate-200 text-[10px] font-semibold text-slate-700"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm">Open</Button>
                  </div>
                </article>
              ))}
            </div>

            <article className="card p-5">
              <h3 className="text-lg font-semibold text-slate-900">AI research synthesis</h3>
              <p className="mt-2 text-sm text-slate-600">
                14 papers are currently being summarized. Estimated completion: tomorrow morning.
              </p>
              <Button className="mt-4" variant="secondary">View synthesis queue</Button>
            </article>
          </div>

          <aside className="space-y-4">
            <article className="card p-5">
              <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Dr. Vance updated Project Alpha (2h ago)</li>
                <li>AI Agent added a cardiac summary (4h ago)</li>
                <li>Dr. Miller commented on protocols (Yesterday)</li>
              </ul>
            </article>

            <article className="card p-5">
              <h3 className="text-lg font-semibold text-slate-900">Team members</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Dr. Julian Vance - Lead Researcher</li>
                <li>Dr. Alice Miller - Cardiologist</li>
                <li>Dr. Marcus Chen - Neurologist</li>
                <li>AI Research Agent - Online</li>
              </ul>
            </article>
          </aside>
        </section>
      </div>
    </div>
  );
}
