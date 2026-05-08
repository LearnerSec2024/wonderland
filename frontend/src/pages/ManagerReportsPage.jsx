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

function ManagerReportsPage() {
  const { token } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const result = await api.getManagerBookingReport(token);
        setReport(result);
      } catch (error) {
        setLoadError(error.message || "Failed to load manager reports");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [token]);

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="manager-reports-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">Manager reports</p>
        <h1 className="mt-3 text-5xl font-black">Operational booking summary</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Monitor confirmed/cancelled booking activity and CDC booking change events.
        </p>
      </section>

      {loading && (
        <section className="mt-8 rounded-[2rem] bg-white/10 p-8 text-white/70" data-testid="manager-reports-loading">
          Loading manager reports...
        </section>
      )}

      {loadError && (
        <section className="mt-8 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-8 text-red-100" data-testid="manager-reports-error">
          {loadError}
        </section>
      )}

      {!loading && !loadError && report && (
        <>
          <section className="mt-8 grid gap-6 md:grid-cols-5" data-testid="manager-report-summary">
            <SummaryCard label="Total" value={report.summary.totalBookings} testId="manager-report-total-bookings" />
            <SummaryCard label="Confirmed" value={report.summary.confirmedBookings} testId="manager-report-confirmed-bookings" />
            <SummaryCard label="Cancelled" value={report.summary.cancelledBookings} testId="manager-report-cancelled-bookings" />
            <SummaryCard label="Confirmed value" value={`$${report.summary.confirmedValue.toFixed(2)}`} testId="manager-report-confirmed-value" />
            <SummaryCard label="Points issued" value={`+${report.summary.totalPointsIssued}`} testId="manager-report-points" />
          </section>

          <section className="mt-8 rounded-[2rem] border border-cyan-300/40 bg-cyan-400/10 p-6" data-testid="manager-report-cdc-status">
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

          <section className="mt-8 rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid="manager-report-status-breakdown">
            <h2 className="text-3xl font-black">Status breakdown</h2>

            <div className="mt-5 grid gap-3">
              {report.statusBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-4"
                >
                  <span className="font-black">{item.status}</span>
                  <span className="font-bold text-slate-600">
                    {item.bookingCount} bookings • ${item.totalAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" data-testid="manager-report-booking-cdc-events">
            <h2 className="text-3xl font-black">CDC booking change events</h2>

            <div className="mt-5 grid gap-4">
              {report.recentBookingChangeEvents.length === 0 ? (
                <p className="rounded-2xl bg-slate-100 p-4 font-semibold text-slate-600">
                  CDC is enabled. No booking change rows have been captured yet.
                </p>
              ) : (
                report.recentBookingChangeEvents.map((event, index) => (
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

export default ManagerReportsPage;
