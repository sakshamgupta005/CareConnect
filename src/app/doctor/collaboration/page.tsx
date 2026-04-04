import React from "react";
import { motion } from "motion/react";
import { Activity, Users, ShieldCheck, Zap, ArrowLeft, MessageSquare, FileText, Share2, Globe, Plus, Search, Filter, ChevronRight, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Link } from "react-router-dom";
import { researchProjects } from "../../../data/mock";
import { cn } from "../../../lib/utils";

export default function CollaborationWorkspace() {
  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-8 lg:p-12 space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/doctor" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary mb-2">Research Workspace</h1>
              <p className="text-slate-500">Collaborative clinical research and synthesis.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="md" className="gap-2">
              <Plus className="w-4 h-4" /> New Project
            </Button>
            <Button size="md" className="gap-2">
              <Share2 className="w-4 h-4" /> Share Workspace
            </Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Active Projects */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {researchProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-[2.5rem] clinical-shadow border border-slate-100 flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <FileText className="text-secondary w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.updatedAt}</span>
                    </div>
                    <h3 className="text-2xl font-headline font-bold text-primary">{project.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{project.update}</p>
                  </div>
                  <div className="flex items-center justify-between pt-8">
                    <div className="flex -space-x-2">
                      {project.members.map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {m}
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:bg-slate-50">
                      Open <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Summary Section */}
            <div className="bg-primary rounded-[2.5rem] p-12 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Zap className="text-secondary w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-headline font-bold">AI Research Synthesis</h2>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                  MediBridge AI is currently synthesizing 14 new papers relevant to your ongoing neuroplasticity project. A summary will be ready by morning.
                </p>
                <div className="flex gap-4">
                  <Button variant="secondary" size="md">View Synthesis Progress</Button>
                  <Button variant="ghost" size="md" className="text-white hover:bg-white/10">Configure AI Agents</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Activity & Team */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] clinical-shadow border border-slate-100 space-y-8">
              <h3 className="text-xl font-headline font-bold text-primary">Recent Activity</h3>
              <div className="space-y-6">
                <ActivityItem 
                  user="Dr. Vance" 
                  action="updated" 
                  target="Project Alpha" 
                  time="2h ago" 
                  icon={<FileText className="w-4 h-4" />} 
                />
                <ActivityItem 
                  user="AI Agent" 
                  action="synthesized" 
                  target="Cardiac Care" 
                  time="4h ago" 
                  icon={<Zap className="w-4 h-4" />} 
                />
                <ActivityItem 
                  user="Dr. Miller" 
                  action="commented on" 
                  target="Project Alpha" 
                  time="Yesterday" 
                  icon={<MessageSquare className="w-4 h-4" />} 
                />
              </div>
              <Button variant="outline" className="w-full">View All Activity</Button>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] clinical-shadow border border-slate-100 space-y-8">
              <h3 className="text-xl font-headline font-bold text-primary">Team Members</h3>
              <div className="space-y-4">
                <TeamMember name="Dr. Julian Vance" role="Lead Researcher" online />
                <TeamMember name="Dr. Alice Miller" role="Cardiologist" online />
                <TeamMember name="Dr. Marcus Chen" role="Neurologist" />
                <TeamMember name="AI Research Agent" role="Clinical AI" online highlight />
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" /> Invite Member
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, target, time, icon }: { user: string; action: string; target: string; time: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-secondary/10 transition-colors">
        <div className="text-slate-400 group-hover:text-secondary transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-900">{user}</span> {action} <span className="font-bold text-slate-900">{target}</span>
        </p>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{time}</span>
      </div>
    </div>
  );
}

function TeamMember({ name, role, online = false, highlight = false }: { name: string; role: string; online?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
          highlight ? "bg-secondary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        )}>
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{name}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{role}</p>
        </div>
      </div>
      {online && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
    </div>
  );
}
