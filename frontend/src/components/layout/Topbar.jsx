import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/atividades", label: "Atividades" },
];

export default function Topbar() {
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
    </header>
  );
}
