import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const accountTypeHelp = {
  Guest: "Anyone can register as a guest using their own email address.",
  Admin: "Admin registration requires a pre-approved active employee email and matching date of birth.",
  Manager: "Manager registration requires a pre-approved active employee email and matching date of birth.",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    accountType: "Guest",
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFormError(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="mx-auto grid min-h-[70vh] max-w-7xl place-items-center px-6 py-14 lg:px-10"
      data-testid="register-page"
    >
      <section className="w-full max-w-2xl rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-cyan-600">Join Wonderland</p>
        <h1 className="mt-3 text-4xl font-black">Create account</h1>
        <p className="mt-3 text-slate-600">
          Register to start earning WonderPoints and manage your future bookings.
        </p>

        {formError && (
          <div
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            data-testid="register-error"
          >
            {formError}
          </div>
        )}

        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          data-testid="register-form"
          onSubmit={handleSubmit}
        >
          <fieldset className="sm:col-span-2 rounded-2xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-black">Account type</legend>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Guest", "Admin", "Manager"].map((accountType) => (
                <label
                  key={accountType}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 font-bold"
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={accountType}
                    checked={formData.accountType === accountType}
                    onChange={handleChange}
                    data-testid={`register-account-type-${accountType.toLowerCase()}`}
                  />
                  {accountType}
                </label>
              ))}
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600" data-testid="register-account-type-help">
              {accountTypeHelp[formData.accountType]}
            </p>
          </fieldset>

          <div>
            <label className="text-sm font-bold" htmlFor="register-first-name">First name</label>
            <input
              id="register-first-name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Alex"
              data-testid="register-first-name-input"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="register-last-name">Last name</label>
            <input
              id="register-last-name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Wonder"
              data-testid="register-last-name-input"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-bold" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="alex@wonderland.local"
              data-testid="register-email-input"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-bold" htmlFor="register-date-of-birth">
              Date of birth
            </label>
            <input
              id="register-date-of-birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              data-testid="register-date-of-birth-input"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-bold" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Password123!"
              data-testid="register-password-input"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="sm:col-span-2 rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-300"
            data-testid="register-submit-button"
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-black text-cyan-700" data-testid="register-login-link">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
