import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, ClipboardList, FileText, Link2, LoaderCircle, Mail, MapPin, MessageCircle, Phone, Share2, Sparkles, UploadCloud } from "lucide-react";
import { FocusBars, PatientProfileCard } from "../../components/report-data";
import { Button } from "../../components/ui/Button";
import { submitContactForm } from "../../lib/contactApi";
import { extractPatientProfile } from "../../lib/patientProfile";
import { uploadPdfToServer } from "../../lib/pdfUploadApi";
import { deriveReportFocus } from "../../lib/reportFocus";
import { analyzeReport, getReportById, listReports, uploadReport, type ReportDetailsDto, type ReportListItemDto } from "../../lib/reportApi";

const SITE_URL = "https://skill-deploy-21fwgx1iwt-codex-agent-deploys.vercel.app";
const QR_IMAGE_URL =
  "https://res.cloudinary.com/dyxlavy0j/image/upload/v1775298105/WhatsApp_Image_2026-04-04_at_3.49.17_PM_ss4a3g.jpg";
const LOGIN_STORAGE_KEY = "careconnect_logged_in";
const PROFILE_SAMPLE_TEXT = `Patient Name: Priya Sharma
Age: 45 years
Gender: Female
Blood Group: O+
Hemoglobin: 11.2 g/dL
Glucose: 96 mg/dL`;

type FeedbackAnswer = "clear" | "simpler" | "doctor" | "unsure";

type FeedbackQuestion = {
  id: string;
  question: string;
  source: "insight" | "faq" | "general";
};

const FEEDBACK_ANSWER_OPTIONS: Array<{ value: FeedbackAnswer; label: string }> = [
  { value: "clear", label: "Clear, understood" },
  { value: "simpler", label: "Need simpler explanation" },
  { value: "doctor", label: "Need doctor follow-up" },
  { value: "unsure", label: "Still unsure" },
];

