import { Link } from "react-router-dom";
import {
  calculateAccommodationPricing,
  calculateBasketItemSubtotal,
  useBasket,
} from "../context/BasketContext";

function BasketPage() {
  const {
    items,
    basketCount,
    basketTotal,
    totalPoints,
    updateRideQuantity,
    updateAccommodationGuests,
    removeItem,
    clearBasket,
  } = useBasket();

  const confirmClearBasket = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your entire Wonderland basket?"
    );

    if (confirmed) {
      clearBasket();
    }
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="basket-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-600 p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em]">Booking basket</p>
        <h1 className="mt-3 text-5xl font-black">Your Wonderland basket</h1>
        <p className="mt-4 max-w-3xl text-lg font-semibold">
          Add rides and accommodation before the future checkout and booking confirmation flow.
        </p>
      </section>

      {items.length === 0 ? (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center" data-testid="basket-empty">
          <p className="text-5xl">🧺</p>
          <h2 className="mt-4 text-3xl font-black">Your basket is empty</h2>
          <p className="mt-2 text-white/70">Start by choosing a ride or stay.</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/rides" className="rounded-full bg-purple-500 px-6 py-3 font-black text-white">
              Browse rides
            </Link>
            <Link to="/accommodations" className="rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950">
              Browse stays
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5" data-testid="basket-items-list">
            {items.map((item) => (
              <BasketItem
                key={item.id}
                item={item}
                updateRideQuantity={updateRideQuantity}
                updateAccommodationGuests={updateAccommodationGuests}
                removeItem={removeItem}
              />
            ))}
          </div>

          <aside className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid="basket-summary">
            <h2 className="text-3xl font-black">Summary</h2>

            <div className="mt-6 space-y-4 text-lg font-bold">
              <div className="flex justify-between">
                <span>Basket count</span>
                <span data-testid="basket-summary-count">{basketCount}</span>
              </div>

              <div className="flex justify-between">
                <span>WonderPoints</span>
                <span data-testid="basket-summary-points">+{totalPoints}</span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between text-2xl font-black">
                  <span>Total</span>
                  <span data-testid="basket-summary-total">${basketTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-6 w-full rounded-2xl bg-slate-200 px-5 py-3 font-black text-slate-500"
              data-testid="basket-checkout-disabled"
            >
              Checkout coming soon
            </button>

            <button
              type="button"
              onClick={confirmClearBasket}
              className="mt-3 w-full rounded-2xl border border-red-300 px-5 py-3 font-black text-red-700"
              data-testid="basket-clear-button"
            >
              Clear basket
            </button>
          </aside>
        </section>
      )}
    </main>
  );
}

function BasketItem({
  item,
  updateRideQuantity,
  updateAccommodationGuests,
  removeItem,
}) {
  const subtotal = calculateBasketItemSubtotal(item);
  const accommodationPricing =
    item.itemType === "accommodation"
      ? calculateAccommodationPricing(item)
      : null;

  const confirmRemove = () => {
    const confirmed = window.confirm(
      `Remove ${item.name} from your Wonderland basket?`
    );

    if (confirmed) {
      removeItem(item.id);
    }
  };

  return (
    <article
      className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl"
      data-testid={`basket-item-${item.itemType}-${item.itemId}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
            {item.itemType === "ride" ? "Ride" : "Accommodation"}
          </p>
          <h2 className="mt-2 text-3xl font-black">{item.name}</h2>
          <p className="mt-3 max-w-2xl text-slate-600">{item.description}</p>
        </div>

        <button
          type="button"
          onClick={confirmRemove}
          className="rounded-full bg-red-100 px-4 py-2 text-sm font-black text-red-700"
          data-testid={`basket-remove-${item.itemType}-${item.itemId}`}
        >
          Remove
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Unit price
          </p>
          <p className="mt-2 text-2xl font-black">${item.unitPrice.toFixed(2)}</p>
        </div>

        {item.itemType === "ride" ? (
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Quantity
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateRideQuantity(item.itemId, item.quantity - 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white font-black"
                data-testid={`basket-ride-decrease-${item.itemId}`}
              >
                -
              </button>
              <span className="text-2xl font-black" data-testid={`basket-ride-quantity-${item.itemId}`}>
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateRideQuantity(item.itemId, item.quantity + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-white font-black"
                data-testid={`basket-ride-increase-${item.itemId}`}
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-100 p-4">
            <label className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Guests
              <select
                value={item.guestCount}
                onChange={(event) =>
                  updateAccommodationGuests(item.itemId, event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg font-black"
                data-testid={`basket-accommodation-guests-${item.itemId}`}
              >
                {Array.from({ length: item.maxGuests }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <option key={value} value={value}>
                      {value} guest{value > 1 ? "s" : ""}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
        )}

        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Subtotal
          </p>
          <p className="mt-2 text-2xl font-black" data-testid={`basket-subtotal-${item.itemType}-${item.itemId}`}>
            ${subtotal.toFixed(2)}
          </p>
        </div>
      </div>

      {item.itemType === "accommodation" && (
        <div
          className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-900"
          data-testid={`basket-accommodation-pricing-note-${item.itemId}`}
        >
          <p className="font-black">Guest pricing rule</p>
          <p className="mt-1">
            Base ${accommodationPricing.basePrice.toFixed(2)} + guest surcharge ${accommodationPricing.surcharge.toFixed(2)}.
          </p>
          <p className="mt-1">
            Guest 1 adds 50%, guests 2 and 3 add 25% each, guest 4 adds 10%, and guests above 4 are free.
          </p>
        </div>
      )}
    </article>
  );
}

export default BasketPage;
