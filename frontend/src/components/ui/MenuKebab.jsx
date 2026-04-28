import { useEffect, useRef, useState } from "react";

export default function MenuKebab({ children, label = "Mais ações" }) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!aberto) return;

    function handleClickFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={label}
        className={`inline-flex items-center justify-center p-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
          aberto
            ? "bg-bg-secondary text-text-primary"
            : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
        }`}
      >
        <KebabIcon />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 mt-1 min-w-[180px] z-20 rounded-xl border border-border bg-bg-popover shadow-xl py-1"
          onClick={() => setAberto(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function KebabIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}
