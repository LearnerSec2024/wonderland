import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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

function BookingConfirmationPage() {
  const { bookingReference } = useParams();
  const location = useLocation();
  const { token, user } = useAuth();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [loadError, setLoadError] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (booking) return;

      try {
        setLoading(true);
        setLoadError("");
        let result;

        if (user?.role === "Admin") {
          result = await api.getAdminBookingByReference(token, bookingReference);
        } else if (user?.role === "Manager") {
          result = await api.getManagerBookingByReference(token, bookingReference);
        } else {
          result = await api.getBookingByReference(token, bookingReference);
        }
        setBooking(result.booking);
      } catch (error) {
        setLoadError(error.message || "Booking not found");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [booking, bookingReference, token, user]);

  const handleCancelBooking = async () => {
    const confirmed = window.confirm(
      `Cancel booking ${booking.bookingReference}? This will change the booking status to Cancelled.`
    );

    if (!confirmed) return;

    try {
      setIsCancelling(true);
      setCancelMessage("");
      setCancelError("");

      const result = await api.cancelBooking(
        token,
        booking.bookingReference,
        "Cancelled by customer from booking details page"
      );

      setBooking(result.booking);
      setCancelMessage("Booking cancelled successfully");
    } catch (error) {
      setCancelError(error.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-6 py-14" data-testid="booking-confirmation-loading">
        <div className="rounded-[2rem] bg-white/10 p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" />
          <p className="mt-4 text-white/80">Loading booking confirmation...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="booking-confirmation-error">
        <section className="rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100">
          <p className="font-bold uppercase tracking-[0.25em]">Booking unavailable</p>
          <h1 className="mt-3 text-4xl font-black">Booking not found</h1>
          <p className="mt-3">{loadError}</p>

          <Link
            to="/bookings/history"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-black text-slate-950"
            data-testid="booking-confirmation-history-link"
          >
            Back to booking history
          </Link>
        </section>
      </main>
    );
  }

  const bookingItems = booking.items || [];
  const canCancel = booking.status === "Confirmed";

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="booking-confirmation-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-300 via-cyan-400 to-purple-500 p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em]">Booking details</p>
        <h1 className="mt-3 text-5xl font-black">Your Wonderland booking</h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold">
          Reference, status, timeline, confirmed items and booking management actions.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Booking reference
          </p>
          <h2 className="mt-2 break-all text-4xl font-black" data-testid="booking-reference">
            {booking.bookingReference}
          </h2>

          {booking.customerEmail && (
            <section className="mt-6 rounded-2xl bg-slate-100 p-5" data-testid="booking-customer-details">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Customer</p>
              <p className="mt-2 text-xl font-black">{booking.customerName || "Customer"}</p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-600">{booking.customerEmail}</p>
            </section>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SummaryCard label="Status" value={booking.status} testId="booking-status" />
            <SummaryCard label="Visit date" value={booking.visitDate || "Not set"} testId="booking-visit-date" />
            <SummaryCard label="WonderPoints" value={`+${booking.totalPointsEarned}`} testId="booking-points" />
          </div>

          <section className="mt-8 rounded-2xl bg-slate-100 p-5" data-testid="booking-timeline">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Booking timeline
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <TimelineStep
                title="Booking created"
                detail={formatDate(booking.createdAt)}
                testId="booking-timeline-created"
              />
              <TimelineStep
                title="Current status"
                detail={booking.status}
                testId="booking-timeline-confirmed"
              />
              <TimelineStep
                title={booking.status === "Cancelled" ? "Booking cancelled" : "Rewards updated"}
                detail={
                  booking.status === "Cancelled"
                    ? formatDate(booking.cancelledAt)
                    : `+${booking.totalPointsEarned} WonderPoints`
                }
                testId={booking.status === "Cancelled" ? "booking-timeline-cancelled" : "booking-timeline-points"}
              />
            </div>

            {booking.status === "Cancelled" && booking.cancellationReason && (
              <div
                className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
                data-testid="booking-cancellation-reason"
              >
                Reason: {booking.cancellationReason}
              </div>
            )}
          </section>

          <div className="mt-8 grid gap-4" data-testid="booking-confirmation-items">
            {bookingItems.map((item) => (
              <article
                key={`${item.itemType}-${item.itemId}-${item.name}`}
                className="rounded-2xl bg-slate-100 p-5"
                data-testid={`booking-confirmation-item-${item.itemType}-${item.itemId}`}
              >
                <p className="text-xs font-black uppercase tracking-wide text-purple-600">
                  {item.itemType}
                </p>
                <h3 className="mt-1 text-2xl font-black">{item.name}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {item.itemType === "ride"
                    ? `Quantity: ${item.quantity}`
                    : `Guests: ${item.guestCount}`}
                </p>
                <p className="mt-2 text-xl font-black">${Number(item.subtotal).toFixed(2)}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl">
          <h2 className="text-3xl font-black">Total</h2>
          <p className="mt-4 text-5xl font-black" data-testid="booking-total">
            ${Number(booking.totalAmount).toFixed(2)}
          </p>
          <p className="mt-2 text-slate-600">
            {booking.basketItemCount} basket item{booking.basketItemCount === 1 ? "" : "s"}
          </p>

          <section
            className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-900"
            data-testid="booking-cancellation-prep"
          >
            <p className="font-black">Cancellation management</p>
            <p className="mt-2 text-sm font-semibold">
              Confirmed bookings can be cancelled from this page. Cancelled bookings remain visible in booking history.
            </p>

            {cancelMessage && (
              <div
                className="mt-4 rounded-xl bg-emerald-100 p-3 text-sm font-black text-emerald-800"
                data-testid="booking-cancel-message"
              >
                {cancelMessage}
              </div>
            )}

            {cancelError && (
              <div
                className="mt-4 rounded-xl bg-red-100 p-3 text-sm font-black text-red-800"
                data-testid="booking-cancel-error"
              >
                {cancelError}
              </div>
            )}

            {canCancel ? (
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="mt-4 w-full rounded-xl bg-red-500 px-4 py-3 font-black text-white disabled:bg-slate-300"
                data-testid="booking-cancel-button"
              >
                {isCancelling ? "Cancelling..." : "Cancel booking"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 w-full rounded-xl bg-slate-200 px-4 py-3 font-black text-slate-500"
                data-testid="booking-cancel-disabled"
              >
                Booking already cancelled
              </button>
            )}
          </section>

          <Link
            to="/bookings/history"
            className="mt-6 inline-flex w-full justify-center rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950"
            data-testid="booking-detail-history-link"
          >
            Back to booking history
          </Link>

          <Link
            to="/rides"
            className="mt-3 inline-flex w-full justify-center rounded-2xl bg-purple-600 px-5 py-3 font-black text-white"
            data-testid="booking-confirmation-rides-link"
          >
            Browse more rides
          </Link>

          <Link
            to="/dashboard"
            className="mt-3 inline-flex w-full justify-center rounded-2xl border border-slate-300 px-5 py-3 font-black text-slate-700"
            data-testid="booking-confirmation-dashboard-link"
          >
            Back to dashboard
          </Link>
        </aside>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, testId }) {
  return (
    <article className="rounded-2xl bg-slate-100 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-black" data-testid={testId}>
        {value}
      </p>
    </article>
  );
}

function TimelineStep({ title, detail, testId }) {
  return (
    <article className="rounded-2xl bg-white p-4" data-testid={testId}>
      <p className="text-sm font-black text-purple-600">{title}</p>
      <p className="mt-2 font-bold text-slate-700">{detail}</p>
    </article>
  );
}

export default BookingConfirmationPage;

