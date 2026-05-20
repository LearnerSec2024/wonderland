import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EMPTY_FILTERS = {
  startDate: "",
  endDate: "",
  severity: "",
  eventCategory: "",
  actorRole: "",
  actionStatus: "",
  search: "",
};

const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const EVENT_CATEGORIES = [
  "Authentication",
  "Authorization",
  "DataExport",
  "Monitoring",
  "Test",
];
const ACTOR_ROLES = ["Admin", "Manager", "User"];
const ACTION_STATUSES = ["Observed", "Succeeded", "Failed", "Denied"];

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

function formatDetails(detailsJson) {
  if (!detailsJson) {
    return "No additional details";
  }

  try {
    return JSON.stringify(JSON.parse(detailsJson), null, 2);
  } catch {
    return detailsJson;
  }
}

function buildActiveFilterText(filters) {
  const active = [];

  if (filters.startDate) active.push(`From ${filters.startDate}`);
  if (filters.endDate) active.push(`To ${filters.endDate}`);
  if (filters.severity) active.push(`Severity ${filters.severity}`);
  if (filters.eventCategory) active.push(`Category ${filters.eventCategory}`);
  if (filters.actorRole) active.push(`Role ${filters.actorRole}`);
  if (filters.actionStatus) active.push(`Status ${filters.actionStatus}`);
  if (filters.search) active.push(`Search "${filters.search}"`);

  return active.length ? active.join(" · ") : "No filters applied";
}

function severityClass(severity) {
  switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-800 ring-red-200";
    case "High":
      return "bg-orange-100 text-orange-800 ring-orange-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 ring-yellow-200";
    default:
      return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  }
}

function AdminSecurityEventsPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [severityBreakdown, setSeverityBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadSecurityEvents = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const result = await api.getAdminSecurityEvents(token, appliedFilters);

        if (isActive) {
          setEvents(result.events || []);
          setSummary(result.summary || null);
          setCategoryBreakdown(result.categoryBreakdown || []);
          setSeverityBreakdown(result.severityBreakdown || []);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message || "Failed to load security events");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadSecurityEvents();

    return () => {
      isActive = false;
    };
  }, [
    token,
    appliedFilters.startDate,
    appliedFilters.endDate,
    appliedFilters.severity,
    appliedFilters.eventCategory,
    appliedFilters.actorRole,
    appliedFilters.actionStatus,
    appliedFilters.search,
  ]);

  const localSummary = useMemo(() => {
    const highRiskCount = events.filter(
      (event) => event.severity === "High" || event.severity === "Critical"
    ).length;

    return {
      totalEvents: summary?.totalEvents ?? events.length,
      criticalEvents: summary?.criticalEvents ?? 0,
      highEvents: summary?.highEvents ?? 0,
      mediumEvents: summary?.mediumEvents ?? 0,
      lowEvents: summary?.lowEvents ?? 0,
      deniedEvents: summary?.deniedEvents ?? 0,
      failedEvents: summary?.failedEvents ?? 0,
      highRiskCount,
    };
  }, [events, summary]);

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
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10"
      data-testid="admin-security-events-page"
    >
      <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-300">
          Iteration 14
        </p>
        <h1 className="mt-3 text-4xl font-extrabold">
          Security events monitor
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-200">
          Review security-relevant activity such as failed logins, denied
          access, report exports and monitoring access. This is Wonderland's
          local SIEM-style learning dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Total events"
          value={localSummary.totalEvents}
          testId="security-summary-total"
        />
        <SummaryCard
          label="High / critical"
          value={localSummary.criticalEvents + localSummary.highEvents}
          testId="security-summary-high-risk"
        />
        <SummaryCard
          label="Denied"
          value={localSummary.deniedEvents}
          testId="security-summary-denied"
        />
        <SummaryCard
          label="Failed"
          value={localSummary.failedEvents}
          testId="security-summary-failed"
        />
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
        data-testid="security-events-filters"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              Security filters
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Active filters: {buildActiveFilterText(appliedFilters)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800"
              data-testid="apply-security-filters"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              data-testid="reset-security-filters"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Start date
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-300 px-3 py-2"
              data-testid="security-start-date-filter"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            End date
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-300 px-3 py-2"
              data-testid="security-end-date-filter"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Severity
            <select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-300 px-3 py-2"
              data-testid="security-severity-filter"
            >
              <option value="">All severities</option>
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Event category
            <select
              name="eventCategory"
              value={filters.eventCategory}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-300 px-3 py-2"
              data-testid="security-category-filter"
            >
              <option value="">All categories</option>
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Actor role
            <select
              name="actorRole"
              value={filters.actorRole}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-300 px-3 py-2"
              data-testid="security-actor-role-filter"
            >
              <option value="">All roles</option>
              {ACTOR_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Action status
            <select
              name="actionStatus"
              value={filters.actionStatus}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-300 px-3 py-2"
              data-testid="security-action-status-filter"
            >
              <option value="">All statuses</option>
              {ACTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Search
          <input
            type="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search event type, actor email, summary or route"
            className="rounded-xl border border-slate-300 px-3 py-2"
            data-testid="security-search-filter"
          />
        </label>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownPanel
          title="Events by severity"
          items={severityBreakdown.map((item) => ({
            label: item.severity,
            value: item.eventCount,
          }))}
          emptyText="No severity breakdown yet."
          testId="security-severity-breakdown"
        />

        <BreakdownPanel
          title="Events by category"
          items={categoryBreakdown.map((item) => ({
            label: item.eventCategory,
            value: item.eventCount,
          }))}
          emptyText="No category breakdown yet."
          testId="security-category-breakdown"
        />
      </div>

      <div
        className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
        data-testid="security-events-list"
      >
        <h2 className="text-xl font-extrabold text-slate-950">
          Recent security events
        </h2>

        {loading && (
          <p className="mt-4 text-slate-600" data-testid="security-events-loading">
            Loading security events...
          </p>
        )}

        {loadError && (
          <p
            className="mt-4 rounded-2xl bg-red-50 p-4 font-semibold text-red-700"
            data-testid="security-events-error"
          >
            {loadError}
          </p>
        )}

        {!loading && !loadError && events.length === 0 && (
          <p
            className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-600"
            data-testid="security-events-empty"
          >
            No security events match the selected filters.
          </p>
        )}

        {!loading && !loadError && events.length > 0 && (
          <div className="mt-5 space-y-4">
            {events.map((event) => (
              <article
                key={event.securityEventId}
                className="rounded-2xl border border-slate-200 p-5"
                data-testid="security-event-card"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${severityClass(event.severity)}`}
                        data-testid="security-event-severity"
                      >
                        {event.severity}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {event.eventCategory}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {event.actionStatus}
                      </span>
                    </div>

                    <h3
                      className="mt-3 text-lg font-extrabold text-slate-950"
                      data-testid="security-event-summary"
                    >
                      {event.eventSummary}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {event.eventType} · {formatDate(event.createdAt)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-600">
                    {event.actorRole || "Unknown role"} ·{" "}
                    {event.actorEmail || "Unknown actor"}
                  </p>
                </div>

                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-bold text-slate-500">Route</dt>
                    <dd className="text-slate-800">
                      {event.requestMethod || "N/A"} {event.requestPath || ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">IP address</dt>
                    <dd className="text-slate-800">
                      {event.ipAddress || "Not captured"}
                    </dd>
                  </div>
                </dl>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-bold text-slate-700">
                    View event details
                  </summary>
                  <pre className="mt-3 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
                    {formatDetails(event.detailsJson)}
                  </pre>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, testId }) {
  return (
    <div
      className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
      data-testid={testId}
    >
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function BreakdownPanel({ title, items, emptyText, testId }) {
  return (
    <div
      className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200"
      data-testid={testId}
    >
      <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">{emptyText}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
            >
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className="font-extrabold text-slate-950">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminSecurityEventsPage;
