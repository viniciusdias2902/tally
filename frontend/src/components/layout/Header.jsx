import { useAuth } from "../../contexts/AuthContext.jsx";

export default function Header({ onAbrirMenu }) {
  const { usuario } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg-primary/80 backdrop-blur-sm px-4 py-3 lg:px-6">
      <button
        onClick={onAbrirMenu}
        className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:bg-bg-secondary transition-colors"
        aria-label="Abrir menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      {usuario && (
        <span className="text-sm text-text-secondary">
          {usuario.nome}
        </span>
      )}
    </header>
  );
}
