import React from "react";
import { motion } from "motion/react";
import { Search, Plus, Filter, Activity, MessageSquare, Clock, ArrowUpRight, Upload, FileText, User, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { patientRecords, researchProjects } from "../../data/mock";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function DoctorDashboard() {
  return (
    <div className="pt-24 min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200/50 bg-white p-8 hidden lg:flex flex-col gap-12 sticky top-24 h-[calc(100vh-6rem)]">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</p>
          <nav className="space-y-2">
            <SidebarLink icon={<Activity />} label="Dashboard" active />
            <SidebarLink icon={<User />} label="Patients" />
            <SidebarLink icon={<FileText />} label="Research" />
            <SidebarLink icon={<MessageSquare />} label="Messages" />
          </nav>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-3 border-dashed">
              <Plus className="w-4 h-4" /> New Record
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 border-dashed">
              <Upload className="w-4 h-4" /> Upload Lab
            </Button>
          </div>
        </div>

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
              <Zap className="text-secondary w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900">AI Status</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Clinical models updated 2h ago. Processing 14 background research tasks.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary mb-2">Welcome back, Dr. Vance</h1>
            <p className="text-slate-500">You have 4 urgent patient updates and 2 new research summaries.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients..."
                className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all w-64"
              />
            </div>
            <Button variant="outline" size="md" className="p-3">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Patient Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold text-primary">Patient Activity Feed</h2>
            <Link to="#" className="text-sm font-bold text-secondary hover:underline">View All</Link>
          </div>
          <div className="grid gap-4">
            {patientRecords.map((record) => (
              <motion.div
                key={record.id}
                whileHover={{ x: 5 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <img src={record.avatar} alt={record.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900">{record.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" /> {record.time}
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className={cn("font-bold uppercase tracking-widest", record.priority === "High" ? "text-red-500" : "text-emerald-500")}>
                        {record.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4 bg-slate-50 rounded-xl border-l-4 border-secondary/40 text-sm text-slate-600 leading-relaxed italic">
                  "{record.insight}"
                </div>
                <Button variant="ghost" size="sm" className="group-hover:bg-slate-50">
                  Review <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Research & Collaboration */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-headline font-bold text-primary">Active Research</h2>
            <div className="grid gap-4">
              {researchProjects.map((project) => (
                <div key={project.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900">{project.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.updatedAt}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{project.update}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2">
                      {project.members.map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {m}
                        </div>
                      ))}
                    </div>
                    <Link to="/doctor/collaboration" className="text-xs font-bold text-secondary flex items-center gap-1">
                      Workspace <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="text-secondary w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold mb-4">AI Research Synthesis</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                CareConnect AI is currently synthesizing 14 new papers relevant to your ongoing neuroplasticity project. A summary will be ready by morning.
              </p>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => (window.location.href = "/doctor/collaboration")}>
              View Synthesis Progress
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to="#"
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
        active ? "bg-primary text-white shadow-lg shadow-primary/10" : "text-slate-500 hover:bg-slate-50 hover:text-primary"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      {label}
    </Link>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 14.71 14.71 4l-1.64 1.64L18.71 10l-1.64 1.64L20 14.71 9.29 25.42l1.64-1.64L5.29 20l1.64-1.64L4 14.71Z" />
    </svg>
  );
}

