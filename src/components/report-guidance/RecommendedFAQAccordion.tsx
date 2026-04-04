import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export type RecommendedFaqItem = {
  id: string;
  question: string;
  answer: string;
};

type RecommendedFAQAccordionProps = {
  items: RecommendedFaqItem[];
};

export function RecommendedFAQAccordion({ items }: RecommendedFAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setOpenId(null);
      return;
    }

    setOpenId((current) => (current && items.some((item) => item.id === current) ? current : items[0].id));
  }, [items]);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <motion.article
            layout
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
          >
            <button
              type="button"
              onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
            >
              <span className="text-sm font-semibold text-slate-900 sm:text-base">{item.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-slate-500"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden border-t border-slate-200"
                >
                  <p className="px-4 py-4 text-sm leading-relaxed text-slate-700 sm:px-5">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </div>
  );
}
