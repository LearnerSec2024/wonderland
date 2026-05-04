function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-7xl place-items-center px-6 py-14 lg:px-10" data-testid="login-page">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-purple-600">Welcome back</p>
        <h1 className="mt-3 text-4xl font-black">Login</h1>
        <p className="mt-3 text-slate-600">
          In Iteration 2, this form will connect to the backend JWT login API.
        </p>

        <form className="mt-6 space-y-4" data-testid="login-form">
          <div>
            <label className="text-sm font-bold" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
              placeholder="alex@wonderland.local"
              data-testid="login-email-input"
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"
              placeholder="Password123!"
              data-testid="login-password-input"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-2xl bg-purple-600 px-5 py-3 font-black text-white transition hover:bg-purple-700"
            data-testid="login-submit-button"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
