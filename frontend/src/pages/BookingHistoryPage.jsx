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

function BookingHistoryPage() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const result = await api.getMyBookings(token);
        setBookings(result.bookings || []);
      } catch (error) {
        setLoadError(error.message || "Failed to load booking history");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [token]);

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="booking-history-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-500 p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em]">Booking history</p>
        <h1 className="mt-3 text-5xl font-black">Your Wonderland bookings</h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold">
          Review confirmed bookings, booking references, visit dates, totals and WonderPoints.
        </p>
      </section>

      {loading && (
        <section className="mt-8 rounded-[2rem] bg-white/10 p-8 text-white/70" data-testid="booking-history-loading">
          Loading booking history...
        </section>
      )}

      {loadError && (
        <section className="mt-8 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100" data-testid="booking-history-error">
          {loadError}
        </section>
      )}

      {!loading && !loadError && bookings.length === 0 && (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center" data-testid="booking-history-empty">
          <p className="text-5xl">🎟️</p>
          <h2 className="mt-4 text-3xl font-black">No bookings yet</h2>
          <p className="mt-2 text-white/70">Book a ride or stay to see your booking history here.</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/rides" className="rounded-full bg-purple-500 px-6 py-3 font-black text-white">
              Browse rides
            </Link>
            <Link to="/accommodations" className="rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">
              Browse stays
            </Link>
          </div>
        </section>
      )}

      {!loading && !loadError && bookings.length > 0 && (
        <section className="mt-8 grid gap-5" data-testid="booking-history-list">
          {bookings.map((booking) => (
            <article
              key={booking.bookingReference}
              className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl"
              data-testid={`booking-history-card-${booking.bookingReference}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
                    {booking.status}
                  </p>
                  <h2 className="mt-2 break-all text-3xl font-black">
                    {booking.bookingReference}
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Visit date: {booking.visitDate || "Not set"} • Booked: {formatDate(booking.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black">${Number(booking.totalAmount).toFixed(2)}</p>
                  <p className="mt-1 font-bold text-slate-500">
                    +{booking.totalPointsEarned} WonderPoints
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="font-bold text-slate-600">
                  {booking.basketItemCount} basket item{booking.basketItemCount === 1 ? "" : "s"}
                </p>

                <Link
                  to={`/booking-confirmation/${booking.bookingReference}`}
                  className="rounded-full bg-purple-600 px-6 py-3 font-black text-white transition hover:bg-purple-700"
                  data-testid={`booking-history-view-${booking.bookingReference}`}
                >
                  View booking details
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default BookingHistoryPage;
