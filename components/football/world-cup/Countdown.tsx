"use client";

import { useEffect, useState } from "react";

type Props = { targetDate: string; label?: string };

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function compute(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function Countdown({ targetDate, label = "Tournament starts in" }: Props) {
  const target = new Date(targetDate);
  const [time, setTime] = useState<TimeLeft>(compute(target));
  const finished = Date.now() >= target.getTime();

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setTime(compute(target)), 1000);
    return () => clearInterval(id);
  }, [targetDate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) return null;

  return (
    <div className="rounded-sm border border-zinc-200 bg-white px-5 py-4" aria-live="polite" aria-label={label}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <div className="flex gap-4">
        {([["days", time.days], ["hrs", time.hours], ["min", time.minutes], ["sec", time.seconds]] as const).map(([unit, val]) => (
          <div key={unit} className="flex flex-col items-center">
            <span className="text-2xl font-black tabular-nums text-zinc-900">{pad(val)}</span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
