import { useState } from "react";
import { motion } from "motion/react";
import { LoaderCircle, UploadCloud } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ReportResultsView } from "../../components/report-data";
import { uploadPdfToServer } from "../../lib/pdfUploadApi";
import {
  analyzeReport,
  getReportById,
  uploadReport,
  type ReportDetailsDto,
} from "../../lib/reportApi";

export default function TestUploadPage() {
  const [title, setTitle] = useState("Clinical Report");
  const [fileName, setFileName] = useState("manual-report.txt");
  const [fileType, setFileType] = useState("text/plain");
  const [rawText, setRawText] = useState("");
  const [reportId, setReportId] = useState("");
  const [details, setDetails] = useState<ReportDetailsDto | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleExtractPdf = async (file: File) => {
    if (!file) return;

    setError("");
    setMessage("");
    setPdfLoading(true);

    try {
      const uploaded = await uploadPdfToServer(file);
      setRawText(uploaded.reportText);
      setFileName(uploaded.originalFileName);
      setFileType("application/pdf");
      setMessage("PDF parsed successfully. You can now save and analyze this report.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not parse PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSaveReport = async () => {
    setError("");
    setMessage("");
    setDetails(null);
    setSaveLoading(true);

    try {
      const saved = await uploadReport({
        title: title.trim() || "Clinical Report",
        fileName: fileName.trim() || "manual-report.txt",
        fileType: fileType.trim() || "text/plain",
        rawText,
      });

      setReportId(saved.id);
      setDetails({
        report: saved,
        insights: [],
        faqs: [],
        recommendations: [],
      });
      setMessage("Report saved. You can run analysis now.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save report.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAnalyzeReport = async () => {
    if (!reportId.trim()) {
      setError("Save a report first (or enter an existing report ID).");
      return;
    }

    setError("");
    setMessage("");
    setAnalyzeLoading(true);

    try {
      const analyzed = await analyzeReport(reportId.trim());
      setDetails(analyzed);
      setMessage("Report analyzed successfully.");
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : "Could not analyze report.");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleLoadReport = async () => {
    if (!reportId.trim()) {
      setError("Enter a report ID first.");
      return;
    }

    setError("");
    setMessage("");
    setAnalyzeLoading(true);

    try {
      const loaded = await getReportById(reportId.trim());
      setDetails(loaded);
      setMessage("Report loaded successfully.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load report.");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Test Upload and Analysis</h1>
          <p className="text-sm text-slate-600">
            Save real report text, run deterministic AI analysis, and view DB-driven output.
          </p>
        </motion.header>

        <section className="card p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Report Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                placeholder="Blood Test - April 2026"
              />
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span>Report ID (existing)</span>
              <input
                value={reportId}
                onChange={(event) => setReportId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                placeholder="Paste report ID to reload"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm text-slate-700">
              <span>File Name</span>
              <input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                placeholder="report.pdf"
              />
            </label>

            <label className="space-y-1.5 text-sm text-slate-700">
              <span>File Type</span>
              <input
                value={fileType}
                onChange={(event) => setFileType(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                placeholder="application/pdf"
              />
            </label>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 hover:bg-slate-100">
            <UploadCloud className="h-5 w-5 text-secondary" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">Extract text from PDF (optional)</p>
              <p className="text-xs text-slate-500">This fills the raw report text box automatically.</p>
            </div>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleExtractPdf(file);
                }
                event.target.value = "";
              }}
            />
          </label>

          <label className="mt-4 block space-y-1.5 text-sm text-slate-700">
            <span>Raw Report Text</span>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={10}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
              placeholder="Paste report text here..."
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={handleSaveReport} disabled={saveLoading || pdfLoading || !rawText.trim()}>
              {saveLoading ? "Saving..." : "Save Report"}
            </Button>
            <Button variant="secondary" onClick={handleAnalyzeReport} disabled={analyzeLoading || !reportId.trim()}>
              {analyzeLoading ? "Analyzing..." : "Analyze Report"}
            </Button>
            <Button variant="outline" onClick={handleLoadReport} disabled={analyzeLoading || !reportId.trim()}>
              Load Report by ID
            </Button>
          </div>

          {pdfLoading ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-secondary">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Parsing PDF...
            </p>
          ) : null}
          {message ? <p className="mt-3 text-sm text-secondary">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>

        {details ? (
          <ReportResultsView
            data={details}
            title="Analyzed Report Output"
            subtitle="This data is loaded from Prisma/Supabase."
          />
        ) : null}
      </div>
    </div>
  );
}

