import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChartNoAxesColumn, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { FAQForm, FAQList } from "../../../components/report-guidance";
import {
  createGuidanceId,
  formatTagLabel,
  loadReportGuidanceState,
  normalizeTag,
  saveReportGuidanceState,
  type FAQItem,
  type ReportGuidanceState,
} from "../../../lib/reportGuidance";

export default function DoctorFaqManagementPage() {
  const [state, setState] = useState<ReportGuidanceState>({ faqs: [], reports: [] });
  const [isReady, setIsReady] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    setState(loadReportGuidanceState());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveReportGuidanceState(state);
  }, [state, isReady]);

  const categories = useMemo(
    () =>
      [...new Set(state.faqs.map((faq) => faq.category?.trim()).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b),
      ),
    [state.faqs],
  );

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = searchText.toLowerCase().trim();
    const normalizedTag = normalizeTag(tagFilter);

    return state.faqs.filter((faq) => {
      const searchMatch =
        !normalizedSearch ||
        faq.question.toLowerCase().includes(normalizedSearch) ||
        faq.answer.toLowerCase().includes(normalizedSearch) ||
        faq.tags.some((tag) => tag.includes(normalizedSearch));

      const categoryMatch =
        categoryFilter === "all" || (faq.category || "").toLowerCase() === categoryFilter.toLowerCase();

      const tagMatch = !normalizedTag || faq.tags.some((tag) => tag.includes(normalizedTag));

      return searchMatch && categoryMatch && tagMatch;
    });
  }, [state.faqs, searchText, categoryFilter, tagFilter]);

  const editingFaq = useMemo(
    () => state.faqs.find((faq) => faq.id === editingFaqId) ?? null,
    [state.faqs, editingFaqId],
  );
  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    state.faqs.forEach((faq) => {
      const category = faq.category?.trim() || "General";
      map.set(category, (map.get(category) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [state.faqs]);
  const maxCategoryCount = categoryDistribution[0]?.[1] || 1;

  const handleCreateOrUpdateFaq = (formData: {
    question: string;
    answer: string;
    tags: string[];
    category?: string;
  }) => {
    if (!editingFaq) {
      const now = Date.now();
      const faq: FAQItem = {
        id: createGuidanceId("faq"),
        question: formData.question,
        answer: formData.answer,
        tags: formData.tags,
        category: formData.category,
        createdByDoctorId: "doctor_1",
        createdAt: now,
        updatedAt: now,
      };

      setState((prev) => ({
        ...prev,
        faqs: [faq, ...prev.faqs],
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq) =>
        faq.id === editingFaq.id
          ? {
              ...faq,
              question: formData.question,
              answer: formData.answer,
              tags: formData.tags,
              category: formData.category,
              updatedAt: Date.now(),
            }
          : faq,
      ),
    }));

    setEditingFaqId(null);
  };

  const handleDeleteFaq = (faqId: string) => {
    setState((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((faq) => faq.id !== faqId),
      reports: prev.reports.map((report) => ({
        ...report,
        assignedFaqIds: report.assignedFaqIds.filter((id) => id !== faqId),
        updatedAt: Date.now(),
      })),
    }));
  };

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-7 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3"
        >
          <Link to="/doctor" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Doctor Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">FAQ Explanations</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create reusable explanations to help patients better understand their reports.
            </p>
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-doctor p-6 sm:p-8"
        >
          <div className="flex items-center gap-2">
            <ChartNoAxesColumn className="h-4 w-4 text-secondary" />
            <h2 className="text-base font-semibold text-slate-900">FAQ Category Pulse</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Quick visual summary of FAQ distribution by category.
          </p>
          <div className="mt-4 space-y-3">
            {categoryDistribution.length === 0 ? (
              <p className="text-sm text-slate-500">No FAQs created yet.</p>
            ) : (
              categoryDistribution.map(([category, count], index) => (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{formatTagLabel(category.toLowerCase())}</span>
                    <span>{count}</span>
                  </div>
                  <div className="insight-track">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(8, Math.round((count / maxCategoryCount) * 100))}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, duration: 0.35 }}
                      className="insight-fill bg-secondary/80"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} id="faq-form" className="scroll-mt-24">
            <FAQForm
              title={editingFaq ? "Edit FAQ" : "Create FAQ"}
              subtitle={
                editingFaq
                  ? "Update this explanation and keep your patient education content current."
                  : "Create standard explanation content doctors can assign to reports."
              }
              submitLabel={editingFaq ? "Update FAQ" : "Save FAQ"}
              initialValues={
                editingFaq
                  ? {
                      question: editingFaq.question,
                      answer: editingFaq.answer,
                      tagsInput: editingFaq.tags.join(", "),
                      category: editingFaq.category || "",
                    }
                  : undefined
              }
              onSubmit={handleCreateOrUpdateFaq}
              onCancelEdit={editingFaq ? () => setEditingFaqId(null) : undefined}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-secondary" />
                <h2 className="text-base font-semibold text-slate-900">Search and Filter</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search text"
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
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setSearchText("");
                  setCategoryFilter("all");
                  setTagFilter("");
                }}>
                  Clear Filters
                </Button>
                <Link to="/doctor/reports/report_1">
                  <Button size="sm">Go to Report Assignment</Button>
                </Link>
              </div>
            </div>

            <FAQList
              faqs={filteredFaqs}
              onEdit={(faq) => setEditingFaqId(faq.id)}
              onDelete={handleDeleteFaq}
            />
          </motion.div>
        </section>
      </div>
    </div>
  );
}
