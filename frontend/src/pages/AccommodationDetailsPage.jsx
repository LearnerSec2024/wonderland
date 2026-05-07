import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

function AccommodationDetailsPage() {
  const { accommodationId } = useParams();

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadAccommodation = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await api.getAccommodationById(accommodationId);
        setAccommodation(data);
      } catch (error) {
        setLoadError(error.message || "Accommodation not found");
      } finally {
        setLoading(false);
      }
    };

    loadAccommodation();
  }, [accommodationId]);

  if (loading) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-6 py-14" data-testid="accommodation-details-loading">
        <div className="rounded-[2rem] bg-white/10 p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" />
          <p className="mt-4 text-white/80">Loading accommodation details...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="accommodation-details-error">
        <section className="rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100">
          <p className="font-bold uppercase tracking-[0.25em]">Stay unavailable</p>
          <h1 className="mt-3 text-4xl font-black">Accommodation not found</h1>
          <p className="mt-4 max-w-2xl">
            This accommodation may not exist, may be inactive, or may still be waiting for manager approval.
          </p>
          <p className="mt-3 text-sm text-red-100/80">{loadError}</p>

          <Link
            to="/accommodations"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-black text-slate-950"
            data-testid="accommodation-details-back-link"
          >
            Back to stays
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="accommodation-details-page">
      <Link to="/accommodations" className="font-black text-cyan-300 hover:text-cyan-200" data-testid="accommodation-details-back-link">
        ← Back to stays
      </Link>

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-white text-slate-950 shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 p-8">
          <p className="font-bold uppercase tracking-[0.25em] text-white/80">{accommodation.Type}</p>
          <h1 className="mt-3 text-5xl font-black" data-testid="accommodation-details-title">
            {accommodation.Name}
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold text-white/85">
            {accommodation.Description}
          </p>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-3">
          <DetailCard label="Stay type" value={accommodation.Type} testId="accommodation-details-type" />
          <DetailCard label="Max guests" value={`${accommodation.MaxGuests} guests`} testId="accommodation-details-guests" />
          <DetailCard
            label="Lead guest age"
            value={`${accommodation.MinimumLeadGuestAgeYears}+ years`}
            testId="accommodation-details-age"
          />
          <DetailCard
            label="Family friendly"
            value={accommodation.IsFamilyFriendly ? "Yes" : "No"}
            testId="accommodation-details-family"
          />
          <DetailCard
            label="Price per night"
            value={`$${Number(accommodation.PricePerNight).toFixed(2)}`}
            testId="accommodation-details-price"
          />
        </div>

        <div className="border-t border-slate-200 p-8">
          <h2 className="text-3xl font-black">Booking coming soon</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            A future iteration will allow guests to add accommodation to a booking basket and enforce lead guest age rules during checkout.
          </p>

          <button
            type="button"
            disabled
            className="mt-6 rounded-2xl bg-slate-200 px-6 py-3 font-black text-slate-500"
            data-testid="accommodation-details-booking-disabled"
          >
            Add to basket coming soon
          </button>
        </div>
      </section>
    </main>
  );
}

function DetailCard({ label, value, testId }) {
  return (
    <article className="rounded-2xl bg-slate-100 p-5">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black" data-testid={testId}>
        {value}
      </p>
    </article>
  );
}

export default AccommodationDetailsPage;
