import type { Fixture } from "@/types/fixture";
import { FixtureCard } from "./FixtureCard";

type Props = {
  fixtures: Fixture[];
  /** Optional section heading, e.g. "Today", "This Week", "Results" */
  title?: string;
  /** Optional supporting text below the title */
  description?: string;
};

export function FixtureGrid({ fixtures, title, description }: Props) {
  return (
    <section aria-label={title ?? "Fixtures"}>
      {title && (
        <div className="mb-4 flex items-baseline gap-3 border-b border-zinc-200 pb-3">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
          {description && (
            <span className="text-sm text-zinc-400">{description}</span>
          )}
        </div>
      )}

      {/* Fixture cards are naturally full-width. On very wide screens a
          two-column layout could be added, but a single column gives the
          home/away teams equal horizontal space and keeps scores readable. */}
      <ul className="space-y-3">
        {fixtures.map((fixture) => (
          <li key={fixture.id}>
            <FixtureCard fixture={fixture} />
          </li>
        ))}
      </ul>
    </section>
  );
}
