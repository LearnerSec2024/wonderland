import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useBasket } from "../context/BasketContext";

function RidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [thrillFilter, setThrillFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  useEffect(() => {
    const loadRides = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await api.getRides();
        setRides(data);
      } catch (error) {
        setLoadError(error.message || "Failed to load rides");
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(rides.map((ride) => ride.Category))).sort();
  }, [rides]);

  const thrillLevels = useMemo(() => {
    return Array.from(new Set(rides.map((ride) => ride.ThrillLevel))).sort();
  }, [rides]);

  const filteredRides = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();

    const filtered = rides.filter((ride) => {
      const matchesSearch =
        !normalisedSearch ||
        ride.Name.toLowerCase().includes(normalisedSearch) ||
        ride.Description.toLowerCase().includes(normalisedSearch) ||
        ride.Category.toLowerCase().includes(normalisedSearch) ||
        ride.ThrillLevel.toLowerCase().includes(normalisedSearch);

      const matchesCategory =
        categoryFilter === "all" || ride.Category === categoryFilter;

      const matchesThrill =
        thrillFilter === "all" || ride.ThrillLevel === thrillFilter;

      return matchesSearch && matchesCategory && matchesThrill;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.Price) - Number(b.Price);
      if (sortBy === "price-desc") return Number(b.Price) - Number(a.Price);
      if (sortBy === "points-desc") return Number(b.PointsEarned) - Number(a.PointsEarned);
      return a.Name.localeCompare(b.Name);
    });
  }, [rides, searchTerm, categoryFilter, thrillFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setThrillFilter("all");
    setSortBy("name-asc");
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="rides-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-200">
          Adventure catalogue
        </p>
        <h1 className="mt-3 text-5xl font-black">Rides</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Search, filter and sort Wonderland rides. Open a ride to view eligibility, points and pricing details.
        </p>
      </section>

      <section
        className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6"
        data-testid="rides-filter-panel"
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <label htmlFor="rides-search" className="text-sm font-bold text-white/80">
              Search rides
            </label>
            <input
              id="rides-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, category or thrill..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="rides-search-input"
            />
          </div>

          <div>
            <label htmlFor="rides-category" className="text-sm font-bold text-white/80">
              Category
            </label>
            <select
              id="rides-category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="rides-category-filter"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rides-thrill" className="text-sm font-bold text-white/80">
              Thrill level
            </label>
            <select
              id="rides-thrill"
              value={thrillFilter}
              onChange={(event) => setThrillFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="rides-thrill-filter"
            >
              <option value="all">All thrill levels</option>
              {thrillLevels.map((thrillLevel) => (
                <option key={thrillLevel} value={thrillLevel}>
                  {thrillLevel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rides-sort" className="text-sm font-bold text-white/80">
              Sort
            </label>
            <select
              id="rides-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="rides-sort-select"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="points-desc">Points high to low</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-white/70" data-testid="rides-result-count">
            Showing {filteredRides.length} of {rides.length} rides
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full bg-white/15 px-5 py-2 text-sm font-black text-white transition hover:bg-white/25"
            data-testid="rides-clear-filters"
          >
            Clear filters
          </button>
        </div>
      </section>

      {loading && (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4" data-testid="rides-loading">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-white/10" />
          ))}
        </section>
      )}

      {loadError && (
        <section
          className="mt-8 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-6 text-red-100"
          data-testid="rides-error"
        >
          {loadError}. Make sure the backend is running on http://localhost:5010.
        </section>
      )}

      {!loading && !loadError && filteredRides.length === 0 && (
        <section
          className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center"
          data-testid="rides-empty-state"
        >
          <p className="text-5xl">🔍</p>
          <h2 className="mt-4 text-3xl font-black">No rides found</h2>
          <p className="mt-2 text-white/70">Try changing your search or filter options.</p>
        </section>
      )}

      {!loading && !loadError && filteredRides.length > 0 && (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4" data-testid="rides-results-grid">
          {filteredRides.map((ride) => (
            <RideCard key={ride.RideId} ride={ride} />
          ))}
        </section>
      )}
    </main>
  );
}

function RideCard({ ride }) {
  const { addRide } = useBasket();
  const [basketMessage, setBasketMessage] = useState("");

  const handleAddToBasket = () => {
    addRide(ride);
    setBasketMessage(`${ride.Name} added to basket`);
  };

  return (
    <article
      className="overflow-hidden rounded-[2rem] bg-white text-slate-950 shadow-2xl transition hover:-translate-y-2"
      data-testid={`ride-card-${ride.RideId}`}
    >
      <div className="h-36 bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 p-5">
        <div className="flex h-full items-end justify-between">
          <span className="text-5xl">🎢</span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold" data-testid={`ride-thrill-${ride.RideId}`}>
            {ride.ThrillLevel}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-purple-600">
          {ride.Category}
        </p>
        <h2 className="mt-2 text-2xl font-black">{ride.Name}</h2>
        <p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">
          {ride.Description}
        </p>

        <div className="mt-5 grid gap-2 text-sm font-bold text-slate-600">
          <span>Minimum age: {ride.MinimumAgeYears}+ years</span>
          <span>Minimum height: {ride.MinimumHeightCm} cm</span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-black">${Number(ride.Price).toFixed(2)}</span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-800">
            +{ride.PointsEarned} pts
          </span>
        </div>

        {basketMessage && (
          <p
            className="mt-4 rounded-2xl bg-emerald-100 p-3 text-sm font-bold text-emerald-800"
            data-testid={`ride-card-basket-message-${ride.RideId}`}
          >
            {basketMessage}
          </p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAddToBasket}
            className="rounded-2xl bg-pink-400 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-pink-300"
            data-testid={`ride-card-add-to-basket-${ride.RideId}`}
          >
            Add to basket
          </button>

          <Link
            to={`/rides/${ride.RideId}`}
            className="rounded-2xl bg-purple-600 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-purple-700"
            data-testid={`ride-details-link-${ride.RideId}`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default RidesPage;




