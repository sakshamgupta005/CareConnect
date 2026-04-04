import { Lightbulb } from "lucide-react";
import { type RecommendationDto } from "../../lib/reportApi";

type RecommendationCardProps = {
  item: RecommendationDto;
};

export function RecommendationCard({ item }: RecommendationCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-secondary">
        <Lightbulb className="h-3 w-3" />
        {item.category}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.text}</p>
    </article>
  );
}

