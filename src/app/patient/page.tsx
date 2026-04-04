import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Languages, MessageSquare, Send, Sparkles, User } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { chatResponses } from "../../data/mock";
import { cn } from "../../lib/utils";

type Language = "english" | "hindi";
type ChatMessage = { role: "ai" | "user"; text: string };

export default function PatientDashboard() {
  const [language, setLanguage] = useState<Language>("english");
  const [simpleMode, setSimpleMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Hello Eleanor. Welcome to your CareConnect AI chat space. What would you like to discuss?",
    },
  ]);

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const next = [...messages, { role: "user", text } as ChatMessage];
    setMessages(next);
    setInputValue("");

    const response = simpleMode ? chatResponses[language].simple : chatResponses[language].normal;

    window.setTimeout(() => {
      setMessages([...next, { role: "ai", text: response }]);
    }, 400);
  };

  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[280px_1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="card p-5"
        >
          <h1 className="text-lg font-semibold text-slate-900">Patient Profile</h1>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p><span className="font-medium text-slate-900">Name:</span> Eleanor Rigby</p>
            <p><span className="font-medium text-slate-900">Patient ID:</span> ER-9021</p>
            <p><span className="font-medium text-slate-900">Chat Space:</span> Patient Communication</p>
          </div>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"
          >
            <p className="font-semibold text-slate-900">Chat Focus</p>
            <p className="mt-1">Use this space for clear patient questions and straightforward answers.</p>
          </motion.div>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: 0.03 }}
          className="card relative flex min-h-[500px] flex-col overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.3, 0.18] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl"
          />

          <header className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ rotate: -8, scale: 1.06 }} className="rounded-lg bg-secondary/10 p-2">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </motion.div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">CareConnect AI Assistant</h2>
                <p className="text-xs text-slate-500">Always available</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <motion.div whileHover={{ y: -1 }} className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
                <Languages className="ml-1 h-4 w-4 text-slate-500" />
                <button
                  onClick={() => setLanguage("english")}
                  className={cn(
                    "rounded px-2 py-1 text-xs",
                    language === "english" ? "bg-slate-100 text-slate-900" : "text-slate-600",
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("hindi")}
                  className={cn(
                    "rounded px-2 py-1 text-xs",
                    language === "hindi" ? "bg-slate-100 text-slate-900" : "text-slate-600",
                  )}
                >
                  Hindi
                </button>
              </motion.div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSimpleMode((prev) => !prev)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs",
                  simpleMode
                    ? "border-secondary/40 bg-secondary/10 text-secondary"
                    : "border-slate-300 text-slate-600",
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Plain mode
              </motion.button>
            </div>
          </header>

          <div className="relative flex-1 space-y-3 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={`${msg.role}-${index}-${msg.text.slice(0, 12)}`}
                  layout
                  initial={{ opacity: 0, x: msg.role === "user" ? 18 : -18, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={cn("flex max-w-3xl gap-2", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
                >
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    className={cn("mt-1 rounded-full p-2", msg.role === "ai" ? "bg-secondary/10" : "bg-primary/10")}
                  >
                    {msg.role === "ai" ? (
                      <Sparkles className="h-4 w-4 text-secondary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </motion.div>
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm",
                      msg.role === "ai"
                        ? "border border-slate-200 bg-white text-slate-700"
                        : "bg-primary text-white",
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <footer className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:outline-none"
              />
              <Button onClick={handleSendMessage} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              This chat space is for communication support and does not replace professional medical care.
            </p>
          </footer>
        </motion.main>
      </div>
    </div>
  );
}
