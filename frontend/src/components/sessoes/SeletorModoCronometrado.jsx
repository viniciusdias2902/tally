import Button from "../ui/Button.jsx";

const opcoes = [
  { id: "timer", label: "Timer", Icon: ClockIcon },
  { id: "pomodoro", label: "Pomodoro", Icon: TomatoIcon },
];

export default function SeletorModoCronometrado({ modo, onMudar }) {
  return (
    <div role="tablist" aria-label="Modo de cronômetro" className="flex gap-2">
      {opcoes.map(({ id, label, Icon }) => {
        const ativo = modo === id;
        return (
          <Button
            key={id}
            role="tab"
            aria-selected={ativo}
            variant={ativo ? "primary" : "secondary"}
            onClick={() => onMudar(id)}
            className="flex-1"
          >
            <Icon />
            {label}
          </Button>
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
