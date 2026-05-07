import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import { api } from "../services/api";

function RideDetailsPage() {
  const { rideId } = useParams();
  const { addRide } = useBasket();
  const [basketMessage, setBasketMessage] = useState("");

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadRide = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await api.getRideById(rideId);
        setRide(data);
      } catch (error) {
        setLoadError(error.message || "Ride not found");
      } finally {
        setLoading(false);
      }
    };

    loadRide();
  }, [rideId]);

  if (loading) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-6 py-14" data-testid="ride-details-loading">
        <div className="rounded-[2rem] bg-white/10 p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" />
          <p className="mt-4 text-white/80">Loading ride details...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="ride-details-error">
        <section className="rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100">
          <p className="font-bold uppercase tracking-[0.25em]">Ride unavailable</p>
          <h1 className="mt-3 text-4xl font-black">Ride not found</h1>
          <p className="mt-4 max-w-2xl">
            This ride may not exist, may be inactive, or may still be waiting for manager approval.
          </p>
          <p className="mt-3 text-sm text-red-100/80">{loadError}</p>

          <Link
            to="/rides"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-black text-slate-950"
            data-testid="ride-details-back-link"
          >
            Back to rides
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="ride-details-page">
      <Link to="/rides" className="font-black text-cyan-300 hover:text-cyan-200" data-testid="ride-details-back-link">
        ← Back to rides
      </Link>

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-white text-slate-950 shadow-2xl">
        <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 p-8">
          <p className="font-bold uppercase tracking-[0.25em] text-white/80">{ride.Category}</p>
          <h1 className="mt-3 text-5xl font-black" data-testid="ride-details-title">
            {ride.Name}
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold text-white/85">
            {ride.Description}
          </p>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-3">
          <DetailCard label="Thrill level" value={ride.ThrillLevel} testId="ride-details-thrill" />
          <DetailCard label="Minimum age" value={`${ride.MinimumAgeYears}+ years`} testId="ride-details-age" />
          <DetailCard label="Minimum height" value={`${ride.MinimumHeightCm} cm`} testId="ride-details-height" />
          <DetailCard
            label="Adult supervision"
            value={ride.RequiresAdultSupervision ? "Required" : "Not required"}
            testId="ride-details-supervision"
          />
          <DetailCard label="Price" value={`$${Number(ride.Price).toFixed(2)}`} testId="ride-details-price" />
          <DetailCard label="WonderPoints" value={`+${ride.PointsEarned} points`} testId="ride-details-points" />
        </div>

        <div className="border-t border-slate-200 p-8">
          <h2 className="text-3xl font-black">Ready for your basket?</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            Add this ride to your booking basket. A future checkout iteration will enforce rider age, height and supervision rules.
          </p>

          {basketMessage && (
            <div className="mt-5 rounded-2xl bg-emerald-100 p-4 font-bold text-emerald-800" data-testid="ride-details-basket-message">
              {basketMessage}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              addRide(ride);
              setBasketMessage(`${ride.Name} added to basket`);
            }}
            className="mt-6 rounded-2xl bg-purple-600 px-6 py-3 font-black text-white transition hover:bg-purple-700"
            data-testid="ride-details-add-to-basket"
          >
            Add to basket
          </button>

          <Link
            to="/basket"
            className="ml-3 mt-6 inline-flex rounded-2xl border border-slate-300 px-6 py-3 font-black text-slate-700"
            data-testid="ride-details-view-basket"
          >
            View basket
          </Link>
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

export default RideDetailsPage;

