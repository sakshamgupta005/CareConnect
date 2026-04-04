import { motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { formatTagLabel, type FAQItem } from "../../lib/reportGuidance";

type FAQCardProps = {
  faq: FAQItem;
  onEdit: (faq: FAQItem) => void;
  onDelete: (faqId: string) => void;
};

export function FAQCard({ faq, onEdit, onDelete }: FAQCardProps) {
  const preview = faq.answer.length > 180 ? `${faq.answer.slice(0, 180)}...` : faq.answer;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{faq.question}</h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          {faq.category || "General"}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-600">{preview}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {faq.tags.length === 0 ? (
          <span className="text-xs text-slate-500">No tags</span>
        ) : (
          faq.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
            >
              {formatTagLabel(tag)}
            </span>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(faq)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(faq.id)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </motion.article>
  );
}
