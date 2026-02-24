"use client";

import { useTheme } from "./ThemeProvider";

type ThemeMode = "system" | "light" | "dark";

const MODES: ThemeMode[] = ["system", "light", "dark"];

const ICONS: Record<ThemeMode, string> = {
  system: "◐",
  light: "☀︎",
  dark: "☾",
};

const LABELS: Record<ThemeMode, string> = {
  system: "Auto",
  light: "Claro",
  dark: "Oscuro",
};

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const cycle = () => {
    const idx = MODES.indexOf(mode);
    const next = MODES[(idx + 1) % MODES.length];
    setMode(next);
  };

  return (
    <button
      onClick={cycle}
      className="glass-sm !py-2 !px-3 text-[0.78em] font-medium transition-colors"
      style={{ color: "rgba(var(--base-rgb), 0.5)" }}
      title={`Tema: ${LABELS[mode]}`}
      aria-label={`Cambiar tema. Actual: ${LABELS[mode]}`}
    >
      <span className="inline-block w-4 text-center">{ICONS[mode]}</span>
      <span
        className="ml-1 hidden sm:inline"
        style={{ color: "rgba(var(--base-rgb), 0.35)" }}
      >
        {LABELS[mode]}
      </span>
    </button>
  );
}
