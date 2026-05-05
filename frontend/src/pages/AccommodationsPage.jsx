import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [guestFilter, setGuestFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  useEffect(() => {
    const loadAccommodations = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await api.getAccommodations();
        setAccommodations(data);
      } catch (error) {
        setLoadError(error.message || "Failed to load accommodation");
      } finally {
        setLoading(false);
      }
    };

    loadAccommodations();
  }, []);

  const types = useMemo(() => {
    return Array.from(new Set(accommodations.map((stay) => stay.Type))).sort();
  }, [accommodations]);

  const filteredAccommodations = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();

    const filtered = accommodations.filter((stay) => {
      const matchesSearch =
        !normalisedSearch ||
        stay.Name.toLowerCase().includes(normalisedSearch) ||
        stay.Description.toLowerCase().includes(normalisedSearch) ||
        stay.Type.toLowerCase().includes(normalisedSearch);

      const matchesType = typeFilter === "all" || stay.Type === typeFilter;

      const matchesGuests =
        guestFilter === "all" || Number(stay.MaxGuests) >= Number(guestFilter);

      return matchesSearch && matchesType && matchesGuests;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.PricePerNight) - Number(b.PricePerNight);
      if (sortBy === "price-desc") return Number(b.PricePerNight) - Number(a.PricePerNight);
      if (sortBy === "guests-desc") return Number(b.MaxGuests) - Number(a.MaxGuests);
      return a.Name.localeCompare(b.Name);
    });
  }, [accommodations, searchTerm, typeFilter, guestFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setGuestFilter("all");
    setSortBy("name-asc");
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="accommodations-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">
          Stay in the magic
        </p>
        <h1 className="mt-3 text-5xl font-black">Accommodation</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Browse hotels, lodges, cabins and resorts for your future Wonderland stay.
        </p>
      </section>

      <section
        className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6"
        data-testid="accommodations-filter-panel"
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label htmlFor="accommodation-search" className="text-sm font-bold text-white/80">
              Search stays
            </label>
            <input
              id="accommodation-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, type or theme..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="accommodations-search-input"
            />
          </div>

          <div>
            <label htmlFor="accommodation-type" className="text-sm font-bold text-white/80">
              Stay type
            </label>
            <select
              id="accommodation-type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="accommodations-type-filter"
            >
              <option value="all">All stay types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="accommodation-guests" className="text-sm font-bold text-white/80">
              Minimum guests
            </label>
            <select
              id="accommodation-guests"
              value={guestFilter}
              onChange={(event) => setGuestFilter(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="accommodations-guests-filter"
            >
              <option value="all">Any group size</option>
              <option value="4">4+ guests</option>
              <option value="5">5+ guests</option>
              <option value="6">6+ guests</option>
            </select>
          </div>

          <div>
            <label htmlFor="accommodation-sort" className="text-sm font-bold text-white/80">
              Sort
            </label>
            <select
              id="accommodation-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
              data-testid="accommodations-sort-select"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="guests-desc">Guests high to low</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-white/70" data-testid="accommodations-result-count">
            Showing {filteredAccommodations.length} of {accommodations.length} stays
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full bg-white/15 px-5 py-2 text-sm font-black text-white transition hover:bg-white/25"
            data-testid="accommodations-clear-filters"
          >
            Clear filters
          </button>
        </div>
      </section>

      {loading && (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4" data-testid="accommodations-loading">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-white/10" />
          ))}
        </section>
      )}

      {loadError && (
        <section
          className="mt-8 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-6 text-red-100"
          data-testid="accommodations-error"
        >
          {loadError}. Make sure the backend is running on http://localhost:5010.
        </section>
      )}

      {!loading && !loadError && filteredAccommodations.length === 0 && (
        <section
          className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center"
          data-testid="accommodations-empty-state"
        >
          <p className="text-5xl">🔍</p>
          <h2 className="mt-4 text-3xl font-black">No stays found</h2>
          <p className="mt-2 text-white/70">Try changing your search or filter options.</p>
        </section>
      )}

      {!loading && !loadError && filteredAccommodations.length > 0 && (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4" data-testid="accommodations-results-grid">
          {filteredAccommodations.map((stay) => (
            <AccommodationCard key={stay.AccommodationId} stay={stay} />
          ))}
        </section>
      )}
    </main>
  );
}

function AccommodationCard({ stay }) {
  return (
    <article
      className="overflow-hidden rounded-[2rem] bg-white text-slate-950 shadow-2xl transition hover:-translate-y-2"
      data-testid={`accommodation-card-${stay.AccommodationId}`}
    >
      <div className="h-36 bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 p-5">
        <div className="flex h-full items-end justify-between">
          <span className="text-5xl">🏨</span>
          <span className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold" data-testid={`accommodation-type-${stay.AccommodationId}`}>
            {stay.Type}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-600">
          Up to {stay.MaxGuests} guests
        </p>
        <h2 className="mt-2 text-2xl font-black">{stay.Name}</h2>
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

        <button
          type="button"
          disabled
          className="mt-5 w-full rounded-2xl bg-slate-200 px-4 py-3 text-sm font-black text-slate-500"
          data-testid={`accommodation-book-soon-${stay.AccommodationId}`}
        >
          Booking coming soon
        </button>
      </div>
    </article>
  );
}

export default AccommodationsPage;
