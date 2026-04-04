import { type ReactNode } from "react";
import { BarChart3, FileText, Lightbulb, MessageSquareText, Sparkles } from "lucide-react";
import { type ReportDetailsDto } from "../../lib/reportApi";
import { CompactInsightsGraph } from "./CompactInsightsGraph";
import { FaqItem } from "./FaqItem";
import { InsightCard } from "./InsightCard";
import { RecommendationCard } from "./RecommendationCard";

type ReportResultsViewProps = {
  data: ReportDetailsDto;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  showRawTextPreview?: boolean;
};

export function ReportResultsView({
  data,
  title = "Report Results",
  subtitle = "AI-generated summary, insights, FAQs, and recommendations from this report.",
  headerAction,
  showRawTextPreview = true,
}: ReportResultsViewProps) {
  const { report, insights, faqs, recommendations } = data;

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReportMetric label="Status" value={report.status} />
          <ReportMetric label="Insights" value={`${insights.length}`} />
          <ReportMetric label="FAQs" value={`${faqs.length}`} />
          <ReportMetric label="Recommendations" value={`${recommendations.length}`} />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles className="h-4 w-4 text-secondary" />
            Summary
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {report.aiSummary || "This report is uploaded and waiting for analysis."}
          </p>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BarChart3 className="h-4 w-4 text-secondary" />
          Compact Insight Graph
        </p>
        <p className="mt-1 text-sm text-slate-600">
          A compact bar view of extracted report metrics.
        </p>
        <div className="mt-4">
          <CompactInsightsGraph insights={insights} />
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FileText className="h-4 w-4 text-secondary" />
          Key Insights
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {insights.length > 0 ? (
            insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
          ) : (
            <p className="text-sm text-slate-600">No insights available yet.</p>
          )}
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MessageSquareText className="h-4 w-4 text-secondary" />
          FAQs
        </p>
        <div className="mt-4 space-y-3">
          {faqs.length > 0 ? faqs.map((item) => <FaqItem key={item.id} item={item} />) : <p className="text-sm text-slate-600">No FAQs generated yet.</p>}
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Lightbulb className="h-4 w-4 text-secondary" />
          Recommendations
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recommendations.length > 0 ? (
            recommendations.map((item) => <RecommendationCard key={item.id} item={item} />)
          ) : (
            <p className="text-sm text-slate-600">No recommendations generated yet.</p>
          )}
        </div>
      </section>

      {showRawTextPreview ? (
        <section className="card p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-slate-900">Raw Report Text</h3>
          <p className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {report.rawText}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

