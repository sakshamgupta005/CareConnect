import { type FAQItem } from "../../lib/reportGuidance";
import { FAQCard } from "./FAQCard";
import { EmptyState } from "./EmptyState";

type FAQListProps = {
  faqs: FAQItem[];
  onEdit: (faq: FAQItem) => void;
  onDelete: (faqId: string) => void;
};

export function FAQList({ faqs, onEdit, onDelete }: FAQListProps) {
  if (faqs.length === 0) {
    return (
      <EmptyState
        title="No FAQs match your filters"
        description="Try clearing filters or create a new FAQ explanation."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {faqs.map((faq) => (
        <div key={faq.id}>
          <FAQCard faq={faq} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
