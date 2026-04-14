import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutIcon },
  { to: "/atividades", label: "Atividades", icon: ListIcon },
];

export default function Sidebar({ aberto, colapsada, onFechar, onColapsar }) {
  const { sair, usuario } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {aberto && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onFechar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-bg-elevated shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_8px_-2px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          aberto ? "translate-x-0" : "-translate-x-full"
        } ${colapsada ? "lg:w-16 w-64" : "w-64"}`}
      >
        <div className={`py-6 ${colapsada ? "px-0 text-center" : "px-5"}`}>
          <h1 className={`font-bold tracking-tight text-text-primary ${colapsada ? "text-base" : "text-xl"}`}>
            <span className="text-accent">||||</span>
            {!colapsada && <>{" "}Tally</>}
          </h1>
        </div>

        <nav className={`flex-1 space-y-0.5 ${colapsada ? "px-2" : "px-3"}`}>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onFechar}
              title={colapsada ? label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                  colapsada ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`
              }
            >
              <Icon />
              {!colapsada && label}
            </NavLink>
          ))}
        </nav>

        <div className={`p-3 space-y-0.5 ${colapsada ? "px-2" : ""}`}>
          <button
            onClick={toggleTheme}
            title={colapsada ? (theme === "dark" ? "Modo claro" : "Modo escuro") : undefined}
            className={`flex items-center rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-all duration-150 w-full ${
              colapsada ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            }`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            {!colapsada && (theme === "dark" ? "Modo claro" : "Modo escuro")}
          </button>

          {usuario && !colapsada && (
            <div className="flex items-center gap-3 px-3 py-2.5 text-text-secondary">
              <UserIcon />
              <span className="text-sm truncate">
                {usuario.nome}
              </span>
            </div>
          )}

          <button
            onClick={sair}
            title={colapsada ? "Sair" : undefined}
            className={`flex items-center rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-danger transition-all duration-150 w-full ${
              colapsada ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            }`}
          >
            <LogoutIcon />
            {!colapsada && "Sair"}
          </button>
        </div>
      </aside>
    </>
  );
}

function LayoutIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
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

function UserIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}
