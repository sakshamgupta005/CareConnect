import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, ClipboardList, FileText, Link2, Mail, MapPin, MessageCircle, Phone, Share2, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { submitContactForm } from "../../lib/contactApi";
import { getReportById, listReports, type ReportDetailsDto, type ReportListItemDto } from "../../lib/reportApi";

const SITE_URL = "https://CareConnect.com";
const QR_IMAGE_URL =
  "https://res.cloudinary.com/dyxlavy0j/image/upload/v1775298105/WhatsApp_Image_2026-04-04_at_3.49.17_PM_ss4a3g.jpg";
const LOGIN_STORAGE_KEY = "careconnect_logged_in";

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
  const [contactRole, setContactRole] = useState("Hospital Administrator");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitError, setContactSubmitError] = useState("");
  const [contactSubmissionId, setContactSubmissionId] = useState("");
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
        setSelectedReportId((current) => current || loadedReports[0]?.id || "");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactSubmitting(true);
    setContactSubmitError("");

    try {
      const result = await submitContactForm({
        name: contactName,
        email: contactEmail,
        phone: contactPhone || undefined,
        message: `Role: ${contactRole}\n${contactMessage}`,
      });

      setContactSubmissionId(result.id);
      setSubmitted(true);
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactRole("Hospital Administrator");
      setContactMessage("");
    } catch (error) {
      setContactSubmitError(error instanceof Error ? error.message : "Could not send your message.");
    } finally {
      setContactSubmitting(false);
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

    return "CareConnect AI helps patients understand uploaded medical reports.\nTry asking: What does low hemoglobin mean? Why is vitamin D low? What does high cholesterol mean?";
  };

  const getCombinedShareText = () => `${getQrLinkText()}\n\n${getAutoMessageText()}`;

  const feedbackQuestions = useMemo<FeedbackQuestion[]>(() => {
    if (!selectedReportDetails) return [];

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
    if (combined.length === 0) {
      combined.push({
        id: "general-1",
        source: "general",
        question: "Do you want a simpler explanation for your uploaded report?",
      });
    }

    return combined;
  }, [selectedReportDetails]);

  const feedbackFlowMessage = useMemo(() => {
    if (!selectedReportDetails) {
      return "CareConnect report feedback flow is ready.\nPlease upload and analyze a report to begin targeted WhatsApp questions.";
    }

    const lines = feedbackQuestions.map((item, index) => `${index + 1}. ${item.question}`);

    return `CareConnect Report Feedback\nReport: ${selectedReportDetails.report.title}\nPlease reply with the question number + your response:\n${lines.join(
      "\n",
    )}`;
  }, [selectedReportDetails, feedbackQuestions]);

  const feedbackSummaryMessage = useMemo(() => {
    if (!selectedReportDetails) {
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
      return `CareConnect Follow-up\nReport: ${selectedReportDetails.report.title}\nNo feedback responses have been selected yet.`;
    }

    return `CareConnect Follow-up\nReport: ${selectedReportDetails.report.title}\nPatient responses:\n${answered.join("\n")}`;
  }, [selectedReportDetails, feedbackQuestions, feedbackAnswers]);

  const websiteEditNotes = useMemo(() => {
    if (!selectedReportDetails) {
      return "No website edit notes available yet. Select an analyzed report first.";
    }

    const needsSimpler = feedbackQuestions.filter((question) => feedbackAnswers[question.id] === "simpler");
    const needsDoctor = feedbackQuestions.filter((question) => feedbackAnswers[question.id] === "doctor");
    const unsure = feedbackQuestions.filter((question) => feedbackAnswers[question.id] === "unsure");

    const notes: string[] = [
      `Report: ${selectedReportDetails.report.title}`,
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
  }, [selectedReportDetails, feedbackQuestions, feedbackAnswers]);

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
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">We are here to help</h1>
          <p className="max-w-3xl text-slate-600">
            Reach out for a demo, integration planning, or onboarding support.
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
            <h2 className="text-lg font-semibold text-slate-900">Contact information</h2>
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
                  <h3 className="text-lg font-semibold text-slate-900">Message sent</h3>
                  <p className="text-sm text-slate-600">
                    Thank you. Our team will get back to you shortly.
                  </p>
                  {contactSubmissionId ? (
                    <p className="text-xs text-slate-500">Submission ID: {contactSubmissionId}</p>
                  ) : null}
                  <Button variant="outline" onClick={() => {
                    setSubmitted(false);
                    setContactSubmitError("");
                  }}>
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                  onSubmit={handleSubmit}
                >
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
                    <span>Phone (optional)</span>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      placeholder="+1 555 123 4567"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                    />
                  </motion.label>

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Role</span>
                    <select
                      value={contactRole}
                      onChange={(event) => setContactRole(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                    >
                      <option>Hospital Administrator</option>
                      <option>Healthcare Provider</option>
                      <option>Clinical Researcher</option>
                      <option>Other</option>
                    </select>
                  </motion.label>

                  <motion.label
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14, duration: 0.22 }}
                    className="space-y-1.5 text-sm text-slate-700"
                  >
                    <span>Message</span>
                    <textarea
                      required
                      rows={5}
                      value={contactMessage}
                      onChange={(event) => setContactMessage(event.target.value)}
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-secondary focus:outline-none"
                    />
                  </motion.label>

                  {contactSubmitError ? <p className="text-sm text-red-600">{contactSubmitError}</p> : null}

                  <Button type="submit" className="w-full" disabled={contactSubmitting}>
                    {contactSubmitting ? "Sending..." : "Send Message"}
                  </Button>
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
                  CareConnect builds targeted WhatsApp questions from report findings and FAQs, then prepares follow-up + website update notes from responses.
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
