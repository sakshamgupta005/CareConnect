import { useState } from "react";
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
      text: "Hello Eleanor. I reviewed your latest report. What would you like me to explain?",
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
        <aside className="card p-5">
          <h1 className="text-lg font-semibold text-slate-900">Patient Profile</h1>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p><span className="font-medium text-slate-900">Name:</span> Eleanor Rigby</p>
            <p><span className="font-medium text-slate-900">Patient ID:</span> ER-9021</p>
            <p><span className="font-medium text-slate-900">Care Plan:</span> Cardiac Recovery</p>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Tip</p>
            <p className="mt-1">Keep daily messages short and clear so important instructions are easy to follow.</p>
          </div>
        </aside>

        <main className="card flex min-h-[500px] flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-secondary/10 p-2">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">CareConnect AI Assistant</h2>
                <p className="text-xs text-slate-500">Always available</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
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
              </div>

              <button
                onClick={() => setSimpleMode((prev) => !prev)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs",
                  simpleMode
                    ? "border-secondary/40 bg-secondary/10 text-secondary"
                    : "border-slate-300 text-slate-600",
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Simple mode
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn("flex max-w-3xl gap-2", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={cn("mt-1 rounded-full p-2", msg.role === "ai" ? "bg-secondary/10" : "bg-primary/10")}>
                  {msg.role === "ai" ? (
                    <Sparkles className="h-4 w-4 text-secondary" />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
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
              </div>
            ))}
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
                placeholder="Ask about your care plan..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-secondary focus:outline-none"
              />
              <Button onClick={handleSendMessage} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              This assistant provides educational guidance and does not replace professional medical advice.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
