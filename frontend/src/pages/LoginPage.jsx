import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromPath = location.state?.from?.pathname || "/dashboard";

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
      await login(formData);
      navigate(fromPath, { replace: true });
    } catch (error) {
      setFormError(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="mx-auto grid min-h-[70vh] max-w-7xl place-items-center px-6 py-14 lg:px-10"
      data-testid="login-page"
    >
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-purple-600">Welcome back</p>
        <h1 className="mt-3 text-4xl font-black">Login</h1>
        <p className="mt-3 text-slate-600">
          Sign in to view your Wonderland dashboard and future bookings.
        </p>

        {formError && (
          <div
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            data-testid="login-error"
          >
            {formError}
          </div>
        )}

        <form className="mt-6 space-y-4" data-testid="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-bold" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
              placeholder="alex@wonderland.local"
              data-testid="login-email-input"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
              placeholder="Password123!"
              data-testid="login-password-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-purple-600 px-5 py-3 font-black text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            data-testid="login-submit-button"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          New to Wonderland?{" "}
          <Link to="/register" className="font-black text-purple-700" data-testid="login-register-link">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
