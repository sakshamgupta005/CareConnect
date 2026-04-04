"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Database,
  FileText,
  Loader,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { PatientProfileCard, ReportResultsView } from "../../components/report-data";
import { Button } from "../../components/ui/Button";
import { deleteContactSubmission, listContactSubmissions, type ContactSubmissionRecord } from "../../lib/contactApi";
import { getReportById, type ReportDetailsDto } from "../../lib/reportApi";
import { buildSubmissionProfileRecord } from "../../lib/submissionProfiles";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmissionRecord[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [selectedReportDetails, setSelectedReportDetails] = useState<ReportDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await listContactSubmissions();
        setSubmissions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load submissions.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubmissions();
  }, []);

  const profileRecords = useMemo(() => submissions.map(buildSubmissionProfileRecord), [submissions]);
  const selectedProfileRecord = useMemo(
    () => profileRecords.find((record) => record.submission.id === selectedSubmissionId) ?? null,
    [profileRecords, selectedSubmissionId],
  );

  useEffect(() => {
    if (profileRecords.length === 0) {
      setSelectedSubmissionId("");
      return;
    }

    setSelectedSubmissionId((current) =>
      profileRecords.some((record) => record.submission.id === current) ? current : profileRecords[0].submission.id,
    );
  }, [profileRecords]);

  useEffect(() => {
    const linkedReportId = selectedProfileRecord?.submission.linkedReportId?.trim() || "";
    if (!linkedReportId) {
      setSelectedReportDetails(null);
      setReportError("");
      setReportLoading(false);
      return;
    }

    let cancelled = false;

    const loadLinkedReport = async () => {
      setReportLoading(true);
      setReportError("");
      try {
        const details = await getReportById(linkedReportId);
        if (cancelled) return;
        setSelectedReportDetails(details);
      } catch (err) {
        if (cancelled) return;
        setSelectedReportDetails(null);
        setReportError(err instanceof Error ? err.message : "Could not load the linked report.");
      } finally {
        if (!cancelled) {
          setReportLoading(false);
        }
      }
    };

    void loadLinkedReport();

    return () => {
      cancelled = true;
    };
  }, [selectedProfileRecord]);

  const handleDeleteSubmission = async (submissionId: string) => {
    setError("");
    setDeletingId(submissionId);

    try {
      await deleteContactSubmission(submissionId);
      setSubmissions((current) => current.filter((item) => item.id !== submissionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete submission.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Patient Profile Directory</h1>
          <p className="text-slate-600">
            Open any saved patient profile to review the extracted report text, doctor notes, and linked AI-ready report output.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/doctor" className="inline-flex">
              <Button size="sm" variant="outline">Back to Doctor Dashboard</Button>
            </Link>
            <Link to="/doctor/data" className="inline-flex">
              <Button size="sm" variant="ghost">Open Saved Inputs View</Button>
            </Link>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading patient profiles...</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        ) : null}

        {!isLoading && profileRecords.length === 0 && !error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
            <p className="text-lg text-slate-500">No patient submissions yet.</p>
          </motion.div>
        ) : null}

        {!isLoading && profileRecords.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Saved profiles</p>
                  <p className="mt-1 text-xs text-slate-500">Click a patient to open their full submission context.</p>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  {profileRecords.length} total
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {profileRecords.map((record) => {
                  const isSelected = record.submission.id === selectedSubmissionId;

                  return (
                    <button
                      key={record.submission.id}
                      type="button"
                      onClick={() => setSelectedSubmissionId(record.submission.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-sky-300 bg-sky-50 shadow-[0_10px_30px_rgba(14,165,233,0.12)]"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                            <User className="h-5 w-5 text-sky-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{record.profile.displayName}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(record.submission.createdAt)}</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {record.submission.linkedReportStatus || "saved"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-600">{record.summary}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                        {record.reportTitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6">
              {selectedProfileRecord ? (
                <>
                  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          Selected patient profile
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                          {selectedProfileRecord.profile.displayName}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Saved on {formatDate(selectedProfileRecord.submission.createdAt)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void handleDeleteSubmission(selectedProfileRecord.submission.id)}
                        disabled={deletingId === selectedProfileRecord.submission.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === selectedProfileRecord.submission.id ? "Removing..." : "Remove Profile"}
                      </Button>
                    </div>

                    <div className="mt-5">
                      <PatientProfileCard
                        profile={selectedProfileRecord.profile}
                        title="Detected patient details"
                        subtitle="This view merges saved form fields with report-text extraction so the AI has a fuller patient profile."
                        actions={
                          <div className="flex flex-wrap gap-2">
                            {selectedProfileRecord.submission.linkedReportId ? (
                              <Link to={`/doctor/reports/${selectedProfileRecord.submission.linkedReportId}`}>
                                <Button size="sm" variant="outline">Open linked report</Button>
                              </Link>
                            ) : null}
                            {selectedProfileRecord.submission.reportFilePath ? (
                              <a href={selectedProfileRecord.submission.reportFilePath} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="ghost">Open uploaded file</Button>
                              </a>
                            ) : null}
                          </div>
                        }
                      />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InfoCard
                        icon={<Mail className="h-4 w-4 text-sky-600" />}
                        label="Email"
                        value={selectedProfileRecord.submission.email}
                      />
                      <InfoCard
                        icon={<Phone className="h-4 w-4 text-emerald-600" />}
                        label="Phone"
                        value={selectedProfileRecord.submission.phone || "Not provided"}
                      />
                      <InfoCard
                        icon={<FileText className="h-4 w-4 text-violet-600" />}
                        label="Report title"
                        value={selectedProfileRecord.reportTitle}
                      />
                      <InfoCard
                        icon={<Database className="h-4 w-4 text-amber-600" />}
                        label="Linked status"
                        value={selectedProfileRecord.submission.linkedReportStatus || "Saved only"}
                      />
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <MessageSquare className="h-4 w-4 text-sky-600" />
                          Doctor notes / submission message
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                          {selectedProfileRecord.submission.message}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <Calendar className="h-4 w-4 text-sky-600" />
                          AI-ready report text
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          This is the text block CareConnect can use for extraction and downstream report analysis.
                        </p>
                        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-sm leading-relaxed text-slate-700">
                          {selectedProfileRecord.aiReadyReportText || "No report text saved for this patient yet."}
                        </pre>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-sky-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Linked AI report output</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      When a submission was saved with analysis, its extracted insights, FAQs, and recommendations appear here.
                    </p>

                    {reportLoading ? (
                      <p className="mt-4 inline-flex items-center gap-2 text-sm text-sky-700">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading linked report data...
                      </p>
                    ) : null}

                    {reportError ? <p className="mt-4 text-sm text-amber-700">{reportError}</p> : null}

                    {!reportLoading && !reportError && !selectedReportDetails ? (
                      <p className="mt-4 text-sm text-slate-500">
                        This patient has a saved profile and report text, but no analyzed linked report yet.
                      </p>
                    ) : null}
                  </article>

                  {selectedReportDetails ? (
                    <ReportResultsView
                      data={selectedReportDetails}
                      title={`${selectedProfileRecord.profile.displayName} Report Intelligence`}
                      subtitle="AI analysis loaded from the report linked to this patient profile."
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="inline-flex rounded-lg bg-white p-2 shadow-sm">{icon}</div>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(dateString: string): string {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
