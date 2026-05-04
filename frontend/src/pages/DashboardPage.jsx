function DashboardPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-14 lg:px-10" data-testid="dashboard-page">
      <p className="font-bold uppercase tracking-[0.25em] text-yellow-300">Protected area</p>
      <h1 className="mt-3 text-5xl font-black">Dashboard</h1>
      <p className="mt-4 max-w-3xl text-lg text-white/70">
        In Iteration 2, this page will become protected and show the logged-in user details.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-[2rem] bg-white/10 p-6">
          <p className="text-sm font-bold text-white/60">WonderPoints</p>
          <p className="mt-2 text-4xl font-black">0</p>
        </div>
        <div className="rounded-[2rem] bg-white/10 p-6">
          <p className="text-sm font-bold text-white/60">Ride bookings</p>
          <p className="mt-2 text-4xl font-black">Soon</p>
        </div>
        <div className="rounded-[2rem] bg-white/10 p-6">
          <p className="text-sm font-bold text-white/60">Stays</p>
          <p className="mt-2 text-4xl font-black">Soon</p>
        </div>
      </div>
    </main>
  );
}

export default DashboardPage;
