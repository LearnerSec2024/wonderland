import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", testId: "nav-home" },
  { to: "/rides", label: "Rides", testId: "nav-rides" },
  { to: "/accommodations", label: "Stays", testId: "nav-accommodations" },
  { to: "/dashboard", label: "Dashboard", testId: "nav-dashboard" },
];

function Navbar() {
  const linkClass = ({ isActive }) =>
    [
      "rounded-full px-4 py-2 text-sm font-bold transition",
      isActive
        ? "bg-yellow-300 text-slate-950 shadow-lg shadow-yellow-400/20"
        : "text-white/80 hover:bg-white/15 hover:text-white",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10"
        data-testid="main-navbar"
      >
        <Link to="/" className="flex items-center gap-3" data-testid="brand-link">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 text-2xl shadow-lg">
            ??
          </span>
          <div>
            <p className="text-xl font-black leading-none text-white">Wonderland</p>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Theme Park
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              data-testid={item.testId}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-bold text-white/80 transition hover:bg-white/15 hover:text-white sm:inline-flex"
            data-testid="nav-login"
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-black text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:bg-cyan-200"
            data-testid="nav-register"
          >
            Register
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

