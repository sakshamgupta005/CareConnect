import { type FormEvent, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { parseTagsInput } from "../../lib/reportGuidance";

export type FAQFormSubmitData = {
  question: string;
  answer: string;
  tags: string[];
  category?: string;
};

export type FAQFormInitialValues = {
  question: string;
  answer: string;
  tagsInput: string;
  category: string;
};

type FAQFormProps = {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  initialValues?: Partial<FAQFormInitialValues>;
  onSubmit: (data: FAQFormSubmitData) => void;
  onCancelEdit?: () => void;
};

const defaultValues: FAQFormInitialValues = {
  question: "",
  answer: "",
  tagsInput: "",
  category: "",
};

export function FAQForm({
  title = "Create FAQ",
  subtitle = "Add reusable explanation content for patient education.",
  submitLabel = "Save FAQ",
  initialValues,
  onSubmit,
  onCancelEdit,
}: FAQFormProps) {
  const [values, setValues] = useState<FAQFormInitialValues>(defaultValues);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialValues) {
      setValues(defaultValues);
      return;
    }

    setValues({
      question: initialValues.question ?? "",
      answer: initialValues.answer ?? "",
      tagsInput: initialValues.tagsInput ?? "",
      category: initialValues.category ?? "",
    });
  }, [initialValues]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const question = values.question.trim();
    const answer = values.answer.trim();
    if (!question || !answer) {
      setError("Question and explanation are required.");
      return;
    }

    setError("");

    onSubmit({
      question,
      answer,
      tags: parseTagsInput(values.tagsInput),
      category: values.category.trim() || undefined,
    });

    if (!initialValues) {
      setValues(defaultValues);
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="faq-question" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Question
          </label>
          <input
            id="faq-question"
            type="text"
            value={values.question}
            onChange={(event) => setValues((prev) => ({ ...prev, question: event.target.value }))}
            placeholder="What does low hemoglobin mean?"
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="faq-answer" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Answer / Explanation
          </label>
          <textarea
            id="faq-answer"
            value={values.answer}
            onChange={(event) => setValues((prev) => ({ ...prev, answer: event.target.value }))}
            placeholder="Low hemoglobin can suggest anemia..."
            className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="faq-tags" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tags (comma separated)
            </label>
            <input
              id="faq-tags"
              type="text"
              value={values.tagsInput}
              onChange={(event) => setValues((prev) => ({ ...prev, tagsInput: event.target.value }))}
              placeholder="anemia, hemoglobin, low hb"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="faq-category" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Category (optional)
            </label>
            <input
              id="faq-category"
              type="text"
              value={values.category}
              onChange={(event) => setValues((prev) => ({ ...prev, category: event.target.value }))}
              placeholder="Blood Test"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">{submitLabel}</Button>
          {onCancelEdit ? (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
