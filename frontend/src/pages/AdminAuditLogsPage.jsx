import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EMPTY_FILTERS = {
  startDate: "",
  endDate: "",
  eventCategory: "",
  eventType: "",
  actorRole: "",
  actionStatus: "",
  search: "",
};

const EVENT_CATEGORIES = [
  "Content",
  "ContentApproval",
  "Booking",
  "Report",
  "Security",
];

const ACTOR_ROLES = ["Admin", "Manager", "User"];
const ACTION_STATUSES = ["Succeeded", "Denied", "Failed"];

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDetails(details) {
  if (!details) return "No additional details";

  if (typeof details === "string") {
    return details;
  }

  return JSON.stringify(details, null, 2);
}

function buildActiveFilterText(filters) {
  const active = [];

  if (filters.startDate) active.push(`From ${filters.startDate}`);
  if (filters.endDate) active.push(`To ${filters.endDate}`);
  if (filters.eventCategory) active.push(`Category ${filters.eventCategory}`);
  if (filters.eventType) active.push(`Type ${filters.eventType}`);
  if (filters.actorRole) active.push(`Role ${filters.actorRole}`);
  if (filters.actionStatus) active.push(`Status ${filters.actionStatus}`);
  if (filters.search) active.push(`Search "${filters.search}"`);

  return active.length ? active.join(" · ") : "No filters applied";
}

function AdminAuditLogsPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadAuditEvents = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const result = await api.getAdminAuditEvents(token, appliedFilters);

        if (isActive) {
          setEvents(result.events || []);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message || "Failed to load application audit logs");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadAuditEvents();

    return () => {
      isActive = false;
    };
  }, [
    token,
    appliedFilters.startDate,
    appliedFilters.endDate,
    appliedFilters.eventCategory,
    appliedFilters.eventType,
    appliedFilters.actorRole,
    appliedFilters.actionStatus,
    appliedFilters.search,
  ]);

  const summary = useMemo(() => {
    const byCategory = events.reduce((totals, event) => {
      const category = event.eventCategory || "Unknown";
      totals[category] = (totals[category] || 0) + 1;
      return totals;
    }, {});

    const deniedCount = events.filter(
      (event) => event.actionStatus === "Denied"
    ).length;

    return {
      total: events.length,
      deniedCount,
      byCategory,
    };
  }, [events]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  return (
    <section
      className="space-y-8"
      data-testid="admin-audit-logs-page"
    >
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-white shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-300">
          Application audit logs
        </p>
        <h1 className="mt-3 text-4xl font-black">
          Who did what, when, and where
        </h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Review business-level application audit events including content
          creation, manager approvals, booking actions, report exports and
          restricted access attempts.
        </p>
      </div>

      <form
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        onSubmit={handleApplyFilters}
        data-testid="admin-audit-filter-form"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Audit filters
            </h2>
            <p
              className="mt-2 text-sm text-slate-600"
              data-testid="admin-audit-active-filters"
            >
              Active filters: {buildActiveFilterText(appliedFilters)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
              data-testid="admin-audit-apply-filters"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              data-testid="admin-audit-reset-filters"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Start date
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              data-testid="admin-audit-start-date"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            End date
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              data-testid="admin-audit-end-date"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Event category
            <select
              name="eventCategory"
              value={filters.eventCategory}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              data-testid="admin-audit-event-category"
            >
              <option value="">All categories</option>
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Actor role
            <select
              name="actorRole"
              value={filters.actorRole}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              data-testid="admin-audit-actor-role"
            >
              <option value="">All roles</option>
              {ACTOR_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Action status
            <select
              name="actionStatus"
              value={filters.actionStatus}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              data-testid="admin-audit-action-status"
            >
              <option value="">All statuses</option>
              {ACTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-slate-700 lg:col-span-3">
            Search
            <input
              type="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search summary, actor email, event type or target reference"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              data-testid="admin-audit-search"
            />
          </label>
        </div>
      </form>

      <div
        className="grid gap-4 md:grid-cols-3"
        data-testid="admin-audit-summary"
      >
        <SummaryCard
          label="Events shown"
          value={summary.total}
          testId="admin-audit-total-events"
        />
        <SummaryCard
          label="Denied actions"
          value={summary.deniedCount}
          testId="admin-audit-denied-events"
        />
        <SummaryCard
          label="Categories"
          value={Object.keys(summary.byCategory).length}
          testId="admin-audit-category-count"
        />
      </div>

      {loading && (
        <div
          className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-xl"
          data-testid="admin-audit-loading"
        >
          Loading application audit logs...
        </div>
      )}

      {loadError && (
        <div
          className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-xl"
          data-testid="admin-audit-error"
        >
          {loadError}
        </div>
      )}

      {!loading && !loadError && (
        <div
          className="space-y-4"
          data-testid="admin-audit-events"
        >
          {events.length === 0 ? (
            <div
              className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-xl"
              data-testid="admin-audit-empty-state"
            >
              No application audit events match the selected filters.
            </div>
          ) : (
            events.map((event) => (
              <article
                key={event.applicationAuditEventId}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
                data-testid="admin-audit-event-card"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                        {event.eventCategory}
                      </span>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-900">
                        {event.eventType}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {event.actionStatus}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-black text-slate-950">
                      {event.eventSummary}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      {event.actorRole || "Unknown role"} ·{" "}
                      {event.actorEmail || "Unknown actor"} ·{" "}
                      {formatDate(event.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p>
                      <strong>Target:</strong>{" "}
                      {event.targetEntityType || "Not set"}
                    </p>
                    <p>
                      <strong>Reference:</strong>{" "}
                      {event.targetEntityReference || "Not set"}
                    </p>
                    <p>
                      <strong>Route:</strong>{" "}
                      {event.requestMethod || "N/A"}{" "}
                      {event.requestPath || ""}
                    </p>
                  </div>
                </div>

                <details className="mt-4 rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
                  <summary className="cursor-pointer font-bold">
                    View event details
                  </summary>
                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs">
                    {formatDetails(event.details)}
                  </pre>
                </details>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function SummaryCard({ label, value, testId }) {
  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
      data-testid={testId}
    >
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

export default AdminAuditLogsPage;