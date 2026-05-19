import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useBasket } from "../context/BasketContext";

const publicNavItems = [
  { to: "/", label: "Home", testId: "nav-home" },
  { to: "/rides", label: "Rides", testId: "nav-rides" },
  { to: "/accommodations", label: "Stays", testId: "nav-accommodations" },
  { to: "/basket", label: "Basket", testId: "nav-basket" },
  { to: "/dashboard", label: "Dashboard", testId: "nav-dashboard" },
];

function Navbar() {
  const navigate = useNavigate();
  const { token, user, isAuthenticated, logout } = useAuth();
  const { basketCount } = useBasket();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      if (!token || user?.role !== "Manager") {
        setPendingCount(0);
        return;
      }

      try {
        const result = await api.getManagerApprovalCount(token);
        setPendingCount(result.pendingCount || 0);
      } catch {
        setPendingCount(0);
      }
    };

    loadPendingCount();
  }, [token, user]);

  const linkClass = ({ isActive }) =>
    [
      "rounded-full px-4 py-2 text-sm font-bold transition",
      isActive
        ? "bg-yellow-300 text-slate-950 shadow-lg shadow-yellow-400/20"
        : "text-white/80 hover:bg-white/15 hover:text-white",
    ].join(" ");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true, state: null });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10"
        data-testid="main-navbar"
      >
        <Link to="/" className="flex items-center gap-3" data-testid="brand-link">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 text-2xl shadow-lg">
            🎡
          </span>
          <div>
            <p className="text-xl font-black leading-none text-white">Wonderland</p>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Theme Park
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              data-testid={item.testId}
            >
              {item.label}
              {item.to === "/basket" && basketCount > 0 && (
                <span
                  className="ml-2 inline-flex rounded-full bg-cyan-300 px-2 py-0.5 text-xs font-black text-slate-950"
                  data-testid="nav-basket-count"
                >
                  {basketCount}
                </span>
              )}
            </NavLink>
          ))}

          {isAuthenticated && (
            <NavLink to="/profile" className={linkClass} data-testid="nav-profile">
              Profile
            </NavLink>
          )}

          {user?.role === "Admin" && (
            <>
              <NavLink to="/admin/content" className={linkClass} data-testid="nav-admin-content">
                Admin Content
              </NavLink>
              <NavLink to="/admin/bookings" className={linkClass} data-testid="nav-admin-bookings">
                Admin Bookings
              </NavLink>
              <NavLink to="/admin/reports" className={linkClass} data-testid="nav-admin-reports">
                Admin Reports
              </NavLink>
            
              <NavLink
                to="/admin/audit-logs"
                className={linkClass}
                data-testid="nav-admin-audit-logs"
              >
                Audit Logs
              </NavLink></>
          )}

          {user?.role === "Manager" && (
            <>
              <NavLink to="/manager/approvals" className={linkClass} data-testid="nav-manager-approvals">
                Manager Tasks
                {pendingCount > 0 && (
                  <span
                    className="ml-2 inline-flex animate-pulse rounded-full bg-pink-400 px-2 py-0.5 text-xs font-black text-slate-950"
                    data-testid="nav-manager-pending-count"
                  >
                    {pendingCount}
                  </span>
                )}
              </NavLink>
              <NavLink to="/manager/bookings" className={linkClass} data-testid="nav-manager-bookings">
                Booking Activity
              </NavLink>
              <NavLink to="/manager/reports" className={linkClass} data-testid="nav-manager-reports">
                Manager Reports
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span
                className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 sm:inline-flex"
                data-testid="nav-user-greeting"
              >
                Hi, {user?.firstName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-pink-400 px-5 py-2 text-sm font-black text-slate-950 shadow-lg shadow-pink-400/20 transition hover:-translate-y-0.5 hover:bg-pink-300"
                data-testid="nav-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;


