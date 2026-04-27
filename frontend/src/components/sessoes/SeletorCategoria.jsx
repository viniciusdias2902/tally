export default function SeletorCategoria({ categorias, valor, onMudar }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="categoria-sessao"
        className="text-sm font-medium text-text-secondary"
      >
        Categoria
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onMudar(null)}
          className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
            valor === null
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-input-bg text-text-secondary hover:border-accent/40"
          }`}
        >
          Sem categoria
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onMudar(c.id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
              valor === c.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-input-bg text-text-secondary hover:border-accent/40"
            }`}
          >
            <span
              className="h-3 w-3 rounded-full border border-black/10 dark:border-white/10"
              style={{ backgroundColor: c.cor }}
              aria-hidden="true"
            />
            {c.nome}
          </button>
        ))}
      </div>
      {categorias.length === 0 && (
        <p className="text-xs text-text-muted">
          Nenhuma categoria cadastrada para esta atividade.
        </p>
      )}
    </div>
  );
}
