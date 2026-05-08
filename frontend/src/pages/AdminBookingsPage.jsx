import { useEffect, useMemo, useState } from "react";
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

function AdminBookingsPage() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadAdminBookings = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const [bookingsResult, summaryResult] = await Promise.all([
          api.getAdminBookings(token),
          api.getAdminBookingSummary(token),
        ]);

        setBookings(bookingsResult.bookings || []);
        setSummary(summaryResult);
      } catch (error) {
        setLoadError(error.message || "Failed to load admin bookings");
      } finally {
        setLoading(false);
      }
    };

    loadAdminBookings();
  }, [token]);

  const statuses = useMemo(() => {
    return Array.from(new Set(bookings.map((booking) => booking.status))).sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();

    const filtered = bookings.filter((booking) => {
      const matchesSearch =
        !normalisedSearch ||
        booking.bookingReference.toLowerCase().includes(normalisedSearch) ||
        booking.customerEmail.toLowerCase().includes(normalisedSearch) ||
        booking.customerName.toLowerCase().includes(normalisedSearch) ||
        booking.status.toLowerCase().includes(normalisedSearch);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "total-desc") return Number(b.totalAmount) - Number(a.totalAmount);
      if (sortBy === "total-asc") return Number(a.totalAmount) - Number(b.totalAmount);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="admin-bookings-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">Admin bookings</p>
        <h1 className="mt-3 text-5xl font-black">Customer booking visibility</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Search, filter and inspect customer bookings across Wonderland.
        </p>
      </section>

      {loading && (
        <section className="mt-8 rounded-[2rem] bg-white/10 p-8 text-white/70" data-testid="admin-bookings-loading">
          Loading customer bookings...
        </section>
      )}

      {loadError && (
        <section className="mt-8 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100" data-testid="admin-bookings-error">
          {loadError}
        </section>
      )}

      {!loading && !loadError && summary && (
        <>
          <section className="mt-8 grid gap-6 md:grid-cols-5" data-testid="admin-bookings-summary">
            <SummaryCard label="Total" value={summary.totalBookings} testId="admin-bookings-total" />
            <SummaryCard label="Confirmed" value={summary.confirmedBookings} testId="admin-bookings-confirmed" />
            <SummaryCard label="Cancelled" value={summary.cancelledBookings} testId="admin-bookings-cancelled" />
            <SummaryCard label="Revenue" value={`$${summary.totalRevenue.toFixed(2)}`} testId="admin-bookings-revenue" />
            <SummaryCard label="Points" value={`+${summary.totalPointsIssued}`} testId="admin-bookings-points" />
          </section>

          <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6" data-testid="admin-bookings-filter-panel">
            <div className="grid gap-4 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label htmlFor="admin-bookings-search" className="text-sm font-bold text-white/80">
                  Search booking/customer
                </label>
                <input
                  id="admin-bookings-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search WB-, customer name or email..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
                  data-testid="admin-bookings-search-input"
                />
              </div>

              <div>
                <label htmlFor="admin-bookings-status" className="text-sm font-bold text-white/80">
                  Status
                </label>
                <select
                  id="admin-bookings-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
                  data-testid="admin-bookings-status-filter"
                >
                  <option value="all">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="admin-bookings-sort" className="text-sm font-bold text-white/80">
                  Sort
                </label>
                <select
                  id="admin-bookings-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
                  data-testid="admin-bookings-sort-select"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="total-desc">Highest total</option>
                  <option value="total-asc">Lowest total</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-semibold text-white/70" data-testid="admin-bookings-filter-count">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full bg-white/15 px-5 py-2 text-sm font-black text-white transition hover:bg-white/25"
                data-testid="admin-bookings-clear-filters"
              >
                Clear filters
              </button>
            </div>
          </section>

          {filteredBookings.length === 0 ? (
            <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center" data-testid="admin-bookings-no-results">
              <p className="text-5xl">🔍</p>
              <h2 className="mt-4 text-3xl font-black">No matching bookings</h2>
              <p className="mt-2 text-white/70">Try changing your search or filter options.</p>
            </section>
          ) : (
            <section className="mt-8 grid gap-5" data-testid="admin-bookings-list">
              {filteredBookings.map((booking) => (
                <article
                  key={booking.bookingReference}
                  className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl"
                  data-testid={`admin-booking-card-${booking.bookingReference}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
                        {booking.status}
                      </p>
                      <h2 className="mt-2 break-all text-3xl font-black">{booking.bookingReference}</h2>
                      <p className="mt-3 font-bold text-slate-700">{booking.customerName}</p>
                      <p className="break-all text-sm font-semibold text-slate-500">{booking.customerEmail}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Visit date: {booking.visitDate || "Not set"} • Booked: {formatDate(booking.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-black">${Number(booking.totalAmount).toFixed(2)}</p>
                      <p className="mt-1 font-bold text-slate-500">+{booking.totalPointsEarned} WonderPoints</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="font-bold text-slate-600">
                      {booking.basketItemCount} basket item{booking.basketItemCount === 1 ? "" : "s"}
                    </p>

                    <Link
                      to={`/booking-confirmation/${booking.bookingReference}`}
                      className="rounded-full bg-purple-600 px-6 py-3 font-black text-white"
                      data-testid={`admin-booking-view-${booking.bookingReference}`}
                    >
                      View booking details
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          )}
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

export default AdminBookingsPage;
