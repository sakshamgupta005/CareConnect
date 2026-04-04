import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Database, FileText, Mail, RefreshCcw } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { ReportResultsView } from "../../../components/report-data";
import { listContactSubmissions, type ContactSubmissionRecord } from "../../../lib/contactApi";
import { getReportById, listReports, type ReportDetailsDto, type ReportListItemDto } from "../../../lib/reportApi";

export default function DoctorDataPage() {
  const [contacts, setContacts] = useState<ContactSubmissionRecord[]>([]);
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedReportDetails, setSelectedReportDetails] = useState<ReportDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBaseData = async () => {
    setLoading(true);
    setError("");
    try {
      const [loadedContacts, loadedReports] = await Promise.all([listContactSubmissions(), listReports()]);
      setContacts(loadedContacts);
      setReports(loadedReports);
      const preferredReportId =
        loadedReports.find((report) => report.status === "analyzed")?.id ?? loadedReports[0]?.id ?? "";
      setSelectedReportId((current) => current || preferredReportId);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load saved inputs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBaseData();
  }, []);

  useEffect(() => {
    if (!selectedReportId) {
      setSelectedReportDetails(null);
      return;
    }

    let cancelled = false;
    const loadReportDetails = async () => {
      setReportLoading(true);
      setError("");
      try {
        const details = await getReportById(selectedReportId);
        if (cancelled) return;
        setSelectedReportDetails(details);
      } catch (loadError) {
        if (cancelled) return;
        setSelectedReportDetails(null);
        setError(loadError instanceof Error ? loadError.message : "Could not load report details.");
      } finally {
        if (!cancelled) {
          setReportLoading(false);
        }
      }
    };

    void loadReportDetails();

    return () => {
      cancelled = true;
    };
  }, [selectedReportId]);

  const stats = useMemo(() => {
    const analyzed = reports.filter((report) => report.status === "analyzed").length;
    return {
      contacts: contacts.length,
      reports: reports.length,
      analyzed,
    };
  }, [contacts, reports]);

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3"
        >
          <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            Doctor Data View
          </p>
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Saved Website Inputs</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            View contact submissions and all report input data saved through the website forms.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadBaseData()} disabled={loading || reportLoading}>
              <RefreshCcw className="h-4 w-4" />
              Refresh Data
            </Button>
            <Link to="/doctor">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </motion.header>

        <section className="grid gap-3 sm:grid-cols-3">
          <MetricCard icon={Mail} label="Contact Submissions" value={`${stats.contacts}`} />
          <MetricCard icon={FileText} label="Uploaded Reports" value={`${stats.reports}`} />
          <MetricCard icon={Database} label="Analyzed Reports" value={`${stats.analyzed}`} />
        </section>

        {error ? <p className="text-sm text-amber-700">{error}</p> : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Contact Form Data</h2>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {contacts.length} entries
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Loading contact submissions...</p>
              ) : contacts.length === 0 ? (
                <p className="text-sm text-slate-500">No contact submissions found yet.</p>
              ) : (
                contacts.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                      <span className="text-xs text-slate-500">{formatDate(entry.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">Email: {entry.email}</p>
                    <p className="mt-1 text-xs text-slate-600">Phone: {entry.phone || "Not provided"}</p>
                    <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {entry.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Report Input Data</h2>
            <p className="mt-1 text-sm text-slate-600">See the exact report fields submitted through upload forms.</p>

            <label className="mt-4 block space-y-1.5 text-sm text-slate-700">
              <span>Select report</span>
              <select
                value={selectedReportId}
                onChange={(event) => setSelectedReportId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-secondary focus:outline-none"
              >
                {reports.length === 0 ? <option value="">No reports available</option> : null}
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.title} ({report.status})
                  </option>
                ))}
              </select>
            </label>

            {reportLoading ? <p className="mt-4 text-sm text-slate-500">Loading selected report...</p> : null}

            {selectedReportDetails ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">Report ID</p>
                  <p className="mt-1 break-all">{selectedReportDetails.report.id}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">Uploaded file</p>
                  <p className="mt-1">{selectedReportDetails.report.fileName}</p>
                  <p className="mt-1">Type: {selectedReportDetails.report.fileType}</p>
                  <p className="mt-1">Saved PDF path: {selectedReportDetails.report.filePath || "No PDF path saved"}</p>
                  {selectedReportDetails.report.filePath ? (
                    <a
                      href={selectedReportDetails.report.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex font-medium text-secondary hover:underline"
                    >
                      Open uploaded PDF
                    </a>
                  ) : null}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">Raw report text (preview)</p>
                  <p className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-2 leading-relaxed">
                    {selectedReportDetails.report.rawText || "No text available."}
                  </p>
                </div>
                <Link to={`/reports/${selectedReportDetails.report.id}`} className="inline-flex">
                  <Button size="sm" variant="outline">Open Full Result Page</Button>
                </Link>
              </div>
            ) : (
              !reportLoading && <p className="mt-4 text-sm text-slate-500">Select a report to view saved input fields.</p>
            )}
          </article>
        </section>

        {selectedReportDetails ? (
          <ReportResultsView
            data={selectedReportDetails}
            title="Saved Analysis Output"
            subtitle="These insights, FAQs, and recommendations are loaded from the database."
          />
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <article className="card p-4">
      <div className="inline-flex rounded-lg bg-secondary/10 p-2">
        <Icon className="h-4 w-4 text-secondary" />
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
