type Props = { achievements: string[] };

export function ClubAchievements({ achievements }: Props) {
  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label="Club achievements"
    >
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">Honours</h2>
      </div>

      <ul className="divide-y divide-zinc-50 px-5">
        {achievements.map((achievement, i) => (
          <li key={i} className="flex items-start gap-2.5 py-2.5">
            <span className="mt-0.5 text-amber-400" aria-hidden="true">
              ★
            </span>
            <span className="text-sm text-zinc-700">{achievement}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
