"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTime(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    };
  }

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    expired: false,
  };
}

interface CountdownTimerProps {
  targetDate: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
  showSeconds?: boolean;
}

export default function CountdownTimer({
  targetDate,
  accentColor = "var(--brand)",
  size = "md",
  showSeconds = true,
}: CountdownTimerProps) {

  // Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Safe initial state
  const [time, setTime] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    setMounted(true);

    // Set immediately on mount
    setTime(calcTime(targetDate));

    const id = setInterval(() => {
      setTime(calcTime(targetDate));
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  // Don't render until mounted
  if (!mounted) return null;

  const numSize = {
    sm: "2rem",
    md: "3rem",
    lg: "4.2rem",
  }[size];

  const lblSize = {
    sm: "9px",
    md: "10px",
    lg: "11px",
  }[size];

  const gap = {
    sm: "6px",
    md: "10px",
    lg: "14px",
  }[size];

  if (time.expired) {
    return (
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.8rem",
          color: accentColor,
          letterSpacing: 2,
        }}
      >
        The moment has arrived!
      </p>
    );
  }

  const units = [
    { v: time.days, l: "Days" },
    { v: time.hours, l: "Hrs" },
    { v: time.minutes, l: "Min" },
    ...(showSeconds
      ? [{ v: time.seconds, l: "Sec" }]
      : []),
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap,
        flexWrap: "wrap",
      }}
    >
      {units.map((u, i) => (
        <div
          key={u.l}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap,
          }}
        >
          {i > 0 && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: numSize,
                color: accentColor,
                opacity: 0.5,
                lineHeight: 1,
                paddingBottom: 14,
              }}
            >
              :
            </span>
          )}

          <div
            style={{
              textAlign: "center",
              minWidth: size === "lg" ? 72 : 52,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: numSize,
                lineHeight: 1,
                color: accentColor,
                letterSpacing: 2,
              }}
            >
              {String(u.v).padStart(2, "0")}
            </div>

            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: lblSize,
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              {u.l}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}