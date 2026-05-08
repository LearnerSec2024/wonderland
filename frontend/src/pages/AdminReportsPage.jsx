import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

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

function AdminReportsPage() {
  const { token } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const result = await api.getAdminBookingReport(token);
        setReport(result);
      } catch (error) {
        setLoadError(error.message || "Failed to load admin reports");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [token]);

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="admin-reports-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">Admin reports</p>
        <h1 className="mt-3 text-5xl font-black">Booking reporting dashboard</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Review booking metrics, CDC booking change events and trigger-based content audit events.
        </p>
      </section>

      {loading && (
        <section className="mt-8 rounded-[2rem] bg-white/10 p-8 text-white/70" data-testid="admin-reports-loading">
          Loading admin reports...
        </section>
      )}

      {loadError && (
        <section className="mt-8 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100" data-testid="admin-reports-error">
          {loadError}
        </section>
      )}

      {!loading && !loadError && report && (
        <>
          <section className="mt-8 grid gap-6 md:grid-cols-4" data-testid="admin-report-summary">
            <SummaryCard label="Total bookings" value={report.summary.totalBookings} testId="admin-report-total-bookings" />
            <SummaryCard label="Confirmed value" value={`$${report.summary.confirmedValue.toFixed(2)}`} testId="admin-report-confirmed-value" />
            <SummaryCard label="Cancelled value" value={`$${report.summary.cancelledValue.toFixed(2)}`} testId="admin-report-cancelled-value" />
            <SummaryCard label="Average booking" value={`$${report.summary.averageBookingValue.toFixed(2)}`} testId="admin-report-average-booking" />
          </section>

          <section className="mt-8 rounded-[2rem] border border-cyan-300/40 bg-cyan-400/10 p-6" data-testid="admin-report-cdc-status">
            <h2 className="text-3xl font-black">CDC status for dbo.Bookings</h2>
            <p className="mt-3 font-semibold text-white/75">
              Database CDC enabled: {report.cdcStatus.isDatabaseCdcEnabled ? "Yes" : "No"}
            </p>
            <p className="mt-1 font-semibold text-white/75">
              Bookings table CDC enabled: {report.cdcStatus.isBookingsCdcEnabled ? "Yes" : "No"}
            </p>
            <p className="mt-1 font-semibold text-white/75">
              Capture instance: {report.cdcStatus.captureInstance}
            </p>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <ReportPanel title="Status breakdown" testId="admin-report-status-breakdown">
              {report.statusBreakdown.map((item) => (
                <ReportRow
                  key={item.status}
                  label={item.status}
                  value={`${item.bookingCount} bookings • $${item.totalAmount.toFixed(2)}`}
                />
              ))}
            </ReportPanel>

            <ReportPanel title="Item type breakdown" testId="admin-report-item-type-breakdown">
              {report.itemTypeBreakdown.map((item) => (
                <ReportRow
                  key={item.itemType}
                  label={item.itemType}
                  value={`${item.itemCount} items • $${item.totalAmount.toFixed(2)} • +${item.pointsEarned} pts`}
                />
              ))}
            </ReportPanel>
          </section>

          <section className="mt-8 rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid="admin-report-daily-activity">
            <h2 className="text-3xl font-black">Recent daily activity</h2>

            <div className="mt-5 grid gap-3">
              {report.dailyActivity.map((day) => (
                <ReportRow
                  key={day.activityDate}
                  label={day.activityDate}
                  value={`${day.bookingCount} bookings • $${day.totalAmount.toFixed(2)}`}
                />
              ))}
            </div>
          </section>

          <CdcPanel events={report.recentBookingChangeEvents} testId="admin-report-booking-cdc-events" />
          <ContentAuditPanel events={report.contentAuditEvents} testId="admin-report-content-audit-events" />

          <section className="mt-8 rounded-[2rem] border border-yellow-200 bg-yellow-50 p-6 text-yellow-950" data-testid="admin-report-export-prep">
            <h2 className="text-3xl font-black">Export preparation</h2>
            <p className="mt-3 font-semibold">
              Export to CSV/PDF is prepared as a future reporting enhancement.
            </p>
            <button
              type="button"
              disabled
              className="mt-5 rounded-2xl bg-yellow-200 px-6 py-3 font-black text-yellow-950"
              data-testid="admin-report-export-disabled"
            >
              Export report coming soon
            </button>
          </section>
        </>
      )}
    </main>
  );
}

function SummaryCard({ label, value, testId }) {
  return (
    <article className="rounded-[2rem] bg-white/10 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-black" data-testid={testId}>
        {value}
      </p>
    </article>
  );
}

function ReportPanel({ title, testId, children }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid={testId}>
      <h2 className="text-3xl font-black">{title}</h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function ReportRow({ label, value }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-4">
      <span className="font-black capitalize">{label}</span>
      <span className="font-bold text-slate-600">{value}</span>
    </div>
  );
}

function CdcPanel({ events, testId }) {
  return (
    <section className="mt-8 rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid={testId}>
      <h2 className="text-3xl font-black">CDC booking change events</h2>

      <div className="mt-5 grid gap-4">
        {events.length === 0 ? (
          <p className="rounded-2xl bg-slate-100 p-4 font-semibold text-slate-600">
            CDC is enabled. No booking change rows have been captured yet.
          </p>
        ) : (
          events.map((event, index) => (
            <article
              key={`${event.bookingReference}-${event.operation}-${event.changeTime}-${index}`}
              className="rounded-2xl bg-slate-100 p-4"
            >
              <p className="text-xs font-black uppercase tracking-wide text-purple-600">
                {event.operation}
              </p>
              <h3 className="mt-1 break-all text-xl font-black">{event.bookingReference}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-600">{event.eventSummary}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">
                {event.customerEmail || "Customer pending"} • {formatDate(event.changeTime)}
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
    <section className="mt-8 rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid={testId}>
      <h2 className="text-3xl font-black">Trigger-based content audit events</h2>

      <div className="mt-5 grid gap-4">
        {events.length === 0 ? (
          <p className="rounded-2xl bg-slate-100 p-4 font-semibold text-slate-600">
            No content approval trigger events yet.
          </p>
        ) : (
          events.map((event) => (
            <article
              key={event.contentAuditEventId}
              className="rounded-2xl bg-slate-100 p-4"
            >
              <p className="text-xs font-black uppercase tracking-wide text-purple-600">
                {event.eventType}
              </p>
              <h3 className="mt-1 text-xl font-black">{event.entityName}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-600">{event.eventSummary}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">
                {event.entityType} • {formatDate(event.createdAt)}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AdminReportsPage;
