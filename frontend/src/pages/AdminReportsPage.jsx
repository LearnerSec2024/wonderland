import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function getLocalDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

function AdminReportsPage() {
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadReport = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const result = await api.getAdminBookingReport(token, appliedFilters);

        if (isActive) {
          setReport(result);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error.message || "Failed to load admin reports");
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

  const handleDownloadCsv = async () => {
    try {
      setExporting(true);
      setExportError("");

      const blob = await api.downloadAdminBookingReportCsv(token, appliedFilters);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileDate = getLocalDateStamp();

      link.href = downloadUrl;
      link.download = `wonderland-booking-report-${fileDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch (error) {
      setExportError(error.message || "Failed to download CSV report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main data-testid="admin-reports-page" className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
        Admin reports
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Booking reporting dashboard
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Review booking metrics, CDC booking change events and trigger-based content audit events.
      </p>

      <section
        data-testid="admin-report-filters"
        className="mt-8 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Report filters</h2>
            <p className="text-sm text-slate-600">
              Filter by booking visit date/status, then export the same filtered view to CSV.
            </p>
          </div>
          <p data-testid="admin-report-active-filters" className="text-sm text-slate-500">
            Active filters: {appliedFilters.startDate || "Any start date"} to{" "}
            {appliedFilters.endDate || "Any end date"} Â· {appliedFilters.status || "All statuses"}
          </p>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto_auto]"
        >
          <label className="text-sm font-medium text-slate-700">
            Start date
            <input
              data-testid="admin-report-start-date"
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
              data-testid="admin-report-end-date"
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
              data-testid="admin-report-status-filter"
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
            data-testid="admin-report-apply-filters"
            className="rounded-lg bg-purple-700 px-4 py-2 font-semibold text-white hover:bg-purple-800 md:self-end"
            type="submit"
          >
            Apply
          </button>

          <button
            data-testid="admin-report-reset-filters"
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 md:self-end"
            type="button"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </form>
      </section>

      {loading && (
        <p className="mt-8 rounded-xl bg-purple-50 p-4 text-purple-800">
          Loading admin reports...
        </p>
      )}

      {loadError && (
        <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">{loadError}</p>
      )}

      {!loading && !loadError && report && (
        <>
          <section
            data-testid="admin-report-summary"
            className="mt-8 grid gap-4 md:grid-cols-4"
          >
            <SummaryCard
              label="Total bookings"
              value={report.summary.totalBookings}
              testId="admin-report-total-bookings"
            />
            <SummaryCard
              label="Confirmed"
              value={report.summary.confirmedBookings}
              testId="admin-report-confirmed-bookings"
            />
            <SummaryCard
              label="Cancelled"
              value={report.summary.cancelledBookings}
              testId="admin-report-cancelled-bookings"
            />
            <SummaryCard
              label="Booked value"
              value={formatMoney(report.summary.totalBookedValue)}
              testId="admin-report-total-value"
            />
            <SummaryCard
              label="Confirmed value"
              value={formatMoney(report.summary.confirmedValue)}
              testId="admin-report-confirmed-value"
            />
            <SummaryCard
              label="Cancelled value"
              value={formatMoney(report.summary.cancelledValue)}
              testId="admin-report-cancelled-value"
            />
            <SummaryCard
              label="Points issued"
              value={report.summary.totalPointsIssued}
              testId="admin-report-total-points"
            />
            <SummaryCard
              label="Average booking"
              value={formatMoney(report.summary.averageBookingValue)}
              testId="admin-report-average-value"
            />
          </section>

          <ReportPanel title="CDC status for dbo.Bookings" testId="admin-report-cdc-status">
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

          <ReportPanel title="Status breakdown" testId="admin-report-status-breakdown">
            {report.statusBreakdown.length === 0 ? (
              <p className="text-sm text-slate-600">No bookings match the selected filters.</p>
            ) : (
              report.statusBreakdown.map((item) => (
                <ReportRow
                  key={item.status}
                  label={item.status}
                  value={`${item.bookingCount} bookings Â· ${formatMoney(item.totalAmount)}`}
                />
              ))
            )}
          </ReportPanel>

          <ReportPanel title="Item type breakdown" testId="admin-report-item-type-breakdown">
            {report.itemTypeBreakdown.length === 0 ? (
              <p className="text-sm text-slate-600">No booking items match the selected filters.</p>
            ) : (
              report.itemTypeBreakdown.map((item) => (
                <ReportRow
                  key={item.itemType}
                  label={item.itemType}
                  value={`${item.itemCount} items Â· ${formatMoney(item.totalAmount)} Â· ${
                    item.pointsEarned
                  } points`}
                />
              ))
            )}
          </ReportPanel>

          <ReportPanel title="Recent daily activity" testId="admin-report-daily-activity">
            {report.dailyActivity.length === 0 ? (
              <p className="text-sm text-slate-600">No daily activity for the selected filters.</p>
            ) : (
              report.dailyActivity.map((day) => (
                <ReportRow
                  key={day.activityDate}
                  label={day.activityDate}
                  value={`${day.bookingCount} bookings Â· ${formatMoney(day.totalAmount)}`}
                />
              ))
            )}
          </ReportPanel>

          <ReportPanel title="CSV export" testId="admin-report-export-prep">
            <p className="text-sm text-slate-600">
              Download a CSV copy of the Admin booking report using the active filters above.
            </p>
            <button
              data-testid="admin-report-download-csv"
              className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={exporting}
              onClick={handleDownloadCsv}
            >
              {exporting ? "Preparing CSV..." : "Download CSV"}
            </button>
            {exportError && (
              <p data-testid="admin-report-export-error" className="mt-3 text-sm text-red-700">
                {exportError}
              </p>
            )}
          </ReportPanel>

          <CdcPanel events={report.recentBookingChangeEvents} testId="admin-report-booking-cdc-events" />
          <ContentAuditPanel events={report.contentAuditEvents} testId="admin-report-content-audit-events" />
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

function CdcPanel({ events, testId }) {
  return (
    <section
      data-testid={testId}
      className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5"
    >
      <h2 className="text-xl font-semibold text-slate-900">CDC booking change events</h2>
      <p className="mt-1 text-sm text-slate-600">
        CDC events show recent database-level booking inserts/updates and are not filtered by the report controls.
      </p>

      <div className="mt-4 space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-slate-600">
            CDC is enabled. No booking change rows have been captured yet.
          </p>
        ) : (
          events.map((event, index) => (
            <article key={`${event.bookingReference}-${index}`} className="rounded-xl bg-white p-4">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                {event.operation}
              </span>
              <h3 className="mt-2 font-semibold text-slate-900">{event.bookingReference}</h3>
              <p className="text-sm text-slate-600">{event.eventSummary}</p>
              <p className="mt-1 text-xs text-slate-500">
                {event.customerEmail || "Customer pending"} Â· {formatDate(event.changeTime)}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ContentAuditPanel({ events, testId }) {
  return (
    <section
      data-testid={testId}
      className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 p-5"
    >
      <h2 className="text-xl font-semibold text-slate-900">Trigger-based content audit events</h2>

      <div className="mt-4 space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-slate-600">No content approval trigger events yet.</p>
        ) : (
          events.map((event) => (
            <article key={event.contentAuditEventId} className="rounded-xl bg-white p-4">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {event.eventType}
              </span>
              <h3 className="mt-2 font-semibold text-slate-900">{event.entityName}</h3>
              <p className="text-sm text-slate-600">{event.eventSummary}</p>
              <p className="mt-1 text-xs text-slate-500">
                {event.entityType} Â· {formatDate(event.createdAt)}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminReportsPage;
