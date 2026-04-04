import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { type FaqDto } from "../../lib/reportApi";

type FaqItemProps = {
  item: FaqDto;
};

export function FaqItem({ item }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{item.question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-slate-500"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-slate-200"
          >
            <p className="px-4 py-3 text-sm leading-relaxed text-slate-700">{item.answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

