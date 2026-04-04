import { type ChangeEvent, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, FileText, LoaderCircle, UploadCloud, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ReportResultsView } from "../../../components/report-data";
import { Button } from "../../../components/ui/Button";
import { uploadPdfToServer } from "../../../lib/pdfUploadApi";
import { analyzeReport, getReportById, uploadReport, type ReportDetailsDto } from "../../../lib/reportApi";

export default function DoctorReportDetailsPage() {
  const { reportId = "" } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState<ReportDetailsDto | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [selectedUploadPreviewUrl, setSelectedUploadPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      setIsLoading(true);
      setError("");
      setMessage("");

      try {
        const loaded = await getReportById(reportId);
        if (cancelled) return;
        setDetails(loaded);
        setTitleInput(loaded.report.title);
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
      setDetails(null);
      setIsLoading(false);
      setError("Missing report id.");
    }

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  useEffect(() => {
    if (!selectedUploadFile) {
      setSelectedUploadPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedUploadFile);
    setSelectedUploadPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedUploadFile]);

  const handleReportUploadSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedUploadFile(file);
    setUploadState("idle");
    setMessage("");
    setError("");
    event.target.value = "";
  };

  const handleClearSelectedUpload = () => {
    setSelectedUploadFile(null);
  };

  const handleAnalyzeCurrentReport = async () => {
    if (!details || analysisLoading) return;

    setAnalysisLoading(true);
    setError("");
    setMessage("Analyzing your report...");
    setUploadState("idle");

    try {
      const analyzed = await analyzeReport(details.report.id);
      setDetails(analyzed);
      setMessage("Analysis complete.");
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : "Could not analyze report.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedUploadFile) return;

    setUploadState("uploading");
    setAnalysisLoading(false);
    setError("");
    setMessage("");

    try {
      const uploaded = await uploadPdfToServer(selectedUploadFile);

      const saved = await uploadReport({
        title: titleInput.trim() || "Uploaded Clinical Report",
        fileName: uploaded.originalFileName,
        fileType: "application/pdf",
        rawText: uploaded.reportText,
      });

      const analyzed = await analyzeReport(saved.id);
      setDetails(analyzed);
      setTitleInput(analyzed.report.title);
      setSelectedUploadFile(null);
      setUploadState("success");
      setMessage("PDF uploaded and report analyzed successfully.");

      if (saved.id !== reportId) {
        navigate(`/doctor/reports/${saved.id}`, { replace: true });
      }
    } catch (uploadError) {
      setUploadState("error");
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload and analyze report.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <section className="card p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm text-secondary">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading report details...
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
            <p className="mt-2 text-sm text-slate-600">
              {error || "This report does not exist yet. Upload a new report to continue."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/doctor">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <Link to="/test-upload">
                <Button>Create New Report</Button>
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
          <Link
            to="/doctor"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Doctor Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Report Analysis Manager</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage this report and refresh AI insights, FAQs, and recommendations.
            </p>
          </div>
        </motion.header>

        <section className="card-doctor p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Upload New PDF Version</h2>
          <p className="mt-1 text-sm text-slate-600">
            Uploading creates a new report record, then runs analysis automatically.
          </p>

          <label className="mt-4 block space-y-1.5 text-sm text-slate-700">
            <span>Report title</span>
            <input
              value={titleInput}
              onChange={(event) => setTitleInput(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
              placeholder="Blood Test - April 2026"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100">
            <UploadCloud className="h-5 w-5 text-secondary" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">Select PDF file</p>
              <p className="text-xs text-slate-500">Text-based PDF recommended</p>
            </div>
            <input type="file" accept=".pdf,application/pdf" onChange={handleReportUploadSelection} className="hidden" />
          </label>

          <div className="mt-3 space-y-2">
            {selectedUploadFile ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  {selectedUploadPreviewUrl ? (
                    <a href={selectedUploadPreviewUrl} target="_blank" rel="noreferrer" className="truncate font-medium hover:underline">
                      Selected: {selectedUploadFile.name}
                    </a>
                  ) : (
                    <span className="truncate font-medium">Selected: {selectedUploadFile.name}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedUpload}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Remove selected file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No file selected.</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleUploadAndAnalyze}
              disabled={!selectedUploadFile || uploadState === "uploading" || analysisLoading}
            >
              {uploadState === "uploading" ? "Uploading..." : "Upload and Analyze"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyzeCurrentReport}
              disabled={analysisLoading || uploadState === "uploading"}
            >
              {analysisLoading ? "Analyzing..." : "Re-analyze Current Report"}
            </Button>
          </div>

          {message ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-secondary">
              {uploadState === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
              {message}
            </p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>

        <ReportResultsView
          data={details}
          title="Current Report Results"
          subtitle="This view is fully database-driven from uploaded report content."
          headerAction={
            <Link to={`/patient/reports/${details.report.id}`}>
              <Button size="sm" variant="secondary">Open Patient View</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
