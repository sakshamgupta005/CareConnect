import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Zap, Users, PiggyBank, ChevronDown, Activity } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { stats, faqs } from "../data/mock";
import { cn } from "../lib/utils";

export default function LandingPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/30 text-secondary rounded-full border border-secondary-container/50 mb-8">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Next-Gen Clinical AI</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold text-primary leading-[1.1] tracking-tight mb-8">
              AI That Bridges the Gap Between <span className="text-secondary">Medical Knowledge</span> and Human Understanding
            </h1>
            <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-xl mb-10">
              Help patients understand their care and help doctors collaborate faster — all through intelligent, context-aware medical AI assistants.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="group" onClick={() => (window.location.href = "/contact")}>
                Request Demo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => (window.location.href = "/product")}>
                Explore Platform
              </Button>
            </div>
            <div className="flex items-center gap-8 pt-12 grayscale opacity-40">
              <span className="text-xs font-bold tracking-widest uppercase">HIPAA Compliant</span>
              <span className="text-xs font-bold tracking-widest uppercase">GDPR Ready</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent rounded-[3rem] -rotate-3 -z-10" />
            <div className="bg-white rounded-[2.5rem] p-4 clinical-shadow border border-white/50 backdrop-blur-sm relative">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"
                alt="Medical Dashboard"
                className="rounded-[2rem] w-full h-auto shadow-sm"
              />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border-l-4 border-secondary max-w-xs hidden md:block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="text-secondary w-5 h-5" />
                  <span className="font-headline font-bold text-sm">AI Insight</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Patient adherence predicted to increase by 42% following clear explanation of prescribed therapy.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center group hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="text-secondary w-6 h-6" />
                </div>
                <h3 className="text-3xl font-headline font-bold text-primary mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-headline font-bold mb-6">A Single Ecosystem for Care Delivery</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Bridging the gap between specialized medical data and actionable human intelligence.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="lg:col-span-8 bg-white p-12 rounded-[2.5rem] clinical-shadow border border-slate-100 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                  <Users className="text-secondary w-8 h-8" />
                </div>
                <h3 className="text-3xl font-headline font-bold mb-4">Patient AI Assistant</h3>
                <p className="text-slate-500 text-lg leading-relaxed max-w-md mb-12">
                  Empower patients to understand their care through interactive AI that translates complex jargon into clear, compassionate instructions.
                </p>
              </div>
              <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&h=500&fit=crop"
                  alt="Patient Assistant"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="lg:col-span-4 bg-primary p-12 rounded-[2.5rem] shadow-2xl shadow-primary/20 flex flex-col justify-between text-white group"
            >
              <div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                  <Activity className="text-secondary w-8 h-8" />
                </div>
                <h3 className="text-3xl font-headline font-bold mb-4">Doctor Collaboration</h3>
                <p className="text-slate-400 leading-relaxed mb-12">
                  Streamline research and team communication with context-aware shared workspaces designed for clinical accuracy.
                </p>
              </div>
              <Link to="/product" className="inline-flex items-center gap-2 text-secondary font-bold group-hover:gap-4 transition-all">
                Learn More <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-slate-50 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-headline font-bold mb-12 text-center">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-6xl font-headline font-bold text-white tracking-tight">Ready to Bridge the Gap?</h2>
              <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                Join the future of collaborative medicine and patient-centric care today.
              </p>
              <div className="flex justify-center pt-4">
                <Button size="lg" variant="secondary" className="px-12" onClick={() => (window.location.href = "/contact")}>
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer transition-all hover:shadow-md"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-6 flex items-center justify-between">
        <h4 className="font-bold text-slate-900">{question}</h4>
        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </div>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="p-6 pt-0 text-slate-500 leading-relaxed border-t border-slate-50">
          {answer}
        </div>
      </motion.div>
    </div>
  );
}
