import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpenCheck, FileText, LoaderCircle, MessageCircle, TrendingUp, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FocusBars, PatientProfileCard } from "../../components/report-data";
import { Button } from "../../components/ui/Button";
import { extractPatientProfile } from "../../lib/patientProfile";
import { deriveReportFocus } from "../../lib/reportFocus";
import { getReportById, listReports, type ReportDetailsDto, type ReportListItemDto } from "../../lib/reportApi";

const SITE_URL = "https://CareConnect.com";

export default function PatientDashboard() {
  const location = useLocation();
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [latestDetails, setLatestDetails] = useState<ReportDetailsDto | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedProfileDetails, setSelectedProfileDetails] = useState<ReportDetailsDto | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const loaded = await listReports();
        if (cancelled) return;
        setReports(loaded);

        const previewId = loaded.find((report) => report.status === "analyzed")?.id ?? loaded[0]?.id;
        if (previewId) {
          const details = await getReportById(previewId);
          if (cancelled) return;
          setLatestDetails(details);
          setSelectedProfileId(previewId);
          setSelectedProfileDetails(details);
        } else {
          setLatestDetails(null);
          setSelectedProfileId("");
          setSelectedProfileDetails(null);
        }
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load reports.");
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

  useEffect(() => {
    if (!selectedProfileId) {
      setProfileLoading(false);
      setSelectedProfileDetails(null);
      return;
    }

    if (latestDetails?.report.id === selectedProfileId) {
      setProfileLoading(false);
      setSelectedProfileDetails(latestDetails);
      return;
    }

    let cancelled = false;

    const loadSelectedProfile = async () => {
      setProfileLoading(true);
      try {
        const details = await getReportById(selectedProfileId);
        if (cancelled) return;
        setSelectedProfileDetails(details);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load selected patient profile.");
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    void loadSelectedProfile();

    return () => {
      cancelled = true;
    };
  }, [latestDetails, selectedProfileId]);

  useEffect(() => {
    if (location.hash !== "#patient-report-explanation") {
      setIsFocused(false);
      return;
    }

    setIsFocused(true);
    const timer = window.setTimeout(() => setIsFocused(false), 2100);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById("patient-report-explanation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 70);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(scrollTimer);
    };
  }, [location.hash]);

  const patientPulse = useMemo(() => {
    const totalReports = reports.length;
    const analyzedReports = reports.filter((report) => report.status === "analyzed").length;
    const totalInsights = reports.reduce((count, report) => count + report.counts.insights, 0);
    const totalFaqs = reports.reduce((count, report) => count + report.counts.faqs, 0);
    const understandingScore =
      totalInsights > 0 ? Math.min(100, Math.round((totalFaqs / totalInsights) * 100)) : 0;

    return { totalReports, analyzedReports, totalInsights, totalFaqs, understandingScore };
  }, [reports]);

  const latestReportId = reports.find((report) => report.status === "analyzed")?.id ?? reports[0]?.id;
  const latestReportRoute = latestReportId ? `/patient/reports/${latestReportId}` : "/patient";
  const whatsappHelpMessage = useMemo(() => {
    const reportLink = latestReportId ? `${SITE_URL}/patient/reports/${latestReportId}` : `${SITE_URL}/patient`;
    return `CareConnect Patient Support
I need help understanding my health report.
Open report guidance: ${reportLink}
Questions I can ask:
1. What does my report summary mean?
2. Which findings are important for me?
3. What should I discuss with my doctor next?`;
  }, [latestReportId]);
  const whatsappHelpLink = `https://wa.me/?text=${encodeURIComponent(whatsappHelpMessage)}`;
  const reportFocus = deriveReportFocus(latestDetails);
  const selectedProfile = selectedProfileDetails
    ? extractPatientProfile({
        title: selectedProfileDetails.report.title,
        rawText: selectedProfileDetails.report.rawText,
      })
    : null;

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Patient Dashboard</h1>
          <p className="text-sm text-slate-600">
            {reportFocus.patientDescription}
          </p>
        </motion.header>

        <motion.section
          id="patient-report-explanation"
          className={`card-patient scroll-mt-24 p-6 transition-all duration-700 sm:p-8 ${
            isFocused
              ? "ring-2 ring-secondary/40 ring-offset-2 ring-offset-slate-50 shadow-[0_20px_50px_rgba(0,106,97,0.18)]"
              : ""
          }`}
          animate={isFocused ? { scale: [1, 1.01, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                Understand Your Report
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Recommended Explanations</h2>
              <p className="mt-1 text-sm text-slate-600">
                {reportFocus.siteHeadline}
              </p>
            </div>
            <Link to={latestReportRoute}>
              <Button>
                View Report Guidance <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricPill label="Reports" value={`${patientPulse.totalReports}`} />
            <MetricPill label="Analyzed" value={`${patientPulse.analyzedReports}`} />
            <MetricPill label="Understanding Score" value={`${patientPulse.understandingScore}%`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {reportFocus.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-6 sm:p-8"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary" />
              <h2 className="text-lg font-semibold text-slate-900">Your Reports</h2>
            </div>
            <div className="mt-4 space-y-3">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const progress =
                    report.counts.insights > 0
                      ? Math.min(100, Math.round((report.counts.faqs / report.counts.insights) * 100))
                      : 0;
                  const profile = extractPatientProfile({ title: report.title, rawText: report.rawText });

                  return (
                    <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {report.counts.faqs} explanation{report.counts.faqs === 1 ? "" : "s"} | status: {report.status}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {renderProfileChip("Age", profile.age)}
                        {renderProfileChip("Gender", profile.gender)}
                        {renderProfileChip("Blood", profile.bloodType)}
                      </div>
                      <div className="mt-2">
                        <div className="insight-track">
                          <div className="insight-fill bg-sky-500" style={{ width: `${Math.max(6, progress)}%` }} />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProfileId(report.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          Open Profile
                        </button>
                        <Link to={`/patient/reports/${report.id}`} className="inline-flex">
                          <Button size="sm" variant="outline">
                            Open Report
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">
                  {isLoading ? "Loading reports..." : "No reports are available yet."}
                </p>
              )}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-patient p-6 sm:p-8"
          >
            {profileLoading ? (
              <div className="mb-4 inline-flex items-center gap-2 text-sm text-secondary">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading selected patient profile...
              </div>
            ) : null}
            {selectedProfile ? (
              <div className="mb-4">
                <PatientProfileCard
                  profile={selectedProfile}
                  title="Selected patient profile"
                  subtitle="Click any report on the left and this area opens that patient data."
                  actions={
                    selectedProfileDetails ? (
                      <Link to={`/patient/reports/${selectedProfileDetails.report.id}`}>
                        <Button size="sm" variant="outline">Open Full Report</Button>
                      </Link>
                    ) : null
                  }
                />
              </div>
            ) : null}
            <div className="inline-flex rounded-lg bg-secondary/10 p-2">
              <BookOpenCheck className="h-5 w-5 text-secondary" />
            </div>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">How it works</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {reportFocus.quickFacts.map((fact, index) => (
                <li key={`patient-focus-${index}`}>{fact}</li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <UserRound className="h-3.5 w-3.5 text-secondary" />
                Care Team Mode
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {reportFocus.patientDescription}
              </p>
            </div>
            <div className="mt-4">
              <FocusBars
                bars={reportFocus.bars}
                title="Report-only graph"
                subtitle="Built from the latest analyzed report, not from generic website data."
              />
            </div>
          </motion.article>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-patient p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                Patient WhatsApp Help
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Use WhatsApp for easier support</h2>
              <p className="mt-1 text-sm text-slate-600">
                If app navigation feels difficult, tap once to open WhatsApp with a ready patient-help message based on the latest analyzed report focus.
              </p>
            </div>
            <a href={whatsappHelpLink} target="_blank" rel="noreferrer">
              <Button>
                <MessageCircle className="h-4 w-4" />
                Open WhatsApp Help
              </Button>
            </a>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message preview</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{whatsappHelpMessage}</p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
                Suggested questions
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {reportFocus.conversationPrompts.map((prompt, index) => (
                  <li key={`patient-prompt-${index}`}>{index + 1}. {prompt}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sky-200/70 bg-white/80 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function renderProfileChip(label: string, value: string | null) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
      {label}: {value || "NA"}
    </span>
  );
}
