export default function Topbar({ onAbrirMenu }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-bg-primary/80 backdrop-blur-md px-4 py-3 lg:px-6">
      <button
        onClick={onAbrirMenu}
        className="lg:hidden p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-all duration-150"
        aria-label="Abrir menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div className="flex-1" />
    </header>
  );
}
