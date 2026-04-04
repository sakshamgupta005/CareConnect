import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChartNoAxesColumn, FileQuestion, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { FaqItem, FocusBars } from "../../../components/report-data";
import { Button } from "../../../components/ui/Button";
import { deriveReportFocus } from "../../../lib/reportFocus";
import { getReportById, listReports, type FaqDto, type ReportDetailsDto, type ReportListItemDto } from "../../../lib/reportApi";

type FaqExplorerItem = FaqDto & {
  reportTitle: string;
  reportStatus: string;
  category: string;
};

export default function DoctorFaqManagementPage() {
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [faqItems, setFaqItems] = useState<FaqExplorerItem[]>([]);
  const [latestDetails, setLatestDetails] = useState<ReportDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const loadedReports = await listReports();
        if (cancelled) return;
        setReports(loadedReports);

        const detailResponses = await Promise.all(
          loadedReports.map(async (report) => getReportById(report.id)),
        );

        if (cancelled) return;

        const mergedFaqs = detailResponses.flatMap((detail) =>
          detail.faqs.map((faq) => ({
            ...faq,
            reportTitle: detail.report.title,
            reportStatus: detail.report.status,
            category: deriveFaqCategory(faq.question),
          })),
        );

        const previewDetail =
          detailResponses.find((detail) => detail.report.status === "analyzed") ?? detailResponses[0] ?? null;

        setLatestDetails(previewDetail);
        setFaqItems(mergedFaqs);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load FAQ data.");
        setLatestDetails(null);
        setFaqItems([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set<string>(faqItems.map((faq) => faq.category))).sort((a, b) => a.localeCompare(b)),
    [faqItems],
  );

  const reportOptions = useMemo(
    () => reports.map((report) => ({ id: report.id, title: report.title })),
    [reports],
  );

  const filteredFaqs = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return faqItems.filter((faq) => {
      const searchMatch =
        !search ||
        faq.question.toLowerCase().includes(search) ||
        faq.answer.toLowerCase().includes(search) ||
        faq.reportTitle.toLowerCase().includes(search);

      const categoryMatch = categoryFilter === "all" || faq.category === categoryFilter;
      const reportMatch = reportFilter === "all" || faq.reportId === reportFilter;

      return searchMatch && categoryMatch && reportMatch;
    });
  }, [faqItems, searchText, categoryFilter, reportFilter]);

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    filteredFaqs.forEach((faq) => {
      map.set(faq.category, (map.get(faq.category) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredFaqs]);

  const maxCategoryCount = categoryDistribution[0]?.[1] || 1;
  const reportFocus = deriveReportFocus(latestDetails);

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
              {reportFocus.doctorDescription}
            </p>
          </div>
        </motion.header>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-doctor p-6 sm:p-8"
          >
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${reportFocus.concernClassName}`}>
              {reportFocus.concernLabel}
            </div>
            <h2 className="mt-3 text-base font-semibold text-slate-900">{reportFocus.label}</h2>
            <p className="mt-2 text-sm text-slate-600">{reportFocus.siteHeadline}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {reportFocus.quickFacts.map((fact, index) => (
                <li key={`faq-focus-${index}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </motion.article>

          <FocusBars
            bars={reportFocus.bars}
            title="Current report graph"
            subtitle="The FAQ explorer graph is tied to the latest analyzed report."
          />
        </section>

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
            Compact distribution of generated explanation questions.
          </p>
          <div className="mt-4 space-y-3">
            {categoryDistribution.length > 0 ? (
              categoryDistribution.map(([category, count], index) => (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{category}</span>
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
            ) : (
              <p className="text-sm text-slate-500">
                {isLoading ? "Loading FAQ distribution..." : "No FAQs available yet."}
              </p>
            )}
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
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
                <select
                  value={reportFilter}
                  onChange={(event) => setReportFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
                >
                  <option value="all">All reports</option>
                  {reportOptions.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchText("");
                    setCategoryFilter("all");
                    setReportFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
                <Link to="/test-upload">
                  <Button size="sm">Upload Another Report</Button>
                </Link>
              </div>
              {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900">Data Summary</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>{reports.length} total reports in pipeline</li>
                <li>{faqItems.length} generated explanation FAQs</li>
                <li>{filteredFaqs.length} FAQs match current filter</li>
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            {isLoading ? (
              <div className="card p-5">
                <p className="inline-flex items-center gap-2 text-sm text-secondary">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading FAQs...
                </p>
              </div>
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <article key={faq.id} className="card p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{faq.reportTitle}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {faq.category}
                      </span>
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {faq.reportStatus}
                      </span>
                    </div>
                  </div>
                  <FaqItem item={faq} />
                  <div className="mt-2">
                    <Link to={`/doctor/reports/${faq.reportId}`} className="text-xs font-medium text-secondary hover:underline">
                      Open report
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="card p-5">
                <p className="text-sm text-slate-600">
                  No FAQs found for the selected filters.
                </p>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function deriveFaqCategory(question: string): string {
  const lower = question.toLowerCase();

  if (lower.includes("hemoglobin") || lower.includes("anemia")) return "Blood";
  if (lower.includes("vitamin")) return "Vitamins";
  if (lower.includes("cholesterol")) return "Lipid";
  if (lower.includes("glucose") || lower.includes("sugar")) return "Glucose";
  if (lower.includes("thyroid") || lower.includes("tsh")) return "Thyroid";
  return "General";
}
