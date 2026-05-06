import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialRide = {
  name: "",
  description: "",
  category: "Roller Coaster",
  thrillLevel: "Medium",
  minimumHeightCm: 120,
  minimumAgeYears: 8,
  requiresAdultSupervision: true,
  price: 25,
  pointsEarned: 50,
  imageUrl: "",
};

const initialAccommodation = {
  name: "",
  description: "",
  type: "Hotel",
  pricePerNight: 250,
  maxGuests: 4,
  minimumLeadGuestAgeYears: 18,
  isFamilyFriendly: true,
  imageUrl: "",
};

function formatDate(value) {
  if (!value) return "Not reviewed yet";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClass(status) {
  if (status === "Approved") return "bg-emerald-100 text-emerald-800";
  if (status === "Rejected") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
}

function AdminContentPage() {
  const { token } = useAuth();

  const [rideForm, setRideForm] = useState(initialRide);
  const [accommodationForm, setAccommodationForm] = useState(initialAccommodation);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState("");

  const loadSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const data = await api.getAdminSubmissions(token);
      setSubmissions(data);
    } catch {
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [token]);

  const updateRide = (event) => {
    const { name, value, type, checked } = event.target;
    setRideForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateAccommodation = (event) => {
    const { name, value, type, checked } = event.target;
    setAccommodationForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitRide = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting("ride");

    try {
      await api.submitAdminRide(token, rideForm);
      setMessage("Ride submitted for manager approval");
      setRideForm(initialRide);
      await loadSubmissions();
    } catch (err) {
      setError(err.message || "Failed to submit ride");
    } finally {
      setSubmitting("");
    }
  };

  const submitAccommodation = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting("accommodation");

    try {
      await api.submitAdminAccommodation(token, accommodationForm);
      setMessage("Accommodation submitted for manager approval");
      setAccommodationForm(initialAccommodation);
      await loadSubmissions();
    } catch (err) {
      setError(err.message || "Failed to submit accommodation");
    } finally {
      setSubmitting("");
    }
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="admin-content-page">
      <section className="rounded-[2rem] bg-gradient-to-br from-fuchsia-600 via-purple-600 to-cyan-500 p-8 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-yellow-100">
          Admin content
        </p>
        <h1 className="mt-3 text-5xl font-black">Submit Wonderland content</h1>
        <p className="mt-4 max-w-3xl text-lg text-white/85">
          Admin submissions start as pending approval and must be approved by a Manager before they appear publicly.
        </p>
      </section>

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-300/40 bg-emerald-400/15 p-4 font-bold text-emerald-100" data-testid="admin-content-success">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-300/40 bg-red-500/15 p-4 font-bold text-red-100" data-testid="admin-content-error">
          {error}
        </div>
      )}

      <section className="mt-8 grid gap-8 xl:grid-cols-2">
        <form className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" onSubmit={submitRide} data-testid="admin-ride-form">
          <h2 className="text-3xl font-black">Submit ride</h2>

          <Field label="Ride name" name="name" value={rideForm.name} onChange={updateRide} testId="admin-ride-name" />
          <TextArea label="Description" name="description" value={rideForm.description} onChange={updateRide} testId="admin-ride-description" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" name="category" value={rideForm.category} onChange={updateRide} testId="admin-ride-category" />
            <Field label="Thrill level" name="thrillLevel" value={rideForm.thrillLevel} onChange={updateRide} testId="admin-ride-thrill" />
            <Field label="Minimum height cm" name="minimumHeightCm" type="number" value={rideForm.minimumHeightCm} onChange={updateRide} testId="admin-ride-height" />
            <Field label="Minimum age years" name="minimumAgeYears" type="number" value={rideForm.minimumAgeYears} onChange={updateRide} testId="admin-ride-age" />
            <Field label="Price" name="price" type="number" value={rideForm.price} onChange={updateRide} testId="admin-ride-price" />
            <Field label="Points earned" name="pointsEarned" type="number" value={rideForm.pointsEarned} onChange={updateRide} testId="admin-ride-points" />
          </div>

          <label className="mt-4 flex items-center gap-2 font-bold">
            <input
              type="checkbox"
              name="requiresAdultSupervision"
              checked={rideForm.requiresAdultSupervision}
              onChange={updateRide}
              data-testid="admin-ride-supervision"
            />
            Requires adult supervision
          </label>

          <button
            type="submit"
            disabled={submitting === "ride"}
            className="mt-6 w-full rounded-2xl bg-purple-600 px-5 py-3 font-black text-white disabled:bg-slate-400"
            data-testid="admin-ride-submit"
          >
            {submitting === "ride" ? "Submitting..." : "Submit ride for approval"}
          </button>
        </form>

        <form className="rounded-[2rem] bg-white p-6 text-slate-950 shadow-2xl" onSubmit={submitAccommodation} data-testid="admin-accommodation-form">
          <h2 className="text-3xl font-black">Submit accommodation</h2>

          <Field label="Accommodation name" name="name" value={accommodationForm.name} onChange={updateAccommodation} testId="admin-accommodation-name" />
          <TextArea label="Description" name="description" value={accommodationForm.description} onChange={updateAccommodation} testId="admin-accommodation-description" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" name="type" value={accommodationForm.type} onChange={updateAccommodation} testId="admin-accommodation-type" />
            <Field label="Price per night" name="pricePerNight" type="number" value={accommodationForm.pricePerNight} onChange={updateAccommodation} testId="admin-accommodation-price" />
            <Field label="Max guests" name="maxGuests" type="number" value={accommodationForm.maxGuests} onChange={updateAccommodation} testId="admin-accommodation-guests" />
            <Field label="Lead guest minimum age" name="minimumLeadGuestAgeYears" type="number" value={accommodationForm.minimumLeadGuestAgeYears} onChange={updateAccommodation} testId="admin-accommodation-age" />
          </div>

          <label className="mt-4 flex items-center gap-2 font-bold">
            <input
              type="checkbox"
              name="isFamilyFriendly"
              checked={accommodationForm.isFamilyFriendly}
              onChange={updateAccommodation}
              data-testid="admin-accommodation-family"
            />
            Family friendly
          </label>

          <button
            type="submit"
            disabled={submitting === "accommodation"}
            className="mt-6 w-full rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950 disabled:bg-slate-300"
            data-testid="admin-accommodation-submit"
          >
            {submitting === "accommodation" ? "Submitting..." : "Submit accommodation for approval"}
          </button>
        </form>
      </section>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/10 p-6" data-testid="admin-submissions-section">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-[0.25em] text-cyan-300">My submissions</p>
            <h2 className="mt-3 text-3xl font-black">Submitted content status</h2>
          </div>
        </div>

        {submissionsLoading && (
          <p className="mt-6 text-white/70" data-testid="admin-submissions-loading">
            Loading submitted content...
          </p>
        )}

        {!submissionsLoading && submissions.length === 0 && (
          <div className="mt-6 rounded-2xl bg-white/10 p-6 text-white/70" data-testid="admin-submissions-empty">
            You have not submitted any content yet.
          </div>
        )}

        {!submissionsLoading && submissions.length > 0 && (
          <div className="mt-6 grid gap-4" data-testid="admin-submissions-list">
            {submissions.map((item) => (
              <article
                key={`${item.ItemType}-${item.ItemId}`}
                className="rounded-2xl bg-white p-5 text-slate-950"
                data-testid={`admin-submission-${item.ItemType}-${item.ItemId}`}
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
                    {item.RejectionReason && (
                      <p className="mt-2 text-sm font-bold text-red-700">
                        Rejection reason: {item.RejectionReason}
                      </p>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${statusClass(item.ApprovalStatus)}`}
                    data-testid={`admin-submission-status-${item.ItemType}-${item.ItemId}`}
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

function Field({ label, name, value, onChange, testId, type = "text" }) {
  return (
    <label className="mt-4 block text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
        data-testid={testId}
        required
      />
    </label>
  );
}

function TextArea({ label, name, value, onChange, testId }) {
  return (
    <label className="mt-4 block text-sm font-bold">
      {label}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
        data-testid={testId}
        required
      />
    </label>
  );
}

export default AdminContentPage;
