import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

function RoleProtectedRoute({ allowedRoles, children }) {
  const { token, user } = useAuth();
  const location = useLocation();
  const isAccessDenied = !user || !allowedRoles.includes(user.role);

  useEffect(() => {
    if (!token || !user || !isAccessDenied) {
      return;
    }

    const deniedPath = `${location.pathname}${location.search}`;
    const storageKey = `wonderland_access_denied_logged:${user.userId}:${deniedPath}:${allowedRoles.join(
      ","
    )}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "true");

    api
      .reportAccessDenied(token, {
        path: deniedPath,
        allowedRoles,
      })
      .catch(() => {
        sessionStorage.removeItem(storageKey);
      });
  }, [allowedRoles, isAccessDenied, location.pathname, location.search, token, user]);

  if (isAccessDenied) {
    return (
      <main
        className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10"
        data-testid="access-denied-page"
      >
        <section className="rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100">
          <p className="font-bold uppercase tracking-[0.25em]">Access denied</p>
          <h1 className="mt-3 text-4xl font-black">You do not have permission</h1>
          <p className="mt-4 max-w-2xl">
            This area is restricted to {allowedRoles.join(" or ")} users.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-black text-slate-950"
            data-testid="access-denied-dashboard-link"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return children;
}

export default RoleProtectedRoute;
