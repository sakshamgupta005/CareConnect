import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CircleAlert, LoaderCircle, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ReportResultsView } from "../../../components/report-data";
import { Button } from "../../../components/ui/Button";
import { deriveReportFocus } from "../../../lib/reportFocus";
import { getReportById, type ReportDetailsDto } from "../../../lib/reportApi";

const SITE_URL = "https://skill-deploy-21fwgx1iwt-codex-agent-deploys.vercel.app";
const WHATSAPP_HELP_NUMBER = "7986547697";

export default function PatientReportDetailsPage() {
  const { reportId = "" } = useParams();
  const [details, setDetails] = useState<ReportDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const reportFocus = deriveReportFocus(details);

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

  const whatsappReportMessage = useMemo(() => {
    if (!details) {
      return "CareConnect patient support message.";
    }

    const faqQuestions = reportFocus.conversationPrompts
      .slice(0, 3)
      .map((question, index) => `${index + 1}. ${question}`);
    const questionBlock =
      faqQuestions.length > 0
        ? faqQuestions.join("\n")
        : "1. Can you explain my report in simpler words?\n2. What should I discuss with my doctor?";

    const keyNotes = reportFocus.quickFacts
      .slice(0, 2)
      .map((fact) => `- ${fact}`)
      .join("\n");

    return `Hi CareConnect team, I have a doubt about this report.
Report: ${details.report.title}
Current focus: ${reportFocus.label}
This is what the report is showing:
${keyNotes || "- Report analysis is still being reviewed."}
Report link: ${SITE_URL}/patient/reports/${details.report.id}

Please help me with:
${questionBlock}`;
  }, [details, reportFocus]);

  const whatsappReportLink = `https://wa.me/${WHATSAPP_HELP_NUMBER}?text=${encodeURIComponent(whatsappReportMessage)}`;

  if (isLoading) {
    return (
      <div className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <section className="card p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm text-secondary">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading report guidance...
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
            <h1 className="text-xl font-semibold text-slate-900">Report unavailable</h1>
            <p className="mt-2 text-sm text-slate-600">
              {error || "This report could not be found. Please contact your care team."}
            </p>
            <div className="mt-4">
              <Link to="/patient">
                <Button>Go to Patient Dashboard</Button>
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
            to="/patient"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Understand Your Report</h1>
            <p className="mt-1 text-sm text-slate-600">
              Your doctor has added helpful explanations related to this report.
            </p>
          </div>
        </motion.header>

        {details.report.status === "uploaded" ? (
          <section className="card p-5">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-700">
              <CircleAlert className="h-4 w-4" />
              This report is uploaded and waiting for analysis.
            </p>
            <p className="mt-1 text-sm text-slate-600">Please check again once your care team completes analysis.</p>
          </section>
        ) : null}

        <section className="card-patient p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                WhatsApp Patient Help
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Need help in simple language?</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open WhatsApp with a prefilled message using this report's analyzed focus, key notes, and follow-up questions.
              </p>
            </div>
            <a href={whatsappReportLink} target="_blank" rel="noreferrer">
              <Button>
                <MessageCircle className="h-4 w-4" />
                Ask on WhatsApp
              </Button>
            </a>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${reportFocus.concernClassName}`}>
              {reportFocus.concernLabel}
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">{reportFocus.label}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {reportFocus.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">WhatsApp message preview</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{whatsappReportMessage}</p>
          </div>
        </section>

        <ReportResultsView
          data={details}
          title="Report Guidance"
          subtitle="Personalized summary, findings, FAQs, and recommendations based on your uploaded report."
          showRawTextPreview={false}
        />
      </div>
    </div>
  );
}
