import React from "react";
import { motion } from "motion/react";
import { Activity, Users, ShieldCheck, Zap, ArrowRight, MessageSquare, FileText, Share2, Globe } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function ProductPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-24 px-6 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/30 text-secondary rounded-full border border-secondary-container/50 mb-8"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold tracking-widest uppercase">The Platform</span>
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-headline font-bold text-primary leading-[1.1] tracking-tight mb-8">
            One Platform, <span className="text-secondary">Infinite Care</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
            CareConnect AI is a dual-module ecosystem designed to solve the most critical communication challenges in modern healthcare.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => (window.location.href = "/contact")}>Request Demo</Button>
            <Button variant="outline" size="lg">Watch Video</Button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent opacity-50" />
      </section>

      {/* Module 1: Patient AI */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <Users className="text-secondary w-8 h-8" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-headline font-bold text-primary">Patient AI Assistant</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Empower patients to understand their care through interactive AI that translates complex jargon into clear, compassionate instructions.
              </p>
            </div>

            <div className="grid gap-8">
              <FeatureItem 
                icon={<Globe />} 
                title="Multilingual Support" 
                description="Real-time translation into 40+ languages including Hindi, Urdu, and Bengali." 
              />
              <FeatureItem 
                icon={<MessageSquare />} 
                title="Explain Like I'm 10" 
                description="One-click simplification of complex medical terms into easy-to-understand analogies." 
              />
              <FeatureItem 
                icon={<ShieldCheck />} 
                title="HIPAA Secure" 
                description="All interactions are encrypted and compliant with global health data standards." 
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent rounded-[3rem] rotate-3 -z-10" />
            <div className="bg-white rounded-[2.5rem] p-8 clinical-shadow border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=1000&fit=crop" 
                alt="Patient AI Interface" 
                className="rounded-2xl w-full h-auto shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Module 2: Doctor Collab */}
      <section className="py-32 px-6 bg-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-transparent rounded-[3rem] -rotate-3 -z-10" />
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&h=1000&fit=crop" 
                alt="Doctor Collaboration" 
                className="rounded-2xl w-full h-auto shadow-2xl opacity-90"
              />
            </div>
          </div>

          <div className="space-y-12 order-1 lg:order-2">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Activity className="text-secondary w-8 h-8" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-headline font-bold text-white">Doctor Collaboration AI</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Streamline research and team communication with context-aware shared workspaces designed for clinical accuracy.
              </p>
            </div>

            <div className="grid gap-8">
              <FeatureItem 
                dark
                icon={<Zap />} 
                title="Research Synthesis" 
                description="AI-powered summaries of the latest clinical trials and medical journals." 
              />
              <FeatureItem 
                dark
                icon={<Share2 />} 
                title="Shared Workspaces" 
                description="Collaborative notes and case reviews with real-time AI insights." 
              />
              <FeatureItem 
                dark
                icon={<FileText />} 
                title="Automated Documentation" 
                description="Convert team discussions into structured clinical notes and protocols." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-headline font-bold mb-16">Seamlessly Integrated</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 grayscale">
            <div className="flex items-center justify-center text-2xl font-black tracking-tighter">EPIC</div>
            <div className="flex items-center justify-center text-2xl font-black tracking-tighter">CERNER</div>
            <div className="flex items-center justify-center text-2xl font-black tracking-tighter">ATHENA</div>
            <div className="flex items-center justify-center text-2xl font-black tracking-tighter">MEDITECH</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, description, dark = false }: { icon: React.ReactNode; title: string; description: string; dark?: boolean }) {
  return (
    <div className="flex gap-6 group">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
        dark ? "bg-white/10 text-secondary" : "bg-slate-100 text-secondary"
      )}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <div>
        <h4 className={cn("font-bold mb-2", dark ? "text-white" : "text-slate-900")}>{title}</h4>
        <p className={cn("text-sm leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>{description}</p>
      </div>
    </div>
  );
}

