import { type FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../ui/Button";
import { formatTagLabel, normalizeTag } from "../../lib/reportGuidance";

type ReportFindingsEditorProps = {
  findings: string[];
  onChange: (nextFindings: string[]) => void;
};

export function ReportFindingsEditor({ findings, onChange }: ReportFindingsEditorProps) {
  const [input, setInput] = useState("");

  const addFinding = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = normalizeTag(input);
    if (!next || findings.includes(next)) {
      setInput("");
      return;
    }
    onChange([...findings, next]);
    setInput("");
  };

  const removeFinding = (value: string) => {
    onChange(findings.filter((finding) => finding !== value));
  };

  return (
    <section className="card p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Findings / Tags</h2>
      <p className="mt-1 text-sm text-slate-600">
        Add structured findings to improve FAQ suggestion quality for this report.
      </p>

      <form onSubmit={addFinding} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Add finding (e.g., low vitamin d)"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
        />
        <Button type="submit" className="sm:w-auto">
          <Plus className="h-4 w-4" /> Add Finding
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {findings.length === 0 ? (
          <p className="text-sm text-slate-500">No findings added yet.</p>
        ) : (
          findings.map((finding) => (
            <span
              key={finding}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {formatTagLabel(finding)}
              <button
                type="button"
                onClick={() => removeFinding(finding)}
                aria-label={`Remove ${finding}`}
                className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </section>
  );
}