const FEEDBACK_ANSWER_LABELS: Record<FeedbackAnswer, string> = {
  clear: "Clear, understood",
  simpler: "Need simpler explanation",
  doctor: "Need doctor follow-up",
  unsure: "Still unsure",
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRole, setContactRole] = useState("Patient");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientBloodGroup, setPatientBloodGroup] = useState("");
  const [reportTitle, setReportTitle] = useState("Patient Lab Report");
  const [reportFileName, setReportFileName] = useState("patient-report.txt");
  const [reportFileType, setReportFileType] = useState("text/plain");
  const [reportFilePath, setReportFilePath] = useState("");
  const [reportRawText, setReportRawText] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"save" | "analyze" | null>(null);
  const [reportPdfLoading, setReportPdfLoading] = useState(false);
  const [contactSubmitError, setContactSubmitError] = useState("");
  const [contactStatusMessage, setContactStatusMessage] = useState("");
  const [contactSubmissionId, setContactSubmissionId] = useState("");
  const [savedReportId, setSavedReportId] = useState("");
  const [savedReportStatus, setSavedReportStatus] = useState<"uploaded" | "analyzed" | "">("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared" | "error">("idle");
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedReportDetails, setSelectedReportDetails] = useState<ReportDetailsDto | null>(null);
  const [feedbackAnswers, setFeedbackAnswers] = useState<Record<string, FeedbackAnswer>>({});
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "copied" | "sent" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsLoggedIn(window.localStorage.getItem(LOGIN_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (shareState === "idle") return;
    const timer = window.setTimeout(() => setShareState("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [shareState]);

  useEffect(() => {
    if (feedbackState === "idle") return;
    const timer = window.setTimeout(() => setFeedbackState("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [feedbackState]);

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      setFeedbackLoading(true);
      setFeedbackError("");
      try {
        const loadedReports = await listReports();
        if (cancelled) return;
        setReports(loadedReports);
        const preferredReportId =
          loadedReports.find((report) => report.status === "analyzed")?.id ?? loadedReports[0]?.id ?? "";
        setSelectedReportId((current) => current || preferredReportId);
      } catch (error) {
        if (cancelled) return;
        setFeedbackError(error instanceof Error ? error.message : "Could not load reports.");
      } finally {
        if (!cancelled) {
          setFeedbackLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedReportId) {
      setSelectedReportDetails(null);
      setFeedbackAnswers({});
      return;
    }

    let cancelled = false;

    const loadSelectedReport = async () => {
      setFeedbackLoading(true);
      setFeedbackError("");
      try {
        const details = await getReportById(selectedReportId);
        if (cancelled) return;
        setSelectedReportDetails(details);
        setFeedbackAnswers({});
      } catch (error) {
        if (cancelled) return;
        setSelectedReportDetails(null);
        setFeedbackError(error instanceof Error ? error.message : "Could not load selected report.");
      } finally {
        if (!cancelled) {
          setFeedbackLoading(false);
        }
      }
    };

    void loadSelectedReport();

    return () => {
      cancelled = true;
    };
  }, [selectedReportId]);

  const selectedReportFocus = deriveReportFocus(selectedReportDetails);
  const compiledReportText = useMemo(
    () =>
      buildSubmissionReportText({
        patientName: contactName,
        age: patientAge,
        gender: patientGender,
        bloodGroup: patientBloodGroup,
        reportText: reportRawText,
      }),
    [contactName, patientAge, patientGender, patientBloodGroup, reportRawText],
  );
  const detectedProfile = useMemo(
    () =>
      extractPatientProfile({
        title: reportTitle.trim() || "Patient Lab Report",
        rawText: compiledReportText,
      }),
    [compiledReportText, reportTitle],
  );

  const handleExtractPdf = async (file: File) => {
    if (!file) return;

    setContactSubmitError("");
    setContactStatusMessage("");
    setReportPdfLoading(true);

    try {
      const uploaded = await uploadPdfToServer(file);
      setReportRawText(uploaded.reportText);
      setReportFileName(uploaded.originalFileName);
      setReportFileType("application/pdf");
      setReportFilePath(uploaded.filePath);
      setContactStatusMessage("PDF parsed successfully. The extracted text is ready to save or analyze.");
    } catch (error) {
      setContactSubmitError(error instanceof Error ? error.message : "Could not parse PDF.");
    } finally {
      setReportPdfLoading(false);
    }
  };

  const handleInsertSampleLayout = () => {
    setReportRawText((current) => (current.trim() ? `${PROFILE_SAMPLE_TEXT}\n\n${current}` : PROFILE_SAMPLE_TEXT));
    if (!patientAge.trim()) setPatientAge("45 years");
    if (!patientGender.trim()) setPatientGender("Female");
    if (!patientBloodGroup.trim()) setPatientBloodGroup("O+");
    if (!contactName.trim()) setContactName("Priya Sharma");
    if (!reportTitle.trim()) setReportTitle("Patient Lab Report");
    setContactStatusMessage("Sample profile layout inserted. The detector should now see age, gender, and blood group.");
    setContactSubmitError("");
  };

  const handleSaveSubmission = async (shouldAnalyze: boolean) => {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactSubmitError("Name, email, and submission message are required before saving.");
      return;
    }

    if (shouldAnalyze && !reportRawText.trim()) {
      setContactSubmitError("Add report text or upload a PDF before running analysis.");
      return;
    }

    setSubmitAction(shouldAnalyze ? "analyze" : "save");
    setContactSubmitting(true);
    setContactSubmitError("");
    setContactStatusMessage("");

    try {
      const hasReportContent = Boolean(reportRawText.trim());
      const normalizedReportTitle = reportTitle.trim() || `${contactName.trim() || "Patient"} Report`;
      const normalizedFileName = reportFileName.trim() || (reportFilePath.trim() ? "patient-report.pdf" : "patient-report.txt");
      const normalizedFileType = reportFileType.trim() || (reportFilePath.trim() ? "application/pdf" : "text/plain");
      let linkedReportId = "";
      let linkedReportStatus: "uploaded" | "analyzed" | undefined;

      if (hasReportContent) {
        const savedReport = await uploadReport({
          title: normalizedReportTitle,
          fileName: normalizedFileName,
          fileType: normalizedFileType,
          filePath: reportFilePath.trim() || undefined,
          rawText: compiledReportText,
          patientId: contactEmail.trim() ? `contact:${contactEmail.trim().toLowerCase()}` : undefined,
          phone: contactPhone.trim() || undefined,
        });

        linkedReportId = savedReport.id;
        linkedReportStatus = "uploaded";

        if (shouldAnalyze) {
          const analyzedReport = await analyzeReport(savedReport.id);
          linkedReportId = analyzedReport.report.id;
          linkedReportStatus = "analyzed";
          setSelectedReportId(analyzedReport.report.id);
        } else {
          setSelectedReportId(savedReport.id);
        }
      }

      const result = await submitContactForm({
        name: contactName,
        email: contactEmail,
        phone: contactPhone || undefined,
        role: contactRole,
        age: patientAge || undefined,
        gender: patientGender || undefined,
        bloodGroup: patientBloodGroup || undefined,
        reportTitle: hasReportContent ? normalizedReportTitle : undefined,
        reportFileName: hasReportContent ? normalizedFileName : undefined,
        reportFileType: hasReportContent ? normalizedFileType : undefined,
        reportFilePath: hasReportContent ? reportFilePath || undefined : undefined,
        reportRawText: hasReportContent ? compiledReportText : undefined,
        linkedReportId: linkedReportId || undefined,
        linkedReportStatus: linkedReportStatus,
        message: contactMessage.trim() || "Patient submission received through CareConnect.",
      });

      setContactSubmissionId(result.id);
      setSavedReportId(linkedReportId);
      setSavedReportStatus(linkedReportStatus ?? "");
      setSubmitted(true);
    } catch (error) {
      setContactSubmitError(error instanceof Error ? error.message : "Could not save submission.");
    } finally {
      setContactSubmitting(false);
      setSubmitAction(null);
    }
  };

  const handleLoginStatusChange = (checked: boolean) => {
    setIsLoggedIn(checked);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOGIN_STORAGE_KEY, checked ? "true" : "false");
    }
  };

  const getQrLinkText = () => `QR Image Link: ${QR_IMAGE_URL}\nWebsite Link: ${SITE_URL}`;

  const getAutoMessageText = () => {
    if (!isLoggedIn) {
      return "CareConnect AI explains doctor-uploaded reports clearly.\nPlease log in first, then ask your report questions again.";
    }

    if (!selectedReportDetails || selectedReportDetails.report.status !== "analyzed") {
      return "CareConnect AI will prepare report-specific guidance after analysis is completed.\nPlease select an analyzed report to share focused questions and explanations.";
    }

    const promptLines = selectedReportFocus.conversationPrompts
      .slice(0, 3)
      .map((prompt, index) => `${index + 1}. ${prompt}`)
      .join("\n");

    return `CareConnect AI report focus: ${selectedReportFocus.label}
Report: ${selectedReportDetails.report.title}
${selectedReportFocus.siteHeadline}
Helpful questions:
${promptLines}`;
  };

  const getCombinedShareText = () => `${getQrLinkText()}\n\n${getAutoMessageText()}`;

  const feedbackQuestions = useMemo<FeedbackQuestion[]>(() => {
    if (!selectedReportDetails || selectedReportDetails.report.status !== "analyzed") return [];

    const fromInsights = selectedReportDetails.insights.slice(0, 3).map((insight) => ({
      id: `insight-${insight.id}`,
      source: "insight" as const,
      question: `Do you clearly understand the ${insight.label} finding (${insight.value})?`,
    }));

    const fromFaqs = selectedReportDetails.faqs.slice(0, 2).map((faq) => ({
      id: `faq-${faq.id}`,
      source: "faq" as const,
      question: faq.question,
    }));

    const combined = [...fromInsights, ...fromFaqs];
    return combined;
  }, [selectedReportDetails]);

  const feedbackFlowMessage = useMemo(() => {
    if (!selectedReportDetails || selectedReportDetails.report.status !== "analyzed") {
      return "CareConnect report feedback flow is ready.\nPlease upload and analyze a report to begin targeted WhatsApp questions and condition-specific guidance.";
    }

    const lines = feedbackQuestions.map((item, index) => `${index + 1}. ${item.question}`);

    return `CareConnect Report Feedback
Report: ${selectedReportDetails.report.title}
Current focus: ${selectedReportFocus.label}
Focus note: ${selectedReportFocus.siteHeadline}
Please reply with the question number + your response:
${lines.join("\n")}`;
  }, [selectedReportDetails, feedbackQuestions, selectedReportFocus]);

  const feedbackSummaryMessage = useMemo(() => {
    if (!selectedReportDetails || selectedReportDetails.report.status !== "analyzed") {
      return "No report selected for feedback summary.";
    }

    const answered = feedbackQuestions
      .map((question, index) => {
        const response = feedbackAnswers[question.id];
        if (!response) return null;
        return `${index + 1}. ${question.question} -> ${FEEDBACK_ANSWER_LABELS[response]}`;
      })
      .filter((line): line is string => Boolean(line));

    if (answered.length === 0) {
      return `CareConnect Follow-up
Report: ${selectedReportDetails.report.title}
Current focus: ${selectedReportFocus.label}
No feedback responses have been selected yet.`;
    }

    return `CareConnect Follow-up
Report: ${selectedReportDetails.report.title}
Current focus: ${selectedReportFocus.label}
Patient responses:
${answered.join("\n")}`;
  }, [selectedReportDetails, feedbackQuestions, feedbackAnswers, selectedReportFocus]);

  const websiteEditNotes = useMemo(() => {
    if (!selectedReportDetails || selectedReportDetails.report.status !== "analyzed") {
      return "No website edit notes available yet. Select an analyzed report first.";
    }

    const needsSimpler = feedbackQuestions.filter((question) => feedbackAnswers[question.id] === "simpler");
    const needsDoctor = feedbackQuestions.filter((question) => feedbackAnswers[question.id] === "doctor");
    const unsure = feedbackQuestions.filter((question) => feedbackAnswers[question.id] === "unsure");

    const notes: string[] = [
      `Report: ${selectedReportDetails.report.title}`,
      `Detected focus: ${selectedReportFocus.label}`,
      `Content tags: ${selectedReportFocus.tags.join(", ")}`,
      "Website edit targets:",
      "- src/app/patient/reports/report-detail-page.tsx",
      "- src/components/report-data/ReportResultsView.tsx",
    ];

    if (needsSimpler.length > 0) {
      notes.push("Suggested edits for simpler wording:");
      needsSimpler.forEach((question, index) => {
        notes.push(`${index + 1}. Simplify text around: ${question.question}`);
      });
    }

    if (needsDoctor.length > 0) {
      notes.push("Suggested edits for doctor follow-up emphasis:");
      needsDoctor.forEach((question, index) => {
        notes.push(`${index + 1}. Add care-team contact guidance for: ${question.question}`);
      });
    }

    if (unsure.length > 0) {
      notes.push("Suggested edits for unresolved confusion:");
      unsure.forEach((question, index) => {
        notes.push(`${index + 1}. Add one extra plain-language FAQ for: ${question.question}`);
      });
    }

    if (needsSimpler.length === 0 && needsDoctor.length === 0 && unsure.length === 0) {
      notes.push("No urgent content edits requested from selected responses.");
    }

    return notes.join("\n");
  }, [selectedReportDetails, feedbackQuestions, feedbackAnswers, selectedReportFocus]);

  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(
    getCombinedShareText(),
  )}`;
  const whatsappFeedbackFlowLink = `https://wa.me/?text=${encodeURIComponent(
    feedbackFlowMessage,
  )}`;
  const whatsappFeedbackSummaryLink = `https://wa.me/?text=${encodeURIComponent(
    feedbackSummaryMessage,
  )}`;

  const handleNativeShare = async () => {
    const shareText = getCombinedShareText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "CareConnect AI",
          text: shareText,
          url: SITE_URL,
        });
        setShareState("shared");
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  };

  const handleCopyQrLinkText = async () => {
    try {
      await navigator.clipboard.writeText(getQrLinkText());
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  };

  const handleCopyAutoMessageText = async () => {
    try {
      await navigator.clipboard.writeText(getAutoMessageText());
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  };

  const handleFeedbackAnswerChange = (questionId: string, value: FeedbackAnswer) => {
    setFeedbackAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleCopyFeedbackSummary = async () => {
    try {
      await navigator.clipboard.writeText(feedbackSummaryMessage);
      setFeedbackState("copied");
    } catch {
      setFeedbackState("error");
    }
  };

  const handleCopyWebsiteEditNotes = async () => {
    try {
      await navigator.clipboard.writeText(websiteEditNotes);
      setFeedbackState("copied");
    } catch {
      setFeedbackState("error");
    }
  };

  return (
    <div className="bg-slate-50 py-14 sm:py-20">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">Submit Patient Report</h1>
          <p className="max-w-3xl text-slate-600">
            Save patient details, keep the uploaded report inside doctor submissions, and run analysis right from this page.
          </p>
        </motion.section>

        <section className="grid gap-8 lg:grid-cols-2">
          <motion.aside
            initial={{ opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -2 }}
            className="card p-7 sm:p-9"
          >
            <h2 className="text-lg font-semibold text-slate-900">Exact format for auto-detection</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Age, gender, and blood group are easiest to detect when the text contains the exact labels below. The form also
              prepends those lines automatically when you save.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sample layout</p>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{PROFILE_SAMPLE_TEXT}</pre>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Age</p>
                <p className="mt-2 text-sm text-slate-700">Use `Age: 45 years`</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</p>
                <p className="mt-2 text-sm text-slate-700">Use `Gender: Female`</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blood Group</p>
                <p className="mt-2 text-sm text-slate-700">Use `Blood Group: O+`</p>
              </div>
            </div>
            <div className="mt-6 space-y-5 text-sm text-slate-700">
              {[
                { icon: Mail, text: "sakshamgupta0295@gmil.com" },
                { icon: Phone, text: "7986547697" },
                { icon: MapPin, text: "Ranjit Avenue, Amritsar, Punjab, India" },
              ].map((item, index) => (
                <motion.p
                  key={item.text}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + index * 0.06, duration: 0.28 }}
                  whileHover={{ x: 3 }}
                  className="flex items-start gap-3.5 leading-relaxed"
                >
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span className="break-words">{item.text}</span>
                </motion.p>
              ))}
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            whileHover={{ y: -2 }}
            className="card overflow-hidden p-7 sm:p-9"
          >
            <AnimatePresence mode="wait" initial={false}>
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="space-y-4 py-2 text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <CheckCircle2 className="mx-auto h-10 w-10 text-secondary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {savedReportStatus === "analyzed" ? "Submission saved and analyzed" : "Submission saved"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    The patient submission is now stored for the doctor view.
                  </p>
                  {contactSubmissionId ? (
                    <p className="text-xs text-slate-500">Submission ID: {contactSubmissionId}</p>
                  ) : null}
                  {savedReportId ? (
                    <p className="text-xs text-slate-500">
                      Linked report: {savedReportId} ({savedReportStatus || "uploaded"})
                    </p>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setContactSubmitError("");
                      setContactStatusMessage("");
                      setContactSubmissionId("");
                      setSavedReportId("");
                      setSavedReportStatus("");
                      setContactName("");
                      setContactEmail("");
                      setContactPhone("");
                      setContactRole("Patient");
                      setPatientAge("");
                      setPatientGender("");
                      setPatientBloodGroup("");
                      setReportTitle("Patient Lab Report");
                      setReportFileName("patient-report.txt");
                      setReportFileType("text/plain");
                      setReportFilePath("");
                      setReportRawText("");
                      setContactMessage("");
                    }}
                  >
                    Create another submission
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!contactSubmitting && !reportPdfLoading) {
                      void handleSaveSubmission(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">Patient submission form</h3>
                    <p className="text-sm text-slate-600">
                      Save the report into submissions, then optionally run analysis so it appears in the doctor dashboard with a linked report.
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.22 }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Name</span>
                      <input
                        required
                        type="text"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Email</span>
                      <input
                        required
                        type="email"
                        value={contactEmail}
                        onChange={(event) => setContactEmail(event.target.value)}
                        placeholder="john@hospital.com"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                  </motion.div>

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                    />
                  </motion.label>

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Role</span>
                    <select
                      value={contactRole}
                      onChange={(event) => setContactRole(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                    >
                      <option>Patient</option>
                      <option>Caregiver</option>
                      <option>Doctor</option>
                      <option>Lab Staff</option>
                      <option>Other</option>
                    </select>
                  </motion.label>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.22 }}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Age</span>
                      <input
                        value={patientAge}
                        onChange={(event) => setPatientAge(event.target.value)}
                        placeholder="45 years"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Gender</span>
                      <input
                        value={patientGender}
                        onChange={(event) => setPatientGender(event.target.value)}
                        placeholder="Female"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Blood Group</span>
                      <input
                        value={patientBloodGroup}
                        onChange={(event) => setPatientBloodGroup(event.target.value.toUpperCase())}
                        placeholder="O+"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.22 }}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Report Title</span>
                      <input
                        value={reportTitle}
                        onChange={(event) => setReportTitle(event.target.value)}
                        placeholder="CBC Report - April 2026"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1.5 text-sm text-slate-700">
                      <span>Saved File Name</span>
                      <input
                        value={reportFileName}
                        onChange={(event) => setReportFileName(event.target.value)}
                        placeholder="patient-report.pdf"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                      />
                    </label>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14, duration: 0.22 }}
                    className="space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-2">
                          <UploadCloud className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Upload PDF report</p>
                          <p className="text-xs text-slate-500">We will extract the text and save the file path in submissions.</p>
                        </div>
                      </div>
                      <label className="inline-flex cursor-pointer">
                        <Button type="button" variant="outline">
                          Choose PDF
                        </Button>
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
                    </div>
                    {reportFilePath ? (
                      <p className="text-xs text-slate-500">
                        Uploaded file path: {reportFilePath}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="ghost" onClick={handleInsertSampleLayout}>
                        Insert Sample Layout
                      </Button>
                      <p className="text-xs leading-6 text-slate-500">
                        The saved report text will always prepend `Age`, `Gender`, and `Blood Group` lines from the fields above.
                      </p>
                    </div>
                  </motion.div>

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Report Text</span>
                    <textarea
                      rows={9}
                      value={reportRawText}
                      onChange={(event) => setReportRawText(event.target.value)}
                      placeholder={PROFILE_SAMPLE_TEXT}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
                    />
                  </motion.label>

                  <PatientProfileCard
                    profile={detectedProfile}
                    title="Live detected patient details"
                    subtitle="This preview uses the exact saved text arrangement, including the automatic header lines."
                  />

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Doctor Notes / Submission Message</span>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(event) => setContactMessage(event.target.value)}
                      placeholder="Add symptoms, notes, or the reason for this submission."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                    />
                  </motion.label>

                  {reportPdfLoading ? (
                    <p className="inline-flex items-center gap-2 text-sm text-secondary">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Extracting PDF text...
                    </p>
                  ) : null}
                  {contactStatusMessage ? <p className="text-sm text-secondary">{contactStatusMessage}</p> : null}
                  {contactSubmitError ? <p className="text-sm text-red-600">{contactSubmitError}</p> : null}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      className="w-full"
                      disabled={contactSubmitting || reportPdfLoading}
                      onClick={() => void handleSaveSubmission(false)}
                    >
                      {submitAction === "save" && contactSubmitting ? "Saving..." : "Save Submission"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      disabled={contactSubmitting || reportPdfLoading || !reportRawText.trim()}
                      onClick={() => void handleSaveSubmission(true)}
                    >
                      {submitAction === "analyze" && contactSubmitting ? "Analyzing..." : "Save + Analyze"}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="card overflow-hidden p-7 sm:p-9"
        >
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
                <img
                  src={QR_IMAGE_URL}
                  alt="CareConnect QR code"
                  className="h-auto w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
              <a
                href={QR_IMAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
              >
                <Link2 className="h-4 w-4" />
                Open QR image
              </a>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  Scan and Share
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">CareConnect QR Access</h2>
                <p className="text-sm text-slate-600">
                  Scan this code to open <span className="font-medium text-slate-900">{SITE_URL}</span>. You can also share it directly with WhatsApp or other apps.
                </p>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isLoggedIn}
                  onChange={(event) => handleLoginStatusChange(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-secondary focus:ring-secondary"
                />
                Logged in user mode for share message
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <a href={whatsappShareLink} target="_blank" rel="noreferrer" className="sm:col-span-2">
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4" />
                    Share on WhatsApp
                  </Button>
                </a>
                <Button variant="outline" onClick={handleNativeShare}>
                  <Share2 className="h-4 w-4" />
                  Share to Other Apps
                </Button>
                <Button variant="ghost" onClick={handleCopyQrLinkText}>
                  Copy QR Link Text
                </Button>
                <Button variant="ghost" onClick={handleCopyAutoMessageText}>
                  Copy Auto Message
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">QR and website link text</p>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{getQrLinkText()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Automatic message text</p>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{getAutoMessageText()}</p>
                </div>
              </div>

              {shareState !== "idle" ? (
                <p className="text-xs font-medium text-secondary">
                  {shareState === "copied" && "Share text copied to clipboard."}
                  {shareState === "shared" && "Shared successfully."}
                  {shareState === "error" && "Could not share. Please try again."}
                </p>
              ) : null}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="card overflow-hidden p-7 sm:p-9"
        >
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  WhatsApp Integrated Feedback
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">Report-specific Conversation Flow</h2>
                <p className="text-sm text-slate-600">
                  {selectedReportDetails?.report.status === "analyzed"
                    ? `CareConnect is using the analyzed report focus "${selectedReportFocus.label}" to drive questions, guidance, and follow-up notes.`
                    : "CareConnect builds targeted WhatsApp questions after a report has been analyzed."}
                </p>
              </div>

              <label className="space-y-1.5 text-sm text-slate-700">
                <span>Select report</span>
                <select
                  value={selectedReportId}
                  onChange={(event) => setSelectedReportId(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                >
                  {reports.length === 0 ? <option value="">No reports available</option> : null}
                  {reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.title} ({report.status})
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${selectedReportFocus.concernClassName}`}>
                  {selectedReportFocus.concernLabel}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{selectedReportFocus.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{selectedReportFocus.patientDescription}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedReportFocus.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ClipboardList className="h-4 w-4 text-secondary" />
                  Auto-generated feedback questions
                </p>
                <div className="mt-3 space-y-3">
                  {feedbackLoading ? (
                    <p className="text-sm text-slate-600">Loading report questions...</p>
                  ) : feedbackQuestions.length === 0 ? (
                    <p className="text-sm text-slate-600">No questions available yet. Analyze a report first.</p>
                  ) : (
                    feedbackQuestions.map((question, index) => (
                      <div key={question.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-medium text-slate-800">
                          {index + 1}. {question.question}
                        </p>
                        <select
                          value={feedbackAnswers[question.id] || ""}
                          onChange={(event) => handleFeedbackAnswerChange(question.id, event.target.value as FeedbackAnswer)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-secondary focus:outline-none"
                        >
                          <option value="">Select response</option>
                          {FEEDBACK_ANSWER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {feedbackError ? <p className="text-xs font-medium text-amber-700">{feedbackError}</p> : null}
            </div>

            <div className="space-y-4">
              <FocusBars
                bars={selectedReportFocus.bars}
                title="Selected report graph"
                subtitle="This graph updates from the selected analyzed report only."
              />

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
                  <MessageCircle className="h-4 w-4 text-secondary" />
                  WhatsApp question flow message
                </p>
                <p className="mt-2 whitespace-pre-line leading-relaxed">{feedbackFlowMessage}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Feedback summary message
                </p>
                <p className="mt-2 whitespace-pre-line leading-relaxed">{feedbackSummaryMessage}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-secondary" />
                  Website edit notes from responses
                </p>
                <p className="mt-2 whitespace-pre-line leading-relaxed">{websiteEditNotes}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappFeedbackFlowLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setFeedbackState("sent")}
                  className="sm:col-span-2"
                >
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4" />
                    Send Questions on WhatsApp
                  </Button>
                </a>
                <a
                  href={whatsappFeedbackSummaryLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setFeedbackState("sent")}
                  className="sm:col-span-2"
                >
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4" />
                    Send Feedback Summary
                  </Button>
                </a>
                <Button variant="ghost" onClick={handleCopyFeedbackSummary}>
                  Copy Summary Text
                </Button>
                <Button variant="ghost" onClick={handleCopyWebsiteEditNotes}>
                  Copy Edit Notes
                </Button>
              </div>

              {feedbackState !== "idle" ? (
                <p className="text-xs font-medium text-secondary">
                  {feedbackState === "copied" && "Feedback content copied to clipboard."}
                  {feedbackState === "sent" && "WhatsApp conversation opened."}
                  {feedbackState === "error" && "Could not copy feedback content. Please try again."}
                </p>
              ) : null}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function buildSubmissionReportText({
  patientName,
  age,
  gender,
  bloodGroup,
  reportText,
}: {
  patientName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  reportText: string;
}): string {
  const headerLines = [
    patientName.trim() ? `Patient Name: ${patientName.trim()}` : "",
    age.trim() ? `Age: ${age.trim()}` : "",
    gender.trim() ? `Gender: ${gender.trim()}` : "",
    bloodGroup.trim() ? `Blood Group: ${bloodGroup.trim().toUpperCase()}` : "",
  ].filter(Boolean);

  const body = reportText.trim();
  return [...headerLines, body].filter(Boolean).join("\n");
}
