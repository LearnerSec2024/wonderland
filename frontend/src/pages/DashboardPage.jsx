import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DashboardPage() {
  const { user, token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setBookingsLoading(true);
        setBookingsError("");
        const result = await api.getMyBookings(token);
        setBookings(result.bookings || []);
      } catch (error) {
        setBookingsError(error.message || "Failed to load bookings");
      } finally {
        setBookingsLoading(false);
      }
    };

    if (token) {
      loadBookings();
    }
  }, [token]);

  const recentBookings = bookings.slice(0, 3);

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="dashboard-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em]">Member dashboard</p>
        <h1 className="mt-3 text-5xl font-black">Welcome back, {user?.firstName}</h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold">
          View your Wonderland profile, recent bookings and rewards activity.
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <DashboardCard
          label="Logged-in user"
          value={user?.email}
          testId="dashboard-user-email"
          breakText
        />
        <DashboardCard
          label="Role"
          value={user?.role}
          testId="dashboard-user-role"
        />
        <DashboardCard
          label="WonderPoints"
          value={user?.totalPoints ?? 0}
          testId="dashboard-user-points"
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section
          className="rounded-[2rem] border border-white/10 bg-white/10 p-6"
          data-testid="dashboard-recent-bookings-section"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold uppercase tracking-[0.25em] text-cyan-300">
                Recent bookings
              </p>
              <h2 className="mt-3 text-3xl font-black">Your latest Wonderland plans</h2>
            </div>

            <Link
              to="/bookings/history"
              className="rounded-full bg-cyan-300 px-5 py-3 font-black text-slate-950"
              data-testid="dashboard-booking-history-link"
            >
              View all bookings
            </Link>
          </div>

          {bookingsLoading && (
            <p className="mt-6 text-white/70" data-testid="dashboard-recent-bookings-loading">
              Loading recent bookings...
            </p>
          )}

          {bookingsError && (
            <div className="mt-6 rounded-2xl border border-red-300/40 bg-red-500/15 p-4 text-red-100" data-testid="dashboard-recent-bookings-error">
              {bookingsError}
            </div>
          )}

          {!bookingsLoading && !bookingsError && recentBookings.length === 0 && (
            <div className="mt-6 rounded-2xl bg-white/10 p-6 text-white/70" data-testid="dashboard-recent-bookings-empty">
              No bookings yet. Add a ride or stay to your basket and checkout.
            </div>
          )}

          {!bookingsLoading && !bookingsError && recentBookings.length > 0 && (
            <div className="mt-6 grid gap-4" data-testid="dashboard-recent-bookings-list">
              {recentBookings.map((booking) => (
                <article
                  key={booking.bookingReference}
                  className="rounded-2xl bg-white p-5 text-slate-950"
                  data-testid={`dashboard-booking-card-${booking.bookingReference}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                        {booking.status}
                      </p>
                      <h3 className="mt-2 break-all text-2xl font-black">
                        {booking.bookingReference}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        Visit date: {booking.visitDate || "Not set"} • Booked: {formatDate(booking.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black">${Number(booking.totalAmount).toFixed(2)}</p>
                      <p className="text-sm font-bold text-slate-500">
                        +{booking.totalPointsEarned} pts
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/booking-confirmation/${booking.bookingReference}`}
                    className="mt-4 inline-flex rounded-full bg-purple-600 px-5 py-2 font-black text-white"
                    data-testid={`dashboard-booking-view-${booking.bookingReference}`}
                  >
                    View details
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl">
          <h2 className="text-3xl font-black">Quick actions</h2>

          <div className="mt-6 grid gap-3">
            <Link
              to="/profile"
              className="rounded-2xl bg-slate-100 px-5 py-4 font-black text-slate-800"
              data-testid="dashboard-profile-link"
            >
              View profile
            </Link>

            <Link
              to="/rides"
              className="rounded-2xl bg-purple-600 px-5 py-4 font-black text-white"
              data-testid="dashboard-rides-link"
            >
              Browse rides
            </Link>

            <Link
              to="/accommodations"
              className="rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950"
              data-testid="dashboard-accommodations-link"
            >
              Browse stays
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

function DashboardCard({ label, value, testId, breakText = false }) {
  return (
    <article className="rounded-[2rem] bg-white/10 p-6">
      <p className="text-sm font-bold text-white/60">{label}</p>
      <p
        className={`mt-2 text-xl font-black ${breakText ? "break-all" : ""}`}
        data-testid={testId}
      >
        {value}
      </p>
    </article>
  );
}

export default DashboardPage;
