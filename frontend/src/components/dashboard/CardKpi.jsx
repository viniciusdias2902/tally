export function CardKpi({ titulo, valor, sufixo }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {titulo}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">
        {valor}
        {sufixo ? (
          <span className="ml-1 text-sm font-normal text-text-secondary">
            {sufixo}
          </span>
        ) : null}
      </p>
    </div>
  );
}
