import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  calculateBasketItemSubtotal,
  useBasket,
} from "../context/BasketContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

function CheckoutPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { items, basketCount, basketTotal, totalPoints, clearBasket } = useBasket();

  const [visitDate, setVisitDate] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (event) => {
    event.preventDefault();
    setCheckoutError("");
    setIsSubmitting(true);

    try {
      const result = await api.checkoutBasket(token, {
        items,
        visitDate: visitDate || null,
        customerNotes: customerNotes || null,
      });

      clearBasket();

      navigate(`/booking-confirmation/${result.booking.bookingReference}`, {
        replace: true,
        state: { booking: result.booking },
      });
    } catch (error) {
      setCheckoutError(error.message || "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="checkout-empty-page">
        <section className="rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center">
          <p className="text-5xl">🧺</p>
          <h1 className="mt-4 text-4xl font-black">Your basket is empty</h1>
          <p className="mt-3 text-white/70">Add a ride or accommodation before checkout.</p>

          <Link
            to="/basket"
            className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950"
            data-testid="checkout-empty-basket-link"
          >
            Back to basket
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="checkout-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-500 p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em]">Checkout</p>
        <h1 className="mt-3 text-5xl font-black">Confirm your Wonderland booking</h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold">
          Review your basket, choose a visit date and confirm your booking.
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <form
          className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl"
          onSubmit={handleCheckout}
          data-testid="checkout-form"
        >
          <h2 className="text-3xl font-black">Booking details</h2>

          <div className="mt-6 rounded-2xl bg-slate-100 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Booking for
            </p>
            <p className="mt-2 text-xl font-black" data-testid="checkout-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-slate-600" data-testid="checkout-user-email">
              {user?.email}
            </p>
          </div>

          <label className="mt-5 block text-sm font-bold">
            Visit date
            <input
              type="date"
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
              data-testid="checkout-visit-date"
              required
            />
          </label>

          <label className="mt-5 block text-sm font-bold">
            Notes
            <textarea
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
              placeholder="Optional notes for your booking..."
              data-testid="checkout-notes"
            />
          </label>

          {checkoutError && (
            <div
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700"
              data-testid="checkout-error"
            >
              {checkoutError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-purple-600 px-5 py-3 font-black text-white transition hover:bg-purple-700 disabled:bg-slate-400"
            data-testid="checkout-submit-button"
          >
            {isSubmitting ? "Confirming booking..." : "Confirm booking"}
          </button>
        </form>

        <aside className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid="checkout-summary">
          <h2 className="text-3xl font-black">Order summary</h2>

          <div className="mt-6 grid gap-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl bg-slate-100 p-4"
                data-testid={`checkout-item-${item.itemType}-${item.itemId}`}
              >
                <p className="text-xs font-black uppercase tracking-wide text-purple-600">
                  {item.itemType}
                </p>
                <h3 className="mt-1 font-black">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {item.itemType === "ride"
                    ? `Quantity: ${item.quantity}`
                    : `Guests: ${item.guestCount}`}
                </p>
                <p className="mt-2 text-lg font-black">
                  ${calculateBasketItemSubtotal(item).toFixed(2)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 text-lg font-bold">
            <div className="flex justify-between">
              <span>Basket count</span>
              <span data-testid="checkout-summary-count">{basketCount}</span>
            </div>

            <div className="flex justify-between">
              <span>WonderPoints</span>
              <span data-testid="checkout-summary-points">+{totalPoints}</span>
            </div>

            <div className="flex justify-between text-2xl font-black">
              <span>Total</span>
              <span data-testid="checkout-summary-total">${basketTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/basket"
            className="mt-6 inline-flex w-full justify-center rounded-2xl border border-slate-300 px-5 py-3 font-black text-slate-700"
            data-testid="checkout-back-basket-link"
          >
            Back to basket
          </Link>
        </aside>
      </section>
    </main>
  );
}

export default CheckoutPage;
