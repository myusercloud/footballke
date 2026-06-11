type Props = {
  label: string;
  size: string;
  className?: string;
};

export default function AdSlot({ label, size, className = "" }: Props) {
  return (
    <aside
      className={`flex min-h-24 items-center justify-center rounded border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center ${className}`}
      aria-label={`${label} advert slot`}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          {label}
        </p>
        <p className="mt-1 text-[10px] text-zinc-300">{size}</p>
      </div>
    </aside>
  );
}
