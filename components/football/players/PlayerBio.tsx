import type { Player } from "@/types/player";

type Props = { player: Player };

export function PlayerBio({ player }: Props) {
  if (!player.bio) return null;

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white px-5 py-4"
      aria-label="Player biography"
    >
      <h2 className="mb-3 text-sm font-black tracking-tight">About</h2>
      <p className="text-sm leading-relaxed text-zinc-700">{player.bio}</p>
    </section>
  );
}
