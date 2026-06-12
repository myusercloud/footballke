import type { Club } from "@/types/club";
import { ClubCard } from "./ClubCard";

type Props = { clubs: Club[] };

export function ClubGrid({ clubs }: Props) {
  if (clubs.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">No clubs found.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clubs.map((club) => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}
