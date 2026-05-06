import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function statusClass(status) {
  if (status === "Approved") return "bg-emerald-100 text-emerald-800";
  if (status === "Rejected") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ManagerApprovalsPage() {
  const { token } = useAuth();

  const [approvals, setApprovals] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await api.getManagerApprovals(token);
      setApprovals(data);
    } catch (error) {
      setLoadError(error.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await api.getManagerApprovalHistory(token);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([loadApprovals(), loadHistory()]);
  };

  useEffect(() => {
    refreshAll();
  }, [token]);

  const approve = async (item) => {
    await api.approveManagerApproval(token, item.ItemType, item.ItemId);
    setMessage(`${item.Name} approved successfully`);
    await refreshAll();
  };

  const reject = async (item) => {
    await api.rejectManagerApproval(token, item.ItemType, item.ItemId, "Rejected during manager review");
    setMessage(`${item.Name} rejected successfully`);
    await refreshAll();
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="manager-approvals-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">
          Manager approvals
        </p>
        <h1 className="mt-3 text-5xl font-black">Pending content tasks</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Review Admin-submitted rides and accommodation before they become publicly visible.
        </p>
      </section>

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-300/40 bg-emerald-400/15 p-4 font-bold text-emerald-100" data-testid="manager-approval-message">
          {message}
        </div>
      )}

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-300">Pending</p>
        <h2 className="mt-3 text-3xl font-black">Waiting for review</h2>

        {loading && (
          <div className="mt-6 rounded-[2rem] bg-white/10 p-6 text-white/70" data-testid="manager-approvals-loading">
            Loading pending approvals...
          </div>
        )}

        {loadError && (
          <div className="mt-6 rounded-[2rem] border border-red-300/40 bg-red-500/15 p-6 text-red-100" data-testid="manager-approvals-error">
            {loadError}
          </div>
        )}

        {!loading && !loadError && approvals.length === 0 && (
          <section className="mt-6 rounded-[2rem] bg-white/10 p-8 text-center" data-testid="manager-approvals-empty">
            <p className="text-5xl">✅</p>
            <h3 className="mt-4 text-3xl font-black">No pending approvals</h3>
            <p className="mt-2 text-white/70">You are all caught up.</p>
          </section>
        )}

        {!loading && !loadError && approvals.length > 0 && (
          <section className="mt-6 grid gap-6" data-testid="manager-approvals-list">
            {approvals.map((item) => (
              <article
                key={`${item.ItemType}-${item.ItemId}`}
                className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl"
                data-testid={`approval-card-${item.ItemType}-${item.ItemId}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600">
                      {item.ItemType}
                    </p>
                    <h3 className="mt-2 text-3xl font-black">{item.Name}</h3>
                    <p className="mt-3 text-slate-600">{item.Description}</p>
                    <p className="mt-3 text-sm font-bold text-slate-500">
                      Type: {item.CategoryOrType} • Price: ${Number(item.Price).toFixed(2)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted by: {item.SubmittedByEmail || "Unknown"}
                    </p>
                  </div>

                  <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-yellow-800">
                    {item.ApprovalStatus}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => approve(item)}
                    className="rounded-full bg-emerald-400 px-6 py-3 font-black text-slate-950"
                    data-testid={`approve-${item.ItemType}-${item.ItemId}`}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => reject(item)}
                    className="rounded-full bg-red-400 px-6 py-3 font-black text-slate-950"
                    data-testid={`reject-${item.ItemType}-${item.ItemId}`}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6" data-testid="manager-approval-history-section">
        <p className="font-bold uppercase tracking-[0.25em] text-cyan-300">Reviewed history</p>
        <h2 className="mt-3 text-3xl font-black">Approved and rejected content</h2>

        {historyLoading && (
          <p className="mt-6 text-white/70" data-testid="manager-approval-history-loading">
            Loading reviewed history...
          </p>
        )}

        {!historyLoading && history.length === 0 && (
          <div className="mt-6 rounded-2xl bg-white/10 p-6 text-white/70" data-testid="manager-approval-history-empty">
            You have not reviewed any content yet.
          </div>
        )}

        {!historyLoading && history.length > 0 && (
          <div className="mt-6 grid gap-4" data-testid="manager-approval-history-list">
            {history.map((item) => (
              <article
                key={`${item.ItemType}-${item.ItemId}`}
                className="rounded-2xl bg-white p-5 text-slate-950"
                data-testid={`manager-history-${item.ItemType}-${item.ItemId}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">
                      {item.ItemType}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{item.Name}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted: {formatDate(item.SubmittedAt)} • Reviewed: {formatDate(item.ReviewedAt)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted by: {item.SubmittedByEmail || "Unknown"}
                    </p>
                    {item.RejectionReason && (
                      <p className="mt-2 text-sm font-bold text-red-700">
                        Rejection reason: {item.RejectionReason}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${statusClass(item.ApprovalStatus)}`}
                    data-testid={`manager-history-status-${item.ItemType}-${item.ItemId}`}
                  >
                    {item.ApprovalStatus}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ManagerApprovalsPage;
