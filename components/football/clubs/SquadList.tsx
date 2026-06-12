import type { Player, PositionCategory } from "@/types/player";
import { PlayerPreviewCard } from "./PlayerPreviewCard";

type Props = {
  players: Player[];
  clubSlug: string;
};

const CATEGORIES: { key: PositionCategory; label: string }[] = [
  { key: "goalkeeper", label: "Goalkeepers" },
  { key: "defender",   label: "Defenders" },
  { key: "midfielder", label: "Midfielders" },
  { key: "forward",    label: "Forwards" },
];

const POSITION_CATEGORIES: Record<string, PositionCategory> = {
  "Goalkeeper":           "goalkeeper",
  "Centre-Back":          "defender",
  "Left-Back":            "defender",
  "Right-Back":           "defender",
  "Wing-Back":            "defender",
  "Defensive Midfielder": "midfielder",
  "Central Midfielder":   "midfielder",
  "Attacking Midfielder": "midfielder",
  "Left Midfielder":      "midfielder",
  "Right Midfielder":     "midfielder",
  "Striker":              "forward",
  "Second Striker":       "forward",
  "Left Winger":          "forward",
  "Right Winger":         "forward",
};

export function SquadList({ players }: Props) {
  if (players.length === 0) {
    return (
      <section className="rounded-sm border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-sm font-black tracking-tight">Squad</h2>
        </div>
        <p className="px-5 py-6 text-sm text-zinc-400">No squad data available.</p>
      </section>
    );
  }

  const grouped = CATEGORIES.map(({ key, label }) => ({
    key,
    label,
    players: players.filter((p) => POSITION_CATEGORIES[p.position] === key),
  })).filter((g) => g.players.length > 0);

  return (
    <section
      className="rounded-sm border border-zinc-200 bg-white"
      aria-label="Squad list"
    >
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-black tracking-tight">
          Squad <span className="ml-1 text-xs font-normal text-zinc-400">({players.length})</span>
        </h2>
      </div>

      <div className="divide-y divide-zinc-100">
        {grouped.map(({ key, label, players: group }) => (
          <div key={key}>
            <p className="bg-zinc-50 px-5 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {label}
            </p>
            <ul className="px-2 py-1">
              {group.map((player) => (
                <PlayerPreviewCard key={player.id} player={player} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
