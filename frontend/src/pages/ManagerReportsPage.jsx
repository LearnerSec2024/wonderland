import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const EMPTY_FILTERS = {
  startDate: "",
  endDate: "",
  status: "",
};

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

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function ManagerReportsPage() {
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadReport = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const result = await api.getManagerBookingReport(token, appliedFilters);

        if (isActive) {
          setReport(result);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message || "Failed to load manager reports");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      isActive = false;
    };
  }, [token, appliedFilters.startDate, appliedFilters.endDate, appliedFilters.status]);

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
    <main data-testid="manager-reports-page" className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
        Manager reports
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Operational booking summary
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Monitor confirmed/cancelled booking activity and CDC booking change events.
      </p>

      <section
        data-testid="manager-report-filters"
        className="mt-8 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Report filters</h2>
            <p className="text-sm text-slate-600">
              Filter the operational booking summary by visit date and booking status.
            </p>
          </div>
          <p data-testid="manager-report-active-filters" className="text-sm text-slate-500">
            Active filters: {appliedFilters.startDate || "Any start date"} to{" "}
            {appliedFilters.endDate || "Any end date"} · {appliedFilters.status || "All statuses"}
          </p>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto_auto]"
        >
          <label className="text-sm font-medium text-slate-700">
            Start date
            <input
              data-testid="manager-report-start-date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            End date
            <input
              data-testid="manager-report-end-date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Status
            <select
              data-testid="manager-report-status-filter"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <button
            data-testid="manager-report-apply-filters"
            className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 md:self-end"
            type="submit"
          >
            Apply
          </button>

          <button
            data-testid="manager-report-reset-filters"
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 md:self-end"
            type="button"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </form>
      </section>

      {loading && (
        <p className="mt-8 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          Loading manager reports...
        </p>
      )}

      {loadError && (
        <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{loadError}</p>
      )}

      {!loading && !loadError && report && (
        <>
          <section
            data-testid="manager-report-summary"
            className="mt-8 grid gap-4 md:grid-cols-3"
          >
            <SummaryCard
              label="Total bookings"
              value={report.summary.totalBookings}
              testId="manager-report-total-bookings"
            />
            <SummaryCard
              label="Confirmed"
              value={report.summary.confirmedBookings}
              testId="manager-report-confirmed-bookings"
            />
            <SummaryCard
              label="Cancelled"
              value={report.summary.cancelledBookings}
              testId="manager-report-cancelled-bookings"
            />
            <SummaryCard
              label="Confirmed value"
              value={formatMoney(report.summary.confirmedValue)}
              testId="manager-report-confirmed-value"
            />
            <SummaryCard
              label="Cancelled value"
              value={formatMoney(report.summary.cancelledValue)}
              testId="manager-report-cancelled-value"
            />
            <SummaryCard
              label="Points issued"
              value={report.summary.totalPointsIssued}
              testId="manager-report-total-points"
            />
          </section>

          <ReportPanel title="CDC status for dbo.Bookings" testId="manager-report-cdc-status">
            <ReportRow
              label="Database CDC enabled"
              value={report.cdcStatus.isDatabaseCdcEnabled ? "Yes" : "No"}
            />
            <ReportRow
              label="Bookings table CDC enabled"
              value={report.cdcStatus.isBookingsCdcEnabled ? "Yes" : "No"}
            />
            <ReportRow label="Capture instance" value={report.cdcStatus.captureInstance} />
          </ReportPanel>

          <ReportPanel title="Status breakdown" testId="manager-report-status-breakdown">
            {report.statusBreakdown.length === 0 ? (
              <p className="text-sm text-slate-600">No bookings match the selected filters.</p>
            ) : (
              report.statusBreakdown.map((item) => (
                <ReportRow
                  key={item.status}
                  label={item.status}
                  value={`${item.bookingCount} bookings · ${formatMoney(item.totalAmount)}`}
                />
              ))
            )}
          </ReportPanel>

          <section
            data-testid="manager-report-booking-cdc-events"
            className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5"
          >
            <h2 className="text-xl font-semibold text-slate-900">CDC booking change events</h2>
            <p className="mt-1 text-sm text-slate-600">
              CDC events show recent database-level booking inserts/updates and are not filtered by the report controls.
            </p>

            <div className="mt-4 space-y-3">
              {report.recentBookingChangeEvents.length === 0 ? (
                <p className="text-sm text-slate-600">
                  CDC is enabled. No booking change rows have been captured yet.
                </p>
              ) : (
                report.recentBookingChangeEvents.map((event, index) => (
                  <article key={`${event.bookingReference}-${index}`} className="rounded-xl bg-white p-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      {event.operation}
                    </span>
                    <h3 className="mt-2 font-semibold text-slate-900">{event.bookingReference}</h3>
                    <p className="text-sm text-slate-600">{event.eventSummary}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {event.customerEmail || "Customer pending"} · {formatDate(event.changeTime)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function SummaryCard({ label, value, testId }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p data-testid={testId} className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}

function ReportPanel({ title, testId, children }) {
  return (
    <section
      data-testid={testId}
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function ReportRow({ label, value }) {
  return (
    <div className="flex flex-col justify-between gap-1 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row">
      <span className="font-medium text-slate-800">{label}</span>
      <span className="text-slate-600">{value}</span>
    </div>
  );
}

export default ManagerReportsPage;
