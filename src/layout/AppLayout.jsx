import { Link, useLocation } from "react-router-dom";

export default function AppLayout({ children }) {
  const location = useLocation();

  const NavItem = ({ to, label }) => {
    const active = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={
          "px-3 py-2 rounded-lg text-sm font-semibold transition " +
          (active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100")
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="page">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              TM
            </div>
            <div>
              <div className="text-sm font-bold">Team Manager</div>
              <div className="text-xs text-slate-500">Teams • Projects • Tasks</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavItem to="/teams" label="Teams" />
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
          React + FastAPI + Tailwind
        </div>
      </footer>
    </div>
  );
}
