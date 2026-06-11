export default function PitchVisual() {
  return (
    <div
      className="relative min-h-[240px] overflow-hidden bg-emerald-800 text-white sm:min-h-[280px]"
      aria-hidden="true"
    >
      {/* Pitch markings */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.04)_50%,transparent_50%)] bg-[length:88px_100%]" />
      <div className="absolute inset-5 border border-white/30 sm:inset-7" />
      <div className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-white/30 sm:top-7 sm:h-[calc(100%-3.5rem)]" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 sm:h-24 sm:w-24" />
      <div className="absolute left-5 top-1/2 h-24 w-14 -translate-y-1/2 border-y border-r border-white/30 sm:left-7 sm:h-28 sm:w-16" />
      <div className="absolute right-5 top-1/2 h-24 w-14 -translate-y-1/2 border-y border-l border-white/30 sm:right-7 sm:h-28 sm:w-16" />
      {/* Player dots */}
      <div className="absolute left-[20%] top-[30%] h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_0_5px_rgba(255,255,255,.12)]" />
      <div className="absolute right-[24%] top-[58%] h-3.5 w-3.5 rounded-full bg-lime-300 shadow-[0_0_0_5px_rgba(190,242,100,.16)]" />
      <div className="absolute left-[45%] top-[42%] h-3 w-3 rounded-full bg-white/60" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/20 to-transparent" />
      {/* Text */}
      <div className="absolute bottom-6 left-6 right-6 sm:bottom-7 sm:left-8 sm:right-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-300 sm:text-xs">
          FootballKE Match Centre
        </p>
        <p className="mt-2 text-2xl font-black leading-tight sm:text-3xl xl:text-4xl">
          Kenyan football, fixtures, standings, and stories in one place.
        </p>
      </div>
    </div>
  );
}
