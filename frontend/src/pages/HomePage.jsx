import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

function HomePage() {
  const [rides, setRides] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [ridesData, accommodationsData] = await Promise.all([
          api.getRides(),
          api.getAccommodations(),
        ]);

        setRides(ridesData);
        setAccommodations(accommodationsData);
      } catch (error) {
        setLoadError(error.message || "Something went wrong loading Wonderland data");
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <main data-testid="home-page">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#fb7185,transparent_35%),radial-gradient(circle_at_top_right,#38bdf8,transparent_35%),linear-gradient(135deg,#312e81,#701a75,#0f766e)]" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-16 lg:min-h-[680px] lg:flex-row lg:items-center lg:px-10">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur">
              Stay • Play • Ride • Earn WonderPoints
            </p>

            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                Wonderland
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/85 sm:text-xl">
              Book magical stays, reserve thrilling rides, and collect rewards
              every time you plan your adventure.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/rides"
                className="rounded-full bg-yellow-300 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-yellow-500/30 transition hover:-translate-y-1 hover:bg-yellow-200"
                data-testid="home-explore-rides-link"
              >
                Explore Rides
              </Link>
              <Link
                to="/accommodations"
                className="rounded-full bg-white/15 px-6 py-3 font-bold text-white ring-1 ring-white/30 backdrop-blur transition hover:-translate-y-1 hover:bg-white/25"
                data-testid="home-view-stays-link"
              >
                View Accommodation
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <StatCard label="Rides" value={rides.length || "4+"} />
              <StatCard label="Stays" value={accommodations.length || "4+"} />
              <StatCard label="Rewards" value="Points" />
            </div>
          </div>

          <div className="grid flex-1 gap-5 sm:grid-cols-2">
            <FeatureCard emoji="??" title="Thrill Rides" text="From dragon coasters to galaxy spinners, pick your perfect adventure." />
            <FeatureCard emoji="??" title="Magical Stays" text="Stay near the castle, jungle, pirate cove or galaxy resort." />
            <FeatureCard emoji="?" title="WonderPoints" text="Earn points on rides and accommodation bookings." />
            <FeatureCard emoji="??" title="Automation Lab" text="Later we will add Playwright training pages with realistic test scenarios." />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        {loading && (
          <div className="rounded-3xl bg-white/10 p-6 text-center text-white/80" data-testid="home-loading">
            Loading Wonderland experiences...
          </div>
        )}

        {loadError && (
          <div className="rounded-3xl border border-red-300/40 bg-red-500/15 p-6 text-red-100" data-testid="home-error">
            {loadError}. Make sure the backend is running on http://localhost:5010.
          </div>
        )}

        {!loading && !loadError && (
          <>
            <SectionHeader
              eyebrow="Book your next adventure"
              title="Featured Rides"
              description="Live data loaded from SQL Server through your Node/Express backend."
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {rides.slice(0, 4).map((ride) => (
                <RideCard key={ride.RideId} ride={ride} />
              ))}
            </div>

            <SectionHeader
              eyebrow="Stay in the magic"
              title="Accommodation"
              description="Hotels, lodges, cabins and resorts ready for future booking functionality."
              extraClassName="mt-16"
            />

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {accommodations.slice(0, 4).map((stay) => (
                <AccommodationCard key={stay.AccommodationId} stay={stay} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-white/15 p-4 text-center shadow-lg ring-1 ring-white/20 backdrop-blur">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm text-white/75">{label}</div>
    </div>
  );
}

function FeatureCard({ emoji, title, text }) {
  return (
    <div className="rounded-[2rem] bg-white/15 p-6 shadow-xl ring-1 ring-white/20 backdrop-blur transition hover:-translate-y-1 hover:bg-white/20">
      <div className="text-5xl">{emoji}</div>
      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      <p className="mt-3 text-white/75">{text}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, extraClassName = "" }) {
  return (
    <div className={extraClassName}>
      <p className="font-bold uppercase tracking-[0.25em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-lg text-white/70">{description}</p>
    </div>
  );
}

function RideCard({ ride }) {
  return (
    <article
      className="overflow-hidden rounded-[2rem] bg-white text-slate-950 shadow-2xl transition hover:-translate-y-2"
      data-testid={`home-ride-card-${ride.RideId}`}
    >
      <div className="h-36 bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 p-5">
        <div className="flex h-full items-end justify-between">
          <span className="text-5xl">??</span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold">
            {ride.ThrillLevel}
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
          {ride.Category}
        </p>
        <h3 className="mt-2 text-2xl font-black">{ride.Name}</h3>
        <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">
          {ride.Description}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-black">${Number(ride.Price).toFixed(2)}</span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
            +{ride.PointsEarned} pts
          </span>
        </div>
      </div>
    </article>
  );
}

function AccommodationCard({ stay }) {
  return (
    <article
      className="overflow-hidden rounded-[2rem] bg-white text-slate-950 shadow-2xl transition hover:-translate-y-2"
      data-testid={`home-accommodation-card-${stay.AccommodationId}`}
    >
      <div className="h-36 bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 p-5">
        <div className="flex h-full items-end justify-between">
          <span className="text-5xl">??</span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold">
            {stay.Type}
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-600">
          Up to {stay.MaxGuests} guests
        </p>
        <h3 className="mt-2 text-2xl font-black">{stay.Name}</h3>
        <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">
          {stay.Description}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-black">
            ${Number(stay.PricePerNight).toFixed(2)}
          </span>
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-bold text-cyan-800">
            per night
          </span>
        </div>
      </div>
    </article>
  );
}

export default HomePage;
