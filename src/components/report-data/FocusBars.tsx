import { type ReportFocusBar } from "../../lib/reportFocus";

type FocusBarsProps = {
  bars: ReportFocusBar[];
  title?: string;
  subtitle?: string;
};

export function FocusBars({ bars, title = "Report-driven graph", subtitle }: FocusBarsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-600">{subtitle}</p> : null}
      <div className="mt-4 space-y-3">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{bar.label}</span>
              <span>{bar.value}%</span>
            </div>
            <div className="insight-track">
              <div className={`insight-fill ${bar.colorClassName}`} style={{ width: `${Math.max(6, bar.value)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
