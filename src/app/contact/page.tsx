import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Zap } from "lucide-react";
import { Button } from "../../components/ui/Button";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

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
            <span className="text-[10px] font-bold tracking-widest uppercase">Get in Touch</span>
          </motion.div>
          <h1 className="text-5xl lg:text-7xl font-headline font-bold text-primary leading-[1.1] tracking-tight mb-8">
            Let's Start a <span className="text-secondary">Conversation</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
            Ready to transform your clinical communication? Our team is here to help you bridge the gap.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent opacity-50" />
      </section>

      {/* Contact Form Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-headline font-bold text-primary">Contact Information</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Whether you're a hospital administrator, a clinical researcher, or a healthcare provider, we'd love to hear from you.
              </p>
            </div>

            <div className="grid gap-8">
              <ContactInfoItem 
                icon={<Mail />} 
                title="Email Us" 
                description="hello@medibridge.ai" 
              />
              <ContactInfoItem 
                icon={<Phone />} 
                title="Call Us" 
                description="+1 (555) 123-4567" 
              />
              <ContactInfoItem 
                icon={<MapPin />} 
                title="Visit Us" 
                description="123 Clinical Way, San Francisco, CA 94103" 
              />
            </div>
          </div>

          <div className="bg-white p-12 rounded-[2.5rem] clinical-shadow border border-slate-100 relative">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 space-y-6"
              >
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-secondary w-10 h-10" />
                </div>
                <h3 className="text-3xl font-headline font-bold text-primary">Message Received!</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Thank you for reaching out. One of our clinical specialists will contact you within 24 hours.
                </p>
                <Button variant="outline" onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="john@hospital.com" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all appearance-none">
                    <option>Hospital Administrator</option>
                    <option>Healthcare Provider</option>
                    <option>Clinical Researcher</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="How can we help you?" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full group">
                  Send Message
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactInfoItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 text-secondary" })}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-500">{description}</p>
      </div>
    </div>
  );
}
