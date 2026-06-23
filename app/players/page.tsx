import type { Metadata } from "next";
import Link from "next/link";
import { getPlayers } from "@/lib/players.cache";
import { PlayerCard } from "@/components/football/players/PlayerCard";
import type { PositionCategory } from "@/types/player";

export const metadata: Metadata = {
  title: "Players",
  description:
    "All Kenyan Premier League players — stats, profiles, and squad information on FootballKE.",
  openGraph: {
    title: "KPL Players — FootballKE",
    description: "All Kenyan Premier League players — stats, profiles, and squad information.",
  },
  alternates: { canonical: "/players" },
};

const POSITION_TABS: { label: string; value: PositionCategory | undefined }[] = [
  { label: "All",         value: undefined       },
  { label: "Goalkeepers", value: "goalkeeper"    },
  { label: "Defenders",   value: "defender"      },
  { label: "Midfielders", value: "midfielder"    },
  { label: "Forwards",    value: "forward"       },
];

const VALID_POSITIONS = new Set(["goalkeeper", "defender", "midfielder", "forward"]);

type PageProps = {
  searchParams: Promise<{ position?: string }>;
};

export default async function PlayersPage({ searchParams }: PageProps) {
  const { position } = await searchParams;
  const positionCategory = VALID_POSITIONS.has(position ?? "")
    ? (position as PositionCategory)
    : undefined;

  const { players, total } = await getPlayers({ positionCategory, pageSize: 200 });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Players</h1>
        {total > 0 && (
          <p className="shrink-0 text-sm text-zinc-500">
            {total} player{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Position filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {POSITION_TABS.map(({ label, value }) => {
          const active = positionCategory === value;
          const href = value ? `/players?position=${value}` : "/players";
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                active
                  ? "bg-emerald-800 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {players.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">No players found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </main>
  );
}
