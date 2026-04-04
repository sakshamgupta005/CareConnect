import { CalendarDays, FileText, Stethoscope, UserRound } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatReportDate, formatTagLabel, type ReportRecord } from "../../lib/reportGuidance";

type ReportSummaryCardProps = {
  report: ReportRecord;
  mode: "doctor" | "patient";
  className?: string;
};

export function ReportSummaryCard({ report, mode, className }: ReportSummaryCardProps) {
  return (
    <article className={cn("card p-6 sm:p-8", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{report.reportTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {mode === "doctor"
              ? "Manage findings and assign explanations for this patient report."
              : "Your doctor selected explanations to help you understand this report."}
          </p>
        </div>
        <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
          {mode === "doctor" ? "Doctor View" : "Patient View"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <FileText className="h-3.5 w-3.5 text-secondary" />
            Uploaded File
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {report.uploadedFileName || "No file uploaded yet"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 text-secondary" />
            Last Updated
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">{formatReportDate(report.updatedAt)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <UserRound className="h-3.5 w-3.5 text-secondary" />
            Patient
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">{report.patientName}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
            <Stethoscope className="h-3.5 w-3.5 text-secondary" />
            Doctor
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">{report.doctorName}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key Findings</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {report.findings.length === 0 ? (
            <span className="text-sm text-slate-500">No findings added yet.</span>
          ) : (
            report.findings.map((finding) => (
              <span
                key={finding}
                className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
              >
                {formatTagLabel(finding)}
              </span>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
