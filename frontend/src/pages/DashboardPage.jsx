import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="dashboard-page">
      <p className="font-bold uppercase tracking-[0.25em] text-yellow-300">Protected area</p>
      <h1 className="mt-3 text-5xl font-black">Dashboard</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/70">
        Welcome back, <span data-testid="dashboard-user-name">{user?.firstName}</span>. This page is protected by JWT authentication.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] bg-white/10 p-6">
          <p className="text-sm font-bold text-white/60">Logged-in user</p>
          <p className="mt-2 text-2xl font-black" data-testid="dashboard-user-email">
            {user?.email}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white/10 p-6">
          <p className="text-sm font-bold text-white/60">WonderPoints</p>
          <p className="mt-2 text-4xl font-black" data-testid="dashboard-total-points">
            {user?.totalPoints ?? 0}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white/10 p-6">
          <p className="text-sm font-bold text-white/60">Role</p>
          <p className="mt-2 text-4xl font-black" data-testid="dashboard-user-role">
            {user?.role}
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6">
        <h2 className="text-2xl font-black">Coming next</h2>
        <p className="mt-3 text-white/70">
          Future iterations will add ride bookings, accommodation bookings, points history and booking confirmations here.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-full bg-pink-400 px-6 py-3 font-black text-slate-950 transition hover:bg-pink-300"
          data-testid="dashboard-logout-button"
        >
          Logout
        </button>
      </section>
    </main>
  );
}

export default DashboardPage;
