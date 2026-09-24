export default function PitchVisual() {
  const players = [
    { x: 18, y: 28, team: "home" },
    { x: 28, y: 48, team: "home" },
    { x: 35, y: 68, team: "home" },
    { x: 42, y: 35, team: "home" },
    { x: 46, y: 58, team: "home" },

    { x: 82, y: 28, team: "away" },
    { x: 72, y: 48, team: "away" },
    { x: 65, y: 68, team: "away" },
    { x: 58, y: 35, team: "away" },
    { x: 54, y: 58, team: "away" },
  ];

  return (
    <div
      className="relative min-h-[280px] overflow-hidden bg-emerald-800 text-white sm:min-h-[340px]"
      aria-hidden="true"
    >
      {/* Pitch grass texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0px, rgba(255,255,255,.035) 55px, transparent 55px, transparent 110px)",
        }}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,44,34,.35)_100%)]" />

      {/* Pitch boundary */}
      <div className="absolute inset-6 border border-white/40 sm:inset-8" />

      {/* Halfway line */}
      <div className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2 bg-white/35 sm:top-8 sm:bottom-8" />

      {/* Centre circle */}
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 sm:h-28 sm:w-28" />

      {/* Centre spot */}
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" />

      {/* Left penalty area */}
      <div className="absolute left-6 top-1/2 h-28 w-16 -translate-y-1/2 border-y border-r border-white/35 sm:left-8 sm:h-32 sm:w-20" />

      {/* Left goal area */}
      <div className="absolute left-6 top-1/2 h-14 w-8 -translate-y-1/2 border-y border-r border-white/35 sm:left-8 sm:h-16 sm:w-10" />

      {/* Right penalty area */}
      <div className="absolute right-6 top-1/2 h-28 w-16 -translate-y-1/2 border-y border-l border-white/35 sm:right-8 sm:h-32 sm:w-20" />

      {/* Right goal area */}
      <div className="absolute right-6 top-1/2 h-14 w-8 -translate-y-1/2 border-y border-l border-white/35 sm:right-8 sm:h-16 sm:w-10" />

      {/* Players */}
      {players.map((player, index) => (
        <div
          key={index}
          className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            player.team === "home"
              ? "bg-white shadow-[0_0_0_5px_rgba(255,255,255,.12)]"
              : "bg-lime-300 shadow-[0_0_0_5px_rgba(190,242,100,.16)]"
          }`}
          style={{
            left: `${player.x}%`,
            top: `${player.y}%`,
          }}
        />
      ))}

      {/* Ball */}
      <div className="absolute left-[51%] top-[47%] h-2.5 w-2.5 rounded-full bg-white shadow-lg" />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-300 sm:text-xs">
          FootballKE Match Centre
        </p>

        <p className="mt-2 max-w-2xl text-2xl font-black leading-tight sm:text-3xl xl:text-4xl">
          Kenyan football, fixtures, standings, and stories in one place.
        </p>
      </div>
    </div>
  );
}