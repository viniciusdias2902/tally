import { useState } from "react";
import TimerLivre from "../components/timer/TimerLivre.jsx";
import TimerPomodoro from "../components/timer/TimerPomodoro.jsx";

const TABS = [
  { id: "livre", label: "Timer Livre", icon: ClockIcon },
  { id: "pomodoro", label: "Pomodoro", icon: TomatoIcon },
];

export default function Timer() {
  const [tabAtiva, setTabAtiva] = useState("livre");

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-2xl bg-bg-secondary p-1 gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTabAtiva(id)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                tabAtiva === id
                  ? "bg-bg-elevated text-accent shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon active={tabAtiva === id} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      {tabAtiva === "livre" ? <TimerLivre /> : <TimerPomodoro />}
    </div>
  );
}

// --- Ícones ---

function ClockIcon({ active }) {
  return (
    <svg
      className={`w-4 h-4 ${active ? "text-accent" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function TomatoIcon({ active }) {
  return (
    <svg
      className={`w-4 h-4 ${active ? "text-accent" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v3"
      />
    </svg>
  );
}
