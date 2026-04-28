import { NavLink } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/atividades", label: "Atividades" },
];

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-6 bg-bg-primary/80 backdrop-blur-md px-4 py-3 lg:px-6">
      <h1 className="text-xl font-bold tracking-tight text-text-primary">
        <span className="text-accent">||||</span> Tally
      </h1>

      <nav className="flex items-center gap-1">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <button
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"}
        title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-all duration-150"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}

function SunIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}
