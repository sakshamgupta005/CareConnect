import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Share2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { FocusBars } from "../../../components/report-data";
import { Button } from "../../../components/ui/Button";
import { normalizeDoctorPublicIdInput } from "../../../lib/doctorTeam";
import { deriveReportFocus } from "../../../lib/reportFocus";
import { getReportById, listReports, type ReportDetailsDto, type ReportListItemDto } from "../../../lib/reportApi";

export default function CollaborationWorkspace() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [latestDetails, setLatestDetails] = useState<ReportDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedDoctorPublicId = useMemo(
    () => normalizeDoctorPublicIdInput(searchParams.get("doctorPublicId") ?? ""),
    [searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const loadedReports = await listReports();
        if (cancelled) return;
        setReports(loadedReports);

        const previewId = loadedReports.find((report) => report.status === "analyzed")?.id ?? loadedReports[0]?.id;

        if (previewId) {
          const details = await getReportById(previewId);
          if (cancelled) return;
          setLatestDetails(details);
        } else {
          setLatestDetails(null);
        }
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load collaboration data.");
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

  const reportFocus = deriveReportFocus(latestDetails);

  return (
    <div className="bg-slate-50 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/doctor"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary sm:text-3xl">Collaboration Workspace</h1>
              <p className="text-sm text-slate-600">{reportFocus.doctorDescription}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/test-upload">
              <Button variant="outline">
                <Plus className="h-4 w-4" /> New upload
              </Button>
            </Link>
            <Link to="/doctor/faqs">
              <Button>
                <Share2 className="h-4 w-4" /> FAQ explorer
              </Button>
            </Link>
          </div>
        </motion.header>
        {selectedDoctorPublicId ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active doctor channel</p>
            <p className="mt-1 text-sm font-semibold text-secondary">{selectedDoctorPublicId}</p>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {reports.length > 0 ? (
                reports.map((report, index) => (
                  <motion.article
                    key={report.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ delay: index * 0.08, duration: 0.34 }}
                    whileHover={{ y: -4 }}
                    className="card p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold text-slate-900">{report.title}</h2>
                      <span className="text-xs text-slate-500">{report.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {report.counts.insights} insights, {report.counts.faqs} FAQs, {report.counts.recommendations} recommendations
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">
                        Updated {new Date(report.updatedAt).toLocaleDateString()}
                      </div>
                      <Link to={`/doctor/reports/${report.id}`}>
                        <Button variant="ghost" size="sm">Open</Button>
                      </Link>
                    </div>
                  </motion.article>
                ))
              ) : (
                <article className="card p-4">
                  <p className="text-sm text-slate-600">
                    {isLoading ? "Loading report rooms..." : "No report rooms available yet."}
                  </p>
                </article>
              )}
            </div>

            <motion.article
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4 }}
              className="card relative overflow-hidden p-5"
            >
              <motion.div
                animate={{ x: [0, 20, 0], opacity: [0.18, 0.3, 0.18] }}
                transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-secondary/20 blur-3xl"
              />
              <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${reportFocus.concernClassName}`}>
                {reportFocus.concernLabel}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Latest analysis focus</h3>
              <p className="mt-2 text-sm text-slate-600">{reportFocus.siteHeadline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {reportFocus.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
                {reportFocus.quickFacts.map((fact, index) => (
                  <li key={`collab-focus-${index}`} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
              {latestDetails ? (
                <Link to={`/reports/${latestDetails.report.id}`}>
                  <Button className="mt-4" variant="secondary">Open full results</Button>
                </Link>
              ) : null}
            </motion.article>
          </div>

          <aside className="space-y-4">
            <FocusBars
              bars={reportFocus.bars}
              title="Latest report graph"
              subtitle="This workspace graph is built from the current analyzed report only."
            />

            <motion.article
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.36 }}
              className="card p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {reports.slice(0, 4).map((report) => (
                  <li key={report.id}>
                    {report.title} updated on {new Date(report.updatedAt).toLocaleString()}
                  </li>
                ))}
              </ul>
              {reports.length === 0 ? <p className="mt-2 text-sm text-slate-500">No recent updates yet.</p> : null}
            </motion.article>

            <motion.article
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.05, duration: 0.36 }}
              className="card p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">Team status</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Doctor pipeline access: active</li>
                <li>Patient guidance pages: available</li>
                <li>Report analysis service: operational</li>
                <li>Current report focus: {reportFocus.label}</li>
                <li>Total report rooms: {reports.length}</li>
              </ul>
              {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
            </motion.article>
          </aside>
        </section>
      </div>
    </div>
  );
}
