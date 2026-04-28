const RAIO = 46;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export default function TimerRing({
  progresso = 0,
  cor = "text-timer-idle",
  pulsar = false,
  children,
}) {
  const seguro = Math.min(1, Math.max(0, progresso));
  const offset = CIRCUNFERENCIA * (1 - seguro);

  return (
    <div className="relative w-72 h-72 mx-auto">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={RAIO}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-bg-secondary"
        />
        <circle
          cx="50"
          cy="50"
          r={RAIO}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={offset}
          className={`${cor} ${pulsar ? "animate-pulse-soft" : ""} transition-[stroke-dashoffset,stroke] duration-1000 ease-linear`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
        {children}
      </div>
    </div>
  );
}
