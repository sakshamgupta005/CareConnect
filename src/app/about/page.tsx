import React from "react";
import { motion } from "motion/react";
import { Activity, Users, ShieldCheck, Zap, Heart, Target, Eye } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AboutPage() {
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
            <span className="text-[10px] font-bold tracking-widest uppercase">Our Mission</span>
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-headline font-bold text-primary leading-[1.1] tracking-tight mb-8">
            Bridging the Gap Between <span className="text-secondary">Knowledge</span> and Understanding
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
            CareConnect AI was founded with a single goal: to ensure that no patient ever feels lost in their care journey and no doctor ever feels isolated in their research.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent opacity-50" />
      </section>

      {/* Values Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <ValueCard 
            icon={<Heart />} 
            title="Empathy First" 
            description="We build AI that doesn't just process data, but understands the human context behind every clinical interaction." 
          />
          <ValueCard 
            icon={<Target />} 
            title="Clinical Precision" 
            description="Our models are trained on curated medical datasets and reviewed by board-certified professionals for accuracy." 
          />
          <ValueCard 
            icon={<Eye />} 
            title="Radical Transparency" 
            description="We are open about how our AI works, ensuring trust and accountability in every care decision." 
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-headline font-bold text-primary">The CareConnect Story</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Born from the frontlines of clinical practice, CareConnect AI was created by doctors and engineers who saw firsthand the friction in medical communication.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-secondary">2022</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">The Spark</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Initial prototype developed to help oncology patients understand complex treatment pathways.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-secondary">2023</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Expansion</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Launched Doctor Collaboration module to facilitate faster information sharing among research teams.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-secondary">2024</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Global Impact</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">Now serving 50+ hospitals across 3 continents with multilingual AI support.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent rounded-[3rem] rotate-3 -z-10" />
            <div className="bg-white rounded-[2.5rem] p-8 clinical-shadow border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=1000&fit=crop" 
                alt="Our Team" 
                className="rounded-2xl w-full h-auto shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <h2 className="text-4xl font-headline font-bold">Trust & Compliance</h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            We take our responsibility seriously. CareConnect AI is built on a foundation of security, privacy, and clinical integrity.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-secondary mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">HIPAA</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-secondary mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">GDPR</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-secondary mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">SOC-2</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-secondary mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">ISO 27001</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-12 bg-white rounded-[2.5rem] clinical-shadow border border-slate-100 text-center group hover:y-[-5px] transition-all">
      <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-6 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8 text-secondary" })}
      </div>
      <h3 className="text-2xl font-headline font-bold mb-4 text-primary">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

