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

function ManagerBookingActivityPage() {
  const { token } = useAuth();

  const [summary, setSummary] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const result = await api.getManagerBookingActivity(token);
        setSummary(result.summary);
        setRecentBookings(result.recentBookings || []);
      } catch (error) {
        setLoadError(error.message || "Failed to load booking activity");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [token]);

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="manager-booking-activity-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">Manager booking activity</p>
        <h1 className="mt-3 text-5xl font-black">Booking activity summary</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Monitor confirmed and cancelled booking activity across Wonderland.
        </p>
      </section>

      {loading && (
        <section className="mt-8 rounded-[2rem] bg-white/10 p-8 text-white/70" data-testid="manager-booking-activity-loading">
          Loading booking activity...
        </section>
      )}

      {loadError && (
        <section className="mt-8 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100" data-testid="manager-booking-activity-error">
          {loadError}
        </section>
      )}

      {!loading && !loadError && summary && (
        <>
          <section className="mt-8 grid gap-6 md:grid-cols-5" data-testid="manager-booking-summary">
            <SummaryCard label="Total" value={summary.totalBookings} testId="manager-booking-total" />
            <SummaryCard label="Confirmed" value={summary.confirmedBookings} testId="manager-booking-confirmed" />
            <SummaryCard label="Cancelled" value={summary.cancelledBookings} testId="manager-booking-cancelled" />
            <SummaryCard label="Revenue" value={`$${summary.totalRevenue.toFixed(2)}`} testId="manager-booking-revenue" />
            <SummaryCard label="Points" value={`+${summary.totalPointsIssued}`} testId="manager-booking-points" />
          </section>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6">
            <p className="font-bold uppercase tracking-[0.25em] text-cyan-300">Recent activity</p>
            <h2 className="mt-3 text-3xl font-black">Latest customer bookings</h2>

            {recentBookings.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-white/10 p-6 text-white/70" data-testid="manager-booking-empty">
                No booking activity yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-4" data-testid="manager-booking-activity-list">
                {recentBookings.map((booking) => (
                  <article
                    key={booking.bookingReference}
                    className="rounded-2xl bg-white p-5 text-slate-950"
                    data-testid={`manager-booking-card-${booking.bookingReference}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                          {booking.status}
                        </p>
                        <h3 className="mt-2 break-all text-2xl font-black">{booking.bookingReference}</h3>
                        <p className="mt-2 font-bold text-slate-700">{booking.customerName}</p>
                        <p className="break-all text-sm font-semibold text-slate-500">{booking.customerEmail}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Visit date: {booking.visitDate || "Not set"} • Booked: {formatDate(booking.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black">${Number(booking.totalAmount).toFixed(2)}</p>
                        <p className="text-sm font-bold text-slate-500">+{booking.totalPointsEarned} pts</p>
                      </div>
                    </div>

                    <Link
                      to={`/booking-confirmation/${booking.bookingReference}`}
                      className="mt-4 inline-flex rounded-full bg-purple-600 px-5 py-2 font-black text-white"
                      data-testid={`manager-booking-view-${booking.bookingReference}`}
                    >
                      View details
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function SummaryCard({ label, value, testId }) {
  return (
    <article className="rounded-[2rem] bg-white/10 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-black" data-testid={testId}>
        {value}
      </p>
    </article>
  );
}

export default ManagerBookingActivityPage;
