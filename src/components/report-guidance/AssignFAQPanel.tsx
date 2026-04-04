import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import {
  formatTagLabel,
  getSuggestedFaqIdsFromFindings,
  mergeUniqueIds,
  normalizeTag,
  type FAQItem,
} from "../../lib/reportGuidance";
import { cn } from "../../lib/utils";

type AssignFAQPanelProps = {
  faqs: FAQItem[];
  findings: string[];
  assignedFaqIds: string[];
  onChangeAssignedFaqIds: (ids: string[]) => void;
};

export function AssignFAQPanel({
  faqs,
  findings,
  assignedFaqIds,
  onChangeAssignedFaqIds,
}: AssignFAQPanelProps) {
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [suggestedFaqIds, setSuggestedFaqIds] = useState<string[]>([]);

  const categories = useMemo(
    () =>
      [...new Set(faqs.map((faq) => faq.category?.trim()).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b),
      ),
    [faqs],
  );

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = searchText.toLowerCase().trim();
    const normalizedTagFilter = normalizeTag(tagFilter);

    return faqs.filter((faq) => {
      const searchMatch =
        !normalizedSearch ||
        faq.question.toLowerCase().includes(normalizedSearch) ||
        faq.answer.toLowerCase().includes(normalizedSearch) ||
        faq.tags.some((tag) => tag.includes(normalizedSearch));

      const categoryMatch =
        categoryFilter === "all" || (faq.category || "").toLowerCase() === categoryFilter.toLowerCase();

      const tagMatch =
        !normalizedTagFilter ||
        faq.tags.some((tag) => tag.includes(normalizedTagFilter)) ||
        faq.question.toLowerCase().includes(normalizedTagFilter);

      return searchMatch && categoryMatch && tagMatch;
    });
  }, [faqs, searchText, categoryFilter, tagFilter]);

  const toggleAssign = (faqId: string) => {
    if (assignedFaqIds.includes(faqId)) {
      onChangeAssignedFaqIds(assignedFaqIds.filter((id) => id !== faqId));
      return;
    }
    onChangeAssignedFaqIds([...assignedFaqIds, faqId]);
  };

  const handleSuggest = () => {
    const suggested = getSuggestedFaqIdsFromFindings(faqs, findings);
    setSuggestedFaqIds(suggested);
    onChangeAssignedFaqIds(mergeUniqueIds(assignedFaqIds, suggested));
  };

  return (
    <section className="card p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Assign FAQ Explanations</h2>
          <p className="mt-1 text-sm text-slate-600">
            Select which FAQ explanations will appear in the patient report view.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleSuggest}>
          <Sparkles className="h-4 w-4" /> Suggest FAQs from Findings
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search FAQ text"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
          placeholder="Filter by tag"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
        />
      </div>

      <div className="mt-5 space-y-3">
        {filteredFaqs.length === 0 ? (
          <p className="text-sm text-slate-500">No FAQ items found for current filters.</p>
        ) : (
          filteredFaqs.map((faq) => {
            const isAssigned = assignedFaqIds.includes(faq.id);
            const isSuggested = suggestedFaqIds.includes(faq.id);

            return (
              <motion.label
                key={faq.id}
                layout
                whileHover={{ y: -1 }}
                className={cn(
                  "block cursor-pointer rounded-xl border p-4 transition-all",
                  isAssigned
                    ? "border-secondary/40 bg-secondary/10"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => toggleAssign(faq.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-secondary focus:ring-secondary"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {faq.answer.length > 130 ? `${faq.answer.slice(0, 130)}...` : faq.answer}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
                          >
                            {formatTagLabel(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {isSuggested ? (
                    <span className="rounded-full bg-secondary/15 px-2 py-1 text-[11px] font-semibold text-secondary">
                      Suggested
                    </span>
                  ) : null}
                </div>
              </motion.label>
            );
          })
        )}
      </div>
    </section>
  );
}
