const opcoes = [
  { id: "timer", label: "Timer", Icon: ClockIcon },
  { id: "pomodoro", label: "Pomodoro", Icon: TomatoIcon },
];

export default function SeletorModoCronometrado({ modo, onMudar }) {
  const indice = opcoes.findIndex((o) => o.id === modo);

  return (
    <div
      role="tablist"
      aria-label="Modo de cronômetro"
      className="relative inline-grid grid-cols-2 rounded-xl bg-bg-secondary p-1 shadow-inner"
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-bg-elevated shadow-sm transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${indice * 100}%)` }}
      />
      {opcoes.map(({ id, label, Icon }) => {
        const ativo = modo === id;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={ativo}
            onClick={() => onMudar(id)}
            className={`relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
              ativo
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function TomatoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c-3.5 0-6 2.5-6 6 0 4 3 7 6 7s6-3 6-7c0-3.5-2.5-6-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 5c.5-1 1.5-2 3-2M14 6l-1-2" />
    </svg>
  );
}
