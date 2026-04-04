import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ReportResultsView } from "../../components/report-data";
import { Button } from "../../components/ui/Button";
import { getReportById, type ReportDetailsDto } from "../../lib/reportApi";

export default function ReportResultsPage() {
  const { reportId = "" } = useParams();
  const [details, setDetails] = useState<ReportDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      setIsLoading(true);
      setError("");
      try {
        const loaded = await getReportById(reportId);
        if (cancelled) return;
        setDetails(loaded);
      } catch (loadError) {
        if (cancelled) return;
        setDetails(null);
        setError(loadError instanceof Error ? loadError.message : "Could not load report.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (reportId) {
      void loadReport();
    } else {
      setIsLoading(false);
      setError("Missing report id.");
    }

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <section className="card p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm text-secondary">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading full report results...
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <section className="card p-6 sm:p-8">
            <h1 className="text-xl font-semibold text-slate-900">Report not found</h1>
            <p className="mt-2 text-sm text-slate-600">{error || "No data found for this report id."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/doctor">
                <Button variant="outline">Doctor Dashboard</Button>
              </Link>
              <Link to="/patient">
                <Button>Patient Dashboard</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Full Report Results</h1>
            <p className="mt-1 text-sm text-slate-600">
              End-to-end report summary, findings, FAQ explanations, and recommendations.
            </p>
          </div>
        </motion.header>

        <ReportResultsView
          data={details}
          title={details.report.title}
          subtitle="Database-driven output generated from uploaded report text."
        />
      </div>
    </div>
  );
}
