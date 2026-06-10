import { getFormClasses } from "@/lib/fixture.utils";

type Size = "sm" | "md";

type Props = {
  form: string[]; // ["W","D","L","W","W"] — index 0 = oldest, last = most recent
  /** Accessible label, e.g. "Gor Mahia recent form" */
  label?: string;
  size?: Size;
};

// Static size map — Tailwind v4 safe
const CELL_SIZE: Record<Size, string> = {
  sm: "h-4 w-4 text-[8px]",
  md: "h-5 w-5 text-[9px]",
};

export function FormBadges({ form, label, size = "md" }: Props) {
  return (
    <div
      className="flex gap-0.5"
      role="list"
      aria-label={label ?? "Recent form"}
    >
      {form.map((result, i) => {
        const { cell, ariaLabel } = getFormClasses(result);
        return (
          <span
            key={i}
            role="listitem"
            className={`${CELL_SIZE[size]} flex items-center justify-center rounded-sm font-black leading-none ${cell}`}
            aria-label={ariaLabel}
          >
            <span aria-hidden="true">{result}</span>
          </span>
        );
      })}
    </div>
  );
}
