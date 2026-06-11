type Props = {
  items: string[];
};

export default function LiveTicker({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-zinc-200 bg-emerald-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-0 px-4 sm:px-6 lg:px-8">
        <span className="mr-3 shrink-0 border-r border-emerald-700 py-2 pr-3 text-[10px] font-black uppercase tracking-[0.22em] text-lime-300">
          Live
        </span>
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap py-2 text-xs font-semibold text-emerald-100 scrollbar-none">
          {items.map((item, i) => (
            <span key={i} className="shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
