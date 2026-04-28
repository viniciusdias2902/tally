export default function SeletorModoCronometrado({ modo, onMudar }) {
  const opcoes = [
    { id: "timer", label: "Timer" },
    { id: "pomodoro", label: "Pomodoro" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Modo de cronômetro"
      className="inline-flex rounded-xl bg-bg-secondary p-1"
    >
      {opcoes.map(({ id, label }) => {
        const ativo = modo === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={ativo}
            onClick={() => onMudar(id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
              ativo
                ? "bg-bg-elevated text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
