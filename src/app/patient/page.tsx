import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, Languages, Sparkles, User, Activity, Clock, FileText, ChevronRight, Mic } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { chatResponses } from "../../data/mock";

export default function PatientDashboard() {
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello Eleanor! I've reviewed your latest report. Is there anything you'd like me to explain?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessages = [...messages, { role: "user", text: inputValue }];
    setMessages(newMessages);
    setInputValue("");

    // Fake AI response
    setTimeout(() => {
      const response = isSimpleMode 
        ? chatResponses[language].simple 
        : chatResponses[language].normal;
      setMessages([...newMessages, { role: "ai", text: response }]);
    }, 1000);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar - Patient Info */}
      <aside className="w-full lg:w-80 bg-white border-r border-slate-200/50 p-8 space-y-12 shrink-0">
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-6 shadow-xl border-4 border-white">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop" 
              alt="Eleanor Rigby" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-headline font-bold text-primary">Eleanor Rigby</h2>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-widest mt-1">Patient ID: #ER-9021</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Care Plan</h3>
          <div className="space-y-3">
            <CarePlanItem icon={<Activity />} label="Cardiac Recovery" status="On Track" />
            <CarePlanItem icon={<Clock />} label="Medication" status="8:00 AM" />
            <CarePlanItem icon={<FileText />} label="Lab Results" status="New" highlight />
          </div>
        </div>

        <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-secondary w-5 h-5" />
            <span className="font-bold text-sm text-primary">AI Health Tip</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your heart rate variability is improving. Keep up the light walking!
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-6rem)]">
        <header className="p-6 bg-white border-b border-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-secondary w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">CareConnect AI Assistant</h3>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Always Online</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setLanguage("english")}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all", language === "english" ? "bg-white shadow-sm text-primary" : "text-slate-400")}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage("hindi")}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all", language === "hindi" ? "bg-white shadow-sm text-primary" : "text-slate-400")}
              >
                हिन्दी
              </button>
            </div>
            <button 
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                isSimpleMode ? "bg-secondary/10 border-secondary/20 text-secondary" : "bg-white border-slate-200 text-slate-500"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Simple Mode
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-4 max-w-2xl", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", msg.role === "ai" ? "bg-secondary/10 text-secondary" : "bg-primary text-white")}>
                  {msg.role === "ai" ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "ai" ? "bg-white border border-slate-100 shadow-sm text-slate-700" : "bg-primary text-white"
                )}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <footer className="p-6 bg-white border-t border-slate-200/50">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything about your care..."
              className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            />
            <div className="absolute right-2 top-2 flex gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Mic className="w-5 h-5 text-slate-400" />
              </Button>
              <Button size="sm" onClick={handleSendMessage}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-bold">
            AI Assistant is not a replacement for professional medical advice.
          </p>
        </footer>
      </main>
    </div>
  );
}

function CarePlanItem({ icon, label, status, highlight = false }: { icon: React.ReactNode; label: string; status: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-secondary transition-colors">
          {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
        </div>
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md", highlight ? "bg-secondary text-white" : "bg-slate-100 text-slate-400")}>
        {status}
      </span>
    </div>
  );
}

