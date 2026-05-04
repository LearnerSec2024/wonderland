function RegisterPage() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-7xl place-items-center px-6 py-14 lg:px-10" data-testid="register-page">
      <section className="w-full max-w-xl rounded-[2rem] bg-white p-8 text-slate-950 shadow-2xl">
        <p className="font-bold uppercase tracking-[0.25em] text-cyan-600">Join Wonderland</p>
        <h1 className="mt-3 text-4xl font-black">Create account</h1>
        <p className="mt-3 text-slate-600">
          In Iteration 2, this form will connect to the backend registration API.
        </p>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" data-testid="register-form">
          <div>
            <label className="text-sm font-bold" htmlFor="register-first-name">First name</label>
            <input
              id="register-first-name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Alex"
              data-testid="register-first-name-input"
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="register-last-name">Last name</label>
            <input
              id="register-last-name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Wonder"
              data-testid="register-last-name-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-bold" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="alex@wonderland.local"
              data-testid="register-email-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-bold" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500"
              placeholder="Password123!"
              data-testid="register-password-input"
            />
          </div>

          <button
            type="button"
            className="sm:col-span-2 rounded-2xl bg-cyan-500 px-5 py-3 font-black text-slate-950 transition hover:bg-cyan-400"
            data-testid="register-submit-button"
          >
            Register
          </button>
        </form>
      </section>
    </main>
  );
}

export default RegisterPage;
